/**
 * OperatorStationShape.jsx
 *
 * Renders an operator station / HMI console with a desk surface,
 * 4 legs, a back panel (display/controls), and a front kick plate.
 * Total height includes the back panel above the desk.
 * Bottom at y = 0.
 */

export default function OperatorStationShape({
  length = 1.2,
  width = 0.7,
  height = 1.1,
  color = '#5a6a7a',
  opacity = 1,
}) {
  const transparent = opacity < 1;

  const deskH = height * 0.65;
  const deskThick = 0.03;
  const legSize = 0.04;
  const legInset = legSize;
  const panelH = height - deskH;
  const panelThick = 0.025;
  const kickH = deskH * 0.15;
  const kickThick = 0.02;

  const legX = length / 2 - legInset;
  const legZ = width / 2 - legInset;

  const frameMat = { color, roughness: 0.3, metalness: 0.5, transparent, opacity };
  const deskMat = { color: '#d0d0d0', roughness: 0.5, metalness: 0.2, transparent, opacity };
  const panelMat = { color: '#303030', roughness: 0.4, metalness: 0.3, transparent, opacity };

  return (
    <group>
      {/* Desk surface */}
      <mesh position={[0, deskH, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, deskThick, width]} />
        <meshStandardMaterial {...deskMat} />
      </mesh>

      {/* 4 Legs */}
      {[[-1, -1], [-1, 1], [1, -1], [1, 1]].map(([sx, sz], i) => (
        <mesh key={`leg-${i}`} position={[sx * legX, deskH / 2, sz * legZ]} castShadow>
          <boxGeometry args={[legSize, deskH, legSize]} />
          <meshStandardMaterial {...frameMat} />
        </mesh>
      ))}

      {/* Back panel (HMI / display) */}
      <mesh position={[0, deskH + panelH / 2, -(width / 2 - panelThick / 2)]} castShadow>
        <boxGeometry args={[length * 0.9, panelH, panelThick]} />
        <meshStandardMaterial {...panelMat} />
      </mesh>

      {/* Front kick plate */}
      <mesh position={[0, kickH / 2, width / 2 - kickThick / 2]} castShadow>
        <boxGeometry args={[length - 2 * legInset, kickH, kickThick]} />
        <meshStandardMaterial {...frameMat} />
      </mesh>
    </group>
  );
}
