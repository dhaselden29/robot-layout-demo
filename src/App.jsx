/**
 * App.jsx
 *
 * Top-level layout:
 *   - Left sidebar: ControlPanel
 *   - Centre:       R3F Canvas (3D scene) + DragCoordinatesHUD overlay
 *   - Bottom bar:   StatusBar
 *
 * Phase 4 additions (inside Canvas):
 *   - DragPlane: persistent invisible plane that handles drag and rotate
 *     pointer events for the selected robot.
 *   - RotationHandle: orange arc + grip sphere rendered when a robot is
 *     selected; pressing the grip starts a rotate gesture.
 *
 * Phase 4 addition (outside Canvas, inside canvas wrapper):
 *   - DragCoordinatesHUD: absolute-positioned CSS overlay showing live
 *     X/Y coordinates during drag or rotation degrees during rotate.
 *     Must be a sibling of the Canvas (not inside it) since it is DOM,
 *     not WebGL.
 *
 * Phase 5 addition (inside Canvas):
 *   - ExportCapture: null-rendering component that downloads a PNG of the
 *     viewport when the exportRequested store flag is set.
 *     preserveDrawingBuffer: true on the gl prop is required for toDataURL().
 */

import { Canvas } from '@react-three/fiber';
import config from './config/config.json';
import useSceneStore from './store/sceneStore';
import RobotManager from './robots/RobotManager';
import CameraRig from './scene/CameraRig';
import SceneObjectManager from './scene/SceneObjectManager';
import DragPlane from './scene/DragPlane';
import FloorClickPlane from './scene/FloorClickPlane';
import FloorGrid from './scene/FloorGrid';
import ExportCapture from './scene/ExportCapture';
import RotationHandle from './scene/RotationHandle';
import SceneSetup from './scene/SceneSetup';
import ControlPanel from './ui/ControlPanel';
import DragCoordinatesHUD from './ui/DragCoordinatesHUD';
import ScaleIndicator from './ui/ScaleIndicator';
import StatusBar from './ui/StatusBar';

export default function App() {
  const isOrthographic = useSceneStore((s) => s.isOrthographic);

  return (
    <div className="flex flex-col w-full h-full">

      {/* Main content row: sidebar + canvas */}
      <div className="flex flex-1 min-h-0">

        {/* Left sidebar */}
        <ControlPanel />

        {/* Canvas wrapper — relative so HUD can be absolutely positioned */}
        <div className="flex-1 relative">
          <Canvas
            shadows
            camera={{
              fov: config.camera.fov,
              near: config.camera.near,
              far: config.camera.far,
              position: config.camera.defaultPosition,
            }}
            gl={{ antialias: true, preserveDrawingBuffer: true }}
          >
            {/* Lighting and atmosphere */}
            <SceneSetup />

            {/* Factory floor, grid, walls, and deselection handler */}
            <FloorGrid />

            {/* Floor-click capture plane (active only when mode==='place') */}
            <FloorClickPlane />

            {/* Persistent drag plane — handles drag and rotate pointer events */}
            <DragPlane />

            {/* All deployed robot instances */}
            <RobotManager />

            {/* All deployed scene objects */}
            <SceneObjectManager />

            {/* Orange rotation arc + grip, shown when a robot is selected */}
            <RotationHandle />

            {/* Camera orbit / pan / zoom / focus controls */}
            <CameraRig />

            {/* PNG export — downloads viewport on store trigger */}
            <ExportCapture />
          </Canvas>

          {/* Live coordinate HUD — CSS overlay, shown during drag/rotate */}
          <DragCoordinatesHUD />

          {/* Scale indicator — lower-left, above buttons */}
          <ScaleIndicator />

          {/* View buttons — lower-left corner */}
          <div className="absolute bottom-4 left-4 z-10 flex gap-2">
            <button
              onClick={() => useSceneStore.getState().triggerOverheadView()}
              title="Overhead view — fit all equipment"
              className="bg-gray-900/80 hover:bg-gray-800 border border-gray-600 text-gray-200 text-xs font-medium px-3 py-2 rounded shadow-lg transition-colors"
            >
              ⊙ Overhead
            </button>
            <button
              onClick={() => useSceneStore.getState().toggleOrthographic()}
              title={isOrthographic ? 'Switch to 3D perspective view' : 'Switch to 2D orthographic layout view'}
              className={
                'text-xs font-medium px-3 py-2 rounded shadow-lg transition-colors border ' +
                (isOrthographic
                  ? 'bg-blue-700 hover:bg-blue-600 border-blue-500 text-white'
                  : 'bg-gray-900/80 hover:bg-gray-800 border-gray-600 text-gray-200')
              }
            >
              {isOrthographic ? '3D View' : '2D Layout'}
            </button>
          </div>
        </div>
      </div>

      {/* Status bar */}
      <StatusBar />
    </div>
  );
}
