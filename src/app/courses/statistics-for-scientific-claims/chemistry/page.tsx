import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { ChemistrySidebar } from "@/components/ChemistrySidebar";
import { ChemistryUnitCard } from "@/components/ChemistryUnitCard";
import { chemistryUnits } from "@/content/chemistryUnits";

export const metadata: Metadata = {
  title: "Chemistry Statistical Methods",
  description:
    "Chemistry-focused PDF notes and worksheets for measurement uncertainty, repeated measurements, calibration, comparison, validation, and reporting."
};

export default function ChemistryCoursePage() {
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
        <div className="mt-3 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
              Chemistry book
            </p>
            <h1 className="heading-serif mt-1 text-2xl font-semibold leading-tight text-ink sm:text-3xl">
              Chemistry Statistical Methods
            </h1>
          </div>
          <p className="max-w-xl text-sm leading-6 text-slate-600 lg:text-right">
            Chemistry-specific notes and worksheets for uncertainty, calibration,
            method validation, statistical comparison, and clear reporting.
          </p>
        </div>
      </section>

      <div className="grid gap-4 py-4 lg:grid-cols-[18rem_1fr]">
        <ChemistrySidebar />
        <section
          aria-label="Chemistry notes"
          className="grid gap-3 md:grid-cols-2 xl:grid-cols-3"
        >
          {chemistryUnits.map((unit) => (
            <ChemistryUnitCard key={unit.slug} unit={unit} />
          ))}
        </section>
      </div>
    </main>
  );
}
