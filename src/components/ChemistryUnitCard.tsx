import Link from "next/link";
import { ArrowRight, Download } from "lucide-react";
import type { ChemistryUnit } from "@/content/chemistryUnits";

type ChemistryUnitCardProps = {
  unit: ChemistryUnit;
};

const baseButtonClass =
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-md border px-2.5 text-xs font-medium transition";

export function ChemistryUnitCard({ unit }: ChemistryUnitCardProps) {
  const unitHref = `/courses/statistics-for-scientific-claims/chemistry/${unit.slug}`;

  return (
    <article className="flex min-h-[10.75rem] flex-col overflow-hidden rounded-lg border border-line bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-sheet">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
        Chemistry {String(unit.number).padStart(2, "0")}
      </p>
      <h2 className="unit-card-title mt-1 text-base font-semibold text-ink">
        {unit.title}
      </h2>
      <p className="unit-card-description mt-2 text-xs leading-5 text-slate-600">
        {unit.description}
      </p>
      <div className="mt-auto flex flex-wrap gap-2 pt-3">
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
          PDF
        </a>
      </div>
    </article>
  );
}
