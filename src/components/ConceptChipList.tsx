import { getConcepts, type ConceptId } from "@/content/concepts";

type ConceptChipListProps = {
  conceptIds: readonly ConceptId[];
  compact?: boolean;
};

export function ConceptChipList({ conceptIds, compact = false }: ConceptChipListProps) {
  const unitConcepts = getConcepts(conceptIds);

  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Related concepts">
      {unitConcepts.map((concept) => (
        <li
          key={concept.id}
          title={concept.description}
          className={[
            "rounded-full border border-moss/25 bg-moss/10 font-semibold text-moss",
            compact
              ? "px-2 py-0.5 text-[0.68rem]"
              : "px-2.5 py-1 text-[0.72rem]"
          ].join(" ")}
        >
          {concept.label}
        </li>
      ))}
    </ul>
  );
}
