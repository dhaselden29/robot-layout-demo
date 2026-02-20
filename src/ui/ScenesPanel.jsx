/**
 * ScenesPanel.jsx
 *
 * "SAVES" tab — lists all scenes stored in browser localStorage.
 * Each scene can be loaded, exported to a .json file, or deleted.
 * An Import button lets users load .json files from disk (Documents,
 * Sharepoint, etc.) into localStorage.
 *
 * Storage is managed by src/utils/sceneStorage.js.
 */

import { useEffect, useState } from 'react';
import useSceneStore from '../store/sceneStore';
import {
  listScenes,
  loadScene,
  deleteScene,
  saveScene,
  exportSceneToFile,
  importSceneFromFile,
} from '../utils/sceneStorage';

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
    + ' \u00b7 '
    + d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

export default function ScenesPanel() {
  const [scenes, setScenes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loadingName, setLoadingName] = useState(null);
  const [deletingName, setDeletingName] = useState(null);

  function fetchScenes() {
    setLoading(true);
    setError(null);
    try {
      setScenes(listScenes());
    } catch {
      setError('Could not read saved scenes from browser storage.');
    }
    setLoading(false);
  }

  useEffect(() => { fetchScenes(); }, []);

  function handleLoad(name) {
    setLoadingName(name);
    try {
      const data = loadScene(name);
      if (!data || !Array.isArray(data.deployedRobots)) {
        throw new Error('Invalid scene file');
      }
      useSceneStore.getState().restoreScene(data);
    } catch {
      alert(`Failed to load "${name}".`);
    }
    setLoadingName(null);
  }

  function handleDelete(name) {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingName(name);
    try {
      deleteScene(name);
      fetchScenes();
    } catch {
      alert(`Failed to delete "${name}".`);
    }
    setDeletingName(null);
  }

  function handleExport(name) {
    const data = loadScene(name);
    if (!data) { alert(`Scene "${name}" not found.`); return; }
    exportSceneToFile(name, data);
  }

  async function handleImport() {
    try {
      const { name, scene } = await importSceneFromFile();
      saveScene(name, scene);
      fetchScenes();
    } catch {
      // User cancelled or invalid file — do nothing
    }
  }

  const labelCls = 'text-xs font-semibold text-gray-400 uppercase tracking-wider';
  const btnCls = (color) =>
    `text-xs font-medium px-2 py-0.5 rounded transition-colors ${color}`;

  if (error) {
    return (
      <div className="flex flex-col gap-3">
        <div className="rounded bg-red-900/30 border border-red-700/50 px-3 py-2 text-xs text-red-300">
          {error}
        </div>
        <button
          onClick={fetchScenes}
          className="text-xs text-gray-400 hover:text-gray-200 underline text-left"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">

      {/* Header row */}
      <div className="flex items-center justify-between">
        <p className={labelCls}>Saved Scenes</p>
        <div className="flex gap-1">
          <button
            onClick={handleImport}
            title="Import scene from file"
            className="text-gray-500 hover:text-gray-200 text-sm leading-none px-1 rounded hover:bg-gray-700 transition-colors"
          >
            &uarr;
          </button>
          <button
            onClick={fetchScenes}
            title="Refresh list"
            className="text-gray-500 hover:text-gray-200 text-sm leading-none px-1 rounded hover:bg-gray-700 transition-colors"
          >
            &#x27F3;
          </button>
        </div>
      </div>

      {/* Loading spinner */}
      {loading && (
        <p className="text-xs text-gray-500 italic">Loading&hellip;</p>
      )}

      {/* Empty state */}
      {!loading && scenes.length === 0 && (
        <p className="text-xs text-gray-500 italic">
          No saved scenes yet. Use the ROBOT tab to save your first scene.
        </p>
      )}

      {/* Scene list */}
      {!loading && scenes.length > 0 && (
        <div className="flex flex-col gap-2">
          {scenes.map((scene) => (
            <div
              key={scene.name}
              className="flex flex-col gap-1.5 bg-gray-800 border border-gray-700 rounded px-3 py-2"
            >
              {/* Name */}
              <p className="text-sm text-gray-100 font-medium truncate" title={scene.name}>
                {scene.name}
              </p>

              {/* Date */}
              <p className="text-xs text-gray-500">{formatDate(scene.savedAt)}</p>

              {/* Actions */}
              <div className="flex gap-1.5 mt-0.5">
                <button
                  onClick={() => handleLoad(scene.name)}
                  disabled={loadingName === scene.name}
                  className={btnCls(
                    'bg-blue-700 hover:bg-blue-600 text-white disabled:opacity-50'
                  )}
                >
                  {loadingName === scene.name ? 'Loading\u2026' : 'Load'}
                </button>
                <button
                  onClick={() => handleExport(scene.name)}
                  className={btnCls(
                    'bg-gray-700 hover:bg-gray-600 text-gray-300'
                  )}
                >
                  Export
                </button>
                <button
                  onClick={() => handleDelete(scene.name)}
                  disabled={deletingName === scene.name}
                  className={btnCls(
                    'bg-gray-700 hover:bg-red-800 text-gray-300 hover:text-white disabled:opacity-50'
                  )}
                >
                  {deletingName === scene.name ? '\u2026' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}
