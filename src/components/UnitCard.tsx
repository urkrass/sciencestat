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
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-md border px-3 text-sm font-medium transition";

export function UnitCard({ unit }: UnitCardProps) {
  const unitHref = `/courses/statistics-for-scientific-claims/${unit.slug}`;
  const hasExercises = Boolean(getExerciseSetForUnit(unit.slug));
  const relatedSimulation = unit.relatedSimulationSlugs
    .map((slug) => getSimulation(slug))
    .find((simulation) => simulation?.status === "available" && simulation.href);

  return (
    <article className="border-b border-line py-5 last:border-b-0">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
            Unit {String(unit.number).padStart(2, "0")}
          </p>
          {hasExercises ? (
            <span className="inline-flex rounded-full border border-moss/30 bg-moss/10 px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-moss">
              Practice
            </span>
          ) : null}
        </div>
        <h2 className="mt-2 text-xl font-semibold leading-snug text-ink">
          {unit.title}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">
          {unit.description}
        </p>
        <div className="mt-3">
          <ConceptChipList conceptIds={unit.conceptIds} compact />
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={unitHref}
          className={`${baseButtonClass} border-moss bg-moss text-white hover:bg-moss-dark`}
        >
          Open unit <ArrowRight aria-hidden="true" className="h-4 w-4" />
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
