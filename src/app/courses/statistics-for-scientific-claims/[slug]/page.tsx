import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { UnitLearningHeader } from "@/components/UnitLearningHeader";
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
    <main className="mx-auto flex h-dvh w-full max-w-7xl flex-col overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <UnitLearningHeader
        unit={unit}
        exerciseSet={exerciseSet}
        nextUnit={next}
        previousUnit={previous}
      />
      <div className="mt-3 min-h-0 flex-1">
        <UnitWorkspace exerciseSet={exerciseSet} unit={unit} />
      </div>
    </main>
  );
}
