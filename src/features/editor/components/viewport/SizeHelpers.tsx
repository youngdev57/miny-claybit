import { Line } from '@react-three/drei';
import { Box3, Vector3 } from 'three';

import { computeSceneBoundingBox } from '@/features/editor/utils/bounds';
import type { SceneObject } from '@/features/editor/types/scene';
import { useEditorStore } from '@/stores/editorStore';

function boxEdges(box: Box3): Array<[Vector3, Vector3]> {
  const { min, max } = box;
  const b0 = new Vector3(min.x, min.y, min.z);
  const b1 = new Vector3(max.x, min.y, min.z);
  const b2 = new Vector3(max.x, min.y, max.z);
  const b3 = new Vector3(min.x, min.y, max.z);
  const t0 = new Vector3(min.x, max.y, min.z);
  const t1 = new Vector3(max.x, max.y, min.z);
  const t2 = new Vector3(max.x, max.y, max.z);
  const t3 = new Vector3(min.x, max.y, max.z);

  return [
    [b0, b1], [b1, b2], [b2, b3], [b3, b0],
    [t0, t1], [t1, t2], [t2, t3], [t3, t0],
    [b0, t0], [b1, t1], [b2, t2], [b3, t3],
  ];
}

function BoxWireframe({ box, color }: { box: Box3; color: string }) {
  return (
    <>
      {boxEdges(box).map(([a, b], index) => (
        <Line key={index} points={[a, b]} color={color} lineWidth={1.5} />
      ))}
    </>
  );
}

/** 격자 모서리 근처에 정확히 1m 길이의 기준 막대를 표시한다. */
function MeterReferenceBar() {
  const z = 9.5;
  const start: Vector3 = new Vector3(-9, 0.01, z);
  const end: Vector3 = new Vector3(-8, 0.01, z);
  const tick = 0.08;

  return (
    <>
      <Line points={[start, end]} color="#0f172a" lineWidth={2} />
      <Line
        points={[new Vector3(start.x, 0.01, z - tick), new Vector3(start.x, 0.01, z + tick)]}
        color="#0f172a"
        lineWidth={2}
      />
      <Line
        points={[new Vector3(end.x, 0.01, z - tick), new Vector3(end.x, 0.01, z + tick)]}
        color="#0f172a"
        lineWidth={2}
      />
    </>
  );
}

/** 선택된 객체(또는 그룹의 하위 전체)에 해당하는 leaf 도형 id 목록을 모은다. */
function collectLeafIds(id: string, objects: SceneObject[]): string[] {
  const object = objects.find((item) => item.id === id);
  if (!object) return [];
  if (object.type !== 'group') return [id];
  const children = objects.filter((item) => item.parentId === id);
  return children.flatMap((child) => collectLeafIds(child.id, objects));
}

function SizeHelpers() {
  const objects = useEditorStore((state) => state.objects);
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);

  const sceneBox = computeSceneBoundingBox(objects, { visibleOnly: true });
  const selectedBox = selectedObjectId
    ? computeSceneBoundingBox(objects, { visibleOnly: true, onlyIds: collectLeafIds(selectedObjectId, objects) })
    : null;

  return (
    <>
      <MeterReferenceBar />
      {sceneBox && <BoxWireframe box={sceneBox} color="#94a3b8" />}
      {selectedBox && <BoxWireframe box={selectedBox} color="#f97316" />}
    </>
  );
}

export default SizeHelpers;
