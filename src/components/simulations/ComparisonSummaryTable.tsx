import type { SamplingComparisonResult } from "@/lib/statistics/comparison";
import { roundTo } from "@/lib/statistics/summary";

type ComparisonSummaryTableProps = {
  comparison: SamplingComparisonResult;
};

function scenarioLabel(value: "A" | "B" | "same") {
  if (value === "same") {
    return "about the same";
  }

  return `Scenario ${value}`;
}

export function ComparisonSummaryTable({ comparison }: ComparisonSummaryTableProps) {
  const rows = [
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

  return (
    <section className="rounded-md border border-line bg-white p-2">
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
            {rows.map((row) => (
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
      <dl className="mt-2 grid gap-1 border-t border-line pt-2 text-xs sm:grid-cols-2">
        <div>
          <dt className="font-semibold uppercase tracking-[0.08em] text-slate-500">
            Difference in SD
          </dt>
          <dd className="mt-0.5 text-sm font-semibold text-ink">
            {roundTo(comparison.sdDifference, 2)}
          </dd>
        </div>
        <div>
          <dt className="font-semibold uppercase tracking-[0.08em] text-slate-500">
            Tighter sample means
          </dt>
          <dd className="mt-0.5 text-sm font-semibold text-ink">
            {scenarioLabel(comparison.tighterScenario)}
          </dd>
        </div>
      </dl>
    </section>
  );
}
