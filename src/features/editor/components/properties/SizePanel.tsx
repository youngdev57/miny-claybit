import { computeSceneBoundingBox, getLocalDimensions, getWorldDimensions } from '@/features/editor/utils/bounds';
import { applyScaleAxis } from '@/features/editor/utils/scale';
import type { PrimitiveType, Vec3 } from '@/features/editor/types/scene';
import NumberField from '@/shared/components/ui/NumberField';
import { useEditorStore } from '@/stores/editorStore';

const AXIS_LABELS: Array<{ key: 0 | 1 | 2; label: string }> = [
  { key: 0, label: 'Width' },
  { key: 1, label: 'Height' },
  { key: 2, label: 'Depth' },
];

function toDisplayUnit(meters: number, unit: 'meter' | 'centimeter'): number {
  return unit === 'centimeter' ? meters * 100 : meters;
}

function toMeters(value: number, unit: 'meter' | 'centimeter'): number {
  return unit === 'centimeter' ? value / 100 : value;
}

function SizePanel() {
  const objects = useEditorStore((state) => state.objects);
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const scaleLocked = useEditorStore((state) => state.scaleLocked);
  const sizeUnit = useEditorStore((state) => state.sizeUnit);
  const setSizeUnit = useEditorStore((state) => state.setSizeUnit);
  const updateObject = useEditorStore((state) => state.updateObject);

  const object = objects.find((item) => item.id === selectedObjectId);
  const sceneBox = computeSceneBoundingBox(objects, { visibleOnly: false });
  const sceneSize: Vec3 = sceneBox
    ? [sceneBox.max.x - sceneBox.min.x, sceneBox.max.y - sceneBox.min.y, sceneBox.max.z - sceneBox.min.z]
    : [0, 0, 0];

  const unitLabel = sizeUnit === 'centimeter' ? 'cm' : 'm';

  const setSizeAxis = (axis: 0 | 1 | 2, displayValue: number) => {
    if (!object || object.type === 'group' || !object.geometryParams) return;
    const localSize = getLocalDimensions(object.type, object.geometryParams)[axis];
    if (localSize <= 0) return;
    const targetScale = toMeters(displayValue, sizeUnit) / localSize;
    updateObject(object.id, { scale: applyScaleAxis(object.scale, axis, targetScale, scaleLocked) });
  };

  return (
    <div className="flex flex-col gap-3 text-sm">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">표시 단위</h3>
        <div className="flex overflow-hidden rounded-md border border-slate-200 text-xs">
          <button
            type="button"
            onClick={() => setSizeUnit('meter')}
            className={`px-2 py-1 ${sizeUnit === 'meter' ? 'bg-skyline text-white' : 'text-ink hover:bg-slate-50'}`}
          >
            m
          </button>
          <button
            type="button"
            onClick={() => setSizeUnit('centimeter')}
            className={`px-2 py-1 ${sizeUnit === 'centimeter' ? 'bg-skyline text-white' : 'text-ink hover:bg-slate-50'}`}
          >
            cm
          </button>
        </div>
      </div>

      {object && object.type !== 'group' && object.geometryParams ? (
        <section className="flex flex-col gap-1.5">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">선택 객체 크기 ({unitLabel})</h3>
          {AXIS_LABELS.map(({ key, label }) => {
            const localSize = getLocalDimensions(object.type as PrimitiveType, object.geometryParams!)[key];
            if (localSize <= 0) return null;
            const worldSize = getWorldDimensions(object)[key];
            return (
              <NumberField
                key={label}
                label={label}
                value={toDisplayUnit(worldSize, sizeUnit)}
                onChange={(value) => setSizeAxis(key, value)}
              />
            );
          })}
        </section>
      ) : (
        <p className="text-sm text-slate-400">{object ? '그룹은 하위 객체의 Bounding Box를 참고하세요.' : '객체를 선택하세요.'}</p>
      )}

      <section className="flex flex-col gap-1 border-t border-slate-100 pt-2">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">전체 Bounding Box ({unitLabel})</h3>
        <p className="text-xs text-slate-500">
          W {toDisplayUnit(sceneSize[0], sizeUnit).toFixed(2)} · H {toDisplayUnit(sceneSize[1], sizeUnit).toFixed(2)} · D{' '}
          {toDisplayUnit(sceneSize[2], sizeUnit).toFixed(2)}
        </p>
        <p className="text-[11px] leading-snug text-slate-400">실제 데이터는 항상 meter 단위로 저장됩니다.</p>
      </section>
    </div>
  );
}

export default SizePanel;
