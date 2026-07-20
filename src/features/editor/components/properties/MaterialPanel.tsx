import ColorField from '@/shared/components/ui/ColorField';
import SliderField from '@/shared/components/ui/SliderField';
import { useEditorStore } from '@/stores/editorStore';

function MaterialPanel() {
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
    <div className="flex flex-col gap-3">
      <ColorField label="색상" value={material.color} onChange={(color) => updateMaterial(object.id, { color })} />

      <SliderField
        label="Roughness"
        value={material.roughness}
        onChange={(roughness) => updateMaterial(object.id, { roughness })}
      />
      <SliderField
        label="Metalness"
        value={material.metalness}
        onChange={(metalness) => updateMaterial(object.id, { metalness })}
      />
      <SliderField
        label="Opacity"
        value={material.opacity}
        onChange={(opacity) => updateMaterial(object.id, { opacity, transparent: opacity < 1 })}
      />

      <ColorField
        label="Emissive"
        value={material.emissive}
        onChange={(emissive) => updateMaterial(object.id, { emissive })}
      />
      <SliderField
        label="Emissive 강도"
        min={0}
        max={3}
        step={0.05}
        value={material.emissiveIntensity}
        onChange={(emissiveIntensity) => updateMaterial(object.id, { emissiveIntensity })}
      />

      <label className="flex items-center gap-2 text-xs text-slate-500">
        <input
          type="checkbox"
          checked={material.flatShading}
          onChange={(event) => updateMaterial(object.id, { flatShading: event.target.checked })}
        />
        Flat Shading
      </label>
      <label className="flex items-center gap-2 text-xs text-slate-500">
        <input
          type="checkbox"
          checked={material.doubleSided}
          onChange={(event) => updateMaterial(object.id, { doubleSided: event.target.checked })}
        />
        Double Side
      </label>
    </div>
  );
}

export default MaterialPanel;
