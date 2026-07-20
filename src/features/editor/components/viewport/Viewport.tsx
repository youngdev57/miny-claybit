import { useRef } from 'react';
import { Canvas, useThree } from '@react-three/fiber';
import { Camera, Plane, Raycaster, Vector2, Vector3 } from 'three';

import EditorScene from '@/features/editor/components/viewport/EditorScene';
import type { PrimitiveType } from '@/features/editor/types/scene';
import { useEditorStore } from '@/stores/editorStore';

const FLOOR_PLANE = new Plane(new Vector3(0, 1, 0), 0);

function CameraCapture({ cameraRef }: { cameraRef: React.MutableRefObject<Camera | null> }) {
  const camera = useThree((state) => state.camera);
  cameraRef.current = camera;
  return null;
}

function Viewport() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cameraRef = useRef<Camera | null>(null);
  const addObject = useEditorStore((state) => state.addObject);
  const clearSelection = useEditorStore((state) => state.clearSelection);

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const type = event.dataTransfer.getData('application/x-primitive-type') as PrimitiveType | '';
    if (!type) return;

    const camera = cameraRef.current;
    const container = containerRef.current;
    if (!camera || !container) {
      addObject(type, [0, 0, 0]);
      return;
    }

    const rect = container.getBoundingClientRect();
    const ndc = new Vector2(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -((event.clientY - rect.top) / rect.height) * 2 + 1,
    );
    const raycaster = new Raycaster();
    raycaster.setFromCamera(ndc, camera);

    const target = new Vector3();
    const hit = raycaster.ray.intersectPlane(FLOOR_PLANE, target);

    addObject(type, hit ? [target.x, 0, target.z] : [0, 0, 0]);
  };

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <Canvas shadows onPointerMissed={() => clearSelection()}>
        <CameraCapture cameraRef={cameraRef} />
        <EditorScene />
      </Canvas>
    </div>
  );
}

export default Viewport;
