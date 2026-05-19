import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { CourseSidebar } from "@/components/CourseSidebar";
import { UnitWorkspace } from "@/components/UnitWorkspace";
import { getExerciseSetForUnit } from "@/content/exercises";
import {
  getAdjacentStatisticsUnits,
  getStatisticsUnit,
  statisticsUnits
} from "@/content/statisticsUnits";

type UnitPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return statisticsUnits.map((unit) => ({
    slug: unit.slug
  }));
}

export async function generateMetadata({ params }: UnitPageProps): Promise<Metadata> {
  const { slug } = await params;
  const unit = getStatisticsUnit(slug);

  if (!unit) {
    return {
      title: "Unit Not Found"
    };
  }

  return {
    title: `Unit ${String(unit.number).padStart(2, "0")}: ${unit.title}`,
    description: unit.description
  };
}

export default async function UnitPage({ params }: UnitPageProps) {
  const { slug } = await params;
  const unit = getStatisticsUnit(slug);

  if (!unit) {
    notFound();
  }

  const { previous, next } = getAdjacentStatisticsUnits(unit);
  const exerciseSet = getExerciseSetForUnit(unit.slug);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid gap-6 lg:grid-cols-[18rem_1fr]">
        <div className="min-w-0 space-y-5 lg:col-start-2 lg:row-start-1">
          <div className="sr-only">
            <h1>
              Unit {String(unit.number).padStart(2, "0")}: {unit.title}
            </h1>
            <p>{unit.description}</p>
          </div>

          <UnitWorkspace
            exerciseSet={exerciseSet}
            pdfPath={unit.pdfPath}
            title={unit.title}
          />

          <nav
            aria-label="Adjacent units"
            className="grid gap-3 border-t border-line pt-6 sm:grid-cols-2"
          >
            {previous ? (
              <Link
                href={`/courses/statistics-for-scientific-claims/${previous.slug}`}
                className="rounded-lg border border-line bg-white p-4 transition hover:border-moss hover:text-moss"
              >
                <span className="flex items-center gap-2 text-sm font-medium">
                  <ArrowLeft aria-hidden="true" className="h-4 w-4" />
                  Previous unit
                </span>
                <span className="mt-2 block text-base font-semibold text-ink">
                  {previous.title}
                </span>
              </Link>
            ) : (
              <span className="rounded-lg border border-line bg-slate-100 p-4 text-sm text-slate-400">
                No previous unit
              </span>
            )}
            {next ? (
              <Link
                href={`/courses/statistics-for-scientific-claims/${next.slug}`}
                className="rounded-lg border border-line bg-white p-4 text-right transition hover:border-moss hover:text-moss"
              >
                <span className="flex items-center justify-end gap-2 text-sm font-medium">
                  Next unit
                  <ArrowRight aria-hidden="true" className="h-4 w-4" />
                </span>
                <span className="mt-2 block text-base font-semibold text-ink">
                  {next.title}
                </span>
              </Link>
            ) : (
              <span className="rounded-lg border border-line bg-slate-100 p-4 text-right text-sm text-slate-400">
                No next unit
              </span>
            )}
          </nav>
        </div>
        <div className="lg:col-start-1 lg:row-start-1">
          <CourseSidebar activeSlug={unit.slug} activeUnit={unit} />
        </div>
      </div>
    </main>
  );
}
