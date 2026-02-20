/**
 * gripperUtils.js
 *
 * Utility functions for gripper geometry creation and robot model lookups.
 */

import grippersConfig from '../config/grippers_config.json';
import robotsConfig from '../config/robots_config.json';

import { build as buildVacuum } from '../scene/grippers/VacuumGripperGeom';
import { build as buildParallelJaw } from '../scene/grippers/ParallelJawGeom';
import { build as buildMagnetic } from '../scene/grippers/MagneticGripperGeom';
import { build as buildWeldingTorch } from '../scene/grippers/WeldingTorchGeom';

// Flatten all models once for lookup
const ALL_MODELS = Object.values(robotsConfig.manufacturers).flatMap((m) => m.models);

// Map gripper type → builder function
const BUILDERS = {
  vacuum: buildVacuum,
  parallel_jaw: buildParallelJaw,
  magnetic: buildMagnetic,
  welding_torch: buildWeldingTorch,
};

/**
 * Builds a Three.js Group containing the gripper geometry.
 *
 * @param {string}      gripperId     - e.g. "parallel_jaw"
 * @param {string|null} colorOverride - hex colour or null (uses config default)
 * @param {number}      opacity       - 0–1
 * @returns {THREE.Group|null}
 */
export function buildGripperGeometry(gripperId, colorOverride, opacity) {
  const config = grippersConfig.grippers.find((g) => g.id === gripperId);
  if (!config) return null;

  const builder = BUILDERS[config.type];
  if (!builder) return null;

  const color = colorOverride ?? config.color;
  return builder(config.dimensions, color, opacity);
}

/**
 * Returns the URDF last link name for a given robot model ID.
 *
 * @param {string} modelId - e.g. "ur5e", "lrmate200id", "irb120"
 * @returns {string|null}
 */
export function getLastLinkName(modelId) {
  const model = ALL_MODELS.find((m) => m.id === modelId);
  return model?.lastLinkName ?? null;
}
