import { ConceptChipList } from "@/components/ConceptChipList";
import type { ConceptId } from "@/content/concepts";

export type UnitReaderGuideUnit = {
  title: string;
  pdfPath: string;
  keyIdea: string;
  commonMisconception: string;
  tryNext: string;
  conceptIds: ConceptId[];
};

type UnitReaderGuideProps = {
  unit: UnitReaderGuideUnit;
};

export function UnitReaderGuide({ unit }: UnitReaderGuideProps) {
  return (
    <section
      aria-label="Unit study guide"
      className="border-l-2 border-moss bg-paper/55 py-2 pl-3 pr-2"
    >
      <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
        Reading focus
      </h3>
      <p className="mt-1 text-sm leading-5 text-ink">{unit.keyIdea}</p>
      <details className="mt-1 text-xs leading-5 text-slate-600">
        <summary className="cursor-pointer font-semibold text-ink">
          Study prompt
        </summary>
        <p className="mt-1">
          <span className="font-semibold text-ink">Watch for:</span>{" "}
          {unit.commonMisconception}
        </p>
        <p className="mt-1">
          <span className="font-semibold text-ink">Try next:</span> {unit.tryNext}
        </p>
        <div className="mt-2">
          <ConceptChipList conceptIds={unit.conceptIds} compact />
        </div>
      </details>
    </section>
  );
}
