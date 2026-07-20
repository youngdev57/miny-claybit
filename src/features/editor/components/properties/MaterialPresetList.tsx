import { applyMaterialPreset } from '@/features/editor/materials/materialFactory';
import { MATERIAL_PRESET_IDS, MATERIAL_PRESET_LABELS } from '@/features/editor/materials/materialPresets';
import { useEditorStore } from '@/stores/editorStore';

function MaterialPresetList() {
  const objects = useEditorStore((state) => state.objects);
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const updateMaterial = useEditorStore((state) => state.updateMaterial);

  const object = objects.find((item) => item.id === selectedObjectId);

  if (!object) {
    return <p className="text-sm text-slate-400">객체를 선택하세요.</p>;
  }

  if (!object.material) {
    return <p className="text-sm text-slate-400">그룹에는 재질을 지정할 수 없습니다.</p>;
  }

  const { material } = object;

  return (
    <div className="grid grid-cols-2 gap-2">
      {MATERIAL_PRESET_IDS.map((presetId) => (
        <button
          key={presetId}
          type="button"
          onClick={() => updateMaterial(object.id, applyMaterialPreset(material, presetId))}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-medium text-ink shadow-sm transition hover:border-signal hover:text-signal"
        >
          {MATERIAL_PRESET_LABELS[presetId]}
        </button>
      ))}
    </div>
  );
}

export default MaterialPresetList;
