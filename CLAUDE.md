# CLAUDE.md — Robot Layout Demo

**Auto-loaded by Claude Code at session start. Read this entire file before touching any code.**

Last updated: 2026-02-19 (Phase 6 complete)

---

## PROJECT OVERVIEW

Robot Layout Demo is a browser-based 3D factory floor visualisation tool built for a construction company R&D team. It allows engineers to plan the spatial layout of industrial robot arms (Universal Robots, FANUC, ABB) on a configurable factory floor, with real manufacturer mesh models loaded at runtime from URDF files. The tool runs fully locally on Apple Silicon Mac, requires no network access, and uses only free open-source libraries — no NVIDIA GPU required (WebGL via Apple Metal).

---

## CURRENT BUILD STATUS

| Phase | Description | Status |
|---|---|---|
| Phase 1 | Project scaffold, 3D scene, floor grid, camera controls, placeholder robot system, basic sidebar | **Complete** |
| Phase 2 | Real URDF robot models (UR5e, FANUC LR Mate 200iD, ABB IRB 120) loaded at runtime via urdf-loader | **Complete** |
| Phase 3 | Full control panel (4 sections), deployment to custom origin, per-robot X/Y/rotation editing, floor-click placement, camera focus animation | **Complete** |
| Phase 4 | Viewport drag-to-reposition, rotation handle, selection ring, snap-to-grid toggle, live coordinate HUD, sidebar drag button | **Complete** |
| Phase 5 | Platform/ceiling mounting, PNG image export | **Complete** |
| Phase 6 | Scene objects: shapes, equipment, materials with procedural geometry, tabbed sidebar, live dimension editing | **Complete** |
| Phase 7 | (stretch) Robot arm animation, assembly sequence validation | **Not started** |

Session date: **2026-02-19**. All Phase 1–5 tests confirmed passing by the user before Phase 6 was implemented.

---

## TECH STACK

**Runtime: Node.js 20.20.0** at `/opt/homebrew/Cellar/node@20/20.20.0/bin/`. This path must be on PATH for npm/npx to work in non-interactive shells; use full path if needed.

**Dev server:** Vite — typically starts on port 5174 but falls back to 5175, 5176, etc. if those are in use.

### Production dependencies

| Package | Version | Role in this project |
|---|---|---|
| `react` | ^19.2.0 | UI component tree; all sidebar panels are React components |
| `react-dom` | ^19.2.0 | Mounts React app to `#root` in index.html |
| `three` | ^0.183.0 | 3D engine; all geometry, materials, raycasting, and coordinate math |
| `@react-three/fiber` | ^9.5.0 | React renderer for Three.js; all 3D objects are JSX components inside `<Canvas>` |
| `@react-three/drei` | ^10.7.7 | R3F utilities: `OrbitControls`, `Text` (3D billboard labels), `useCursor` (pointer CSS) |
| `zustand` | ^5.0.11 | Global state store; single store (`sceneStore.js`) holds all robot instances and interaction state |
| `urdf-loader` | ^0.12.6 | Loads URDF XML at runtime and assembles Three.js object tree; resolves `package://` URIs via `loader.packages` map |

### Dev dependencies

| Package | Role |
|---|---|
| `vite` ^7.3.1 | Build tool and dev server; serves `public/` as static files at root |
| `@vitejs/plugin-react` | Transforms JSX and enables fast refresh |
| `tailwindcss` ^3.4.19 | Utility CSS for sidebar/HUD styling; **only used for DOM elements, never for Three.js objects** |
| `autoprefixer` + `postcss` | Required by Tailwind for CSS processing |
| `eslint` + plugins | Linting only; not enforced in CI |

---

## PROJECT STRUCTURE

```
Robot Layout Demo/
├── index.html                      Entry point; mounts #root div
├── package.json                    Dependencies (see TECH STACK section)
├── vite.config.js                  Vite config with React plugin
├── tailwind.config.js              Tailwind content paths
├── postcss.config.js               PostCSS config for Tailwind
├── eslint.config.js                ESLint rules
├── README.md                       User-facing setup and run instructions
├── SOURCES.md                      Full attribution for all 3D mesh files (BSD 3-Clause)
├── CLAUDE.md                       This file — session context for Claude Code
│
├── public/
│   └── models/                     Static robot model assets served by Vite
│       ├── fanuc/
│       │   ├── lrmate200id.urdf    Hand-written URDF for FANUC LR Mate 200iD (xacro flattened)
│       │   └── meshes/visual/      7 STL files: base_link, link_1–link_6
│       ├── abb/
│       │   ├── irb120.urdf         Hand-written URDF for ABB IRB 120 (xacro flattened)
│       │   └── meshes/visual/      7 STL files: base_link, link_1–link_6
│       └── universal_robots/
│           ├── ur5e.urdf           Hand-written URDF for UR5e (from kinematic YAML + macro xacro)
│           └── meshes/visual/      7 STL files: base, shoulder, upperarm, forearm, wrist1–wrist3
│
└── src/
    ├── main.jsx                    React entry; renders <App /> into #root with Tailwind CSS
    ├── index.css                   Tailwind base directives
    ├── App.jsx                     Top-level layout: sidebar | Canvas wrapper | status bar
    │
    ├── config/
    │   ├── config.json             All scene tunables (floor dims, camera, lighting, deployment, labels, interaction colours)
    │   └── robots_config.json      Authoritative robot model catalogue (urdf paths, packageMap, footprint, approxHeight)
    │
    ├── store/
    │   └── sceneStore.js           Single Zustand store; holds deployedRobots[], interaction mode, selection, snap flag
    │
    ├── robots/
    │   ├── RobotManager.jsx        Maps deployedRobots[] → RobotInstance; owns robotRefs map (Phase 4)
    │   ├── RobotInstance.jsx       Renders one robot: model + label + selection ring; stamps userData.robotId on subtree
    │   ├── URDFRobot.jsx           Loads real URDF+STL geometry via urdf-loader; applies coordinate correction
    │   ├── RobotLoader.jsx         STUB — loads GLB via useGLTF; falls back to placeholder; no real GLB files exist yet
    │   ├── PlaceholderRobot.jsx    Procedural geometry fallback; colour-coded by manufacturer
    │   └── SmokeTest.jsx           Dev-only hardcoded 3-robot test (disabled: SMOKE_TEST = false in RobotManager)
    │
    ├── scene/
    │   ├── SceneSetup.jsx          Ambient + directional lighting, fog, background colour
    │   ├── FloorGrid.jsx           Floor plane, 1m grid, metric labels, perimeter walls; floor onClick deselects robot
    │   ├── CameraRig.jsx           OrbitControls wrapper; handles camera reset and smooth focus lerp (useFrame)
    │   ├── FloorClickPlane.jsx     Mounts only in 'place' mode; captures one floor click → setFloorClickCoords
    │   ├── DragPlane.jsx           Always-mounted invisible plane; handles all drag + rotate pointer events via capture
    │   └── RotationHandle.jsx      Orange torus ring + grip sphere; mounts when selectedRobotId is set
    │
    ├── ui/
    │   ├── ControlPanel.jsx        Left sidebar: sections A (add robot), B (placement), C (actions), D (list), E (snap)
    │   ├── DeployedRobotList.jsx   Scrollable per-robot rows: X/Y inputs, rotation slider, drag/focus/remove buttons
    │   ├── DragCoordinatesHUD.jsx  Absolute CSS overlay (outside Canvas); shows X/Y or rotation° during drag/rotate
    │   └── StatusBar.jsx           Bottom bar: robot count + floor dimensions
    │
    └── utils/
        └── deploymentUtils.js      buildRobotInstances(), calculateGridPositions(), snapToGrid(), loadRobot(), getRobotModelConfig()
```

