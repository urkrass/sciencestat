import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CourseSidebar } from "@/components/CourseSidebar";
import { UnitCard } from "@/components/UnitCard";
import { statisticsUnits } from "@/content/statisticsUnits";

export const metadata: Metadata = {
  title: "Statistics for Scientific Claims",
  description:
    "Biology-focused lecture notes and printable PDFs for scientific data analysis, statistics, and evidence reasoning."
};

export default function CoursePage() {
  return (
    <main className="mx-auto h-dvh w-full max-w-7xl overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 lg:px-8">
      <section className="shrink-0 border-b border-line pb-3">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-moss"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Subject choice
        </Link>
        <div className="flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-moss">
              Biology book
            </p>
            <h1 className="heading-serif mt-1 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              Statistics for Scientific Claims
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600 lg:text-right">
            Biology-focused lecture notes: eleven printable units on statistical
            evidence, uncertainty, and defensible conclusions.
          </p>
        </div>
        <div className="mt-3">
          <Link
            href="/courses/statistics-for-scientific-claims/simulations"
            className="inline-flex h-9 items-center justify-center gap-2 rounded-md border border-moss bg-white px-3 text-sm font-medium text-moss transition hover:bg-moss hover:text-white"
          >
            Statistical simulations
            <ArrowRight aria-hidden="true" className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="grid gap-4 py-4 lg:grid-cols-[18rem_1fr]">
        <CourseSidebar />
        <section
          aria-label="Course units"
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          {statisticsUnits.map((unit) => (
            <UnitCard key={unit.slug} unit={unit} />
          ))}
        </section>
      </div>
    </main>
  );
}
