/**
 * TurntableShape.jsx
 *
 * Renders a rotary turntable / positioner with cylindrical base,
 * pedestal motor section, rotating plate, and crosshair alignment marks.
 * Bottom at y = 0.
 */

export default function TurntableShape({
  radius = 0.6,
  height = 0.12,
  color = '#5a7a8c',
  opacity = 1,
}) {
  const transparent = opacity < 1;

  // Proportions
  const baseH = height * 0.35;
  const baseR = radius * 0.8;
  const pedestalH = height * 0.45;
  const pedestalR = radius * 0.35;
  const plateH = height * 0.20;
  const plateR = radius;

  const baseMat = { color: '#404040', roughness: 0.3, metalness: 0.6, transparent, opacity };
  const pedestalMat = { color: '#505050', roughness: 0.3, metalness: 0.5, transparent, opacity };
  const plateMat = { color, roughness: 0.3, metalness: 0.4, transparent, opacity };
  const markMat = { color: '#303030', roughness: 0.5, metalness: 0.3, transparent, opacity };

  return (
    <group>
      {/* Base */}
      <mesh position={[0, baseH / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[baseR, baseR, baseH, 24]} />
        <meshStandardMaterial {...baseMat} />
      </mesh>

      {/* Pedestal / motor housing */}
      <mesh position={[0, baseH + pedestalH / 2, 0]} castShadow>
        <cylinderGeometry args={[pedestalR, pedestalR, pedestalH, 16]} />
        <meshStandardMaterial {...pedestalMat} />
      </mesh>

      {/* Rotating plate */}
      <mesh position={[0, height - plateH / 2, 0]} castShadow receiveShadow>
        <cylinderGeometry args={[plateR, plateR, plateH, 32]} />
        <meshStandardMaterial {...plateMat} />
      </mesh>

      {/* Crosshair alignment marks on plate surface */}
      <mesh position={[0, height + 0.002, 0]}>
        <boxGeometry args={[radius * 1.6, 0.003, 0.01]} />
        <meshStandardMaterial {...markMat} />
      </mesh>
      <mesh position={[0, height + 0.002, 0]}>
        <boxGeometry args={[0.01, 0.003, radius * 1.6]} />
        <meshStandardMaterial {...markMat} />
      </mesh>
    </group>
  );
}
