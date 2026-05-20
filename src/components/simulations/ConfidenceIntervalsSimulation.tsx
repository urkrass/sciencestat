"use client";

import { useEffect, useRef, useState } from "react";
import { ConfidenceIntervalPlot } from "@/components/simulations/ConfidenceIntervalPlot";
import {
  ComparisonSummaryTable,
  type ComparisonSummaryItem,
  type ComparisonSummaryRow
} from "@/components/simulations/ComparisonSummaryTable";
import { GeneratedConclusion } from "@/components/simulations/GeneratedConclusion";
import {
  GuidedModeSwitch,
  type SimulationMode
} from "@/components/simulations/GuidedModeSwitch";
import { MathExpression } from "@/components/simulations/MathExpression";
import { MathResolution } from "@/components/simulations/MathResolution";
import { MisconceptionCheck } from "@/components/simulations/MisconceptionCheck";
import { NumberSlider } from "@/components/simulations/NumberSlider";
import {
  PredictionPrompt,
  type ScenarioPrediction
} from "@/components/simulations/PredictionPrompt";
import { SimulationAssumptionsPanel } from "@/components/simulations/SimulationAssumptionsPanel";
import {
  AdvancedSettings,
  ExperimentActionButton,
  RunExperimentButton,
  SimulationActivityPanel,
  StepperControl,
  WhatChangedCallout
} from "@/components/simulations/SimulationActivity";
import {
  DirtySimulationNotice,
  FormulaStrip,
  SimulationLegend
} from "@/components/simulations/SimulationAnnotations";
import { SimulationReflectionPanel } from "@/components/simulations/SimulationReflectionPanel";
import {
  buildCsvFromRows,
  SimulationExportButtons
} from "@/components/simulations/SimulationExportButtons";
import {
  buildConfidenceComparisonResult,
  confidenceComparisonMatchesControls,
  confidenceControlsMatch,
  CONFIDENCE_POPULATION_MEAN,
  createConfidenceComparisonResult,
  makeConfidenceComparisonConclusion,
  type ConfidenceComparisonResult,
  type ConfidenceComparisonScenarioResult,
  type ConfidenceScenarioControls
} from "@/lib/statistics/comparison";
import {
  criticalValueForConfidenceLevel,
  type ConfidenceLevel
} from "@/lib/statistics/inference";
import { roundTo } from "@/lib/statistics/summary";

const confidenceLevels: ConfidenceLevel[] = [90, 95, 99];

const defaultControls: ConfidenceScenarioControls = {
  sampleSize: 20,
  repeatedIntervals: 80,
  populationSd: 10,
  confidenceLevel: 95,
  seed: 24680
};

function getCoverageInterpretation(result: ConfidenceComparisonScenarioResult) {
  const difference = Math.abs(result.coveragePercent - result.controls.confidenceLevel);

  if (difference <= 4) {
    return "The observed coverage is close to the nominal confidence level. Small departures are expected because this is a finite simulation.";
  }

  if (result.coveragePercent < result.controls.confidenceLevel) {
    return "This run captured the true mean less often than the nominal level. Try increasing the number of intervals to see the long-run pattern settle.";
  }

  return "This run captured the true mean more often than the nominal level. Repeated simulation runs will vary around the long-run coverage.";
}

type ConfidencePresetId = "level-90-99" | "small-large-n" | "low-high-sd";

type GuidedPreset = {
  id: ConfidencePresetId;
  label: string;
  scenarioA: ConfidenceScenarioControls;
  scenarioB: ConfidenceScenarioControls;
};

const guidedPresets: GuidedPreset[] = [
  {
    id: "level-90-99",
    label: "90% vs 99%",
    scenarioA: {
      confidenceLevel: 90,
      sampleSize: 20,
      repeatedIntervals: 200,
      populationSd: 10,
      seed: 24680
    },
    scenarioB: {
      confidenceLevel: 99,
      sampleSize: 20,
      repeatedIntervals: 200,
      populationSd: 10,
      seed: 24680
    }
  },
  {
    id: "small-large-n",
    label: "Small n vs large n",
    scenarioA: {
      confidenceLevel: 95,
      sampleSize: 12,
      repeatedIntervals: 200,
      populationSd: 10,
      seed: 24680
    },
    scenarioB: {
      confidenceLevel: 95,
      sampleSize: 80,
      repeatedIntervals: 200,
      populationSd: 10,
      seed: 24680
    }
  },
  {
    id: "low-high-sd",
    label: "Low SD vs high SD",
    scenarioA: {
      confidenceLevel: 95,
      sampleSize: 20,
      repeatedIntervals: 200,
      populationSd: 5,
      seed: 24680
    },
    scenarioB: {
      confidenceLevel: 95,
      sampleSize: 20,
      repeatedIntervals: 200,
      populationSd: 20,
      seed: 24680
    }
  }
];

