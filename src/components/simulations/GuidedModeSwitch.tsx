export type SimulationMode = "explore" | "guided";

type GuidedModeSwitchProps = {
  mode: SimulationMode;
  onChange: (mode: SimulationMode) => void;
  compact?: boolean;
};

const modes: { value: SimulationMode; label: string }[] = [
  { value: "explore", label: "Explore" },
  { value: "guided", label: "Guided comparison" }
];

export function GuidedModeSwitch({
  mode,
  onChange,
  compact = false
}: GuidedModeSwitchProps) {
  return (
    <fieldset className={compact ? "min-w-0 flex-1" : undefined}>
      <legend
        className={compact ? "sr-only" : "text-xs font-semibold text-ink sm:text-sm"}
      >
        Mode
      </legend>
      <div
        className={[
          "grid grid-cols-2 gap-1 rounded-md border border-line bg-white p-1",
          compact ? "" : "mt-1.5"
        ].join(" ")}
      >
        {modes.map((item) => {
          const isSelected = mode === item.value;

          return (
            <button
              key={item.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => onChange(item.value)}
              className={[
                "min-h-7 rounded-[5px] px-2 py-1 font-medium transition",
                compact ? "text-[0.68rem]" : "text-xs",
                isSelected
                  ? "bg-moss text-white shadow-sm"
                  : "text-ink hover:bg-paper hover:text-moss"
              ].join(" ")}
            >
              {item.label}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
