import type { Metadata } from "next";
import { FlaskConical, Microscope } from "lucide-react";
import { SubjectChoiceCard } from "@/components/SubjectChoiceCard";

export const metadata: Metadata = {
  title: "Choose Your Scientific Statistics Book",
  description:
    "Choose biology or chemistry lecture notes for scientific data analysis, statistics, and evidence reasoning."
};

export default function HomePage() {
  return (
    <main className="mx-auto flex h-dvh w-full max-w-7xl flex-col overflow-y-auto overflow-x-hidden px-4 py-4 sm:px-6 lg:px-8">
      <section className="shrink-0 border-b border-line pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
          Statistics for Scientific Claims
        </p>
        <div className="mt-2 flex flex-col gap-2 lg:flex-row lg:items-end lg:justify-between">
          <h1 className="heading-serif max-w-3xl text-3xl font-semibold leading-tight text-ink sm:text-4xl">
            Choose the version of the book you need.
          </h1>
          <p className="max-w-xl text-sm leading-6 text-slate-600 lg:text-right">
            Biology keeps the current eleven-unit reader. Chemistry opens the
            new chemistry-specific statistical methods notes and worksheets.
          </p>
        </div>
      </section>

      <section
        aria-label="Subject choices"
        className="grid min-h-0 flex-1 items-stretch gap-4 py-4 lg:grid-cols-2"
      >
        <SubjectChoiceCard
          href="/courses/statistics-for-scientific-claims"
          icon={Microscope}
          label="Biology"
          title="Biology"
          description="Use the existing IB DP Biology-focused sequence on measurement, uncertainty, experimental design, inference, models, and statistical conclusions."
        />
        <SubjectChoiceCard
          href="/courses/statistics-for-scientific-claims/chemistry"
          icon={FlaskConical}
          label="Chemistry"
          title="Chemistry"
          description="Open the chemistry statistical methods reader: uncertainty, repeats, calibration, method validation, reporting, and chemistry worksheets."
        />
      </section>
    </main>
  );
}
