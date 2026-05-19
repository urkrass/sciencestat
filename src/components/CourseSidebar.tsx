import Link from "next/link";
import { ArrowLeft, Download, ExternalLink, FileText } from "lucide-react";
import { statisticsUnits, type StatisticsUnit } from "@/content/statisticsUnits";

type CourseSidebarProps = {
  activeSlug?: string;
  activeUnit?: StatisticsUnit;
};

const sideActionClass =
  "inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition";

export function CourseSidebar({ activeSlug, activeUnit }: CourseSidebarProps) {
  return (
    <aside className="min-w-0 rounded-lg border border-line bg-white/82 p-4 shadow-sm lg:sticky lg:top-6">
      {activeUnit ? (
        <div className="mb-5 border-b border-line pb-4">
          <Link
            href="/courses/statistics-for-scientific-claims"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-moss"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Course
          </Link>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.16em] text-moss">
            Unit {String(activeUnit.number).padStart(2, "0")}
          </p>
          <h2 className="mt-1 text-base font-semibold leading-snug text-ink">
            {activeUnit.title}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">{activeUnit.description}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={activeUnit.pdfPath}
              download
              className={`${sideActionClass} border-moss bg-moss text-white hover:bg-moss-dark`}
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              PDF
            </a>
            {activeUnit.hasTex ? (
              <a
                href={activeUnit.texPath}
                download
                className={`${sideActionClass} border-line bg-white text-ink hover:border-moss hover:text-moss`}
              >
                <FileText aria-hidden="true" className="h-4 w-4" />
                LaTeX
              </a>
            ) : (
              <span
                aria-disabled="true"
                role="link"
                title="LaTeX source file was not found in this workspace."
                className={`${sideActionClass} cursor-not-allowed border-line bg-slate-100 text-slate-400`}
              >
                <FileText aria-hidden="true" className="h-4 w-4" />
                LaTeX
              </span>
            )}
            <a
              href={activeUnit.pdfPath}
              target="_blank"
              rel="noreferrer"
              className={`${sideActionClass} border-line bg-white text-ink hover:border-moss hover:text-moss`}
            >
              <ExternalLink aria-hidden="true" className="h-4 w-4" />
              Open
            </a>
          </div>
        </div>
      ) : null}
      <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
        Units
      </h2>
      <ol className="mt-4 grid min-w-0 gap-2 sm:grid-cols-2 lg:block lg:space-y-1">
        {statisticsUnits.map((unit) => {
          const isActive = activeSlug === unit.slug;

          return (
            <li key={unit.slug} className="min-w-0">
              <Link
                href={`/courses/statistics-for-scientific-claims/${unit.slug}`}
                className={[
                  "grid grid-cols-[2.35rem_1fr] items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                  isActive
                    ? "bg-moss text-white"
                    : "text-slate-700 hover:bg-slate-100 hover:text-ink"
                ].join(" ")}
              >
                <span
                  className={[
                    "flex h-8 w-8 items-center justify-center rounded border text-xs font-semibold",
                    isActive ? "border-white/35" : "border-line bg-paper text-moss"
                  ].join(" ")}
                >
                  {String(unit.number).padStart(2, "0")}
                </span>
                <span className="leading-snug">{unit.title}</span>
              </Link>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
