import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { PValueNullModelSimulation } from "@/components/simulations/PValueNullModelSimulation";

export const metadata: Metadata = {
  title: "P-value under a null model | Statistics for Scientific Claims",
  description:
    "Simulate sample means under a null hypothesis and compare an observed result to the null model."
};

export default function PValueNullModelPage() {
  return (
    <main className="flex h-dvh w-full flex-col overflow-hidden bg-paper/40 px-2 py-2 sm:px-3 lg:px-4">
      <section className="shrink-0 pb-2">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-3 text-sm font-medium text-slate-500">
              <Link
                href="/courses/statistics-for-scientific-claims/simulations"
                className="inline-flex items-center gap-1.5 hover:text-moss"
              >
                <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                Back to simulations
              </Link>
              <Link
                href="/courses/statistics-for-scientific-claims"
                className="text-slate-400 hover:text-moss"
              >
                Course
              </Link>
            </div>
            <h1 className="heading-serif mt-1 text-xl font-semibold leading-tight text-ink sm:text-2xl">
              P-value under a null model
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-5 text-slate-600">
            Compare an observed sample mean to results generated under the null.
          </p>
        </div>
      </section>

      <section className="min-h-0 flex-1 pb-1">
        <PValueNullModelSimulation />
      </section>
    </main>
  );
}
