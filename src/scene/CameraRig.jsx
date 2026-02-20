/**
 * CameraRig.jsx
 *
 * Wraps OrbitControls and handles:
 *   1. Instant camera reset (triggered by cameraResetCount in store)
 *   2. Smooth focus animation (triggered by focusTarget in store)
 *   3. Disabling orbit when interactionMode !== 'orbit'
 *   4. Orthographic 2D layout view (triggered by isOrthographic in store)
 *
 * Camera controls (when interactionMode === 'orbit'):
 *   Left-click drag  → orbit / rotate (perspective only)
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
  const { camera, set, size } = useThree();

  const cameraResetCount = useSceneStore((s) => s.cameraResetCount);
  const focusTarget = useSceneStore((s) => s.focusTarget);
  const setFocusTarget = useSceneStore((s) => s.setFocusTarget);
  const interactionMode = useSceneStore((s) => s.interactionMode);
  const overheadViewCount = useSceneStore((s) => s.overheadViewCount);
  const isOrthographic = useSceneStore((s) => s.isOrthographic);
  const setOrthoViewInfo = useSceneStore((s) => s.setOrthoViewInfo);

  // Save perspective camera ref on mount
  const perspCameraRef = useRef(null);
  const orthoCameraRef = useRef(null);
  const lastOrthoZoom = useRef(1);

  // Create ortho camera once
  useEffect(() => {
    perspCameraRef.current = camera;
    const halfW = 30;
    const aspect = size.width / size.height;
    const ortho = new THREE.OrthographicCamera(
      -halfW * aspect, halfW * aspect,
      halfW, -halfW,
      0.1, 500
    );
    ortho.zoom = 1;
    orthoCameraRef.current = ortho;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

    // If in ortho, switch back to perspective first
    if (useSceneStore.getState().isOrthographic) {
      useSceneStore.getState().toggleOrthographic();
    }

    const persp = perspCameraRef.current;
    if (persp) {
      persp.position.copy(DEFAULT_POSITION);
      set({ camera: persp });
    }
    if (controlsRef.current) {
      controlsRef.current.target.copy(DEFAULT_TARGET);
      controlsRef.current.update();
    }
  }, [cameraResetCount, set]);

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

  // ─── Orthographic camera swap ───────────────────────────────────────────
  useEffect(() => {
    const ortho = orthoCameraRef.current;
    const persp = perspCameraRef.current;
    if (!ortho || !persp) return;

    if (isOrthographic) {
      // Compute bounding box of all scene content
      const { deployedRobots, sceneObjects } = useSceneStore.getState();
      const allPositions = [
        ...deployedRobots.map((r) => r.position),
        ...sceneObjects.map((o) => o.position),
      ];

      let centerX = 0, centerZ = 0;
      let halfExtent = 20;

      if (allPositions.length > 0) {
        const xs = allPositions.map((p) => p[0]);
        const zs = allPositions.map((p) => p[1]);
        const minX = Math.min(...xs);
        const maxX = Math.max(...xs);
        const minZ = Math.min(...zs);
        const maxZ = Math.max(...zs);

        centerX = (minX + maxX) / 2;
        centerZ = (minZ + maxZ) / 2;

        const extentX = maxX - minX + 8;
        const extentZ = maxZ - minZ + 8;
        halfExtent = Math.max(extentX, extentZ, 10) / 2;
      }

      // Set frustum based on content extent and viewport aspect
      const aspect = size.width / size.height;
      ortho.left = -halfExtent * aspect;
      ortho.right = halfExtent * aspect;
      ortho.top = halfExtent;
      ortho.bottom = -halfExtent;
      ortho.zoom = 1;
      ortho.position.set(centerX, 100, centerZ);
      ortho.lookAt(centerX, 0, centerZ);
      ortho.updateProjectionMatrix();

      lastOrthoZoom.current = 1;
      set({ camera: ortho });

      if (controlsRef.current) {
        controlsRef.current.target.set(centerX, 0, centerZ);
        controlsRef.current.update();
      }

      // Publish initial view info for scale indicator
      const frustumWidth = (ortho.right - ortho.left) / ortho.zoom;
      setOrthoViewInfo({ zoom: ortho.zoom, frustumWidth, viewportWidth: size.width });
    } else {
      // Restore perspective
      set({ camera: persp });
      if (controlsRef.current) {
        controlsRef.current.update();
      }
      setOrthoViewInfo(null);
    }
  }, [isOrthographic, set, size.width, size.height, setOrthoViewInfo]);

  // Update ortho frustum on viewport resize
  useEffect(() => {
    if (!isOrthographic) return;
    const ortho = orthoCameraRef.current;
    if (!ortho) return;
    const aspect = size.width / size.height;
    // Keep the vertical extent, adjust horizontal for new aspect
    const halfV = ortho.top; // current vertical half-extent
    ortho.left = -halfV * aspect;
    ortho.right = halfV * aspect;
    ortho.updateProjectionMatrix();
  }, [size.width, size.height, isOrthographic]);

  // When focusTarget changes, set up the lerp destination
  useEffect(() => {
    if (!focusTarget) return;
    const [tx, ty, tz] = focusTarget;
    targetLookAt.current.set(tx, ty, tz);
    // Position camera offset from the target so it gets a good view
    targetCamPos.current.set(tx + FOCUS_DISTANCE, FOCUS_DISTANCE * 0.8, tz + FOCUS_DISTANCE);
    isLerping.current = true;
  }, [focusTarget]);

  // Smooth lerp animation toward focus target + ortho zoom change detection
  useFrame(() => {
    // Publish zoom changes in ortho mode for scale indicator
    if (isOrthographic && orthoCameraRef.current) {
      const ortho = orthoCameraRef.current;
      if (ortho.zoom !== lastOrthoZoom.current) {
        lastOrthoZoom.current = ortho.zoom;
        const frustumWidth = (ortho.right - ortho.left) / ortho.zoom;
        setOrthoViewInfo({ zoom: ortho.zoom, frustumWidth, viewportWidth: size.width });
      }
    }

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
      enableRotate={!isOrthographic}
      minDistance={isOrthographic ? 0 : 2}
      maxDistance={400}
      maxPolarAngle={isOrthographic ? 0 : Math.PI / 2 - 0.02}
      minPolarAngle={isOrthographic ? 0 : 0}
    />
  );
}
