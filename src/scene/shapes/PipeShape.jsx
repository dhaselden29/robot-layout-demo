/**
 * PipeShape.jsx
 *
 * Renders a horizontal pipe running along the local X axis.
 * The pipe centreline sits at y = outerDiam / 2 so the bottom
 * tangent rests at local y = 0.
 *
 * wallThick is noted in config for future hollow rendering;
 * this iteration renders a solid cylinder.
 */

export default function PipeShape({
  length = 3,
  outerDiam = 0.1143,
  wallThick = 0.006, // eslint-disable-line no-unused-vars
  color = '#808080',
  opacity = 1,
}) {
  const r = outerDiam / 2;
  return (
    <mesh rotation={[0, 0, -Math.PI / 2]} position={[0, r, 0]} castShadow receiveShadow>
      <cylinderGeometry args={[r, r, length, 16]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
}
