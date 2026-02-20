/**
 * JointsPanel.jsx
 *
 * "JOINTS" tab — lets the user select any deployed robot and adjust each
 * joint axis via individual sliders.
 *
 * Data flow:
 *   URDFRobot writes joint metadata to the store after loading
 *     → robotJointMeta[robotId] = [{ name, type, lower, upper }]
 *   Slider onChange writes angles to the store
 *     → robotJointAngles[robotId][jointName] = radians
 *   URDFRobot watches robotJointAngles and calls setJointValue live
 *
 * Robots without a URDF (placeholder models) show an informational warning.
 */

import { useEffect, useState } from 'react';
import useSceneStore from '../store/sceneStore';

const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;

/** Convert a URDF joint name to a readable label.
 *  "shoulder_pan_joint" → "Shoulder Pan"
 *  "joint_1"            → "Joint 1"
 *  "wrist_1_joint"      → "Wrist 1"
 */
function formatJointName(name) {
  return name
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/ Joint$/, '');
}

// ─── Individual joint row ────────────────────────────────────────────────────

function JointRow({ robotId, joint, angle }) {
  const setRobotJointAngle = useSceneStore((s) => s.setRobotJointAngle);

  const angleDeg = angle * RAD2DEG;
  const lowerDeg = Math.round(joint.lower * RAD2DEG);
  const upperDeg = Math.round(joint.upper * RAD2DEG);

  function handleChange(e) {
    setRobotJointAngle(robotId, joint.name, Number(e.target.value) * DEG2RAD);
  }

  function handleReset() {
    setRobotJointAngle(robotId, joint.name, 0);
  }

  return (
    <div className="flex flex-col gap-0.5">
      {/* Label row */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs font-medium text-gray-300 truncate flex-1">
          {formatJointName(joint.name)}
        </span>
        <span className="text-xs text-blue-300 w-14 text-right flex-shrink-0 font-mono">
          {angleDeg.toFixed(1)}°
        </span>
        <button
          onClick={handleReset}
          title="Reset to 0°"
          className="text-xs text-gray-500 hover:text-gray-200 px-1 rounded hover:bg-gray-700 transition-colors flex-shrink-0 leading-none"
        >
          ↺
        </button>
      </div>

      {/* Slider */}
      <input
        type="range"
        min={lowerDeg}
        max={upperDeg}
        step={1}
        value={angleDeg}
        onChange={handleChange}
        className="w-full accent-blue-500"
      />

      {/* Range hint */}
      <div className="flex justify-between text-xs text-gray-600 -mt-0.5">
        <span>{lowerDeg}°</span>
        <span>{upperDeg}°</span>
      </div>
    </div>
  );
}

// ─── Panel ───────────────────────────────────────────────────────────────────

export default function JointsPanel() {
  const deployedRobots = useSceneStore((s) => s.deployedRobots);
  const robotJointMeta = useSceneStore((s) => s.robotJointMeta);
  const robotJointAngles = useSceneStore((s) => s.robotJointAngles);
  const clearRobotJoints = useSceneStore((s) => s.clearRobotJoints);
  const setRobotTrackPosition = useSceneStore((s) => s.setRobotTrackPosition);
  const storeSelectedRobotId = useSceneStore((s) => s.selectedRobotId);

  const [selectedRobotId, setSelectedRobotId] = useState(null);

  // Sync from viewport selection — when a robot is clicked in the 3D scene,
  // storeSelectedRobotId updates and the panel follows it automatically.
  useEffect(() => {
    if (storeSelectedRobotId && deployedRobots.find((r) => r.id === storeSelectedRobotId)) {
      setSelectedRobotId(storeSelectedRobotId);
    }
  }, [storeSelectedRobotId, deployedRobots]);

  // Auto-select first robot; fall back when selected robot is removed
  useEffect(() => {
    if (selectedRobotId && deployedRobots.find((r) => r.id === selectedRobotId)) return;
    setSelectedRobotId(deployedRobots[0]?.id ?? null);
  }, [deployedRobots, selectedRobotId]);

  const robot = deployedRobots.find((r) => r.id === selectedRobotId) ?? null;
  const meta = selectedRobotId ? (robotJointMeta[selectedRobotId] ?? null) : null;
  const angles = selectedRobotId ? (robotJointAngles[selectedRobotId] ?? {}) : {};

  const labelCls = 'text-xs font-semibold text-gray-400 uppercase tracking-wider';
  const selectCls =
    'bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100 ' +
    'focus:outline-none focus:border-blue-500 w-full';

  // ── No robots ──────────────────────────────────────────────────────────────
  if (deployedRobots.length === 0) {
    return (
      <p className="text-xs text-gray-500 italic px-1">
        No robots deployed yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">

      {/* ── Robot selector ──────────────────────────────────────────────── */}
      <div className="flex flex-col gap-2">
        <p className={labelCls}>Select Robot</p>
        <select
          value={selectedRobotId ?? ''}
          onChange={(e) => setSelectedRobotId(e.target.value)}
          className={selectCls}
        >
          {deployedRobots.map((r) => (
            <option key={r.id} value={r.id}>
              {r.label}
            </option>
          ))}
        </select>
      </div>

      {/* ── Track position (7th axis) ─────────────────────────────────── */}
      {robot && robot.trackPosition !== null && robot.trackPosition !== undefined && (
        <div className="flex flex-col gap-1">
          <div className="flex items-center justify-between">
            <p className={labelCls}>Track Position (7th Axis)</p>
            <span className="text-xs text-green-300 font-mono">
              {Math.round(robot.trackPosition * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={Math.round(robot.trackPosition * 100)}
            onChange={(e) => setRobotTrackPosition(selectedRobotId, Number(e.target.value) / 100)}
            className="w-full accent-green-500"
          />
          <div className="flex justify-between text-xs text-gray-600 -mt-0.5">
            <span>0%</span>
            <span>100%</span>
          </div>
        </div>
      )}

      {/* ── Joint controls ──────────────────────────────────────────────── */}
      {robot && (
        <>
          {/* Placeholder robot — no URDF */}
          {!robot.urdf && (
            <div className="rounded bg-amber-900/30 border border-amber-700/50 px-3 py-2 text-xs text-amber-300">
              No URDF model available for this robot. Joint control requires a
              URDF model (UR5e, FANUC LRMate200iD, ABB IRB120).
            </div>
          )}

          {/* URDF robot — still loading */}
          {robot.urdf && meta === null && (
            <p className="text-xs text-gray-500 italic px-1">
              Loading joint data…
            </p>
          )}

          {/* URDF robot — loaded, show sliders */}
          {robot.urdf && meta !== null && meta.length > 0 && (
            <div className="flex flex-col gap-1">
              {/* Section header + Reset All */}
              <div className="flex items-center justify-between">
                <p className={labelCls}>Joint Angles</p>
                <button
                  onClick={() => clearRobotJoints(selectedRobotId)}
                  className="text-xs text-gray-500 hover:text-gray-200 px-2 py-0.5 rounded hover:bg-gray-700 transition-colors"
                >
                  Reset All
                </button>
              </div>

              {/* Divider */}
              <div className="border-t border-gray-700 mb-1" />

              {/* One row per joint */}
              <div className="flex flex-col gap-3">
                {meta.map((joint) => (
                  <JointRow
                    key={joint.name}
                    robotId={selectedRobotId}
                    joint={joint}
                    angle={angles[joint.name] ?? 0}
                  />
                ))}
              </div>
            </div>
          )}

          {/* URDF robot — no controllable joints (edge case) */}
          {robot.urdf && meta !== null && meta.length === 0 && (
            <p className="text-xs text-gray-500 italic px-1">
              No controllable joints found in URDF.
            </p>
          )}
        </>
      )}
    </div>
  );
}
