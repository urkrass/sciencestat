import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SimulationCard } from "@/components/simulations/SimulationCard";
import { simulations } from "@/content/simulations";

export const metadata: Metadata = {
  title: "Statistical simulations | Statistics for Scientific Claims",
  description:
    "Interactive models for seeing sampling, uncertainty, and statistical evidence."
};

export default function SimulationsPage() {
  const availableSimulations = simulations.filter(
    (simulation) => simulation.status === "available"
  );
  const plannedSimulations = simulations.filter(
    (simulation) => simulation.status !== "available"
  );

  return (
    <main className="mx-auto h-dvh w-full max-w-7xl overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 lg:px-8">
      <section className="border-b border-line pb-4">
        <Link
          href="/courses/statistics-for-scientific-claims"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-moss"
        >
          <ArrowLeft aria-hidden="true" className="h-4 w-4" />
          Back to course
        </Link>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-moss">
          Simulation labs
        </p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="heading-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Statistical simulations
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
              Guided labs for seeing sampling, uncertainty, and statistical
              evidence behave under repeated data generation.
            </p>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600 lg:text-right">
            Start with the available labs; planned labs show where the learning
            path will expand next.
          </p>
        </div>
      </section>

      <section
        aria-label="Available statistical simulations"
        className="grid gap-4 py-5 md:grid-cols-2 xl:grid-cols-3"
      >
        {availableSimulations.map((simulation) => (
          <SimulationCard key={simulation.slug} simulation={simulation} />
        ))}
      </section>
      {plannedSimulations.length > 0 ? (
        <section aria-label="Planned statistical simulations" className="pb-6">
          <div className="border-t border-line pt-5">
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
              Planned labs
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">
              These topics are now part of the app learning path and can be built
              with the same lab shell, reflection, and export patterns.
            </p>
          </div>
          <div className="mt-3 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {plannedSimulations.map((simulation) => (
              <SimulationCard key={simulation.slug} simulation={simulation} />
            ))}
          </div>
        </section>
      ) : null}
    </main>
  );
}
