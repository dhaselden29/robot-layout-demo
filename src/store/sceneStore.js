/**
 * sceneStore.js
 *
 * Central Zustand store for all scene state.
 *
 * Robot instance shape (Phase 3+):
 *   {
 *     id:           string   — unique identifier, e.g. "r-1"
 *     manufacturer: string   — e.g. "Universal Robots"
 *     modelId:      string   — e.g. "ur5e"
 *     model:        string   — display name, e.g. "UR5e"
 *     urdf:         string|null — path relative to /public/models/, or null
 *     packageMap:   object|null — ROS package → /models/ subdir map
 *     position:     [x, y, z]  — spec floor coords; x=left-right, y=fwd-back, z=height (0=floor)
 *     rotation:     number      — heading in degrees around the vertical axis (Y in Three.js)
 *     scale:        number      — numeric scale factor, e.g. 1.0
 *     label:        string      — e.g. "Universal Robots UR5e #1"
 *     approxHeight: number      — approximate robot height in metres
 *     mountType:    string      — "floor" | "platform" | "ceiling" (platform/ceiling Phase 4+)
 *   }
 *
 * Scene object instance shape (Phase 6+):
 *   {
 *     id:         string    — unique identifier, e.g. "o-1"
 *     category:   string    — "shapes" | "equipment" | "materials"
 *     itemId:     string    — e.g. "work_table" | "ibeam_w6x15" | "box"
 *     name:       string    — e.g. "Work Table"
 *     shape:      string    — "box" | "cylinder" | "sphere" | "ibeam" | "pipe" | "cabletray"
 *     dimensions: object    — per-instance copy of defaultDimensions
 *     color:      string    — hex colour, e.g. "#8b8680"
 *     position:   [x, y, z] — spec floor coords; z = height
 *     rotation:   number    — heading in degrees
 *     mountType:  string    — "floor" | "platform" | "ceiling"
 *     label:      string    — e.g. "Work Table #1"
 *   }
 *
 * Coordinate convention:
 *   Spec [x, y, z] maps to Three.js [x, z, y].
 *   Sidebar/UI always shows spec x (left-right) and y (forward-back).
 *   z=0 means floor level; positive z means elevated (platform).
 *
 * Interaction modes:
 *   'orbit'  — default; OrbitControls active
 *   'place'  — FloorClickPlane captures the next click and stores coords
 *   'drag'   — DragPlane tracks pointer to reposition selected robot/object
 *   'rotate' — DragPlane tracks pointer to rotate selected robot/object
 *
 * Selection mutual exclusion (Phase 6):
 *   setSelectedRobotId clears selectedObjectId (and vice versa).
 */

import { create } from 'zustand';

