"use client";

import { useEffect, useRef, useState } from "react";
import { ComparisonSummaryTable } from "@/components/simulations/ComparisonSummaryTable";
import { GeneratedConclusion } from "@/components/simulations/GeneratedConclusion";
import {
  GuidedModeSwitch,
  type SimulationMode
} from "@/components/simulations/GuidedModeSwitch";
import { Histogram } from "@/components/simulations/Histogram";
import { NumberSlider } from "@/components/simulations/NumberSlider";
import {
  PredictionPrompt,
  type SamplingPrediction
} from "@/components/simulations/PredictionPrompt";
import { SimulationAssumptionsPanel } from "@/components/simulations/SimulationAssumptionsPanel";
import {
  DirtySimulationNotice,
  FormulaStrip,
  TryThisPrompt
} from "@/components/simulations/SimulationAnnotations";
import { SimulationExportButtons } from "@/components/simulations/SimulationExportButtons";
import {
  buildSamplingComparisonResult,
  createSamplingDistributionResult,
  makeSamplingComparisonConclusion,
  samplingComparisonMatchesControls,
  samplingControlsMatch,
  SAMPLING_POPULATION_MEAN,
  type SamplingComparisonResult,
  type SamplingScenarioControls
} from "@/lib/statistics/comparison";
import type { PopulationDistribution } from "@/lib/statistics/sampling";
import { roundTo } from "@/lib/statistics/summary";

const distributionOptions: { value: PopulationDistribution; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "skewed", label: "Skewed" },
  { value: "uniform", label: "Uniform" }
];

const defaultControls: SamplingScenarioControls = {
  distribution: "normal",
  sampleSize: 10,
  repeatedSamples: 300,
  populationSd: 10,
  seed: 12345
};

function getInterpretation(sampleSize: number) {
  if (sampleSize < 10) {
    return "With a small sample size, the sample means are more spread out. Repeated samples can land noticeably above or below the true population mean.";
  }

  if (sampleSize < 30) {
    return "As sample size grows, individual sample means still vary, but the distribution begins to tighten around the true population mean.";
  }

  return "With a larger sample size, sample means cluster more tightly around the true population mean. The expected standard error becomes smaller.";
}

type PresetId = "small-large-n" | "low-high-sd" | "normal-skewed";

type GuidedPreset = {
  id: PresetId;
  label: string;
  scenarioA: SamplingScenarioControls;
  scenarioB: SamplingScenarioControls;
};

const guidedPresets: GuidedPreset[] = [
  {
    id: "small-large-n",
    label: "Small n vs large n",
    scenarioA: {
      distribution: "normal",
      sampleSize: 10,
      repeatedSamples: 300,
      populationSd: 10,
      seed: 12345
    },
    scenarioB: {
      distribution: "normal",
      sampleSize: 80,
      repeatedSamples: 300,
      populationSd: 10,
      seed: 12345
    }
  },
  {
    id: "low-high-sd",
    label: "Low SD vs high SD",
    scenarioA: {
      distribution: "normal",
      sampleSize: 30,
      repeatedSamples: 300,
      populationSd: 5,
      seed: 12345
    },
    scenarioB: {
      distribution: "normal",
      sampleSize: 30,
      repeatedSamples: 300,
      populationSd: 20,
      seed: 12345
    }
  },
  {
    id: "normal-skewed",
    label: "Normal vs skewed population",
    scenarioA: {
      distribution: "normal",
      sampleSize: 30,
      repeatedSamples: 300,
      populationSd: 10,
      seed: 12345
    },
    scenarioB: {
      distribution: "skewed",
      sampleSize: 30,
      repeatedSamples: 300,
      populationSd: 10,
      seed: 12345
    }
  }
];

function cloneScenario(controls: SamplingScenarioControls): SamplingScenarioControls {
  return { ...controls };
}

function getPreset(id: PresetId) {
  return guidedPresets.find((preset) => preset.id === id) ?? guidedPresets[0];
}

