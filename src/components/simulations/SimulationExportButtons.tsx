import type { SamplingComparisonResult } from "@/lib/statistics/comparison";
import { roundTo } from "@/lib/statistics/summary";

type SimulationExportButtonsProps = {
  comparison?: SamplingComparisonResult;
  csv?: string;
  filename?: string;
  label?: string;
};

export type CsvCell = string | number;

function csvEscape(value: CsvCell) {
  const text = String(value);

  if (/[",\n\r]/.test(text)) {
    return `"${text.replaceAll('"', '""')}"`;
  }

  return text;
}

export function buildCsvFromRows(header: string[], rows: CsvCell[][]) {
  return [
    header.join(","),
    ...rows.map((row) => row.map(csvEscape).join(","))
  ].join("\n");
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

  return buildCsvFromRows(
    header,
    rows.map(([scenario, result]) => [
        scenario,
        result.controls.distribution,
        result.controls.sampleSize,
        result.controls.repeatedSamples,
        result.controls.populationSd,
        result.controls.seed,
        roundTo(result.sampleMeanAverage, 4),
        roundTo(result.sampleMeanSd, 4),
        roundTo(result.expectedStandardError, 4)
      ])
  );
}

export function SimulationExportButtons({
  comparison,
  csv,
  filename = "simulation-comparison.csv",
  label = "Download comparison CSV"
}: SimulationExportButtonsProps) {
  const downloadCsv = () => {
    const csvText = csv ?? (comparison ? buildSamplingComparisonCsv(comparison) : "");
    const blob = new Blob([csvText], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = comparison && !csv ? "sampling-comparison.csv" : filename;
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
      {label}
    </button>
  );
}
