"use client";

import { useEffect, useRef, useState } from "react";
import { ConfidenceIntervalPlot } from "@/components/simulations/ConfidenceIntervalPlot";
import { NumberSlider } from "@/components/simulations/NumberSlider";
import {
  DirtySimulationNotice,
  FormulaStrip,
  SimulationLegend,
  TryThisPrompt
} from "@/components/simulations/SimulationAnnotations";
import {
  criticalValueForConfidenceLevel,
  generateConfidenceIntervals,
  type ConfidenceInterval,
  type ConfidenceLevel
} from "@/lib/statistics/inference";
import { roundTo } from "@/lib/statistics/summary";

const POPULATION_MEAN = 50;

const confidenceLevels: ConfidenceLevel[] = [90, 95, 99];

type ConfidenceControls = {
  sampleSize: number;
  repeatedIntervals: number;
  populationSd: number;
  confidenceLevel: ConfidenceLevel;
  seed: number;
};

const defaultControls: ConfidenceControls = {
  sampleSize: 20,
  repeatedIntervals: 80,
  populationSd: 10,
  confidenceLevel: 95,
  seed: 24680
};

type ConfidenceResult = {
  controls: ConfidenceControls;
  intervals: ConfidenceInterval[];
  capturedCount: number;
  coveragePercent: number;
  averageWidth: number;
};

function createConfidenceResult(controls: ConfidenceControls): ConfidenceResult {
  const intervals = generateConfidenceIntervals({
    sampleSize: controls.sampleSize,
    repeatedIntervals: controls.repeatedIntervals,
    populationMean: POPULATION_MEAN,
    populationSd: controls.populationSd,
    confidenceLevel: controls.confidenceLevel,
    seed: controls.seed
  });
  const capturedCount = intervals.filter((interval) => interval.capturesMean).length;
  const criticalValue = criticalValueForConfidenceLevel(controls.confidenceLevel);
  const averageWidth =
    2 * criticalValue * (controls.populationSd / Math.sqrt(controls.sampleSize));

  return {
    controls,
    intervals,
    capturedCount,
    coveragePercent: (capturedCount / intervals.length) * 100,
    averageWidth
  };
}

function getCoverageInterpretation(result: ConfidenceResult) {
  const difference = Math.abs(result.coveragePercent - result.controls.confidenceLevel);

  if (difference <= 4) {
    return "The observed coverage is close to the nominal confidence level. Small departures are expected because this is a finite simulation.";
  }

  if (result.coveragePercent < result.controls.confidenceLevel) {
    return "This run captured the true mean less often than the nominal level. Try increasing the number of intervals to see the long-run pattern settle.";
  }

  return "This run captured the true mean more often than the nominal level. Repeated simulation runs will vary around the long-run coverage.";
}

function controlsMatchResult(controls: ConfidenceControls, result: ConfidenceResult) {
  return (
    controls.sampleSize === result.controls.sampleSize &&
    controls.repeatedIntervals === result.controls.repeatedIntervals &&
    controls.populationSd === result.controls.populationSd &&
    controls.confidenceLevel === result.controls.confidenceLevel &&
    controls.seed === result.controls.seed
  );
}

export function ConfidenceIntervalsSimulation() {
  const [controls, setControls] = useState<ConfidenceControls>(defaultControls);
  const [result, setResult] = useState(() => createConfidenceResult(defaultControls));
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

  const updateControls = <Key extends keyof ConfidenceControls>(
    key: Key,
    value: ConfidenceControls[Key]
  ) => {
    setControls((current) => ({
      ...current,
      [key]: value
    }));
  };

  const finishRun = (nextResult: ConfidenceResult) => {
    setResult(nextResult);
    setAnimationKey((current) => current + 1);
    setIsRunning(false);
    runTimeoutRef.current = null;
  };

  const runSimulation = () => {
    const nextResult = createConfidenceResult(controls);

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
    setResult(createConfidenceResult(defaultControls));
    setAnimationKey((current) => current + 1);
    setIsRunning(false);
  };

  const generateNewSeed = () => {
    updateControls("seed", Math.floor(Math.random() * 999999) + 1);
  };

  const isDirty = !controlsMatchResult(controls, result);
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
      value: roundTo(result.averageWidth, 2)
    },
    {
      label: "Average margin of error",
      value: roundTo(result.averageWidth / 2, 2)
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
          <TryThisPrompt>
            switch from 90% to 99% and run again. Watch what happens to coverage
            and interval width.
          </TryThisPrompt>

          <div className="grid grid-cols-[1fr_7.75rem] gap-2">
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
              Reset defaults
            </button>
          </div>

          <fieldset>
            <legend className="text-sm font-semibold text-ink">
              Confidence level
            </legend>
            <div className="mt-2 grid grid-cols-3 gap-1 rounded-md border border-line bg-white p-1">
              {confidenceLevels.map((level) => {
                const isSelected = controls.confidenceLevel === level;

                return (
                  <button
                    key={level}
                    type="button"
                    aria-pressed={isSelected}
                    onClick={() => updateControls("confidenceLevel", level)}
                    className={[
                      "h-8 rounded-[5px] px-2 text-sm font-medium transition",
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
            max={200}
            step={10}
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

          <div className="space-y-2">
            <label htmlFor="ci-seed" className="text-sm font-semibold text-ink">
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

        </div>
      </section>

      <section className="flex min-h-[26rem] flex-col p-4 lg:min-h-0">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
              Interval coverage
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-600">
              Each line is one simulated confidence interval for the mean.
            </p>
            <div className="mt-2">
              <FormulaStrip>
                CI = sample mean ± critical value × σ / √n
              </FormulaStrip>
            </div>
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
            <p className="mt-2 text-xs leading-5 text-slate-500">
              {intervalDisplayNote} Currently displaying {displayedIntervalCount}.
            </p>
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
            <ConfidenceIntervalPlot
              animationKey={animationKey}
              intervals={result.intervals}
              trueMean={POPULATION_MEAN}
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
            {getCoverageInterpretation(result)}
          </p>
          <p className="mt-3 text-sm leading-6 text-slate-700">
            A {result.controls.confidenceLevel}% method should capture the true mean
            about {result.controls.confidenceLevel}% of the time over many repeated
            samples.
          </p>
        </section>
      </aside>
    </div>
  );
}
