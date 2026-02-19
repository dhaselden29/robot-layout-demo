/**
 * EquipmentPanel.jsx
 *
 * Equipment tab content for the left sidebar. Mirrors the robot panel structure.
 *
 * Sections:
 *   A  ADD OBJECT
 *      Category toggle (Shapes / Equipment / Materials)
 *      Item selector
 *      Dimension inputs (editable fields for the selected item's shape)
 *      Count input
 *
 *   B  PLACEMENT
 *      X / Y origin, Rotation slider, Mount type, Height input,
 *      ⊕ Pick from Floor button
 *
 *   C  ACTIONS
 *      Deploy to Floor · Reset Objects
 *
 *   D  DEPLOYED OBJECTS
 *      <DeployedObjectList />
 */

import { useEffect, useState } from 'react';
import equipmentConfig from '../config/equipment_config.json';
import sceneConfig from '../config/config.json';
import useSceneStore from '../store/sceneStore';
import { buildObjectInstances, getEditableDimensions } from '../utils/objectUtils';
import DeployedObjectList from './DeployedObjectList';

const categoryKeys = Object.keys(equipmentConfig.categories);

// ─── Shared styles ────────────────────────────────────────────────────────────
const selectCls =
  'bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100 ' +
  'focus:outline-none focus:border-blue-500 w-full';
const numberCls =
  'bg-gray-800 border border-gray-600 rounded px-2 py-1.5 text-sm text-gray-100 ' +
  'focus:outline-none focus:border-blue-500 w-full';
const labelCls = 'text-xs font-semibold text-gray-400 uppercase tracking-wider';
const sectionCls = 'flex flex-col gap-2';

