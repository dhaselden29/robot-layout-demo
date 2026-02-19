/**
 * deploymentUtils.js
 *
 * Robot instance creation and grid layout calculation.
 *
 * Coordinate convention (spec):
 *   position[0] = x  — left/right on the factory floor
 *   position[1] = y  — forward/back on the factory floor
 *   position[2] = z  — height above floor (0 = floor level)
 *
 * Three.js rendering: spec [x, y, z] → Three.js [x, z, y]
 *   i.e. spec x stays x, spec y becomes Three.js z (depth),
 *   spec z becomes Three.js y (up/height).
 */

import sceneConfig from '../config/config.json';
import robotsConfig from '../config/robots_config.json';

// ─── Lookups ────────────────────────────────────────────────────────────────

/**
 * Looks up a robot model entry from robots_config.json by display name.
 *
 * @param {string} manufacturer - e.g. "Universal Robots"
 * @param {string} modelName    - display name, e.g. "UR5e"
 * @returns {Object|null}
 */
export function getRobotModelConfig(manufacturer, modelName) {
  const models = robotsConfig.manufacturers[manufacturer]?.models ?? [];
  return models.find((m) => m.name === modelName) ?? null;
}

// ─── Grid layout ────────────────────────────────────────────────────────────

/**
 * Generates a centred grid of [xOffset, yOffset] pairs (spec floor coords).
 * The grid is centred at [0, 0]; callers add the deployment origin separately.
 *
 * @param {number} count         - Number of positions (1–20)
 * @param {number} scaleValue    - Numeric scale factor
 * @param {number} approxHeight  - Approximate robot height in metres
 * @returns {Array<[number, number]>} Array of [x, y] offsets from origin
 */
export function calculateGridPositions(count, scaleValue, approxHeight) {
  const spacing =
    approxHeight *
    scaleValue *
    (sceneConfig.deployment?.gridSpacingMultiplier ?? sceneConfig.robots.gridSpacingMultiplier);

  const cols = Math.ceil(Math.sqrt(count));
  const rows = Math.ceil(count / cols);
  const totalWidth = (cols - 1) * spacing;
  const totalDepth = (rows - 1) * spacing;

  const positions = [];
  for (let i = 0; i < count; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    positions.push([
      col * spacing - totalWidth / 2,
      row * spacing - totalDepth / 2,
    ]);
  }
  return positions;
}

// ─── Snap to grid ────────────────────────────────────────────────────────────

/**
 * Snaps spec floor coordinates to the nearest grid increment.
 *
 * @param {number} x        - Spec x coordinate
 * @param {number} y        - Spec y coordinate
 * @param {number} gridSize - Grid cell size in metres (e.g. 0.5)
 * @returns {[number, number]} Snapped [x, y]
 */
export function snapToGrid(x, y, gridSize) {
  return [
    Math.round(x / gridSize) * gridSize,
    Math.round(y / gridSize) * gridSize,
  ];
}

// ─── Instance builders ───────────────────────────────────────────────────────

/**
 * Builds a single robot instance object (new Phase 3 shape).
 *
 * @param {string}   manufacturer - Manufacturer name from robots_config
 * @param {string}   modelId      - Model id, e.g. "ur5e"
 * @param {number[]} position     - Spec [x, y, z] floor coords (z=0 for floor)
 * @param {number}   scale        - Numeric scale factor
 * @param {number}   instanceNum  - Numeric id suffix for the robot
 * @param {string}   mountType    - "floor" | "platform" | "ceiling"
 * @returns {Object|null}
 */
export function loadRobot(
  manufacturer,
  modelId,
  position,
  scale,
  instanceNum = 1,
  mountType = 'floor'
) {
  const models = robotsConfig.manufacturers[manufacturer]?.models ?? [];
  const modelConfig = models.find((m) => m.id === modelId);

  if (!modelConfig) {
    console.warn(`loadRobot: no model found for ${manufacturer} / ${modelId}`);
    return null;
  }

  return {
    id: `r-${instanceNum}`,
    manufacturer,
    modelId: modelConfig.id,
    model: modelConfig.name,
    urdf: modelConfig.urdf ?? null,
    packageMap: modelConfig.packageMap ?? null,
    position,
    rotation: 0,
    scale,
    label: `${manufacturer} ${modelConfig.name} #${instanceNum}`,
    approxHeight: modelConfig.approxHeight,
    mountType,
    colorOverride: null,
    opacity: 1.0,
  };
}

/**
 * Builds an array of robot instances for a Deploy action.
 *
 * Robots are laid out in a square grid centred on (originX, originY).
 * All robots in the group share the same heading (rotationDeg) and mountType.
 *
 * @param {string} manufacturer - Manufacturer name
 * @param {string} modelName    - Model display name, e.g. "UR5e"
 * @param {number} count        - Number of instances
 * @param {string} scaleName    - "compact" | "standard" | "large"
 * @param {number} originX      - Grid centre X in spec floor coords (default 0)
 * @param {number} originY      - Grid centre Y in spec floor coords (default 0)
 * @param {number} rotationDeg  - Heading for all robots in degrees (default 0)
 * @param {number} startId      - Starting numeric ID suffix (from store.nextRobotId)
 * @param {string} mountType    - "floor" | "platform" | "ceiling" (default "floor")
 * @param {number} originZ      - Height above floor in metres (default 0)
 * @returns {Array<Object>}     - Array of robot instance objects for addRobots()
 */
export function buildRobotInstances(
  manufacturer,
  modelName,
  count,
  scaleName,
  originX = 0,
  originY = 0,
  rotationDeg = 0,
  startId = 1,
  mountType = 'floor',
  originZ = 0
) {
  const scaleValue = sceneConfig.robots.scales[scaleName] ?? 1.0;
  const modelConfig = getRobotModelConfig(manufacturer, modelName);

  if (!modelConfig) {
    console.warn(`buildRobotInstances: unknown model ${manufacturer} / ${modelName}`);
    return [];
  }

  const offsets = calculateGridPositions(count, scaleValue, modelConfig.approxHeight);

  return offsets.map((offset, index) => ({
    id: `r-${startId + index}`,
    manufacturer,
    modelId: modelConfig.id,
    model: modelConfig.name,
    urdf: modelConfig.urdf ?? null,
    packageMap: modelConfig.packageMap ?? null,
    position: [
      Math.round((originX + offset[0]) * 100) / 100,
      Math.round((originY + offset[1]) * 100) / 100,
      originZ,
    ],
    rotation: rotationDeg,
    scale: scaleValue,
    label: `${manufacturer} ${modelConfig.name} #${startId + index}`,
    approxHeight: modelConfig.approxHeight,
    mountType,
    colorOverride: null,
    opacity: 1.0,
  }));
}
