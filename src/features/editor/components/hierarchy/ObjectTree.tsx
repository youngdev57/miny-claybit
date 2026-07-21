import { type ReactNode, useMemo, useState } from 'react';

import ObjectTreeItem from '@/features/editor/components/hierarchy/ObjectTreeItem';
import type { SceneObject } from '@/features/editor/types/scene';
import { useEditorStore } from '@/stores/editorStore';

function ObjectTree() {
  const objects = useEditorStore((state) => state.objects);
  const rootObjectIds = useEditorStore((state) => state.rootObjectIds);
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const multiSelectedIds = useEditorStore((state) => state.multiSelectedIds);
  const groupObjects = useEditorStore((state) => state.groupObjects);
  const ungroupObject = useEditorStore((state) => state.ungroupObject);

  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(new Set());

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

  const toggleCollapsed = (id: string) => {
    setCollapsedIds((previous) => {
      const next = new Set(previous);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderRows = (ids: string[], depth: number): ReactNode[] =>
    ids.flatMap((id) => {
      const object = objectsById.get(id);
      if (!object) return [];

      const children = childrenByParent.get(id) ?? [];
      const isCollapsed = collapsedIds.has(id);

      return [
        <ObjectTreeItem
          key={id}
          object={object}
          depth={depth}
          hasChildren={children.length > 0}
          collapsed={isCollapsed}
          onToggleCollapsed={() => toggleCollapsed(id)}
        />,
        ...(isCollapsed ? [] : renderRows(children.map((child) => child.id), depth + 1)),
      ];
    });

  if (objects.length === 0) {
    return (
      <p className="px-1 text-sm text-slate-400" data-testid="object-tree">
        아직 추가된 객체가 없습니다.
      </p>
    );
  }

  const rootIds = rootObjectIds.filter((id) => objectsById.has(id));
  const selectedObject = selectedObjectId ? objectsById.get(selectedObjectId) : undefined;

  return (
    <div className="flex flex-col gap-2" data-testid="object-tree">
      <div className="flex flex-col gap-0.5">{renderRows(rootIds, 0)}</div>

      <div className="flex gap-2">
        <button
          type="button"
          disabled={multiSelectedIds.length < 2}
          onClick={() => groupObjects(multiSelectedIds)}
          className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-ink hover:border-signal hover:text-signal disabled:cursor-not-allowed disabled:opacity-40"
        >
          그룹으로 묶기
        </button>
        <button
          type="button"
          disabled={selectedObject?.type !== 'group'}
          onClick={() => selectedObjectId && ungroupObject(selectedObjectId)}
          className="flex-1 rounded-md border border-slate-200 px-2 py-1 text-xs text-ink hover:border-signal hover:text-signal disabled:cursor-not-allowed disabled:opacity-40"
        >
          그룹 해제
        </button>
      </div>
      <p className="text-[11px] leading-snug text-slate-400">
        Ctrl(또는 Shift) + 클릭으로 여러 객체를 선택한 뒤 그룹으로 묶을 수 있습니다.
      </p>
    </div>
  );
}

export default ObjectTree;
