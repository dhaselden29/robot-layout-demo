/**
 * SceneObjectManager.jsx
 *
 * Maps the sceneObjects[] array from the Zustand store to SceneObjectInstance
 * components. Mirrors RobotManager but without a robotRefs map (scene objects
 * don't require imperative ref access).
 */

import useSceneStore from '../store/sceneStore';
import SceneObjectInstance from './SceneObjectInstance';

export default function SceneObjectManager() {
  const sceneObjects = useSceneStore((s) => s.sceneObjects);

  return (
    <>
      {sceneObjects.map((object) => (
        <SceneObjectInstance key={object.id} object={object} />
      ))}
    </>
  );
}
