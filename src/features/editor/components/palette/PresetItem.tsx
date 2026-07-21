import type { AssetPreset } from '@/features/editor/presets/types';
import { ko } from '@/i18n/ko';
import { useEditorStore } from '@/stores/editorStore';

interface PresetItemProps {
  preset: AssetPreset;
}

function PresetItem({ preset }: PresetItemProps) {
  const addPreset = useEditorStore((state) => state.addPreset);

  return (
    <button
      type="button"
      draggable
      onDragStart={(event) => {
        event.dataTransfer.setData('application/x-preset-id', preset.id);
        event.dataTransfer.effectAllowed = 'copy';
      }}
      onClick={() => addPreset(preset)}
      className="cursor-grab select-none rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-ink shadow-sm transition hover:border-signal hover:text-signal active:cursor-grabbing"
    >
      {ko.preset.items[preset.nameKey]}
    </button>
  );
}

export default PresetItem;
