import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Download,
  ExternalLink,
  FlaskConical
} from "lucide-react";
import {
  chemistryUnits,
  type ChemistryUnit
} from "@/content/chemistryUnits";

type ChemistrySidebarProps = {
  activeSlug?: string;
  activeUnit?: ChemistryUnit;
  nextUnit?: ChemistryUnit | null;
  previousUnit?: ChemistryUnit | null;
};

const sideActionClass =
  "inline-flex h-9 items-center justify-center gap-2 rounded-md border px-3 text-sm font-medium transition";

export function ChemistrySidebar({
  activeSlug,
  activeUnit,
  nextUnit,
  previousUnit
}: ChemistrySidebarProps) {
  const isUnitWorkspace = Boolean(activeUnit);

  return (
    <aside className="flex h-full min-h-0 flex-col overflow-hidden rounded-lg border border-line bg-white/82 p-4 shadow-sm">
      {activeUnit ? (
        <div className="shrink-0 border-b border-line pb-3">
          <Link
            href="/courses/statistics-for-scientific-claims/chemistry"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-moss"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Chemistry
          </Link>
          <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-moss">
            Chemistry {String(activeUnit.number).padStart(2, "0")}
          </p>
          <h2 className="mt-1 text-base font-semibold leading-snug text-ink">
            {activeUnit.title}
          </h2>
          <p className="mt-1 text-xs leading-5 text-slate-600">
            {activeUnit.description}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <a
              href={activeUnit.pdfPath}
              download
              className={`${sideActionClass} border-moss bg-moss text-white hover:bg-moss-dark`}
            >
              <Download aria-hidden="true" className="h-4 w-4" />
              PDF
            </a>
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
                href={`/courses/statistics-for-scientific-claims/chemistry/${previousUnit.slug}`}
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
                href={`/courses/statistics-for-scientific-claims/chemistry/${nextUnit.slug}`}
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

      <nav aria-label="Chemistry book" className={activeUnit ? "mt-3" : ""}>
        <Link
          href="/"
          className="flex h-9 items-center justify-center gap-2 rounded-md border border-line bg-paper px-3 text-sm font-medium text-ink transition hover:border-moss hover:text-moss"
        >
          <FlaskConical aria-hidden="true" className="h-4 w-4" />
          Subject choice
        </Link>
      </nav>

      <h2 className="mt-4 shrink-0 text-sm font-semibold uppercase tracking-[0.14em] text-moss">
        Chemistry notes
      </h2>
      <ol
        className={[
          "mt-3 min-h-0 min-w-0",
          isUnitWorkspace
            ? "grid grid-cols-3 gap-2"
            : "grid gap-2 sm:grid-cols-2 lg:block lg:space-y-1"
        ].join(" ")}
      >
        {chemistryUnits.map((unit) => {
          const isActive = activeSlug === unit.slug;

          return (
            <li key={unit.slug} className="min-w-0">
              <Link
                href={`/courses/statistics-for-scientific-claims/chemistry/${unit.slug}`}
                aria-label={`Chemistry note ${String(unit.number).padStart(2, "0")}: ${unit.title}`}
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
    </aside>
  );
}
