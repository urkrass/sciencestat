import Link from "next/link";
import { Activity, ArrowRight } from "lucide-react";
import { ConceptChipList } from "@/components/ConceptChipList";
import { getExerciseSetForUnit } from "@/content/exercises";
import { getSimulation } from "@/content/simulations";
import type { StatisticsUnit } from "@/content/statisticsUnits";

type UnitCardProps = {
  unit: StatisticsUnit;
};

const baseButtonClass =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition";

export function UnitCard({ unit }: UnitCardProps) {
  const unitHref = `/courses/statistics-for-scientific-claims/${unit.slug}`;
  const hasExercises = Boolean(getExerciseSetForUnit(unit.slug));
  const relatedSimulation = unit.relatedSimulationSlugs
    .map((slug) => getSimulation(slug))
    .find((simulation) => simulation?.status === "available" && simulation.href);

  return (
    <article className="grid gap-4 border-b border-line bg-white/70 py-4 last:border-b-0 md:grid-cols-[1fr_auto] md:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-start gap-3">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
              Unit {String(unit.number).padStart(2, "0")}
            </p>
            <h2 className="mt-1 text-lg font-semibold leading-snug text-ink">
              {unit.title}
            </h2>
          </div>
          {hasExercises ? (
            <span className="inline-flex rounded-full border border-moss/30 bg-moss/10 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-moss">
              Practice
            </span>
          ) : null}
        </div>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          {unit.description}
        </p>
        <div className="mt-3">
          <ConceptChipList conceptIds={unit.conceptIds} compact />
        </div>
      </div>
      <div className="flex flex-wrap gap-2 md:justify-end">
        <Link
          href={unitHref}
          className={`${baseButtonClass} border-moss bg-moss text-white hover:bg-moss-dark`}
        >
          Open <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
        {relatedSimulation?.href ? (
          <Link
            href={relatedSimulation.href}
            className={`${baseButtonClass} border-line bg-white text-ink hover:border-moss hover:text-moss`}
          >
            <Activity aria-hidden="true" className="h-4 w-4" />
            Related lab
          </Link>
        ) : null}
      </div>
    </article>
  );
}
