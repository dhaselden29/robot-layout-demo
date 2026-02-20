/**
 * ControlPanel.jsx
 *
 * Left sidebar — five sections:
 *
 *   A  ADD ROBOT
 *      Manufacturer / Model / Count / Scale dropdowns
 *
 *   B  PLACEMENT
 *      Origin X / Y (floor coords), Rotation slider (0–360°),
 *      Mount type (Floor / Platform / Ceiling), Height input (platform/ceiling),
 *      "Pick from Floor" button (captures a floor click into X/Y)
 *
 *   C  ACTIONS
 *      Deploy to Floor · Reset Scene · Reset Camera · Export PNG
 *
 *   D  DEPLOYED ROBOTS
 *      Per-robot list with X/Y/rotation/focus/remove controls
 *
 *   E  VIEWPORT CONTROLS
 *      Snap to Grid toggle
 *
 * Deploy appends robots to the scene (does not replace).
 * Reset Scene clears all robots.
 */

import { useEffect, useState } from 'react';
import sceneConfig from '../config/config.json';
import robotsConfig from '../config/robots_config.json';
import useSceneStore from '../store/sceneStore';
import { buildRobotInstances } from '../utils/deploymentUtils';
import { saveScene } from '../utils/sceneStorage';
import DeployedRobotList from './DeployedRobotList';
import EquipmentPanel from './EquipmentPanel';
import JointsPanel from './JointsPanel';
import ScenesPanel from './ScenesPanel';

const manufacturerNames = Object.keys(robotsConfig.manufacturers);
const scaleNames = Object.keys(sceneConfig.robots.scales);

// ─── Shared input / select styles ────────────────────────────────────────────
const selectCls =
  'bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100 ' +
  'focus:outline-none focus:border-blue-500 w-full';
const numberCls =
  'bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100 ' +
  'focus:outline-none focus:border-blue-500 w-full';
const labelCls = 'text-xs font-semibold text-gray-400 uppercase tracking-wider';
const sectionCls = 'flex flex-col gap-2';

