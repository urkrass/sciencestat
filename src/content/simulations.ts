import type { ConceptId } from "./concepts";
import type { StatisticsUnit } from "./statisticsUnits";

export type SimulationStatus = "available" | "comingSoon";

export type Simulation = {
  slug: string;
  title: string;
  status: SimulationStatus;
  description: string;
  learningGoal: string;
  conceptIds: ConceptId[];
  unitSlugs: StatisticsUnit["slug"][];
  href?: string;
};

export const simulations: Simulation[] = [
  {
    slug: "sampling-distribution",
    title: "Sampling distribution",
    status: "available",
    description:
      "Change sample size and number of repeated samples to see how sample means vary around a population mean.",
    learningGoal:
      "See why larger samples usually produce more stable sample means.",
    conceptIds: ["sampling-distribution", "sample-size", "data-generating-processes"],
    unitSlugs: ["unit-02", "unit-03", "unit-04"],
    href: "/courses/statistics-for-scientific-claims/simulations/sampling-distribution"
  },
  {
    slug: "confidence-intervals",
    title: "Confidence intervals",
    status: "available",
    description:
      "See how often confidence intervals capture the true parameter over repeated sampling.",
    learningGoal:
      "Compare interval width, confidence level, sample size, and long-run coverage.",
    conceptIds: ["confidence-intervals", "sample-size", "model-assumptions"],
    unitSlugs: ["unit-05", "unit-06", "unit-11"],
    href: "/courses/statistics-for-scientific-claims/simulations/confidence-intervals"
  },
  {
    slug: "p-value-null-model",
    title: "P-value under a null model",
    status: "available",
    description:
      "Simulate results under a null hypothesis and compare an observed statistic to the null distribution.",
    learningGoal:
      "See how results farther from a null mean produce smaller simulated p-values.",
    conceptIds: ["p-values", "model-assumptions", "statistical-conclusions"],
    unitSlugs: ["unit-05", "unit-08", "unit-11"],
    href: "/courses/statistics-for-scientific-claims/simulations/p-value-null-model"
  },
  {
    slug: "two-sample-means",
    title: "Two-sample mean difference",
    status: "comingSoon",
    description:
      "Compare two group means while keeping effect size, spread, and uncertainty visible.",
    learningGoal:
      "Separate the size of a difference from the uncertainty around that difference.",
    conceptIds: ["two-group-comparison", "effect-size", "confidence-intervals"],
    unitSlugs: ["unit-06"]
  },
  {
    slug: "correlation-regression",
    title: "Correlation and regression",
    status: "comingSoon",
    description:
      "Generate paired data, fit a line, and inspect how noise changes prediction.",
    learningGoal:
      "Connect trend strength, residual spread, and limits on causal language.",
    conceptIds: ["correlation-regression", "model-assumptions", "effect-size"],
    unitSlugs: ["unit-09", "unit-10"]
  },
  {
    slug: "categorical-counts",
    title: "Categorical counts",
    status: "comingSoon",
    description:
      "Compare observed and expected counts in a table-based scientific claim.",
    learningGoal:
      "See how count evidence differs from percentage-only comparisons.",
    conceptIds: ["categorical-data", "p-values", "model-assumptions"],
    unitSlugs: ["unit-08"]
  },
  {
    slug: "several-groups",
    title: "Several-group comparison",
    status: "comingSoon",
    description:
      "Explore how between-group differences compete with within-group variation.",
    learningGoal:
      "Understand why several-group claims need planned comparisons and uncertainty.",
    conceptIds: ["group-comparison", "effect-size", "model-assumptions"],
    unitSlugs: ["unit-07"]
  }
];

export function getSimulation(slug: string) {
  return simulations.find((simulation) => simulation.slug === slug) ?? null;
}
