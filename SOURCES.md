# Robot Model Sources

This file documents the origin, license, and attribution for every 3D model
and mesh file used in the Robot Layout Demo application. It must be updated
whenever a model is added, replaced, or modified.

---

## Current Status

| Robot | Manufacturer | Status | Format |
|---|---|---|---|
| UR3e | Universal Robots | **Live — real STL meshes + custom URDF** | URDF + STL |
| UR5e | Universal Robots | **Live — real STL meshes + custom URDF** | URDF + STL |
| UR10e | Universal Robots | **Live — real STL meshes + custom URDF** | URDF + STL |
| UR16e | Universal Robots | **Live — real STL meshes + custom URDF** | URDF + STL |
| UR20 | Universal Robots | **Live — real STL meshes + custom URDF** | URDF + STL |
| LR Mate 200iD | FANUC | **Live — real STL meshes + custom URDF** | URDF + STL |
| M-10iA | FANUC | **Live — real STL meshes + custom URDF** | URDF + STL |
| M-20iA | FANUC | **Live — real STL meshes + custom URDF** | URDF + STL |
| CR-7iA | FANUC | **Live — real STL meshes + custom URDF** | URDF + STL |
| M-710iC/50 | FANUC | **Live — real STL meshes + custom URDF** | URDF + STL |
| CRX-10iA/L | FANUC | **Live — real STL meshes + custom URDF** | URDF + STL |
| IRB 120 | ABB | **Live — real STL meshes + custom URDF** | URDF + STL |
| IRB 1200 | ABB | **Live — real STL meshes + custom URDF** | URDF + STL |
| IRB 2400 | ABB | **Live — real STL meshes + custom URDF** | URDF + STL |
| IRB 2600 | ABB | **Live — real STL meshes + custom URDF** | URDF + STL |
| CRB 15000 (GoFa) | ABB | **Live — real STL meshes + custom URDF** | URDF + STL |
| IRB 4400L | ABB | **Live — real STL meshes + custom URDF** | URDF + STL |

**17 live models, 0 placeholders.**

---

## Universal Robots

All Universal Robots models sourced from the same repository and share a common URDF kinematic template structure.

- **Source repository:** https://github.com/ros-industrial/universal_robot
- **Package used:** `ur_description`
- **Branch:** `noetic-devel`
- **License:** BSD 3-Clause License
- **Attribution text:**
  ```
  Copyright (c) 2009-2021, Universal Robots A/S
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the conditions of the BSD
  3-Clause License are met.
  ```
