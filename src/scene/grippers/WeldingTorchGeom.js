/**
 * WeldingTorchGeom.js
 *
 * Builds procedural Three.js geometry for a welding torch.
 * Body cylinder + tapered nozzle cylinder.
 *
 * Geometry extends along local +Z (URDF convention).
 */

import * as THREE from 'three';

/**
 * @param {object} dimensions - { bodyRadius, bodyLength, nozzleRadius, nozzleLength }
 * @param {string} color      - Hex colour for the body
 * @param {number} opacity    - 0–1
 * @returns {THREE.Group}
 */
export function build(dimensions, color, opacity) {
  const group = new THREE.Group();
  const { bodyRadius, bodyLength, nozzleRadius, nozzleLength } = dimensions;

  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.3,
    metalness: 0.6,
    transparent: opacity < 1,
    opacity,
  });
  const nozzleMat = new THREE.MeshStandardMaterial({
    color: '#cc6600',
    roughness: 0.4,
    metalness: 0.5,
    transparent: opacity < 1,
    opacity,
  });

  // Body cylinder along Z
  const bodyGeom = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyLength, 16);
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.rotation.x = Math.PI / 2;
  body.position.z = bodyLength / 2;
  group.add(body);

  // Tapered nozzle
  const nozzleGeom = new THREE.CylinderGeometry(nozzleRadius * 0.6, nozzleRadius, nozzleLength, 12);
  const nozzle = new THREE.Mesh(nozzleGeom, nozzleMat);
  nozzle.rotation.x = Math.PI / 2;
  nozzle.position.z = bodyLength + nozzleLength / 2;
  group.add(nozzle);

  return group;
}
