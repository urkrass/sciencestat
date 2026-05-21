import type { ReactNode } from "react";

type SimulationLabShellProps = {
  children: ReactNode;
  isBusy?: boolean;
  resultColumn?: "standard" | "wide";
};

export function SimulationLabShell({
  children,
  isBusy = false,
  resultColumn = "standard"
}: SimulationLabShellProps) {
  const desktopColumns =
    resultColumn === "wide"
      ? "min-[960px]:grid-cols-[13rem_minmax(0,1fr)_15rem] xl:grid-cols-[17rem_minmax(0,1fr)_20rem]"
      : "min-[960px]:grid-cols-[13rem_minmax(0,1fr)_13rem] xl:grid-cols-[17rem_minmax(0,1fr)_18rem]";

  return (
    <div
      aria-busy={isBusy}
      className={[
        "block h-full min-h-0 overflow-y-auto rounded-lg border border-line bg-white shadow-sm",
        "min-[960px]:grid min-[960px]:overflow-hidden",
        desktopColumns
      ].join(" ")}
    >
      {children}
    </div>
  );
}