- **Why collision meshes:** Visual meshes are DAE (Collada) format which requires a Collada parser not available in this stack. Collision STL meshes are geometrically identical. Materials applied programmatically (UR light grey #b3b3b3).
- **Mesh modifications:** None — original STL files, unmodified

---

### UR3e

- **Date acquired:** 2026-02-19
- **Mesh files:** `ur_description/meshes/ur3e/collision/` — base.stl, shoulder.stl, upperarm.stl, forearm.stl, wrist1.stl, wrist2.stl, wrist3.stl
- **Files placed at:** `public/models/universal_robots/ur3e/meshes/visual/`
- **URDF source:** `ur_description/config/ur3e/` — default_kinematics.yaml, physical_parameters.yaml, joint_limits.yaml, visual_parameters.yaml
- **URDF placed at:** `public/models/universal_robots/ur3e.urdf`
- **packageMap:** `{ "ur3e": "universal_robots/ur3e" }`

### UR5e

- **Date acquired:** 2026-02-19
- **Mesh files:** `ur_description/meshes/ur5e/collision/` — base.stl, shoulder.stl, upperarm.stl, forearm.stl, wrist1.stl, wrist2.stl, wrist3.stl
- **Files placed at:** `public/models/universal_robots/meshes/visual/`
- **URDF source:** `ur_description/config/ur5e/` — default_kinematics.yaml, physical_parameters.yaml, joint_limits.yaml, visual_parameters.yaml
- **URDF placed at:** `public/models/universal_robots/ur5e.urdf`
- **packageMap:** `{ "ur5e": "universal_robots" }`

### UR10e

- **Date acquired:** 2026-02-19
- **Mesh files:** `ur_description/meshes/ur10e/collision/` — base.stl, shoulder.stl, upperarm.stl, forearm.stl, wrist1.stl, wrist2.stl, wrist3.stl
- **Files placed at:** `public/models/universal_robots/ur10e/meshes/visual/`
- **URDF source:** `ur_description/config/ur10e/` — default_kinematics.yaml, physical_parameters.yaml, joint_limits.yaml, visual_parameters.yaml
- **URDF placed at:** `public/models/universal_robots/ur10e.urdf`
- **packageMap:** `{ "ur10e": "universal_robots/ur10e" }`

### UR16e

- **Date acquired:** 2026-02-19
- **Mesh files:** `ur_description/meshes/ur10e/collision/` — base.stl, shoulder.stl, upperarm.stl, forearm.stl, wrist1.stl, wrist2.stl, wrist3.stl (UR16e shares base geometry with UR10e)
- **Files placed at:** `public/models/universal_robots/ur16e/meshes/visual/`
- **URDF source:** `ur_description/config/ur16e/` — default_kinematics.yaml, physical_parameters.yaml, joint_limits.yaml, visual_parameters.yaml
- **URDF placed at:** `public/models/universal_robots/ur16e.urdf`
- **packageMap:** `{ "ur16e": "universal_robots/ur16e" }`
- **Note:** UR16e uses UR10e collision STL meshes (same physical dimensions) with UR16e-specific kinematic parameters.

### UR20

- **Date acquired:** 2026-02-19
- **Mesh files:** `ur_description/meshes/ur20/collision/` — base.stl, shoulder.stl, upperarm.stl, forearm.stl, wrist1.stl, wrist2.stl, wrist3.stl
- **Files placed at:** `public/models/universal_robots/ur20/meshes/visual/`
- **URDF source:** `ur_description/config/ur20/` — default_kinematics.yaml, physical_parameters.yaml, joint_limits.yaml, visual_parameters.yaml
- **URDF placed at:** `public/models/universal_robots/ur20.urdf`
- **packageMap:** `{ "ur20": "universal_robots/ur20" }`

---

## FANUC

All FANUC models sourced from the same repository. Each model has its own support package.

- **Source repository:** https://github.com/ros-industrial/fanuc
- **Branch:** `noetic-devel`
- **License:** BSD 3-Clause License
- **Attribution text:**
  ```
  Copyright (c) 2012-2021, Southwest Research Institute (SwRI)
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the conditions of the BSD
  3-Clause License are met.
  ```
- **Mesh modifications:** None — original STL files, unmodified

---

### LR Mate 200iD

- **Date acquired:** 2026-02-19
- **Package:** `fanuc_lrmate200id_support`
- **Mesh files:** `fanuc_lrmate200id_support/meshes/lrmate200id/visual/` — base_link.stl, link_1–link_6.stl
- **Files placed at:** `public/models/fanuc/meshes/visual/`
- **URDF source:** `fanuc_lrmate200id_support/urdf/lrmate200id_macro.xacro`
- **URDF placed at:** `public/models/fanuc/lrmate200id.urdf`
- **packageMap:** `{ "fanuc_lrmate200id": "fanuc" }`
- **URDF modifications:** Xacro macros flattened. `${prefix}` set to empty. `${radians(x)}` evaluated numerically. Materials: FANUC yellow #f9a825, grey #474747, black #1a1a1a.

### M-10iA

- **Date acquired:** 2026-02-19
- **Package:** `fanuc_m10ia_support`
- **Mesh files:** `fanuc_m10ia_support/meshes/m10ia/visual/` — base_link.stl, link_1–link_6.stl
- **Files placed at:** `public/models/fanuc/m10ia/meshes/visual/`
- **URDF source:** `fanuc_m10ia_support/urdf/m10ia_macro.xacro`
- **URDF placed at:** `public/models/fanuc/m10ia.urdf`
- **packageMap:** `{ "fanuc_m10ia": "fanuc/m10ia" }`

### M-20iA

- **Date acquired:** 2026-02-19
- **Package:** `fanuc_m20ia_support`
- **Mesh files:** `fanuc_m20ia_support/meshes/m20ia/visual/` — base_link.stl, link_1–link_6.stl
- **Files placed at:** `public/models/fanuc/m20ia/meshes/visual/`
- **URDF source:** `fanuc_m20ia_support/urdf/m20ia_macro.xacro`
- **URDF placed at:** `public/models/fanuc/m20ia.urdf`
- **packageMap:** `{ "fanuc_m20ia": "fanuc/m20ia" }`

### CR-7iA

- **Date acquired:** 2026-02-19
- **Package:** `fanuc_cr7ia_support`
- **Mesh files:** `fanuc_cr7ia_support/meshes/cr7ia/visual/` — base_link.stl, link_1–link_6.stl
- **Files placed at:** `public/models/fanuc/cr7ia/meshes/visual/`
- **URDF source:** `fanuc_cr7ia_support/urdf/cr7ia_macro.xacro`
- **URDF placed at:** `public/models/fanuc/cr7ia.urdf`
- **packageMap:** `{ "fanuc_cr7ia": "fanuc/cr7ia" }`
- **Note:** Collaborative robot — green body colour in URDF materials.

### M-710iC/50

- **Date acquired:** 2026-02-19
- **Package:** `fanuc_m710ic_support`
- **Mesh files:** `fanuc_m710ic_support/meshes/m710ic50/visual/` — base_link.stl, link_1–link_6.stl
- **Files placed at:** `public/models/fanuc/m710ic50/meshes/visual/`
- **URDF source:** `fanuc_m710ic_support/urdf/m710ic50_macro.xacro`
- **URDF placed at:** `public/models/fanuc/m710ic50.urdf`
- **packageMap:** `{ "fanuc_m710ic50": "fanuc/m710ic50" }`

### CRX-10iA/L

- **Date acquired:** 2026-02-19
- **Package:** `fanuc_crx10ia_support`
- **Mesh files:** `fanuc_crx10ia_support/meshes/crx10ial/visual/` — base_link.stl, link_1–link_6.stl
- **Files placed at:** `public/models/fanuc/crx10ial/meshes/visual/`
- **URDF source:** `fanuc_crx10ia_support/urdf/crx10ial_macro.xacro`
- **URDF placed at:** `public/models/fanuc/crx10ial.urdf`
- **packageMap:** `{ "fanuc_crx10ial": "fanuc/crx10ial" }`
- **Note:** Collaborative robot — white/light grey body colour in URDF materials.

---

## ABB

All ABB models sourced from the same repository. Each model has its own support package.

- **Source repository:** https://github.com/ros-industrial/abb
- **Branch:** `noetic-devel`
- **License:** BSD 3-Clause License
- **Attribution text:**
  ```
  Copyright (c) 2012-2021, Southwest Research Institute (SwRI)
  All rights reserved.

  Redistribution and use in source and binary forms, with or without
  modification, are permitted provided that the conditions of the BSD
  3-Clause License are met.
  ```
- **Mesh modifications:** None — original STL files, unmodified

---

### IRB 120

- **Date acquired:** 2026-02-19
- **Package:** `abb_irb120_support`
- **Mesh files:** `abb_irb120_support/meshes/irb120_3_58/visual/` — base_link.stl, link_1–link_6.stl
- **Files placed at:** `public/models/abb/meshes/visual/`
- **URDF source:** `abb_irb120_support/urdf/irb120_3_58_macro.xacro`
- **URDF placed at:** `public/models/abb/irb120.urdf`
- **packageMap:** `{ "abb_irb120": "abb" }`
- **URDF modifications:** Xacro flattened. Materials: ABB orange #e58018, black #1a1a1a.

### IRB 1200

- **Date acquired:** 2026-02-19
- **Package:** `abb_irb1200_support`
- **Mesh files:** `abb_irb1200_support/meshes/irb1200_5_90/collision/` — base_link.stl, link_1–link_6.stl
- **Files placed at:** `public/models/abb/irb1200/meshes/visual/`
- **URDF source:** `abb_irb1200_support/urdf/irb1200_5_90_macro.xacro`
- **URDF placed at:** `public/models/abb/irb1200.urdf`
- **packageMap:** `{ "abb_irb1200": "abb/irb1200" }`
- **Note:** Visual meshes are DAE format; collision STL used instead (same approach as UR models).

### IRB 2400

- **Date acquired:** 2026-02-19
- **Package:** `abb_irb2400_support`
- **Mesh files:** `abb_irb2400_support/meshes/irb2400/collision/` — base_link.stl, link_1–link_6.stl
- **Files placed at:** `public/models/abb/irb2400/meshes/visual/`
- **URDF source:** `abb_irb2400_support/urdf/irb2400_macro.xacro`
- **URDF placed at:** `public/models/abb/irb2400.urdf`
- **packageMap:** `{ "abb_irb2400": "abb/irb2400" }`
- **Note:** Visual meshes are DAE format; collision STL used instead.

### IRB 2600

- **Date acquired:** 2026-02-19
- **Package:** `abb_irb2600_support`
- **Mesh files:** `abb_irb2600_support/meshes/irb2600_12_165/visual/` — base_link.stl, link_1–link_6.stl
- **Files placed at:** `public/models/abb/irb2600/meshes/visual/`
- **URDF source:** `abb_irb2600_support/urdf/irb2600_12_165_macro.xacro`
- **URDF placed at:** `public/models/abb/irb2600.urdf`
- **packageMap:** `{ "abb_irb2600": "abb/irb2600" }`

### CRB 15000 (GoFa)

- **Date acquired:** 2026-02-19
- **Package:** `abb_crb15000_support`
- **Mesh files:** `abb_crb15000_support/meshes/crb15000_5_95/visual/` — base_link.stl, link_1–link_6.stl
- **Files placed at:** `public/models/abb/crb15000/meshes/visual/`
- **URDF source:** `abb_crb15000_support/urdf/crb15000_5_95_macro.xacro`
- **URDF placed at:** `public/models/abb/crb15000.urdf`
- **packageMap:** `{ "abb_crb15000": "abb/crb15000" }`
- **Note:** Collaborative robot — dark grey/white body colour in URDF materials.

### IRB 4400L

- **Date acquired:** 2026-02-19
- **Package:** `abb_irb4400_support`
- **Mesh files:** `abb_irb4400_support/meshes/irb4400l_30_243/visual/` — base_link.stl, link_1–link_6.stl
- **Files placed at:** `public/models/abb/irb4400l/meshes/visual/`
- **URDF source:** `abb_irb4400_support/urdf/irb4400l_30_243_macro.xacro`
- **URDF placed at:** `public/models/abb/irb4400l.urdf`
- **packageMap:** `{ "abb_irb4400l": "abb/irb4400l" }`

---

## Adding a New Model — Checklist

1. Acquire URDF + mesh files from the appropriate ROS Industrial repo
2. Place STL meshes in `public/models/[manufacturer]/[model_id]/meshes/visual/`
3. Write or generate the URDF in `public/models/[manufacturer]/[model_id].urdf`
4. Add a new entry to `src/config/robots_config.json` with `urdf`, `packageMap`, and all metadata fields
5. Update this file with full attribution
6. Test by deploying the model in the app and verifying: loads without errors, stands upright, correct colours, joints work

---

## License Compatibility Note

All models currently in use are sourced from ROS Industrial repositories
under BSD 3-Clause License. This license permits internal commercial use
for R&D purposes provided the copyright notice and conditions are retained.

Acceptable licenses for future additions: MIT, BSD (any clause), Apache 2.0,
CC BY 4.0, CC BY-SA 4.0.

Do NOT add models under CC BY-NC (NonCommercial) or other licenses that
restrict commercial use.
