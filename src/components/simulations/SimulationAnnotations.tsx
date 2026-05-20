import type { ReactNode } from "react";

type FormulaStripProps = {
  children: ReactNode;
};

type TryThisPromptProps = {
  children: ReactNode;
};

type DirtySimulationNoticeProps = {
  isDirty: boolean;
};

type LegendItem = {
  label: string;
  swatchClassName: string;
  lineClassName?: string;
};

type SimulationLegendProps = {
  items: LegendItem[];
};

export function FormulaStrip({ children }: FormulaStripProps) {
  return (
    <div className="border-l-2 border-moss pl-3 text-sm font-semibold leading-6 text-slate-700">
      {children}
    </div>
  );
}

export function TryThisPrompt({ children }: TryThisPromptProps) {
  return (
    <p className="border-l-2 border-line pl-3 text-xs leading-[1.45] text-slate-600">
      <span className="font-semibold text-moss">Try this:</span> {children}
    </p>
  );
}

export function DirtySimulationNotice({ isDirty }: DirtySimulationNoticeProps) {
  if (!isDirty) {
    return null;
  }

  return (
    <p
      role="status"
      className="border-l-2 border-amber-500 pl-3 text-xs font-medium text-amber-900"
    >
      Settings changed - click Run experiment to update the simulation.
    </p>
  );
}

export function SimulationLegend({ items }: SimulationLegendProps) {
  return (
    <ul className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-600">
      {items.map((item) => (
        <li key={item.label} className="inline-flex items-center gap-1.5">
          <span
            aria-hidden="true"
            className={[
              "inline-flex h-2.5 w-5 items-center justify-center rounded-sm",
              item.swatchClassName
            ].join(" ")}
          >
            {item.lineClassName ? (
              <span className={["block h-0.5 w-5", item.lineClassName].join(" ")} />
            ) : null}
          </span>
          <span>{item.label}</span>
        </li>
      ))}
    </ul>
  );
}
