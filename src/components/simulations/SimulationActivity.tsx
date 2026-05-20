import type { ReactNode } from "react";

type SimulationActivityPanelProps = {
  title?: string;
  prompt: string;
  modeSwitch: ReactNode;
  children: ReactNode;
};

type ExperimentActionButtonProps = {
  title: string;
  description: string;
  onClick: () => void;
  isActive?: boolean;
};

type RunExperimentButtonProps = {
  isRunning: boolean;
  onClick: () => void;
  label?: string;
  runningLabel?: string;
  ariaLabel?: string;
};

type StepperControlProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  onChange: (value: number) => void;
  formatValue?: (value: number) => string;
};

type AdvancedSettingsProps = {
  children: ReactNode;
  summary?: string;
};

type WhatChangedCalloutProps = {
  children: ReactNode;
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function SimulationActivityPanel({
  title = "Activity",
  prompt,
  modeSwitch,
  children
}: SimulationActivityPanelProps) {
  return (
    <section className="min-h-0 border-b border-line bg-paper/70 p-3 min-[960px]:border-b-0 min-[960px]:border-r min-[960px]:overflow-y-auto">
      <div className="flex flex-col gap-2">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
            {title}
          </h2>
          <p className="mt-1 text-sm leading-5 text-slate-700">{prompt}</p>
        </div>
        {modeSwitch}
      </div>
      <div className="mt-3 space-y-3">{children}</div>
    </section>
  );
}

export function ExperimentActionButton({
  title,
  description,
  onClick,
  isActive = false
}: ExperimentActionButtonProps) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onClick}
      className={[
        "w-full rounded-lg border p-3 text-left transition active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0",
        isActive
          ? "border-moss bg-white text-ink shadow-sm ring-2 ring-moss/10"
          : "border-line bg-white/78 text-ink hover:border-moss hover:bg-white"
      ].join(" ")}
    >
      <span className="block text-sm font-semibold">{title}</span>
      <span className="mt-1 block text-xs leading-4 text-slate-600">
        {description}
      </span>
    </button>
  );
}

export function RunExperimentButton({
  isRunning,
  onClick,
  label = "Run experiment",
  runningLabel = "Running",
  ariaLabel = "Run experiment"
}: RunExperimentButtonProps) {
  return (
    <button
      type="button"
      aria-label={ariaLabel}
      disabled={isRunning}
      onClick={onClick}
      className="min-h-12 w-full rounded-lg border border-moss bg-moss px-4 text-base font-semibold text-white shadow-sm transition hover:bg-moss-dark active:translate-y-px active:shadow-none disabled:cursor-wait disabled:bg-moss-dark motion-reduce:transition-none motion-reduce:active:translate-y-0"
    >
      {isRunning ? runningLabel : label}
    </button>
  );
}

export function StepperControl({
  label,
  value,
  min,
  max,
  step = 1,
  onChange,
  formatValue = (nextValue) => String(nextValue)
}: StepperControlProps) {
  const decrease = () => onChange(clamp(value - step, min, max));
  const increase = () => onChange(clamp(value + step, min, max));

  return (
    <div className="rounded-lg border border-line bg-white/78 p-2.5">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-semibold text-ink">{label}</span>
        <span className="text-sm font-semibold text-moss">
          {formatValue(value)}
        </span>
      </div>
      <div className="mt-2 grid grid-cols-[2.25rem_1fr_2.25rem] items-center gap-2">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={decrease}
          className="h-9 rounded-md border border-line bg-white text-lg font-semibold text-ink transition hover:border-moss hover:text-moss active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0"
        >
          -
        </button>
        <div className="h-2 rounded-full bg-line">
          <div
            className="h-2 rounded-full bg-moss"
            style={{
              width: `${((value - min) / Math.max(max - min, 1)) * 100}%`
            }}
          />
        </div>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={increase}
          className="h-9 rounded-md border border-line bg-white text-lg font-semibold text-ink transition hover:border-moss hover:text-moss active:translate-y-px motion-reduce:transition-none motion-reduce:active:translate-y-0"
        >
          +
        </button>
      </div>
    </div>
  );
}

export function AdvancedSettings({
  children,
  summary = "Advanced settings"
}: AdvancedSettingsProps) {
  return (
    <details className="border-t border-line pt-3 text-xs text-slate-700">
      <summary className="cursor-pointer font-semibold uppercase tracking-[0.12em] text-moss">
        {summary}
      </summary>
      <div className="mt-3 space-y-2.5">{children}</div>
    </details>
  );
}

export function WhatChangedCallout({ children }: WhatChangedCalloutProps) {
  return (
    <p
      aria-live="polite"
      className="mt-3 border-l-2 border-moss pl-3 text-xs leading-5 text-slate-700"
    >
      <span className="font-semibold text-ink">What changed:</span> {children}
    </p>
  );
}
