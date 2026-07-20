import { useState, type ReactNode } from 'react';
import { TransformControls } from '@react-three/drei';
import type { Object3D } from 'three';

import PrimitiveMaterial from '@/features/editor/components/viewport/PrimitiveMaterial';
import SelectionOutline from '@/features/editor/components/viewport/SelectionOutline';
import { createGeometryElement } from '@/features/editor/geometry/primitiveFactory';
import type { SceneObject, Vec3 } from '@/features/editor/types/scene';
import { MIN_SCALE } from '@/features/editor/utils/scale';
import { useEditorStore } from '@/stores/editorStore';

interface SelectedSceneObjectProps {
  object: SceneObject;
  onDraggingChange: (dragging: boolean) => void;
  children?: ReactNode;
}

function SelectedSceneObject({ object, onDraggingChange, children }: SelectedSceneObjectProps) {
  const [node, setNode] = useState<Object3D | null>(null);
  const transformMode = useEditorStore((state) => state.transformMode);
  const updateObject = useEditorStore((state) => state.updateObject);

  const handleObjectChange = () => {
    if (!node) return;
    const position: Vec3 = [node.position.x, node.position.y, node.position.z];
    const rotation: Vec3 = [node.rotation.x, node.rotation.y, node.rotation.z];
    const scale: Vec3 = [
      Math.max(node.scale.x, MIN_SCALE),
      Math.max(node.scale.y, MIN_SCALE),
      Math.max(node.scale.z, MIN_SCALE),
    ];
    updateObject(object.id, { position, rotation, scale });
  };

  const stopPropagation = (event: { stopPropagation: () => void }) => event.stopPropagation();

  return (
    <>
      {object.type === 'group' ? (
        <group
          ref={(instance) => setNode(instance)}
          position={object.position}
          rotation={object.rotation}
          scale={object.scale}
          onClick={stopPropagation}
        >
          {children}
        </group>
      ) : (
        <mesh
          ref={(instance) => setNode(instance)}
          position={object.position}
          rotation={object.rotation}
          scale={object.scale}
          onClick={stopPropagation}
        >
          {createGeometryElement(object.type, object.geometryParams!)}
          {object.material && <PrimitiveMaterial material={object.material} />}
          <SelectionOutline visible />
          {children}
        </mesh>
      )}
      {node && (
        <TransformControls
          object={node}
          mode={transformMode}
          onMouseDown={() => onDraggingChange(true)}
          onMouseUp={() => onDraggingChange(false)}
          onObjectChange={handleObjectChange}
        />
      )}
    </>
  );
}

export default SelectedSceneObject;
