/**
 * ConveyorShape.jsx
 *
 * Renders a belt conveyor with side rails, belt surface, legs,
 * cross braces, and end rollers. Runs along local X axis; bottom at y = 0.
 */

export default function ConveyorShape({
  length = 3,
  width = 0.5,
  height = 0.85,
  color = '#4a7040',
  opacity = 1,
}) {
  const transparent = opacity < 1;

  const legSize = 0.04;
  const legInset = legSize;
  const railThick = 0.025;
  const railHeight = height * 0.12;
  const beltThick = 0.015;
  const beltWidth = width - 2 * railThick;
  const braceSize = 0.03;

  const legX = length / 2 - legInset - legSize / 2;
  const legZ = width / 2 - legSize / 2;
  const legH = height - railHeight;
  const beltY = height - railHeight - beltThick / 2;
  const rollerR = Math.min(railHeight * 0.6, beltWidth / 4);

  const frameMat = { color, roughness: 0.3, metalness: 0.5, transparent, opacity };
  const beltMat = { color: '#2a2a2a', roughness: 0.8, metalness: 0.1, transparent, opacity };
  const metalMat = { color: '#505050', roughness: 0.3, metalness: 0.6, transparent, opacity };

  return (
    <group>
      {/* Side rails */}
      <mesh position={[0, height - railHeight / 2, width / 2 - railThick / 2]} castShadow>
        <boxGeometry args={[length, railHeight, railThick]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>
      <mesh position={[0, height - railHeight / 2, -(width / 2 - railThick / 2)]} castShadow>
        <boxGeometry args={[length, railHeight, railThick]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>

      {/* Belt surface */}
      <mesh position={[0, beltY, 0]} castShadow receiveShadow>
        <boxGeometry args={[length * 0.95, beltThick, beltWidth]} />
        <meshStandardMaterial {...beltMat} />
      </mesh>

      {/* 4 Legs */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={`leg-${i}`} position={[sx * legX, legH / 2, sz * legZ]} castShadow>
          <boxGeometry args={[legSize, legH, legSize]} />
          <meshStandardMaterial {...frameMat} />
        </mesh>
      ))}

      {/* Cross braces */}
      {[-1, 0, 1].map((sx, i) => (
        <mesh key={`brace-${i}`} position={[sx * (length / 3), height * 0.3, 0]} castShadow>
          <boxGeometry args={[braceSize, braceSize, width - 2 * legInset]} />
          <meshStandardMaterial {...frameMat} />
        </mesh>
      ))}

      {/* End rollers */}
      <mesh position={[length / 2 - rollerR, beltY, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[rollerR, rollerR, beltWidth, 12]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>
      <mesh position={[-(length / 2 - rollerR), beltY, 0]} rotation={[Math.PI / 2, 0, 0]} castShadow>
        <cylinderGeometry args={[rollerR, rollerR, beltWidth, 12]} />
        <meshStandardMaterial {...metalMat} />
      </mesh>
    </group>
  );
}
