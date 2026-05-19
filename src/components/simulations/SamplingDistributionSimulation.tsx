"use client";

import { useEffect, useRef, useState } from "react";
import { Histogram } from "@/components/simulations/Histogram";
import { NumberSlider } from "@/components/simulations/NumberSlider";
import {
  generateSampleMeans,
  type PopulationDistribution
} from "@/lib/statistics/sampling";
import { mean, roundTo, sampleStandardDeviation } from "@/lib/statistics/summary";

const POPULATION_MEAN = 50;

const distributionOptions: { value: PopulationDistribution; label: string }[] = [
  { value: "normal", label: "Normal" },
  { value: "skewed", label: "Skewed" },
  { value: "uniform", label: "Uniform" }
];

type SimulationControls = {
  distribution: PopulationDistribution;
  sampleSize: number;
  repeatedSamples: number;
  populationSd: number;
  seed: number;
};

const defaultControls: SimulationControls = {
  distribution: "normal",
  sampleSize: 10,
  repeatedSamples: 300,
  populationSd: 10,
  seed: 12345
};

type SimulationResult = {
  controls: SimulationControls;
  sampleMeans: number[];
  sampleMeanAverage: number;
  sampleMeanSd: number;
  expectedStandardError: number;
};

function createSimulationResult(controls: SimulationControls): SimulationResult {
  const sampleMeans = generateSampleMeans({
    distribution: controls.distribution,
    sampleSize: controls.sampleSize,
    repeatedSamples: controls.repeatedSamples,
    populationMean: POPULATION_MEAN,
    populationSd: controls.populationSd,
    seed: controls.seed
  });

  return {
    controls,
    sampleMeans,
    sampleMeanAverage: mean(sampleMeans),
    sampleMeanSd: sampleStandardDeviation(sampleMeans),
    expectedStandardError: controls.populationSd / Math.sqrt(controls.sampleSize)
  };
}

function getInterpretation(sampleSize: number) {
  if (sampleSize < 10) {
    return "With a small sample size, the sample means are more spread out. Repeated samples can land noticeably above or below the true population mean.";
  }

  if (sampleSize < 30) {
    return "As sample size grows, individual sample means still vary, but the distribution begins to tighten around the true population mean.";
  }

  return "With a larger sample size, sample means cluster more tightly around the true population mean. The expected standard error becomes smaller.";
}

export function SamplingDistributionSimulation() {
  const [controls, setControls] = useState<SimulationControls>(defaultControls);
  const [result, setResult] = useState(() => createSimulationResult(defaultControls));
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

  const updateControls = <Key extends keyof SimulationControls>(
    key: Key,
    value: SimulationControls[Key]
  ) => {
    setControls((current) => ({
      ...current,
      [key]: value
    }));
  };

  const finishSimulationRun = (nextResult: SimulationResult) => {
    setResult(nextResult);
    setAnimationKey((current) => current + 1);
    setIsRunning(false);
    runTimeoutRef.current = null;
  };

  const runSimulation = () => {
    const nextResult = createSimulationResult(controls);

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
    setResult(createSimulationResult(defaultControls));
    setAnimationKey((current) => current + 1);
    setIsRunning(false);
  };

  const generateNewSeed = () => {
    updateControls("seed", Math.floor(Math.random() * 999999) + 1);
  };

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
      label: "Repeated samples",
      value: String(result.controls.repeatedSamples)
    }
  ];

  return (
    <div
      aria-busy={isRunning}
      className="grid h-full min-h-0 overflow-y-auto rounded-lg border border-line bg-white shadow-sm lg:grid-cols-[18rem_minmax(0,1fr)_19rem] lg:overflow-hidden"
    >
      <section className="min-h-0 border-b border-line bg-paper/70 p-4 lg:border-b-0 lg:border-r lg:overflow-hidden">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
          Controls
        </h2>
        <div className="mt-4 space-y-4">
          <fieldset>
            <legend className="text-sm font-semibold text-ink">
              Population distribution
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-1 rounded-md border border-line bg-white p-1">
              {distributionOptions.map((option) => {
                const isSelected = controls.distribution === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => updateControls("distribution", option.value)}
                    className={[
                      "h-8 rounded-[5px] px-2 text-sm font-medium transition",
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

          <div className="space-y-2">
            <label htmlFor="seed" className="text-sm font-semibold text-ink">
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
                className="h-8 rounded-md border border-line bg-white/90 px-2 text-sm text-ink focus:border-moss focus:outline-none"
              />
              <button
                type="button"
                aria-label="New seed"
                onClick={generateNewSeed}
                className="h-8 rounded-md border border-line bg-white px-3 text-sm font-medium text-ink transition hover:border-moss hover:text-moss"
              >
                New
              </button>
            </div>
          </div>

          <div className="grid grid-cols-[1fr_5.5rem] gap-2 pt-1">
            <button
              type="button"
              aria-label="Run simulation"
              disabled={isRunning}
              onClick={runSimulation}
              className="h-10 rounded-md border border-moss bg-moss px-3 text-sm font-semibold text-white transition hover:bg-moss-dark disabled:cursor-wait disabled:bg-moss-dark"
            >
              {isRunning ? "Running" : "Run"}
            </button>
            <button
              type="button"
              onClick={resetSimulation}
              className="h-10 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink transition hover:border-moss hover:text-moss"
            >
              Reset
            </button>
          </div>
        </div>
      </section>

      <section className="flex min-h-[26rem] flex-col p-4 lg:min-h-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
              Sample means
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Repeated samples from a population with mean 50.
            </p>
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
              referenceValue={POPULATION_MEAN}
              xLabel="sample mean"
              yLabel="number of samples"
            />
          </div>
        </div>
      </section>

      <aside className="min-h-0 border-t border-line bg-[#fbfcfb] p-4 lg:border-l lg:border-t-0 lg:overflow-hidden">
        <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
          Results
        </h2>
        <dl className="mt-4 divide-y divide-line border-y border-line">
          {summaryItems.map((item) => (
            <div
              key={`${animationKey}-${item.label}`}
              className="flex items-center justify-between gap-3 py-3"
            >
              <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-slate-500">
                {item.label}
              </dt>
              <dd className="simulation-result-value text-xl font-semibold text-ink">
                {item.value}
              </dd>
            </div>
          ))}
        </dl>

        <section className="mt-5">
          <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
            Interpretation
          </h3>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {getInterpretation(result.controls.sampleSize)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            The population mean is fixed at 50. The histogram shows how the sample
            mean changes when the same sampling process is repeated many times.
          </p>
        </section>
      </aside>
    </div>
  );
}
