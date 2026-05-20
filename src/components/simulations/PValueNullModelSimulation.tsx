"use client";

import { useEffect, useRef, useState } from "react";
import { NullModelHistogram } from "@/components/simulations/NullModelHistogram";
import { NumberSlider } from "@/components/simulations/NumberSlider";
import {
  DirtySimulationNotice,
  FormulaStrip,
  SimulationLegend,
  TryThisPrompt
} from "@/components/simulations/SimulationAnnotations";
import {
  generateNullModelMeans,
  simulatedPValue,
  type TailMode
} from "@/lib/statistics/inference";
import { roundTo, sampleStandardDeviation } from "@/lib/statistics/summary";

const NULL_MEAN = 50;

const tailModeOptions: { value: TailMode; label: string }[] = [
  { value: "twoSided", label: "Two-tailed" },
  { value: "greater", label: "Greater than" },
  { value: "less", label: "Less than" }
];

type PValueControls = {
  observedMean: number;
  sampleSize: number;
  simulatedSamples: number;
  populationSd: number;
  tailMode: TailMode;
  seed: number;
};

const defaultControls: PValueControls = {
  observedMean: 54,
  sampleSize: 16,
  simulatedSamples: 1000,
  populationSd: 10,
  tailMode: "twoSided",
  seed: 13579
};

type PValueResult = {
  controls: PValueControls;
  simulatedMeans: number[];
  extremeCount: number;
  pValue: number;
  nullSd: number;
};

function createPValueResult(controls: PValueControls): PValueResult {
  const simulatedMeans = generateNullModelMeans({
    sampleSize: controls.sampleSize,
    simulatedSamples: controls.simulatedSamples,
    nullMean: NULL_MEAN,
    populationSd: controls.populationSd,
    seed: controls.seed
  });
  const { pValue, extremeCount } = simulatedPValue(
    simulatedMeans,
    NULL_MEAN,
    controls.observedMean,
    controls.tailMode
  );

  return {
    controls,
    simulatedMeans,
    extremeCount,
    pValue,
    nullSd: sampleStandardDeviation(simulatedMeans)
  };
}

function controlsMatchResult(controls: PValueControls, result: PValueResult) {
  return (
    controls.observedMean === result.controls.observedMean &&
    controls.sampleSize === result.controls.sampleSize &&
    controls.simulatedSamples === result.controls.simulatedSamples &&
    controls.populationSd === result.controls.populationSd &&
    controls.tailMode === result.controls.tailMode &&
    controls.seed === result.controls.seed
  );
}

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
    return `Extreme rule: simulated mean ≥ observed sample mean (${observedText}).`;
  }

  if (tailMode === "less") {
    return `Extreme rule: simulated mean ≤ observed sample mean (${observedText}).`;
  }

  return `Extreme rule: |simulated mean − 50| ≥ |${observedText} − 50|.`;
}

function getPValueInterpretation(result: PValueResult) {
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

export function PValueNullModelSimulation() {
  const [controls, setControls] = useState<PValueControls>(defaultControls);
  const [result, setResult] = useState(() => createPValueResult(defaultControls));
  const [animationKey, setAnimationKey] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const runTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (runTimeoutRef.current !== null) {
        window.clearTimeout(runTimeoutRef.current);
      }
    };
  }, []);

  const updateControls = <Key extends keyof PValueControls>(
    key: Key,
    value: PValueControls[Key]
  ) => {
    setControls((current) => ({
      ...current,
      [key]: value
    }));
  };

  const finishRun = (nextResult: PValueResult) => {
    setResult(nextResult);
    setAnimationKey((current) => current + 1);
    setIsRunning(false);
    runTimeoutRef.current = null;
  };

  const runSimulation = () => {
    const nextResult = createPValueResult(controls);

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
    setResult(createPValueResult(defaultControls));
    setAnimationKey((current) => current + 1);
    setIsRunning(false);
  };

  const generateNewSeed = () => {
    updateControls("seed", Math.floor(Math.random() * 999999) + 1);
  };

  const isDirty = !controlsMatchResult(controls, result);

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
      value: roundTo(result.controls.observedMean, 1)
    },
    {
      label: "Null distribution SD",
      value: roundTo(result.nullSd, 2)
    }
  ];

  return (
    <div
      aria-busy={isRunning}
      className="grid h-full min-h-0 overflow-y-auto rounded-lg border border-line bg-white shadow-sm lg:grid-cols-[17rem_minmax(0,1fr)_18rem] lg:overflow-hidden"
    >
      <section className="min-h-0 border-b border-line bg-paper/70 p-2.5 lg:border-b-0 lg:border-r lg:overflow-y-auto">
        <h2 className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
          Controls
        </h2>
        <div className="mt-2.5 space-y-2.5">
          <TryThisPrompt>
            move the observed sample mean farther from 50 and run again. Watch how
            the tail area changes.
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
            <legend className="text-xs font-semibold text-ink sm:text-sm">Tail mode</legend>
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
            value={controls.observedMean}
            onChange={(value) => updateControls("observedMean", value)}
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
            <label htmlFor="pvalue-seed" className="text-xs font-semibold text-ink sm:text-sm">
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

        </div>
      </section>

      <section className="flex min-h-[26rem] flex-col p-2 lg:min-h-0">
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
                p = proportion of null simulations at least as extreme as the
                observed statistic
              </FormulaStrip>
            </div>
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
            <p className="mt-2 text-xs font-medium leading-5 text-slate-600">
              {getExtremeRule(result.controls.tailMode, result.controls.observedMean)}
            </p>
            <div className="mt-2">
              <DirtySimulationNotice isDirty={isDirty} />
            </div>
          </div>
          <span className="rounded-full border border-line bg-paper px-3 py-1 text-xs font-semibold uppercase tracking-[0.1em] text-slate-600">
            Null mean = 50
          </span>
        </div>
        <div className="mt-2 flex min-h-0 flex-1 items-center rounded-md bg-[#f9faf6] p-2">
          <div
            key={animationKey}
            className={[
              "w-full transition-opacity duration-200",
              isRunning ? "opacity-55" : "opacity-100"
            ].join(" ")}
          >
            <NullModelHistogram
              animationKey={animationKey}
              nullMean={NULL_MEAN}
              observedMean={result.controls.observedMean}
              tailMode={result.controls.tailMode}
              values={result.simulatedMeans}
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
