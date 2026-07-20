import { useMemo } from 'react';
import type { ThreeEvent } from '@react-three/fiber';

import PrimitiveMaterial from '@/features/editor/components/viewport/PrimitiveMaterial';
import SelectedSceneObject from '@/features/editor/components/viewport/SelectedSceneObject';
import { createGeometryElement } from '@/features/editor/geometry/primitiveFactory';
import type { SceneObject } from '@/features/editor/types/scene';
import { useEditorStore } from '@/stores/editorStore';

interface SceneObjectRendererProps {
  onDraggingChange: (dragging: boolean) => void;
}

function SceneObjectRenderer({ onDraggingChange }: SceneObjectRendererProps) {
  const objects = useEditorStore((state) => state.objects);
  const rootObjectIds = useEditorStore((state) => state.rootObjectIds);
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const selectObject = useEditorStore((state) => state.selectObject);

  const objectsById = useMemo(() => new Map(objects.map((object) => [object.id, object])), [objects]);

  const childrenByParent = useMemo(() => {
    const map = new Map<string, SceneObject[]>();
    objects.forEach((object) => {
      if (!object.parentId) return;
      const siblings = map.get(object.parentId) ?? [];
      siblings.push(object);
      map.set(object.parentId, siblings);
    });
    return map;
  }, [objects]);

  const renderNode = (object: SceneObject): React.ReactNode => {
    if (!object.visible) return null;

    const children = (childrenByParent.get(object.id) ?? []).map(renderNode);

    if (object.id === selectedObjectId) {
      return (
        <SelectedSceneObject key={object.id} object={object} onDraggingChange={onDraggingChange}>
          {children}
        </SelectedSceneObject>
      );
    }

    const handleClick = (event: ThreeEvent<MouseEvent>) => {
      event.stopPropagation();
      selectObject(object.id);
    };

    if (object.type === 'group') {
      return (
        <group
          key={object.id}
          position={object.position}
          rotation={object.rotation}
          scale={object.scale}
          onClick={handleClick}
        >
          {children}
        </group>
      );
    }

    return (
      <mesh key={object.id} position={object.position} rotation={object.rotation} scale={object.scale} onClick={handleClick}>
        {createGeometryElement(object.type, object.geometryParams!)}
        {object.material && <PrimitiveMaterial material={object.material} />}
        {children}
      </mesh>
    );
  };

  const rootObjects = rootObjectIds
    .map((id) => objectsById.get(id))
    .filter((object): object is SceneObject => Boolean(object));

  return <>{rootObjects.map(renderNode)}</>;
}

export default SceneObjectRenderer;
