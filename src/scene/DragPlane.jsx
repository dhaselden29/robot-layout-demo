/**
 * DragPlane.jsx
 *
 * A persistent, always-mounted invisible plane that handles all drag and
 * rotate pointer events for Phase 4+ interaction.
 *
 * Why always-mounted (never returns null):
 *   FloorClickPlane mounts/unmounts, which is fine for one-shot floor picks.
 *   Drag needs to receive the onPointerDown from the same gesture that clicks
 *   a robot — the plane must already be in the scene when the robot is clicked.
 *
 * Phase 5 addition — dynamic plane height:
 *   The invisible plane now tracks the selected robot's spec Z (height) via
 *   useFrame so raycasting hits at the correct elevation for platform and
 *   ceiling robots. When no robot is selected the plane rests at floor level
 *   (DRAG_Y). The height update happens every frame but is a no-op when the
 *   selected robot's height hasn't changed — negligible overhead.
 *
 * Phase 6 addition — unified entity lookup:
 *   resolveSelected() checks both selectedRobotId (deployedRobots) and
 *   selectedObjectId (sceneObjects), routing transform updates to the
 *   correct store action (updateRobotTransform vs updateObjectTransform).
 *
 * Event flow — drag:
 *   1. User presses on a robot/object → Instance.onPointerDown fires first
 *      (nearest hit), sets selectedId + mode='drag' in store.
 *   2. This same pointer event propagates to DragPlane (no stopPropagation).
 *   3. DragPlane.onPointerDown reads updated store via getState(), captures
 *      pointer, records offset, sets isDragging=true.
 *   4. All subsequent pointermove/pointerup go to DragPlane via pointer capture.
 *
 * Event flow — rotate:
 *   1. User presses the orange grip sphere in RotationHandle.
 *   2. RotationHandle.onPointerDown sets mode='rotate' (no stopPropagation).
 *   3. DragPlane receives the event, sees mode='rotate', captures pointer.
 *   4. onPointerMove calculates angle from entity centre to cursor and calls
 *      the appropriate transform update action.
 *
 * Coordinate mapping:
 *   spec X  = Three.js X  = event.point.x
 *   spec Y  = Three.js Z  = event.point.z
 *   spec Z  = Three.js Y  = entity.position[2] (preserved throughout drag)
 *
 * After drag or rotate ends (onPointerUp):
 *   - Pointer capture released
 *   - interactionMode → 'orbit'
 *   - selectedId intentionally KEPT for rotation handle availability.
 *   - Deselection only via floor click (FloorGrid onClick).
 */

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import sceneConfig from '../config/config.json';
import { snapToGrid } from '../utils/deploymentUtils';
import useSceneStore from '../store/sceneStore';

const { width, depth } = sceneConfig.floor;
const DRAG_Y = sceneConfig.interaction.dragPlaneY;
const SNAP_SIZE = sceneConfig.deployment.snapGridSize;

/**
 * Resolves the currently selected entity from either robots or scene objects.
 * Returns { entity, isRobot } or { entity: null, isRobot: false }.
 */
function resolveSelected() {
  const { selectedRobotId, deployedRobots, selectedObjectId, sceneObjects } =
    useSceneStore.getState();
  if (selectedRobotId) {
    const entity = deployedRobots.find((r) => r.id === selectedRobotId);
    return { entity: entity ?? null, isRobot: true };
  }
  if (selectedObjectId) {
    const entity = sceneObjects.find((o) => o.id === selectedObjectId);
    return { entity: entity ?? null, isRobot: false };
  }
  return { entity: null, isRobot: false };
}

export default function DragPlane() {
  const setInteractionMode = useSceneStore((s) => s.setInteractionMode);

  const meshRef = useRef();
  const isDragging = useRef(false);
  const dragOffset = useRef({ x: 0, y: 0 });

  // Keep drag plane Y in sync with the selected entity's height
  useFrame(() => {
    if (!meshRef.current) return;
    const { entity } = resolveSelected();
    meshRef.current.position.y = (entity?.position[2] ?? 0) + DRAG_Y;
  });

  function handlePointerDown(event) {
    const { interactionMode, selectedRobotId, selectedObjectId } =
      useSceneStore.getState();

    if (
      (interactionMode !== 'drag' && interactionMode !== 'rotate') ||
      (selectedRobotId === null && selectedObjectId === null)
    ) {
      return;
    }

    event.stopPropagation();
    event.target.setPointerCapture(event.pointerId);

    if (interactionMode === 'drag') {
      const { entity } = resolveSelected();
      if (!entity) return;
      dragOffset.current = {
        x: entity.position[0] - event.point.x,
        y: entity.position[1] - event.point.z,
      };
    }

    isDragging.current = true;
  }

  function handlePointerMove(event) {
    if (!isDragging.current) return;

    const {
      interactionMode,
      selectedRobotId,
      selectedObjectId,
      snapToGridEnabled,
      updateRobotTransform,
      updateObjectTransform,
    } = useSceneStore.getState();

    const { entity, isRobot } = resolveSelected();
    if (!entity) return;

    const updateTransform = isRobot
      ? (pos, rot) => updateRobotTransform(selectedRobotId, pos, rot)
      : (pos, rot) => updateObjectTransform(selectedObjectId, pos, rot);

    if (interactionMode === 'drag') {
      let newX = event.point.x + dragOffset.current.x;
      let newY = event.point.z + dragOffset.current.y;

      if (snapToGridEnabled) {
        [newX, newY] = snapToGrid(newX, newY, SNAP_SIZE);
      }

      updateTransform([newX, newY, entity.position[2]], entity.rotation);

    } else if (interactionMode === 'rotate') {
      const dx = event.point.x - entity.position[0];
      const dz = event.point.z - entity.position[1];
      let angleDeg = Math.atan2(dx, dz) * (180 / Math.PI);
      // Snap to 15° increments
      angleDeg = Math.round(angleDeg / 15) * 15;
      angleDeg = ((angleDeg % 360) + 360) % 360;

      updateTransform(entity.position, angleDeg);
    }
  }

  function handlePointerUp(event) {
    if (!isDragging.current) return;
    event.target.releasePointerCapture(event.pointerId);
    isDragging.current = false;
    setInteractionMode('orbit');
    // selectedRobotId is intentionally NOT cleared here — selection persists
    // so the rotation handle remains available after a drag.
  }

  return (
    <mesh
      ref={meshRef}
      rotation={[-Math.PI / 2, 0, 0]}
      position={[0, DRAG_Y, 0]}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
    >
      <planeGeometry args={[width, depth]} />
      {/* Fully transparent — invisible but raycasted */}
      <meshBasicMaterial transparent opacity={0} depthWrite={false} />
    </mesh>
  );
}