**Stubs / incomplete files:**
- `RobotLoader.jsx` — loads GLB files. No GLB files exist in `/public/models/`. All three live robots use URDF instead (via `URDFRobot.jsx`). RobotLoader is only reached when a robot instance has a `file` field but no `urdf` field; currently no robots in robots_config.json match that condition. Do not remove it — it is the planned path for future non-URDF models.

---

## ARCHITECTURE DECISIONS

These decisions were made deliberately. Do not reverse them without explicit user instruction.

### 1. Runtime URDF loading (urdf-loader) instead of pre-conversion to GLB

**Decision:** Load URDF files at runtime via `urdf-loader` v0.12.6.
**Why:** The `urdf-to-gltf` npm package does not exist. Pre-conversion would require a Python/ROS toolchain (xacro + URDF tools). urdf-loader handles the full pipeline in the browser, including `package://` URI resolution, STL loading, and material application.
**Implication:** All robot models that have real geometry use `.urdf` + `.stl` files. The `file` / GLB path in robots_config.json is reserved for future use but currently unused by any live model.

### 2. Hand-written URDF files instead of processing xacro

**Decision:** URDF files were written manually by resolving all xacro macro variables by hand from the source YAML files.
**Why:** xacro requires ROS or a Python `xacro` package. The project must run without ROS. The xacro source files were read directly to extract kinematic parameters.
**Implication:** If the upstream ROS Industrial repos update their kinematic parameters, the hand-written URDFs will need manual updates. See SOURCES.md for which files each URDF was derived from.

### 3. Using collision STL meshes for UR5e visual geometry

**Decision:** UR5e uses the `collision/` STL files, not the `visual/` DAE files.
**Why:** The visual meshes are Collada (DAE) format, which urdf-loader does not support without an additional Collada parser. The collision STL meshes are geometrically identical to the visual meshes.
**Implication:** UR5e may appear slightly less detailed than FANUC/ABB in future when high-poly visual meshes are needed. To upgrade: acquire DAE files and add a Collada loader, or convert DAE → STL/GLB.

### 4. Spec coordinate system separate from Three.js coordinates

**Decision:** The Zustand store, sidebar UI, and all user-facing values use a "spec" coordinate system. Conversion to Three.js happens only at render time in RobotInstance.
- Spec: `position[0]` = X (left-right), `position[1]` = Y (forward-back), `position[2]` = Z (height, 0 = floor)
- Three.js: `[position[0], position[2], position[1]]`
**Why:** This keeps floor coordinates intuitive (X/Y as a floor plan), avoids Z-axis confusion for non-3D users, and matches standard factory floor coordinate conventions.
**Implication:** Every file that converts coordinates must use the same mapping. Currently only `RobotInstance.jsx` does this conversion (for rendering) and `DragPlane.jsx` (for drag-to-position calculation). If a new component reads `event.point` (Three.js world space) and writes to the store, it must apply: `specX = event.point.x`, `specY = event.point.z`.

### 5. Z-up coordinate correction inside URDFRobot

**Decision:** `URDFRobot.jsx` wraps the URDF primitive in `<group rotation={[-Math.PI/2, 0, 0]}>`.
**Why:** URDF/ROS uses Z-up (robot extends along +Z). Three.js uses Y-up. Without this correction, all robots appear horizontal (lying on their sides). The -π/2 rotation around X maps URDF +Z → Three.js +Y.
**Implication:** There are two levels of rotation on every URDF robot: the outer RobotInstance group handles world-space heading (Y axis), the inner URDFRobot group handles the coordinate system correction (X axis). Do not remove either.

### 6. `done(mesh)` not `done(group)` in urdf-loader's loadMeshCb

**Decision:** The custom `loadMeshCb` in `URDFRobot.jsx` calls `done(mesh)` with a bare `THREE.Mesh`, never wrapped in a `THREE.Group`.
**Why:** urdf-loader checks `obj instanceof THREE.Mesh` to apply the URDF-specified material colour. Wrapping in a Group skips this check, leaving all meshes with the default grey material (losing FANUC yellow, ABB orange, UR grey).

### 7. Persistent selection (selectedRobotId not cleared on drag end)

**Decision:** `DragPlane.onPointerUp` does NOT clear `selectedRobotId`. It only sets `interactionMode = 'orbit'`.
**Why:** Persistent selection allows the user to drag a robot then immediately use the rotation handle without re-clicking. Deselection only happens via floor click (`FloorGrid.onClick`) or `clearRobots()`.
**Implication:** The selection ring and rotation handle remain visible after a drag ends. This is intentional, not a bug.

### 8. Event propagation design for single-gesture drag

