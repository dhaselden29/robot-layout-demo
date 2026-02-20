/**
 * SafetyFenceShape.jsx
 *
 * Renders a safety fence panel with vertical posts, horizontal top/bottom
 * rails, and semi-transparent wire mesh panels between posts.
 * Runs along local X axis; bottom at y = 0.
 */

export default function SafetyFenceShape({
  length = 2,
  width = 0.05,
  height = 1.4,
  color = '#e8a020',
  opacity = 1,
}) {
  const transparent = opacity < 1;

  const postSize = Math.max(width, 0.04);
  const railSize = 0.025;

  // Posts every ~1m, minimum 2 at ends
  const numSections = Math.max(1, Math.round(length));
  const numPosts = numSections + 1;
  const sectionLen = length / numSections;

  const postMat = { color, roughness: 0.3, metalness: 0.5, transparent, opacity };
  const meshMat = {
    color: '#c0c0c0',
    roughness: 0.5,
    metalness: 0.3,
    transparent: true,
    opacity: Math.min(opacity, 0.25),
  };

  // Build posts
  const posts = [];
  for (let i = 0; i < numPosts; i++) {
    const x = -length / 2 + i * sectionLen;
    posts.push(
      <mesh key={`post-${i}`} position={[x, height / 2, 0]} castShadow>
        <boxGeometry args={[postSize, height, postSize]} />
        <meshStandardMaterial {...postMat} />
      </mesh>
    );
  }

  // Build wire mesh panels between posts
  const panels = [];
  for (let i = 0; i < numSections; i++) {
    const x = -length / 2 + sectionLen / 2 + i * sectionLen;
    panels.push(
      <mesh key={`panel-${i}`} position={[x, height * 0.55, 0]}>
        <boxGeometry args={[sectionLen - postSize, height * 0.8, 0.003]} />
        <meshStandardMaterial {...meshMat} depthWrite={false} />
      </mesh>
    );
  }

  return (
    <group>
      {posts}

      {/* Top rail */}
      <mesh position={[0, height - railSize / 2, 0]} castShadow>
        <boxGeometry args={[length, railSize, postSize]} />
        <meshStandardMaterial {...postMat} />
      </mesh>

      {/* Bottom rail */}
      <mesh position={[0, railSize / 2 + 0.02, 0]} castShadow>
        <boxGeometry args={[length, railSize, postSize]} />
        <meshStandardMaterial {...postMat} />
      </mesh>

      {/* Wire mesh panels */}
      {panels}
    </group>
  );
}
