/**
 * demoScenes.js
 *
 * Built-in demo scenes bundled with the app. These appear in the SAVES tab
 * for all users regardless of localStorage state. They cannot be deleted
 * (only exported or loaded).
 */

// Helper to build a robot instance
function robot(id, manufacturer, modelId, model, urdf, packageMap, position, rotation, approxHeight, label) {
  return {
    id, manufacturer, modelId, model, urdf, packageMap,
    position, rotation, scale: 1, label, approxHeight,
    mountType: 'floor', colorOverride: null, opacity: 1,
  };
}

// Helper to build a scene object instance
function obj(id, category, itemId, name, shape, dimensions, color, position, rotation, label, opacity) {
  return {
    id, category, itemId, name, shape, dimensions, color,
    opacity: opacity ?? 1.0,
    position, rotation, mountType: 'floor', label,
  };
}

// ─── Scene 1: ABB Welding Cell ──────────────────────────────────────────────
// 4 ABB IRB 2400 robots in a rectangle, work table with materials at centre,
// conveyors and pallets on the perimeter.

const abbWeldingCell = {
  version: 1,
  savedAt: '2026-02-20T12:00:00.000Z',
  deployedRobots: [
    robot('r-1', 'ABB', 'irb2400', 'IRB 2400', 'abb/irb2400.urdf',
      { abb_irb2400: 'abb/irb2400' }, [-2.5, -1.5, 0], 45, 1.8, 'ABB IRB 2400 #1'),
    robot('r-2', 'ABB', 'irb2400', 'IRB 2400', 'abb/irb2400.urdf',
      { abb_irb2400: 'abb/irb2400' }, [2.5, -1.5, 0], 315, 1.8, 'ABB IRB 2400 #2'),
    robot('r-3', 'ABB', 'irb2400', 'IRB 2400', 'abb/irb2400.urdf',
      { abb_irb2400: 'abb/irb2400' }, [2.5, 1.5, 0], 225, 1.8, 'ABB IRB 2400 #3'),
    robot('r-4', 'ABB', 'irb2400', 'IRB 2400', 'abb/irb2400.urdf',
      { abb_irb2400: 'abb/irb2400' }, [-2.5, 1.5, 0], 135, 1.8, 'ABB IRB 2400 #4'),
  ],
  sceneObjects: [
    // Work table at centre
    obj('o-1', 'equipment', 'work_table', 'Work Table', 'work_table',
      { length: 2.0, width: 1.0, height: 0.9 }, '#8b8680', [0, 0, 0], 0, 'Work Table #1'),
    // I-beam on work table
    obj('o-2', 'materials', 'ibeam_w6x15', 'I-Beam W6\u00d715', 'ibeam',
      { length: 1.8, flangeWidth: 0.152, webHeight: 0.152, flangeThick: 0.0107, webThick: 0.0069 },
      '#6b6b6b', [-0.3, 0, 0.9], 0, 'I-Beam W6\u00d715 #2'),
    // Pipe on work table
    obj('o-3', 'materials', 'pipe_4in', 'Pipe NPS 4"', 'pipe',
      { length: 1.6, outerDiam: 0.1143, wallThick: 0.006 },
      '#808080', [0.3, 0.25, 0.9], 90, 'Pipe NPS 4" #3'),
    // Cable tray on work table
    obj('o-4', 'materials', 'cabletray_300', 'Cable Tray 300mm', 'cabletray',
      { length: 1.8, width: 0.30, height: 0.05, wallThick: 0.003 },
      '#c0c0c0', [0.3, -0.25, 0.9], 0, 'Cable Tray 300mm #4'),
    // Input conveyor
    obj('o-5', 'equipment', 'conveyor', 'Conveyor', 'conveyor',
      { length: 4.0, width: 0.6, height: 0.85 }, '#4a7040', [0, -4.5, 0], 0, 'Conveyor #5'),
    // Output pallet
    obj('o-6', 'equipment', 'eur_pallet', 'EUR Pallet', 'pallet',
      { length: 1.2, width: 0.8, height: 0.144 }, '#c4a55a', [-4.5, 0, 0], 0, 'EUR Pallet #6'),
  ],
  nextRobotId: 5,
  nextObjectId: 7,
  robotJointAngles: {},
  snapToGridEnabled: false,
  showLabels: true,
};

// ─── Scene 2: FANUC Machine Tending Cell ────────────────────────────────────
// 2 FANUC M-10iA robots on a linear track, fixture table, turntable,
// safety fencing around the perimeter, pallets for input/output.

