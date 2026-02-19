/**
 * CameraRig.jsx
 *
 * Wraps OrbitControls and handles:
 *   1. Instant camera reset (triggered by cameraResetCount in store)
 *   2. Smooth focus animation (triggered by focusTarget in store)
 *   3. Disabling orbit when interactionMode === 'place'
 *
 * Camera controls (when interactionMode === 'orbit'):
 *   Left-click drag  → orbit / rotate
 *   Scroll wheel     → zoom in / out
 *   Right-click drag → pan
 */

import { OrbitControls } from '@react-three/drei';
import { useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import config from '../config/config.json';
import useSceneStore from '../store/sceneStore';

const DEFAULT_POSITION = new THREE.Vector3(...config.camera.defaultPosition);
const DEFAULT_TARGET = new THREE.Vector3(...config.camera.defaultTarget);
const FOCUS_DISTANCE = config.camera.focusDistance ?? 5;
const LERP_SPEED = 0.07;

export default function CameraRig() {
  const controlsRef = useRef();
  const { camera } = useThree();

  const cameraResetCount = useSceneStore((s) => s.cameraResetCount);
  const focusTarget = useSceneStore((s) => s.focusTarget);
  const setFocusTarget = useSceneStore((s) => s.setFocusTarget);
  const interactionMode = useSceneStore((s) => s.interactionMode);
  const overheadViewCount = useSceneStore((s) => s.overheadViewCount);

  // Lerp destinations — updated when focusTarget changes
  const targetCamPos = useRef(new THREE.Vector3());
  const targetLookAt = useRef(new THREE.Vector3());
  const isLerping = useRef(false);

  // On first mount, position the camera at the config default
  useEffect(() => {
    camera.position.copy(DEFAULT_POSITION);
    camera.lookAt(DEFAULT_TARGET);
  }, [camera]);

  // Instant camera reset
  useEffect(() => {
    if (cameraResetCount === 0) return;
    isLerping.current = false;
    camera.position.copy(DEFAULT_POSITION);
    if (controlsRef.current) {
      controlsRef.current.target.copy(DEFAULT_TARGET);
      controlsRef.current.update();
    }
  }, [cameraResetCount, camera]);

  // Overhead view — snap camera directly above all scene content
  useEffect(() => {
    if (overheadViewCount === 0) return;

    const { deployedRobots, sceneObjects } = useSceneStore.getState();
    const allPositions = [
      ...deployedRobots.map((r) => r.position),
      ...sceneObjects.map((o) => o.position),
    ];

    let centerX = 0, centerZ = 0, height = 30;

    if (allPositions.length > 0) {
      // spec position[0]=X, position[1]=Y → Three.js X and Z respectively
      const xs = allPositions.map((p) => p[0]);
      const zs = allPositions.map((p) => p[1]);
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minZ = Math.min(...zs);
      const maxZ = Math.max(...zs);

      centerX = (minX + maxX) / 2;
      centerZ = (minZ + maxZ) / 2;

      const extentX = maxX - minX + 8; // padding on each side
      const extentZ = maxZ - minZ + 8;
      const maxExtent = Math.max(extentX, extentZ, 10);

      // Height required so the scene fits the camera FOV (plus 20% margin)
      const fovRad = (config.camera.fov * Math.PI) / 180;
      height = ((maxExtent / 2) / Math.tan(fovRad / 2)) * 1.2;
    }

    isLerping.current = false;
    camera.position.set(centerX, height, centerZ);

    if (controlsRef.current) {
      controlsRef.current.target.set(centerX, 0, centerZ);
      controlsRef.current.update();
    }
  }, [overheadViewCount, camera]);

  // When focusTarget changes, set up the lerp destination
  useEffect(() => {
    if (!focusTarget) return;
    const [tx, ty, tz] = focusTarget;
    targetLookAt.current.set(tx, ty, tz);
    // Position camera offset from the target so it gets a good view
    targetCamPos.current.set(tx + FOCUS_DISTANCE, FOCUS_DISTANCE * 0.8, tz + FOCUS_DISTANCE);
    isLerping.current = true;
  }, [focusTarget]);

  // Smooth lerp animation toward focus target
  useFrame(() => {
    if (!isLerping.current) return;

    camera.position.lerp(targetCamPos.current, LERP_SPEED);

    if (controlsRef.current) {
      controlsRef.current.target.lerp(targetLookAt.current, LERP_SPEED);
      controlsRef.current.update();
    }

    // Stop lerping once close enough
    if (camera.position.distanceTo(targetCamPos.current) < 0.05) {
      camera.position.copy(targetCamPos.current);
      if (controlsRef.current) {
        controlsRef.current.target.copy(targetLookAt.current);
        controlsRef.current.update();
      }
      isLerping.current = false;
      setFocusTarget(null);
    }
  });

  return (
    <OrbitControls
      ref={controlsRef}
      makeDefault
      enabled={interactionMode === 'orbit'}
      enablePan
      enableZoom
      enableRotate
      minDistance={2}
      maxDistance={400}
      maxPolarAngle={Math.PI / 2 - 0.02}
    />
  );
}
