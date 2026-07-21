import {
  BEND_ANGLE_LIMIT_DEG,
  BEND_APPLICABLE_TYPES,
  GEOMETRY_QUALITY_LABELS,
  GEOMETRY_QUALITY_PRESETS,
  GEOMETRY_SEGMENT_FIELDS,
  TAPER_APPLICABLE_TYPES,
  type GeometryQuality,
} from '@/features/editor/geometry/geometryDefaults';
import { getProfileHeight, LATHE_POINT, scaleProfileHeight, setProfileRadius } from '@/features/editor/geometry/latheProfile';
import { degToRad, radToDeg } from '@/features/editor/utils/angle';
import type {
  BendModifier,
  GeometryParams,
  LatheGeometryParams,
  RoundedBoxGeometryParams,
  TaperModifier,
  TorusGeometryParams,
} from '@/features/editor/types/scene';
import { ko } from '@/i18n/ko';
import NumberField from '@/shared/components/ui/NumberField';
import { useEditorStore } from '@/stores/editorStore';

const QUALITY_ORDER: GeometryQuality[] = ['low', 'medium', 'high'];
const BEND_AXIS_OPTIONS = ['x', 'z'] as const;

interface FieldsProps<T> {
  params: T;
  onChange: (key: string, value: number) => void;
}

function RoundedBoxFields({ params, onChange }: FieldsProps<RoundedBoxGeometryParams>) {
  const maxRadius = Math.max(0.01, Math.min(params.width, params.height, params.depth) / 2 - 0.001);

  return (
    <NumberField
      label={ko.geometry.roundedBox.radius}
      min={0.01}
      step={0.01}
      value={params.radius}
      onChange={(value) => onChange('radius', Math.min(maxRadius, Math.max(0.01, value)))}
    />
  );
}

function TorusFields({ params, onChange }: FieldsProps<TorusGeometryParams>) {
  return (
    <>
      <NumberField
        label={ko.geometry.torus.radius}
        min={0.01}
        step={0.01}
        value={params.radius}
        onChange={(value) => onChange('radius', Math.max(0.01, value))}
      />
      <NumberField
        label={ko.geometry.torus.tube}
        min={0.005}
        step={0.005}
        value={params.tube}
        onChange={(value) => onChange('tube', Math.max(0.005, value))}
      />
      <NumberField
        label={ko.geometry.torus.arc}
        min={1}
        step={1}
        value={Math.round(radToDeg(params.arc))}
        onChange={(value) => onChange('arc', degToRad(Math.min(360, Math.max(1, value))))}
      />
    </>
  );
}

interface LatheFieldsProps {
  params: LatheGeometryParams;
  onUpdate: (changes: Partial<LatheGeometryParams>) => void;
}

function LatheFields({ params, onUpdate }: LatheFieldsProps) {
  const height = getProfileHeight(params.profile);

  const widthFields: Array<{ label: string; index: number }> = [
    { label: ko.geometry.lathe.bottomWidth, index: LATHE_POINT.bottom },
    { label: ko.geometry.lathe.bodyWidth, index: LATHE_POINT.body },
    { label: ko.geometry.lathe.shoulderWidth, index: LATHE_POINT.shoulder },
    { label: ko.geometry.lathe.neckWidth, index: LATHE_POINT.neck },
    { label: ko.geometry.lathe.openingWidth, index: LATHE_POINT.opening },
  ];

  return (
    <>
      <NumberField
        label={ko.geometry.lathe.height}
        min={0.05}
        step={0.05}
        value={height}
        onChange={(value) => onUpdate({ profile: scaleProfileHeight(params.profile, value) })}
      />
      {widthFields.map(({ label, index }) => (
        <NumberField
          key={index}
          label={label}
          min={0.01}
          step={0.01}
          value={params.profile[index]?.radius ?? 0}
          onChange={(value) => onUpdate({ profile: setProfileRadius(params.profile, index, value) })}
        />
      ))}
    </>
  );
}

interface TaperFieldsProps {
  taper: TaperModifier;
  onUpdate: (changes: Partial<TaperModifier>) => void;
}

function TaperFields({ taper, onUpdate }: TaperFieldsProps) {
  return (
    <>
      <NumberField
        label={ko.modifier.taper.top}
        min={0.05}
        step={0.01}
        value={taper.topScale}
        onChange={(value) => onUpdate({ topScale: Math.max(0.05, value) })}
      />
      <NumberField
        label={ko.modifier.taper.bottom}
        min={0.05}
        step={0.01}
        value={taper.bottomScale}
        onChange={(value) => onUpdate({ bottomScale: Math.max(0.05, value) })}
      />
    </>
  );
}

interface BendFieldsProps {
  bend: BendModifier;
  onUpdate: (changes: Partial<BendModifier>) => void;
}