const fanucMachineTending = {
  version: 1,
  savedAt: '2026-02-20T12:00:01.000Z',
  deployedRobots: [
    robot('r-1', 'FANUC', 'm10ia', 'M-10iA', 'fanuc/m10ia.urdf',
      { fanuc_m10ia: 'fanuc/m10ia' }, [-2, 0, 0], 90, 1.6, 'FANUC M-10iA #1'),
    robot('r-2', 'FANUC', 'm10ia', 'M-10iA', 'fanuc/m10ia.urdf',
      { fanuc_m10ia: 'fanuc/m10ia' }, [2, 0, 0], 270, 1.6, 'FANUC M-10iA #2'),
  ],
  sceneObjects: [
    // Linear track between the two robots
    obj('o-1', 'tracks', 'fanuc_rtu', 'FANUC RTU Gen VI', 'linear_track',
      { length: 5.0, width: 0.35, height: 0.16, carriageLength: 0.55, carriageWidth: 0.40 },
      '#f9a825', [0, -2, 0], 0, 'FANUC RTU Gen VI #1'),
    // Fixture table in the centre
    obj('o-2', 'equipment', 'fixture_table', 'Fixture Table', 'work_table',
      { length: 1.5, width: 1.0, height: 0.85 }, '#5a6a5a', [0, 0, 0], 0, 'Fixture Table #2'),
    // Turntable for part rotation
    obj('o-3', 'equipment', 'turntable', 'Turntable', 'turntable',
      { radius: 0.6, height: 0.12 }, '#5a7a8c', [0, 2, 0], 0, 'Turntable #3'),
    // Safety fence — front
    obj('o-4', 'equipment', 'safety_fence', 'Safety Fence', 'safety_fence',
      { length: 6.0, width: 0.05, height: 1.4 }, '#e8a020', [0, -3.5, 0], 0, 'Safety Fence #4'),
    // Safety fence — back
    obj('o-5', 'equipment', 'safety_fence', 'Safety Fence', 'safety_fence',
      { length: 6.0, width: 0.05, height: 1.4 }, '#e8a020', [0, 3.5, 0], 0, 'Safety Fence #5'),
    // Input pallet
    obj('o-6', 'equipment', 'eur_pallet', 'EUR Pallet', 'pallet',
      { length: 1.2, width: 0.8, height: 0.144 }, '#c4a55a', [-4, -2, 0], 0, 'EUR Pallet #6'),
    // Output pallet
    obj('o-7', 'equipment', 'eur_pallet', 'EUR Pallet', 'pallet',
      { length: 1.2, width: 0.8, height: 0.144 }, '#c4a55a', [4, -2, 0], 0, 'EUR Pallet #7'),
  ],
  nextRobotId: 3,
  nextObjectId: 8,
  robotJointAngles: {},
  snapToGridEnabled: false,
  showLabels: true,
};

// ─── Scene 3: Collaborative Assembly Line ───────────────────────────────────
// UR cobots along a conveyor line with work tables, an operator station,
// and safety fencing on one side.

const collaborativeAssembly = {
  version: 1,
  savedAt: '2026-02-20T12:00:02.000Z',
  deployedRobots: [
    robot('r-1', 'Universal Robots', 'ur5e', 'UR5e', 'universal_robots/ur5e.urdf',
      { ur5e: 'universal_robots' }, [-3, -1.2, 0], 0, 1.3, 'UR5e #1'),
    robot('r-2', 'Universal Robots', 'ur10e', 'UR10e', 'universal_robots/ur10e.urdf',
      { ur10e: 'universal_robots/ur10e' }, [0, -1.2, 0], 0, 1.5, 'UR10e #2'),
    robot('r-3', 'Universal Robots', 'ur5e', 'UR5e', 'universal_robots/ur5e.urdf',
      { ur5e: 'universal_robots' }, [3, -1.2, 0], 0, 1.3, 'UR5e #3'),
  ],
  sceneObjects: [
    // Main conveyor line running through the cell
    obj('o-1', 'equipment', 'conveyor', 'Conveyor', 'conveyor',
      { length: 8.0, width: 0.5, height: 0.85 }, '#4a7040', [0, 0.5, 0], 0, 'Conveyor #1'),
    // Work table at station 1
    obj('o-2', 'equipment', 'work_table', 'Work Table', 'work_table',
      { length: 1.2, width: 0.6, height: 0.9 }, '#8b8680', [-3, -2.8, 0], 0, 'Work Table #2'),
    // Work table at station 2
    obj('o-3', 'equipment', 'work_table', 'Work Table', 'work_table',
      { length: 1.2, width: 0.6, height: 0.9 }, '#8b8680', [3, -2.8, 0], 0, 'Work Table #3'),
    // Operator station at the centre
    obj('o-4', 'equipment', 'operator_station', 'Operator Station', 'operator_station',
      { length: 1.2, width: 0.7, height: 1.1 }, '#5a6a7a', [0, -3, 0], 0, 'Operator Station #4'),
    // Safety fence along the conveyor's far side
    obj('o-5', 'equipment', 'guard_rail', 'Guard Rail', 'safety_fence',
      { length: 9.0, width: 0.1, height: 1.0 }, '#e0c020', [0, 2, 0], 0, 'Guard Rail #5'),
    // Input pallet
    obj('o-6', 'equipment', 'eur_pallet', 'EUR Pallet', 'pallet',
      { length: 1.2, width: 0.8, height: 0.144 }, '#c4a55a', [-5.5, 0.5, 0], 0, 'EUR Pallet #6'),
    // Output pallet
    obj('o-7', 'equipment', 'eur_pallet', 'EUR Pallet', 'pallet',
      { length: 1.2, width: 0.8, height: 0.144 }, '#c4a55a', [5.5, 0.5, 0], 0, 'EUR Pallet #7'),
  ],
  nextRobotId: 4,
  nextObjectId: 8,
  robotJointAngles: {},
  snapToGridEnabled: false,
  showLabels: true,
};

/**
 * Map of demo scene name → scene data.
 * These are bundled with the app and always available.
 */
export const DEMO_SCENES = {
  'Demo: ABB Welding Cell': abbWeldingCell,
  'Demo: FANUC Machine Tending': fanucMachineTending,
  'Demo: Collaborative Assembly Line': collaborativeAssembly,
};
