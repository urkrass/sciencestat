import type { SamplingComparisonResult } from "@/lib/statistics/comparison";
import { roundTo } from "@/lib/statistics/summary";

type SimulationExportButtonsProps = {
  comparison: SamplingComparisonResult;
};

function csvEscape(value: string | number) {
  const text = String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

function buildSamplingComparisonCsv(comparison: SamplingComparisonResult) {
  const header = [
    "scenario",
    "distribution",
    "sampleSize",
    "repeatedSamples",
    "populationSd",
    "seed",
    "meanOfSampleMeans",
    "sdOfSampleMeans",
    "expectedStandardError"
  ];
  const rows = [
    ["A", comparison.scenarioA],
    ["B", comparison.scenarioB]
  ] as const;

  return [
    header.join(","),
    ...rows.map(([scenario, result]) =>
      [
        scenario,
        result.controls.distribution,
        result.controls.sampleSize,
        result.controls.repeatedSamples,
        result.controls.populationSd,
        result.controls.seed,
        roundTo(result.sampleMeanAverage, 4),
        roundTo(result.sampleMeanSd, 4),
        roundTo(result.expectedStandardError, 4)
      ]
        .map(csvEscape)
        .join(",")
    )
  ].join("\n");
}

export function SimulationExportButtons({
  comparison
}: SimulationExportButtonsProps) {
  const downloadCsv = () => {
    const csv = buildSamplingComparisonCsv(comparison);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sampling-comparison.csv";
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <button
      type="button"
      onClick={downloadCsv}
      className="h-8 rounded-md border border-line bg-white px-3 text-xs font-semibold text-ink transition hover:border-moss hover:text-moss"
    >
      Download comparison CSV
    </button>
  );
}
