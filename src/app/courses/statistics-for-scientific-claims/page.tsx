import type { Metadata } from "next";
import { CourseSidebar } from "@/components/CourseSidebar";
import { UnitCard } from "@/components/UnitCard";
import { statisticsUnits } from "@/content/statisticsUnits";

export const metadata: Metadata = {
  title: "Statistics for Scientific Claims",
  description:
    "Lecture notes and printable PDFs for scientific data analysis, statistics, and evidence reasoning in IB Biology and Chemistry."
};

export default function CoursePage() {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-7xl flex-col overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <section className="shrink-0 border-b border-line pb-3">
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
              Digital book
            </p>
            <h1 className="heading-serif mt-1 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              Statistics for Scientific Claims
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600 lg:text-right">
            Lecture notes for IB DP Biology and Chemistry: eleven printable units on
            statistical evidence, uncertainty, and defensible conclusions.
          </p>
        </div>
      </section>

      <div className="grid min-h-0 flex-1 gap-4 py-4 lg:grid-cols-[18rem_1fr]">
        <CourseSidebar />
        <section
          aria-label="Course units"
          className="grid min-h-0 gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          {statisticsUnits.map((unit) => (
            <UnitCard key={unit.slug} unit={unit} />
          ))}
        </section>
      </div>
    </main>
  );
}
