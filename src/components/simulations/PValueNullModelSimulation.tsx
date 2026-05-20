"use client";

import { useEffect, useRef, useState } from "react";
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
import { NullModelHistogram } from "@/components/simulations/NullModelHistogram";
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
  buildPValueComparisonResult,
  createPValueComparisonResult,
  makePValueComparisonConclusion,
  P_VALUE_NULL_MEAN,
  pValueComparisonMatchesControls,
  pValueControlsMatch,
  type PValueComparisonResult,
  type PValueComparisonScenarioResult,
  type PValueScenarioControls
} from "@/lib/statistics/comparison";
import type { TailMode } from "@/lib/statistics/inference";
import { roundTo } from "@/lib/statistics/summary";

const tailModeOptions: { value: TailMode; label: string }[] = [
  { value: "twoSided", label: "Two-tailed" },
  { value: "greater", label: "Greater than" },
  { value: "less", label: "Less than" }
];

const defaultControls: PValueScenarioControls = {
  observedSampleMean: 54,
  sampleSize: 16,
  simulatedSamples: 1000,
  populationSd: 10,
  tailMode: "twoSided",
  seed: 13579
};

function getPValueLabel(tailMode: TailMode) {
  if (tailMode === "greater") {
    return "Greater-than simulated p-value";
  }

  if (tailMode === "less") {
    return "Less-than simulated p-value";
  }

  return "Two-tailed simulated p-value";
}

function getExtremeRule(tailMode: TailMode, observedMean: number) {
  const observedText = roundTo(observedMean, 1);

  if (tailMode === "greater") {
    return `\\bar{x}_{\\mathrm{sim}} \\ge ${observedText}`;
  }

  if (tailMode === "less") {
    return `\\bar{x}_{\\mathrm{sim}} \\le ${observedText}`;
  }

  return `|\\bar{x}_{\\mathrm{sim}} - 50| \\ge |${observedText} - 50|`;
}

function getPValueInterpretation(result: PValueComparisonScenarioResult) {
  if (result.pValue < 0.01) {
    return "Results this far from the null mean are rare in this simulation. That is strong evidence against the null model if the model assumptions are reasonable.";
  }

  if (result.pValue < 0.05) {
    return "Results at least this extreme are uncommon under the null model. This is evidence against the null, but the conclusion should still mention effect size and assumptions.";
  }

  if (result.pValue < 0.15) {
    return "The observed sample mean is somewhat unusual under the null model, but the simulation does not show strong evidence by conventional thresholds.";
  }

  return "Results this extreme are fairly common under the null model. The simulation does not provide strong evidence against the null.";
}

type PValuePresetId = "near-far-null" | "small-large-n" | "two-greater-tail";

type GuidedPreset = {
  id: PValuePresetId;
  label: string;
  scenarioA: PValueScenarioControls;
  scenarioB: PValueScenarioControls;
};

const guidedPresets: GuidedPreset[] = [
  {
    id: "near-far-null",
    label: "Observed mean near vs far from null",
    scenarioA: {
      observedSampleMean: 52,
      sampleSize: 16,
      simulatedSamples: 1000,
      populationSd: 10,
      seed: 13579,
      tailMode: "twoSided"
    },
    scenarioB: {
      observedSampleMean: 56,
      sampleSize: 16,
      simulatedSamples: 1000,
      populationSd: 10,
      seed: 13579,
      tailMode: "twoSided"
    }
  },
  {
    id: "small-large-n",
    label: "Small n vs large n",
    scenarioA: {
      observedSampleMean: 54,
      sampleSize: 8,
      simulatedSamples: 1000,
      populationSd: 10,
      seed: 13579,
      tailMode: "twoSided"
    },
    scenarioB: {
      observedSampleMean: 54,
      sampleSize: 64,
      simulatedSamples: 1000,
      populationSd: 10,
      seed: 13579,
      tailMode: "twoSided"
    }
  },
  {
    id: "two-greater-tail",
    label: "Two-tailed vs greater-than",
    scenarioA: {
      observedSampleMean: 56,
      sampleSize: 16,
      simulatedSamples: 1000,
      populationSd: 10,
      seed: 13579,
      tailMode: "twoSided"
    },
    scenarioB: {
      observedSampleMean: 56,
      sampleSize: 16,
      simulatedSamples: 1000,
      populationSd: 10,
      seed: 13579,
      tailMode: "greater"
    }
  }
];

