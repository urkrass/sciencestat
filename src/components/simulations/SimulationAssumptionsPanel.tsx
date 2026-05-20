type SimulationAssumptionsPanelProps = {
  assumptions: string[];
  note?: string;
};

export function SimulationAssumptionsPanel({
  assumptions,
  note
}: SimulationAssumptionsPanelProps) {
  return (
    <details className="rounded-md border border-line bg-white/85 p-2 text-xs text-slate-700">
      <summary className="cursor-pointer font-semibold uppercase tracking-[0.12em] text-moss">
        Model assumptions
      </summary>
      <ul className="mt-2 list-disc space-y-1 pl-4 leading-5">
        {assumptions.map((assumption) => (
          <li key={assumption}>{assumption}</li>
        ))}
      </ul>
      {note ? <p className="mt-2 leading-5 text-slate-600">{note}</p> : null}
    </details>
  );
}
