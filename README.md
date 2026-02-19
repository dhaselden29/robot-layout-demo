# Robot Layout Demo

A 3D visualization tool for planning robotic systems on a factory floor.
Use it to explore robot placement, count, and scale for modular unit assembly design reviews.

---

## What This Tool Does

- Displays a 30m × 50m factory floor in 3D
- Lets you choose a robot manufacturer, model, count, and size
- Places the robots in a grid formation with floating labels
- Full camera controls: orbit, zoom, and pan

---

## How to Run It

You need Node.js installed. If you are not sure, open Terminal and type:

```
node --version
```

If you see a version number, you are ready. If not, ask the project owner to help you set it up.

### Start the app

1. Open Terminal
2. Navigate to this folder:
   ```
   cd path/to/robot-layout-demo
   ```
3. Install dependencies (first time only):
   ```
   npm install
   ```
4. Start the app:
   ```
   npm run dev
   ```
5. Open your browser and go to: **http://localhost:5174**

To stop the app, press `Ctrl + C` in Terminal.

---

## How to Use the Controls

### Sidebar (left panel)

| Control | What it does |
|---|---|
| Manufacturer | Choose a robot brand (Universal Robots, FANUC, ABB) |
| Model | Choose a specific robot model |
| Number of Units | How many robots to place (1–20) |
| Scale | Compact (0.5×), Standard (1×), or Large (1.5×) |
| Deploy to Floor | Places robots in an evenly spaced grid |
| Reset Scene | Removes all placed robots |

### Camera

| Action | How |
|---|---|
| Rotate view | Left-click and drag |
| Zoom | Scroll wheel |
| Pan (move sideways) | Right-click and drag |
| Reset to default view | Click "Reset Camera" button |

---

## File Structure (for developers)

```
robot-layout-demo/
├── public/models/     — Robot GLB model files
├── src/config/        — Configuration (floor size, scale factors, etc.)
├── src/scene/         — 3D environment: floor, walls, lighting
├── src/robots/        — Robot loading and placement logic
├── src/store/         — Application state
├── src/ui/            — Sidebar, status bar, buttons
└── src/utils/         — Grid layout calculations
```

---

## Known Limitations (Phase 1)

- Robots are shown as placeholder shapes until real GLB model files are added
- No robot arm movement or animation
- No drag-and-drop repositioning (planned for Phase 2)
- No image export (planned for Phase 2)

---

## Questions or Issues

Contact the project owner or file an issue in the project repository.
