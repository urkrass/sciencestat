import Link from "next/link";
import { statisticsUnits } from "@/content/statisticsUnits";

type CourseSidebarProps = {
  activeSlug?: string;
};

export function CourseSidebar({ activeSlug }: CourseSidebarProps) {
  return (
    <aside className="min-w-0 rounded-lg border border-line bg-white/82 p-4 shadow-sm lg:sticky lg:top-6">
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
