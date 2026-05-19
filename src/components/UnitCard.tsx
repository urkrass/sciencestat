import Link from "next/link";
import { ArrowRight, Download, FileText } from "lucide-react";
import { getExerciseSetForUnit } from "@/content/exercises";
import type { StatisticsUnit } from "@/content/statisticsUnits";

type UnitCardProps = {
  unit: StatisticsUnit;
};

const baseButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition";

export function UnitCard({ unit }: UnitCardProps) {
  const unitHref = `/courses/statistics-for-scientific-claims/${unit.slug}`;
  const hasExercises = Boolean(getExerciseSetForUnit(unit.slug));

  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-sheet">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
            Unit {String(unit.number).padStart(2, "0")}
          </p>
          <h2 className="mt-2 text-xl font-semibold leading-tight text-ink">
            {unit.title}
          </h2>
          {hasExercises ? (
            <span className="mt-3 inline-flex rounded-full border border-moss/30 bg-moss/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-moss">
              Interactive exercises
            </span>
          ) : null}
        </div>
      </div>
      <p className="mt-4 min-h-[5rem] text-sm leading-6 text-slate-600">
        {unit.description}
      </p>
      <div className="mt-5 flex flex-wrap gap-2">
        <Link
          href={unitHref}
          className={`${baseButtonClass} border-moss bg-moss text-white hover:bg-moss-dark`}
        >
          Open <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
        <a
          href={unit.pdfPath}
          download
          className={`${baseButtonClass} border-line bg-white text-ink hover:border-moss hover:text-moss`}
        >
          <Download aria-hidden="true" className="h-4 w-4" />
          Download PDF
        </a>
        {unit.hasTex ? (
          <a
            href={unit.texPath}
            download
            className={`${baseButtonClass} border-line bg-white text-ink hover:border-moss hover:text-moss`}
          >
            <FileText aria-hidden="true" className="h-4 w-4" />
            Download LaTeX
          </a>
        ) : (
          <span
            aria-disabled="true"
            role="link"
            title="LaTeX source file was not found in this workspace."
            className={`${baseButtonClass} cursor-not-allowed border-line bg-slate-100 text-slate-400`}
          >
            <FileText aria-hidden="true" className="h-4 w-4" />
            Download LaTeX
          </span>
        )}
      </div>
    </article>
  );
}
