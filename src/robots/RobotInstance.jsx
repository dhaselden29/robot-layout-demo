/**
 * RobotInstance.jsx
 *
 * Renders a single deployed robot: the 3D model, a floating label, and
 * (when selected) a selection ring.
 *
 * Coordinate convention:
 *   robot.position is spec [x, y, z] where z = height (0 = floor).
 *   Three.js position = [spec.x, spec.z, spec.y].
 *   robot.rotation is degrees around the vertical axis → Three.js [0, rad, 0].
 *
 * Phase 4 additions:
 *   - PHASE 4 FIX: outerGroupRef stamped with userData.robotId on full subtree
 *     so raycasting can trace any child mesh hit back to a robot ID.
 *   - PHASE 4 FIX: registerRef prop registers the group in RobotManager's
 *     robotRefs map for imperative access by drag/rotate logic.
 *   - onPointerDown starts a drag (mode → 'drag', selectedRobotId set).
 *     Does NOT call stopPropagation so DragPlane also receives the event
 *     and can set pointer capture in the same gesture.
 *   - onClick calls stopPropagation to prevent the floor's deselect
 *     handler from firing when the robot itself is clicked.
 *   - useCursor shows a grab cursor when hovering in orbit mode.
 *   - Selection ring (RingGeometry) renders at base level when selected.
 *
 * Phase 5 additions:
 *   - mountType passed to URDFRobot (ceiling flips coordinate correction).
 *   - Ceiling flip group wraps PlaceholderRobot/RobotLoader for non-URDF models.
 *   - Grey cylinder pillar rendered below platform-mounted robots.
 *   - Small mounting bracket rendered above ceiling-mounted robots.
 */

import { useCursor } from '@react-three/drei';
import { Text } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import config from '../config/config.json';
import robotsConfig from '../config/robots_config.json';
import useSceneStore from '../store/sceneStore';
import PlaceholderRobot from './PlaceholderRobot';
import RobotLoader from './RobotLoader';
import URDFRobot from './URDFRobot';

const DEG2RAD = Math.PI / 180;

// Flatten all models once for footprint lookup
const ALL_MODELS = Object.values(robotsConfig.manufacturers).flatMap((m) => m.models);