**Decision:** `RobotInstance.onPointerDown` does NOT call `event.stopPropagation()`. The event propagates to `DragPlane`, which then sets pointer capture.
**Why:** Stopping propagation would prevent `DragPlane` from receiving the initial press, making drag a two-step gesture (click to select, then click again to drag). Without stopPropagation, Zustand's synchronous state update (mode → 'drag') is visible to DragPlane's handler in the same event bubble, enabling single-gesture drag.
**Side effect:** `RobotInstance` adds `onClick={(e) => e.stopPropagation()}` to prevent the floor's deselect handler from firing when a robot is clicked.

### 9. useSceneStore.getState() in event handlers

**Decision:** `DragPlane.jsx` and `FloorGrid.jsx` call `useSceneStore.getState()` inside event handlers rather than using React hook subscriptions.
**Why:** React hook values captured in closures can be stale by the time an event handler fires (especially in the same event bubble as a state update). `getState()` reads the current Zustand state synchronously, bypassing React's async re-render cycle. This is the correct Zustand pattern for imperative event handling.

### 10. Always-mounted DragPlane (no conditional return null)

**Decision:** `DragPlane.jsx` is always mounted and always in the raycast, unlike `FloorClickPlane` which returns null when inactive.
**Why:** For single-gesture drag to work, DragPlane must be present in the raycast at the moment the robot is clicked. If it were conditionally mounted based on `interactionMode`, it would be absent during the robot click (mode is 'orbit' at that instant), and the gesture would fail.
**Implication:** DragPlane receives `onPointerMove` events during normal orbit navigation, but handlers check `isDragging.current` and return early. Performance overhead is negligible.

### 11. robots_config.json as authoritative model catalogue, config.json for tunables

**Decision:** Two separate config files with distinct roles.
- `robots_config.json`: robot model definitions (id, name, urdf path, packageMap, footprint, approxHeight). Source of truth for what models exist.
- `config.json`: scene-wide tunables (floor dimensions, camera defaults, lighting, grid spacing, label sizes, interaction colours). Nothing robot-model-specific.
**Why:** Prevents config.json from becoming a monolith. A future session adding a new robot only touches robots_config.json.

### 12. No xacro processing / no ROS dependency

**Decision:** This project has zero dependency on ROS, Python, or any server-side processing.
**Why:** The project must run fully offline on macOS without a ROS installation. All URDF files were produced by hand-reading xacro source files and evaluating macros manually.

---

## DATA STRUCTURES

### Robot instance shape (Zustand store `deployedRobots[]`)

```javascript
{
  id:           string,    // "r-1", "r-2", ... Auto-generated by buildRobotInstances()
  manufacturer: string,    // "Universal Robots" | "FANUC" | "ABB"
  modelId:      string,    // "ur5e" | "lrmate200id" | "irb120" | "ur10e" | "m10ia" | "irb2400"
  model:        string,    // Display name: "UR5e" | "LR Mate 200iD" | "IRB 120" | ...
  urdf:         string|null, // e.g. "universal_robots/ur5e.urdf" (relative to /public/models/)
  packageMap:   object|null, // e.g. { "ur5e": "universal_robots" }
  position:     [x, y, z],  // SPEC COORDS: x=left-right, y=fwd-back, z=height (0=floor)
  rotation:     number,    // Heading in degrees around vertical axis (0–360)
  scale:        number,    // 0.5 | 1.0 | 1.5 (from config.robots.scales)
  label:        string,    // "Universal Robots UR5e #1" (displayed as 3D billboard)
  approxHeight: number,    // metres; used for label positioning and selection ring sizing
  mountType:    string,    // "floor" (only valid value in Phase 4; "platform"/"ceiling" Phase 5+)
}
```

### Full config.json

```json
{
  "floor": {
    "width": 30,
    "depth": 50,
    "gridDivisions": 50,
    "wallHeight": 4,
    "wallThickness": 0.2
  },
  "camera": {
    "defaultPosition": [25, 22, 35],
    "defaultTarget": [0, 0, 0],
    "fov": 55,
    "near": 0.1,
    "far": 500,
    "focusDistance": 5
  },
  "scene": {
    "fogNear": 40,
    "fogFar": 120,
    "fogColor": "#c8d4e0",
    "backgroundColor": "#c8d4e0",
    "ambientLightIntensity": 0.5,
    "directionalLightIntensity": 1.0,
    "directionalLightPosition": [10, 20, 10]
  },
  "robots": {
    "maxCount": 20,
    "defaultCount": 1,
    "defaultScale": "standard",
    "scales": { "compact": 0.5, "standard": 1.0, "large": 1.5 },
    "labelHeight": 2.2,
    "labelFontSize": 0.3,
    "gridSpacingMultiplier": 1.8
  },
  "deployment": {
    "gridSpacingMultiplier": 1.5,
    "floorMargin": 2.0,
    "defaultRotationDeg": 0,
    "snapGridSize": 0.5
  },
  "labels": {
    "fontSize": 0.22,
    "verticalOffset": 1.2
  },
  "interaction": {
    "selectionRingColor": "#00aaff",
    "selectionRingOpacity": 0.6,
    "rotationHandleColor": "#ff8800",
    "rotationHandleRadius": 1.2,
    "dragPlaneY": 0.015
  },
  "manufacturers": {
    "Universal Robots": {
      "models": {
        "UR5e": { "file": "universal_robots/ur5e.glb", "approxHeight": 1.3 },
        "UR10e": { "file": "universal_robots/ur10e.glb", "approxHeight": 1.5 }
      }
    },
    "FANUC": {
      "models": {
        "LR Mate 200iD": { "file": "fanuc/lrmate200id.glb", "approxHeight": 1.0 },
        "M-10iA": { "file": "fanuc/m10ia.glb", "approxHeight": 1.6 }
      }
    },
    "ABB": {
      "models": {
        "IRB 120": { "file": "abb/irb120.glb", "approxHeight": 0.9 },
        "IRB 2400": { "file": "abb/irb2400.glb", "approxHeight": 1.8 }
      }
    }
  }
}
```

**Note:** The `manufacturers` section in `config.json` is a legacy remnant from Phase 1 and is NOT used at runtime. The authoritative model catalogue is `robots_config.json`. Do not confuse the two files.

