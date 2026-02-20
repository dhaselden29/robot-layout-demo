/**
 * WorkTableShape.jsx
 *
 * Renders a work table with tabletop, 4 legs, side aprons, and a lower shelf.
 * Runs along local X axis; bottom at y = 0.
 */

export default function WorkTableShape({
  length = 1.2,
  width = 0.6,
  height = 0.9,
  color = '#8b8680',
  opacity = 1,
}) {
  const transparent = opacity < 1;

  const topThick = 0.04;
  const legSize = 0.05;
  const legInset = legSize * 0.6;
  const apronH = 0.06;
  const apronThick = 0.015;
  const shelfThick = 0.02;
  const shelfY = height * 0.15;

  const legX = length / 2 - legInset - legSize / 2;
  const legZ = width / 2 - legInset - legSize / 2;
  const legH = height - topThick;

  const topMat = { color, roughness: 0.4, metalness: 0.3, transparent, opacity };
  const legMat = { color: '#606060', roughness: 0.3, metalness: 0.5, transparent, opacity };

  return (
    <group>
      {/* Tabletop */}
      <mesh position={[0, height - topThick / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, topThick, width]} />
        <meshStandardMaterial {...topMat} />
      </mesh>

      {/* 4 Legs */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={`leg-${i}`} position={[sx * legX, legH / 2, sz * legZ]} castShadow>
          <boxGeometry args={[legSize, legH, legSize]} />
          <meshStandardMaterial {...legMat} />
        </mesh>
      ))}

      {/* Side aprons (under tabletop, along length) */}
      <mesh position={[0, height - topThick - apronH / 2, width / 2 - legInset]} castShadow>
        <boxGeometry args={[length - 2 * legInset, apronH, apronThick]} />
        <meshStandardMaterial {...legMat} />
      </mesh>
      <mesh position={[0, height - topThick - apronH / 2, -(width / 2 - legInset)]} castShadow>
        <boxGeometry args={[length - 2 * legInset, apronH, apronThick]} />
        <meshStandardMaterial {...legMat} />
      </mesh>

      {/* Lower shelf */}
      <mesh position={[0, shelfY, 0]} castShadow>
        <boxGeometry args={[length - 2 * legInset, shelfThick, width - 2 * legInset]} />
        <meshStandardMaterial {...legMat} />
      </mesh>
    </group>
  );
}
