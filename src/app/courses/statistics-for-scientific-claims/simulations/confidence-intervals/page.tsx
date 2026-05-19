import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ConfidenceIntervalsSimulation } from "@/components/simulations/ConfidenceIntervalsSimulation";

export const metadata: Metadata = {
  title: "Confidence intervals | Statistics for Scientific Claims",
  description:
    "Simulate repeated confidence intervals and see how often they capture the true population mean."
};

export default function ConfidenceIntervalsPage() {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-7xl flex-col overflow-hidden px-4 py-3 sm:px-6 lg:px-8">
      <section className="shrink-0 border-b border-line pb-2">
        <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
          <Link
            href="/courses/statistics-for-scientific-claims/simulations"
            className="inline-flex items-center gap-1.5 hover:text-moss"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Simulations
          </Link>
          <span aria-hidden="true" className="text-line">
            /
          </span>
          <Link
            href="/courses/statistics-for-scientific-claims"
            className="hover:text-moss"
          >
            Course
          </Link>
        </div>
        <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
              Statistical simulation
            </p>
            <h1 className="heading-serif mt-1 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              Confidence intervals
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600 lg:text-right">
            See how repeated confidence intervals behave around the true mean.
          </p>
        </div>
      </section>

      <section className="min-h-0 flex-1 py-3">
        <ConfidenceIntervalsSimulation />
      </section>
    </main>
  );
}
