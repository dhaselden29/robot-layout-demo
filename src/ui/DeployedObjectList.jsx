/**
 * DeployedObjectList.jsx
 *
 * Section D of the Equipment tab: scrollable list of all deployed scene objects.
 *
 * Each row exposes:
 *   - Name + category badge + ⤢ drag + ⊙ focus + ✕ remove
 *   - Color picker + opacity slider (all objects; live update)
 *   - ⊕ Mount Robot Here button — pre-fills robot tab form with object surface Z
 *   - Editable dimension inputs (shape-dependent, from getEditableDimensions)
 *   - Read-only spec info for materials (getSpecInfo)
 *   - X / Y position inputs
 *   - Z height input (non-floor only)
 *   - Rotation slider 0–360°
 */

import { useEffect, useState } from 'react';
import useSceneStore from '../store/sceneStore';
import { getEditableDimensions, getObjectTopSurface, getSpecInfo } from '../utils/objectUtils';

// ─── Individual object row ────────────────────────────────────────────────────

function ObjectRow({ object, isSelected, onUpdateTransform, onUpdateDimensions, onUpdateStyle, onMountRobot, onRemove, onFocus, onDrag }) {
  const [localX, setLocalX] = useState(object.position[0]);
  const [localY, setLocalY] = useState(object.position[1]);
  const [localZ, setLocalZ] = useState(object.position[2]);
  const [localDims, setLocalDims] = useState({ ...object.dimensions });

  // Sync when position changes externally (drag)
  useEffect(() => {
    setLocalX(object.position[0]);
    setLocalY(object.position[1]);
    setLocalZ(object.position[2]);
  }, [object.position[0], object.position[1], object.position[2]]);

  function commitPosition() {
    onUpdateTransform(object.id, [localX, localY, object.position[2]], object.rotation);
  }

  function commitZ() {
    onUpdateTransform(object.id, [object.position[0], object.position[1], localZ], object.rotation);
  }

  function commitDim(key, value) {
    const updated = { ...localDims, [key]: value };
    setLocalDims(updated);
    onUpdateDimensions(object.id, { [key]: value });
  }

  function handleRotation(e) {
    onUpdateTransform(object.id, object.position, Number(e.target.value));
  }

  function handleFocus() {
    onFocus([object.position[0], object.position[2], object.position[1]]);
  }

  const inputCls =
    'w-16 bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-xs text-gray-100 ' +
    'focus:outline-none focus:border-blue-500 text-center';
  const smallInputCls =
    'w-14 bg-gray-700 border border-gray-600 rounded px-1 py-0.5 text-xs text-gray-100 ' +
    'focus:outline-none focus:border-blue-500 text-center';

  // Category badge colours
  const catBadgeCls =
    object.category === 'materials'
      ? 'bg-orange-900 text-orange-300'
      : object.category === 'equipment'
      ? 'bg-teal-900 text-teal-300'
      : 'bg-gray-700 text-gray-400';

  const editableDims = getEditableDimensions(object.shape);
  const specInfo = getSpecInfo(object.shape, object.dimensions);

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
          {object.label}
        </span>
        <span className={`text-xs px-1 rounded flex-shrink-0 ${catBadgeCls}`}>
          {object.category}
        </span>
        <button
          onClick={() => onDrag(object.id)}
          title="Drag in viewport"
          className="text-xs text-gray-400 hover:text-gray-100 px-1 py-0.5 rounded hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          ⤢
        </button>
        <button
          onClick={handleFocus}
          title="Focus camera"
          className="text-xs text-blue-400 hover:text-blue-300 px-1 py-0.5 rounded hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          ⊙
        </button>
        <button
          onClick={() => onRemove(object.id)}
          title="Remove"
          className="text-xs text-red-400 hover:text-red-300 px-1 py-0.5 rounded hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          ✕
        </button>
      </div>

      {/* Colour + opacity + mount-robot row */}
      <div className="flex items-center gap-2 text-xs text-gray-400">
        {/* Colour swatch — opens native colour picker */}
        <label title="Object colour" className="flex items-center gap-1 cursor-pointer">
          <span>Col</span>
          <input
            type="color"
            value={object.color}
            onChange={(e) => onUpdateStyle(object.id, { color: e.target.value })}
            className="w-6 h-5 rounded border-0 cursor-pointer bg-transparent p-0"
          />
        </label>
        {/* Opacity slider */}
        <label title="Opacity" className="flex items-center gap-1 flex-1">
          <span className="flex-shrink-0">α</span>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={object.opacity ?? 1}
            onChange={(e) => onUpdateStyle(object.id, { opacity: Number(e.target.value) })}
            className="flex-1 accent-blue-500"
          />
          <span className="w-7 text-right flex-shrink-0">
            {Math.round((object.opacity ?? 1) * 100)}%
          </span>
        </label>
        {/* Mount Robot Here */}
        <button
          onClick={() => onMountRobot(object)}
          title="Mount robot on top of this object"
          className="text-xs text-green-400 hover:text-green-300 px-1 py-0.5 rounded hover:bg-gray-700 transition-colors flex-shrink-0"
        >
          ⊕ Robot
        </button>
      </div>

      {/* Dimension inputs */}
      {editableDims.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 text-xs text-gray-400">
          {editableDims.map(({ key, label, step }) => (
            <div key={key} className="flex items-center gap-1">
              <span>{label}</span>
              <input
                type="number"
                step={step}
                min={step}
                value={localDims[key] ?? object.dimensions[key]}
                onChange={(e) => {
                  const v = Number(e.target.value);
                  setLocalDims((d) => ({ ...d, [key]: v }));
                }}
                onBlur={(e) => commitDim(key, Number(e.target.value))}
                onKeyDown={(e) => e.key === 'Enter' && commitDim(key, Number(e.target.value))}
                className={inputCls}
              />
            </div>
          ))}
          {specInfo && (
            <span className="text-gray-500 text-xs ml-0.5">{specInfo}</span>
          )}
        </div>
      )}

      {/* X / Y position */}
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

      {/* Z height slider + number (non-floor only) */}
      {object.mountType !== 'floor' && (
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <span className="flex-shrink-0">Z</span>
          <input
            type="range"
            min="0"
            max="6"
            step="0.05"
            value={localZ}
            onChange={(e) => {
              const v = Number(e.target.value);
              setLocalZ(v);
              onUpdateTransform(object.id, [object.position[0], object.position[1], v], object.rotation);
            }}
            className="flex-1 accent-blue-500"
          />
          <input
            type="number"
            step="0.05"
            min="0"
            value={localZ}
            onChange={(e) => setLocalZ(Number(e.target.value))}
            onBlur={commitZ}
            onKeyDown={(e) => e.key === 'Enter' && commitZ()}
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
          value={object.rotation}
          onChange={handleRotation}
          className="flex-1 accent-blue-500"
        />
        <span className="w-9 text-right text-gray-300 flex-shrink-0">
          {Math.round(object.rotation)}°
        </span>
      </div>
    </div>
  );
}

