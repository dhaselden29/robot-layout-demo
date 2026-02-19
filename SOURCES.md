# Robot Model Sources

This file documents the origin, license, and attribution for every 3D model
and mesh file used in the Robot Layout Demo application. It must be updated
whenever a model is added, replaced, or modified.

---

## Current Status

| Robot | Manufacturer | Status | Format |
|---|---|---|---|
| UR5e | Universal Robots | **Live — real STL meshes + custom URDF** | URDF + STL |
| UR10e | Universal Robots | Placeholder geometry | Procedural |
| LR Mate 200iD | FANUC | **Live — real STL meshes + custom URDF** | URDF + STL |
| M-10iA | FANUC | Placeholder geometry | Procedural |
| IRB 120 | ABB | **Live — real STL meshes + custom URDF** | URDF + STL |
| IRB 2400 | ABB | Placeholder geometry | Procedural |

---

## Live Models — Full Attribution

---

### FANUC LR Mate 200iD

- **Source repository:** https://github.com/ros-industrial/fanuc
- **Package used:** `fanuc_lrmate200id_support`
- **Branch:** `noetic-devel`
- **Date acquired:** 2026-02-19
- **License:** BSD 3-Clause License
- **Attribution required:** Yes — per BSD 3-Clause terms
- **Attribution text:**
  ```
  Copyright (c) 2012-2021, Southwest Research Institute (SwRI)
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the conditions of the BSD
  3-Clause License are met.
  ```
- **Mesh files acquired:**
  - `fanuc_lrmate200id_support/meshes/lrmate200id/visual/base_link.stl`
  - `fanuc_lrmate200id_support/meshes/lrmate200id/visual/link_1.stl`
  - `fanuc_lrmate200id_support/meshes/lrmate200id/visual/link_2.stl`
  - `fanuc_lrmate200id_support/meshes/lrmate200id/visual/link_3.stl`
  - `fanuc_lrmate200id_support/meshes/lrmate200id/visual/link_4.stl`
  - `fanuc_lrmate200id_support/meshes/lrmate200id/visual/link_5.stl`
  - `fanuc_lrmate200id_support/meshes/lrmate200id/visual/link_6.stl`