### robots_config.json structure (one entry shown in full)

```json
{
  "manufacturers": {
    "Universal Robots": {
      "models": [
        {
          "id": "ur5e",
          "name": "UR5e",
          "urdf": "universal_robots/ur5e.urdf",
          "packageMap": { "ur5e": "universal_robots" },
          "defaultScale": 1.0,
          "footprint_m": [0.149, 0.149],
          "reach_mm": 850,
          "payload_kg": 5,
          "type": "articulated_arm",
          "approxHeight": 1.3
        },
        {
          "id": "ur10e",
          "name": "UR10e",
          "urdf": null,
          "packageMap": null,
          "defaultScale": 1.0,
          "footprint_m": [0.190, 0.190],
          "reach_mm": 1300,
          "payload_kg": 12.5,
          "type": "articulated_arm",
          "approxHeight": 1.5,
          "note": "URDF pending — renders as placeholder"
        }
      ]
    }
    ...
  }
}
```

**When `urdf` is null:** `RobotInstance` falls through to `RobotLoader` (GLB path). Since no GLB files exist, it further falls through to `PlaceholderRobot`. This is the correct chain for stub robots.

**packageMap convention:** Keys are the ROS package name used in `package://` URIs in the URDF. Values are the subdirectory under `/public/models/`. Example: `{ "ur5e": "universal_robots" }` resolves `package://ur5e/meshes/visual/base.stl` → `/models/universal_robots/meshes/visual/base.stl`.

---

## KEY FUNCTIONS AND COMPONENTS

### `buildRobotInstances(manufacturer, modelName, count, scaleName, originX, originY, rotationDeg, startId)`
- **File:** `src/utils/deploymentUtils.js`
- **Returns:** Array of robot instance objects ready for `addRobots()`.
- **Called by:** `ControlPanel.handleDeploy()`
- **Calls:** `getRobotModelConfig()`, `calculateGridPositions()`
- **Note:** `startId` must be `useSceneStore.getState().nextRobotId` to get non-colliding IDs.

### `calculateGridPositions(count, scaleValue, approxHeight)`
- **File:** `src/utils/deploymentUtils.js`
- **Returns:** Array of `[xOffset, yOffset]` pairs in spec floor coords, centred at `[0, 0]`. Callers add origin offset.
- **Called by:** `buildRobotInstances()`

### `snapToGrid(x, y, gridSize)`
- **File:** `src/utils/deploymentUtils.js`
- **Returns:** `[snappedX, snappedY]` rounded to nearest `gridSize` increment.
- **Called by:** `DragPlane.handlePointerMove()` when `snapToGridEnabled === true`.
- **gridSize default:** `config.deployment.snapGridSize` (0.5 m). The function takes gridSize as a parameter — it does not read config itself.

### `loadRobot(manufacturer, modelId, position, scale, instanceNum)`
- **File:** `src/utils/deploymentUtils.js`
- **Returns:** Single robot instance object (Phase 3 shape with spec coords).
- **Called by:** `SmokeTest.jsx` (inactive; SMOKE_TEST = false). Use `buildRobotInstances()` for production deployments.

### `URDFRobot({ urdf, packageMap, manufacturer, approxHeight })`
- **File:** `src/robots/URDFRobot.jsx`
- **Loads:** URDF from `/models/${urdf}`, resolves `package://` via `loader.packages` built from `packageMap`.
- **Critical:** `loadMeshCb` must call `done(mesh)` with a bare `THREE.Mesh` (not `done(group)`) — urdf-loader checks `instanceof THREE.Mesh` to apply material colours.
- **Coordinate correction:** Wraps primitive in `<group rotation={[-Math.PI/2, 0, 0]}>` for ROS Z-up → Three.js Y-up.
- **Called by:** `RobotInstance.renderModel()` when `robot.urdf && robot.packageMap` are set.

### `RobotInstance({ robot, approxHeight, registerRef })`
- **File:** `src/robots/RobotInstance.jsx`
- **Phase 4:** `outerGroupRef` stamped via `traverse()` with `userData.robotId`; registered in `robotRefs` map via `registerRef`. `onPointerDown` sets selectedRobotId + mode='drag'. `onClick` calls `stopPropagation`. Selection ring renders when `selectedRobotId === robot.id`.
- **Called by:** `RobotManager` for each `deployedRobots[]` entry.

### `RobotManager()`
- **File:** `src/robots/RobotManager.jsx`
- **Phase 4:** Owns `robotRefs = useRef({})` (imperative map of id → THREE.Group) and `registerRef = useCallback(...)` passed to each `RobotInstance`. The map is NOT in Zustand — it is a plain ref.

### `DragPlane()`
- **File:** `src/scene/DragPlane.jsx`
- **Always mounted.** Handles `onPointerDown` (checks `getState()` synchronously), `onPointerMove` (drag or rotate), `onPointerUp` (releases capture, restores orbit mode).
- **Pointer capture:** `event.target.setPointerCapture(event.pointerId)` in `onPointerDown` locks all subsequent pointer events to this mesh until `releasePointerCapture` in `onPointerUp`.

### `RotationHandle()`
- **File:** `src/scene/RotationHandle.jsx`
- **Returns null** when `selectedRobotId` is null. Grip sphere position = robot position + `rotationHandleRadius * [sin(rot), cos(rot)]` in Three.js XZ plane. Grip `onPointerDown` sets mode='rotate' and propagates to DragPlane.

### `CameraRig()`
- **File:** `src/scene/CameraRig.jsx`
- **OrbitControls:** `enabled={interactionMode === 'orbit'}` — this single condition correctly disables controls in 'place', 'drag', and 'rotate' modes.
- **Focus animation:** `useFrame()` lerps camera position and controls target toward `focusTarget`. Clears `focusTarget` on completion.

### `FloorGrid()`
- **File:** `src/scene/FloorGrid.jsx`
- **Deselection:** Floor mesh `onClick` handler reads state via `useSceneStore.getState()` (no subscription) and clears `selectedRobotId` when mode is 'orbit'.

