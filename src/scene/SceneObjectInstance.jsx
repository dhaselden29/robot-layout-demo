/**
 * SceneObjectInstance.jsx
 *
 * Renders a single deployed scene object: the procedural shape,
 * a floating label, and (when selected) a selection ring.
 *
 * Mirrors RobotInstance coordinate conventions:
 *   object.position is spec [x, y, z] where z = height (0 = floor).
 *   Three.js position = [spec.x, spec.z, spec.y].
 *   object.rotation is degrees → Three.js [0, rad, 0].
 *
 * Interaction:
 *   onPointerDown → setSelectedObjectId + mode='drag' (same pattern as robots).
 *   DragPlane receives the event via propagation (no stopPropagation on down).
 *   onClick stops propagation to prevent floor deselect.
 *
 * Phase 6:
 *   - Platform pillar and ceiling bracket identical to RobotInstance.
 *   - Selection ring sized to the object's footprint (max of length/width/radius).
 *   - Shape rendered via renderShape() switch.
 */

import { Text, useCursor } from '@react-three/drei';
import { useEffect, useRef, useState } from 'react';
import config from '../config/config.json';
import useSceneStore from '../store/sceneStore';
import { getObjectLabelHeight } from '../utils/objectUtils';
import BoxShape from './shapes/BoxShape';
import CableTrayShape from './shapes/CableTrayShape';
import CylinderShape from './shapes/CylinderShape';
import IBeamShape from './shapes/IBeamShape';
import PipeShape from './shapes/PipeShape';
import SphereShape from './shapes/SphereShape';

const DEG2RAD = Math.PI / 180;

export default function SceneObjectInstance({ object }) {
  const { shape, dimensions, color, opacity = 1, position, rotation } = object;

  const outerGroupRef = useRef();
  const [hovered, setHovered] = useState(false);

  const setSelectedObjectId = useSceneStore((s) => s.setSelectedObjectId);
  const setInteractionMode = useSceneStore((s) => s.setInteractionMode);
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId);
  const isSelected = selectedObjectId === object.id;
  const showLabels = useSceneStore((s) => s.showLabels);

  // Stamp every descendant with objectId for DragPlane / RotationHandle traversal
  useEffect(() => {
    if (!outerGroupRef.current) return;
    outerGroupRef.current.traverse((obj) => {
      obj.userData.objectId = object.id;
    });
  }, [object.id]);

  useCursor(hovered && useSceneStore.getState().interactionMode === 'orbit');

  // Spec → Three.js
  const threePos = [position[0], position[2], position[1]];
  const threeRot = [0, rotation * DEG2RAD, 0];

  const isCeiling = object.mountType === 'ceiling';

  // Label position above (or below for ceiling) the object
  const objTop = getObjectLabelHeight(shape, dimensions);
  const labelY = isCeiling
    ? -(objTop + config.labels.verticalOffset)
    : objTop + config.labels.verticalOffset;

  // Selection ring footprint — largest horizontal extent
  const footprint =
    shape === 'cylinder' || shape === 'sphere'
      ? (dimensions.radius ?? 0.5) * 2
      : Math.max(dimensions.length ?? 1, dimensions.width ?? 1);
  const ringOuter = Math.max(footprint * 0.6, 0.3);
  const ringInner = ringOuter * 0.75;

  function handlePointerDown(event) {
    if (useSceneStore.getState().interactionMode !== 'orbit') return;
    setSelectedObjectId(object.id);
    setInteractionMode('drag');
  }

  function renderShape() {
    const styleProps = { color, opacity };
    switch (shape) {
      case 'box':       return <BoxShape {...dimensions} {...styleProps} />;
      case 'cylinder':  return <CylinderShape {...dimensions} {...styleProps} />;
      case 'sphere':    return <SphereShape {...dimensions} {...styleProps} />;
      case 'ibeam':     return <IBeamShape {...dimensions} {...styleProps} />;
      case 'pipe':      return <PipeShape {...dimensions} {...styleProps} />;
      case 'cabletray': return <CableTrayShape {...dimensions} {...styleProps} />;
      default:          return null;
    }
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
      {/* Ceiling objects are flipped upside-down */}
      <group rotation={isCeiling ? [Math.PI, 0, 0] : [0, 0, 0]}>
        {renderShape()}
      </group>

      {/* Platform pillar */}
      {object.mountType === 'platform' && position[2] > 0 && (
        <mesh position={[0, -position[2] / 2, 0]} raycast={() => {}}>
          <cylinderGeometry args={[0.05, 0.05, position[2], 8]} />
          <meshPhongMaterial color="#666666" />
        </mesh>
      )}

      {/* Ceiling bracket */}
      {object.mountType === 'ceiling' && (
        <mesh position={[0, 0.04, 0]} raycast={() => {}}>
          <boxGeometry args={[0.12, 0.08, 0.12]} />
          <meshPhongMaterial color="#888888" />
        </mesh>
      )}

      {/* Selection ring */}
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

      {/* Floating label */}
      {showLabels && (
        <Text
          position={[0, labelY, 0]}
          fontSize={config.labels.fontSize}
          color="#ffffff"
          anchorX="center"
          anchorY="middle"
          outlineWidth={0.025}
          outlineColor="#000000"
          depthOffset={-1}
        >
          {object.label}
        </Text>
      )}
    </group>
  );
}
