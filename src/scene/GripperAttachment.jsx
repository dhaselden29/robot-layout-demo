/**
 * GripperAttachment.jsx
 *
 * Imperatively attaches gripper geometry to a URDF robot's wrist link.
 *
 * Renders null in the React tree. The actual gripper is a Three.js Group
 * that is .add()'d to the URDF link node directly. This is necessary
 * because URDF links live inside a <primitive> and cannot be targeted
 * as JSX parents.
 *
 * The gripper is a child of the wrist link in the Three.js scene graph,
 * so it automatically follows all joint transforms with zero additional code.
 *
 * @param {object}      props.robotObject - The loaded URDFRobot Three.js object
 * @param {string}      props.gripperId   - Gripper type ID from grippers_config.json
 * @param {string}      props.modelId     - Robot model ID for lastLinkName lookup
 * @param {string|null} props.colorOverride - Hex colour or null
 * @param {number}      props.opacity     - 0–1
 */

import { useEffect, useRef } from 'react';
import { buildGripperGeometry, getLastLinkName } from '../utils/gripperUtils';

export default function GripperAttachment({ robotObject, gripperId, modelId, colorOverride, opacity, gripperScale = 1.0 }) {
  const gripperRef = useRef(null);
  const linkRef = useRef(null);

  useEffect(() => {
    if (!robotObject || !gripperId) return;

    const linkName = getLastLinkName(modelId);
    if (!linkName) return;

    const link = robotObject.links?.[linkName];
    if (!link) return;

    const gripperGroup = buildGripperGeometry(gripperId, colorOverride, opacity);
    if (!gripperGroup) return;

    gripperGroup.userData.isGripper = true;
    gripperGroup.scale.set(gripperScale, gripperScale, gripperScale);
    link.add(gripperGroup);
    gripperRef.current = gripperGroup;
    linkRef.current = link;

    return () => {
      if (linkRef.current && gripperRef.current) {
        linkRef.current.remove(gripperRef.current);
        // Dispose geometry and materials
        gripperRef.current.traverse((obj) => {
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach((m) => m.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
      }
      gripperRef.current = null;
      linkRef.current = null;
    };
  }, [robotObject, gripperId, modelId, colorOverride, opacity, gripperScale]);

  return null;
}
