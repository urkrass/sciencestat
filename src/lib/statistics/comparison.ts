import {
  criticalValueForConfidenceLevel,
  generateConfidenceIntervals,
  generateNullModelMeans,
  simulatedPValue,
  type ConfidenceInterval,
  type ConfidenceLevel,
  type TailMode
} from "@/lib/statistics/inference";
import {
  generateSampleMeans,
  type PopulationDistribution
} from "@/lib/statistics/sampling";
import { mean, roundTo, sampleStandardDeviation } from "@/lib/statistics/summary";

export const SAMPLING_POPULATION_MEAN = 50;
export const CONFIDENCE_POPULATION_MEAN = 50;
export const P_VALUE_NULL_MEAN = 50;

export type SamplingScenarioControls = {
  distribution: PopulationDistribution;
  sampleSize: number;
  repeatedSamples: number;
  populationSd: number;
  seed: number;
};

export type SamplingDistributionResult = {
  controls: SamplingScenarioControls;
  sampleMeans: number[];
  sampleMeanAverage: number;
  sampleMeanSd: number;
  expectedStandardError: number;
};

export type SamplingComparisonResult = {
  scenarioA: SamplingDistributionResult;
  scenarioB: SamplingDistributionResult;
  sdDifference: number;
  tighterScenario: "A" | "B" | "same";
};

