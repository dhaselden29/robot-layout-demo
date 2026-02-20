/**
 * sceneStorage.js
 *
 * Client-side scene persistence using localStorage + file export/import.
 * Replaces the Vite dev-server API (saves/ folder) so the app works as a
 * static site without any backend.
 *
 * Storage format: a single localStorage key holds a JSON object where keys
 * are scene names and values are full scene data (including savedAt).
 * At ~2-10 KB per scene, hundreds of scenes fit within the 5-10 MB limit.
 */

import { DEMO_SCENES } from '../config/demoScenes';

const STORAGE_KEY = 'robotlayout_scenes';

/** Read the full scene map from localStorage. Returns {} on empty/error. */
function readMap() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

/** Write the full scene map to localStorage. */
function writeMap(map) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
}

/**
 * Save a scene to localStorage. Overwrites if name already exists.
 * @param {string} name  Scene name
 * @param {object} sceneData  Full scene object (with savedAt, deployedRobots, etc.)
 */
export function saveScene(name, sceneData) {
  const map = readMap();
  map[name] = sceneData;
  writeMap(map); // throws DOMException on quota exceeded
}

/**
 * List all saved scenes, sorted newest first.
 * Built-in demo scenes are appended at the end with isDemo=true.
 * @returns {{ name: string, savedAt: string, isDemo?: boolean }[]}
 */
export function listScenes() {
  const map = readMap();
  const userScenes = Object.entries(map)
    .map(([name, data]) => ({ name, savedAt: data.savedAt || '' }))
    .sort((a, b) => (b.savedAt > a.savedAt ? 1 : -1));
  const demoScenes = Object.entries(DEMO_SCENES)
    .map(([name, data]) => ({ name, savedAt: data.savedAt || '', isDemo: true }));
  return [...userScenes, ...demoScenes];
}

/**
 * Load a single scene by name.
 * @param {string} name
 * @returns {object|null}  Full scene object, or null if not found.
 */
export function loadScene(name) {
  if (DEMO_SCENES[name]) return DEMO_SCENES[name];
  const map = readMap();
  return map[name] ?? null;
}

/**
 * Delete a scene by name.
 * @param {string} name
 */
export function deleteScene(name) {
  const map = readMap();
  delete map[name];
  writeMap(map);
}

/**
 * Export a scene as a downloadable .json file.
 * Triggers the browser's Save As dialog.
 * @param {string} name
 * @param {object} sceneData
 */
export function exportSceneToFile(name, sceneData) {
  const json = JSON.stringify(sceneData, null, 2);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${name}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import a scene from a user-selected .json file.
 * Opens the browser file picker. Validates that the file contains a
 * deployedRobots array.
 * @returns {Promise<{ name: string, scene: object }>}
 */
export function importSceneFromFile() {
  return new Promise((resolve, reject) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.style.display = 'none';
    document.body.appendChild(input);

    input.addEventListener('change', () => {
      const file = input.files[0];
      document.body.removeChild(input);
      if (!file) { reject(new Error('No file selected')); return; }

      const reader = new FileReader();
      reader.onload = () => {
        try {
          const scene = JSON.parse(reader.result);
          if (!Array.isArray(scene.deployedRobots)) {
            reject(new Error('Invalid scene file: missing deployedRobots array'));
            return;
          }
          // Derive scene name from filename (strip .json extension)
          const name = file.name.replace(/\.json$/i, '');
          resolve({ name, scene });
        } catch (err) {
          reject(new Error('Failed to parse JSON: ' + err.message));
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });

    // Handle cancel — input fires no change event on cancel, so we use a
    // focus listener on the window as a fallback. Short delay because the
    // focus event fires before the change event in some browsers.
    function onFocus() {
      window.removeEventListener('focus', onFocus);
      setTimeout(() => {
        if (input.parentNode) {
          document.body.removeChild(input);
          reject(new Error('File picker cancelled'));
        }
      }, 500);
    }
    window.addEventListener('focus', onFocus);

    input.click();
  });
}