function mountBtnCls(active) {
  return (
    'flex-1 py-1 rounded text-xs font-medium transition-colors border ' +
    (active
      ? 'bg-blue-700 border-blue-500 text-white'
      : 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-300')
  );
}

function catBtnCls(active) {
  return (
    'flex-1 py-1 rounded text-xs font-medium transition-colors border ' +
    (active
      ? 'bg-teal-700 border-teal-500 text-white'
      : 'bg-gray-800 border-gray-600 hover:bg-gray-700 text-gray-300')
  );
}

export default function EquipmentPanel() {
  const addObjects = useSceneStore((s) => s.addObjects);
  const nextObjectId = useSceneStore((s) => s.nextObjectId);
  const clearObjects = useSceneStore((s) => s.clearObjects);
  const sceneObjects = useSceneStore((s) => s.sceneObjects);
  const interactionMode = useSceneStore((s) => s.interactionMode);
  const setInteractionMode = useSceneStore((s) => s.setInteractionMode);
  const floorClickCoords = useSceneStore((s) => s.floorClickCoords);
  const setFloorClickCoords = useSceneStore((s) => s.setFloorClickCoords);

  // ── Section A state ──────────────────────────────────────────────────────
  const [category, setCategory] = useState(categoryKeys[0]);
  const [itemId, setItemId] = useState(
    equipmentConfig.categories[categoryKeys[0]].items[0].id
  );
  const [count, setCount] = useState(1);
  const [dimOverrides, setDimOverrides] = useState({});

  // ── Section B state ──────────────────────────────────────────────────────
  const [originX, setOriginX] = useState(0);
  const [originY, setOriginY] = useState(0);
  const [rotationDeg, setRotationDeg] = useState(0);
  const [mountType, setMountType] = useState('floor');
  const [originZ, setOriginZ] = useState(0);

  // Resolve current item and its shape
  const categoryItems = equipmentConfig.categories[category].items;
  const currentItem = categoryItems.find((i) => i.id === itemId) ?? categoryItems[0];
  const editableDims = getEditableDimensions(currentItem.shape);

  // Reset item + dim overrides when category changes
  function handleCategoryChange(cat) {
    setCategory(cat);
    const firstItem = equipmentConfig.categories[cat].items[0];
    setItemId(firstItem.id);
    setDimOverrides({});
  }

  // Reset dim overrides when item changes
  function handleItemChange(id) {
    setItemId(id);
    setDimOverrides({});
  }

  function handleMountTypeChange(type) {
    setMountType(type);
    if (type === 'floor') setOriginZ(0);
    else if (type === 'platform') setOriginZ(sceneConfig.deployment.platformDefaultHeight);
    else if (type === 'ceiling') setOriginZ(sceneConfig.floor.wallHeight);
  }

  // Consume floor-click coords
  useEffect(() => {
    if (!floorClickCoords) return;
    setOriginX(floorClickCoords[0]);
    setOriginY(floorClickCoords[1]);
    setFloorClickCoords(null);
  }, [floorClickCoords, setFloorClickCoords]);

  function handleDeploy() {
    const instances = buildObjectInstances(
      category,
      itemId,
      count,
      originX,
      originY,
      rotationDeg,
      nextObjectId,
      mountType,
      originZ,
      dimOverrides
    );
    addObjects(instances);
  }

  function handleFloorPickToggle() {
    setInteractionMode(interactionMode === 'place' ? 'orbit' : 'place');
  }

  const isPlacing = interactionMode === 'place';
  const showHeightInput = mountType !== 'floor';

  return (
    <>
      {/* ── A: Add Object ─────────────────────────────────────────────────── */}
      <div className={sectionCls}>
        <p className={labelCls}>Add Object</p>

        {/* Category toggle */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Category</label>
          <div className="flex gap-1">
            {categoryKeys.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={catBtnCls(category === cat)}
              >
                {equipmentConfig.categories[cat].label}
              </button>
            ))}
          </div>
        </div>

        {/* Item selector */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Item</label>
          <select
            value={itemId}
            onChange={(e) => handleItemChange(e.target.value)}
            className={selectCls}
          >
            {categoryItems.map((item) => (
              <option key={item.id} value={item.id}>{item.name}</option>
            ))}
          </select>
        </div>

        {/* Editable dimension inputs */}
        {editableDims.length > 0 && (
          <div className="flex flex-col gap-1">
            <label className="text-xs text-gray-500">Dimensions (m)</label>
            <div className="flex gap-2 flex-wrap">
              {editableDims.map(({ key, label, step }) => {
                const defaultVal = currentItem.defaultDimensions[key] ?? 1;
                const currentVal = dimOverrides[key] ?? defaultVal;
                return (
                  <div key={key} className="flex flex-col gap-0.5 flex-1 min-w-[4rem]">
                    <label className="text-xs text-gray-500">{label}</label>
                    <input
                      type="number"
                      step={step}
                      min={step}
                      value={currentVal}
                      onChange={(e) =>
                        setDimOverrides((d) => ({
                          ...d,
                          [key]: Number(e.target.value),
                        }))
                      }
                      className={numberCls}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Count */}
        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Count</label>
          <input
            type="number"
            min={1}
            max={sceneConfig.robots.maxCount}
            value={count}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              if (!isNaN(v)) setCount(Math.min(Math.max(v, 1), sceneConfig.robots.maxCount));
            }}
            className={numberCls}
          />
        </div>
      </div>

      {/* ── B: Placement ──────────────────────────────────────────────────── */}
      <div className={`${sectionCls} border-t border-gray-700 pt-3`}>
        <p className={labelCls}>Placement</p>

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

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">
            Rotation — {Math.round(rotationDeg)}°
          </label>
          <input
            type="range"
            min="0"
            max="360"
            step="1"
            value={rotationDeg}
            onChange={(e) => setRotationDeg(Number(e.target.value))}
            className="w-full accent-blue-500"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs text-gray-500">Mount</label>
          <div className="flex gap-1">
            <button onClick={() => handleMountTypeChange('floor')} className={mountBtnCls(mountType === 'floor')}>Floor</button>
            <button onClick={() => handleMountTypeChange('platform')} className={mountBtnCls(mountType === 'platform')}>Platform</button>
            <button onClick={() => handleMountTypeChange('ceiling')} className={mountBtnCls(mountType === 'ceiling')}>Ceiling</button>
          </div>
        </div>

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

      {/* ── C: Actions ────────────────────────────────────────────────────── */}
      <div className={`${sectionCls} border-t border-gray-700 pt-3`}>
        <p className={labelCls}>Actions</p>

        <button
          onClick={handleDeploy}
          className="bg-teal-700 hover:bg-teal-600 active:bg-teal-800 text-white font-semibold py-2 px-4 rounded text-sm transition-colors"
        >
          Deploy to Floor
        </button>
        <button
          onClick={clearObjects}
          className="bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-gray-200 font-semibold py-2 px-4 rounded text-sm transition-colors"
        >
          Reset Objects
        </button>
      </div>

      {/* ── D: Deployed Objects ───────────────────────────────────────────── */}
      <div className={`${sectionCls} border-t border-gray-700 pt-3`}>
        <p className={labelCls}>
          Deployed
          {sceneObjects.length > 0 && (
            <span className="ml-1.5 bg-teal-700 text-teal-100 text-xs font-bold px-1.5 py-0.5 rounded-full normal-case tracking-normal">
              {sceneObjects.length}
            </span>
          )}
        </p>
        <DeployedObjectList />
      </div>
    </>
  );
}
