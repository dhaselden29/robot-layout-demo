/**
 * CableTrayShape.jsx
 *
 * Renders a cable tray U-channel running along the local X axis.
 * Bottom of channel at local y = 0.
 *
 * Three box meshes:
 *   - Bottom plate
 *   - Left side wall
 *   - Right side wall
 */

export default function CableTrayShape({
  length = 3,
  width = 0.15,
  height = 0.05,
  wallThick = 0.003,
  color = '#c0c0c0',
  opacity = 1,
}) {
  const innerWidth = width - 2 * wallThick;
  const mat = { color, roughness: 0.3, metalness: 0.5, transparent: opacity < 1, opacity };

  return (
    <group>
      {/* Bottom plate */}
      <mesh position={[0, wallThick / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, wallThick, width]} />
        <meshStandardMaterial {...mat} />
      </mesh>

      {/* Left side wall */}
      <mesh position={[0, height / 2, -(innerWidth / 2 + wallThick / 2)]} castShadow receiveShadow>
        <boxGeometry args={[length, height, wallThick]} />
        <meshStandardMaterial {...mat} />
      </mesh>

      {/* Right side wall */}
      <mesh position={[0, height / 2, innerWidth / 2 + wallThick / 2]} castShadow receiveShadow>
        <boxGeometry args={[length, height, wallThick]} />
        <meshStandardMaterial {...mat} />
      </mesh>
    </group>
  );
}