### `FloorClickPlane()`
- **File:** `src/scene/FloorClickPlane.jsx`
- **Conditional:** Returns `null` when `interactionMode !== 'place'`. When active, renders a semi-transparent blue plane. `onClick` reads `event.point.x` and `event.point.z` → spec `[x, z]` and stores in `floorClickCoords`. Then sets mode back to 'orbit'.
- **Do not modify** — its mount/unmount behaviour is intentional and does not conflict with DragPlane.

---

## COORDINATE SYSTEM

This is the most critical section. The project uses two coordinate systems simultaneously.

### Spec / store coordinates (what the UI and Zustand store use)

```
position[0] = X  — left/right on the factory floor (same axis in Three.js)
position[1] = Y  — forward/backward on the factory floor
position[2] = Z  — height above floor (0 = floor level, positive = elevated)
rotation        — degrees around the vertical axis (Y in Three.js), 0–360
```

### Three.js world coordinates (what the renderer uses)

```
Three.js X = spec X = position[0]
Three.js Y = spec Z = position[2]  (vertical/height)
Three.js Z = spec Y = position[1]  (depth/forward-back)
```

### Conversion formula (applied in RobotInstance.jsx)

```javascript
const threePos = [position[0], position[2], position[1]];
// = [spec.X,    spec.Z (height, 0),  spec.Y]
// = [three.X,   three.Y (up),        three.Z (depth)]

const threeRot = [0, rotation * Math.PI / 180, 0];
// rotation is degrees → radians, applied around Three.js Y axis (vertical)
```

### DragPlane coordinate reading (when dragging)

```javascript
// event.point is Three.js world space:
const newSpecX = event.point.x;          // Three.js X = spec X
const newSpecY = event.point.z;          // Three.js Z = spec Y
// Store: [newSpecX, newSpecY, 0]
```

### URDF coordinate correction (inside URDFRobot.jsx)

ROS/URDF uses Z-up: robot arms extend along +Z. Three.js uses Y-up.

```jsx
<group rotation={[-Math.PI / 2, 0, 0]}>
  <primitive object={robotObject} />
</group>
```

This -π/2 rotation around X maps URDF +Z → Three.js +Y, making robots stand upright. This is INSIDE the RobotInstance outer group, which handles world-space position/rotation BEFORE this correction is applied.

### Floor geometry

- Floor mesh: centred at world origin `[0, 0, 0]`, at `y = -0.01` (slightly below zero to prevent z-fighting with the grid)
- Floor extent: X ∈ [-15, +15], Z ∈ [-25, +25] (30m × 50m)
- DragPlane sits at `y = 0.015` (above floor to receive raycasts before floor mesh)
- FloorClickPlane also at `y = 0.015`

---

## INTERACTION MODE SYSTEM

### State machine

```
interactionMode: 'orbit' | 'place' | 'drag' | 'rotate'
```

Stored in `sceneStore.js`. Changed via `setInteractionMode(mode)`.

| Mode | OrbitControls | Who enters | Who exits | What happens |
|---|---|---|---|---|
| `'orbit'` | **ENABLED** | DragPlane.onPointerUp, FloorClickPlane.onClick, ControlPanel cancel button | — | Default; camera orbits freely |
| `'place'` | disabled | ControlPanel "Pick from Floor" button | FloorClickPlane.onClick (after click) or same button again | Blue overlay appears; next floor click → coords → ControlPanel X/Y inputs |
| `'drag'` | disabled | RobotInstance.onPointerDown | DragPlane.onPointerUp | DragPlane tracks pointer to reposition robot |
| `'rotate'` | disabled | RotationHandle grip.onPointerDown | DragPlane.onPointerUp | DragPlane calculates angle from robot centre to cursor |

### OrbitControls coupling

```jsx
// CameraRig.jsx
<OrbitControls enabled={interactionMode === 'orbit'} ... />
```

This single condition covers all four modes. No other changes to CameraRig are needed for Phase 5.

### Files that READ interactionMode

- `CameraRig.jsx` — subscribes via hook (controls enabled/disabled)
- `DragPlane.jsx` — reads via `getState()` in handlers (does not subscribe)
- `FloorClickPlane.jsx` — subscribes via hook (mounts/unmounts)
- `RobotInstance.jsx` — reads via `getState()` in onPointerDown handler
- `ControlPanel.jsx` — subscribes via hook (button label changes)
- `DragCoordinatesHUD.jsx` — subscribes via hook (show/hide)

### Files that WRITE interactionMode

- `ControlPanel.jsx` (via setInteractionMode: 'place' ↔ 'orbit')
- `RobotInstance.jsx` (onPointerDown → 'drag')
- `RotationHandle.jsx` (grip onPointerDown → 'rotate')
- `DragPlane.jsx` (onPointerUp → 'orbit')
- `FloorClickPlane.jsx` (onClick → 'orbit')
- `DeployedRobotList.jsx` (drag button → 'drag')
- `sceneStore.clearRobots()` (→ 'orbit')

---

## ROBOT MODEL PIPELINE

### How a robot goes from source files to screen

1. **Source:** URDF XML file in `public/models/[manufacturer]/[model_id].urdf`
2. **Loading:** `URDFRobot.jsx` creates a `new URDFLoader()` and calls `loader.load('/models/' + urdf, ...)`
3. **Mesh resolution:** For each `<mesh filename="package://pkg/path/to/file.stl">`, `loader.packages` maps `pkg` → `/models/[subdir]`, resolving to a URL Vite can serve
4. **STL loading:** `loadMeshCb` uses `STLLoader` to load each STL, creates a `THREE.Mesh` with `MeshPhongMaterial`, calls `done(mesh)`
5. **Material:** urdf-loader detects `instanceof THREE.Mesh` and sets `mesh.material` to the colour specified in the URDF's `<material>` element
6. **Assembly:** urdf-loader builds the full joint tree as a `URDFRobot extends THREE.Object3D`
7. **Coordinate correction:** Wrapped in `<group rotation={[-Math.PI/2, 0, 0]}>` in URDFRobot.jsx
8. **Positioning:** RobotInstance's outer group applies world position and Y-axis rotation

### URDF files and their sources

