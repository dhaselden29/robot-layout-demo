/**
 * FloorClickPlane.jsx
 *
 * An invisible (or semi-transparent) plane at floor level that captures
 * a single click when interactionMode === 'place'.
 *
 * On click:
 *   1. Reads the Three.js intersection point (x, z)
 *   2. Converts to spec floor coords [specX, specY] = [x, z]
 *   3. Stores the coords via setFloorClickCoords
 *   4. Returns to 'orbit' mode
 *
 * The plane is not rendered at all when interactionMode !== 'place',
 * so it has zero cost during normal operation.
 */

import useSceneStore from '../store/sceneStore';
import config from '../config/config.json';

const { width, depth } = config.floor;

export default function FloorClickPlane() {
  const interactionMode = useSceneStore((s) => s.interactionMode);
  const setFloorClickCoords = useSceneStore((s) => s.setFloorClickCoords);
  const setInteractionMode = useSceneStore((s) => s.setInteractionMode);

  if (interactionMode !== 'place') return null;

  function handleClick(event) {
    event.stopPropagation();
    const { x, z } = event.point;
    // Spec coords: x = left/right (same as Three.js x), y = forward/back (Three.js z)
    setFloorClickCoords([
      Math.round(x * 10) / 10,
      Math.round(z * 10) / 10,
    ]);
    setInteractionMode('orbit');
  }

  return (
    <mesh
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, 0.015, 0]}
      onClick={handleClick}
    >
      <planeGeometry args={[width, depth]} />
      <meshBasicMaterial
        color="#4488ff"
        transparent
        opacity={0.12}
        depthWrite={false}
      />
    </mesh>
  );
}
