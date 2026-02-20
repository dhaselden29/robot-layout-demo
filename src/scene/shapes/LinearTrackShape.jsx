/**
 * LinearTrackShape.jsx
 *
 * Renders a 7th-axis linear track from procedural box meshes.
 * Runs along the local X axis (same convention as I-beams, pipes, conveyors).
 * Bottom face at local y = 0.
 *
 * Components (all boxGeometry):
 *   - Base extrusion (full length, manufacturer colour)
 *   - Left + right guide rails (dark steel grey)
 *   - Carriage mounting plate (light grey, centred on track)
 *   - 4 guide blocks under carriage corners (medium grey)
 *   - 2 end stops at track ends (manufacturer colour)
 */

export default function LinearTrackShape({
  length = 5,
  width = 0.30,
  height = 0.15,
  carriageLength = 0.50,
  carriageWidth = 0.35,
  color = '#808080',
  opacity = 1,
}) {
  const transparent = opacity < 1;

  // Base extrusion: 60% of total height
  const baseH = height * 0.6;
  const baseY = baseH / 2;

  // Guide rails: sit on top of base, fill remaining 40% of height
  const railH = height - baseH;
  const railW = width * 0.08; // thin rail profile
  const railY = baseH + railH / 2;
  const railZ = (width / 2) - railW * 1.5; // inset from edges

  // Carriage plate: thin plate on top of guide rails
  const plateThick = 0.012;
  const plateY = height + plateThick / 2;

  // Guide blocks: small pads under carriage corners, riding on rails
  const blockL = carriageLength * 0.2;
  const blockW = railW * 2.5;
  const blockH = railH * 0.5;
  const blockY = baseH + blockH / 2;
  const blockXOff = carriageLength / 2 - blockL / 2 - 0.01;

  // End stops: small blocks at each end
  const stopL = width * 0.15;
  const stopH = height * 0.5;
  const stopW = width * 0.8;
  const stopY = stopH / 2;
  const stopX = length / 2 + stopL / 2;

  // Materials
  const baseMat = { color, roughness: 0.3, metalness: 0.6, transparent, opacity };
  const railMat = { color: '#404040', roughness: 0.2, metalness: 0.7, transparent, opacity };
  const blockMat = { color: '#606060', roughness: 0.3, metalness: 0.5, transparent, opacity };
  const plateMat = { color: '#c0c0c0', roughness: 0.3, metalness: 0.6, transparent, opacity };

  return (
    <group>
      {/* Base extrusion */}
      <mesh position={[0, baseY, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, baseH, width]} />
        <meshStandardMaterial {...baseMat} />
      </mesh>

      {/* Left guide rail */}
      <mesh position={[0, railY, railZ]} castShadow receiveShadow>
        <boxGeometry args={[length, railH, railW]} />
        <meshStandardMaterial {...railMat} />
      </mesh>

      {/* Right guide rail */}
      <mesh position={[0, railY, -railZ]} castShadow receiveShadow>
        <boxGeometry args={[length, railH, railW]} />
        <meshStandardMaterial {...railMat} />
      </mesh>

      {/* Carriage mounting plate */}
      <mesh position={[0, plateY, 0]} castShadow receiveShadow>
        <boxGeometry args={[carriageLength, plateThick, carriageWidth]} />
        <meshStandardMaterial {...plateMat} />
      </mesh>

      {/* Guide blocks (4 corners) */}
      <mesh position={[blockXOff, blockY, railZ]} castShadow>
        <boxGeometry args={[blockL, blockH, blockW]} />
        <meshStandardMaterial {...blockMat} />
      </mesh>
      <mesh position={[-blockXOff, blockY, railZ]} castShadow>
        <boxGeometry args={[blockL, blockH, blockW]} />
        <meshStandardMaterial {...blockMat} />
      </mesh>
      <mesh position={[blockXOff, blockY, -railZ]} castShadow>
        <boxGeometry args={[blockL, blockH, blockW]} />
        <meshStandardMaterial {...blockMat} />
      </mesh>
      <mesh position={[-blockXOff, blockY, -railZ]} castShadow>
        <boxGeometry args={[blockL, blockH, blockW]} />
        <meshStandardMaterial {...blockMat} />
      </mesh>

      {/* End stop - positive X */}
      <mesh position={[stopX, stopY, 0]} castShadow>
        <boxGeometry args={[stopL, stopH, stopW]} />
        <meshStandardMaterial {...baseMat} />
      </mesh>

      {/* End stop - negative X */}
      <mesh position={[-stopX, stopY, 0]} castShadow>
        <boxGeometry args={[stopL, stopH, stopW]} />
        <meshStandardMaterial {...baseMat} />
      </mesh>
    </group>
  );
}
