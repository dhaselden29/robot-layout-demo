/**
 * CylinderShape.jsx
 *
 * Renders a cylinder with its bottom face at local y = 0.
 */

export default function CylinderShape({ radius = 0.5, height = 1, color = '#7a8a9a', opacity = 1 }) {
  return (
    <mesh position={[0, height / 2, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[radius, radius, height, 32]} />
      <meshStandardMaterial color={color} roughness={0.6} metalness={0.2} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
}
