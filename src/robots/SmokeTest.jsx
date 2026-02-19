/**
 * SmokeTest.jsx
 *
 * Renders exactly one robot from each manufacturer in a row on the floor
 * at hardcoded positions. Used to visually confirm that model loading
 * works correctly for all three manufacturers.
 *
 * This component is activated by setting SMOKE_TEST = true in RobotManager.
 * It is NOT shown during normal app use.
 *
 * Hardcoded positions (metres from floor centre):
 *   - Universal Robots UR5e  → X = -5
 *   - FANUC LR Mate 200iD    → X =  0
 *   - ABB IRB 120            → X = +5
 *
 * Uses loadRobot() so the exact same instance format is tested as production.
 */

import { loadRobot } from '../utils/deploymentUtils';
import RobotInstance from './RobotInstance';

// One smoke test robot per manufacturer — positions hardcoded for this test only
const SMOKE_ROBOTS = [
  loadRobot('Universal Robots', 'ur5e',       [-5, 0, 0], 1.0, 1),
  loadRobot('FANUC',            'lrmate200id', [ 0, 0, 0], 1.0, 1),
  loadRobot('ABB',              'irb120',      [ 5, 0, 0], 1.0, 1),
].filter(Boolean);

export default function SmokeTest() {
  return (
    <group>
      {SMOKE_ROBOTS.map((robot) => (
        <RobotInstance
          key={`smoke-${robot.id}`}
          robot={robot}
          approxHeight={robot.approxHeight ?? 1.2}
        />
      ))}
    </group>
  );
}
