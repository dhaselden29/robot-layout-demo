/**
 * ExportCapture.jsx
 *
 * Inside-Canvas component that watches for an export trigger in the Zustand
 * store and downloads the viewport as a PNG after the next render frame.
 *
 * Must be inside <Canvas> to access the R3F renderer via useThree.
 * Requires preserveDrawingBuffer: true on the Canvas gl prop (set in App.jsx)
 * so the WebGL back-buffer is not cleared between frames.
 *
 * Flow:
 *   1. User clicks "Export PNG" in ControlPanel → store.triggerExport()
 *   2. useFrame fires after the next rendered frame, reads exportRequested
 *   3. Calls clearExportRequest() to prevent a double download
 *   4. toDataURL() reads the preserved buffer → base64 PNG
 *   5. Creates a temporary <a> link and programmatically clicks it
 *   6. Browser saves the file as robot-layout-YYYY-MM-DD-HH-MM-SS.png
 */

import { useFrame, useThree } from '@react-three/fiber';
import useSceneStore from '../store/sceneStore';

export default function ExportCapture() {
  const { gl } = useThree();

  useFrame(() => {
    if (!useSceneStore.getState().exportRequested) return;
    useSceneStore.getState().clearExportRequest();

    const dataUrl = gl.domElement.toDataURL('image/png');
    const ts = new Date().toISOString().slice(0, 19).replace(/[T:]/g, '-');
    const link = document.createElement('a');
    link.download = `robot-layout-${ts}.png`;
    link.href = dataUrl;
    link.click();
  });

  return null;
}