- **Files placed at:** `public/models/fanuc/meshes/visual/`
- **URDF source:** `fanuc_lrmate200id_support/urdf/lrmate200id_macro.xacro`
- **URDF placed at:** `public/models/fanuc/lrmate200id.urdf`
- **URDF modifications:** Xacro macros flattened to plain URDF XML. `${prefix}` set to
  empty string. `${radians(x)}` expressions evaluated numerically. Material macros
  replaced with inline `<material>` elements using FANUC brand colours (yellow #f9a825,
  grey #474747, black #1a1a1a). `package://` mesh paths set to `package://fanuc_lrmate200id/`.
- **Mesh modifications:** None — original STL files, unmodified

---

### ABB IRB 120

- **Source repository:** https://github.com/ros-industrial/abb
- **Package used:** `abb_irb120_support`
- **Branch:** `noetic-devel`
- **Date acquired:** 2026-02-19
- **License:** BSD 3-Clause License
- **Attribution required:** Yes — per BSD 3-Clause terms
- **Attribution text:**
  ```
  Copyright (c) 2012-2021, Southwest Research Institute (SwRI)
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the conditions of the BSD
  3-Clause License are met.
  ```
- **Mesh files acquired:**
  - `abb_irb120_support/meshes/irb120_3_58/visual/base_link.stl`
  - `abb_irb120_support/meshes/irb120_3_58/visual/link_1.stl`
  - `abb_irb120_support/meshes/irb120_3_58/visual/link_2.stl`
  - `abb_irb120_support/meshes/irb120_3_58/visual/link_3.stl`
  - `abb_irb120_support/meshes/irb120_3_58/visual/link_4.stl`
  - `abb_irb120_support/meshes/irb120_3_58/visual/link_5.stl`
  - `abb_irb120_support/meshes/irb120_3_58/visual/link_6.stl`
- **Files placed at:** `public/models/abb/meshes/visual/`
- **URDF source:** `abb_irb120_support/urdf/irb120_3_58_macro.xacro`
- **URDF placed at:** `public/models/abb/irb120.urdf`
- **URDF modifications:** Same xacro flattening as FANUC above. Inertial data retained
  but not used by the viewer. Material macros replaced with ABB brand colour (orange #e58018,
  black #1a1a1a). `package://` paths set to `package://abb_irb120/`.
- **Mesh modifications:** None — original STL files, unmodified

---

### Universal Robots UR5e

- **Source repository:** https://github.com/ros-industrial/universal_robot
- **Package used:** `ur_description`
- **Branch:** `noetic-devel`
- **Date acquired:** 2026-02-19
- **License:** BSD 3-Clause License (UR description package)
- **Attribution required:** Yes — per BSD 3-Clause terms
- **Attribution text:**
  ```
  Copyright (c) 2009-2021, Universal Robots A/S
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the conditions of the BSD
  3-Clause License are met.
  ```
- **Mesh files acquired** (collision STL, identical geometry to visual DAE):
  - `ur_description/meshes/ur5e/collision/base.stl`
  - `ur_description/meshes/ur5e/collision/shoulder.stl`
  - `ur_description/meshes/ur5e/collision/upperarm.stl`
  - `ur_description/meshes/ur5e/collision/forearm.stl`
  - `ur_description/meshes/ur5e/collision/wrist1.stl`
  - `ur_description/meshes/ur5e/collision/wrist2.stl`
  - `ur_description/meshes/ur5e/collision/wrist3.stl`
- **Why collision meshes used:** The visual meshes are DAE (Collada) format which
  requires a Collada parser. The collision STL meshes are geometrically identical.
  Materials are applied programmatically in Three.js (UR light grey #b3b3b3).
- **Files placed at:** `public/models/universal_robots/meshes/visual/`
- **URDF source:** Kinematic parameters from `ur_description/config/ur5e/default_kinematics.yaml`
  and `ur_description/config/ur5e/joint_limits.yaml`
- **URDF placed at:** `public/models/universal_robots/ur5e.urdf`
- **URDF modifications:** Written from scratch using the kinematic YAML parameters.
  No xacro processing required. `package://` paths set to `package://ur5e/`.
- **Mesh modifications:** None — original STL files, unmodified

---

## Placeholder Models

The following robots render as procedural geometry (boxes and cylinders)
until real mesh files are sourced. No external files are used; no attribution
is required.

| Robot | Manufacturer | Notes |
|---|---|---|
| UR10e | Universal Robots | Uses UR5e kinematics data as reference. To source real meshes: acquire `ur_description/meshes/ur10e/collision/` from the same repo. |
| M-10iA | FANUC | To source: acquire `fanuc_m10ia_support` from the ros-industrial/fanuc repo. |
| IRB 2400 | ABB | To source: acquire `abb_irb2400_support` from the ros-industrial/abb repo. |

---

## Adding a New Model — Checklist

1. Acquire URDF + mesh files from the appropriate ROS Industrial repo
2. Place STL meshes in `public/models/[manufacturer]/meshes/visual/`
3. Write or generate the URDF in `public/models/[manufacturer]/[model_id].urdf`
4. Add a new entry to `src/config/robots_config.json`
5. Update this file with full attribution
6. Test with SMOKE_TEST = true in RobotManager.jsx

---

## License Compatibility Note

All models currently in use are sourced from ROS Industrial repositories
under BSD 3-Clause License. This license permits internal commercial use
for R&D purposes provided the copyright notice and conditions are retained.

Acceptable licenses for future additions: MIT, BSD (any clause), Apache 2.0,
CC BY 4.0, CC BY-SA 4.0.

Do NOT add models under CC BY-NC (NonCommercial) or other licenses that
restrict commercial use.