// ─── List container ───────────────────────────────────────────────────────────

export default function DeployedObjectList() {
  const sceneObjects = useSceneStore((s) => s.sceneObjects);
  const updateObjectTransform = useSceneStore((s) => s.updateObjectTransform);
  const updateObjectDimensions = useSceneStore((s) => s.updateObjectDimensions);
  const updateObjectStyle = useSceneStore((s) => s.updateObjectStyle);
  const removeObject = useSceneStore((s) => s.removeObject);
  const setFocusTarget = useSceneStore((s) => s.setFocusTarget);
  const selectedObjectId = useSceneStore((s) => s.selectedObjectId);
  const setSelectedObjectId = useSceneStore((s) => s.setSelectedObjectId);
  const setInteractionMode = useSceneStore((s) => s.setInteractionMode);
  const setPendingMountTarget = useSceneStore((s) => s.setPendingMountTarget);
  const setPendingBindTarget = useSceneStore((s) => s.setPendingBindTarget);
  const setActiveSidebarTab = useSceneStore((s) => s.setActiveSidebarTab);

  function handleDrag(id) {
    setSelectedObjectId(id);
    setInteractionMode('drag');
  }

  function handleMountRobot(object) {
    const surfaceZ = object.position[2] + getObjectTopSurface(object.shape, object.dimensions);
    setPendingMountTarget({
      label: object.label,
      x: object.position[0],
      y: object.position[1],
      z: surfaceZ,
    });
    // Phase 7: Also set bind target so deployed robots are auto-bound
    setPendingBindTarget({ objectId: object.id });
    setActiveSidebarTab('robot');
  }

  if (sceneObjects.length === 0) {
    return (
      <p className="text-xs text-gray-500 italic px-1">
        No objects deployed yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2 max-h-72 overflow-y-auto pr-0.5">
      {sceneObjects.map((object) => (
        <ObjectRow
          key={object.id}
          object={object}
          isSelected={selectedObjectId === object.id}
          onUpdateTransform={updateObjectTransform}
          onUpdateDimensions={updateObjectDimensions}
          onUpdateStyle={updateObjectStyle}
          onMountRobot={handleMountRobot}
          onRemove={removeObject}
          onFocus={setFocusTarget}
          onDrag={handleDrag}
        />
      ))}
    </div>
  );
}
