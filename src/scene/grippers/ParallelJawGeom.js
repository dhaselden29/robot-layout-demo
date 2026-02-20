/**
 * ParallelJawGeom.js
 *
 * Builds procedural Three.js geometry for a parallel jaw gripper.
 * Box body + two finger pads.
 *
 * Geometry extends along local +Z (URDF convention).
 */

import * as THREE from 'three';

/**
 * @param {object} dimensions - { bodyWidth, bodyDepth, bodyLength, fingerWidth, fingerLength, fingerGap }
 * @param {string} color      - Hex colour for the body
 * @param {number} opacity    - 0–1
 * @returns {THREE.Group}
 */
export function build(dimensions, color, opacity) {
  const group = new THREE.Group();
  const { bodyWidth, bodyDepth, bodyLength, fingerWidth, fingerLength, fingerGap } = dimensions;

  const bodyMat = new THREE.MeshStandardMaterial({
    color,
    roughness: 0.4,
    metalness: 0.5,
    transparent: opacity < 1,
    opacity,
  });
  const fingerMat = new THREE.MeshStandardMaterial({
    color: '#333333',
    roughness: 0.6,
    metalness: 0.3,
    transparent: opacity < 1,
    opacity,
  });

  // Body box
  const bodyGeom = new THREE.BoxGeometry(bodyWidth, bodyDepth, bodyLength);
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.z = bodyLength / 2;
  group.add(body);

  // Left finger
  const fingerGeom = new THREE.BoxGeometry(fingerWidth, bodyDepth * 0.6, fingerLength);
  const leftFinger = new THREE.Mesh(fingerGeom, fingerMat);
  leftFinger.position.set(-fingerGap / 2, 0, bodyLength + fingerLength / 2);
  group.add(leftFinger);

  // Right finger
  const rightFinger = new THREE.Mesh(fingerGeom.clone(), fingerMat);
  rightFinger.position.set(fingerGap / 2, 0, bodyLength + fingerLength / 2);
  group.add(rightFinger);

  return group;
}
