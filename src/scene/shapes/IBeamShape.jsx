/**
 * IBeamShape.jsx
 *
 * Renders a structural I-beam profile running along the local X axis.
 * Bottom flange base is at local y = 0.
 *
 * Three mesh components:
 *   - Bottom flange (full-width horizontal plate)
 *   - Web (vertical plate connecting flanges)
 *   - Top flange (full-width horizontal plate)
 *
 * All cross-section dimensions match AISC W-series specs from equipment_config.json.
 */

export default function IBeamShape({
  length = 3,
  flangeWidth = 0.152,
  webHeight = 0.152,
  flangeThick = 0.0107,
  webThick = 0.0069,
  color = '#6b6b6b',
  opacity = 1,
}) {
  const webClearHeight = webHeight - 2 * flangeThick;
  const mat = { color, roughness: 0.4, metalness: 0.6, transparent: opacity < 1, opacity };

  return (
    <group>
      {/* Bottom flange */}
      <mesh position={[0, flangeThick / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, flangeThick, flangeWidth]} />
        <meshStandardMaterial {...mat} />
      </mesh>

      {/* Web */}
      <mesh position={[0, flangeThick + webClearHeight / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, webClearHeight, webThick]} />
        <meshStandardMaterial {...mat} />
      </mesh>

      {/* Top flange */}
      <mesh position={[0, webHeight - flangeThick / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[length, flangeThick, flangeWidth]} />
        <meshStandardMaterial {...mat} />
      </mesh>
    </group>
  );
}
