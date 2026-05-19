"use client";

import { useState } from "react";
import { Histogram } from "@/components/simulations/Histogram";
import { NumberSlider } from "@/components/simulations/NumberSlider";
import { SimulationPanel } from "@/components/simulations/SimulationPanel";
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

  const updateControls = <Key extends keyof SimulationControls>(
    key: Key,
    value: SimulationControls[Key]
  ) => {
    setControls((current) => ({
      ...current,
      [key]: value
    }));
  };

  const runSimulation = () => {
    setResult(createSimulationResult(controls));
  };

  const resetSimulation = () => {
    setControls(defaultControls);
    setResult(createSimulationResult(defaultControls));
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
    <div className="grid h-full min-h-0 gap-3 overflow-y-auto lg:grid-cols-[17rem_minmax(0,1fr)_18rem] lg:overflow-hidden">
      <SimulationPanel title="Controls" className="min-h-0 p-3">
        <div className="mt-3 space-y-3">
          <div>
            <p className="text-sm font-semibold text-ink">Population distribution</p>
            <div className="mt-2 grid grid-cols-3 gap-2 lg:grid-cols-1">
              {distributionOptions.map((option) => {
                const isSelected = controls.distribution === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => updateControls("distribution", option.value)}
                    className={[
                      "h-8 rounded-md border px-3 text-sm font-medium transition",
                      isSelected
                        ? "border-moss bg-moss text-white"
                        : "border-line bg-white text-ink hover:border-moss hover:text-moss"
                    ].join(" ")}
                  >
                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>

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
            <div className="grid grid-cols-[1fr_auto] gap-2">
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
                className="h-8 rounded-md border border-line bg-white px-2 text-sm text-ink focus:border-moss focus:outline-none"
              />
              <button
                type="button"
                onClick={generateNewSeed}
                className="h-8 rounded-md border border-line bg-white px-3 text-sm font-medium text-ink transition hover:border-moss hover:text-moss"
              >
                New seed
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={runSimulation}
              className="h-9 rounded-md border border-moss bg-moss px-3 text-sm font-semibold text-white transition hover:bg-moss-dark"
            >
              Run simulation
            </button>
            <button
              type="button"
              onClick={resetSimulation}
              className="h-9 rounded-md border border-line bg-white px-3 text-sm font-semibold text-ink transition hover:border-moss hover:text-moss"
            >
              Reset
            </button>
          </div>
        </div>
      </SimulationPanel>

      <SimulationPanel title="Sample means" className="min-h-0 p-3">
        <div className="mt-3">
          <Histogram
            values={result.sampleMeans}
            referenceValue={POPULATION_MEAN}
            xLabel="sample mean"
            yLabel="number of samples"
          />
        </div>
      </SimulationPanel>

      <div className="grid min-h-0 gap-3 lg:grid-rows-[auto_1fr]">
        <SimulationPanel title="Summary" className="p-3">
          <div className="mt-3">
            <dl className="grid grid-cols-2 gap-2">
              {summaryItems.map((item) => (
                <div
                  key={item.label}
                  className="rounded-md border border-line bg-paper p-2.5"
                >
                  <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-slate-500">
                    {item.label}
                  </dt>
                  <dd className="mt-1 text-lg font-semibold text-ink">{item.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        </SimulationPanel>

        <SimulationPanel title="Interpretation" className="min-h-0 p-3">
          <p className="mt-3 text-sm leading-6 text-slate-700">
            {getInterpretation(result.controls.sampleSize)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            The population mean is fixed at 50. The histogram shows how the sample
            mean changes when the same sampling process is repeated many times.
          </p>
        </SimulationPanel>
      </div>
    </div>
  );
}
