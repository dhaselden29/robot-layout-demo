/**
 * RobotManager.jsx
 *
 * Reads the deployed robot list from the Zustand store and renders one
 * RobotInstance per robot.
 *
 * Phase 4 additions:
 *   - PHASE 4 FIX: robotRefs — a ref map keyed by robot ID that holds each
 *     robot's outer THREE.Group. Populated by each RobotInstance via the
 *     registerRef callback. Available for imperative access by drag logic
 *     without subscribing to Zustand state.
 *   - PHASE 4 FIX: registerRef — stable useCallback passed to every
 *     RobotInstance so the robotRefs map stays current as robots are
 *     added/removed.
 */

import { useCallback, useRef } from 'react';
import useSceneStore from '../store/sceneStore';
import RobotInstance from './RobotInstance';
import SmokeTest from './SmokeTest';

/** Set to true to render one robot per manufacturer for visual testing */
const SMOKE_TEST = false;

export default function RobotManager() {
  const deployedRobots = useSceneStore((s) => s.deployedRobots);

  // PHASE 4 FIX: Ref map { [robot.id]: THREE.Group }
  // Not stored in Zustand — a plain ref is sufficient since drag logic
  // reads it imperatively rather than via reactive subscriptions.
  const robotRefs = useRef({});

  // PHASE 4 FIX: Stable registration callback — useCallback([]) means
  // identity is preserved across renders so RobotInstance's useEffect
  // for ref registration only runs when robot.id changes, not on every
  // parent re-render.
  const registerRef = useCallback((id, ref) => {
    if (ref) {
      robotRefs.current[id] = ref;
    } else {
      delete robotRefs.current[id];
    }
  }, []);

  return (
    <group>
      {SMOKE_TEST && <SmokeTest />}

      {deployedRobots.map((robot) => (
        <RobotInstance
          key={robot.id}
          robot={robot}
          approxHeight={robot.approxHeight ?? 1.2}
          registerRef={registerRef}
        />
      ))}
    </group>
  );
}
