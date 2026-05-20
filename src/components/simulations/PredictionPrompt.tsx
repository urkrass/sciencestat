export type SamplingPrediction = "A" | "B" | "same" | null;

type PredictionPromptProps = {
  value: SamplingPrediction;
  onChange: (value: SamplingPrediction) => void;
};

const options: { value: Exclude<SamplingPrediction, null>; label: string }[] = [
  { value: "A", label: "Scenario A" },
  { value: "B", label: "Scenario B" },
  { value: "same", label: "About the same" }
];

export function PredictionPrompt({ value, onChange }: PredictionPromptProps) {
  return (
    <section className="border-t border-line pt-2">
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">
        Step 1: Prediction
      </h3>
      <p className="mt-1 text-xs leading-4 text-slate-700">
        Which scenario do you expect to produce a tighter distribution of sample
        means?
      </p>
      <div className="mt-2 grid grid-cols-3 gap-1">
        {options.map((option) => {
          const isSelected = value === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(option.value)}
              className={[
                "min-h-8 rounded-md border px-2 text-center text-[0.68rem] font-semibold transition",
                isSelected
                  ? "border-moss bg-moss text-white"
                  : "border-line bg-transparent text-ink hover:border-moss hover:text-moss"
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
