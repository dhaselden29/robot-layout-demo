/**
 * objectUtils.js
 *
 * Utility functions for scene object deployment and configuration.
 *
 * buildObjectInstances    — creates N deployable object instances from the catalogue.
 * getObjectLabelHeight    — returns the top-of-object Y in local space for Text positioning.
 * getObjectTopSurface     — returns the top surface height for "mount robot here" Z calculation.
 * getEditableDimensions   — returns the subset of dimension keys that are user-editable.
 * getSpecInfo             — returns a read-only spec string for materials.
 */

import equipmentConfig from '../config/equipment_config.json';

/**
 * Builds an array of scene object instances ready to insert into the store.
 *
 * @param {string} category          - "shapes" | "equipment" | "materials"
 * @param {string} itemId            - Item id within the category, e.g. "work_table"
 * @param {number} count             - Number of instances to deploy
 * @param {number} originX           - Spec X origin (metres)
 * @param {number} originY           - Spec Y origin (metres)
 * @param {number} rotationDeg       - Heading in degrees
 * @param {number} startId           - First integer ID (e.g. store.nextObjectId)
 * @param {string} mountType         - "floor" | "platform" | "ceiling"
 * @param {number} originZ           - Spec Z height (metres); 0 for floor
 * @param {object} dimensionOverrides - Optional partial dimension override from UI
 * @returns {Array} Array of scene object instances
 */
export function buildObjectInstances(
  category,
  itemId,
  count,
  originX,
  originY,
  rotationDeg,
  startId,
  mountType = 'floor',
  originZ = 0,
  dimensionOverrides = {}
) {
  const item = equipmentConfig.categories[category].items.find((i) => i.id === itemId);
  if (!item) return [];

  const instances = [];
  for (let i = 0; i < count; i++) {
    const idNum = startId + i;
    // Offset multiple items by 1m along X to avoid full overlap
    const posX = originX + i * 1.0;

    instances.push({
      id: `o-${idNum}`,
      category,
      itemId,
      name: item.name,
      shape: item.shape,
      dimensions: { ...item.defaultDimensions, ...dimensionOverrides },
      color: item.color,
      opacity: item.defaultOpacity ?? 1.0,
      position: [posX, originY, originZ],
      rotation: rotationDeg,
      mountType,
      label: `${item.name} #${idNum}`,
    });
  }
  return instances;
}

/**
 * Returns the top-of-object height in local space (local Y = 0 at bottom).
 * Used to position the Text label above the object.
 *
 * @param {string} shape      - Shape type
 * @param {object} dimensions - Dimension map
 * @returns {number} Height of top surface in metres
 */
export function getObjectLabelHeight(shape, dimensions) {
  switch (shape) {
    case 'box':       return dimensions.height ?? 1;
    case 'cylinder':  return dimensions.height ?? 1;
    case 'sphere':    return (dimensions.radius ?? 0.5) * 2;
    case 'ibeam':     return dimensions.webHeight ?? 0.1;
    case 'pipe':      return dimensions.outerDiam ?? 0.1;
    case 'cabletray':     return dimensions.height ?? 0.05;
    case 'linear_track':     return (dimensions.height ?? 0.15) + 0.012;
    case 'work_table':       return dimensions.height ?? 0.9;
    case 'turntable':        return dimensions.height ?? 0.12;
    case 'conveyor':         return dimensions.height ?? 0.85;
    case 'safety_fence':     return dimensions.height ?? 1.4;
    case 'pallet':           return dimensions.height ?? 0.144;
    case 'operator_station': return dimensions.height ?? 1.1;
    default:                 return 1;
  }
}

/**
 * Returns the height of the top surface of an object in world space above its
 * base position. Used by "Mount Robot Here" to calculate the correct Z origin
 * for a robot placed on top of this object.
 *
 * For an object at position[2] = baseZ, the robot's originZ should be:
 *   baseZ + getObjectTopSurface(shape, dimensions)
 *
 * @param {string} shape      - Shape type
 * @param {object} dimensions - Dimension map
 * @returns {number} Height of top surface above object's base (metres)
 */
