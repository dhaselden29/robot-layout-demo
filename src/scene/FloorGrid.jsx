/**
 * FloorGrid.jsx
 *
 * Renders the factory floor: a solid floor plane, a metric grid overlay,
 * and four perimeter walls. All dimensions come from config.json.
 *
 * The floor is centred at the world origin (0, 0, 0).
 * Grid lines are spaced 1 metre apart.
 * Metric labels are placed along the X and Z edges at 5-metre intervals.
 * Perimeter walls are thin box geometries standing at the floor edges.
 *
 * Phase 4 addition:
 *   The floor mesh has an onClick handler that deselects the currently
 *   selected robot when the user clicks empty floor while in orbit mode.
 *   State is read via useSceneStore.getState() (not subscribed) so
 *   FloorGrid does not re-render on mode or selection changes.
 */

import { Text } from '@react-three/drei';
import { useMemo } from 'react';
import * as THREE from 'three';
import config from '../config/config.json';
import useSceneStore from '../store/sceneStore';

const { width, depth } = config.floor;
const halfW = width / 2;
const halfD = depth / 2;

function getLabelPositions(total, step = 5) {
  const positions = [];
  const half = total / 2;
  for (let i = -half; i <= half; i += step) {
    positions.push(Math.round(i));
  }
  return positions;
}

export default function FloorGrid() {
  const floorColor = useSceneStore((s) => s.sceneSettings.floorColor);
  const gridVisible = useSceneStore((s) => s.sceneSettings.gridVisible);

  const xLabels = getLabelPositions(width);
  const zLabels = getLabelPositions(depth);

  const floorMaterial = useMemo(
    () => new THREE.MeshStandardMaterial({ color: floorColor, roughness: 0.9, metalness: 0.0 }),
    [floorColor]
  );

  function handleFloorClick() {
    const {
      interactionMode,
      selectedRobotId, setSelectedRobotId,
      selectedObjectId, setSelectedObjectId,
    } = useSceneStore.getState();
    if (interactionMode !== 'orbit') return;
    if (selectedRobotId !== null) setSelectedRobotId(null);
    else if (selectedObjectId !== null) setSelectedObjectId(null);
  }

  return (
    <group>
      {/* Solid floor plane — also handles deselection clicks */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[0, -0.01, 0]}
        receiveShadow
        onClick={handleFloorClick}
      >
        <planeGeometry args={[width, depth]} />
        <primitive object={floorMaterial} attach="material" />
      </mesh>

      {/* Metric grid overlay — 1 division per metre */}
      {gridVisible && (
        <>
          <gridHelper
            args={[
              Math.max(width, depth),
              Math.max(width, depth),
              '#546e7a',
              '#607d8b',
            ]}
            position={[0, 0, 0]}
          />

          {/* X-axis labels along the near edge (Z = +halfD) */}
          {xLabels.map((x) => (
            <Text
              key={`x-${x}`}
              position={[x, 0.05, halfD + 1.2]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.5}
              color="#cfd8dc"
              anchorX="center"
              anchorY="middle"
            >
              {`${x}m`}
            </Text>
          ))}

          {/* Z-axis labels along the right edge (X = +halfW) */}
          {zLabels.map((z) => (
            <Text
              key={`z-${z}`}
              position={[halfW + 1.2, 0.05, z]}
              rotation={[-Math.PI / 2, 0, 0]}
              fontSize={0.5}
              color="#cfd8dc"
              anchorX="center"
              anchorY="middle"
            >
              {`${z}m`}
            </Text>
          ))}
        </>
      )}

      {/* Perimeter walls removed — add walls via Equipment > Wall object */}
    </group>
  );
}