function cloneScenario(controls: PValueScenarioControls): PValueScenarioControls {
  return { ...controls };
}

function getPreset(id: PValuePresetId) {
  return guidedPresets.find((preset) => preset.id === id) ?? guidedPresets[0];
}

function scenarioLabel(value: "A" | "B" | "same") {
  if (value === "same") {
    return "about the same";
  }

  return `Scenario ${value}`;
}

function getTailModeLabel(tailMode: TailMode) {
  return (
    tailModeOptions.find((option) => option.value === tailMode)?.label ?? tailMode
  );
}

function buildPValueRows(comparison: PValueComparisonResult): ComparisonSummaryRow[] {
  return [
    {
      label: "observed sample mean",
      a: roundTo(comparison.scenarioA.controls.observedSampleMean, 1),
      b: roundTo(comparison.scenarioB.controls.observedSampleMean, 1)
    },
    {
      label: "distance from null mean",
      a: roundTo(comparison.scenarioA.distanceFromNullMean, 1),
      b: roundTo(comparison.scenarioB.distanceFromNullMean, 1)
    },
    {
      label: "tail mode",
      a: getTailModeLabel(comparison.scenarioA.controls.tailMode),
      b: getTailModeLabel(comparison.scenarioB.controls.tailMode)
    },
    {
      label: "extreme simulations",
      a: `${comparison.scenarioA.extremeCount}/${comparison.scenarioA.controls.simulatedSamples}`,
      b: `${comparison.scenarioB.extremeCount}/${comparison.scenarioB.controls.simulatedSamples}`
    },
    {
      label: "simulated p-value",
      a: roundTo(comparison.scenarioA.pValue, 3),
      b: roundTo(comparison.scenarioB.pValue, 3)
    },
    {
      label: "null distribution SD",
      a: roundTo(comparison.scenarioA.nullDistributionSd, 2),
      b: roundTo(comparison.scenarioB.nullDistributionSd, 2)
    },
    {
      label: "null simulations",
      a: String(comparison.scenarioA.controls.simulatedSamples),
      b: String(comparison.scenarioB.controls.simulatedSamples)
    }
  ];
}

function buildPValueSummaryItems(
  comparison: PValueComparisonResult
): ComparisonSummaryItem[] {
  return [
    {
      label: "Smaller p-value",
      value: scenarioLabel(comparison.smallerPValueScenario)
    },
    {
      label: "p-value difference",
      value: roundTo(comparison.pValueDifference, 3)
    }
  ];
}

function buildPValueComparisonCsv(comparison: PValueComparisonResult) {
  const header = [
    "scenario",
    "observedSampleMean",
    "nullMean",
    "distanceFromNullMean",
    "sampleSize",
    "simulatedSamples",
    "populationSd",
    "seed",
    "tailMode",
    "extremeCount",
    "pValue",
    "nullDistributionSd"
  ];

  return buildCsvFromRows(header, [
    [
      "A",
      roundTo(comparison.scenarioA.controls.observedSampleMean, 4),
      P_VALUE_NULL_MEAN,
      roundTo(comparison.scenarioA.distanceFromNullMean, 4),
      comparison.scenarioA.controls.sampleSize,
      comparison.scenarioA.controls.simulatedSamples,
      comparison.scenarioA.controls.populationSd,
      comparison.scenarioA.controls.seed,
      comparison.scenarioA.controls.tailMode,
      comparison.scenarioA.extremeCount,
      roundTo(comparison.scenarioA.pValue, 4),
      roundTo(comparison.scenarioA.nullDistributionSd, 4)
    ],
    [
      "B",
      roundTo(comparison.scenarioB.controls.observedSampleMean, 4),
      P_VALUE_NULL_MEAN,
      roundTo(comparison.scenarioB.distanceFromNullMean, 4),
      comparison.scenarioB.controls.sampleSize,
      comparison.scenarioB.controls.simulatedSamples,
      comparison.scenarioB.controls.populationSd,
      comparison.scenarioB.controls.seed,
      comparison.scenarioB.controls.tailMode,
      comparison.scenarioB.extremeCount,
      roundTo(comparison.scenarioB.pValue, 4),
      roundTo(comparison.scenarioB.nullDistributionSd, 4)
    ]
  ]);
}