export function createSamplingDistributionResult(
  controls: SamplingScenarioControls
): SamplingDistributionResult {
  const sampleMeans = generateSampleMeans({
    distribution: controls.distribution,
    sampleSize: controls.sampleSize,
    repeatedSamples: controls.repeatedSamples,
    populationMean: SAMPLING_POPULATION_MEAN,
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

export function samplingControlsMatch(
  controls: SamplingScenarioControls,
  result: SamplingDistributionResult
) {
  return (
    controls.distribution === result.controls.distribution &&
    controls.sampleSize === result.controls.sampleSize &&
    controls.repeatedSamples === result.controls.repeatedSamples &&
    controls.populationSd === result.controls.populationSd &&
    controls.seed === result.controls.seed
  );
}

export function buildSamplingComparisonResult(
  scenarioA: SamplingScenarioControls,
  scenarioB: SamplingScenarioControls
): SamplingComparisonResult {
  const resultA = createSamplingDistributionResult(scenarioA);
  const resultB = createSamplingDistributionResult(scenarioB);
  const sdDifference = Math.abs(resultA.sampleMeanSd - resultB.sampleMeanSd);
  const tighterScenario =
    sdDifference < 0.01
      ? "same"
      : resultA.sampleMeanSd < resultB.sampleMeanSd
        ? "A"
        : "B";

  return {
    scenarioA: resultA,
    scenarioB: resultB,
    sdDifference,
    tighterScenario
  };
}

export function samplingComparisonMatchesControls(
  scenarioA: SamplingScenarioControls,
  scenarioB: SamplingScenarioControls,
  comparison: SamplingComparisonResult
) {
  return (
    samplingControlsMatch(scenarioA, comparison.scenarioA) &&
    samplingControlsMatch(scenarioB, comparison.scenarioB)
  );
}

export function makeSamplingComparisonConclusion(
  comparison: SamplingComparisonResult
) {
  const { scenarioA, scenarioB, tighterScenario } = comparison;
  const tighterName =
    tighterScenario === "same" ? "neither scenario" : `Scenario ${tighterScenario}`;
  const largerSampleName =
    scenarioA.controls.sampleSize === scenarioB.controls.sampleSize
      ? null
      : scenarioA.controls.sampleSize > scenarioB.controls.sampleSize
        ? "Scenario A"
        : "Scenario B";

  if (largerSampleName) {
    return `${largerSampleName} used a larger sample size. ${tighterName} had the more tightly clustered sample means, with SDs of ${roundTo(
      scenarioA.sampleMeanSd,
      2
    )} for Scenario A and ${roundTo(
      scenarioB.sampleMeanSd,
      2
    )} for Scenario B, matching SE = sigma / sqrt(n).`;
  }

  return `${tighterName} had the more tightly clustered sample means, with SDs of ${roundTo(
    scenarioA.sampleMeanSd,
    2
  )} for Scenario A and ${roundTo(
    scenarioB.sampleMeanSd,
    2
  )} for Scenario B. With sample size held constant, population spread or distribution shape explains most of the difference.`;
}

export type ConfidenceScenarioControls = {
  confidenceLevel: ConfidenceLevel;
  sampleSize: number;
  repeatedIntervals: number;
  populationSd: number;
  seed: number;
};

export type ConfidenceComparisonScenarioResult = {
  controls: ConfidenceScenarioControls;
  intervals: ConfidenceInterval[];
  capturedCount: number;
  coveragePercent: number;
  averageFullIntervalWidth: number;
  averageMarginOfError: number;
};

export type ConfidenceComparisonResult = {
  scenarioA: ConfidenceComparisonScenarioResult;
  scenarioB: ConfidenceComparisonScenarioResult;
  widthDifference: number;
  widerScenario: "A" | "B" | "same";
};

export function createConfidenceComparisonResult(
  controls: ConfidenceScenarioControls
): ConfidenceComparisonScenarioResult {
  const intervals = generateConfidenceIntervals({
    sampleSize: controls.sampleSize,
    repeatedIntervals: controls.repeatedIntervals,
    populationMean: CONFIDENCE_POPULATION_MEAN,
    populationSd: controls.populationSd,
    confidenceLevel: controls.confidenceLevel,
    seed: controls.seed
  });
  const capturedCount = intervals.filter((interval) => interval.capturesMean).length;
  const intervalWidths = intervals.map((interval) => interval.upper - interval.lower);
  const averageFullIntervalWidth =
    intervalWidths.length > 0
      ? mean(intervalWidths)
      : 2 *
        criticalValueForConfidenceLevel(controls.confidenceLevel) *
        (controls.populationSd / Math.sqrt(controls.sampleSize));

  return {
    controls,
    intervals,
    capturedCount,
    coveragePercent:
      intervals.length > 0 ? (capturedCount / intervals.length) * 100 : Number.NaN,
    averageFullIntervalWidth,
    averageMarginOfError: averageFullIntervalWidth / 2
  };
}

export function confidenceControlsMatch(
  controls: ConfidenceScenarioControls,
  result: ConfidenceComparisonScenarioResult
) {
  return (
    controls.confidenceLevel === result.controls.confidenceLevel &&
    controls.sampleSize === result.controls.sampleSize &&
    controls.repeatedIntervals === result.controls.repeatedIntervals &&
    controls.populationSd === result.controls.populationSd &&
    controls.seed === result.controls.seed
  );
}

export function buildConfidenceComparisonResult(
  scenarioA: ConfidenceScenarioControls,
  scenarioB: ConfidenceScenarioControls
): ConfidenceComparisonResult {
  const resultA = createConfidenceComparisonResult(scenarioA);
  const resultB = createConfidenceComparisonResult(scenarioB);
  const widthDifference = Math.abs(
    resultA.averageFullIntervalWidth - resultB.averageFullIntervalWidth
  );
  const widerScenario =
    widthDifference < 0.01
      ? "same"
      : resultA.averageFullIntervalWidth > resultB.averageFullIntervalWidth
        ? "A"
        : "B";

  return {
    scenarioA: resultA,
    scenarioB: resultB,
    widthDifference,
    widerScenario
  };
}

export function confidenceComparisonMatchesControls(
  scenarioA: ConfidenceScenarioControls,
  scenarioB: ConfidenceScenarioControls,
  comparison: ConfidenceComparisonResult
) {
  return (
    confidenceControlsMatch(scenarioA, comparison.scenarioA) &&
    confidenceControlsMatch(scenarioB, comparison.scenarioB)
  );
}

export function makeConfidenceComparisonConclusion(
  comparison: ConfidenceComparisonResult
) {
  const { scenarioA, scenarioB, widerScenario } = comparison;
  const higherConfidenceScenario =
    scenarioA.controls.confidenceLevel === scenarioB.controls.confidenceLevel
      ? null
      : scenarioA.controls.confidenceLevel > scenarioB.controls.confidenceLevel
        ? "A"
        : "B";
  const widerName =
    widerScenario === "same" ? "neither scenario" : `Scenario ${widerScenario}`;

  if (higherConfidenceScenario) {
    const higherConfidenceResult =
      higherConfidenceScenario === "A" ? scenarioA : scenarioB;

    return `Scenario ${higherConfidenceScenario} used a higher confidence level. ${widerName} had wider intervals, with average full widths of ${roundTo(
      scenarioA.averageFullIntervalWidth,
      2
    )} for Scenario A and ${roundTo(
      scenarioB.averageFullIntervalWidth,
      2
    )} for Scenario B. Scenario ${higherConfidenceScenario}'s observed coverage was ${roundTo(
      higherConfidenceResult.coveragePercent,
      1
    )}%, closer to its higher nominal level in this run. This illustrates the tradeoff between confidence level and interval width.`;
  }

  return `${widerName} had wider intervals, with observed coverage of ${roundTo(
    scenarioA.coveragePercent,
    1
  )}% for Scenario A and ${roundTo(
    scenarioB.coveragePercent,
    1
  )}% for Scenario B. With confidence level held constant, sample size or population spread explains most of the width difference.`;
}

export type PValueScenarioControls = {
  observedSampleMean: number;
  sampleSize: number;
  simulatedSamples: number;
  populationSd: number;
  seed: number;
  tailMode: TailMode;
};

export type PValueComparisonScenarioResult = {
  controls: PValueScenarioControls;
  simulatedMeans: number[];
  distanceFromNullMean: number;
  extremeCount: number;
  pValue: number;
  nullDistributionSd: number;
};

export type PValueComparisonResult = {
  scenarioA: PValueComparisonScenarioResult;
  scenarioB: PValueComparisonScenarioResult;
  pValueDifference: number;
  smallerPValueScenario: "A" | "B" | "same";
};

export function createPValueComparisonResult(
  controls: PValueScenarioControls
): PValueComparisonScenarioResult {
  const simulatedMeans = generateNullModelMeans({
    sampleSize: controls.sampleSize,
    simulatedSamples: controls.simulatedSamples,
    nullMean: P_VALUE_NULL_MEAN,
    populationSd: controls.populationSd,
    seed: controls.seed
  });
  const { pValue, extremeCount } = simulatedPValue(
    simulatedMeans,
    P_VALUE_NULL_MEAN,
    controls.observedSampleMean,
    controls.tailMode
  );

  return {
    controls,
    simulatedMeans,
    distanceFromNullMean: Math.abs(controls.observedSampleMean - P_VALUE_NULL_MEAN),
    extremeCount,
    pValue,
    nullDistributionSd: sampleStandardDeviation(simulatedMeans)
  };
}

export function pValueControlsMatch(
  controls: PValueScenarioControls,
  result: PValueComparisonScenarioResult
) {
  return (
    controls.observedSampleMean === result.controls.observedSampleMean &&
    controls.sampleSize === result.controls.sampleSize &&
    controls.simulatedSamples === result.controls.simulatedSamples &&
    controls.populationSd === result.controls.populationSd &&
    controls.seed === result.controls.seed &&
    controls.tailMode === result.controls.tailMode
  );
}

export function buildPValueComparisonResult(
  scenarioA: PValueScenarioControls,
  scenarioB: PValueScenarioControls
): PValueComparisonResult {
  const resultA = createPValueComparisonResult(scenarioA);
  const resultB = createPValueComparisonResult(scenarioB);
  const pValueDifference = Math.abs(resultA.pValue - resultB.pValue);
  const smallerPValueScenario =
    pValueDifference < 0.001
      ? "same"
      : resultA.pValue < resultB.pValue
        ? "A"
        : "B";

  return {
    scenarioA: resultA,
    scenarioB: resultB,
    pValueDifference,
    smallerPValueScenario
  };
}

export function pValueComparisonMatchesControls(
  scenarioA: PValueScenarioControls,
  scenarioB: PValueScenarioControls,
  comparison: PValueComparisonResult
) {
  return (
    pValueControlsMatch(scenarioA, comparison.scenarioA) &&
    pValueControlsMatch(scenarioB, comparison.scenarioB)
  );
}

export function makePValueComparisonConclusion(
  comparison: PValueComparisonResult
) {
  const { scenarioA, scenarioB, smallerPValueScenario } = comparison;
  const fartherScenario =
    scenarioA.distanceFromNullMean === scenarioB.distanceFromNullMean
      ? null
      : scenarioA.distanceFromNullMean > scenarioB.distanceFromNullMean
        ? "A"
        : "B";
  const smallerName =
    smallerPValueScenario === "same"
      ? "neither scenario"
      : `Scenario ${smallerPValueScenario}`;

  if (fartherScenario) {
    return `Scenario ${fartherScenario} placed the observed sample mean farther from the null mean. ${smallerName} had the smaller simulated p-value, with p = ${roundTo(
      scenarioA.pValue,
      3
    )} for Scenario A and p = ${roundTo(
      scenarioB.pValue,
      3
    )} for Scenario B. Fewer null-model simulations were at least as extreme when the observed result was farther from the null.`;
  }

  return `${smallerName} had the smaller simulated p-value, with p = ${roundTo(
    scenarioA.pValue,
    3
  )} for Scenario A and p = ${roundTo(
    scenarioB.pValue,
    3
  )} for Scenario B. Because the distance from the null was the same, tail mode, sample size, or simulation variability explains the difference.`;
}
