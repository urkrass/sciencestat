import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { SamplingDistributionSimulation } from "@/components/simulations/SamplingDistributionSimulation";

export const metadata: Metadata = {
  title: "Sampling distribution | Statistics for Scientific Claims",
  description:
    "Change sample size and repeated samples to see how sample means vary around a population mean."
};

export default function SamplingDistributionPage() {
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
              Sampling distribution
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600 lg:text-right">
            See why larger samples usually produce more stable sample means.
          </p>
        </div>
      </section>

      <section className="min-h-0 flex-1 py-3">
        <SamplingDistributionSimulation />
      </section>
    </main>
  );
}