| File | Source | Key derivation notes |
|---|---|---|
| `public/models/fanuc/lrmate200id.urdf` | `fanuc_lrmate200id_support/urdf/lrmate200id_macro.xacro` | `${prefix}` → empty string; `${radians(x)}` evaluated numerically; all joint axes preserved from xacro |
| `public/models/abb/irb120.urdf` | `abb_irb120_support/urdf/irb120_3_58_macro.xacro` | Same flattening; angles already in radians in source |
| `public/models/universal_robots/ur5e.urdf` | `ur_macro.xacro` + `physical_parameters.yaml` + `default_kinematics.yaml` | **Critical:** `base_link_inertia` intermediate link MUST exist with fixed joint (rpy="0 0 π"). All joint axes are `0 0 1`. Visual origin offsets: upper_arm `xyz="0 0 0.138"`, forearm `xyz="0 0 0.007"`. Wrist visual offsets: wrist_1 `-0.127`, wrist_2 `-0.0997`, wrist_3 `-0.0989` along Z. |

### Models that are stubs (PlaceholderRobot)

| Robot | modelId | Reason |
|---|---|---|
| UR10e | `ur10e` | URDF not yet written; `urdf: null` in robots_config.json |
| FANUC M-10iA | `m10ia` | URDF not yet written; `urdf: null` |
| ABB IRB 2400 | `irb2400` | URDF not yet written; `urdf: null` |

To activate a stub: write the URDF, copy STL meshes, set `urdf` and `packageMap` in robots_config.json, test with SMOKE_TEST = true.

---

## KNOWN ISSUES AND WORKAROUNDS

### 1. UR5e zero-pose looks unusual (arm extended straight up)

All URDF joints default to 0 radians. For UR5e, all-zeros means the arm extends fully upward. This is kinematically correct but looks odd in a layout demo. A `defaultPose` feature (call `robot.setJointValues({...})` after load) was discussed but explicitly deferred. The correct joint values for a "compact home" pose were not determined.

### 2. config.json `manufacturers` section is unused dead code

The `manufacturers` section in `config.json` was created in Phase 1 and is superseded by `robots_config.json`. It is not imported anywhere meaningful. Do not add to it — add new robots to `robots_config.json` only.

### 3. DragPlane receives onPointerMove in orbit mode

Because DragPlane is always mounted and always in the raycast, R3F fires its `onPointerMove` handler whenever the cursor moves over the floor in any mode. The handler checks `isDragging.current` and returns immediately when false. Acceptable overhead with ≤20 robots.

### 4. No pointer capture from sidebar drag button

When the user clicks the ⤢ drag button in the sidebar (not in the viewport), `interactionMode` is set to 'drag' and `selectedRobotId` is set. The user must then press (pointerdown) on the floor to start the actual drag. This is a two-step gesture for sidebar-initiated drag: button click → viewport press+drag. This is the intended behaviour.

### 5. Dev server port varies

Port 5174 is the target but the server falls back to 5175, 5176, etc. if occupied. Check the terminal output for the actual port. The README documents 5174 but may be incorrect if another session is running.

### 6. Node not on default shell PATH

Node 20.20.0 is at `/opt/homebrew/Cellar/node@20/20.20.0/bin/`. In non-interactive shells (as Claude Code uses), this path is not automatically on PATH. Any `npm` or `node` Bash commands must either export PATH or use the full path:
```bash
export PATH="/opt/homebrew/Cellar/node@20/20.20.0/bin:$PATH"
```

### 7. RobotLoader.jsx is unreachable in current configuration

`RobotLoader` is only used when a robot instance has a `file` but no `urdf`. No robot in `robots_config.json` currently matches this condition (live robots have URDF, stub robots have both null). RobotLoader is retained for the GLB pipeline when it is eventually needed.

### 8. useCursor reads interactionMode imperatively, not reactively

`useCursor(hovered && useSceneStore.getState().interactionMode === 'orbit')` calls `getState()` at render time. The cursor style updates correctly when the component re-renders (triggered by `hovered` changing), but if `interactionMode` changes while the robot is hovered without causing a re-render, the cursor might not update until the next hover event. This is an acceptable minor limitation.

---

## PHASE 4 FOUNDATIONS

All five foundation items are now complete.

| Item | Status | Location |
|---|---|---|
| **Robot state store shape** | **Complete** — Phase 3 spec shape with `selectedRobotId` and `snapToGridEnabled` added in Phase 4 | `src/store/sceneStore.js` |
| **updateRobotTransform(id, position, rotation)** | **Complete** | `src/store/sceneStore.js`, called by `DragPlane.handlePointerMove()`, `DeployedRobotList.RobotRow`, and directly via `getState()` |
| **Robot mesh refs (robotRefs map)** | **Complete** — `robotRefs = useRef({})` in `RobotManager`, populated via `registerRef` callback in each `RobotInstance.useEffect` | `src/robots/RobotManager.jsx` lines ~20–35, `src/robots/RobotInstance.jsx` useEffect for registerRef |
| **snapToGrid(x, y, gridSize)** | **Complete** — named export, pure function | `src/utils/deploymentUtils.js`, called by `DragPlane.handlePointerMove()` |
| **interactionMode flag** | **Complete** — four values: 'orbit', 'place', 'drag', 'rotate'; wired to OrbitControls, FloorClickPlane, DragPlane, RotationHandle, selection ring visibility, HUD visibility | `src/store/sceneStore.js`; consumed by 7 files (see INTERACTION MODE section) |
| **userData.robotId traverse** | **Complete** — entire Three.js subtree stamped on mount and on id change | `src/robots/RobotInstance.jsx` useEffect with `outerGroupRef.current.traverse()` |

---

## WHAT THE NEXT SESSION SHOULD DO FIRST

1. **Read this entire CLAUDE.md file.** Do not skip sections.

2. **Read these files** in this order, as they are most likely to have changed between sessions:
   - `src/store/sceneStore.js` — store shape and available actions (robots + scene objects)
   - `src/config/equipment_config.json` — scene object catalogue (Phase 6)
   - `src/config/robots_config.json` — which robots are live vs stub
   - `src/config/config.json` — all tunable values
   - `src/robots/RobotInstance.jsx` — rendering + Phase 4/5 wiring
   - `src/scene/DragPlane.jsx` — drag/rotate unified entity logic (Phase 6)
   - `src/scene/SceneObjectInstance.jsx` — object rendering (Phase 6)

