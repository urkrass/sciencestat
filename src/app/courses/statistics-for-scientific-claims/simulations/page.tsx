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
          Interactive models
        </p>
        <div className="mt-2 flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="heading-serif text-3xl font-semibold leading-tight text-ink sm:text-4xl">
              Statistical simulations
            </h1>
            <p className="mt-2 max-w-2xl text-base leading-7 text-slate-600">
              Interactive models for seeing sampling, uncertainty, and statistical
              evidence.
            </p>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600 lg:text-right">
            Use these interactive models to see how statistical ideas behave when
            data are generated repeatedly.
          </p>
        </div>
      </section>

      <section
        aria-label="Available statistical simulations"
        className="grid gap-4 py-5 md:grid-cols-2 xl:grid-cols-3"
      >
        {simulations.map((simulation) => (
          <SimulationCard key={simulation.slug} simulation={simulation} />
        ))}
      </section>
    </main>
  );
}
