# CLAUDE.md — Robot Layout Demo

**Auto-loaded by Claude Code at session start. Read this entire file before touching any code.**

Last updated: 2026-02-19 (Session 6 complete)

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
| Session 4 additions | Joint control (JOINTS tab, 6-axis sliders); colour/opacity per robot; label size + show/hide toggle; overhead fit-all camera; 15° rotation snap; save/load scenes to project `saves/` folder; Scenes browser tab; git repository initialised | **Complete** |
| Session 5 additions | 14 new robot models with real URDF+STL meshes (UR3e, UR10e, UR16e, UR20, M-10iA, M-20iA, CR-7iA, M-710iC/50, CRX-10iA/L, IRB 1200, IRB 2400, IRB 2600, CRB 15000, IRB 4400L); 0 placeholders remaining; EquipmentPanel rotation snap fix | **Complete** |
| Session 6 additions | 7th-axis linear track equipment (7 tracks from ABB/FANUC/UR); 6 new procedural shape components (work table, turntable, conveyor, safety fence, pallet, operator station); 4 existing equipment items upgraded from basic box/cylinder to detailed procedural geometry; 5 new equipment items (welding positioner, fixture table, operator station, EUR pallet, guard rail); equipment_config.json now has 5 categories and 31 items total | **Complete** |
| Phase 7 | (stretch) Robot arm animation, assembly sequence validation | **Not started** |

