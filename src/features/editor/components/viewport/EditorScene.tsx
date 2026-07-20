import { useState } from 'react';
import { OrbitControls, PerspectiveCamera } from '@react-three/drei';

import GridAndAxes from '@/features/editor/components/viewport/GridAndAxes';
import SceneObjectRenderer from '@/features/editor/components/viewport/SceneObjectRenderer';
import SizeHelpers from '@/features/editor/components/viewport/SizeHelpers';

function EditorScene() {
  const [orbitEnabled, setOrbitEnabled] = useState(true);

  return (
    <>
      <PerspectiveCamera makeDefault position={[4, 3, 4]} fov={50} />
      <OrbitControls makeDefault enableDamping enabled={orbitEnabled} />

      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 8, 5]} intensity={1.2} castShadow />

      <GridAndAxes />
      <SizeHelpers />

      <SceneObjectRenderer onDraggingChange={(dragging) => setOrbitEnabled(!dragging)} />
    </>
  );
}

export default EditorScene;