function cloneScenario(
  controls: ConfidenceScenarioControls
): ConfidenceScenarioControls {
  return { ...controls };
}

function getPreset(id: ConfidencePresetId) {
  return guidedPresets.find((preset) => preset.id === id) ?? guidedPresets[0];
}

function scenarioLabel(value: "A" | "B" | "same") {
  if (value === "same") {
    return "about the same";
  }

  return `Scenario ${value}`;
}

function buildConfidenceRows(
  comparison: ConfidenceComparisonResult
): ComparisonSummaryRow[] {
  return [
    {
      label: "confidence level",
      a: `${comparison.scenarioA.controls.confidenceLevel}%`,
      b: `${comparison.scenarioB.controls.confidenceLevel}%`
    },
    {
      label: "intervals covering true mean",
      a: `${comparison.scenarioA.capturedCount}/${comparison.scenarioA.controls.repeatedIntervals}`,
      b: `${comparison.scenarioB.capturedCount}/${comparison.scenarioB.controls.repeatedIntervals}`
    },
    {
      label: "observed coverage",
      a: `${roundTo(comparison.scenarioA.coveragePercent, 1)}%`,
      b: `${roundTo(comparison.scenarioB.coveragePercent, 1)}%`
    },
    {
      label: "average full interval width",
      a: roundTo(comparison.scenarioA.averageFullIntervalWidth, 2),
      b: roundTo(comparison.scenarioB.averageFullIntervalWidth, 2)
    },
    {
      label: "average margin of error",
      a: roundTo(comparison.scenarioA.averageMarginOfError, 2),
      b: roundTo(comparison.scenarioB.averageMarginOfError, 2)
    },
    {
      label: "repeated intervals",
      a: String(comparison.scenarioA.controls.repeatedIntervals),
      b: String(comparison.scenarioB.controls.repeatedIntervals)
    }
  ];
}

function buildConfidenceSummaryItems(
  comparison: ConfidenceComparisonResult
): ComparisonSummaryItem[] {
  return [
    {
      label: "Wider intervals",
      value: scenarioLabel(comparison.widerScenario)
    },
    {
      label: "Width difference",
      value: roundTo(comparison.widthDifference, 2)
    }
  ];
}

function buildConfidenceComparisonCsv(comparison: ConfidenceComparisonResult) {
  const header = [
    "scenario",
    "confidenceLevel",
    "sampleSize",
    "repeatedIntervals",
    "populationSd",
    "seed",
    "capturedCount",
    "coveragePercent",
    "averageFullIntervalWidth",
    "averageMarginOfError"
  ];

  return buildCsvFromRows(header, [
    [
      "A",
      comparison.scenarioA.controls.confidenceLevel,
      comparison.scenarioA.controls.sampleSize,
      comparison.scenarioA.controls.repeatedIntervals,
      comparison.scenarioA.controls.populationSd,
      comparison.scenarioA.controls.seed,
      comparison.scenarioA.capturedCount,
      roundTo(comparison.scenarioA.coveragePercent, 4),
      roundTo(comparison.scenarioA.averageFullIntervalWidth, 4),
      roundTo(comparison.scenarioA.averageMarginOfError, 4)
    ],
    [
      "B",
      comparison.scenarioB.controls.confidenceLevel,
      comparison.scenarioB.controls.sampleSize,
      comparison.scenarioB.controls.repeatedIntervals,
      comparison.scenarioB.controls.populationSd,
      comparison.scenarioB.controls.seed,
      comparison.scenarioB.capturedCount,
      roundTo(comparison.scenarioB.coveragePercent, 4),
      roundTo(comparison.scenarioB.averageFullIntervalWidth, 4),
      roundTo(comparison.scenarioB.averageMarginOfError, 4)
    ]
  ]);
}

