import type { ReactNode } from "react";

type SimulationPanelProps = {
  title?: string;
  children: ReactNode;
  className?: string;
};

export function SimulationPanel({
  title,
  children,
  className = ""
}: SimulationPanelProps) {
  return (
    <section
      className={[
        "rounded-lg border border-line bg-white p-4 shadow-sm",
        className
      ].join(" ")}
    >
      {title ? (
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
          {title}
        </h2>
      ) : null}
      {children}
    </section>
  );
}
