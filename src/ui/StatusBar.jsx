/**
 * StatusBar.jsx
 *
 * A thin bar at the bottom of the viewport showing:
 *   - Number of robots currently deployed
 *   - Factory floor dimensions from config.json
 *
 * Reads robot count from the Zustand store so it updates automatically
 * whenever robots are deployed or cleared.
 */

import config from '../config/config.json';
import useSceneStore from '../store/sceneStore';

export default function StatusBar() {
  const robotCount = useSceneStore((s) => s.deployedRobots.length);
  const objectCount = useSceneStore((s) => s.sceneObjects.length);
  const { width, depth } = config.floor;

  return (
    <div className="flex items-center px-4 py-1.5 bg-gray-900 border-t border-gray-700 text-xs text-gray-400 font-mono select-none">
      <span className="text-blue-400 font-semibold">{robotCount}</span>
      <span className="ml-1 mr-3">
        {robotCount === 1 ? 'robot' : 'robots'}
      </span>
      <span className="text-gray-600">·</span>
      <span className="ml-3 text-teal-400 font-semibold">{objectCount}</span>
      <span className="ml-1 mr-4">
        {objectCount === 1 ? 'object' : 'objects'}
      </span>
      <span className="text-gray-600">|</span>
      <span className="ml-4">
        Floor: {width}m × {depth}m
      </span>
    </div>
  );
}