// Mount type button styles
function mountBtnCls(active) {
  return (
    'flex-1 py-1 rounded text-xs font-medium transition-colors border ' +
    (active
      ? 'bg-blue-700 border-blue-500 text-white'
      : 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-300')
  );
}

function tabBtnCls(active) {
  return (
    'flex-1 py-1.5 text-xs font-semibold transition-colors border-b-2 ' +
    (active
      ? 'text-blue-400 border-blue-500'
      : 'text-gray-500 border-transparent hover:text-gray-300')
  );
}

export default function ControlPanel() {
  // Tab state lives in the store so DeployedObjectList can switch to robot tab
  const activeTab = useSceneStore((s) => s.activeSidebarTab);
  const setActiveTab = useSceneStore((s) => s.setActiveSidebarTab);

  // Store actions
  const addRobots = useSceneStore((s) => s.addRobots);
  const nextRobotId = useSceneStore((s) => s.nextRobotId);
  const clearRobots = useSceneStore((s) => s.clearRobots);
  const triggerCameraReset = useSceneStore((s) => s.triggerCameraReset);
  const interactionMode = useSceneStore((s) => s.interactionMode);
  const setInteractionMode = useSceneStore((s) => s.setInteractionMode);
  const floorClickCoords = useSceneStore((s) => s.floorClickCoords);
  const setFloorClickCoords = useSceneStore((s) => s.setFloorClickCoords);
  const deployedRobots = useSceneStore((s) => s.deployedRobots);
  const snapToGridEnabled = useSceneStore((s) => s.snapToGridEnabled);
  const showLabels = useSceneStore((s) => s.showLabels);
  const setShowLabels = useSceneStore((s) => s.setShowLabels);

  // ── Scene save ────────────────────────────────────────────────────────────
  const [sceneName, setSceneName] = useState('scene');
  const [saveStatus, setSaveStatus] = useState(null); // null | 'saving' | 'saved' | 'error'

  function handleSaveScene() {
    const s = useSceneStore.getState();
    const scene = {
      version: 1,
      savedAt: new Date().toISOString(),
      deployedRobots:    s.deployedRobots,
      sceneObjects:      s.sceneObjects,
      nextRobotId:       s.nextRobotId,
      nextObjectId:      s.nextObjectId,
      robotJointAngles:  s.robotJointAngles,
      snapToGridEnabled: s.snapToGridEnabled,
      showLabels:        s.showLabels,
    };
    setSaveStatus('saving');
    try {
      saveScene(sceneName.trim() || 'scene', scene);
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus(null), 2000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus(null), 3000);
    }
  }

  // ── Section A state ─────────────────────────────────────────────────────
  const [manufacturer, setManufacturer] = useState(manufacturerNames[0]);
  const [model, setModel] = useState(
    robotsConfig.manufacturers[manufacturerNames[0]].models[0].name
  );
  const [count, setCount] = useState(sceneConfig.robots.defaultCount);
  const [scaleName, setScaleName] = useState(sceneConfig.robots.defaultScale);

  // ── Section B state ─────────────────────────────────────────────────────
  const [originX, setOriginX] = useState(0);
  const [originY, setOriginY] = useState(0);
  const [rotationDeg, setRotationDeg] = useState(
    sceneConfig.deployment.defaultRotationDeg
  );
  // PHASE 5: Mount type and Z height
  const [mountType, setMountType] = useState('floor');
  const [originZ, setOriginZ] = useState(0);

  // ── Manufacturer change: reset model to first available ─────────────────
  function handleManufacturerChange(e) {
    const mfr = e.target.value;
    setManufacturer(mfr);
    setModel(robotsConfig.manufacturers[mfr].models[0].name);
  }

  function handleCountChange(e) {
    const val = parseInt(e.target.value, 10);
    if (!isNaN(val)) {
      setCount(Math.min(Math.max(val, 1), sceneConfig.robots.maxCount));
    }
  }

  // ── PHASE 5: Mount type selection — auto-set sensible default Z ─────────
  function handleMountTypeChange(type) {
    setMountType(type);
    if (type === 'floor') setOriginZ(0);
    else if (type === 'platform') setOriginZ(sceneConfig.deployment.platformDefaultHeight);
    else if (type === 'ceiling') setOriginZ(sceneConfig.floor.wallHeight);
  }

  // ── Consume floor-click coords → update X/Y inputs ──────────────────────
  useEffect(() => {
    if (!floorClickCoords) return;
    setOriginX(floorClickCoords[0]);
    setOriginY(floorClickCoords[1]);
    setFloorClickCoords(null);
  }, [floorClickCoords, setFloorClickCoords]);

  // ── Consume pendingMountTarget → pre-fill placement form (Change 2) ──────
  const pendingMountTarget = useSceneStore((s) => s.pendingMountTarget);
  const clearPendingMountTarget = useSceneStore((s) => s.clearPendingMountTarget);
  const [mountBanner, setMountBanner] = useState(null); // { label, z }

  useEffect(() => {
    if (!pendingMountTarget) return;
    setOriginX(pendingMountTarget.x);
    setOriginY(pendingMountTarget.y);
    setOriginZ(pendingMountTarget.z);
    setMountType('platform');
    setMountBanner({ label: pendingMountTarget.label, z: pendingMountTarget.z });
    clearPendingMountTarget();
  }, [pendingMountTarget, clearPendingMountTarget]);

  // ── Deploy ───────────────────────────────────────────────────────────────
  function handleDeploy() {
    const instances = buildRobotInstances(
      manufacturer,
      model,
      count,
      scaleName,
      originX,
      originY,
      rotationDeg,
      nextRobotId,
      mountType,
      originZ
    );
    addRobots(instances);
    setMountBanner(null); // clear banner after deploy
  }

  // ── Floor-pick toggle ────────────────────────────────────────────────────
  function handleFloorPickToggle() {
    setInteractionMode(interactionMode === 'place' ? 'orbit' : 'place');
  }

  const modelNames = robotsConfig.manufacturers[manufacturer].models.map((m) => m.name);
  const isPlacing = interactionMode === 'place';
  const showHeightInput = mountType !== 'floor';

  return (
    <div className="flex flex-col w-64 bg-gray-900 text-gray-100 h-full select-none">

      {/* App title */}
      <div className="border-b border-gray-700 px-4 pt-4 pb-3 flex-shrink-0">
        <h1 className="text-sm font-bold tracking-widest text-blue-400 uppercase">
          Robot Layout
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">Modular Assembly Planner</p>
      </div>

      {/* Tab bar */}
      <div className="flex border-b border-gray-700 flex-shrink-0">
        <button onClick={() => setActiveTab('robot')} className={tabBtnCls(activeTab === 'robot')}>
          ROBOT
        </button>
        <button onClick={() => setActiveTab('equipment')} className={tabBtnCls(activeTab === 'equipment')}>
          EQUIP
        </button>
        <button onClick={() => setActiveTab('joints')} className={tabBtnCls(activeTab === 'joints')}>
          JOINTS
        </button>
        <button onClick={() => setActiveTab('saves')} className={tabBtnCls(activeTab === 'saves')}>
          SAVES
        </button>
      </div>

      {/* Scrollable content area */}
      <div className="flex flex-col gap-4 p-4 overflow-y-auto flex-1">

      {activeTab === 'saves' ? (
        <ScenesPanel />
      ) : activeTab === 'joints' ? (
        <JointsPanel />
      ) : activeTab === 'equipment' ? (
        <EquipmentPanel />
      ) : (
        <>

      {/* ── A: Add Robot ──────────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <p className={labelCls}>Add Robot</p>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Manufacturer</label>
          <select
            value={manufacturer}
            onChange={handleManufacturerChange}
            className={selectCls}
          >
            {manufacturerNames.map((mfr) => (
              <option key={mfr} value={mfr}>{mfr}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Model</label>
          <select
            value={model}
            onChange={(e) => setModel(e.target.value)}
            className={selectCls}
          >
            {modelNames.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-gray-500">Count</label>
            <input
              type="number"
              min={1}
              max={sceneConfig.robots.maxCount}
              value={count}
              onChange={handleCountChange}
              className={numberCls}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-gray-500">Scale</label>
            <select
              value={scaleName}
              onChange={(e) => setScaleName(e.target.value)}
              className={selectCls}
            >
              {scaleNames.map((s) => (
                <option key={s} value={s}>
                  {s.charAt(0).toUpperCase() + s.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Mount banner — shown when pre-filled from "Mount Robot Here" ── */}
      {mountBanner && (
        <div className="flex items-center justify-between gap-1 bg-green-900/40 border border-green-700 rounded px-2 py-1.5 text-xs">
          <span className="text-green-300 truncate">
            Mounting on: <span className="font-medium">{mountBanner.label}</span>
            <span className="text-green-500 ml-1">Z={mountBanner.z.toFixed(2)}m</span>
          </span>
          <button
            onClick={() => setMountBanner(null)}
            className="text-green-500 hover:text-green-300 flex-shrink-0"
          >
            ✕
          </button>
        </div>
      )}

      {/* ── B: Placement ─────────────────────────────────────────────────── */}
      <div className={`${sectionCls} border-t border-gray-700 pt-3`}>
        <p className={labelCls}>Placement</p>

        {/* X / Y origin */}
        <div className="flex gap-3">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-gray-500">X (m)</label>
            <input
              type="number"
              step="0.5"
              value={originX}
              onChange={(e) => setOriginX(Number(e.target.value))}
              className={numberCls}
            />
          </div>
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-xs text-gray-500">Y (m)</label>
            <input
              type="number"
              step="0.5"
              value={originY}
              onChange={(e) => setOriginY(Number(e.target.value))}
              className={numberCls}
            />
          </div>
        </div>

        {/* Rotation slider */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">
            Rotation — {Math.round(rotationDeg)}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            step="15"
            value={rotationDeg}
            onChange={(e) => setRotationDeg(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        {/* PHASE 5: Mount type toggle */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Mount</label>
          <div className="flex gap-1">
            <button
              onClick={() => handleMountTypeChange('floor')}
              className={mountBtnCls(mountType === 'floor')}
            >
              Floor
            </button>
            <button
              onClick={() => handleMountTypeChange('platform')}
              className={mountBtnCls(mountType === 'platform')}
            >
              Platform
            </button>
            <button
              onClick={() => handleMountTypeChange('ceiling')}
              className={mountBtnCls(mountType === 'ceiling')}
            >
              Ceiling
            </button>
          </div>
        </div>

        {/* PHASE 5: Height input — shown for platform and ceiling */}
        {showHeightInput && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Height (m)</label>
            <input
              type="number"
              step="0.1"
              min="0"
              value={originZ}
              onChange={(e) => setOriginZ(Number(e.target.value))}
              className={numberCls}
            />
          </div>
        )}

        {/* Floor-click picker */}
        <button
          onClick={handleFloorPickToggle}
          className={
            'py-1.5 px-3 rounded text-sm font-medium transition-colors ' +
            (isPlacing
              ? 'bg-amber-600 hover:bg-amber-500 text-white'
              : 'bg-gray-700 hover:bg-gray-600 text-gray-200')
          }
        >
          {isPlacing ? '↩ Cancel — click floor to place' : '⊕ Pick from Floor'}
        </button>
        {isPlacing && (
          <p className="text-xs text-amber-400 text-center animate-pulse">
            Click anywhere on the floor
          </p>
        )}
      </div>

      {/* ── C: Actions ───────────────────────────────────────────────────── */}
      <div className={`${sectionCls} border-t border-gray-700 pt-3`}>
        <p className={labelCls}>Actions</p>

        <button
          onClick={handleDeploy}
          className="bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold py-2 px-4 rounded text-sm transition-colors"
        >
          Deploy to Floor
        </button>
        <button
          onClick={clearRobots}
          className="bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-gray-200 font-semibold py-2 px-4 rounded text-sm transition-colors"
        >
          Reset Scene
        </button>
        <button
          onClick={triggerCameraReset}
          className="bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-gray-200 font-semibold py-2 px-4 rounded text-sm transition-colors"
        >
          Reset Camera
        </button>
        {/* PHASE 5: Export PNG — triggers ExportCapture inside Canvas */}
        <button
          onClick={() => useSceneStore.getState().triggerExport()}
          className="bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-gray-200 font-semibold py-2 px-4 rounded text-sm transition-colors"
        >
          Export PNG
        </button>
      </div>

      {/* ── D: Save / Load Scene ────────────────────────────────────────── */}
      <div className={`${sectionCls} border-t border-gray-700 pt-3`}>
        <p className={labelCls}>Scene File</p>

        {/* Scene name */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Name</label>
          <input
            type="text"
            value={sceneName}
            onChange={(e) => setSceneName(e.target.value)}
            placeholder="scene"
            className={numberCls}
          />
        </div>

        <button
          onClick={handleSaveScene}
          disabled={saveStatus === 'saving'}
          className={
            'w-full font-semibold py-2 px-3 rounded text-sm transition-colors ' +
            (saveStatus === 'saved'
              ? 'bg-green-700 text-white'
              : saveStatus === 'error'
              ? 'bg-red-800 text-white'
              : 'bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-gray-200 disabled:opacity-50')
          }
        >
          {saveStatus === 'saving' ? 'Saving…'
            : saveStatus === 'saved' ? '✓ Saved'
            : saveStatus === 'error' ? '✗ Save failed'
            : '↓ Save Scene'}
        </button>
        <p className="text-xs text-gray-600 -mt-1">
          Saved to browser storage
        </p>
      </div>

      {/* ── E: Deployed Robots ───────────────────────────────────────────── */}
      <div className={`${sectionCls} border-t border-gray-700 pt-3`}>
        <p className={labelCls}>
          Deployed
          {deployedRobots.length > 0 && (
            <span className="ml-1.5 bg-blue-700 text-blue-100 text-xs font-bold px-1.5 py-0.5 rounded-full normal-case tracking-normal">
              {deployedRobots.length}
            </span>
          )}
        </p>
        <DeployedRobotList />
      </div>

      {/* ── E: Viewport Controls ─────────────────────────────────────────── */}
      <div className={`${sectionCls} border-t border-gray-700 pt-3`}>
        <p className={labelCls}>Viewport Controls</p>

        <button
          onClick={() => {
            const { snapToGridEnabled, setSnapToGridEnabled } = useSceneStore.getState();
            setSnapToGridEnabled(!snapToGridEnabled);
          }}
          className={
            'py-1.5 px-3 rounded text-sm font-medium transition-colors border w-full text-left ' +
            (snapToGridEnabled
              ? 'bg-blue-700 border-blue-500 text-white'
              : 'bg-gray-700 border-gray-600 hover:bg-gray-600 text-gray-200')
          }
        >
          {snapToGridEnabled
            ? `⊞ Snap: ON (${sceneConfig.deployment.snapGridSize} m grid)`
            : '⊟ Snap to Grid'}
        </button>

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={showLabels}
            onChange={(e) => setShowLabels(e.target.checked)}
            className="accent-blue-500 w-3.5 h-3.5"
          />
          <span className="text-sm text-gray-300">Show Labels</span>
        </label>
      </div>

      {/* Camera reference */}
      <div className="border-t border-gray-700 pt-3">
        <p className={labelCls + ' mb-1.5'}>Camera</p>
        <ul className="text-xs text-gray-500 space-y-0.5">
          <li>Left drag → Orbit</li>
          <li>Scroll → Zoom</li>
          <li>Right drag → Pan</li>
        </ul>
      </div>

        </>
      )}

      </div>
    </div>
  );
}
