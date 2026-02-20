/**
 * VacuumGripperGeom.js
 *
 * Builds procedural Three.js geometry for vacuum grippers.
 * Single-cup and quad-cup variants based on dimensions.cupSpacing.
 *
 * Geometry extends along local +Z (URDF convention: Z is the tool axis).
 * URDFRobot's coordinate correction handles the Z-up → Y-up mapping.
 */

import * as THREE from 'three';

/**
 * @param {object} dimensions - { bodyRadius, bodyLength, cupRadius, cupSpacing? }
 * @param {string} color      - Hex colour for the body
 * @param {number} opacity    - 0–1
 * @returns {THREE.Group}
 */
export function build(dimensions, color, opacity) {
  const group = new THREE.Group();
  const { bodyRadius, bodyLength, cupRadius, cupSpacing } = dimensions;

  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.4,
    metalness: 0.5,
    transparent: opacity < 1,
    opacity,
  });
  const cupMat = new THREE.MeshStandardMaterial({
    color: '#222222',
    roughness: 0.8,
    metalness: 0.1,
    transparent: opacity < 1,
    opacity,
  });

  // Body cylinder along Z
  const bodyGeom = new THREE.CylinderGeometry(bodyRadius, bodyRadius, bodyLength, 16);
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.rotation.x = Math.PI / 2; // cylinder default is Y-axis; rotate to Z
  body.position.z = bodyLength / 2;
  group.add(body);

  if (cupSpacing) {
    // Quad cups in a square pattern
    const offsets = [
      [-cupSpacing / 2, -cupSpacing / 2],
      [cupSpacing / 2, -cupSpacing / 2],
      [-cupSpacing / 2, cupSpacing / 2],
      [cupSpacing / 2, cupSpacing / 2],
    ];
    for (const [ox, oy] of offsets) {
      const cupGeom = new THREE.CylinderGeometry(cupRadius, cupRadius * 1.3, 0.01, 12);
      const cup = new THREE.Mesh(cupGeom, cupMat);
      cup.rotation.x = Math.PI / 2;
      cup.position.set(ox, oy, bodyLength + 0.005);
      group.add(cup);
    }
  } else {
    // Single cup
    const cupGeom = new THREE.CylinderGeometry(cupRadius, cupRadius * 1.3, 0.015, 16);
    const cup = new THREE.Mesh(cupGeom, cupMat);
    cup.rotation.x = Math.PI / 2;
    cup.position.z = bodyLength + 0.0075;
    group.add(cup);
  }

  return group;
}