3. **Ask the user:**
   - "Which phase are we working on?"
   - "Have you made any changes to the code since the last session on 2026-02-19?"
   - "Are there any Phase 6 test results I should know about before proceeding?"

4. **Do not assume** Phase 7 is the next task. The user may want to polish Phase 6, fix a bug, or change requirements.

5. **Run the dev server** with:
   ```bash
   export PATH="/opt/homebrew/Cellar/node@20/20.20.0/bin:$PATH"
   cd "/Users/davidhaselden/Documents/Claude Code Projects/Robot Layout Demo"
   node node_modules/.bin/vite
   ```
   Note the actual port in the terminal output (target 5174, may fall back).

---

## SOURCES AND LICENSES

*(Full copy of SOURCES.md — preserved here in case SOURCES.md is accidentally deleted)*

### Current Status

| Robot | Manufacturer | Status | Format |
|---|---|---|---|
| UR5e | Universal Robots | **Live — real STL meshes + custom URDF** | URDF + STL |
| UR10e | Universal Robots | Placeholder geometry | Procedural |
| LR Mate 200iD | FANUC | **Live — real STL meshes + custom URDF** | URDF + STL |
| M-10iA | FANUC | Placeholder geometry | Procedural |
| IRB 120 | ABB | **Live — real STL meshes + custom URDF** | URDF + STL |
| IRB 2400 | ABB | Placeholder geometry | Procedural |

### FANUC LR Mate 200iD

- **Source repository:** https://github.com/ros-industrial/fanuc (noetic-devel branch)
- **Package:** `fanuc_lrmate200id_support`
- **Date acquired:** 2026-02-19
- **License:** BSD 3-Clause
- **Copyright:** Copyright (c) 2012-2021, Southwest Research Institute (SwRI). All rights reserved.
- **Mesh files:** `fanuc_lrmate200id_support/meshes/lrmate200id/visual/` — base_link.stl, link_1–link_6.stl
- **Placed at:** `public/models/fanuc/meshes/visual/`
- **URDF source:** `fanuc_lrmate200id_support/urdf/lrmate200id_macro.xacro` (xacro flattened to plain URDF)
- **URDF placed at:** `public/models/fanuc/lrmate200id.urdf`
- **Mesh modifications:** None — original STL files, unmodified

### ABB IRB 120

- **Source repository:** https://github.com/ros-industrial/abb (noetic-devel branch)
- **Package:** `abb_irb120_support`
- **Date acquired:** 2026-02-19
- **License:** BSD 3-Clause
- **Copyright:** Copyright (c) 2012-2021, Southwest Research Institute (SwRI). All rights reserved.
- **Mesh files:** `abb_irb120_support/meshes/irb120_3_58/visual/` — base_link.stl, link_1–link_6.stl
- **Placed at:** `public/models/abb/meshes/visual/`
- **URDF source:** `abb_irb120_support/urdf/irb120_3_58_macro.xacro` (xacro flattened to plain URDF)
- **URDF placed at:** `public/models/abb/irb120.urdf`
- **Mesh modifications:** None — original STL files, unmodified

### Universal Robots UR5e

- **Source repository:** https://github.com/ros-industrial/universal_robot (noetic-devel branch)
- **Package:** `ur_description`
- **Date acquired:** 2026-02-19
- **License:** BSD 3-Clause
- **Copyright:** Copyright (c) 2009-2021, Universal Robots A/S. All rights reserved.
- **Mesh files used:** `ur_description/meshes/ur5e/collision/` — base.stl, shoulder.stl, upperarm.stl, forearm.stl, wrist1.stl, wrist2.stl, wrist3.stl
- **Why collision meshes:** Visual meshes are DAE (Collada) format; collision STL meshes are geometrically identical. Collada parser not available in this stack.
- **Placed at:** `public/models/universal_robots/meshes/visual/`
- **URDF source:** Written from scratch using `ur_macro.xacro`, `physical_parameters.yaml` (shoulder_offset=0.138m, elbow_offset=0.007m), `default_kinematics.yaml`, `visual_parameters.yaml`
- **URDF placed at:** `public/models/universal_robots/ur5e.urdf`
- **Mesh modifications:** None — original STL files, unmodified

### Placeholder Models (no attribution needed)

UR10e, FANUC M-10iA, ABB IRB 2400 — procedural geometry built from Three.js primitives; no external files used.

### License Compatibility

All live models: BSD 3-Clause. Permits internal commercial R&D use provided copyright notices are retained. Do NOT add models under CC BY-NC or other non-commercial licenses.

Acceptable licenses for future models: MIT, BSD (any clause), Apache 2.0, CC BY 4.0, CC BY-SA 4.0.

---

## SESSION LOG

### Session 1 — 2026-02-19
- **Completed Phase 1:** Vite + React + R3F project scaffold; 30×50 m factory floor with 1 m grid and perimeter walls; OrbitControls camera; procedural placeholder robot system (colour-coded boxes by manufacturer); basic 4-section sidebar (Add Robot, Placement, Actions, Deployed list); Zustand store with deployedRobots shape.
- **Completed Phase 2:** Runtime URDF loading via urdf-loader v0.12.6; hand-written URDF files for UR5e, FANUC LR Mate 200iD, and ABB IRB 120 (xacro macros evaluated by hand from ROS Industrial source YAMLs); STL mesh loading via Three.js STLLoader; URDF Z-up → Three.js Y-up coordinate correction (`-π/2` around X) inside URDFRobot; `done(mesh)` pattern to preserve urdf-loader material colour application.
- **Completed Phase 3:** Full control panel (manufacturer/model/count/scale dropdowns; X/Y/rotation deployment origin; floor-click placement via semi-transparent overlay plane; Deploy/Reset/Camera buttons); per-robot X/Y/rotation editing in deployed list; camera smooth lerp focus animation (useFrame in CameraRig); spec coordinate system (X/Y floor plan) kept separate from Three.js coords.
- **Completed Phase 4:** Viewport drag-to-reposition via always-mounted DragPlane with pointer capture (single-gesture click-drag); orange rotation handle (torus ring + grip sphere) via RotationHandle; blue selection ring on selected robot; snap-to-grid toggle (0.5 m default); DragCoordinatesHUD CSS overlay showing live X/Y or heading during drag/rotate; sidebar drag button (⤢) in deployed list; userData.robotId traversal for raycasting; robotRefs imperative map in RobotManager. All Phase 1–4 tests confirmed passing. CLAUDE.md written at end of session.
- **Key decisions this session:** Runtime URDF loading (no pre-conversion toolchain); hand-written URDFs (no ROS/xacro dependency); UR5e uses collision STLs (visual DAE not supported); spec vs Three.js coordinate split; always-mounted DragPlane (not conditional); `getState()` in event handlers to avoid stale closures; persistent selection after drag ends; event propagation NOT stopped in `RobotInstance.onPointerDown` (DragPlane must also receive the event); `robots_config.json` as authoritative model catalogue separate from `config.json` tunables.
- **Known issues discovered:** UR5e zero-pose is fully-extended upright (kinematically correct but visually odd); `config.json` `manufacturers` section is dead code from Phase 1; `RobotLoader.jsx` is unreachable in current config; dev server port varies (5174 target, falls back); Node 20 not on non-interactive shell PATH.

