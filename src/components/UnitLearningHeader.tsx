import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  Download,
  ExternalLink,
  FileText
} from "lucide-react";
import { ConceptChipList } from "@/components/ConceptChipList";
import { getSimulation } from "@/content/simulations";
import type { ExerciseSet } from "@/content/exercises";
import type { StatisticsUnit } from "@/content/statisticsUnits";

type UnitLearningHeaderProps = {
  unit: StatisticsUnit;
  exerciseSet: ExerciseSet | null;
  nextUnit?: StatisticsUnit | null;
  previousUnit?: StatisticsUnit | null;
};

const quietButtonClass =
  "inline-flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-white px-3 text-sm font-medium text-ink transition hover:border-moss hover:text-moss";

export function UnitLearningHeader({
  unit,
  exerciseSet,
  nextUnit,
  previousUnit
}: UnitLearningHeaderProps) {
  const relatedSimulations = unit.relatedSimulationSlugs
    .map((slug) => getSimulation(slug))
    .filter((simulation) => simulation?.status === "available" && simulation.href);

  return (
    <header className="shrink-0 border-b border-line pb-3">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0">
          <Link
            href="/courses/statistics-for-scientific-claims"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-moss"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Course
          </Link>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-moss">
            Unit {String(unit.number).padStart(2, "0")}
          </p>
          <h1 className="heading-serif mt-1 max-w-4xl text-2xl font-semibold leading-tight text-ink sm:text-3xl">
            {unit.title}
          </h1>
          <p className="mt-2 max-w-4xl text-sm leading-6 text-slate-600">
            {unit.description}
          </p>
          <div className="mt-3">
            <ConceptChipList conceptIds={unit.conceptIds} compact />
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 lg:justify-end">
          {previousUnit ? (
            <Link
              href={`/courses/statistics-for-scientific-claims/${previousUnit.slug}`}
              className={quietButtonClass}
            >
              <ArrowLeft aria-hidden="true" className="h-4 w-4" />
              Previous
            </Link>
          ) : null}
          {nextUnit ? (
            <Link
              href={`/courses/statistics-for-scientific-claims/${nextUnit.slug}`}
              className={quietButtonClass}
            >
              Next
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
          ) : null}
          <details className="relative">
            <summary
              className={`${quietButtonClass} cursor-pointer list-none [&::-webkit-details-marker]:hidden`}
            >
              Resources
            </summary>
            <div className="absolute left-0 z-20 mt-2 w-52 rounded-lg border border-line bg-white p-2 shadow-sheet sm:left-auto sm:right-0">
              <a href={unit.pdfPath} download className={`${quietButtonClass} w-full`}>
                <Download aria-hidden="true" className="h-4 w-4" />
                Download PDF
              </a>
              <a
                href={unit.pdfPath}
                target="_blank"
                rel="noreferrer"
                className={`${quietButtonClass} mt-2 w-full`}
              >
                <ExternalLink aria-hidden="true" className="h-4 w-4" />
                Open PDF
              </a>
              {unit.hasTex ? (
                <a
                  href={unit.texPath}
                  download
                  className={`${quietButtonClass} mt-2 w-full`}
                >
                  <FileText aria-hidden="true" className="h-4 w-4" />
                  Download LaTeX
                </a>
              ) : (
                <span
                  aria-disabled="true"
                  role="link"
                  title="LaTeX source file was not found in this workspace."
                  className="mt-2 inline-flex h-9 w-full cursor-not-allowed items-center justify-center gap-2 rounded-md border border-line bg-slate-100 px-3 text-sm font-medium text-slate-400"
                >
                  <FileText aria-hidden="true" className="h-4 w-4" />
                  LaTeX unavailable
                </span>
              )}
            </div>
          </details>
        </div>
      </div>

      <div className="mt-3 flex flex-col gap-2 text-sm leading-6 text-slate-700 lg:flex-row lg:items-center lg:justify-between">
        <p className="max-w-4xl">
          <span className="font-semibold text-ink">Key idea:</span> {unit.keyIdea}
        </p>
        <div className="flex shrink-0 flex-wrap gap-2">
          {exerciseSet ? (
            <span className="inline-flex h-9 items-center justify-center rounded-md border border-moss bg-moss px-3 text-sm font-medium text-white">
              Practice available
            </span>
          ) : null}
          {relatedSimulations.map((simulation) =>
            simulation?.href ? (
              <Link
                key={simulation.slug}
                href={simulation.href}
                className={quietButtonClass}
              >
                <Activity aria-hidden="true" className="h-4 w-4" />
                {simulation.title}
              </Link>
            ) : null
          )}
        </div>
      </div>
    </header>
  );
}
