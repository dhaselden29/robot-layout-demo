/**
 * SphereShape.jsx
 *
 * Renders a sphere resting on local y = 0 (bottom tangent point at y = 0).
 */

export default function SphereShape({ radius = 0.5, color = '#7a8a9a', opacity = 1 }) {
  return (
    <mesh position={[0, radius, 0]} castShadow receiveShadow>
      <sphereGeometry args={[radius, 32, 16]} />
      <meshStandardMaterial color={color} roughness={0.5} metalness={0.1} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
}
