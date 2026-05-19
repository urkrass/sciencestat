import Link from "next/link";
import { ArrowLeft, ArrowRight, Download, ExternalLink, FileText } from "lucide-react";
import { PomodoroTimer } from "@/components/PomodoroTimer";
import { statisticsUnits, type StatisticsUnit } from "@/content/statisticsUnits";

type CourseSidebarProps = {
  activeSlug?: string;
  activeUnit?: StatisticsUnit;
  nextUnit?: StatisticsUnit | null;
  previousUnit?: StatisticsUnit | null;
};

const sideActionClass =
  "inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition";

export function CourseSidebar({
  activeSlug,
  activeUnit,
  nextUnit,
  previousUnit
}: CourseSidebarProps) {
  const isUnitWorkspace = Boolean(activeUnit);

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-line bg-white/82 p-4 shadow-sm">
      {activeUnit ? (
        <div className="shrink-0 border-b border-line pb-3">
          <Link
            href="/courses/statistics-for-scientific-claims"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-moss"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Course
          </Link>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-moss">
            Unit {String(activeUnit.number).padStart(2, "0")}
          </p>
          <h2 className="mt-1 text-base font-semibold leading-snug text-ink">
            {activeUnit.title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">{activeUnit.description}</p>
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
          <div className="mt-3 grid grid-cols-2 gap-2">
            {previousUnit ? (
              <Link
                href={`/courses/statistics-for-scientific-claims/${previousUnit.slug}`}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-line bg-white px-2 text-xs font-medium text-ink transition hover:border-moss hover:text-moss"
              >
                <ArrowLeft aria-hidden="true" className="h-3.5 w-3.5" />
                Previous
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-slate-100 px-2 text-xs font-medium text-slate-400">
                Previous
              </span>
            )}
            {nextUnit ? (
              <Link
                href={`/courses/statistics-for-scientific-claims/${nextUnit.slug}`}
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-md border border-line bg-white px-2 text-xs font-medium text-ink transition hover:border-moss hover:text-moss"
              >
                Next
                <ArrowRight aria-hidden="true" className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <span className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-slate-100 px-2 text-xs font-medium text-slate-400">
                Next
              </span>
            )}
          </div>
        </div>
      ) : null}
      <h2
        className={[
          "shrink-0 text-sm font-semibold uppercase tracking-[0.14em] text-moss",
          activeUnit ? "mt-4" : ""
        ].join(" ")}
      >
        Units
      </h2>
      <ol
        className={[
          "mt-3 min-h-0 min-w-0",
          isUnitWorkspace
            ? "grid grid-cols-4 gap-2"
            : "grid gap-2 sm:grid-cols-2 lg:block lg:space-y-1"
        ].join(" ")}
      >
        {statisticsUnits.map((unit) => {
          const isActive = activeSlug === unit.slug;

          return (
            <li key={unit.slug} className="min-w-0">
              <Link
                href={`/courses/statistics-for-scientific-claims/${unit.slug}`}
                aria-label={`Unit ${String(unit.number).padStart(2, "0")}: ${unit.title}`}
                title={unit.title}
                className={[
                  isUnitWorkspace
                    ? "flex h-9 items-center justify-center rounded-md border text-xs font-semibold transition"
                    : "grid grid-cols-[2.35rem_1fr] items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                  isActive
                    ? "border-moss bg-moss text-white"
                    : "border-line text-slate-700 hover:bg-slate-100 hover:text-ink"
                ].join(" ")}
              >
                {isUnitWorkspace ? (
                  String(unit.number).padStart(2, "0")
                ) : (
                  <>
                    <span
                      className={[
                        "flex h-8 w-8 items-center justify-center rounded border text-xs font-semibold",
                        isActive ? "border-white/35" : "border-line bg-paper text-moss"
                      ].join(" ")}
                    >
                      {String(unit.number).padStart(2, "0")}
                    </span>
                    <span className="leading-snug">{unit.title}</span>
                  </>
                )}
              </Link>
            </li>
          );
        })}
      </ol>
      {isUnitWorkspace ? <PomodoroTimer /> : null}
    </aside>
  );
}
