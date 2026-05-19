type NumberSliderProps = {
  id: string;
  label: string;
  min: number;
  max: number;
  step?: number;
  value: number;
  onChange: (value: number) => void;
  helpText?: string;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function NumberSlider({
  id,
  label,
  min,
  max,
  step = 1,
  value,
  onChange,
  helpText
}: NumberSliderProps) {
  const handleChange = (nextValue: number) => {
    if (Number.isFinite(nextValue)) {
      onChange(clamp(nextValue, min, max));
    }
  };

  return (
      <div className="space-y-1.5">
      <div className="flex items-baseline justify-between gap-3">
        <label htmlFor={id} className="text-sm font-semibold text-ink">
          {label}
        </label>
        <span className="text-sm font-medium text-moss">{value}</span>
      </div>
      <div className="grid grid-cols-[1fr_5rem] items-center gap-3">
        <input
          id={id}
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => handleChange(Number(event.target.value))}
          className="h-2 w-full cursor-pointer accent-moss"
        />
        <input
          aria-label={`${label} value`}
          type="number"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(event) => handleChange(Number(event.target.value))}
          className="h-8 rounded-md border border-line bg-white px-2 text-sm text-ink focus:border-moss focus:outline-none"
        />
      </div>
      {helpText ? <p className="text-xs leading-5 text-slate-500">{helpText}</p> : null}
    </div>
  );
}
