import { getRestingYOffset } from '@/features/editor/geometry/geometryDefaults';
import { degToRad, radToDeg } from '@/features/editor/utils/angle';
import { applyScaleAxis, MIN_SCALE } from '@/features/editor/utils/scale';
import type { Vec3 } from '@/features/editor/types/scene';
import { ko } from '@/i18n/ko';
import NumberField from '@/shared/components/ui/NumberField';
import { useEditorStore } from '@/stores/editorStore';

const AXIS_LABELS: Array<{ key: 0 | 1 | 2; label: string }> = [
  { key: 0, label: 'X' },
  { key: 1, label: 'Y' },
  { key: 2, label: 'Z' },
];

function TransformPanel() {
  const objects = useEditorStore((state) => state.objects);
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const scaleLocked = useEditorStore((state) => state.scaleLocked);
  const toggleScaleLocked = useEditorStore((state) => state.toggleScaleLocked);
  const updateObject = useEditorStore((state) => state.updateObject);
  const mirrorObjectX = useEditorStore((state) => state.mirrorObjectX);
  const ungroupObject = useEditorStore((state) => state.ungroupObject);

  const object = objects.find((item) => item.id === selectedObjectId);

  if (!object) {
    return <p className="text-sm text-slate-400">객체를 선택하세요.</p>;
  }

  const isGroup = object.type === 'group';

  const setPositionAxis = (axis: 0 | 1 | 2, value: number) => {
    const position: Vec3 = [...object.position];
    position[axis] = value;
    updateObject(object.id, { position });
  };

  const setRotationAxisDeg = (axis: 0 | 1 | 2, degrees: number) => {
    const rotation: Vec3 = [...object.rotation];
    rotation[axis] = degToRad(degrees);
    updateObject(object.id, { rotation });
  };

  const setScaleAxis = (axis: 0 | 1 | 2, value: number) => {
    updateObject(object.id, { scale: applyScaleAxis(object.scale, axis, value, scaleLocked) });
  };

  const snapToFloor = () => {
    if (object.type === 'group' || !object.geometryParams) return;
    const offset = getRestingYOffset(object.type, object.geometryParams) * object.scale[1];
    updateObject(object.id, { position: [object.position[0], offset, object.position[2]] });
  };

  const moveToOrigin = () => {
    updateObject(object.id, { position: [0, object.position[1], 0] });
  };

  const resetTransform = () => {
    const restY = object.type !== 'group' && object.geometryParams ? getRestingYOffset(object.type, object.geometryParams) : 0;
    updateObject(object.id, { position: [0, restY, 0], rotation: [0, 0, 0], scale: [1, 1, 1] });
  };

  return (
    <div className="flex flex-col gap-4 text-sm">
      <section className="flex flex-col gap-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{ko.transform.position}</h3>
        {AXIS_LABELS.map(({ key, label }) => (
          <NumberField
            key={label}
            label={label}
            value={object.position[key]}
            onChange={(value) => setPositionAxis(key, value)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-1.5">
        <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{ko.transform.rotation} (°)</h3>
        {AXIS_LABELS.map(({ key, label }) => (
          <NumberField
            key={label}
            label={label}
            step={1}
            value={radToDeg(object.rotation[key])}
            onChange={(value) => setRotationAxisDeg(key, value)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">{ko.transform.scale}</h3>
          <label className="flex items-center gap-1 text-xs text-slate-500">
            <input type="checkbox" checked={scaleLocked} onChange={toggleScaleLocked} />
            {ko.dimensions.keepRatio}
          </label>
        </div>
        {AXIS_LABELS.map(({ key, label }) => (
          <NumberField
            key={label}
            label={label}
            min={MIN_SCALE}
            value={object.scale[key]}
            onChange={(value) => setScaleAxis(key, value)}
          />
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <button
          type="button"
          onClick={snapToFloor}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-left text-sm text-ink hover:border-signal hover:text-signal"
        >
          {ko.transform.fitToGround}
        </button>
        <button
          type="button"
          onClick={moveToOrigin}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-left text-sm text-ink hover:border-signal hover:text-signal"
        >
          {ko.transform.moveToOrigin}
        </button>
        <button
          type="button"
          onClick={resetTransform}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-left text-sm text-ink hover:border-signal hover:text-signal"
        >
          {ko.transform.reset}
        </button>
        <button
          type="button"
          onClick={() => mirrorObjectX(object.id)}
          className="rounded-md border border-slate-200 px-3 py-1.5 text-left text-sm text-ink hover:border-signal hover:text-signal"
        >
          {ko.transform.mirrorX}
        </button>
        {isGroup && (
          <button
            type="button"
            onClick={() => ungroupObject(object.id)}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-left text-sm text-ink hover:border-signal hover:text-signal"
          >
            그룹 해제
          </button>
        )}
      </section>
    </div>
  );
}

export default TransformPanel;