type ScenarioEditorProps = {
  idPrefix: string;
  label: string;
  controls: PValueScenarioControls;
  onChange: <Key extends keyof PValueScenarioControls>(
    key: Key,
    value: PValueScenarioControls[Key]
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
          <legend className="text-xs font-semibold text-ink">Tail mode</legend>
          <div className="mt-1 grid grid-cols-3 gap-1 rounded-md border border-line bg-white p-1">
            {tailModeOptions.map((option) => {
              const isSelected = controls.tailMode === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onChange("tailMode", option.value)}
                  className={[
                    "min-h-7 rounded-[5px] px-1.5 text-[0.68rem] font-medium transition",
                    isSelected
                      ? "bg-moss text-white shadow-sm"
                      : "text-ink hover:bg-paper hover:text-moss"
                  ].join(" ")}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
        </fieldset>

        <NumberSlider
          id={`${idPrefix}-observed-mean`}
          label="Observed sample mean"
          min={42}
          max={58}
          step={0.1}
          value={controls.observedSampleMean}
          onChange={(value) => onChange("observedSampleMean", value)}
        />
        <NumberSlider
          id={`${idPrefix}-sample-size`}
          label="Sample size n"
          min={2}
          max={100}
          value={controls.sampleSize}
          onChange={(value) => onChange("sampleSize", value)}
        />
        <NumberSlider
          id={`${idPrefix}-simulated-samples`}
          label="Null simulations"
          min={100}
          max={3000}
          step={100}
          value={controls.simulatedSamples}
          onChange={(value) => onChange("simulatedSamples", value)}
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

export function PValueNullModelSimulation() {
  const [mode, setMode] = useState<SimulationMode>("explore");
  const [controls, setControls] =
    useState<PValueScenarioControls>(defaultControls);
  const [result, setResult] = useState(() =>
    createPValueComparisonResult(defaultControls)
  );
  const [animationKey, setAnimationKey] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const runTimeoutRef = useRef<number | null>(null);
  const comparisonTimeoutRef = useRef<number | null>(null);

  const defaultGuidedPreset = guidedPresets[0];
  const [presetId, setPresetId] = useState<PValuePresetId>(
    defaultGuidedPreset.id
  );
  const [scenarioA, setScenarioA] = useState<PValueScenarioControls>(() =>
    cloneScenario(defaultGuidedPreset.scenarioA)
  );
  const [scenarioB, setScenarioB] = useState<PValueScenarioControls>(() =>
    cloneScenario(defaultGuidedPreset.scenarioB)
  );
  const [prediction, setPrediction] = useState<ScenarioPrediction>(null);
  const [comparison, setComparison] = useState<PValueComparisonResult | null>(
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

  const updateControls = <Key extends keyof PValueScenarioControls>(
    key: Key,
    value: PValueScenarioControls[Key]
  ) => {
    setControls((current) => ({
      ...current,
      [key]: value
    }));
  };

  const finishRun = (nextResult: PValueComparisonScenarioResult) => {
    setResult(nextResult);
    setAnimationKey((current) => current + 1);
    setIsRunning(false);
    runTimeoutRef.current = null;
  };

  const runSimulation = () => {
    const nextResult = createPValueComparisonResult(controls);

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
    setResult(createPValueComparisonResult(defaultControls));
    setAnimationKey((current) => current + 1);
    setIsRunning(false);
  };

  const generateNewSeed = () => {
    updateControls("seed", Math.floor(Math.random() * 999999) + 1);
  };

  const applyExperiment = (changes: Partial<PValueScenarioControls>) => {
    setControls((current) => ({
      ...current,
      ...changes
    }));
  };

  const updateScenario = <Key extends keyof PValueScenarioControls>(
    scenario: "A" | "B",
    key: Key,
    value: PValueScenarioControls[Key]
  ) => {
    const updater = (current: PValueScenarioControls) => ({
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

  const applyPreset = (nextPresetId: PValuePresetId) => {
    const preset = getPreset(nextPresetId);
    setPresetId(preset.id);
    setScenarioA(cloneScenario(preset.scenarioA));
    setScenarioB(cloneScenario(preset.scenarioB));
    setPresetChangedPending(true);
  };

  const runComparison = () => {
    const nextComparison = buildPValueComparisonResult(scenarioA, scenarioB);

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

  const isDirty = !pValueControlsMatch(controls, result);
  const comparisonIsDirty =
    comparison !== null &&
    !pValueComparisonMatchesControls(scenarioA, scenarioB, comparison);
  const comparisonNotice = presetChangedPending
    ? "Preset changed - run comparison to update."
    : comparisonIsDirty
      ? "Settings changed - run comparison to update."
      : null;

  const summaryItems = [
    {
      label: getPValueLabel(result.controls.tailMode),
      value: roundTo(result.pValue, 3)
    },
    {
      label: "Extreme simulations",
      value: `${result.extremeCount}/${result.controls.simulatedSamples}`
    },
    {
      label: "Observed sample mean",
      value: roundTo(result.controls.observedSampleMean, 1)
    },
    {
      label: "Null distribution SD",
      value: roundTo(result.nullDistributionSd, 2)
    }
  ];
  const whatChanged = `Observed mean ${roundTo(
    result.controls.observedSampleMean,
    1
  )} is ${roundTo(result.distanceFromNullMean, 1)} from the null mean. The simulated p-value is ${roundTo(
    result.pValue,
    3
  )} from ${result.extremeCount}/${result.controls.simulatedSamples} extreme simulations.`;
  const pValueMathSteps = [
    {
      label: "rule",
      math: getExtremeRule(
        result.controls.tailMode,
        result.controls.observedSampleMean
      )
    },
    {
      label: "count",
      math: `p = \\frac{${result.extremeCount}}{${result.controls.simulatedSamples}}`
    },
    {
      label: "run",
      math: `p \\approx ${roundTo(result.pValue, 3)}`
    }
  ];

  if (mode === "guided") {
    const selectedPreset = getPreset(presetId);
    const conclusion = comparison
      ? makePValueComparisonConclusion(comparison)
      : null;
    const resultLabel = comparison
      ? scenarioLabel(comparison.smallerPValueScenario)
      : null;

    return (
      <div
        aria-busy={isComparisonRunning}
        className="block h-full min-h-0 overflow-y-auto rounded-lg border border-line bg-white shadow-sm min-[960px]:grid min-[960px]:grid-cols-[13rem_minmax(0,1fr)_15rem] min-[960px]:overflow-hidden xl:grid-cols-[17rem_minmax(0,1fr)_20rem]"
      >
        <SimulationActivityPanel
          prompt="Predict which observed mean will look rarer under the null model, then run both scenarios."
          modeSwitch={<GuidedModeSwitch mode={mode} onChange={setMode} compact />}
        >
            <div className="space-y-1">
              <label
                htmlFor="pvalue-comparison-preset"
                className="text-xs font-semibold text-ink sm:text-sm"
              >
                Preset comparison
              </label>
              <select
                id="pvalue-comparison-preset"
                value={presetId}
                onChange={(event) =>
                  applyPreset(event.target.value as PValuePresetId)
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
              question="Which scenario do you expect to have the smaller p-value?"
            />

            <section className="border-t border-line pt-3">
              <RunExperimentButton
                isRunning={isComparisonRunning}
                onClick={runComparison}
                label="Run comparison"
                runningLabel="Running"
                ariaLabel="Run p-value comparison"
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
                idPrefix="pvalue-scenario-a"
                label="Scenario A"
                controls={scenarioA}
                onChange={(key, value) => updateScenario("A", key, value)}
              />
              <ScenarioEditor
                idPrefix="pvalue-scenario-b"
                label="Scenario B"
                controls={scenarioB}
                onChange={(key, value) => updateScenario("B", key, value)}
              />
            </div>

            <SimulationAssumptionsPanel
              assumptions={[
                "The null mean is fixed at 50.",
                "Samples are independent.",
                "Null simulations are generated from the selected null model.",
                "The p-value is conditional on the null model and assumptions.",
                "A simulated p-value has finite simulation error."
              ]}
              note="Simulated p-values have resolution. With 1000 simulations, one counted simulation changes p by 0.001."
            />
        </SimulationActivityPanel>

        <section className="flex min-h-[26rem] flex-col p-2.5 min-[960px]:min-h-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
                Side-by-side null models
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-4 text-slate-700">
                Compare observed means against the same null model. Results
                farther from the null usually leave less tail area.
              </p>
              <div className="mt-2">
                <FormulaStrip>
                  <MathExpression
                    math={
                      "p = \\frac{\\text{extreme}}{\\text{total}}"
                    }
                  />
                </FormulaStrip>
              </div>
            </div>
            <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
              Null mean = {P_VALUE_NULL_MEAN}
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
                        observed mean ={" "}
                        {roundTo(scenarioResult.controls.observedSampleMean, 1)},
                        n = {scenarioResult.controls.sampleSize},{" "}
                        {getTailModeLabel(scenarioResult.controls.tailMode)}
                      </p>
                    </div>
                    <span className="rounded-full border border-line bg-white px-2 py-0.5 text-[0.68rem] font-semibold text-slate-600">
                      seed {scenarioResult.controls.seed}
                    </span>
                  </div>
                  <div className="flex min-h-0 flex-1 items-center">
                    <NullModelHistogram
                      animationKey={comparisonAnimationKey}
                      nullMean={P_VALUE_NULL_MEAN}
                      observedMean={scenarioResult.controls.observedSampleMean}
                      tailMode={scenarioResult.controls.tailMode}
                      values={scenarioResult.simulatedMeans}
                      compact
                      ariaLabel={`${label} null model histogram with counted tail simulations and observed mean line`}
                      title={`${label} null model histogram`}
                    />
                  </div>
                  <p className="text-xs leading-4 text-slate-600">
                    Extreme simulations:{" "}
                    <span className="font-semibold text-ink">
                      {scenarioResult.extremeCount}/
                      {scenarioResult.controls.simulatedSamples}
                    </span>
                    ; p ={" "}
                    <span className="font-semibold text-ink">
                      {roundTo(scenarioResult.pValue, 3)}
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
                        <dt className="text-slate-500">observed mean</dt>
                        <dd className="font-semibold text-ink">
                          {roundTo(scenarioControls.observedSampleMean, 1)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">sample size n</dt>
                        <dd className="font-semibold text-ink">
                          {scenarioControls.sampleSize}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">tail mode</dt>
                        <dd className="font-semibold text-ink">
                          {getTailModeLabel(scenarioControls.tailMode)}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">null simulations</dt>
                        <dd className="font-semibold text-ink">
                          {scenarioControls.simulatedSamples}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
                <p className="border-t border-line pt-3 text-xs leading-5 text-slate-600 lg:col-span-2">
                  Run the comparison to generate both null-model distributions
                  and count simulations at least as extreme as each observation.
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
                  rows={buildPValueRows(comparison)}
                  summaryItems={buildPValueSummaryItems(comparison)}
                />
                <div className="flex flex-wrap gap-2">
                  <SimulationExportButtons
                    csv={buildPValueComparisonCsv(comparison)}
                    filename="p-value-null-model-comparison.csv"
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
              simulationName="P-value under a null model"
              presetLabel={selectedPreset.label}
              generatedConclusion={conclusion}
            />
            <MisconceptionCheck
              question="Does p = 0.04 mean there is a 4% probability that the null hypothesis is true?"
              correctAnswer="no"
              explanation="The p-value is calculated assuming the null model is true. It is not the probability that the null hypothesis is true."
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
        prompt="Move the observation, run the null model, then see how much simulated tail area remains."
        modeSwitch={<GuidedModeSwitch mode={mode} onChange={setMode} compact />}
      >
        <div className="grid gap-2">
          <ExperimentActionButton
            title="Move farther from null"
            description="Set the observed mean to 56, farther from the null mean of 50."
            isActive={controls.observedSampleMean >= 56}
            onClick={() => applyExperiment({ observedSampleMean: 56 })}
          />
          <ExperimentActionButton
            title="Use a larger sample"
            description="Set n to 64 so the null distribution should tighten."
            isActive={controls.sampleSize >= 64}
            onClick={() => applyExperiment({ sampleSize: 64 })}
          />
          <ExperimentActionButton
            title="Use greater-than tail"
            description="Count only null simulations at or above the observation."
            isActive={controls.tailMode === "greater"}
            onClick={() => applyExperiment({ tailMode: "greater" })}
          />
        </div>

        <StepperControl
          label="Observed mean"
          min={42}
          max={58}
          step={1}
          value={controls.observedSampleMean}
          onChange={(value) => updateControls("observedSampleMean", value)}
          formatValue={(value) => String(roundTo(value, 1))}
        />
        <StepperControl
          label="Sample size n"
          min={2}
          max={100}
          step={4}
          value={controls.sampleSize}
          onChange={(value) => updateControls("sampleSize", value)}
        />

        <div className="space-y-2">
          <RunExperimentButton
            isRunning={isRunning}
            onClick={runSimulation}
            ariaLabel="Run p-value null model experiment"
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
              Tail mode
            </legend>
            <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-md border border-line bg-white p-1">
              {tailModeOptions.map((option) => {
                const isSelected = controls.tailMode === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => updateControls("tailMode", option.value)}
                    className={[
                      "h-7 rounded-[5px] px-2 text-xs font-medium transition",
                      isSelected
                        ? "bg-moss text-white shadow-sm"
                        : "text-ink hover:bg-paper hover:text-moss"
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </fieldset>

          <NumberSlider
            id="pvalue-observed-mean"
            label="Observed sample mean"
            min={42}
            max={58}
            step={0.1}
            value={controls.observedSampleMean}
            onChange={(value) => updateControls("observedSampleMean", value)}
          />
          <NumberSlider
            id="pvalue-sample-size"
            label="Sample size n"
            min={2}
            max={100}
            value={controls.sampleSize}
            onChange={(value) => updateControls("sampleSize", value)}
          />
          <NumberSlider
            id="pvalue-simulated-samples"
            label="Null simulations"
            min={100}
            max={3000}
            step={100}
            value={controls.simulatedSamples}
            onChange={(value) => updateControls("simulatedSamples", value)}
          />
          <NumberSlider
            id="pvalue-population-sd"
            label="Population SD"
            min={1}
            max={20}
            value={controls.populationSd}
            onChange={(value) => updateControls("populationSd", value)}
          />

          <div className="space-y-1">
            <label
              htmlFor="pvalue-seed"
              className="text-xs font-semibold text-ink sm:text-sm"
            >
              Seed
            </label>
            <div className="grid grid-cols-[1fr_4.25rem] gap-2">
              <input
                id="pvalue-seed"
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

      <section className="flex min-h-[26rem] flex-col p-2 min-[960px]:min-h-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
              Null model
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              The shaded region marks null simulations counted as at least as extreme as the observed sample mean.
            </p>
            <div className="mt-2">
              <FormulaStrip>
                <MathExpression
                  math={
                    "p = \\frac{\\text{extreme}}{\\text{total}}"
                  }
                />
              </FormulaStrip>
            </div>
            <MathResolution
              animationKey={animationKey}
              steps={pValueMathSteps}
            />
            <div className="mt-2">
              <SimulationLegend
                items={[
                  { label: "ordinary null simulations", swatchClassName: "bg-[#367765]" },
                  { label: "counted as extreme", swatchClassName: "bg-[#b25b35]" },
                  {
                    label: "dashed green line = null mean",
                    swatchClassName: "bg-transparent",
                    lineClassName: "border-t-2 border-dashed border-moss"
                  },
                  {
                    label: "brown line = observed sample mean",
                    swatchClassName: "bg-transparent",
                    lineClassName: "bg-[#9a5a32]"
                  }
                ]}
              />
            </div>
            <WhatChangedCallout>{whatChanged}</WhatChangedCallout>
          </div>
          <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
            Null mean = {P_VALUE_NULL_MEAN}
          </span>
        </div>
        <div className="mt-2 flex min-h-0 flex-1 items-center rounded-md bg-[#f9faf6] p-2">
          <div
            key={animationKey}
            className={[
              "w-full transition-opacity duration-200 motion-reduce:transition-none",
              isRunning ? "opacity-55" : "opacity-100"
            ].join(" ")}
          >
            <NullModelHistogram
              animationKey={animationKey}
              nullMean={P_VALUE_NULL_MEAN}
              observedMean={result.controls.observedSampleMean}
              tailMode={result.controls.tailMode}
              values={result.simulatedMeans}
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
            {getPValueInterpretation(result)}
          </p>
          <p className="mt-2 text-sm leading-5 text-slate-700">
            The p-value is the proportion of null-model simulations at least as
            extreme as the observed result.
          </p>
        </section>
      </aside>
    </div>
  );
}
