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
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <section className="border-b border-line pb-8 pt-4">
        <p className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
          Digital book
        </p>
        <div className="mt-3 max-w-4xl">
          <h1 className="heading-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
            Statistics for Scientific Claims
          </h1>
          <p className="mt-4 text-xl leading-8 text-slate-700">
            Lecture notes for IB DP Biology and Chemistry
          </p>
          <p className="mt-4 max-w-3xl leading-7 text-slate-600">
            Eleven printable units on scientific data analysis, statistical evidence,
            uncertainty, and writing defensible conclusions from experimental data.
          </p>
        </div>
      </section>

      <div className="grid gap-6 py-8 lg:grid-cols-[18rem_1fr]">
        <CourseSidebar />
        <section aria-label="Course units" className="grid gap-4 md:grid-cols-2">
          {statisticsUnits.map((unit) => (
            <UnitCard key={unit.slug} unit={unit} />
          ))}
        </section>
      </div>
    </main>
  );
}
