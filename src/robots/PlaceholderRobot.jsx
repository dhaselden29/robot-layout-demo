/**
 * PlaceholderRobot.jsx
 *
 * Renders a stylised procedural robot shape built from primitive Three.js
 * geometry (boxes and cylinders). Used when a real GLB model file is not
 * yet available for a given robot.
 *
 * The placeholder is colour-coded by manufacturer so robots are visually
 * distinguishable at a glance during R&D reviews.
 *
 * The overall proportions scale with `approxHeight` from config so placeholders
 * are roughly the right size relative to each other.
 *
 * @param {Object}  props
 * @param {string}  props.manufacturer  - Used to pick the colour
 * @param {number}  props.approxHeight  - Controls overall scale of the shape
 */

import * as THREE from 'three';

// Colour palette — one distinct colour per manufacturer
const MANUFACTURER_COLORS = {
  'Universal Robots': '#1565c0',  // UR blue
  'FANUC':            '#f9a825',  // FANUC yellow
  'ABB':              '#c62828',  // ABB red
  'KUKA':             '#e65100',  // KUKA orange
  'Yaskawa':          '#2e7d32',  // Motoman green
};
const FALLBACK_COLOR = '#546e7a';

export default function PlaceholderRobot({ manufacturer, approxHeight = 1.2, colorOverride = null, opacity = 1 }) {
  const defaultColor = MANUFACTURER_COLORS[manufacturer] ?? FALLBACK_COLOR;
  const color = colorOverride ?? defaultColor;
  const h = approxHeight;
  const transparent = opacity < 1;

  // Shared materials
  const bodyMat = <meshStandardMaterial color={color} roughness={0.4} metalness={0.6} transparent={transparent} opacity={opacity} />;
  const jointMat = <meshStandardMaterial color="#37474f" roughness={0.3} metalness={0.8} transparent={transparent} opacity={opacity} />;

  return (
    <group>
      {/* Base / mounting plate */}
      <mesh position={[0, h * 0.06, 0]} castShadow>
        <boxGeometry args={[h * 0.38, h * 0.12, h * 0.38]} />
        {jointMat}
      </mesh>

      {/* Lower arm segment */}
      <mesh position={[0, h * 0.28, 0]} castShadow>
        <cylinderGeometry args={[h * 0.1, h * 0.12, h * 0.35, 12]} />
        {bodyMat}
      </mesh>

      {/* Elbow joint */}
      <mesh position={[h * 0.1, h * 0.5, 0]} castShadow>
        <sphereGeometry args={[h * 0.1, 12, 8]} />
        {jointMat}
      </mesh>

      {/* Upper arm segment */}
      <mesh
        position={[h * 0.18, h * 0.68, 0]}
        rotation={[0, 0, -Math.PI / 6]}
        castShadow
      >
        <cylinderGeometry args={[h * 0.07, h * 0.09, h * 0.38, 12]} />
        {bodyMat}
      </mesh>

      {/* Wrist joint */}
      <mesh position={[h * 0.22, h * 0.88, 0]} castShadow>
        <sphereGeometry args={[h * 0.07, 12, 8]} />
        {jointMat}
      </mesh>

      {/* End effector / tool flange */}
      <mesh position={[h * 0.22, h * 0.98, 0]} castShadow>
        <cylinderGeometry args={[h * 0.05, h * 0.07, h * 0.1, 8]} />
        {bodyMat}
      </mesh>
    </group>
  );
}
