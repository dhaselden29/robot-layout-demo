/**
 * URDFRobot.jsx
 *
 * Loads and displays a real robot model from a URDF file using urdf-loader.
 *
 * How it works:
 *   1. URDFLoader fetches the URDF XML from /models/[urdf path]
 *   2. For each <mesh> in the URDF it calls our loadMeshCb
 *   3. loadMeshCb resolves the package:// URI via packageMap and loads
 *      the STL file with Three.js STLLoader, returning a bare THREE.Mesh
 *   4. urdf-loader applies the URDF-specified material colour to each Mesh
 *      (FANUC yellow, ABB orange, UR light-grey, etc.)
 *   5. The assembled URDFRobot object is rendered via <primitive>
 *
 * Key rules for loadMeshCb:
 *   - done(mesh)       on success — must be a THREE.Mesh (not Group) so urdf-loader
 *                      can apply the URDF material colour to it
 *   - done(null, err)  on error   — loader logs the error and skips that link
 *
 * Falls back to PlaceholderRobot if the URDF file is missing or on any error.
 * Shows PlaceholderRobot while loading so the scene is never empty.
 *
 * @param {string}  props.urdf          Path to URDF relative to /models/
 * @param {Object}  props.packageMap    Maps ROS package names to /models/ subdirs
 * @param {string}  props.manufacturer  Used by placeholder fallback for colour
 * @param {number}  props.approxHeight  Used by placeholder fallback for sizing
 * @param {string}  props.mountType     "floor"|"platform" → upright; "ceiling" → inverted
 */

import URDFLoader from 'urdf-loader';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import * as THREE from 'three';
import { useEffect, useState } from 'react';
import PlaceholderRobot from './PlaceholderRobot';
import useSceneStore from '../store/sceneStore';

// Stable empty object so the Zustand selector doesn't return a new reference
// on every call when no joint angles are set yet (which would cause an
// infinite re-render loop via Object.is change detection).
const EMPTY_JOINT_ANGLES = {};

export default function URDFRobot({ urdf, packageMap, manufacturer, approxHeight, mountType = 'floor', colorOverride = null, opacity = 1, robotId, onRobotLoaded }) {
  const [robotObject, setRobotObject] = useState(null);
  const [failed, setFailed] = useState(false);

  // Subscribe to this robot's joint angles — effect applies them to the model.
  // EMPTY_JOINT_ANGLES is a stable module-level reference; using ?? {} inline
  // would create a new object on every selector call, causing infinite re-renders.
  const jointAngles = useSceneStore((s) => s.robotJointAngles[robotId] ?? EMPTY_JOINT_ANGLES);

  useEffect(() => {
    // No URDF path provided — stay on placeholder
    if (!urdf || !packageMap) {
      setFailed(true);
      return;
    }

    let cancelled = false;
    const loader = new URDFLoader();

    // Resolve package:// URIs:
    //   package://fanuc_lrmate200id/meshes/... → {base}/models/fanuc/meshes/...
    const base = import.meta.env.BASE_URL;
    loader.packages = Object.fromEntries(
      Object.entries(packageMap).map(([pkg, subdir]) => [pkg, `${base}models/${subdir}`])
    );

    // Custom mesh loader — handles .stl files.
    // IMPORTANT: call done(mesh) with a bare THREE.Mesh (not wrapped in a Group)
    // so urdf-loader can apply the URDF material colour (FANUC yellow, etc.).
    loader.loadMeshCb = (path, manager, done) => {
      if (!/\.stl$/i.test(path)) {
        // Unsupported format — skip this link silently
        console.warn(`URDFRobot: skipping unsupported mesh format: ${path}`);
        done(null, new Error('unsupported format'));
        return;
      }

      const stlLoader = new STLLoader(manager);
      stlLoader.load(
        path,
        (geometry) => {
          if (cancelled) return;
          geometry.computeVertexNormals();
          // Return a bare Mesh — urdf-loader will set obj.material from the URDF
          const mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial());
          mesh.castShadow = true;
          done(mesh);
        },
        undefined,
        (err) => {
          console.warn(`URDFRobot: failed to load mesh ${path}`, err);
          done(null, err);
        }
      );
    };

    loader.load(
      `${base}models/${urdf}`,
      (robot) => {
        if (cancelled) return;
        // robot is a URDFRobot (extends THREE.Object3D)
        // Extract non-fixed joint metadata and publish to store for the Joints panel
        if (robotId) {
          const meta = Object.values(robot.joints)
            .filter((j) => j.jointType !== 'fixed')
            .map((j) => ({
              name: j.name,
              type: j.jointType,
              lower: j.limit?.lower ?? -Math.PI,
              upper: j.limit?.upper ?? Math.PI,
            }));
          useSceneStore.getState().setRobotJointMeta(robotId, meta);
        }
        setRobotObject(robot);
        if (onRobotLoaded) onRobotLoaded(robot);
      },
      undefined,
      (err) => {
        if (!cancelled) {
          console.warn(`URDFRobot: failed to load URDF ${urdf}`, err);
          setFailed(true);
        }
      }
    );

    return () => {
      cancelled = true;
    };
  }, [urdf, manufacturer]);

  // Apply colour override and opacity to all meshes whenever they change or the model loads.
  // originalColor is stored in userData so we can restore it when colorOverride is cleared.
  useEffect(() => {
    if (!robotObject) return;
    robotObject.traverse((obj) => {
      if (!obj.isMesh || !obj.material) return;
      if (colorOverride !== null) {
        if (obj.userData.origColor === undefined) {
          obj.userData.origColor = obj.material.color.getHex();
        }
        obj.material.color.set(colorOverride);
      } else if (obj.userData.origColor !== undefined) {
        obj.material.color.setHex(obj.userData.origColor);
      }
      obj.material.transparent = opacity < 1;
      obj.material.opacity = opacity;
      obj.material.needsUpdate = true;
    });
  }, [robotObject, colorOverride, opacity]);

  // Apply joint angles whenever they change or the model first loads.
  // jointAngles is a { [jointName]: radians } map from the store.
  useEffect(() => {
    if (!robotObject) return;
    Object.entries(jointAngles).forEach(([name, angle]) => {
      robotObject.setJointValue(name, angle);
    });
  }, [robotObject, jointAngles]);

  // URDF unavailable or load failed — render placeholder
  if (failed) {
    return <PlaceholderRobot manufacturer={manufacturer} approxHeight={approxHeight} colorOverride={colorOverride} opacity={opacity} />;
  }

  // Still loading — show placeholder so the scene isn't empty
  if (!robotObject) {
    return <PlaceholderRobot manufacturer={manufacturer} approxHeight={approxHeight} colorOverride={colorOverride} opacity={opacity} />;
  }

  // Wrap in a coordinate-system correction group.
  // URDF/ROS uses Z-up; Three.js uses Y-up.
  // Floor/Platform: -π/2 around X maps URDF +Z → Three.js +Y (robot stands upright).
  // Ceiling:        +π/2 around X maps URDF +Z → Three.js -Y (robot hangs down).
  return (
    <group rotation={mountType === 'ceiling' ? [Math.PI / 2, 0, 0] : [-Math.PI / 2, 0, 0]}>
      <primitive object={robotObject} />
    </group>
  );
}
