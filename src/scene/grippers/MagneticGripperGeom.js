/**
 * MagneticGripperGeom.js
 *
 * Builds procedural Three.js geometry for a magnetic disc gripper.
 * Housing cylinder + wide flat disc face.
 *
 * Geometry extends along local +Z (URDF convention).
 */

import * as THREE from 'three';

/**
 * @param {object} dimensions - { housingRadius, housingLength, discRadius, discThickness }
 * @param {string} color      - Hex colour for the housing
 * @param {number} opacity    - 0–1
 * @returns {THREE.Group}
 */
export function build(dimensions, color, opacity) {
  const group = new THREE.Group();
  const { housingRadius, housingLength, discRadius, discThickness } = dimensions;

  const housingMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.3,
    metalness: 0.6,
    transparent: opacity < 1,
    opacity,
  });
  const discMat = new THREE.MeshStandardMaterial({
    color: '#888888',
    roughness: 0.2,
    metalness: 0.8,
    transparent: opacity < 1,
    opacity,
  });

  // Housing cylinder along Z
  const housingGeom = new THREE.CylinderGeometry(housingRadius, housingRadius, housingLength, 16);
  const housing = new THREE.Mesh(housingGeom, housingMat);
  housing.rotation.x = Math.PI / 2;
  housing.position.z = housingLength / 2;
  group.add(housing);

  // Disc face
  const discGeom = new THREE.CylinderGeometry(discRadius, discRadius, discThickness, 24);
  const disc = new THREE.Mesh(discGeom, discMat);
  disc.rotation.x = Math.PI / 2;
  disc.position.z = housingLength + discThickness / 2;
  group.add(disc);

  return group;
}
