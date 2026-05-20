import {
  generateSampleMeans,
  type PopulationDistribution
} from "@/lib/statistics/sampling";
import { mean, roundTo, sampleStandardDeviation } from "@/lib/statistics/summary";

export const SAMPLING_POPULATION_MEAN = 50;

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
