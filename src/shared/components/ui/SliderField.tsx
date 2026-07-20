interface SliderFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
}

function SliderField({ label, value, onChange, min = 0, max = 1, step = 0.01 }: SliderFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-xs text-slate-500">
      <div className="flex items-center justify-between">
        <span className="font-semibold uppercase text-slate-400">{label}</span>
        <input
          type="number"
          min={min}
          max={max}
          step={step}
          value={Number.isFinite(value) ? Number(value.toFixed(3)) : 0}
          onChange={(event) => {
            const next = event.target.valueAsNumber;
            if (Number.isNaN(next)) return;
            onChange(Math.min(max, Math.max(min, next)));
          }}
          className="w-16 rounded-md border border-slate-200 px-1.5 py-0.5 text-right text-sm text-ink focus:border-signal focus:outline-none"
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(event.target.valueAsNumber)}
        className="accent-signal"
      />
    </label>
  );
}

export default SliderField;
