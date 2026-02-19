/**
 * SceneSetup.jsx
 *
 * Sets up the global lighting and atmospheric environment for the 3D scene.
 * All light intensities and fog parameters are read from config.json so they
 * can be tuned without touching this file.
 *
 * Renders:
 *   - AmbientLight: fills shadows with soft overall illumination
 *   - DirectionalLight: simulates overhead factory lighting, casts shadows
 *   - Fog: creates depth perception for large floor areas
 */

import { useThree } from '@react-three/fiber';
import { useEffect } from 'react';
import * as THREE from 'three';
import config from '../config/config.json';

export default function SceneSetup() {
  const { scene } = useThree();

  // Apply fog and background colour directly to the Three.js scene object
  useEffect(() => {
    scene.background = new THREE.Color(config.scene.backgroundColor);
    scene.fog = new THREE.Fog(
      config.scene.fogColor,
      config.scene.fogNear,
      config.scene.fogFar
    );
  }, [scene]);

  return (
    <>
      {/* Soft fill light — prevents completely black shadows */}
      <ambientLight intensity={config.scene.ambientLightIntensity} />

      {/* Main overhead directional light — simulates industrial ceiling fixtures */}
      <directionalLight
        intensity={config.scene.directionalLightIntensity}
        position={config.scene.directionalLightPosition}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={200}
        shadow-camera-left={-40}
        shadow-camera-right={40}
        shadow-camera-top={40}
        shadow-camera-bottom={-40}
      />

      {/* Secondary fill light from opposite side to reduce harsh shadows */}
      <directionalLight
        intensity={0.3}
        position={[-10, 10, -10]}
      />
    </>
  );
}