function BendFields({ bend, onUpdate }: BendFieldsProps) {
  return (
    <>
      <div className="flex items-center gap-2">
        <span className="w-14 shrink-0 text-xs font-semibold uppercase text-slate-400">{ko.modifier.bend.axis}</span>
        <div className="grid flex-1 grid-cols-2 gap-1.5">
          {BEND_AXIS_OPTIONS.map((axis) => (
            <button
              key={axis}
              type="button"
              onClick={() => onUpdate({ axis })}
              className={`rounded-md border px-2 py-1 text-xs font-medium transition ${
                bend.axis === axis
                  ? 'border-signal text-signal'
                  : 'border-slate-200 text-ink hover:border-signal hover:text-signal'
              }`}
            >
              {axis.toUpperCase()}
            </button>
          ))}
        </div>
      </div>
      <NumberField
        label={ko.modifier.bend.angle}
        min={-BEND_ANGLE_LIMIT_DEG}
        step={1}
        value={Math.round(radToDeg(bend.angle))}
        onChange={(value) =>
          onUpdate({ angle: degToRad(Math.min(BEND_ANGLE_LIMIT_DEG, Math.max(-BEND_ANGLE_LIMIT_DEG, value))) })
        }
      />
      <NumberField
        label={ko.modifier.bend.start}
        min={0}
        step={0.05}
        value={bend.start}
        onChange={(value) => onUpdate({ start: Math.min(1, Math.max(0, value)) })}
      />
      <NumberField
        label={ko.modifier.bend.end}
        min={0}
        step={0.05}
        value={bend.end}
        onChange={(value) => onUpdate({ end: Math.min(1, Math.max(0, value)) })}
      />
    </>
  );
}

function GeometryPanel() {
  const objects = useEditorStore((state) => state.objects);
  const selectedObjectId = useEditorStore((state) => state.selectedObjectId);
  const updateGeometryParams = useEditorStore((state) => state.updateGeometryParams);
  const updateModifiers = useEditorStore((state) => state.updateModifiers);

  const object = objects.find((item) => item.id === selectedObjectId);

  if (!object) {
    return <p className="text-sm text-slate-400">객체를 선택하세요.</p>;
  }
  if (object.type === 'group' || !object.geometryParams) {
    return <p className="text-sm text-slate-400">그룹에는 형태 속성이 없습니다.</p>;
  }

  const { type, geometryParams } = object;
  const qualityPresets = GEOMETRY_QUALITY_PRESETS[type];
  const segmentFields = GEOMETRY_SEGMENT_FIELDS[type] ?? [];
  const params = geometryParams as unknown as Record<string, number>;

  const setParam = (key: string, value: number) => {
    updateGeometryParams(object.id, { [key]: value } as Partial<GeometryParams>);
  };

  const taper: TaperModifier = object.modifiers.taper ?? { enabled: false, topScale: 1, bottomScale: 1 };
  const bend: BendModifier = object.modifiers.bend ?? { enabled: false, axis: 'z', angle: 0, start: 0, end: 1 };
  const showTaper = TAPER_APPLICABLE_TYPES.includes(type);
  const showBend = BEND_APPLICABLE_TYPES.includes(type);

  const hasFields =
    Boolean(qualityPresets) || type === 'roundedBox' || type === 'torus' || type === 'lathe' || segmentFields.length > 0;
  if (!hasFields) {
    return <p className="text-sm text-slate-400">이 도형은 조절 가능한 형태 속성이 없습니다.</p>;
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      {qualityPresets && (
        <div className="grid grid-cols-3 gap-1.5">
          {QUALITY_ORDER.map((quality) => (
            <button
              key={quality}
              type="button"
              onClick={() => updateGeometryParams(object.id, qualityPresets[quality])}
              className="rounded-md border border-slate-200 px-2 py-1.5 text-xs font-medium text-ink shadow-sm transition hover:border-signal hover:text-signal"
            >
              {GEOMETRY_QUALITY_LABELS[quality]}
            </button>
          ))}
        </div>
      )}

      <section className="flex flex-col gap-1.5">
        {type === 'roundedBox' && (
          <RoundedBoxFields params={geometryParams as RoundedBoxGeometryParams} onChange={setParam} />
        )}
        {type === 'torus' && <TorusFields params={geometryParams as TorusGeometryParams} onChange={setParam} />}
        {type === 'lathe' && (
          <LatheFields
            params={geometryParams as LatheGeometryParams}
            onUpdate={(changes) => updateGeometryParams(object.id, changes)}
          />
        )}
        {segmentFields.map((field) => (
          <NumberField
            key={field.key}
            label={field.label}
            min={field.min}
            step={1}
            value={params[field.key]}
            onChange={(value) => setParam(field.key, Math.round(Math.min(field.max, Math.max(field.min, value))))}
          />
        ))}
      </section>

      {showTaper && (
        <section className="flex flex-col gap-1.5 border-t border-slate-100 pt-2">
          <label className="flex items-center gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={taper.enabled}
              onChange={(event) => updateModifiers(object.id, { taper: { ...taper, enabled: event.target.checked } })}
            />
            {ko.modifier.taper.title}
          </label>
          {taper.enabled && (
            <TaperFields taper={taper} onUpdate={(changes) => updateModifiers(object.id, { taper: { ...taper, ...changes } })} />
          )}
        </section>
      )}

      {showBend && (
        <section className="flex flex-col gap-1.5 border-t border-slate-100 pt-2">
          <label className="flex items-center gap-2 text-xs text-slate-500">
            <input
              type="checkbox"
              checked={bend.enabled}
              onChange={(event) => updateModifiers(object.id, { bend: { ...bend, enabled: event.target.checked } })}
            />
            {ko.modifier.bend.title}
          </label>
          {bend.enabled && (
            <BendFields bend={bend} onUpdate={(changes) => updateModifiers(object.id, { bend: { ...bend, ...changes } })} />
          )}
        </section>
      )}
    </div>
  );
}

export default GeometryPanel;
