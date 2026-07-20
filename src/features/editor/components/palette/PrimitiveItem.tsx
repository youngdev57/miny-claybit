import { PRIMITIVE_LABELS } from '@/features/editor/geometry/geometryDefaults';
import type { PrimitiveType } from '@/features/editor/types/scene';
import { useEditorStore } from '@/stores/editorStore';

interface PrimitiveItemProps {
  type: PrimitiveType;
}

function PrimitiveItem({ type }: PrimitiveItemProps) {
  const addObject = useEditorStore((state) => state.addObject);

  return (
    <button
      type="button"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('application/x-primitive-type', type);
        event.dataTransfer.effectAllowed = 'copy';
      }}
      onClick={() => addObject(type)}
      className="cursor-grab select-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-ink shadow-sm transition hover:border-signal hover:text-signal active:cursor-grabbing"
    >
      {PRIMITIVE_LABELS[type]}
    </button>
  );
}

export default PrimitiveItem;