export function getObjectTopSurface(shape, dimensions) {
  switch (shape) {
    case 'box':       return dimensions.height ?? 1;
    case 'cylinder':  return dimensions.height ?? 1;
    case 'sphere':    return (dimensions.radius ?? 0.5) * 2;
    case 'ibeam':     return dimensions.webHeight ?? 0.1;
    case 'pipe':      return dimensions.outerDiam ?? 0.1;
    case 'cabletray':     return dimensions.height ?? 0.05;
    case 'linear_track':     return (dimensions.height ?? 0.15) + 0.012;
    case 'work_table':       return dimensions.height ?? 0.9;
    case 'turntable':        return dimensions.height ?? 0.12;
    case 'conveyor':         return dimensions.height ?? 0.85;
    case 'safety_fence':     return dimensions.height ?? 1.4;
    case 'pallet':           return dimensions.height ?? 0.144;
    case 'operator_station': return (dimensions.height ?? 1.1) * 0.65;
    default:                 return 0;
  }
}

/**
 * Returns the list of editable dimension fields for a given shape.
 * Materials (ibeam, pipe, cabletray) only expose length as editable.
 *
 * @param {string} shape - Shape type
 * @returns {Array<{key: string, label: string, step: number}>}
 */
export function getEditableDimensions(shape) {
  switch (shape) {
    case 'box':
      return [
        { key: 'length', label: 'L', step: 0.1 },
        { key: 'width',  label: 'W', step: 0.1 },
        { key: 'height', label: 'H', step: 0.1 },
      ];
    case 'cylinder':
      return [
        { key: 'radius', label: 'R', step: 0.05 },
        { key: 'height', label: 'H', step: 0.1  },
      ];
    case 'sphere':
      return [
        { key: 'radius', label: 'R', step: 0.05 },
      ];
    case 'ibeam':
      return [
        { key: 'length', label: 'L', step: 0.1 },
      ];
    case 'pipe':
      return [
        { key: 'length', label: 'L', step: 0.1 },
      ];
    case 'cabletray':
      return [
        { key: 'length', label: 'L', step: 0.1 },
      ];
    case 'linear_track':
      return [
        { key: 'length', label: 'L', step: 0.5 },
      ];
    case 'work_table':
      return [
        { key: 'length', label: 'L', step: 0.1 },
        { key: 'width',  label: 'W', step: 0.1 },
        { key: 'height', label: 'H', step: 0.1 },
      ];
    case 'turntable':
      return [
        { key: 'radius', label: 'R', step: 0.05 },
        { key: 'height', label: 'H', step: 0.05 },
      ];
    case 'conveyor':
      return [
        { key: 'length', label: 'L', step: 0.5 },
      ];
    case 'safety_fence':
      return [
        { key: 'length', label: 'L', step: 0.5 },
        { key: 'height', label: 'H', step: 0.1 },
      ];
    case 'pallet':
      return [
        { key: 'length', label: 'L', step: 0.1 },
        { key: 'width',  label: 'W', step: 0.1 },
      ];
    case 'operator_station':
      return [
        { key: 'length', label: 'L', step: 0.1 },
        { key: 'width',  label: 'W', step: 0.1 },
        { key: 'height', label: 'H', step: 0.1 },
      ];
    default:
      return [];
  }
}

/**
 * Returns a short read-only spec string for materials (shown in list alongside length input).
 * Returns null for shapes/equipment that have no fixed cross-section spec.
 *
 * @param {string} shape      - Shape type
 * @param {object} dimensions - Dimension map
 * @returns {string|null}
 */
export function getSpecInfo(shape, dimensions) {
  switch (shape) {
    case 'ibeam':
      return `W: ${Math.round(dimensions.flangeWidth * 1000)}mm  H: ${Math.round(dimensions.webHeight * 1000)}mm`;
    case 'pipe':
      return `∅ ${Math.round(dimensions.outerDiam * 1000)}mm`;
    case 'cabletray':
      return `W: ${Math.round(dimensions.width * 1000)}mm`;
    case 'linear_track':
      return `W: ${Math.round((dimensions.width ?? 0.3) * 1000)}mm  H: ${Math.round((dimensions.height ?? 0.15) * 1000)}mm`;
    case 'conveyor':
      return `W: ${Math.round((dimensions.width ?? 0.5) * 1000)}mm  H: ${Math.round((dimensions.height ?? 0.85) * 1000)}mm`;
    case 'pallet':
      return `H: ${Math.round((dimensions.height ?? 0.144) * 1000)}mm`;
    default:
      return null;
  }
}
