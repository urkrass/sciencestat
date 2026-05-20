import type { SamplingComparisonResult } from "@/lib/statistics/comparison";
import { roundTo } from "@/lib/statistics/summary";

export type ComparisonSummaryRow = {
  label: string;
  a: string;
  b: string;
};

export type ComparisonSummaryItem = {
  label: string;
  value: string;
};

type ComparisonSummaryTableProps = {
  comparison?: SamplingComparisonResult;
  rows?: ComparisonSummaryRow[];
  summaryItems?: ComparisonSummaryItem[];
};

function scenarioLabel(value: "A" | "B" | "same") {
  if (value === "same") {
    return "about the same";
  }

  return `Scenario ${value}`;
}

function buildSamplingRows(
  comparison: SamplingComparisonResult
): ComparisonSummaryRow[] {
  return [
    {
      label: "sample size n",
      a: String(comparison.scenarioA.controls.sampleSize),
      b: String(comparison.scenarioB.controls.sampleSize)
    },
    {
      label: "mean of sample means",
      a: roundTo(comparison.scenarioA.sampleMeanAverage, 2),
      b: roundTo(comparison.scenarioB.sampleMeanAverage, 2)
    },
    {
      label: "SD of sample means",
      a: roundTo(comparison.scenarioA.sampleMeanSd, 2),
      b: roundTo(comparison.scenarioB.sampleMeanSd, 2)
    },
    {
      label: "expected standard error",
      a: roundTo(comparison.scenarioA.expectedStandardError, 2),
      b: roundTo(comparison.scenarioB.expectedStandardError, 2)
    },
    {
      label: "repeated samples",
      a: String(comparison.scenarioA.controls.repeatedSamples),
      b: String(comparison.scenarioB.controls.repeatedSamples)
    }
  ];
}

function buildSamplingSummary(
  comparison: SamplingComparisonResult
): ComparisonSummaryItem[] {
  return [
    {
      label: "Difference in SD",
      value: roundTo(comparison.sdDifference, 2)
    },
    {
      label: "Tighter sample means",
      value: scenarioLabel(comparison.tighterScenario)
    }
  ];
}

export function ComparisonSummaryTable({
  comparison,
  rows,
  summaryItems
}: ComparisonSummaryTableProps) {
  const displayedRows = rows ?? (comparison ? buildSamplingRows(comparison) : []);
  const displayedSummaryItems =
    summaryItems ?? (comparison ? buildSamplingSummary(comparison) : []);

  return (
    <section>
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">
        Step 3: Observe
      </h3>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full border-collapse text-left text-xs">
          <thead>
            <tr className="border-b border-line text-slate-500">
              <th scope="col" className="py-1 pr-2 font-semibold">
                Measure
              </th>
              <th scope="col" className="px-2 py-1 font-semibold">
                Scenario A
              </th>
              <th scope="col" className="py-1 pl-2 font-semibold">
                Scenario B
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {displayedRows.map((row) => (
              <tr key={row.label}>
                <th scope="row" className="py-1 pr-2 font-medium text-slate-600">
                  {row.label}
                </th>
                <td className="px-2 py-1 font-semibold text-ink">{row.a}</td>
                <td className="py-1 pl-2 font-semibold text-ink">{row.b}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {displayedSummaryItems.length > 0 ? (
        <dl className="mt-2 grid gap-1 border-t border-line pt-2 text-xs sm:grid-cols-2">
          {displayedSummaryItems.map((item) => (
            <div key={item.label}>
              <dt className="font-semibold uppercase tracking-[0.08em] text-slate-500">
                {item.label}
              </dt>
              <dd className="mt-0.5 text-sm font-semibold text-ink">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>
      ) : null}
    </section>
  );
}
