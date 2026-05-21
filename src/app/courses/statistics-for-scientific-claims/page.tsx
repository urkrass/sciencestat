import type { Metadata } from "next";
import Link from "next/link";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BookOpen,
  CheckCircle2
} from "lucide-react";
import { UnitCard } from "@/components/UnitCard";
import { getExerciseSetForUnit } from "@/content/exercises";
import { simulations } from "@/content/simulations";
import { statisticsUnits } from "@/content/statisticsUnits";

export const metadata: Metadata = {
  title: "Statistics for Scientific Claims",
  description:
    "Biology-focused lecture notes and printable PDFs for scientific data analysis, statistics, and evidence reasoning."
};

export default function CoursePage() {
  const firstUnit = statisticsUnits[0];
  const availableSimulations = simulations.filter(
    (simulation) => simulation.status === "available" && simulation.href
  );
  const practiceCount = statisticsUnits.filter((unit) =>
    getExerciseSetForUnit(unit.slug)
  ).length;

  return (
    <main className="mx-auto h-dvh w-full max-w-7xl overflow-y-auto overflow-x-hidden px-4 py-5 sm:px-6 lg:px-8">
      <section className="border-b border-line pb-5">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-moss"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Subject choice
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
              Biology learning path
            </p>
            <h1 className="heading-serif mt-1 max-w-4xl text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Statistics for Scientific Claims
            </h1>
            <p className="mt-3 max-w-3xl text-base leading-7 text-slate-600">
              Read a unit, test the idea in a simulation, then check whether your
              conclusion keeps the uncertainty and assumptions visible.
            </p>
          </div>
          <div className="flex flex-wrap gap-2 lg:justify-end">
            <Link
              href={`/courses/statistics-for-scientific-claims/${firstUnit.slug}`}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-moss bg-moss px-4 text-sm font-semibold text-white transition hover:bg-moss-dark"
            >
              Start Unit 01
              <ArrowRight aria-hidden="true" className="h-4 w-4" />
            </Link>
            <Link
              href="/courses/statistics-for-scientific-claims/simulations"
              className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-moss hover:text-moss"
            >
              Simulations
              <Activity aria-hidden="true" className="h-4 w-4" />
            </Link>
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="border-l-2 border-moss pl-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <BookOpen aria-hidden="true" className="h-4 w-4 text-moss" />
              11 reading units
            </p>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Printable notes are kept as the primary study surface.
            </p>
          </div>
          <div className="border-l-2 border-moss pl-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <Activity aria-hidden="true" className="h-4 w-4 text-moss" />
              {availableSimulations.length} active labs
            </p>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Simulations connect sampling, confidence, and p-values to the units.
            </p>
          </div>
          <div className="border-l-2 border-moss pl-3">
            <p className="flex items-center gap-2 text-sm font-semibold text-ink">
              <CheckCircle2 aria-hidden="true" className="h-4 w-4 text-moss" />
              {practiceCount} practice sets
            </p>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Every unit now has a short check for understanding.
            </p>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="flex flex-col gap-2 border-b border-line pb-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
              Units
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Follow the path in order, or jump directly to the concept you need.
            </p>
          </div>
          <p className="text-sm font-medium text-slate-500">
            Recommended next step: Unit 01
          </p>
        </div>
        <div aria-label="Course units" className="bg-white/60">
          {statisticsUnits.map((unit) => (
            <UnitCard key={unit.slug} unit={unit} />
          ))}
        </div>
      </section>
    </main>
  );
}
