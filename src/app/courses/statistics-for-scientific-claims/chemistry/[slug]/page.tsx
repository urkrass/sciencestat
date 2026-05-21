import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ChemistrySidebar } from "@/components/ChemistrySidebar";
import { UnitWorkspace } from "@/components/UnitWorkspace";
import {
  chemistryUnits,
  getAdjacentChemistryUnits,
  getChemistryUnit
} from "@/content/chemistryUnits";

type ChemistryUnitPageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export function generateStaticParams() {
  return chemistryUnits.map((unit) => ({
    slug: unit.slug
  }));
}

export async function generateMetadata({
  params
}: ChemistryUnitPageProps): Promise<Metadata> {
  const { slug } = await params;
  const unit = getChemistryUnit(slug);

  if (!unit) {
    return {
      title: "Chemistry Note Not Found"
    };
  }

  return {
    title: `Chemistry ${String(unit.number).padStart(2, "0")}: ${unit.title}`,
    description: unit.description
  };
}

export default async function ChemistryUnitPage({ params }: ChemistryUnitPageProps) {
  const { slug } = await params;
  const unit = getChemistryUnit(slug);

  if (!unit) {
    notFound();
  }

  const { previous, next } = getAdjacentChemistryUnits(unit);

  return (
    <main className="mx-auto h-dvh w-full max-w-7xl overflow-hidden px-4 py-4 sm:px-6 lg:px-8">
      <div className="grid h-full min-h-0 gap-4 lg:grid-cols-[18rem_1fr]">
        <div className="min-h-0 min-w-0 lg:col-start-2 lg:row-start-1">
          <div className="sr-only">
            <h1>
              Chemistry {String(unit.number).padStart(2, "0")}: {unit.title}
            </h1>
            <p>{unit.description}</p>
          </div>

          <UnitWorkspace exerciseSet={null} pdfPath={unit.pdfPath} title={unit.title} />
        </div>
        <div className="min-h-0 lg:col-start-1 lg:row-start-1">
          <ChemistrySidebar
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