type ScenarioEditorProps = {
  idPrefix: string;
  label: string;
  controls: ConfidenceScenarioControls;
  onChange: <Key extends keyof ConfidenceScenarioControls>(
    key: Key,
    value: ConfidenceScenarioControls[Key]
  ) => void;
};

function ScenarioEditor({
  idPrefix,
  label,
  controls,
  onChange
}: ScenarioEditorProps) {
  return (
    <details className="border-t border-line pt-2 text-xs text-slate-700">
      <summary className="cursor-pointer font-semibold text-ink">
        {label} settings
      </summary>
      <div className="mt-2 space-y-2.5">
        <fieldset>
          <legend className="text-xs font-semibold text-ink">
            Confidence level
          </legend>
          <div className="mt-1 grid grid-cols-3 gap-1 rounded-md border border-line bg-white p-1">
            {confidenceLevels.map((level) => {
              const isSelected = controls.confidenceLevel === level;

              return (
                <button
                  key={level}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onChange("confidenceLevel", level)}
                  className={[
                    "h-7 rounded-[5px] px-2 text-xs font-medium transition",
                    isSelected
                      ? "bg-moss text-white shadow-sm"
                      : "text-ink hover:bg-paper hover:text-moss"
                  ].join(" ")}
                >
                  {level}%
                </button>
              );
            })}
          </div>
        </fieldset>

        <NumberSlider
          id={`${idPrefix}-sample-size`}
          label="Sample size n"
          min={2}
          max={100}
          value={controls.sampleSize}
          onChange={(value) => onChange("sampleSize", value)}
        />
        <NumberSlider
          id={`${idPrefix}-repeated-intervals`}
          label="Repeated intervals"
          min={20}
          max={1000}
          step={20}
          value={controls.repeatedIntervals}
          onChange={(value) => onChange("repeatedIntervals", value)}
        />
        <NumberSlider
          id={`${idPrefix}-population-sd`}
          label="Population SD"
          min={1}
          max={20}
          value={controls.populationSd}
          onChange={(value) => onChange("populationSd", value)}
        />

        <div className="space-y-1">
          <label
            htmlFor={`${idPrefix}-seed`}
            className="text-xs font-semibold text-ink"
          >
            Seed
          </label>
          <input
            id={`${idPrefix}-seed`}
            type="number"
            min={1}
            value={controls.seed}
            onChange={(event) => {
              const nextSeed = Number(event.target.value);
              if (Number.isFinite(nextSeed)) {
                onChange("seed", Math.max(1, Math.trunc(nextSeed)));
              }
            }}
            className="h-7 w-full rounded-md border border-line bg-white/90 px-2 text-sm text-ink focus:border-moss focus:outline-none"
          />
        </div>
      </div>
    </details>
  );
}

