interface NumberFieldProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
}

function NumberField({ label, value, onChange, step = 0.1, min }: NumberFieldProps) {
  return (
    <label className="flex items-center gap-2 text-xs text-slate-500">
      <span className="w-14 shrink-0 font-semibold uppercase text-slate-400">{label}</span>
      <input
        type="number"
        step={step}
        min={min}
        value={Number.isFinite(value) ? Number(value.toFixed(4)) : 0}
        onChange={(event) => {
          const next = event.target.valueAsNumber;
          if (Number.isNaN(next)) return;
          onChange(next);
        }}
        className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm text-ink focus:border-signal focus:outline-none"
      />
    </label>
  );
}

export default NumberField;
