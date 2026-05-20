import { MathExpression } from "@/components/simulations/MathExpression";

type MathResolutionStep = {
  label: string;
  math: string;
};

type MathResolutionProps = {
  animationKey: number;
  steps: MathResolutionStep[];
};

export function MathResolution({ animationKey, steps }: MathResolutionProps) {
  return (
    <div
      key={animationKey}
      aria-live="polite"
      className="simulation-math-resolution mt-3 grid gap-1.5 text-xs text-slate-700"
    >
      {steps.map((step, index) => (
        <div
          key={`${step.label}-${step.math}`}
          className="simulation-math-step flex flex-wrap items-center gap-x-2 gap-y-1"
          style={{ animationDelay: `${index * 95}ms` }}
        >
          <span className="min-w-[4.25rem] text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-moss">
            {step.label}
          </span>
          <MathExpression math={step.math} />
        </div>
      ))}
    </div>
  );
}
