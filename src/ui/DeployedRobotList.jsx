/**
 * DeployedRobotList.jsx
 *
 * Section D of the control panel: a scrollable list of all deployed robots.
 *
 * Each robot row exposes:
 *   - Short label + mount badge + ⤢ drag + ⊙ focus + ✕ remove
 *   - Color picker + opacity slider (overrides manufacturer default; ↺ resets)
 *   - X / Y position inputs
 *   - Z height slider + number input (platform/ceiling only)
 *   - Rotation slider 0–360°
 */

import { useEffect, useState } from 'react';
import grippersConfig from '../config/grippers_config.json';
import useSceneStore from '../store/sceneStore';

// Manufacturer default colours (mirrors PlaceholderRobot.jsx)
const MANUFACTURER_COLORS = {
  'Universal Robots': '#1565c0',
  'FANUC':            '#f9a825',
  'ABB':              '#c62828',
  'KUKA':             '#e65100',
  'Yaskawa':          '#2e7d32',
};
const DEFAULT_ROBOT_COLOR = '#546e7a';

// ─── Individual robot row ─────────────────────────────────────────────────────

function RobotRow({ robot, isSelected, onUpdateTransform, onUpdateStyle, onRemove, onFocus, onDrag, onDuplicate, onSetGripper, onSetGripperScale, onBind, onUnbind, sceneObjects }) {
  const [localX, setLocalX] = useState(robot.position[0]);
  const [localY, setLocalY] = useState(robot.position[1]);
  const [localZ, setLocalZ] = useState(robot.position[2]);

  // Sync local state when position changes from outside (drag, floor-click, etc.)
  useEffect(() => {
    setLocalX(robot.position[0]);
    setLocalY(robot.position[1]);
    setLocalZ(robot.position[2]);
  }, [robot.position[0], robot.position[1], robot.position[2]]);

  function commitPosition() {
    onUpdateTransform(robot.id, [localX, localY, robot.position[2]], robot.rotation);
  }

  // Z: live-update via slider; commit on number input blur/Enter
  function updateZ(value) {
    setLocalZ(value);
    onUpdateTransform(robot.id, [robot.position[0], robot.position[1], value], robot.rotation);
  }

  function handleRotation(e) {
    onUpdateTransform(robot.id, robot.position, Number(e.target.value));
  }

  function handleFocus() {
    onFocus([robot.position[0], robot.position[2], robot.position[1]]);
  }

  const idNum = robot.id.split('-').pop();
  const shortMfr =
    robot.manufacturer === 'Universal Robots' ? 'UR' : robot.manufacturer;
  const shortLabel = `${shortMfr} ${robot.model} #${idNum}`;

  const inputCls =
    'w-16 bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-xs text-gray-100 ' +
    'focus:outline-none focus:border-blue-500 text-center';
  const smallInputCls =
    'w-14 bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-xs text-gray-100 ' +
    'focus:outline-none focus:border-blue-500 text-center';

  const mountBadgeCls =
    robot.mountType === 'ceiling'
      ? 'bg-purple-900 text-purple-300'
      : robot.mountType === 'platform'
      ? 'bg-teal-900 text-teal-300'
      : 'bg-gray-700 text-gray-400';

  const defaultColor = MANUFACTURER_COLORS[robot.manufacturer] ?? DEFAULT_ROBOT_COLOR;
  const displayColor = robot.colorOverride ?? defaultColor;

  return (
    <div
      className={
        'rounded p-2 flex flex-col gap-1.5 transition-colors ' +
        (isSelected
          ? 'bg-blue-900/50 border border-blue-500'
          : 'bg-gray-800 border border-transparent')
      }
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-medium text-gray-200 truncate flex-1">
          {shortLabel}
        </span>
        <span className={`text-xs px-1 rounded flex-shrink-0 ${mountBadgeCls}`}>
          {robot.mountType}
        </span>
        <button
          onClick={() => onDrag(robot.id)}
          title="Drag in viewport"
          className="text-xs text-gray-400 hover:text-gray-100 px-1 py-0.5 rounded hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          ⤢
        </button>
        <button
          onClick={() => onDuplicate(robot.id)}
          title="Duplicate"
          className="text-xs text-green-400 hover:text-green-300 px-1 py-0.5 rounded hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          ⧉
        </button>
        <button
          onClick={handleFocus}
          title="Focus camera"
          className="text-xs text-blue-400 hover:text-blue-300 px-1 py-0.5 rounded hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          ⊙
        </button>
        <button
          onClick={() => onRemove(robot.id)}
          title="Remove"
          className="text-xs text-red-400 hover:text-red-300 px-1 py-0.5 rounded hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Colour + opacity row */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        <label title="Override robot colour (↺ resets to manufacturer default)" className="flex items-center gap-1 cursor-pointer">
          <span>Col</span>
          <input
            type="color"
            value={displayColor}
            onChange={(e) => onUpdateStyle(robot.id, { colorOverride: e.target.value })}
            className="w-6 h-5 rounded border-0 cursor-pointer bg-transparent p-0"
          />
        </label>
        {robot.colorOverride && (
          <button
            onClick={() => onUpdateStyle(robot.id, { colorOverride: null })}
            title="Reset to manufacturer colour"
            className="text-xs text-gray-400 hover:text-gray-200 px-1 py-0.5 rounded hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            ↺
          </button>
        )}
        <label title="Opacity" className="flex items-center gap-1 flex-1">
          <span className="flex-shrink-0">α</span>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={robot.opacity ?? 1}
            onChange={(e) => onUpdateStyle(robot.id, { opacity: Number(e.target.value) })}
            className="flex-1 accent-blue-500"
          />
          <span className="w-7 text-right flex-shrink-0">
            {Math.round((robot.opacity ?? 1) * 100)}%
          </span>
        </label>
      </div>

      {/* Gripper selector */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <span className="flex-shrink-0">Tool</span>
        <select
          value={robot.gripperId ?? ''}
          onChange={(e) => onSetGripper(robot.id, e.target.value || null)}
          className="flex-1 bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-xs text-gray-100 focus:outline-none focus:border-blue-500"
        >
          <option value="">None</option>
          {grippersConfig.grippers.map((g) => (
            <option key={g.id} value={g.id}>{g.name}</option>
          ))}
        </select>
      </div>

      {/* Gripper scale — only shown when a gripper is attached */}
      {robot.gripperId && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="flex-shrink-0">Size</span>
          <input
            type="range"
            min="0.5"
            max="3"
            step="0.1"
            value={robot.gripperScale ?? 1.0}
            onChange={(e) => onSetGripperScale(robot.id, Number(e.target.value))}
            className="flex-1 accent-blue-500"
          />
          <span className="w-9 text-right flex-shrink-0">
            {(robot.gripperScale ?? 1.0).toFixed(1)}x
          </span>
        </div>
      )}

      {/* 7th Axis / binding controls */}
      {robot.parentObjectId ? (
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-green-400 truncate flex-1">
            7th Axis: {sceneObjects.find((o) => o.id === robot.parentObjectId)?.label ?? robot.parentObjectId}
          </span>
          <button
            onClick={() => onUnbind(robot.id)}
            className="text-xs text-red-400 hover:text-red-300 px-1 py-0.5 rounded hover:bg-gray-700 transition-colors flex-shrink-0"
          >
            Unbind
          </button>
        </div>
      ) : (() => {
        const tracks = sceneObjects.filter((o) => o.shape === 'linear_track');
        return tracks.length > 0 ? (
          <div className="flex items-center gap-1.5 text-xs text-gray-400">
            <span className="flex-shrink-0">7th Axis</span>
            <select
              value=""
              onChange={(e) => { if (e.target.value) onBind(robot.id, e.target.value); }}
              className="flex-1 bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-xs text-gray-100 focus:outline-none focus:border-blue-500"
            >
              <option value="">-- Select track --</option>
              {tracks.map((o) => (
                <option key={o.id} value={o.id}>{o.label}</option>
              ))}
            </select>
          </div>
        ) : null;
      })()}

      {/* Position inputs */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <span>X</span>
        <input
          type="number"
          step="0.5"
          value={localX}
          onChange={(e) => setLocalX(Number(e.target.value))}
          onBlur={commitPosition}
          onKeyDown={(e) => e.key === 'Enter' && commitPosition()}
          className={inputCls}
        />
        <span>Y</span>
        <input
          type="number"
          step="0.5"
          value={localY}
          onChange={(e) => setLocalY(Number(e.target.value))}
          onBlur={commitPosition}
          onKeyDown={(e) => e.key === 'Enter' && commitPosition()}
          className={inputCls}
        />
      </div>

      {/* Z height slider — shown for platform and ceiling robots */}
      {robot.mountType !== 'floor' && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="flex-shrink-0">Z</span>
          <input
            type="range"
            min="0"
            max="6"
            step="0.05"
            value={localZ}
            onChange={(e) => updateZ(Number(e.target.value))}
            className="flex-1 accent-blue-500"
          />
          <input
            type="number"
            step="0.05"
            min="0"
            value={localZ}
            onChange={(e) => setLocalZ(Number(e.target.value))}
            onBlur={() => updateZ(localZ)}
            onKeyDown={(e) => e.key === 'Enter' && updateZ(localZ)}
            className={smallInputCls}
          />
          <span className="text-gray-500">m</span>
        </div>
      )}

      {/* Rotation slider */}
      <div className="flex items-center gap-1.5 text-xs text-gray-400">
        <span className="flex-shrink-0">Rot</span>
        <input
          type="range"
          min="0"
          max="360"
          step="15"
          value={robot.rotation}
          onChange={handleRotation}
          className="flex-1 accent-blue-500"
        />
        <span className="w-9 text-right text-gray-300 flex-shrink-0">
          {Math.round(robot.rotation)}°
        </span>
      </div>
    </div>
  );
}

