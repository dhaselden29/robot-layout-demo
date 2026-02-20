/**
 * ScaleIndicator.jsx
 *
 * DOM overlay positioned in the lower-left of the canvas wrapper.
 *
 * Perspective mode: static text "Grid: 1m squares"
 * Orthographic mode: dynamic ruler bar with end ticks and metre label,
 *   computed from orthoViewInfo published by CameraRig.
 */

import useSceneStore from '../store/sceneStore';

const NICE_DISTANCES = [0.5, 1, 2, 5, 10, 20, 50];
const TARGET_BAR_PX = 100;

export default function ScaleIndicator() {
  const isOrthographic = useSceneStore((s) => s.isOrthographic);
  const orthoViewInfo = useSceneStore((s) => s.orthoViewInfo);

  if (!isOrthographic || !orthoViewInfo) {
    return (
      <div className="absolute bottom-14 left-4 z-10 text-xs text-gray-400 bg-gray-900/60 px-2 py-1 rounded select-none pointer-events-none">
        Grid: 1m squares
      </div>
    );
  }

  const { zoom, frustumWidth, viewportWidth } = orthoViewInfo;
  const pixelsPerMetre = (viewportWidth / frustumWidth) * zoom;

  // Pick the nice distance that makes a bar closest to TARGET_BAR_PX
  let bestDist = NICE_DISTANCES[0];
  let bestDiff = Infinity;
  for (const d of NICE_DISTANCES) {
    const barPx = d * pixelsPerMetre;
    const diff = Math.abs(barPx - TARGET_BAR_PX);
    if (diff < bestDiff) {
      bestDiff = diff;
      bestDist = d;
    }
  }

  const barWidth = Math.round(bestDist * pixelsPerMetre);
  const label = bestDist >= 1 ? `${bestDist} m` : `${bestDist * 100} cm`;

  return (
    <div className="absolute bottom-14 left-4 z-10 select-none pointer-events-none">
      <div className="flex flex-col items-start gap-0.5">
        <span className="text-xs text-white font-medium">{label}</span>
        <div className="relative" style={{ width: barWidth, height: 8 }}>
          {/* Main bar */}
          <div
            className="absolute top-1/2 left-0 right-0 bg-white"
            style={{ height: 2, transform: 'translateY(-50%)' }}
          />
          {/* Left tick */}
          <div className="absolute left-0 top-0 bottom-0 bg-white" style={{ width: 2 }} />
          {/* Right tick */}
          <div className="absolute right-0 top-0 bottom-0 bg-white" style={{ width: 2 }} />
        </div>
      </div>
    </div>
  );
}
