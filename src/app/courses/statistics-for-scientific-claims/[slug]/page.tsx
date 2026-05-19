import type { Metadata } from "next";
import { notFound } from "next/navigation";
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
    <main className="mx-auto h-dvh w-full max-w-7xl overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[18rem_1fr]">
        <div className="min-h-0 min-w-0 lg:col-start-2 lg:row-start-1">
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
        </div>
        <div className="min-h-0 lg:col-start-1 lg:row-start-1">
          <CourseSidebar
            activeSlug={unit.slug}
            activeUnit={unit}
            nextUnit={next}
            previousUnit={previous}
          />
        </div>
      </div>
    </main>
  );
}
