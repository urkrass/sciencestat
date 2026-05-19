import {
  createSeededRandom,
  randomNormal,
  randomSkewed,
  randomUniform
} from "@/lib/statistics/random";
import { mean } from "@/lib/statistics/summary";

export type PopulationDistribution = "normal" | "skewed" | "uniform";

export type GenerateSampleMeansOptions = {
  distribution: PopulationDistribution;
  sampleSize: number;
  repeatedSamples: number;
  populationMean: number;
  populationSd: number;
  seed: number;
};

function randomValueFromDistribution(
  rng: () => number,
  distribution: PopulationDistribution,
  populationMean: number,
  populationSd: number
): number {
  if (distribution === "normal") {
    return randomNormal(rng, populationMean, populationSd);
  }

  if (distribution === "skewed") {
    return randomSkewed(rng, populationMean, populationSd);
  }

  const halfRange = Math.sqrt(3) * populationSd;
  return randomUniform(rng, populationMean - halfRange, populationMean + halfRange);
}

export function generateSampleMeans(options: GenerateSampleMeansOptions): number[] {
  const rng = createSeededRandom(options.seed);
  const sampleMeans: number[] = [];

  for (let sampleIndex = 0; sampleIndex < options.repeatedSamples; sampleIndex += 1) {
    const sample: number[] = [];

    for (let valueIndex = 0; valueIndex < options.sampleSize; valueIndex += 1) {
      sample.push(
        randomValueFromDistribution(
          rng,
          options.distribution,
          options.populationMean,
          options.populationSd
        )
      );
    }

    sampleMeans.push(mean(sample));
  }

  return sampleMeans;
}