const useSceneStore = create((set) => ({
  // ─── Deployed robots ──────────────────────────────────────────────────────

  deployedRobots: [],

  /** Auto-incrementing counter used to generate unique robot IDs */
  nextRobotId: 1,

  /**
   * Appends new robot instances to the scene.
   * Called by ControlPanel on "Deploy to Floor".
   * @param {Array} robots - Array of robot instance objects
   */
  addRobots: (robots) =>
    set((state) => ({
      deployedRobots: [...state.deployedRobots, ...robots],
      nextRobotId: state.nextRobotId + robots.length,
    })),

  /**
   * Removes a single robot by id. If it was selected, clears selection.
   * Also cleans up any stored joint metadata and angles for that robot.
   * @param {string} id - Robot instance id, e.g. "r-3"
   */
  removeRobot: (id) =>
    set((state) => ({
      deployedRobots: state.deployedRobots.filter((r) => r.id !== id),
      selectedRobotId: state.selectedRobotId === id ? null : state.selectedRobotId,
      robotJointMeta: Object.fromEntries(
        Object.entries(state.robotJointMeta).filter(([k]) => k !== id)
      ),
      robotJointAngles: Object.fromEntries(
        Object.entries(state.robotJointAngles).filter(([k]) => k !== id)
      ),
    })),

  /**
   * Updates position and rotation for a single robot.
   * @param {string}   id       - Robot instance id
   * @param {number[]} position - Spec [x, y, z] floor coords
   * @param {number}   rotation - Heading in degrees
   */
  updateRobotTransform: (id, position, rotation) =>
    set((state) => ({
      deployedRobots: state.deployedRobots.map((r) =>
        r.id === id ? { ...r, position, rotation } : r
      ),
    })),

  /**
   * Updates colour override and/or opacity for a single robot.
   * Pass colorOverride: null to restore manufacturer colours.
   * @param {string} id    - Robot instance id
   * @param {object} style - { colorOverride?: string|null, opacity?: number }
   */
  updateRobotStyle: (id, style) =>
    set((state) => ({
      deployedRobots: state.deployedRobots.map((r) =>
        r.id === id ? { ...r, ...style } : r
      ),
    })),

  // ─── Robot joint control (Joints tab) ────────────────────────────────────

  /**
   * Per-robot joint metadata, populated by URDFRobot after loading.
   * Shape: { [robotId]: [{ name, type, lower, upper }] }
   * Only non-fixed joints are included. null = URDF not yet loaded.
   */
  robotJointMeta: {},

  /**
   * Stores the metadata extracted from a loaded URDF (called once per load).
   * @param {string} robotId - e.g. "r-1"
   * @param {Array}  meta    - [{ name, type, lower, upper }]
   */
  setRobotJointMeta: (robotId, meta) =>
    set((state) => ({
      robotJointMeta: { ...state.robotJointMeta, [robotId]: meta },
    })),

  /**
   * Per-robot joint angles in radians.
   * Shape: { [robotId]: { [jointName]: radians } }
   */
  robotJointAngles: {},

  /**
   * Sets a single joint angle for a robot. Triggers URDFRobot's apply effect.
   * @param {string} robotId    - e.g. "r-1"
   * @param {string} jointName  - URDF joint name, e.g. "shoulder_pan_joint"
   * @param {number} angle      - Angle in radians
   */
  setRobotJointAngle: (robotId, jointName, angle) =>
    set((state) => ({
      robotJointAngles: {
        ...state.robotJointAngles,
        [robotId]: { ...state.robotJointAngles[robotId], [jointName]: angle },
      },
    })),

  /**
   * Resets all joint angles for a robot to 0 (home position).
   * Sets each joint explicitly to 0 so URDFRobot's apply-effect iterates them
   * and calls setJointValue(name, 0) — clearing to {} would leave joints frozen.
   * @param {string} robotId - e.g. "r-1"
   */
  clearRobotJoints: (robotId) =>
    set((state) => {
      const meta = state.robotJointMeta[robotId] ?? [];
      const zeroed = Object.fromEntries(meta.map((j) => [j.name, 0]));
      return {
        robotJointAngles: { ...state.robotJointAngles, [robotId]: zeroed },
      };
    }),

  /**
   * Clears all deployed robots. Resets ID counter, selection, mode, and joint state.
   */
  clearRobots: () =>
    set({
      deployedRobots: [],
      nextRobotId: 1,
      selectedRobotId: null,
      interactionMode: 'orbit',
      robotJointMeta: {},
      robotJointAngles: {},
    }),

  // ─── Camera ───────────────────────────────────────────────────────────────

  cameraResetCount: 0,
  triggerCameraReset: () =>
    set((state) => ({ cameraResetCount: state.cameraResetCount + 1 })),

  focusTarget: null,
  setFocusTarget: (target) => set({ focusTarget: target }),

  // ─── Interaction mode ─────────────────────────────────────────────────────

  /**
   * Controls viewport interaction behaviour.
   *   'orbit'  — OrbitControls active (default)
   *   'place'  — FloorClickPlane captures the next click
   *   'drag'   — DragPlane repositions the selected robot
   *   'rotate' — DragPlane rotates the selected robot
   */
  interactionMode: 'orbit',
  setInteractionMode: (mode) => set({ interactionMode: mode }),

  /**
   * Most-recent floor-click position in spec coords [x, y].
   * ControlPanel consumes this then clears it.
   */
  floorClickCoords: null,
  setFloorClickCoords: (coords) => set({ floorClickCoords: coords }),

  // ─── Selection (Phase 4 / Phase 6) ───────────────────────────────────────

  /**
   * ID of the currently selected robot, or null.
   * Drives the selection ring, rotation handle, and HUD display.
   * Persists after drag ends; cleared by floor click or scene reset.
   * Phase 6: setting this clears selectedObjectId (mutual exclusion).
   */
  selectedRobotId: null,
  setSelectedRobotId: (id) => set({ selectedRobotId: id, selectedObjectId: null }),

  // ─── Snap to grid (Phase 4) ───────────────────────────────────────────────

  /**
   * When true, drag positions snap to the grid defined by
   * config.deployment.snapGridSize.
   */
  snapToGridEnabled: false,
  setSnapToGridEnabled: (val) => set({ snapToGridEnabled: val }),

  // ─── Image export (Phase 5) ───────────────────────────────────────────────

  /**
   * When true, ExportCapture (inside Canvas) will download a PNG on the next
   * rendered frame, then clear this flag.
   */
  exportRequested: false,
  triggerExport: () => set({ exportRequested: true }),
  clearExportRequest: () => set({ exportRequested: false }),

  // ─── Scene objects (Phase 6) ──────────────────────────────────────────────

  sceneObjects: [],

  /** Auto-incrementing counter for unique object IDs */
  nextObjectId: 1,

  /**
   * Appends new scene object instances to the scene.
   * @param {Array} objects - Array of scene object instances
   */
  addObjects: (objects) =>
    set((state) => ({
      sceneObjects: [...state.sceneObjects, ...objects],
      nextObjectId: state.nextObjectId + objects.length,
    })),

  /**
   * Removes a single scene object by id. Clears selection if it was selected.
   * @param {string} id - e.g. "o-3"
   */
  removeObject: (id) =>
    set((state) => ({
      sceneObjects: state.sceneObjects.filter((o) => o.id !== id),
      selectedObjectId: state.selectedObjectId === id ? null : state.selectedObjectId,
    })),

  /**
   * Updates position and rotation for a single scene object.
   * @param {string}   id       - Object instance id
   * @param {number[]} position - Spec [x, y, z]
   * @param {number}   rotation - Heading in degrees
   */
  updateObjectTransform: (id, position, rotation) =>
    set((state) => ({
      sceneObjects: state.sceneObjects.map((o) =>
        o.id === id ? { ...o, position, rotation } : o
      ),
    })),

  /**
   * Updates dimension overrides for a single scene object.
   * @param {string} id         - Object instance id
   * @param {object} dimensions - Partial or full dimension map
   */
  updateObjectDimensions: (id, dimensions) =>
    set((state) => ({
      sceneObjects: state.sceneObjects.map((o) =>
        o.id === id ? { ...o, dimensions: { ...o.dimensions, ...dimensions } } : o
      ),
    })),

  /**
   * Updates colour and/or opacity for a single scene object.
   * @param {string} id     - Object instance id
   * @param {object} style  - { color?: string, opacity?: number }
   */
  updateObjectStyle: (id, style) =>
    set((state) => ({
      sceneObjects: state.sceneObjects.map((o) =>
        o.id === id ? { ...o, ...style } : o
      ),
    })),

  /**
   * Clears only scene objects. Robots are untouched.
   */
  clearObjects: () =>
    set({
      sceneObjects: [],
      nextObjectId: 1,
      selectedObjectId: null,
    }),

  /**
   * ID of the currently selected scene object, or null.
   * Phase 6: setting this clears selectedRobotId (mutual exclusion).
   */
  selectedObjectId: null,
  setSelectedObjectId: (id) => set({ selectedObjectId: id, selectedRobotId: null }),

  // ─── Scene persistence ────────────────────────────────────────────────────

  /**
   * Restores a full scene from a previously saved JSON blob.
   * Resets all ephemeral state (selection, mode, camera triggers, joint meta).
   * Joint meta is repopulated by URDFRobot components as they reload.
   * Joint angles are restored so models settle into saved poses once loaded.
   */
  restoreScene: (data) =>
    set({
      deployedRobots:    data.deployedRobots    ?? [],
      sceneObjects:      data.sceneObjects      ?? [],
      nextRobotId:       data.nextRobotId       ?? 1,
      nextObjectId:      data.nextObjectId      ?? 1,
      robotJointAngles:  data.robotJointAngles  ?? {},
      robotJointMeta:    {},
      selectedRobotId:   null,
      selectedObjectId:  null,
      interactionMode:   'orbit',
      snapToGridEnabled: data.snapToGridEnabled ?? false,
      showLabels:        data.showLabels        ?? true,
    }),

  // ─── Label visibility ─────────────────────────────────────────────────────

  showLabels: true,
  setShowLabels: (val) => set({ showLabels: val }),

  // ─── Overhead view (counter pattern like cameraResetCount) ────────────────

  overheadViewCount: 0,
  triggerOverheadView: () =>
    set((state) => ({ overheadViewCount: state.overheadViewCount + 1 })),

  // ─── Sidebar tab (Changes 1+2) ────────────────────────────────────────────

  /**
   * Controls which tab is active in the sidebar. Stored globally so any
   * component can switch tabs (e.g. "Mount Robot Here" switches to robot tab).
   */
  activeSidebarTab: 'robot',
  setActiveSidebarTab: (tab) => set({ activeSidebarTab: tab }),

  // ─── Mount-on-object target (Change 2) ───────────────────────────────────

  /**
   * Set when the user clicks "Mount Robot Here" in DeployedObjectList.
   * ControlPanel robot section consumes this to pre-fill X/Y/Z/mountType
   * and immediately clears it after applying.
   * Shape: { label: string, x: number, y: number, z: number } | null
   */
  pendingMountTarget: null,
  setPendingMountTarget: (target) => set({ pendingMountTarget: target }),
  clearPendingMountTarget: () => set({ pendingMountTarget: null }),
}));

export default useSceneStore;
