"use client";

import { useMemo, useState } from "react";

type SimulationReflectionPanelProps = {
  simulationName: string;
  presetLabel: string;
  generatedConclusion: string | null;
};

export function SimulationReflectionPanel({
  simulationName,
  presetLabel,
  generatedConclusion
}: SimulationReflectionPanelProps) {
  const [predictionNotes, setPredictionNotes] = useState("");
  const [observationNotes, setObservationNotes] = useState("");
  const [explanationNotes, setExplanationNotes] = useState("");
  const [copyStatus, setCopyStatus] = useState<string | null>(null);
  const [showCopyText, setShowCopyText] = useState(false);

  const reflectionText = useMemo(
    () =>
      [
        `Simulation: ${simulationName}`,
        `Preset: ${presetLabel}`,
        `Prediction: ${predictionNotes}`,
        `Observation: ${observationNotes}`,
        `Explanation: ${explanationNotes}`,
        `Generated conclusion: ${generatedConclusion ?? ""}`
      ].join("\n"),
    [
      explanationNotes,
      generatedConclusion,
      observationNotes,
      predictionNotes,
      presetLabel,
      simulationName
    ]
  );

  const copyReflection = async () => {
    if (!navigator.clipboard) {
      setCopyStatus("Select text to copy.");
      setShowCopyText(true);
      return;
    }

    try {
      await navigator.clipboard.writeText(reflectionText);
      setCopyStatus("Copied.");
      setShowCopyText(false);
    } catch {
      setCopyStatus("Select text to copy.");
      setShowCopyText(true);
    }
  };

  return (
    <section className="border-t border-line pt-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">
          Reflection
        </h3>
        {copyStatus ? (
          <p role="status" className="text-xs font-medium text-slate-600">
            {copyStatus}
          </p>
        ) : null}
      </div>
      <div className="mt-2 space-y-2">
        <label className="block text-xs font-semibold text-ink">
          Prediction notes
          <textarea
            value={predictionNotes}
            onChange={(event) => setPredictionNotes(event.target.value)}
            rows={2}
            className="mt-1 w-full resize-y rounded-md border border-line bg-white px-2 py-1.5 text-xs font-normal leading-5 text-ink focus:border-moss focus:outline-none"
          />
        </label>
        <label className="block text-xs font-semibold text-ink">
          Observation notes
          <textarea
            value={observationNotes}
            onChange={(event) => setObservationNotes(event.target.value)}
            rows={2}
            className="mt-1 w-full resize-y rounded-md border border-line bg-white px-2 py-1.5 text-xs font-normal leading-5 text-ink focus:border-moss focus:outline-none"
          />
        </label>
        <label className="block text-xs font-semibold text-ink">
          Explanation notes
          <textarea
            value={explanationNotes}
            onChange={(event) => setExplanationNotes(event.target.value)}
            rows={2}
            className="mt-1 w-full resize-y rounded-md border border-line bg-white px-2 py-1.5 text-xs font-normal leading-5 text-ink focus:border-moss focus:outline-none"
          />
        </label>
      </div>
      <button
        type="button"
        onClick={copyReflection}
        className="mt-2 h-8 rounded-md border border-line bg-white px-3 text-xs font-semibold text-ink transition hover:border-moss hover:text-moss"
      >
        Copy reflection
      </button>
      {showCopyText ? (
        <textarea
          aria-label="Reflection text to copy"
          readOnly
          value={reflectionText}
          rows={7}
          className="mt-2 w-full resize-y rounded-md border border-line bg-paper px-2 py-1.5 text-xs leading-5 text-ink"
        />
      ) : null}
    </section>
  );
}
