import { useState } from "react";

type GeneratedConclusionProps = {
  conclusion: string;
};

export function GeneratedConclusion({ conclusion }: GeneratedConclusionProps) {
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const copyConclusion = async () => {
    if (!navigator.clipboard) {
      setCopyStatus("Select text to copy.");
      return;
    }

    try {
      await navigator.clipboard.writeText(conclusion);
      setCopyStatus("Copied.");
    } catch {
      setCopyStatus("Select text to copy.");
    }
  };

  return (
    <section>
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">
          Step 4: Write / copy conclusion
        </h3>
        {copyStatus ? (
          <p role="status" className="text-xs font-medium text-slate-600">
            {copyStatus}
          </p>
        ) : null}
        <button
          type="button"
          onClick={copyConclusion}
          className="h-8 rounded-md border border-moss bg-moss px-3 text-xs font-semibold text-white transition hover:bg-moss-dark"
        >
          Copy conclusion
        </button>
      </div>
      <p
        aria-label="Generated defensible conclusion"
        className="mt-2 select-text border-l-2 border-moss pl-3 text-xs leading-5 text-ink"
      >
        {conclusion}
      </p>
    </section>
  );
}