### Session 2 — 2026-02-19
- **Completed Phase 5:** Platform/ceiling mounting with correct 3D visuals; PNG image export via viewport screenshot.
- **Platform mounting:** Deploy robots at custom height (default 1.5 m); grey cylinder pillar rendered below robot; Z editable in deployed list; drag preserves height.
- **Ceiling mounting:** Deploy robots inverted at ceiling height (default 4.0 m = `config.floor.wallHeight`); coordinate correction flipped to `+π/2` in URDFRobot; `[π, 0, 0]` flip group for PlaceholderRobot/RobotLoader; small mounting bracket rendered above attachment point; label repositioned below robot.
- **Image export:** `preserveDrawingBuffer: true` on Canvas; `ExportCapture` (new inside-Canvas null component) watches Zustand `exportRequested` flag in `useFrame` and calls `gl.domElement.toDataURL()`; timestamped PNG filename; "Export PNG" button in Actions section.
- **Bug fixes (pre-existing, fixed as part of Phase 5):** DragPlane hardcoded `Z=0` during drag (now preserves `robot.position[2]`); DragPlane mesh at fixed floor Y (now tracks selected robot height via `useFrame` + `meshRef`); RotationHandle torus/grip hardcoded at floor level (now uses `robot.position[2]` as Y base).
- **UI additions:** Mount type toggle (Floor / Platform / Ceiling) in Placement section; conditional height input; mount type badge per robot in deployed list (grey/teal/purple); Z input for non-floor robots in deployed list.
- **Key decisions this session:** Mount type is set at deploy time only — no post-deployment type change (remove + redeploy); ceiling height defaults to `config.floor.wallHeight`, overridable; `useFrame` for dynamic drag plane Y (idiomatic R3F imperative update pattern); `ExportCapture` inside Canvas (only place with access to `gl` via `useThree`).
- **Known issues discovered:** None new. Three pre-existing DragPlane/RotationHandle elevation bugs resolved.

### Session 3 — 2026-02-19
- **Completed Phase 6:** Scene objects (shapes, equipment, materials) deployed via a new Equipment tab alongside robots; full drag/rotate/select interaction shared with robots.
- **New config:** `src/config/equipment_config.json` — 3 categories, 18 items: Shapes (box, cylinder, sphere), Equipment (work table, platform, turntable, conveyor, safety fence, robot cell base), Materials (3× I-beam W-series, 3× pipe NPS, 3× cable tray).
- **Procedural geometry:** 6 shape components in `src/scene/shapes/` — all sit with bottom at local y=0, mounted via `SceneObjectInstance` outer group at `[spec.x, spec.z, spec.y]`. IBeamShape = 3 box meshes (bottom flange, web, top flange). PipeShape = rotated cylinder along X. CableTrayShape = 3 box meshes (bottom plate + two side walls, U-channel profile).
- **Store additions:** Parallel `sceneObjects[]` array with `nextObjectId`, `addObjects`, `removeObject`, `updateObjectTransform`, `updateObjectDimensions`, `clearObjects`, `selectedObjectId`, `setSelectedObjectId`. Selection mutual exclusion: `setSelectedRobotId` clears `selectedObjectId` and vice versa.
- **Unified DragPlane:** `resolveSelected()` helper looks in `deployedRobots` or `sceneObjects` depending on which selectedId is set; routes to `updateRobotTransform` or `updateObjectTransform` accordingly. DragPlane plane height tracks whichever entity is selected.
- **RotationHandle + HUD extended:** Both now check `selectedObjectId` as fallback when `selectedRobotId` is null; RotationHandle renders for objects as well as robots.
- **Tabbed sidebar:** ControlPanel now has ROBOT / EQUIPMENT tabs. Robot tab = all existing sections A–E. Equipment tab = EquipmentPanel (sections A–D). Tab bar sticky at top of sidebar.
- **EquipmentPanel:** Category toggle (Shapes/Equipment/Materials), item selector, editable dimension inputs (shape-dependent), count, placement (X/Y/rot/mount/height/floor-pick), Deploy + Reset Objects actions, DeployedObjectList.
- **DeployedObjectList:** Per-object row with category badge, ⤢/⊙/✕ buttons, dimension inputs (editables only + read-only spec info for materials), X/Y/Z/rot controls. Dimension changes call `updateObjectDimensions` → geometry re-renders live.
- **StatusBar:** Now shows `N robots · M objects` with teal colour for object count.
- **Key decisions this session:** No scale prop on scene objects — dimensions directly define size; no `robotRefs` map for objects (no imperative ref access needed); `resolveSelected()` pure function in DragPlane reads `getState()` directly; category toggle uses teal (vs blue for robot mount toggle) to visually differentiate; `Reset Objects` clears only `sceneObjects[]`, robots untouched; elongated objects (I-beam, pipe, cable tray, conveyor, fence) run along local X axis — rotate to orient.
- **Known issues discovered:** None. Build clean (629 modules, 0 errors).
