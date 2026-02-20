/**
 * PalletShape.jsx
 *
 * Renders a shipping pallet with top deck boards, bottom deck boards,
 * and connecting stringers. Follows EUR/ISO pallet proportions.
 * Bottom at y = 0.
 */

export default function PalletShape({
  length = 1.2,
  width = 0.8,
  height = 0.144,
  color = '#c4a55a',
  opacity = 1,
}) {
  const transparent = opacity < 1;
  const mat = { color, roughness: 0.7, metalness: 0.0, transparent, opacity };

  const boardThick = height * 0.15;
  const stringerH = height - 2 * boardThick;
  const boardW = length * 0.10;
  const stringerW = width * 0.12;

  // 5 top deck boards spaced evenly across length
  const topSpacing = (length - boardW) / 4;
  const topBoards = [];
  for (let i = 0; i < 5; i++) {
    const x = -length / 2 + boardW / 2 + i * topSpacing;
    topBoards.push(
      <mesh key={`top-${i}`} position={[x, height - boardThick / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[boardW, boardThick, width]} />
        <meshStandardMaterial {...mat} />
      </mesh>
    );
  }

  // 3 stringers running along length, spaced across width
  const stringerZ = width / 2 - stringerW / 2;
  const stringers = [-1, 0, 1].map((sz, i) => (
    <mesh key={`str-${i}`} position={[0, boardThick + stringerH / 2, sz * stringerZ]} castShadow>
      <boxGeometry args={[length, stringerH, stringerW]} />
      <meshStandardMaterial {...mat} />
    </mesh>
  ));

  // 3 bottom deck boards spaced across length
  const botSpacing = (length - boardW) / 2;
  const bottomBoards = [-1, 0, 1].map((sx, i) => (
    <mesh key={`bot-${i}`} position={[sx * botSpacing / 2 * 2, boardThick / 2, 0]} castShadow>
      <boxGeometry args={[boardW, boardThick, width]} />
      <meshStandardMaterial {...mat} />
    </mesh>
  ));

  return (
    <group>
      {topBoards}
      {stringers}
      {bottomBoards}
    </group>
  );
}
