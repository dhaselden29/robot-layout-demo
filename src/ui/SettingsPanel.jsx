/**
 * SettingsPanel.jsx
 *
 * "GENERAL" tab — runtime-tunable visual settings for the 3D viewport.
 *
 * Sections:
 *   - Lighting: ambient intensity, directional intensity, shadows toggle
 *   - Environment: background colour, fog toggle
 *   - Floor: floor colour, grid toggle
 *   - Reset Defaults button
 *
 * All values are stored in sceneStore.sceneSettings and read reactively
 * by SceneSetup.jsx and FloorGrid.jsx.
 */

import useSceneStore from '../store/sceneStore';

const labelCls = 'text-xs font-semibold text-gray-400 uppercase tracking-wider';
const sectionCls = 'flex flex-col gap-2';

function SliderRow({ label, value, onChange, min = 0, max = 1, step = 0.05 }) {
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between">
        <label className="text-xs text-gray-500">{label}</label>
        <span className="text-xs text-gray-400 tabular-nums">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full accent-blue-500"
      />
    </div>
  );
}

function ToggleRow({ label, checked, onChange }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer select-none">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="accent-blue-500 w-3.5 h-3.5"
      />
      <span className="text-sm text-gray-300">{label}</span>
    </label>
  );
}

function ColorRow({ label, value, onChange }) {
  return (
    <div className="flex items-center gap-2">
      <label className="text-xs text-gray-500 flex-1">{label}</label>
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-7 h-7 rounded border border-gray-600 bg-transparent cursor-pointer"
      />
      <span className="text-xs text-gray-500 font-mono w-16">{value}</span>
    </div>
  );
}

export default function SettingsPanel() {
  const settings = useSceneStore((s) => s.sceneSettings);
  const update = useSceneStore((s) => s.updateSceneSettings);
  const reset = useSceneStore((s) => s.resetSceneSettings);

  return (
    <div className="flex flex-col gap-4">

      {/* ── Lighting ── */}
      <div className={sectionCls}>
        <p className={labelCls}>Lighting</p>
        <SliderRow
          label="Ambient"
          value={settings.ambientIntensity}
          onChange={(v) => update({ ambientIntensity: v })}
        />
        <SliderRow
          label="Directional"
          value={settings.directionalIntensity}
          onChange={(v) => update({ directionalIntensity: v })}
        />
        <ToggleRow
          label="Shadows"
          checked={settings.shadowsEnabled}
          onChange={(v) => update({ shadowsEnabled: v })}
        />
      </div>

      {/* ── Environment ── */}
      <div className={`${sectionCls} border-t border-gray-700 pt-3`}>
        <p className={labelCls}>Environment</p>
        <ColorRow
          label="Background"
          value={settings.backgroundColor}
          onChange={(v) => update({ backgroundColor: v })}
        />
        <ToggleRow
          label="Fog"
          checked={settings.fogEnabled}
          onChange={(v) => update({ fogEnabled: v })}
        />
      </div>

      {/* ── Floor ── */}
      <div className={`${sectionCls} border-t border-gray-700 pt-3`}>
        <p className={labelCls}>Floor</p>
        <ColorRow
          label="Floor colour"
          value={settings.floorColor}
          onChange={(v) => update({ floorColor: v })}
        />
        <ToggleRow
          label="Grid"
          checked={settings.gridVisible}
          onChange={(v) => update({ gridVisible: v })}
        />
      </div>

      {/* ── Reset ── */}
      <div className="border-t border-gray-700 pt-3">
        <button
          onClick={reset}
          className="w-full bg-gray-700 hover:bg-gray-600 active:bg-gray-800 text-gray-200 font-semibold py-2 px-4 rounded text-sm transition-colors"
        >
          Reset Defaults
        </button>
      </div>

    </div>
  );
}
