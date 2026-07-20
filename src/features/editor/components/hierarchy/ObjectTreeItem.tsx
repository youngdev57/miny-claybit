import { useState, type MouseEvent } from 'react';

import type { SceneObject } from '@/features/editor/types/scene';
import { useEditorStore } from '@/stores/editorStore';

interface ObjectTreeItemProps {
  object: SceneObject;
  depth: number;
  hasChildren: boolean;
  collapsed: boolean;
  onToggleCollapsed: () => void;
}

function ObjectTreeItem({ object, depth, hasChildren, collapsed, onToggleCollapsed }: ObjectTreeItemProps) {
  const isSelected = useEditorStore((state) => state.selectedObjectId === object.id);
  const isMultiSelected = useEditorStore((state) => state.multiSelectedIds.includes(object.id));
  const selectObject = useEditorStore((state) => state.selectObject);
  const toggleMultiSelect = useEditorStore((state) => state.toggleMultiSelect);
  const renameObject = useEditorStore((state) => state.renameObject);
  const toggleVisibility = useEditorStore((state) => state.toggleVisibility);
  const duplicateObject = useEditorStore((state) => state.duplicateObject);
  const deleteObject = useEditorStore((state) => state.deleteObject);

  const [isEditing, setIsEditing] = useState(false);
  const [draftName, setDraftName] = useState(object.name);

  const startEditing = () => {
    setDraftName(object.name);
    setIsEditing(true);
  };

  const commitRename = () => {
    renameObject(object.id, draftName);
    setIsEditing(false);
  };

  const handleRowClick = (event: MouseEvent) => {
    if (event.ctrlKey || event.metaKey || event.shiftKey) {
      toggleMultiSelect(object.id);
    } else {
      selectObject(object.id);
    }
  };

  return (
    <div
      className={`flex items-center gap-1 rounded-md py-1 pr-1 text-sm transition ${
        isSelected ? 'bg-skyline text-white' : isMultiSelected ? 'bg-skyline/20 text-ink' : 'text-ink hover:bg-slate-100'
      }`}
      style={{ paddingLeft: `${depth * 16 + 4}px` }}
    >
      {hasChildren ? (
        <button
          type="button"
          onClick={onToggleCollapsed}
          className="w-4 shrink-0 font-mono text-xs text-slate-400"
          aria-label={collapsed ? '펼치기' : '접기'}
        >
          {collapsed ? '>' : 'v'}
        </button>
      ) : (
        <span className="w-4 shrink-0" />
      )}

      <input
        type="checkbox"
        checked={object.visible}
        onChange={() => toggleVisibility(object.id)}
        title={object.visible ? '숨기기' : '표시하기'}
        className="shrink-0"
      />

      {isEditing ? (
        <input
          autoFocus
          value={draftName}
          onChange={(event) => setDraftName(event.target.value)}
          onBlur={commitRename}
          onKeyDown={(event) => {
            if (event.key === 'Enter') commitRename();
            if (event.key === 'Escape') setIsEditing(false);
          }}
          className="min-w-0 flex-1 rounded border border-signal bg-white px-1 text-sm text-ink"
        />
      ) : (
        <button
          type="button"
          onClick={handleRowClick}
          onDoubleClick={startEditing}
          className={`min-w-0 flex-1 truncate text-left ${!object.visible ? 'opacity-40' : ''}`}
        >
          {object.name}
        </button>
      )}

      <button
        type="button"
        onClick={() => duplicateObject(object.id)}
        className="shrink-0 rounded px-1 text-xs opacity-60 hover:bg-white/20 hover:opacity-100"
        title="복제 (Ctrl+D)"
      >
        복제
      </button>
      <button
        type="button"
        onClick={() => deleteObject(object.id)}
        className="shrink-0 rounded px-1 text-xs opacity-60 hover:bg-white/20 hover:opacity-100"
        title="삭제 (Delete)"
      >
        삭제
      </button>
    </div>
  );
}

export default ObjectTreeItem;