export default function RobotInstance({ robot, approxHeight, registerRef }) {
  const { manufacturer, model, urdf, packageMap, file, scale, position, rotation } = robot;

  // PHASE 4 FIX: ref to the outer group — used for userData stamping and ref map
  const outerGroupRef = useRef();

  const [hovered, setHovered] = useState(false);

  const setSelectedRobotId = useSceneStore((s) => s.setSelectedRobotId);
  const setInteractionMode = useSceneStore((s) => s.setInteractionMode);
  const selectedRobotId = useSceneStore((s) => s.selectedRobotId);
  const isSelected = selectedRobotId === robot.id;
  const showLabels = useSceneStore((s) => s.showLabels);

  // PHASE 4 FIX: Traverse the entire subtree and stamp every object with
  // this robot's ID. Raycasting returns the deepest intersected object
  // (a mesh deep inside URDFRobot), so userData must be on every node.
  useEffect(() => {
    if (!outerGroupRef.current) return;
    outerGroupRef.current.traverse((obj) => {
      obj.userData.robotId = robot.id;
    });
  }, [robot.id]);

  // PHASE 4 FIX: Register/deregister in RobotManager's robotRefs map.
  // Cleanup on unmount removes stale entries.
  useEffect(() => {
    registerRef(robot.id, outerGroupRef.current);
    return () => registerRef(robot.id, null);
  }, [robot.id, registerRef]);

  // Grab cursor when hovering a robot in orbit mode
  useCursor(hovered && useSceneStore.getState().interactionMode === 'orbit');

  // Spec → Three.js coordinate conversion
  const threePos = [position[0], position[2], position[1]];
  const threeRot = [0, rotation * DEG2RAD, 0];

  // Label height above the robot (ceiling robots: label below)
  const isCeiling = robot.mountType === 'ceiling';
  const labelY = isCeiling
    ? -(approxHeight + config.labels.verticalOffset) * scale
    : (approxHeight + config.labels.verticalOffset) * scale;

  // Selection ring radius derived from robot's physical footprint
  const modelConfig = ALL_MODELS.find((m) => m.id === robot.modelId);
  const footprint = modelConfig?.footprint_m?.[0] ?? 0.3;
  const ringOuter = Math.max(footprint * 1.5, 0.4) * scale;
  const ringInner = ringOuter * 0.75;

  function handlePointerDown(event) {
    // Only start a drag when in orbit mode
    if (useSceneStore.getState().interactionMode !== 'orbit') return;
    // Do NOT call event.stopPropagation() here — DragPlane must also receive
    // this same onPointerDown event so it can set pointer capture immediately,
    // making the entire press-move-release a single continuous drag gesture.
    setSelectedRobotId(robot.id);
    setInteractionMode('drag');
  }

  // PHASE 5: Pass mountType to URDFRobot; wrap non-URDF models in ceiling flip.
  function renderModel() {
    const colorOverride = robot.colorOverride ?? null;
    const opacity = robot.opacity ?? 1;
    if (urdf && packageMap) {
      return (
        <URDFRobot
          urdf={urdf}
          packageMap={packageMap}
          manufacturer={manufacturer}
          approxHeight={approxHeight}
          mountType={robot.mountType}
          colorOverride={colorOverride}
          opacity={opacity}
          robotId={robot.id}
        />
      );
    }
    const inner = file
      ? <RobotLoader file={file} manufacturer={manufacturer} approxHeight={approxHeight} />
      : <PlaceholderRobot manufacturer={manufacturer} approxHeight={approxHeight} colorOverride={colorOverride} opacity={opacity} />;
    // Flip placeholder/GLB 180° around X for ceiling mounts
    return isCeiling ? <group rotation={[Math.PI, 0, 0]}>{inner}</group> : inner;
  }

  return (
    <group
      ref={outerGroupRef}
      position={threePos}
      rotation={threeRot}
      onPointerDown={handlePointerDown}
      onPointerOver={() => setHovered(true)}
      onPointerOut={() => setHovered(false)}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Scale wrapper */}
      <group scale={[scale, scale, scale]}>
        {renderModel()}
      </group>

      {/* PHASE 5: Platform pillar — grey cylinder from floor to robot base.
          In local space the group is at world-Y = position[2], so the
          cylinder centre at local-Y = -position[2]/2 places its base at
          world-Y = 0 (floor) and its top at world-Y = position[2]. */}
      {robot.mountType === 'platform' && position[2] > 0 && (
        <mesh position={[0, -position[2] / 2, 0]} raycast={() => {}}>
          <cylinderGeometry args={[0.07, 0.07, position[2], 8]} />
          <meshPhongMaterial color="#666666" />
        </mesh>
      )}

      {/* PHASE 5: Ceiling bracket — small mounting block above robot. */}
      {robot.mountType === 'ceiling' && (
        <mesh position={[0, 0.05, 0]} raycast={() => {}}>
          <boxGeometry args={[0.18, 0.1, 0.18]} />
          <meshPhongMaterial color="#888888" />
        </mesh>
      )}

      {/* Selection ring — base level, non-raycasted decoration.
          Ceiling robots: ring at y = -0.02 (just below the mount point). */}
      {isSelected && (
        <mesh
          rotation={[-Math.PI / 2, 0, 0]}
          position={[0, isCeiling ? -0.02 : 0.02, 0]}
          raycast={() => {}}
        >
          <ringGeometry args={[ringInner, ringOuter, 48]} />
          <meshBasicMaterial
            color={config.interaction.selectionRingColor}
            transparent
            opacity={config.interaction.selectionRingOpacity}
            depthWrite={false}
          />
        </mesh>
      )}

      {/* Floating billboard label — not scaled so it stays readable */}
      {showLabels && (
        <Text
          position={[0, labelY, 0]}
          fontSize={config.labels.fontSize * Math.max(scale, 0.6)}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.025}
          outlineColor="#000000"
          depthOffset={-1}
        >
          {robot.label}
        </Text>
      )}
    </group>
  );
}