export function ConfidenceIntervalsSimulation() {
  const [mode, setMode] = useState<SimulationMode>("explore");
  const [controls, setControls] =
    useState<ConfidenceScenarioControls>(defaultControls);
  const [result, setResult] = useState(() =>
    createConfidenceComparisonResult(defaultControls)
  );
  const [animationKey, setAnimationKey] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const runTimeoutRef = useRef<number | null>(null);
  const comparisonTimeoutRef = useRef<number | null>(null);

  const defaultGuidedPreset = guidedPresets[0];
  const [presetId, setPresetId] = useState<ConfidencePresetId>(
    defaultGuidedPreset.id
  );
  const [scenarioA, setScenarioA] = useState<ConfidenceScenarioControls>(() =>
    cloneScenario(defaultGuidedPreset.scenarioA)
  );
  const [scenarioB, setScenarioB] = useState<ConfidenceScenarioControls>(() =>
    cloneScenario(defaultGuidedPreset.scenarioB)
  );
  const [prediction, setPrediction] = useState<ScenarioPrediction>(null);
  const [comparison, setComparison] = useState<ConfidenceComparisonResult | null>(
    null
  );
  const [comparisonAnimationKey, setComparisonAnimationKey] = useState(0);
  const [isComparisonRunning, setIsComparisonRunning] = useState(false);
  const [presetChangedPending, setPresetChangedPending] = useState(false);

  useEffect(() => {
    return () => {
      if (runTimeoutRef.current !== null) {
        window.clearTimeout(runTimeoutRef.current);
      }
      if (comparisonTimeoutRef.current !== null) {
        window.clearTimeout(comparisonTimeoutRef.current);
      }
    };
  }, []);

  const updateControls = <Key extends keyof ConfidenceScenarioControls>(
    key: Key,
    value: ConfidenceScenarioControls[Key]
  ) => {
    setControls((current) => ({
      ...current,
      [key]: value
    }));
  };

  const finishRun = (nextResult: ConfidenceComparisonScenarioResult) => {
    setResult(nextResult);
    setAnimationKey((current) => current + 1);
    setIsRunning(false);
    runTimeoutRef.current = null;
  };

  const runSimulation = () => {
    const nextResult = createConfidenceComparisonResult(controls);

    if (runTimeoutRef.current !== null) {
      window.clearTimeout(runTimeoutRef.current);
    }

    setIsRunning(true);
    runTimeoutRef.current = window.setTimeout(() => {
      finishRun(nextResult);
    }, 180);
  };

  const resetSimulation = () => {
    if (runTimeoutRef.current !== null) {
      window.clearTimeout(runTimeoutRef.current);
      runTimeoutRef.current = null;
    }

    setControls(defaultControls);
    setResult(createConfidenceComparisonResult(defaultControls));
    setAnimationKey((current) => current + 1);
    setIsRunning(false);
  };

  const generateNewSeed = () => {
    updateControls("seed", Math.floor(Math.random() * 999999) + 1);
  };

  const applyExperiment = (changes: Partial<ConfidenceScenarioControls>) => {
    setControls((current) => ({
      ...current,
      ...changes
    }));
  };

  const updateScenario = <Key extends keyof ConfidenceScenarioControls>(
    scenario: "A" | "B",
    key: Key,
    value: ConfidenceScenarioControls[Key]
  ) => {
    const updater = (current: ConfidenceScenarioControls) => ({
      ...current,
      [key]: value
    });

    if (scenario === "A") {
      setScenarioA(updater);
    } else {
      setScenarioB(updater);
    }

    setPresetChangedPending(false);
  };

  const applyPreset = (nextPresetId: ConfidencePresetId) => {
    const preset = getPreset(nextPresetId);
    setPresetId(preset.id);
    setScenarioA(cloneScenario(preset.scenarioA));
    setScenarioB(cloneScenario(preset.scenarioB));
    setPresetChangedPending(true);
  };

  const runComparison = () => {
    const nextComparison = buildConfidenceComparisonResult(scenarioA, scenarioB);

    if (comparisonTimeoutRef.current !== null) {
      window.clearTimeout(comparisonTimeoutRef.current);
    }

    setIsComparisonRunning(true);
    comparisonTimeoutRef.current = window.setTimeout(() => {
      setComparison(nextComparison);
      setComparisonAnimationKey((current) => current + 1);
      setIsComparisonRunning(false);
      setPresetChangedPending(false);
      comparisonTimeoutRef.current = null;
    }, 180);
  };

  const isDirty = !confidenceControlsMatch(controls, result);
  const comparisonIsDirty =
    comparison !== null &&
    !confidenceComparisonMatchesControls(scenarioA, scenarioB, comparison);
  const comparisonNotice = presetChangedPending
    ? "Preset changed - run comparison to update."
    : comparisonIsDirty
      ? "Settings changed - run comparison to update."
      : null;
  const displayedIntervalCount = Math.min(80, result.intervals.length);
  const intervalDisplayNote =
    result.intervals.length > 80
      ? "Showing up to 80 intervals; coverage is calculated from all simulated intervals."
      : "Coverage is calculated from all displayed intervals.";

  const summaryItems = [
    {
      label: "Intervals covering mean",
      value: `${result.capturedCount}/${result.controls.repeatedIntervals}`
    },
    {
      label: "Observed coverage",
      value: `${roundTo(result.coveragePercent, 1)}%`
    },
    {
      label: "Nominal level",
      value: `${result.controls.confidenceLevel}%`
    },
    {
      label: "Average full interval width",
      value: roundTo(result.averageFullIntervalWidth, 2)
    },
    {
      label: "Average margin of error",
      value: roundTo(result.averageMarginOfError, 2)
    }
  ];
  const whatChanged = `${result.controls.confidenceLevel}% confidence, n = ${result.controls.sampleSize}, repeated intervals = ${result.controls.repeatedIntervals}. Observed coverage is ${roundTo(
    result.coveragePercent,
    1
  )}%, and average width is ${roundTo(result.averageFullIntervalWidth, 2)}.`;
  const confidenceCriticalValue = criticalValueForConfidenceLevel(
    result.controls.confidenceLevel
  );
  const confidenceMathSteps = [
    {
      label: "formula",
      math: "ME = z^*\\frac{\\sigma}{\\sqrt{n}}"
    },
    {
      label: "values",
      math: `ME = ${confidenceCriticalValue}\\cdot\\frac{${roundTo(result.controls.populationSd, 2)}}{\\sqrt{${result.controls.sampleSize}}}`
    },
    {
      label: "run",
      math: `ME \\approx ${roundTo(result.averageMarginOfError, 2)}\\quad \\text{width} \\approx ${roundTo(result.averageFullIntervalWidth, 2)}`
    }
  ];

  if (mode === "guided") {
    const selectedPreset = getPreset(presetId);
    const conclusion = comparison
      ? makeConfidenceComparisonConclusion(comparison)
      : null;
    const resultLabel = comparison
      ? scenarioLabel(comparison.widerScenario)
      : null;

    return (
      <div
        aria-busy={isComparisonRunning}
        className="block h-full min-h-0 overflow-y-auto rounded-lg border border-line bg-white shadow-sm min-[960px]:grid min-[960px]:grid-cols-[13rem_minmax(0,1fr)_15rem] min-[960px]:overflow-hidden xl:grid-cols-[17rem_minmax(0,1fr)_20rem]"
      >
        <SimulationActivityPanel
          prompt="Predict which interval set will be wider, run both scenarios, then compare coverage with width."
          modeSwitch={<GuidedModeSwitch mode={mode} onChange={setMode} compact />}
        >
            <div className="space-y-1">
              <label
                htmlFor="confidence-comparison-preset"
                className="text-xs font-semibold text-ink sm:text-sm"
              >
                Preset comparison
              </label>
              <select
                id="confidence-comparison-preset"
                value={presetId}
                onChange={(event) =>
                  applyPreset(event.target.value as ConfidencePresetId)
                }
                className="h-8 w-full rounded-md border border-line bg-white px-2 text-sm text-ink focus:border-moss focus:outline-none"
              >
                {guidedPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            <PredictionPrompt
              value={prediction}
              onChange={setPrediction}
              question="Which scenario do you expect to produce wider intervals?"
            />

            <section className="border-t border-line pt-3">
              <RunExperimentButton
                isRunning={isComparisonRunning}
                onClick={runComparison}
                label="Run comparison"
                runningLabel="Running"
                ariaLabel="Run confidence interval comparison"
              />
              {comparisonNotice ? (
                <p
                  role="status"
                  className="mt-2 border-l-2 border-amber-500 pl-3 text-xs font-medium text-amber-900"
                >
                  {comparisonNotice}
                </p>
              ) : null}
            </section>

            <div className="grid gap-2">
              <ScenarioEditor
                idPrefix="confidence-scenario-a"
                label="Scenario A"
                controls={scenarioA}
                onChange={(key, value) => updateScenario("A", key, value)}
              />
              <ScenarioEditor
                idPrefix="confidence-scenario-b"
                label="Scenario B"
                controls={scenarioB}
                onChange={(key, value) => updateScenario("B", key, value)}
              />
            </div>

            <SimulationAssumptionsPanel
              assumptions={[
                "Samples are independent.",
                "The population mean is fixed at 50.",
                "The population SD is treated as known.",
                "The interval method uses a normal critical value.",
                "Coverage is a long-run property, not a guarantee for one interval."
              ]}
              note="Observed coverage varies from run to run. Increasing repeated intervals makes the simulated coverage more stable."
            />
        </SimulationActivityPanel>

        <section className="flex min-h-[26rem] flex-col p-2.5 min-[960px]:min-h-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
                Side-by-side interval coverage
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-4 text-slate-700">
                Compare two interval methods with deterministic seeds. Higher
                confidence usually raises coverage by making intervals wider.
              </p>
              <div className="mt-2">
                <FormulaStrip>
                  <MathExpression
                    math={
                      "\\text{CI} = \\bar{x} \\pm z^*\\frac{\\sigma}{\\sqrt{n}}"
                    }
                  />
                </FormulaStrip>
              </div>
            </div>
            <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
              Mean = {CONFIDENCE_POPULATION_MEAN}
            </span>
          </div>

          <div className="mt-3 grid min-h-0 flex-1 gap-3 lg:grid-cols-2 lg:divide-x lg:divide-line">
            {comparison ? (
              [
                { label: "Scenario A", result: comparison.scenarioA },
                { label: "Scenario B", result: comparison.scenarioB }
              ].map(({ label, result: scenarioResult }) => (
                <article
                  key={`${comparisonAnimationKey}-${label}`}
                  className="flex min-h-0 flex-col bg-[#f9faf6] p-2 lg:pl-3 lg:first:pl-0"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-moss">
                        {label}
                      </h3>
                      <p className="mt-1 text-xs leading-4 text-slate-600">
                        {scenarioResult.controls.confidenceLevel}% confidence, n ={" "}
                        {scenarioResult.controls.sampleSize}, SD ={" "}
                        {scenarioResult.controls.populationSd}
                      </p>
                    </div>
                    <span className="rounded-full border border-line bg-white px-2 py-0.5 text-[0.68rem] font-semibold text-slate-600">
                      seed {scenarioResult.controls.seed}
                    </span>
                  </div>
                  <div className="flex min-h-0 flex-1 items-center">
                    <ConfidenceIntervalPlot
                      animationKey={comparisonAnimationKey}
                      intervals={scenarioResult.intervals}
                      trueMean={CONFIDENCE_POPULATION_MEAN}
                      compact
                      ariaLabel={`${label} confidence interval plot with true mean line`}
                      title={`${label} confidence interval coverage`}
                    />
                  </div>
                  <p className="text-xs leading-4 text-slate-600">
                    Coverage:{" "}
                    <span className="font-semibold text-ink">
                      {scenarioResult.capturedCount}/
                      {scenarioResult.controls.repeatedIntervals} (
                      {roundTo(scenarioResult.coveragePercent, 1)}%)
                    </span>
                    ; average width:{" "}
                    <span className="font-semibold text-ink">
                      {roundTo(scenarioResult.averageFullIntervalWidth, 2)}
                    </span>
                  </p>
                </article>
              ))
            ) : (
              <div className="grid gap-3 lg:col-span-2 lg:grid-cols-2">
                {[
                  { label: "Scenario A", controls: scenarioA },
                  { label: "Scenario B", controls: scenarioB }
                ].map(({ label, controls: scenarioControls }) => (
                  <article key={label} className="bg-[#f9faf6] p-3">
                    <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-moss">
                      {label}
                    </h3>
                    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                      <div>
                        <dt className="text-slate-500">confidence level</dt>
                        <dd className="font-semibold text-ink">
                          {scenarioControls.confidenceLevel}%
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">sample size n</dt>
                        <dd className="font-semibold text-ink">
                          {scenarioControls.sampleSize}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">population SD</dt>
                        <dd className="font-semibold text-ink">
                          {scenarioControls.populationSd}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">repeated intervals</dt>
                        <dd className="font-semibold text-ink">
                          {scenarioControls.repeatedIntervals}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
                <p className="border-t border-line pt-3 text-xs leading-5 text-slate-600 lg:col-span-2">
                  Run the comparison to generate both interval sets and compare
                  coverage with interval width.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="min-h-0 border-t border-line bg-[#fbfcfb] p-2.5 min-[960px]:border-l min-[960px]:border-t-0 min-[960px]:overflow-y-auto">
          <div className="space-y-2">
            {comparison ? (
              <>
                {prediction ? (
                  <p className="border-l-2 border-line pl-3 text-xs leading-5 text-slate-700">
                    Prediction:{" "}
                    <span className="font-semibold text-ink">
                      {scenarioLabel(prediction)}
                    </span>
                    . Result:{" "}
                    <span className="font-semibold text-ink">{resultLabel}</span>.
                  </p>
                ) : null}
                <ComparisonSummaryTable
                  rows={buildConfidenceRows(comparison)}
                  summaryItems={buildConfidenceSummaryItems(comparison)}
                />
                <div className="flex flex-wrap gap-2">
                  <SimulationExportButtons
                    csv={buildConfidenceComparisonCsv(comparison)}
                    filename="confidence-interval-comparison.csv"
                    label="Download CSV"
                  />
                </div>
                {conclusion ? <GeneratedConclusion conclusion={conclusion} /> : null}
              </>
            ) : (
              <section>
                <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
                  Observation panel
                </h2>
                <p className="mt-2 text-sm leading-5 text-slate-700">
                  Choose a prediction, then run the comparison. The table,
                  generated conclusion, and CSV export will appear here.
                </p>
              </section>
            )}

            <SimulationReflectionPanel
              simulationName="Confidence intervals"
              presetLabel={selectedPreset.label}
              generatedConclusion={conclusion}
            />
            <MisconceptionCheck
              question="Does a single 95% confidence interval mean there is a 95% probability that this exact interval contains the true mean?"
              correctAnswer="no"
              explanation="In the frequentist interpretation, the method has 95% long-run coverage. The computed interval either contains the true mean or it does not."
            />
          </div>
        </aside>
      </div>
    );
  }

  return (
    <div
      aria-busy={isRunning}
      className="block h-full min-h-0 overflow-y-auto rounded-lg border border-line bg-white shadow-sm min-[960px]:grid min-[960px]:grid-cols-[13rem_minmax(0,1fr)_13rem] min-[960px]:overflow-hidden xl:grid-cols-[17rem_minmax(0,1fr)_18rem]"
    >
      <SimulationActivityPanel
        prompt="Choose a confidence-interval move, run the experiment, then compare coverage with width."
        modeSwitch={<GuidedModeSwitch mode={mode} onChange={setMode} compact />}
      >
        <div className="grid gap-2">
          <ExperimentActionButton
            title="Raise confidence"
            description="Use 99% intervals and watch the width tradeoff."
            isActive={controls.confidenceLevel === 99}
            onClick={() => applyExperiment({ confidenceLevel: 99 })}
          />
          <ExperimentActionButton
            title="Use a larger sample"
            description="Set n to 80 so each interval should narrow."
            isActive={controls.sampleSize >= 80}
            onClick={() => applyExperiment({ sampleSize: 80 })}
          />
          <ExperimentActionButton
            title="Increase population spread"
            description="Raise SD to 20 and see how uncertainty expands."
            isActive={controls.populationSd >= 20}
            onClick={() => applyExperiment({ populationSd: 20 })}
          />
        </div>

        <StepperControl
          label="Sample size n"
          min={2}
          max={100}
          step={5}
          value={controls.sampleSize}
          onChange={(value) => updateControls("sampleSize", value)}
        />
        <StepperControl
          label="Population SD"
          min={1}
          max={20}
          value={controls.populationSd}
          onChange={(value) => updateControls("populationSd", value)}
        />

        <div className="space-y-2">
          <RunExperimentButton
            isRunning={isRunning}
            onClick={runSimulation}
            ariaLabel="Run confidence interval experiment"
          />
          <button
            type="button"
            onClick={resetSimulation}
            className="h-9 w-full rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink transition hover:border-moss hover:text-moss"
          >
            Reset defaults
          </button>
          <DirtySimulationNotice isDirty={isDirty} />
        </div>

        <AdvancedSettings>
          <fieldset>
            <legend className="text-xs font-semibold text-ink sm:text-sm">
              Confidence level
            </legend>
            <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-md border border-line bg-white p-1">
              {confidenceLevels.map((level) => {
                const isSelected = controls.confidenceLevel === level;

                return (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => updateControls("confidenceLevel", level)}
                    className={[
                      "h-7 rounded-[5px] px-2 text-xs font-medium transition sm:text-sm",
                      isSelected
                        ? "bg-moss text-white shadow-sm"
                        : "text-ink hover:bg-paper hover:text-moss"
                    ].join(" ")}
                  >
                    {level}%
                  </button>
                );
              })}
            </div>
          </fieldset>

          <NumberSlider
            id="ci-sample-size"
            label="Sample size n"
            min={2}
            max={100}
            value={controls.sampleSize}
            onChange={(value) => updateControls("sampleSize", value)}
          />
          <NumberSlider
            id="ci-repeated-intervals"
            label="Repeated intervals"
            min={20}
            max={1000}
            step={20}
            value={controls.repeatedIntervals}
            onChange={(value) => updateControls("repeatedIntervals", value)}
          />
          <NumberSlider
            id="ci-population-sd"
            label="Population SD"
            min={1}
            max={20}
            value={controls.populationSd}
            onChange={(value) => updateControls("populationSd", value)}
          />

          <div className="space-y-1">
            <label
              htmlFor="ci-seed"
              className="text-xs font-semibold text-ink sm:text-sm"
            >
              Seed
            </label>
            <div className="grid grid-cols-[1fr_4.25rem] gap-2">
              <input
                id="ci-seed"
                type="number"
                min={1}
                value={controls.seed}
                onChange={(event) => {
                  const nextSeed = Number(event.target.value);
                  if (Number.isFinite(nextSeed)) {
                    updateControls("seed", Math.max(1, Math.trunc(nextSeed)));
                  }
                }}
                className="h-7 rounded-md border border-line bg-white/90 px-2 text-sm text-ink focus:border-moss focus:outline-none"
              />
              <button
                type="button"
                aria-label="New seed"
                onClick={generateNewSeed}
                className="h-7 rounded-md border border-line bg-white px-3 text-sm font-medium text-ink transition hover:border-moss hover:text-moss"
              >
                New
              </button>
            </div>
          </div>
        </AdvancedSettings>
      </SimulationActivityPanel>

      <section className="flex min-h-[26rem] flex-col p-2.5 min-[960px]:min-h-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
              Interval coverage
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Each line is one simulated confidence interval for the mean.
            </p>
            <div className="mt-2">
              <FormulaStrip>
                <MathExpression
                  math={
                    "\\text{CI} = \\bar{x} \\pm z^*\\frac{\\sigma}{\\sqrt{n}}"
                  }
                />
              </FormulaStrip>
            </div>
            <MathResolution
              animationKey={animationKey}
              steps={confidenceMathSteps}
            />
            <div className="mt-2">
              <SimulationLegend
                items={[
                  { label: "captures true mean", swatchClassName: "bg-[#367765]" },
                  { label: "misses true mean", swatchClassName: "bg-[#b25b35]" },
                  {
                    label: "dashed line = true mean",
                    swatchClassName: "bg-transparent",
                    lineClassName: "border-t-2 border-dashed border-[#9a5a32]"
                  }
                ]}
              />
            </div>
            <p className="mt-2 text-xs leading-4 text-slate-500">
              {intervalDisplayNote} Currently displaying {displayedIntervalCount}.
            </p>
            <WhatChangedCallout>{whatChanged}</WhatChangedCallout>
          </div>
          <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
            Mean = 50
          </span>
        </div>
        <div className="mt-3 flex min-h-0 flex-1 items-center rounded-md bg-[#f9faf6] p-2">
          <div
            key={animationKey}
            className={[
              "w-full transition-opacity duration-200 motion-reduce:transition-none",
              isRunning ? "opacity-55" : "opacity-100"
            ].join(" ")}
          >
            <ConfidenceIntervalPlot
              animationKey={animationKey}
              intervals={result.intervals}
              trueMean={CONFIDENCE_POPULATION_MEAN}
            />
          </div>
        </div>
      </section>

      <aside className="min-h-0 border-t border-line bg-[#fbfcfb] p-2.5 min-[960px]:border-l min-[960px]:border-t-0 min-[960px]:overflow-y-auto">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
          Results
        </h2>
        <dl
          aria-live="polite"
          className="mt-3 divide-y divide-line border-y border-line"
        >
          {summaryItems.map((item) => (
            <div
              key={`${animationKey}-${item.label}`}
              className="flex items-center justify-between gap-3 py-2"
            >
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-slate-500">
                {item.label}
              </dt>
              <dd className="simulation-result-value text-lg font-semibold text-ink">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <section className="mt-4">
          <h3 className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
            Interpretation
          </h3>
          <p className="mt-2 text-sm leading-5 text-slate-700">
            {getCoverageInterpretation(result)}
          </p>
          <p className="mt-2 text-sm leading-5 text-slate-700">
            A {result.controls.confidenceLevel}% method should capture the true mean
            about {result.controls.confidenceLevel}% of the time over many repeated
            samples.
          </p>
        </section>
      </aside>
    </div>
  );
}