Session date: **2026-02-19**. All Phase 1–6, Sessions 4–6 features complete. **17 live robot models, 0 placeholders. 13 procedural shape types, 5 equipment categories, 31 deployable items.**

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
| `vite` ^7.3.1 | Build tool and dev server; serves `public/` as static files at root; `vite.config.js` also contains `scenesApiPlugin()` — a custom `configureServer` middleware using Node.js `fs` to provide REST endpoints for the `saves/` folder |
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
├── vite.config.js                  Vite config with React plugin + scenesApiPlugin (Node.js fs REST API for saves/)
├── tailwind.config.js              Tailwind content paths
├── postcss.config.js               PostCSS config for Tailwind
├── eslint.config.js                ESLint rules
├── README.md                       User-facing setup and run instructions
├── SOURCES.md                      Full attribution for all 3D mesh files (BSD 3-Clause)
├── CLAUDE.md                       This file — session context for Claude Code
│
├── saves/                          Scene JSON files saved by the app (tracked by git)
│   └── .gitkeep                    Keeps the directory tracked when empty
│
├── public/
│   └── models/                     Static robot model assets served by Vite (17 models, 119 STL files)
│       ├── universal_robots/
│       │   ├── ur5e.urdf + meshes/visual/    UR5e (original, 7 STL)
│       │   ├── ur3e.urdf + ur3e/meshes/visual/    UR3e (7 STL)
│       │   ├── ur10e.urdf + ur10e/meshes/visual/  UR10e (7 STL)
│       │   ├── ur16e.urdf + ur16e/meshes/visual/  UR16e (7 STL, shared UR10e geometry)
│       │   └── ur20.urdf + ur20/meshes/visual/    UR20 (7 STL)
│       ├── fanuc/
│       │   ├── lrmate200id.urdf + meshes/visual/         LR Mate 200iD (original, 7 STL)
│       │   ├── m10ia.urdf + m10ia/meshes/visual/         M-10iA (7 STL)
│       │   ├── m20ia.urdf + m20ia/meshes/visual/         M-20iA (7 STL)
│       │   ├── cr7ia.urdf + cr7ia/meshes/visual/         CR-7iA collaborative (7 STL)
│       │   ├── m710ic50.urdf + m710ic50/meshes/visual/   M-710iC/50 (7 STL)
│       │   └── crx10ial.urdf + crx10ial/meshes/visual/  CRX-10iA/L collaborative (7 STL)
│       └── abb/
│           ├── irb120.urdf + meshes/visual/              IRB 120 (original, 7 STL)
│           ├── irb1200.urdf + irb1200/meshes/visual/     IRB 1200 (7 STL)
│           ├── irb2400.urdf + irb2400/meshes/visual/     IRB 2400 (7 STL)
│           ├── irb2600.urdf + irb2600/meshes/visual/     IRB 2600 (7 STL)
│           ├── crb15000.urdf + crb15000/meshes/visual/   CRB 15000 GoFa collaborative (7 STL)
│           └── irb4400l.urdf + irb4400l/meshes/visual/   IRB 4400L (7 STL)
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
    │   └── sceneStore.js           Single Zustand store — robots, objects, joint state, label visibility, overhead trigger, scene restore, interaction mode, selection, snap
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
    │   ├── FloorGrid.jsx           Floor plane, 1m grid, metric labels, perimeter walls; floor onClick deselects
    │   ├── CameraRig.jsx           OrbitControls; camera reset; smooth focus lerp; overhead fit-all snap
    │   ├── FloorClickPlane.jsx     Mounts only in 'place' mode; captures one floor click → setFloorClickCoords
    │   ├── DragPlane.jsx           Always-mounted invisible plane; handles drag + rotate (15° snap) via pointer capture
    │   ├── RotationHandle.jsx      Orange torus ring + grip sphere; mounts when a robot or object is selected
    │   ├── ExportCapture.jsx       Inside-Canvas null component; downloads PNG on exportRequested flag
    │   ├── SceneObjectManager.jsx  Maps sceneObjects[] → SceneObjectInstance components
    │   ├── SceneObjectInstance.jsx Renders one scene object: procedural shape + label + selection ring
    │   └── shapes/                 Procedural geometry components (13 shape types)
    │       ├── BoxShape.jsx          Basic box (used by platform, robot cell base, wall)
    │       ├── CylinderShape.jsx     Basic cylinder
    │       ├── SphereShape.jsx       Basic sphere
    │       ├── IBeamShape.jsx        I-beam profile: 3 boxes (flanges + web)
    │       ├── PipeShape.jsx         Pipe: rotated cylinder along X
    │       ├── CableTrayShape.jsx    Cable tray: U-channel (3 boxes)
    │       ├── LinearTrackShape.jsx  7th-axis linear track: base + rails + carriage + blocks + end stops (11 boxes)
    │       ├── WorkTableShape.jsx    Work table: tabletop + 4 legs + aprons + lower shelf
    │       ├── TurntableShape.jsx    Turntable/positioner: cylindrical base + pedestal + plate + crosshair marks
    │       ├── ConveyorShape.jsx     Belt conveyor: side rails + belt + legs + braces + end rollers
    │       ├── SafetyFenceShape.jsx  Safety fence: dynamic posts + rails + semi-transparent mesh panels
    │       ├── PalletShape.jsx       Pallet: 5 top boards + 3 stringers + 3 bottom boards (EUR proportions)
    │       └── OperatorStationShape.jsx  Operator station: desk + legs + HMI back panel + kick plate
    │
    ├── ui/
    │   ├── ControlPanel.jsx        Left sidebar: 4 tabs (ROBOT / EQUIP / JOINTS / SAVES) + viewport controls
    │   ├── DeployedRobotList.jsx   Per-robot rows: X/Y/Z/rot, colour picker, opacity, drag/focus/remove
    │   ├── DeployedObjectList.jsx  Per-object rows: X/Y/Z/rot, dimensions, style, drag/focus/remove
    │   ├── EquipmentPanel.jsx      Equipment tab: category/item selector, dims, placement, deploy/reset
    │   ├── JointsPanel.jsx         Joints tab: robot selector + per-axis sliders + Reset All
    │   ├── ScenesPanel.jsx         Saves tab: lists saves/*.json from API; Load / Delete per entry
    │   ├── DragCoordinatesHUD.jsx  Absolute CSS overlay (outside Canvas); shows X/Y or rotation° during drag/rotate
    │   └── StatusBar.jsx           Bottom bar: robot count + object count + floor dimensions
    │
    └── utils/
        ├── deploymentUtils.js      buildRobotInstances(), calculateGridPositions(), snapToGrid(), loadRobot(), getRobotModelConfig()
        └── objectUtils.js          getObjectLabelHeight(), getObjectTopSurface(), getEditableDimensions(), getSpecInfo() — per-shape utilities for 13 shape types
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

### 13. Joint angles stored in Zustand, not React refs or callbacks

**Decision:** `robotJointAngles[robotId]` lives in the Zustand store. `URDFRobot` subscribes via hook and applies via `useEffect`.
**Why:** Keeps joint state accessible to any component (JointsPanel, future animation system) without prop-drilling or imperative callbacks. Mirrors the same pattern used for `colorOverride` / `opacity`. Zustand's selector equality check ensures `useEffect` only fires when angles actually change.
**Implication:** The `EMPTY_JOINT_ANGLES` stable reference pattern (see next decision) is mandatory.

### 14. EMPTY_JOINT_ANGLES stable module-level reference (critical Zustand pattern)

**Decision:** `const EMPTY_JOINT_ANGLES = {}` declared at module level in `URDFRobot.jsx`; used as `robotJointAngles[robotId] ?? EMPTY_JOINT_ANGLES`.
**Why:** `?? {}` inline creates a new object on every selector call. Zustand uses `Object.is` for comparison: `Object.is({}, {}) === false` → selector always reports changed → infinite `useEffect` → React "too many re-renders" crash.
**Implication:** Any Zustand selector that may return an object fallback `?? {}` must use a stable module-level reference. This is not optional.

### 15. Vite configureServer plugin for saves/ API (not Electron, not backend)

**Decision:** Scene file I/O implemented as a custom Vite middleware plugin in `vite.config.js`, using Node.js `fs` directly.
**Why:** The project runs as a browser app with no backend. The File System Access API requires per-folder user permission prompts on every session. A Vite plugin gets Node.js filesystem access during development with zero additional tooling — no Express, no separate server process. Saves write directly to `saves/` inside the project tree, making them git-commitable.
**Implication:** The save/load API (`/api/scenes`) is **only available when `npm run dev` is running**. A production build (`npm run build`) has no API — the SAVES tab will show an error message. This is acceptable for a local R&D tool.

### 16. 15° rotation snap hardcoded, not in config.json

**Decision:** The 15° rotation snap is written directly as literals (`Math.round(angleDeg / 15) * 15` in DragPlane; `step="15"` on sliders).
**Why:** This was implemented quickly as a direct user request. Adding it to config.json was not done at the time.
**Implication:** To change the snap increment, four places must be updated: `DragPlane.jsx` line ~153, `ControlPanel.jsx` rotation slider, `DeployedRobotList.jsx` rotation slider, `DeployedObjectList.jsx` rotation slider. A future cleanup should add `rotationSnapDeg: 15` to `config.json` and reference it from all four locations. (EquipmentPanel was fixed in Session 5 — all five rotation controls now use 15° snap.)

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
  mountType:    string,    // "floor" | "platform" | "ceiling"
  colorOverride: string|null, // hex colour e.g. "#ff0000"; null = use manufacturer default colours
  opacity:      number,    // 0.0–1.0; 1.0 = fully opaque (default)
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
    "snapGridSize": 0.5,
    "platformDefaultHeight": 1.5
  },
  "labels": {
    "fontSize": 0.10,
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

### robots_config.json structure (two entries shown — original and new-style)

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
          "urdf": "universal_robots/ur10e.urdf",
          "packageMap": { "ur10e": "universal_robots/ur10e" },
          "defaultScale": 1.0,
          "footprint_m": [0.190, 0.190],
          "reach_mm": 1300,
          "payload_kg": 12.5,
          "type": "articulated_arm",
          "approxHeight": 1.5
        }
      ]
    }
    ...
  }
}
```

**All 17 models now have live URDF paths.** No models have `urdf: null`.

**If `urdf` were null:** `RobotInstance` would fall through to `RobotLoader` (GLB path). Since no GLB files exist, it further falls through to `PlaceholderRobot`. This chain exists but is currently unreachable.

**packageMap convention:** Keys are the ROS package name used in `package://` URIs in the URDF. Values are the subdirectory under `/public/models/`. Example: `{ "ur5e": "universal_robots" }` resolves `package://ur5e/meshes/visual/base.stl` → `/models/universal_robots/meshes/visual/base.stl`.

---

## KEY FUNCTIONS AND COMPONENTS

### `buildRobotInstances(manufacturer, modelName, count, scaleName, originX, originY, rotationDeg, startId, mountType, originZ)`
- **File:** `src/utils/deploymentUtils.js`
- **Returns:** Array of robot instance objects ready for `addRobots()`. Includes `colorOverride: null`, `opacity: 1.0`.
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

### `URDFRobot({ urdf, packageMap, manufacturer, approxHeight, mountType, colorOverride, opacity, robotId })`
- **File:** `src/robots/URDFRobot.jsx`
- **Loads:** URDF from `/models/${urdf}`, resolves `package://` via `loader.packages` built from `packageMap`.
- **Critical:** `loadMeshCb` must call `done(mesh)` with a bare `THREE.Mesh` (not `done(group)`) — urdf-loader checks `instanceof THREE.Mesh` to apply material colours.
- **Coordinate correction:** Floor/platform: `rotation={[-Math.PI/2, 0, 0]}`; ceiling: `rotation={[Math.PI/2, 0, 0]}`.
- **Joint meta:** After load, extracts non-fixed joints and writes `{ name, type, lower, upper }[]` to `robotJointMeta[robotId]` in store.
- **Joint apply effect:** `useEffect([robotObject, jointAngles])` calls `robotObject.setJointValue(name, angle)` for each entry.
- **Stable selector:** Uses module-level `const EMPTY_JOINT_ANGLES = {}` as fallback for `robotJointAngles[robotId] ?? EMPTY_JOINT_ANGLES`. Never use `?? {}` inline — creates new reference every render → infinite re-render loop.
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
- **OrbitControls:** `enabled={interactionMode === 'orbit'}`; `maxDistance={400}` (2× the original 200).
- **Focus animation:** `useFrame()` lerps camera position and controls target toward `focusTarget`. Clears `focusTarget` on completion.
- **Overhead view:** `useEffect([overheadViewCount])` reads `deployedRobots` + `sceneObjects` from `getState()`, computes XZ bounding box, sets camera directly above centre at `height = (halfExtent / tan(fov/2)) * 1.2`. Does not use lerp — instant snap.

### `updateRobotStyle(id, style)`
- **File:** `src/store/sceneStore.js`
- **Merges** `{ colorOverride?, opacity? }` into the matching `deployedRobots[]` entry.
- **Called by:** `DeployedRobotList.RobotRow` colour picker and opacity slider.

### `restoreScene(data)`
- **File:** `src/store/sceneStore.js`
- **Accepts** a parsed scene JSON object. Restores `deployedRobots`, `sceneObjects`, counters, `robotJointAngles`, `snapToGridEnabled`, `showLabels`. Clears all selection and ephemeral state. Resets `robotJointMeta` to `{}` — URDFRobot components repopulate it as they reload.
- **Called by:** `ScenesPanel.handleLoad()` after fetching scene from API.

### `JointsPanel()`
- **File:** `src/ui/JointsPanel.jsx`
- **Tab:** JOINTS. Shows a robot selector dropdown (syncs to viewport click via `storeSelectedRobotId` effect), then one `JointRow` per non-fixed joint from `robotJointMeta[selectedRobotId]`.
- **Placeholder robots** (no URDF): shows amber warning, no sliders.
- **Auto-selects** first deployed robot; falls back when selected robot is removed.

### `JointRow({ robotId, joint, angle })`
- **File:** `src/ui/JointsPanel.jsx`
- **Renders:** label + degree readout + ↺ reset button + `<input type="range">` (step=1°) + limit hint.
- **onChange:** converts degrees → radians, calls `setRobotJointAngle(robotId, joint.name, radians)`.

### `ScenesPanel()`
- **File:** `src/ui/ScenesPanel.jsx`
- **Tab:** SAVES. Fetches `GET /api/scenes` on mount (auto-refreshes each time tab activates due to conditional rendering). Shows scene name, save date, Load button, Delete button.
- **Load:** `GET /api/scenes/:name` → parse JSON → `restoreScene(data)`.
- **Delete:** `DELETE /api/scenes/:name` → re-fetches list.
- **Only works in dev mode** (`npm run dev`). The API is served by `scenesApiPlugin` in `vite.config.js` — not present in the built app.

### `scenesApiPlugin()` (in `vite.config.js`)
- **File:** `vite.config.js`
- **Vite plugin** using `configureServer` to add Connect middleware. Provides four endpoints:
  - `GET /api/scenes` → sorted list of `{ name, savedAt }` from `saves/*.json`
  - `POST /api/scenes` → `{ name, scene }` body → writes `saves/{safeName}.json`
  - `GET /api/scenes/:name` → returns full scene JSON
  - `DELETE /api/scenes/:name` → removes file
- **Only active during `npm run dev`**, not in the production build.

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

**Universal Robots** (5 models — all share common template with `base_link_inertia` intermediate link, all joint axes `0 0 1`):

| File | Source | Key notes |
|---|---|---|
| `universal_robots/ur5e.urdf` | `ur_macro.xacro` + `config/ur5e/` YAMLs | Original Session 2 URDF. wrist_3 visual `xyz="0 0 0"` (corrected from -0.0989). |
| `universal_robots/ur3e.urdf` | `config/ur3e/` YAMLs | d1=0.15185, a2=-0.24355, a3=-0.2132 |
| `universal_robots/ur10e.urdf` | `config/ur10e/` YAMLs | d1=0.1807, a2=-0.6127, a3=-0.57155. Upgrades former placeholder. |
| `universal_robots/ur16e.urdf` | `config/ur16e/` YAMLs | d1=0.1807, a2=-0.4784, a3=-0.36. Uses UR10e collision STL meshes. |
| `universal_robots/ur20.urdf` | `config/ur20/` YAMLs | d1=0.2363, a2=-0.862, a3=-0.7287. Largest UR model. |

**FANUC** (6 models — each has own xacro; `${prefix}` → empty, `${radians(x)}` evaluated):

| File | Source | Key notes |
|---|---|---|
| `fanuc/lrmate200id.urdf` | `lrmate200id_macro.xacro` | Original Session 2 URDF. |
| `fanuc/m10ia.urdf` | `m10ia_macro.xacro` | Upgrades former placeholder. |
| `fanuc/m20ia.urdf` | `m20ia_macro.xacro` | |
| `fanuc/cr7ia.urdf` | `cr7ia_macro.xacro` | Collaborative — green body colour. |
| `fanuc/m710ic50.urdf` | `m710ic50_macro.xacro` | Largest FANUC model. |
| `fanuc/crx10ial.urdf` | `crx10ial_macro.xacro` | Collaborative — white body colour. |

**ABB** (6 models — each has own xacro; same flattening approach):

| File | Source | Key notes |
|---|---|---|
| `abb/irb120.urdf` | `irb120_3_58_macro.xacro` | Original Session 2 URDF. |
| `abb/irb1200.urdf` | `irb1200_5_90_macro.xacro` | Collision STLs (visual=DAE). |
| `abb/irb2400.urdf` | `irb2400_macro.xacro` | Upgrades former placeholder. Collision STLs. |
| `abb/irb2600.urdf` | `irb2600_12_165_macro.xacro` | |
| `abb/crb15000.urdf` | `crb15000_5_95_macro.xacro` | Collaborative GoFa — dark grey/white. |
| `abb/irb4400l.urdf` | `irb4400l_30_243_macro.xacro` | Largest ABB model. |

### Models that are stubs (PlaceholderRobot)

**None — all 17 models now have live URDF+STL geometry.** (Session 5 converted the 3 former placeholders and added 11 new models.)

To add a new model in the future: write URDF, copy STL meshes, set `urdf` and `packageMap` in robots_config.json, add entry to SOURCES.md.

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

### 9. ~~EquipmentPanel placement rotation slider not 15°-snapped~~ **FIXED (Session 5)**

Changed `step="1"` to `step="15"` in `src/ui/EquipmentPanel.jsx` line 262. All five rotation controls now use 15° snap.

### 10. Rotation snap 15° is hardcoded in four places

See Architecture Decision #16. The literal `15` appears in `DragPlane.jsx`, `ControlPanel.jsx`, `DeployedRobotList.jsx`, and `DeployedObjectList.jsx`. A future session should add `rotationSnapDeg: 15` to `config.json` and reference it from all four locations.

### 11. SAVES tab / scenesApiPlugin only works in dev mode

`GET/POST/DELETE /api/scenes` is served by the Vite `scenesApiPlugin`. In a production build (`npm run build && vite preview` or static hosting), the API does not exist and the SAVES tab will show: *"Could not reach the dev-server API."* This is acceptable — the tool is run locally via `npm run dev`.

### 12. EMPTY_JOINT_ANGLES stable reference is mandatory (do not regress)

In `URDFRobot.jsx`, the selector `s.robotJointAngles[robotId] ?? EMPTY_JOINT_ANGLES` must use the module-level `EMPTY_JOINT_ANGLES` constant. Using `?? {}` inline causes infinite re-renders (see Architecture Decision #14). Any future component that subscribes to an object that might be absent must use the same pattern.

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

2. **Run the dev server** (required for SAVES tab and scene API):
   ```bash
   export PATH="/opt/homebrew/Cellar/node@20/20.20.0/bin:$PATH"
   cd "/Users/davidhaselden/Documents/Claude Code Projects/Robot Layout Demo"
   npm run dev
   ```
   Note the actual port in the terminal output (target 5173–5179, whichever is free).

3. **Read these files** in this order, as they are most likely to have changed:
   - `src/config/equipment_config.json` — 5 categories, 31 items (shapes, equipment, materials, tracks)
   - `src/utils/objectUtils.js` — 13 shape types handled in 4 switch statements
   - `src/scene/SceneObjectInstance.jsx` — 13 shape imports and render cases
   - `src/config/robots_config.json` — 17 live robot models (5 UR, 6 FANUC, 6 ABB)
   - `src/store/sceneStore.js` — complete store shape including joint state, label visibility, save/restore

4. **Ask the user:**
   - "Have you made any changes to the code since the last session?"
   - "Are there any bugs or polish items to address before new features?"
   - "Which direction do you want to go next — Phase 7 (animation/validation), more polish, or something else?"

5. **Verify Session 6 equipment** — deploy one of each new procedural shape type (linear track, work table, turntable, conveyor, safety fence, pallet, operator station) and check: renders correctly, correct multi-material colours, drag/rotate works, dimension editing resizes live, save/load preserves state.

6. **Do not assume** Phase 7 is the next task. The user may want additional polish, new features, or requirements changes.

---

## SOURCES AND LICENSES

*(Summary — see SOURCES.md for full per-model attribution)*

### Current Status: 17 live models, 0 placeholders

| Manufacturer | Models | Source Repo | License |
|---|---|---|---|
| Universal Robots | UR3e, UR5e, UR10e, UR16e, UR20 | ros-industrial/universal_robot | BSD 3-Clause (Universal Robots A/S) |
| FANUC | LR Mate 200iD, M-10iA, M-20iA, CR-7iA, M-710iC/50, CRX-10iA/L | ros-industrial/fanuc | BSD 3-Clause (SwRI) |
| ABB | IRB 120, IRB 1200, IRB 2400, IRB 2600, CRB 15000, IRB 4400L | ros-industrial/abb | BSD 3-Clause (SwRI) |

All mesh files unmodified from source. All URDFs hand-flattened from xacro. Collision STLs used where visual meshes are DAE-only (all UR models, ABB IRB 1200, ABB IRB 2400).

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

### Session 4 — 2026-02-19
**Phase work completed:**
  - Joint control (JOINTS tab): `JointsPanel.jsx` with robot selector synced to viewport clicks, per-axis sliders, per-joint ↺ reset, Reset All. Joint angles stored in `robotJointAngles[robotId]` in Zustand; applied via `useEffect` in `URDFRobot`.
  - Colour/opacity per robot: manufacturer colour picker with ↺ reset, opacity slider (5–100%), `updateRobotStyle` store action, `colorOverride`/`opacity` fields on robot instances.
  - Z height sliders: slider + compact number input for non-floor robots (DeployedRobotList) and non-floor objects (DeployedObjectList).
  - Label improvements: `labels.fontSize` reduced 0.22→0.10; `showLabels: true` store flag; "Show Labels" checkbox in Viewport Controls; `<Text>` guarded in both RobotInstance and SceneObjectInstance.
  - Overhead fit-all view: "⊙ Overhead" button DOM overlay in App.jsx; `overheadViewCount` store trigger; `CameraRig` computes XZ bounding box of all scene entities and snaps camera above centre.
  - 15° rotation snap: `Math.round(angleDeg / 15) * 15` in DragPlane; `step="15"` on ControlPanel, DeployedRobotList, DeployedObjectList rotation sliders. (EquipmentPanel missed — see Known Issue #9.)
  - Camera max zoom doubled: `maxDistance` 200→400 in CameraRig OrbitControls.
  - Bug fix: UR5e wrist_3 visual mesh gap — changed `xyz="0 0 -0.0989"` → `xyz="0 0 0"` in ur5e.urdf.
  - Bug fix: `clearRobotJoints` now builds explicit `{ jointName: 0 }` map from metadata so URDFRobot's apply effect iterates and calls `setJointValue(name, 0)` for each joint.
  - Bug fix: `EMPTY_JOINT_ANGLES` stable reference in URDFRobot — fixes infinite re-render crash on robot deploy.
  - Save/load scenes: `restoreScene(data)` store action; Scene File section in ROBOT tab (name input, "↓ Save Scene" button with status feedback); saves write to `saves/{name}.json` via Vite API.
  - Scenes browser tab (SAVES): `ScenesPanel.jsx` fetches scene list from dev-server API; Load / Delete per entry; auto-refreshes on tab activation.
  - Vite dev-server API plugin: `scenesApiPlugin()` in `vite.config.js` — `GET/POST/DELETE /api/scenes` backed by Node.js `fs` reading the `saves/` project folder.
  - Git initialised: `git init` + initial commit `8496801` covering all 73 project files.

**Left incomplete / in progress:**
  - `EquipmentPanel.jsx` line 262: placement rotation slider still `step="1"` (should be `step="15"` to match other controls)

**New files created this session:**
  - `src/ui/JointsPanel.jsx` — JOINTS tab: robot selector + 6-axis joint sliders with live 3D update
  - `src/ui/ScenesPanel.jsx` — SAVES tab: scene list from API with Load/Delete actions
  - `saves/.gitkeep` — empty placeholder to keep saves/ directory tracked in git

**New dependencies added:**
  - None (scenesApiPlugin uses Node.js built-in `fs` and `path` — no npm package required)

**Architectural decisions made:**
  - Joint state in Zustand (not refs/callbacks) — matches colorOverride/opacity pattern, accessible to any component
  - EMPTY_JOINT_ANGLES stable module-level reference — mandatory for any Zustand selector returning object fallback
  - Vite configureServer plugin for saves/ API — zero extra tooling, dev-only, writes directly to project tree
  - 15° snap hardcoded (not in config.json) — document as tech debt

**Known issues discovered:**
  - `EquipmentPanel.jsx` placement rotation `step="1"` — `src/ui/EquipmentPanel.jsx:262` — one-line fix
  - 15° snap hardcoded in 4 places — `DragPlane.jsx:153`, `ControlPanel.jsx`, `DeployedRobotList.jsx`, `DeployedObjectList.jsx` — needs `config.json` entry `rotationSnapDeg`
  - SAVES tab shows error when app is served from built dist (API only exists in dev) — acceptable for local tool
  - `?? {}` inline in Zustand selectors is dangerous — crashes app — always use stable module-level reference

**What the next session should start with:**
  - One-line fix: change `step="1"` to `step="15"` in `src/ui/EquipmentPanel.jsx` line 262 (EquipmentPanel placement rotation slider missed during 15° snap implementation)
  - Then ask user what direction next: Phase 7 (animation), new robot URDFs, further polish, or something else

### Session 3 — 2026-02-19
- **Completed Phase 6:** Scene objects (shapes, equipment, materials) deployed via a new Equipment tab alongside robots; full drag/rotate/select interaction shared with robots.
- **New config:** `src/config/equipment_config.json` — originally 3 categories, 18 items: Shapes (box, cylinder, sphere), Equipment (work table, platform, turntable, conveyor, safety fence, robot cell base), Materials (3× I-beam W-series, 3× pipe NPS, 3× cable tray). Later expanded to 5 categories and 31 items in Sessions 5–6.
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

### Session 5 — 2026-02-19
**Scope:** Add 14 new robot models with real URDF+STL meshes, eliminating all placeholders.

**Models added (14 new):**
  - **Universal Robots (4):** UR3e, UR10e (upgrades placeholder), UR16e, UR20
  - **FANUC (5):** M-10iA (upgrades placeholder), M-20iA, CR-7iA (collaborative, green), M-710iC/50, CRX-10iA/L (collaborative, white)
  - **ABB (5):** IRB 1200, IRB 2400 (upgrades placeholder), IRB 2600, CRB 15000 GoFa (collaborative), IRB 4400L

**Final count: 17 live models, 0 placeholders.**

**STL mesh downloads (98 files):**
  - UR models: collision STLs from `ur_description/meshes/{model}/collision/` (visual=DAE, not supported)
  - FANUC models: visual STLs from `fanuc_{pkg}_support/meshes/{model}/visual/`
  - ABB models: visual or collision STLs from `abb_{pkg}_support/meshes/{variant}/visual/` (or collision/ where visual=DAE)
  - UR16e: shares UR10e collision geometry (no separate STL set)
  - Source: raw.githubusercontent.com, ros-industrial repos, noetic-devel branch

**URDF files written (14 new):**
  - UR models: common template with `base_link_inertia` intermediate link, all axes `0 0 1`, DH params from config YAMLs
  - FANUC models: per-model xacro flattened, variable axes, brand colours (yellow/green/white)
  - ABB models: per-model xacro flattened, variable axes, brand colours (orange/grey/white)
  - All wrist_3 visual origins set to `xyz="0 0 0"` for UR models (avoiding mesh gap bug from Session 2)

**Bug fix:** Known Issue #9 — `EquipmentPanel.jsx` line 262 rotation slider `step="1"` → `step="15"`.

**Config changes:**
  - `robots_config.json`: Complete rewrite — 17 models (5 UR, 6 FANUC, 6 ABB), all with live URDF paths. No `urdf: null` entries remaining.
  - New models use subdirectory packageMap convention: `{ "ur3e": "universal_robots/ur3e" }` vs original flat `{ "ur5e": "universal_robots" }`

**Documentation updates:**
  - `SOURCES.md`: Full attribution for all 17 models with per-model source details
  - `CLAUDE.md`: Updated build status, project structure, model pipeline tables, sources section, session log

**No source code changes to React components, Zustand store, or utility files.** The existing URDF loading architecture handles all 14 new models automatically.

**Files changed:**
  - `src/config/robots_config.json` — 17 model entries (was 6)
  - `src/ui/EquipmentPanel.jsx` — line 262: step="15"
  - `public/models/**/*.urdf` — 14 new URDF files
  - `public/models/**/*.stl` — 98 new STL mesh files
  - `SOURCES.md` — full rewrite with all 17 model attributions
  - `CLAUDE.md` — updated throughout

**Issues encountered during implementation:**
  - zsh word splitting: `$VAR` doesn't word-split in zsh; fixed by using inline for-loop lists
  - Plan said "UR15" — no such model; changed to UR16e
  - UR16e has no separate collision directory; shares UR10e meshes
  - CRX-10iA/L package is `fanuc_crx10ia_support` (not `crx10ial`)
  - WebFetch parallel 404 causes cascading sibling failures; retried individually

### Session 6 — 2026-02-19
**Scope:** Add 7th-axis linear track equipment with procedural 3D models; upgrade all equipment items from basic box/cylinder shapes to detailed procedural geometry; add new common manufacturing equipment items.

**New procedural shape components (7 created):**
  - `LinearTrackShape.jsx` — 7th-axis linear track: base extrusion + 2 guide rails + carriage mounting plate + 4 guide blocks + 2 end stops (11 box meshes). Multi-material: manufacturer colour base/end stops, dark steel rails, medium grey blocks, light grey carriage plate. `meshStandardMaterial` with roughness=0.3, metalness=0.6.
  - `WorkTableShape.jsx` — Work table: tabletop + 4 legs + 2 side aprons + lower shelf. Two-tone: configurable top, grey steel legs/shelf.
  - `TurntableShape.jsx` — Turntable/positioner: cylindrical base + pedestal motor housing + rotating plate + crosshair alignment marks. Uses `cylinderGeometry`. Proportions adapt to height (flat turntable vs tall positioner).
  - `ConveyorShape.jsx` — Belt conveyor: 2 side rails + belt surface + 4 legs + 3 cross braces + 2 end rollers (cylinders). Multi-material: frame colour, dark rubber belt, steel rails/rollers.
  - `SafetyFenceShape.jsx` — Safety fence panel: dynamic vertical posts (every ~1m based on length) + top/bottom horizontal rails + semi-transparent wire mesh panels between posts. Post count adjusts when length changes.
  - `PalletShape.jsx` — Shipping pallet: 5 top deck boards + 3 stringers + 3 bottom deck boards. EUR/ISO proportions (board thickness 15% of height, stringer 70%).
  - `OperatorStationShape.jsx` — Operator station / HMI console: desk surface + 4 legs + back panel (HMI/display) + front kick plate. Desk at 65% of total height; `getObjectTopSurface` returns desk height (not panel top) for robot mounting.

**Existing equipment items upgraded to procedural geometry (4):**
  - Work Table: `box` → `work_table` (tabletop + legs + shelf, no longer a plain box)
  - Turntable: `cylinder` → `turntable` (base + pedestal + plate, no longer a plain cylinder)
  - Conveyor: `box` → `conveyor` (rails + belt + legs + rollers, no longer a plain box)
  - Safety Fence: `box` → `safety_fence` (posts + rails + mesh panels, no longer a plain box)

**New equipment items added (5):**
  - Welding Positioner (`turntable` shape, radius 0.5m, height 0.9m, dark blue-grey)
  - Fixture Table (`work_table` shape, 1.5×1.0×0.85m, dark green-grey)
  - Operator Station (`operator_station` shape, 1.2×0.7×1.1m, grey-blue)
  - EUR Pallet (`pallet` shape, 1.2×0.8×0.144m, wood brown)
  - Guard Rail (`safety_fence` shape, 3.0×0.1×1.0m, safety yellow)

**7th-axis linear track equipment (7 items in new "Tracks" category):**
  - ABB IRBT 2005 (orange, 5m default, standard TrackMotion)
  - ABB IRBT 4004 (orange, 6m default, heavy-duty)
  - FANUC RTU Gen VI (yellow, 5m default, standard rail)
  - FANUC RTU Gen VI HD (yellow, 8m default, heavy-duty with 480mm height)
  - Thomson Movotrak CTU (silver, 4m default, UR+ certified)
  - Cobotracks LMK (dark grey, 5m default, modular linear kit)
  - igus ZLW-20 (grey, 3m default, low-profile belt-driven)

**Config changes:**
  - `equipment_config.json`: 5 categories (was 4), 31 items total (was 21). New `tracks` category with 7 linear track items. Equipment category expanded from 7 to 12 items. Four existing items' `shape` fields changed (work_table, turntable, conveyor, safety_fence).

**Code changes:**
  - `src/scene/SceneObjectInstance.jsx` — 7 new shape imports, 7 new render cases in `renderShape()`. Footprint calculation updated to include `turntable` in the radius-based branch.
  - `src/utils/objectUtils.js` — 7 new shape types added to all 4 switch statements (`getObjectLabelHeight`, `getObjectTopSurface`, `getEditableDimensions`, `getSpecInfo`). Conveyor/pallet return spec info strings; operator_station `getObjectTopSurface` returns desk height (65%) not total height.

**No changes to:**
  - `EquipmentPanel.jsx` — category toggle, item selector, dimension inputs all fully data-driven from `Object.keys(equipmentConfig.categories)`
  - `sceneStore.js` — all store actions are shape-agnostic
  - `DragPlane.jsx`, `RotationHandle.jsx` — unified interaction system handles any scene object
  - Scene persistence — save/load works automatically (new shapes are just scene objects)

**Totals after Session 6:**
  - 13 procedural shape types: box, cylinder, sphere, ibeam, pipe, cabletray, linear_track, work_table, turntable, conveyor, safety_fence, pallet, operator_station
  - 5 equipment categories: Shapes (3), Equipment (12), Materials (9), Tracks (7)
  - 31 deployable items total
  - 638 Vite modules, 0 build errors

**New files created this session:**
  - `src/scene/shapes/LinearTrackShape.jsx`
  - `src/scene/shapes/WorkTableShape.jsx`
  - `src/scene/shapes/TurntableShape.jsx`
  - `src/scene/shapes/ConveyorShape.jsx`
  - `src/scene/shapes/SafetyFenceShape.jsx`
  - `src/scene/shapes/PalletShape.jsx`
  - `src/scene/shapes/OperatorStationShape.jsx`

**Architectural decisions made:**
  - All new procedural shapes follow the IBeamShape pattern: bottom face at local y=0, run along local X axis, multi-material with `meshStandardMaterial`
  - Equipment items that are geometrically simple (platform, robot cell base, wall) kept as basic `box` shape — procedural shapes only where they add visual distinction
  - `equipment_config.json` remains the single source of truth for all equipment categories and items; the EquipmentPanel UI is fully data-driven and requires no code changes when categories/items are added
  - SafetyFenceShape uses dynamic post count based on length (`Math.round(length)` posts) — JSX tree changes when length is edited, React reconciles via keys
  - OperatorStationShape `getObjectTopSurface` returns 65% of height (desk surface) rather than full height (panel top) — "Mount Robot Here" places robot on the desk, not on top of the HMI panel

**Known issues discovered:**
  - None new. Build clean (638 modules, 0 errors).
