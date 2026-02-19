/**
 * DragCoordinatesHUD.jsx
 *
 * A CSS overlay (not a Three.js object) positioned in the top-right corner
 * of the 3D viewport. Displays live coordinates during drag and rotate
 * operations.
 *
 * Rendered only when interactionMode is 'drag' or 'rotate' AND a robot is
 * selected. Disappears immediately when mode returns to 'orbit'.
 *
 * Must be placed as a sibling of the R3F Canvas inside the relative-
 * positioned canvas wrapper div in App.jsx, NOT inside the Canvas itself.
 *
 * Display:
 *   Drag mode   → "X: 12.5 m  /  Y: 8.0 m"
 *   Rotate mode → "Rotation: 145°"
 *
 * Values update live because this component subscribes to deployedRobots
 * in the Zustand store, which updates on every updateRobotTransform call
 * during drag.
 */

import useSceneStore from '../store/sceneStore';

export default function DragCoordinatesHUD() {
  const interactionMode = useSceneStore((s) => s.interactionMode);
  const selectedRobotId = useSceneStore((s) => s.selectedRobotId);
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId);
  const deployedRobots = useSceneStore((s) => s.deployedRobots);
  const sceneObjects = useSceneStore((s) => s.sceneObjects);

  const isActive = interactionMode === 'drag' || interactionMode === 'rotate';
  if (!isActive || (!selectedRobotId && !selectedObjectId)) return null;

  const robot = selectedRobotId
    ? deployedRobots.find((r) => r.id === selectedRobotId)
    : sceneObjects.find((o) => o.id === selectedObjectId);
  if (!robot) return null;

  return (
    <div className="absolute top-3 right-3 bg-black/75 text-green-400 font-mono text-xs px-3 py-2 rounded pointer-events-none select-none z-10">
      {interactionMode === 'drag' ? (
        <>
          <div>X: {robot.position[0].toFixed(1)} m</div>
          <div>Y: {robot.position[1].toFixed(1)} m</div>
        </>
      ) : (
        <div>Rotation: {Math.round(robot.rotation)}°</div>
      )}
    </div>
  );
}
