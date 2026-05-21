import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { ConceptChipList } from "@/components/ConceptChipList";
import type { Simulation } from "@/content/simulations";

type SimulationCardProps = {
  simulation: Simulation;
};

export function SimulationCard({ simulation }: SimulationCardProps) {
  const simulationHref = simulation.href;
  const isAvailable =
    simulation.status === "available" && typeof simulationHref === "string";

  return (
    <article className="flex min-h-[11rem] flex-col rounded-lg border border-line bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <h2 className="text-lg font-semibold leading-snug text-ink">
          {simulation.title}
        </h2>
        <span
          className={[
            "shrink-0 rounded-full border px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em]",
            isAvailable
              ? "border-moss/30 bg-moss/10 text-moss"
              : "border-line bg-slate-100 text-slate-500"
          ].join(" ")}
        >
          {isAvailable ? "Available" : "Coming soon"}
        </span>
      </div>
      <p className="mt-3 text-sm leading-6 text-slate-600">{simulation.description}</p>
      <p className="mt-2 border-l-2 border-moss pl-3 text-xs leading-5 text-slate-600">
        <span className="font-semibold text-ink">Learning goal:</span>{" "}
        {simulation.learningGoal}
      </p>
      <div className="mt-3">
        <ConceptChipList conceptIds={simulation.conceptIds} compact />
      </div>
      <div className="mt-auto pt-4">
        {isAvailable ? (
          <Link
            href={simulationHref}
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-moss bg-moss px-3 text-sm font-medium text-white transition hover:bg-moss-dark"
          >
            Open simulation
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-slate-100 px-3 text-sm font-medium text-slate-500">
            Coming soon
          </span>
        )}
      </div>
    </article>
  );
}
