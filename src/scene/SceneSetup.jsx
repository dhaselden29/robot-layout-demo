/**
 * SceneSetup.jsx
 *
 * Sets up the global lighting and atmospheric environment for the 3D scene.
 * Light intensities and fog/background are read from the Zustand sceneSettings
 * so the user can tune them at runtime via the GENERAL tab.
 *
 * Renders:
 *   - AmbientLight: fills shadows with soft overall illumination
 *   - DirectionalLight: simulates overhead factory lighting, casts shadows
 *   - DirectionalLight (fill): secondary light from opposite side
 *   - Fog: creates depth perception for large floor areas
 */

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import config from '../config/config.json';
import useSceneStore from '../store/sceneStore';

export default function SceneSetup() {
  const { scene } = useThree();

  const backgroundColor = useSceneStore((s) => s.sceneSettings.backgroundColor);
  const fogEnabled = useSceneStore((s) => s.sceneSettings.fogEnabled);
  const ambientIntensity = useSceneStore((s) => s.sceneSettings.ambientIntensity);
  const directionalIntensity = useSceneStore((s) => s.sceneSettings.directionalIntensity);
  const shadowsEnabled = useSceneStore((s) => s.sceneSettings.shadowsEnabled);
  const isOrthographic = useSceneStore((s) => s.isOrthographic);

  // Apply background colour
  useEffect(() => {
    scene.background = new THREE.Color(backgroundColor);
  }, [scene, backgroundColor]);

  // Apply or remove fog — disabled in orthographic 2D view
  useEffect(() => {
    if (fogEnabled && !isOrthographic) {
      scene.fog = new THREE.Fog(
        config.scene.fogColor,
        config.scene.fogNear,
        config.scene.fogFar
      );
    } else {
      scene.fog = null;
    }
  }, [scene, fogEnabled, isOrthographic]);

  return (
    <>
      {/* Soft fill light — prevents completely black shadows */}
      <ambientLight intensity={ambientIntensity} />

      {/* Main overhead directional light — simulates industrial ceiling fixtures */}
      <directionalLight
        intensity={directionalIntensity}
        position={config.scene.directionalLightPosition}
        castShadow={shadowsEnabled && !isOrthographic}
        shadow-mapSize={[1024, 1024]}
        shadow-bias={-0.001}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      {/* Secondary fill light from opposite side to reduce harsh shadows */}
      <directionalLight
        intensity={0.5}
        position={[-10, 10, -10]}
      />
    </>
  );
}
