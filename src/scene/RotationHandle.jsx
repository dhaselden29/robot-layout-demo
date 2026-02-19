/**
 * RotationHandle.jsx
 *
 * Renders the orange rotation handle around the currently selected robot.
 * Only mounts when selectedRobotId is set; returns null otherwise.
 *
 * Visual elements:
 *   - A flat torus ring at floor level centred on the robot, showing the
 *     orbit path for the grip sphere. Non-interactive (raycast disabled).
 *   - A small bright sphere "grip" positioned on the ring at the robot's
 *     current heading. Interactive — pressing it starts a rotate gesture.
 *
 * Interaction flow:
 *   1. User presses the grip sphere.
 *   2. onPointerDown sets interactionMode → 'rotate'.
 *      Does NOT call stopPropagation — the event propagates to DragPlane,
 *      which then sets pointer capture and begins tracking the rotation.
 *   3. DragPlane.onPointerMove calculates angle from robot centre to cursor
 *      and calls updateRobotTransform with the new heading in degrees.
 *   4. This component re-renders as robot.rotation changes, moving the grip
 *      sphere to the new angle in real time.
 *   5. onPointerUp in DragPlane ends the gesture and returns to orbit mode.
 *
 * onClick on the grip calls stopPropagation to prevent the floor's deselect
 * handler from firing when the user taps (not drags) the grip.
 *
 * Coordinate mapping:
 *   spec X  = Three.js X  =  robot.position[0]
 *   spec Y  = Three.js Z  =  robot.position[1]
 *   spec Z  = Three.js Y  =  robot.position[2]  (Phase 5: torus/grip at robot height)
 */

import config from '../config/config.json';
import useSceneStore from '../store/sceneStore';

const DEG2RAD = Math.PI / 180;
const { rotationHandleColor, rotationHandleRadius } = config.interaction;

export default function RotationHandle() {
  const selectedRobotId = useSceneStore((s) => s.selectedRobotId);
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId);
  const deployedRobots = useSceneStore((s) => s.deployedRobots);
  const sceneObjects = useSceneStore((s) => s.sceneObjects);
  const setInteractionMode = useSceneStore((s) => s.setInteractionMode);

  // Resolve selected entity from either robots or scene objects
  const selectedId = selectedRobotId ?? selectedObjectId;
  if (!selectedId) return null;

  const robot = selectedRobotId
    ? deployedRobots.find((r) => r.id === selectedRobotId)
    : sceneObjects.find((o) => o.id === selectedObjectId);
  if (!robot) return null;

  // Entity world position in Three.js coords
  const rx = robot.position[0]; // spec X = Three.js X
  const ry = robot.position[2]; // spec Z (height) = Three.js Y
  const rz = robot.position[1]; // spec Y = Three.js Z

  // Grip sphere position on the ring arc at the robot's current heading
  const gripRad = robot.rotation * DEG2RAD;
  const gripX = rx + rotationHandleRadius * Math.sin(gripRad);
  const gripZ = rz + rotationHandleRadius * Math.cos(gripRad);

  function handleGripPointerDown(event) {
    // Set rotate mode — do NOT stopPropagation so DragPlane also receives
    // this event and immediately sets pointer capture for the drag gesture.
    setInteractionMode('rotate');
  }

  return (
    <group>
      {/* Torus ring — decoration only, no raycasting */}
      <mesh
        rotation={[-Math.PI / 2, 0, 0]}
        position={[rx, ry + 0.02, rz]}
        raycast={() => {}}
      >
        <torusGeometry args={[rotationHandleRadius, 0.025, 8, 64]} />
        <meshBasicMaterial color={rotationHandleColor} />
      </mesh>

      {/* Grip sphere — interactive, sits on the ring at current heading */}
      <mesh
        position={[gripX, ry + 0.07, gripZ]}
        onPointerDown={handleGripPointerDown}
        onClick={(e) => e.stopPropagation()}
      >
        <sphereGeometry args={[0.12, 12, 8]} />
        <meshBasicMaterial color={rotationHandleColor} />
      </mesh>
    </group>
  );
}
