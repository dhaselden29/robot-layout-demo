/**
 * RobotLoader.jsx
 *
 * Attempts to load a GLB model file for a given robot.
 * If the GLB file is not found (404) or has not been added yet, it
 * silently falls back to the PlaceholderRobot component.
 *
 * GLB files are served from /public/models/ by Vite's static file server.
 * The `file` prop is a path relative to that directory, e.g. "universal_robots/ur5e.glb".
 *
 * Model geometry is cloned on each render so multiple instances of the
 * same robot don't share geometry state.
 *
 * @param {Object}  props
 * @param {string}  props.file          - Path to GLB file relative to /public/models/
 * @param {string}  props.manufacturer  - Passed to PlaceholderRobot for colour coding
 * @param {number}  props.approxHeight  - Passed to PlaceholderRobot for sizing
 */

import { useGLTF } from '@react-three/drei';
import { Suspense } from 'react';
import PlaceholderRobot from './PlaceholderRobot';

/**
 * Inner component that actually calls useGLTF.
 * Wrapped in Suspense by RobotLoader so loading is non-blocking.
 */
function GLBModel({ file }) {
  const { scene } = useGLTF(`/models/${file}`);
  // Clone the scene so each instance is independent
  const cloned = scene.clone(true);
  return <primitive object={cloned} />;
}

export default function RobotLoader({ file, manufacturer, approxHeight }) {
  return (
    <Suspense
      fallback={
        <PlaceholderRobot
          manufacturer={manufacturer}
          approxHeight={approxHeight}
        />
      }
    >
      <GLBModelWithFallback
        file={file}
        manufacturer={manufacturer}
        approxHeight={approxHeight}
      />
    </Suspense>
  );
}

/**
 * Wraps GLBModel in an error boundary approach.
 * If useGLTF throws (file missing), React's error boundary catches it
 * and we render the placeholder instead via the ErrorBoundary component below.
 */
function GLBModelWithFallback({ file, manufacturer, approxHeight }) {
  return (
    <ModelErrorBoundary
      fallback={
        <PlaceholderRobot
          manufacturer={manufacturer}
          approxHeight={approxHeight}
        />
      }
    >
      <GLBModel file={file} />
    </ModelErrorBoundary>
  );
}

/**
 * Simple React error boundary that catches errors from child components
 * (e.g. failed GLB loads) and renders a fallback instead.
 */
import { Component } from 'react';

class ModelErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }
    return this.props.children;
  }
}