type ScenarioEditorProps = {
  idPrefix: string;
  label: string;
  controls: SamplingScenarioControls;
  onChange: <Key extends keyof SamplingScenarioControls>(
    key: Key,
    value: SamplingScenarioControls[Key]
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
          <legend className="text-xs font-semibold text-ink">Distribution</legend>
          <div className="mt-1 grid grid-cols-3 gap-1 rounded-md border border-line bg-white p-1">
            {distributionOptions.map((option) => {
              const isSelected = controls.distribution === option.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  aria-pressed={isSelected}
                  onClick={() => onChange("distribution", option.value)}
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
          id={`${idPrefix}-sample-size`}
          label="Sample size n"
          min={2}
          max={100}
          value={controls.sampleSize}
          onChange={(value) => onChange("sampleSize", value)}
        />
        <NumberSlider
          id={`${idPrefix}-repeated-samples`}
          label="Repeated samples"
          min={50}
          max={1000}
          step={50}
          value={controls.repeatedSamples}
          onChange={(value) => onChange("repeatedSamples", value)}
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

export function SamplingDistributionSimulation() {
  const [mode, setMode] = useState<SimulationMode>("explore");
  const [controls, setControls] =
    useState<SamplingScenarioControls>(defaultControls);
  const [result, setResult] = useState(() =>
    createSamplingDistributionResult(defaultControls)
  );
  const [animationKey, setAnimationKey] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const runTimeoutRef = useRef<number | null>(null);
  const comparisonTimeoutRef = useRef<number | null>(null);

  const defaultGuidedPreset = guidedPresets[0];
  const [presetId, setPresetId] = useState<PresetId>(defaultGuidedPreset.id);
  const [scenarioA, setScenarioA] = useState<SamplingScenarioControls>(() =>
    cloneScenario(defaultGuidedPreset.scenarioA)
  );
  const [scenarioB, setScenarioB] = useState<SamplingScenarioControls>(() =>
    cloneScenario(defaultGuidedPreset.scenarioB)
  );
  const [prediction, setPrediction] = useState<SamplingPrediction>(null);
  const [comparison, setComparison] = useState<SamplingComparisonResult | null>(
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

  const updateControls = <Key extends keyof SamplingScenarioControls>(
    key: Key,
    value: SamplingScenarioControls[Key]
  ) => {
    setControls((current) => ({
      ...current,
      [key]: value
    }));
  };

  const finishSimulationRun = (
    nextResult: ReturnType<typeof createSamplingDistributionResult>
  ) => {
    setResult(nextResult);
    setAnimationKey((current) => current + 1);
    setIsRunning(false);
    runTimeoutRef.current = null;
  };

  const runSimulation = () => {
    const nextResult = createSamplingDistributionResult(controls);

    if (runTimeoutRef.current !== null) {
      window.clearTimeout(runTimeoutRef.current);
    }

    setIsRunning(true);
    runTimeoutRef.current = window.setTimeout(() => {
      finishSimulationRun(nextResult);
    }, 180);
  };

  const resetSimulation = () => {
    if (runTimeoutRef.current !== null) {
      window.clearTimeout(runTimeoutRef.current);
      runTimeoutRef.current = null;
    }

    setControls(defaultControls);
    setResult(createSamplingDistributionResult(defaultControls));
    setAnimationKey((current) => current + 1);
    setIsRunning(false);
  };

  const generateNewSeed = () => {
    updateControls("seed", Math.floor(Math.random() * 999999) + 1);
  };

  const updateScenario = <Key extends keyof SamplingScenarioControls>(
    scenario: "A" | "B",
    key: Key,
    value: SamplingScenarioControls[Key]
  ) => {
    const updater = (current: SamplingScenarioControls) => ({
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

  const applyPreset = (nextPresetId: PresetId) => {
    const preset = getPreset(nextPresetId);
    setPresetId(preset.id);
    setScenarioA(cloneScenario(preset.scenarioA));
    setScenarioB(cloneScenario(preset.scenarioB));
    setPresetChangedPending(true);
  };

  const runComparison = () => {
    const nextComparison = buildSamplingComparisonResult(scenarioA, scenarioB);

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

  const isDirty = !samplingControlsMatch(controls, result);
  const comparisonIsDirty =
    comparison !== null &&
    !samplingComparisonMatchesControls(scenarioA, scenarioB, comparison);
  const comparisonNotice = presetChangedPending
    ? "Preset changed - run comparison to update."
    : comparisonIsDirty
      ? "Settings changed - run comparison to update."
      : null;
  const repeatedSamplesLow =
    scenarioA.repeatedSamples < 200 || scenarioB.repeatedSamples < 200;
  const simulationUncertaintyNote = repeatedSamplesLow
    ? "Simulation results vary from seed to seed. Increasing repeated samples makes the simulated pattern more stable. With fewer repeated samples, this comparison may be noisy."
    : "Simulation results vary from seed to seed. Increasing repeated samples makes the simulated pattern more stable.";

  const summaryItems = [
    {
      label: "Mean of sample means",
      value: roundTo(result.sampleMeanAverage, 2)
    },
    {
      label: "SD of sample means",
      value: roundTo(result.sampleMeanSd, 2)
    },
    {
      label: "Expected standard error",
      value: roundTo(result.expectedStandardError, 2)
    },
    {
      label: "Repeated samples / simulated means",
      value: String(result.controls.repeatedSamples)
    }
  ];

  if (mode === "guided") {
    const conclusion = comparison
      ? makeSamplingComparisonConclusion(comparison)
      : null;
    const resultLabel =
      comparison?.tighterScenario === "same"
        ? "about the same"
        : comparison
          ? `Scenario ${comparison.tighterScenario}`
          : null;

    return (
      <div
        aria-busy={isComparisonRunning}
        className="grid h-full min-h-0 overflow-y-auto rounded-lg border border-line bg-white shadow-sm lg:grid-cols-[17rem_minmax(0,1fr)_20rem] lg:overflow-hidden"
      >
        <section className="min-h-0 border-b border-line bg-paper/70 p-2.5 lg:border-b-0 lg:border-r lg:overflow-y-auto">
          <div className="flex items-center justify-between gap-2">
            <h2 className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-moss">
              Controls
            </h2>
            <GuidedModeSwitch mode={mode} onChange={setMode} compact />
          </div>

          <div className="mt-2 space-y-2">
            <div className="space-y-1">
              <label
                htmlFor="sampling-comparison-preset"
                className="text-xs font-semibold text-ink sm:text-sm"
              >
                Preset comparison
              </label>
              <select
                id="sampling-comparison-preset"
                value={presetId}
                onChange={(event) => applyPreset(event.target.value as PresetId)}
                className="h-8 w-full rounded-md border border-line bg-white px-2 text-sm text-ink focus:border-moss focus:outline-none"
              >
                {guidedPresets.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    {preset.label}
                  </option>
                ))}
              </select>
            </div>

            <PredictionPrompt value={prediction} onChange={setPrediction} />

            <section className="border-t border-line pt-2">
              <div className="flex items-center justify-between gap-2">
                <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">
                  Step 2: Run
                </h3>
              </div>
              <button
                type="button"
                aria-label="Run comparison"
                disabled={isComparisonRunning}
                onClick={runComparison}
                className="mt-1.5 h-8 w-full rounded-md border border-moss bg-moss px-3 text-sm font-semibold text-white transition hover:bg-moss-dark disabled:cursor-wait disabled:bg-moss-dark"
              >
                {isComparisonRunning ? "Running" : "Run comparison"}
              </button>
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
                idPrefix="scenario-a"
                label="Scenario A"
                controls={scenarioA}
                onChange={(key, value) => updateScenario("A", key, value)}
              />
              <ScenarioEditor
                idPrefix="scenario-b"
                label="Scenario B"
                controls={scenarioB}
                onChange={(key, value) => updateScenario("B", key, value)}
              />
            </div>

            <SimulationAssumptionsPanel
              assumptions={[
                "The population distribution is generated by the selected model.",
                "Each sample is independent.",
                "The population mean is fixed at 50.",
                "The population SD is treated as known in this simulation.",
                "The simulation illustrates long-run behavior, not one guaranteed experimental outcome."
              ]}
              note={simulationUncertaintyNote}
            />
          </div>
        </section>

        <section className="flex min-h-[26rem] flex-col p-2.5 lg:min-h-0">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
                Side-by-side sample means
              </h2>
              <p className="mt-1 max-w-2xl text-xs leading-4 text-slate-700">
                Predict which scenario will produce more stable sample means, run
                both with deterministic seeds, then write a defensible comparison.
              </p>
              <div className="mt-2">
                <FormulaStrip>Expected SE = sigma / sqrt(n)</FormulaStrip>
              </div>
            </div>
            <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
              Mean = 50
            </span>
          </div>

          <div className="mt-3 grid min-h-0 flex-1 gap-3 lg:grid-cols-2 lg:divide-x lg:divide-line">
            {comparison ? (
              [
                { label: "Scenario A", result: comparison.scenarioA },
                { label: "Scenario B", result: comparison.scenarioB }
              ].map(({ label, result }) => (
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
                        {result.controls.distribution}, n ={" "}
                        {result.controls.sampleSize}, SD ={" "}
                        {result.controls.populationSd}
                      </p>
                    </div>
                    <span className="rounded-full border border-line bg-white px-2 py-0.5 text-[0.68rem] font-semibold text-slate-600">
                      seed {result.controls.seed}
                    </span>
                  </div>
                  <div className="flex min-h-0 flex-1 items-center">
                    <Histogram
                      animationKey={comparisonAnimationKey}
                      values={result.sampleMeans}
                      referenceValue={SAMPLING_POPULATION_MEAN}
                      xLabel="sample mean"
                      yLabel="samples"
                      compact
                      ariaLabel={`${label} histogram of simulated sample means with true mean line`}
                      title={`${label} sample means`}
                    />
                  </div>
                  <p className="text-xs leading-4 text-slate-600">
                    SD of sample means:{" "}
                    <span className="font-semibold text-ink">
                      {roundTo(result.sampleMeanSd, 2)}
                    </span>
                    ; expected SE:{" "}
                    <span className="font-semibold text-ink">
                      {roundTo(result.expectedStandardError, 2)}
                    </span>
                  </p>
                </article>
              ))
            ) : (
              <div className="grid gap-3 lg:col-span-2 lg:grid-cols-2">
                {[
                  { label: "Scenario A", controls: scenarioA },
                  { label: "Scenario B", controls: scenarioB }
                ].map(({ label, controls }) => (
                  <article
                    key={label}
                    className="bg-[#f9faf6] p-3"
                  >
                    <h3 className="text-xs font-semibold uppercase tracking-[0.1em] text-moss">
                      {label}
                    </h3>
                    <dl className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-xs">
                      <div>
                        <dt className="text-slate-500">distribution</dt>
                        <dd className="font-semibold text-ink">
                          {controls.distribution}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">sample size n</dt>
                        <dd className="font-semibold text-ink">
                          {controls.sampleSize}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">population SD</dt>
                        <dd className="font-semibold text-ink">
                          {controls.populationSd}
                        </dd>
                      </div>
                      <div>
                        <dt className="text-slate-500">repeated samples</dt>
                        <dd className="font-semibold text-ink">
                          {controls.repeatedSamples}
                        </dd>
                      </div>
                    </dl>
                  </article>
                ))}
                <p className="border-t border-line pt-3 text-xs leading-5 text-slate-600 lg:col-span-2">
                  Run the comparison to generate both sampling distributions and
                  compare the simulated SD of sample means with the expected
                  standard error.
                </p>
              </div>
            )}
          </div>
        </section>

        <aside className="min-h-0 border-t border-line bg-[#fbfcfb] p-2.5 lg:border-l lg:border-t-0 lg:overflow-y-auto">
          {comparison ? (
            <div className="space-y-2">
              {prediction ? (
                <p className="border-l-2 border-line pl-3 text-xs leading-5 text-slate-700">
                  Prediction:{" "}
                  <span className="font-semibold text-ink">
                    {prediction === "same"
                      ? "about the same"
                      : `Scenario ${prediction}`}
                  </span>
                  . Result:{" "}
                  <span className="font-semibold text-ink">{resultLabel}</span>.
                </p>
              ) : null}
              <ComparisonSummaryTable comparison={comparison} />
              <div className="flex flex-wrap gap-2">
                <SimulationExportButtons comparison={comparison} />
              </div>
              {conclusion ? <GeneratedConclusion conclusion={conclusion} /> : null}
            </div>
          ) : (
            <section>
              <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
                Observation panel
              </h2>
              <p className="mt-2 text-sm leading-5 text-slate-700">
                Choose a prediction, then run the comparison. The table,
                tighter-scenario result, generated conclusion, and CSV export
                will appear here.
              </p>
            </section>
          )}
        </aside>
      </div>
    );
  }

  return (
    <div
      aria-busy={isRunning}
      className="grid h-full min-h-0 overflow-y-auto rounded-lg border border-line bg-white shadow-sm lg:grid-cols-[17rem_minmax(0,1fr)_18rem] lg:overflow-hidden"
    >
      <section className="min-h-0 border-b border-line bg-paper/70 p-2.5 lg:border-b-0 lg:border-r lg:overflow-y-auto">
        <div className="flex items-center justify-between gap-2">
          <h2 className="shrink-0 text-xs font-semibold uppercase tracking-[0.14em] text-moss">
            Controls
          </h2>
          <GuidedModeSwitch mode={mode} onChange={setMode} compact />
        </div>
        <div className="mt-2.5 space-y-2.5">
          <TryThisPrompt>
            increase n from 10 to 80 and run again. Compare the SD of sample means
            with the expected standard error.
          </TryThisPrompt>

          <div className="grid grid-cols-[1fr_7.25rem] gap-2">
            <button
              type="button"
              aria-label="Run simulation"
              disabled={isRunning}
              onClick={runSimulation}
              className="h-9 rounded-md border border-moss bg-moss px-3 text-sm font-semibold text-white transition hover:bg-moss-dark disabled:cursor-wait disabled:bg-moss-dark"
            >
              {isRunning ? "Running" : "Run"}
            </button>
            <button
              type="button"
              onClick={resetSimulation}
              className="h-9 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink transition hover:border-moss hover:text-moss"
            >
              Reset defaults
            </button>
          </div>

          <fieldset>
            <legend className="text-xs font-semibold text-ink sm:text-sm">
              Population distribution
            </legend>
            <div className="mt-1.5 grid grid-cols-3 gap-1 rounded-md border border-line bg-white p-1">
              {distributionOptions.map((option) => {
                const isSelected = controls.distribution === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => updateControls("distribution", option.value)}
                    className={[
                      "h-7 rounded-[5px] px-2 text-xs font-medium transition sm:text-sm",
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
            id="sample-size"
            label="Sample size n"
            min={2}
            max={100}
            value={controls.sampleSize}
            onChange={(value) => updateControls("sampleSize", value)}
          />
          <NumberSlider
            id="repeated-samples"
            label="Repeated samples"
            min={50}
            max={1000}
            step={50}
            value={controls.repeatedSamples}
            onChange={(value) => updateControls("repeatedSamples", value)}
          />
          <NumberSlider
            id="population-sd"
            label="Population SD"
            min={1}
            max={20}
            value={controls.populationSd}
            onChange={(value) => updateControls("populationSd", value)}
          />

          <div className="space-y-1">
            <label htmlFor="seed" className="text-xs font-semibold text-ink sm:text-sm">
              Seed
            </label>
            <div className="grid grid-cols-[1fr_4.25rem] gap-2">
              <input
                id="seed"
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

        </div>
      </section>

      <section className="flex min-h-[26rem] flex-col p-2.5 lg:min-h-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
              Sample means
            </h2>
            <p className="mt-1 text-sm leading-5 text-slate-600">
              Repeated samples from a population with mean 50.
            </p>
            <div className="mt-2">
              <FormulaStrip>
                Expected SE = σ / √n
              </FormulaStrip>
            </div>
            <div className="mt-2">
              <DirtySimulationNotice isDirty={isDirty} />
            </div>
          </div>
          <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
            Mean = 50
          </span>
        </div>
        <div className="mt-3 flex min-h-0 flex-1 items-center rounded-md bg-[#f9faf6] p-2">
          <div
            key={animationKey}
            className={[
              "w-full transition-opacity duration-200",
              isRunning ? "opacity-55" : "opacity-100"
            ].join(" ")}
          >
            <Histogram
              animationKey={animationKey}
              values={result.sampleMeans}
              referenceValue={SAMPLING_POPULATION_MEAN}
              xLabel="sample mean"
              yLabel="number of samples"
            />
          </div>
        </div>
      </section>

      <aside className="min-h-0 border-t border-line bg-[#fbfcfb] p-2.5 lg:border-l lg:border-t-0 lg:overflow-y-auto">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
          Results
        </h2>
        <dl className="mt-3 divide-y divide-line border-y border-line">
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
            {getInterpretation(result.controls.sampleSize)}
          </p>
          <p className="mt-2 text-sm leading-5 text-slate-700">
            The population mean is fixed at 50. Each repeated sample contributes
            one mean to the histogram. Compare "SD of sample means" with "Expected
            standard error"; with many repeated samples they should be close.
          </p>
        </section>
      </aside>
    </div>
  );
}
