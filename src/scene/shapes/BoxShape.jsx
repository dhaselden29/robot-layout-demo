/**
 * BoxShape.jsx
 *
 * Renders a box with its bottom face at local y = 0.
 * length → Three.js X axis, height → Three.js Y axis, width → Three.js Z axis.
 */

export default function BoxShape({ length = 1, width = 1, height = 1, color = '#7a8a9a', opacity = 1 }) {
  return (
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
      <boxGeometry args={[length, height, width]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
}
