import { createSeededRandom, randomNormal } from "@/lib/statistics/random";
import { mean } from "@/lib/statistics/summary";

export type ConfidenceLevel = 90 | 95 | 99;

export type ConfidenceInterval = {
  sampleMean: number;
  lower: number;
  upper: number;
  capturesMean: boolean;
};

export type GenerateConfidenceIntervalsOptions = {
  sampleSize: number;
  repeatedIntervals: number;
  populationMean: number;
  populationSd: number;
  confidenceLevel: ConfidenceLevel;
  seed: number;
};

export type GenerateNullModelMeansOptions = {
  sampleSize: number;
  simulatedSamples: number;
  nullMean: number;
  populationSd: number;
  seed: number;
};

const criticalValues: Record<ConfidenceLevel, number> = {
  90: 1.645,
  95: 1.96,
  99: 2.576
};

export function criticalValueForConfidenceLevel(level: ConfidenceLevel) {
  return criticalValues[level];
}

function generateNormalSampleMean(
  rng: () => number,
  sampleSize: number,
  distributionMean: number,
  standardDeviation: number
) {
  const sample: number[] = [];

  for (let index = 0; index < sampleSize; index += 1) {
    sample.push(randomNormal(rng, distributionMean, standardDeviation));
  }

  return mean(sample);
}

export function generateConfidenceIntervals(
  options: GenerateConfidenceIntervalsOptions
): ConfidenceInterval[] {
  const rng = createSeededRandom(options.seed);
  const standardError = options.populationSd / Math.sqrt(options.sampleSize);
  const margin = criticalValueForConfidenceLevel(options.confidenceLevel) * standardError;
  const intervals: ConfidenceInterval[] = [];

  for (let index = 0; index < options.repeatedIntervals; index += 1) {
    const sampleMean = generateNormalSampleMean(
      rng,
      options.sampleSize,
      options.populationMean,
      options.populationSd
    );
    const lower = sampleMean - margin;
    const upper = sampleMean + margin;

    intervals.push({
      sampleMean,
      lower,
      upper,
      capturesMean: lower <= options.populationMean && options.populationMean <= upper
    });
  }

  return intervals;
}

export function generateNullModelMeans(
  options: GenerateNullModelMeansOptions
): number[] {
  const rng = createSeededRandom(options.seed);
  const simulatedMeans: number[] = [];

  for (let index = 0; index < options.simulatedSamples; index += 1) {
    simulatedMeans.push(
      generateNormalSampleMean(
        rng,
        options.sampleSize,
        options.nullMean,
        options.populationSd
      )
    );
  }

  return simulatedMeans;
}

export function simulatedTwoSidedPValue(
  simulatedMeans: number[],
  nullMean: number,
  observedMean: number
) {
  if (simulatedMeans.length === 0) {
    return {
      pValue: Number.NaN,
      extremeCount: 0
    };
  }

  const observedDistance = Math.abs(observedMean - nullMean);
  const extremeCount = simulatedMeans.filter(
    (sampleMean) => Math.abs(sampleMean - nullMean) >= observedDistance
  ).length;

  return {
    pValue: extremeCount / simulatedMeans.length,
    extremeCount
  };
}
