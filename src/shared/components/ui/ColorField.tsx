import { useEffect, useState } from 'react';

const HEX_COLOR_PATTERN = /^#[0-9a-fA-F]{6}$/;

interface ColorFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

function ColorField({ label, value, onChange }: ColorFieldProps) {
  const [draft, setDraft] = useState(value);

  useEffect(() => {
    setDraft(value);
  }, [value]);

  return (
    <label className="flex items-center gap-2 text-xs text-slate-500">
      <span className="w-20 shrink-0 font-semibold uppercase text-slate-400">{label}</span>
      <input
        type="color"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-7 w-9 shrink-0 cursor-pointer rounded border border-slate-200"
      />
      <input
        type="text"
        value={draft}
        onChange={(event) => {
          const next = event.target.value;
          setDraft(next);
          if (HEX_COLOR_PATTERN.test(next)) onChange(next);
        }}
        className="w-full rounded-md border border-slate-200 px-2 py-1 text-sm text-ink focus:border-signal focus:outline-none"
      />
    </label>
  );
}

export default ColorField;