// ─── List container ───────────────────────────────────────────────────────────

export default function DeployedRobotList() {
  const deployedRobots = useSceneStore((s) => s.deployedRobots);
  const sceneObjects = useSceneStore((s) => s.sceneObjects);
  const updateRobotTransform = useSceneStore((s) => s.updateRobotTransform);
  const updateRobotStyle = useSceneStore((s) => s.updateRobotStyle);
  const removeRobot = useSceneStore((s) => s.removeRobot);
  const setFocusTarget = useSceneStore((s) => s.setFocusTarget);
  const selectedRobotId = useSceneStore((s) => s.selectedRobotId);
  const setSelectedRobotId = useSceneStore((s) => s.setSelectedRobotId);
  const setInteractionMode = useSceneStore((s) => s.setInteractionMode);
  const setRobotGripper = useSceneStore((s) => s.setRobotGripper);
  const setRobotGripperScale = useSceneStore((s) => s.setRobotGripperScale);
  const duplicateRobot = useSceneStore((s) => s.duplicateRobot);
  const bindRobotToObject = useSceneStore((s) => s.bindRobotToObject);
  const unbindRobot = useSceneStore((s) => s.unbindRobot);

  function handleDrag(id) {
    setSelectedRobotId(id);
    setInteractionMode('drag');
  }

  if (deployedRobots.length === 0) {
    return (
      <p className="text-xs text-gray-500 italic px-1">
        No robots deployed yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-0.5">
      {deployedRobots.map((robot) => (
        <RobotRow
          key={robot.id}
          robot={robot}
          isSelected={selectedRobotId === robot.id}
          onUpdateTransform={updateRobotTransform}
          onUpdateStyle={updateRobotStyle}
          onRemove={removeRobot}
          onFocus={setFocusTarget}
          onDrag={handleDrag}
          onDuplicate={duplicateRobot}
          onSetGripper={setRobotGripper}
          onSetGripperScale={setRobotGripperScale}
          onBind={bindRobotToObject}
          onUnbind={unbindRobot}
          sceneObjects={sceneObjects}
        />
      ))}
    </div>
  );
}
