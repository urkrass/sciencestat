import type { ConceptId } from "./concepts";

export type StatisticsUnit = {
  number: number;
  slug: `unit-${string}`;
  title: string;
  description: string;
  keyIdea: string;
  commonMisconception: string;
  tryNext: string;
  conceptIds: ConceptId[];
  relatedSimulationSlugs: string[];
  pdfPath: string;
  texPath: string;
  hasTex: boolean;
};

const unitDetails = [
  {
    title: "Data, Measurement, and Uncertainty",
    description:
      "Foundations for reliable scientific measurements, error, precision, accuracy, and uncertainty in experimental data.",
    keyIdea:
      "A scientific claim is only as strong as the measurement process behind it.",
    commonMisconception:
      "Precise measurements are not automatically accurate; repeated values can be consistently biased.",
    tryNext:
      "Practice distinguishing random scatter from systematic error before moving into distributions.",
    conceptIds: ["measurement-uncertainty", "statistical-conclusions"],
    relatedSimulationSlugs: []
  },
  {
    title: "Descriptive Statistics and Visualisation",
    description:
      "Tools for summarising, visualising, and interpreting patterns in biological and chemical measurements.",
    keyIdea:
      "Summaries should preserve the pattern that matters for the scientific question.",
    commonMisconception:
      "A single average does not describe spread, skew, outliers, or group structure.",
    tryNext:
      "Use the sampling distribution lab after this unit to see why summaries vary from sample to sample.",
    conceptIds: ["descriptive-statistics", "measurement-uncertainty"],
    relatedSimulationSlugs: ["sampling-distribution"]
  },
  {
    title: "Distributions and Data-Generating Processes",
    description:
      "How common probability distributions arise from real data-generating processes and experimental variation.",
    keyIdea:
      "A distribution is a model for how values are generated, not just a smooth picture over data.",
    commonMisconception:
      "Real data do not need to look perfectly normal for distribution-based reasoning to be useful.",
    tryNext:
      "Try normal, skewed, and uniform populations in the sampling distribution lab.",
    conceptIds: ["data-generating-processes", "sampling-distribution"],
    relatedSimulationSlugs: ["sampling-distribution"]
  },
  {
    title: "Experimental Design and Sample Size",
    description:
      "Principles for planning fair comparisons, reducing bias, and choosing sample sizes with a scientific claim in mind.",
    keyIdea:
      "Design decisions determine whether variation can be interpreted as evidence.",
    commonMisconception:
      "A larger sample cannot rescue a biased comparison or poorly controlled design.",
    tryNext:
      "Use the sampling distribution lab to compare small and large sample sizes.",
    conceptIds: ["experimental-design", "sample-size", "sampling-distribution"],
    relatedSimulationSlugs: ["sampling-distribution"]
  },
  {
    title: "Null Hypotheses, P-values, and Confidence Intervals",
    description:
      "A careful introduction to null hypotheses, p-values, confidence intervals, and what statistical evidence can and cannot say.",
    keyIdea:
      "Inference connects observed data to a model, then reports uncertainty without reversing the logic.",
    commonMisconception:
      "A p-value is not the probability that the null is true, and a confidence interval is not a probability statement about one fixed interval.",
    tryNext:
      "Compare confidence levels and observed means in the two inference labs.",
    conceptIds: ["p-values", "confidence-intervals", "model-assumptions"],
    relatedSimulationSlugs: ["confidence-intervals", "p-value-null-model"]
  },
  {
    title: "Comparing Two Groups",
    description:
      "Statistical strategies for comparing two groups while keeping assumptions, effect sizes, and uncertainty visible.",
    keyIdea:
      "A two-group comparison should report direction, size, uncertainty, and assumptions.",
    commonMisconception:
      "A significant result does not prove the difference is biologically important.",
    tryNext:
      "Use confidence intervals and p-value simulations to separate evidence strength from effect size.",
    conceptIds: ["two-group-comparison", "effect-size", "confidence-intervals"],
    relatedSimulationSlugs: ["confidence-intervals", "p-value-null-model"]
  },
  {
    title: "Comparing More Than Two Groups",
    description:
      "Methods for comparing several groups, including the logic behind analysis of variance and follow-up comparisons.",
    keyIdea:
      "Several-group comparisons ask whether between-group differences are large relative to within-group variation.",
    commonMisconception:
      "Finding one low p-value among many comparisons is not the same as a planned, controlled analysis.",
    tryNext:
      "Return to the sample-size and confidence interval labs to see how uncertainty changes with variation.",
    conceptIds: ["group-comparison", "effect-size", "model-assumptions"],
    relatedSimulationSlugs: ["confidence-intervals"]
  },
  {
    title: "Categorical Data and Chi-square Tests",
    description:
      "Reasoning with counts, proportions, contingency tables, and chi-square tests in scientific investigations.",
    keyIdea:
      "Categorical analyses compare observed counts with counts expected under a model.",
    commonMisconception:
      "A percentage difference can look large even when the count evidence is weak.",
    tryNext:
      "Use the p-value lab to reinforce what a model-based tail probability means.",
    conceptIds: ["categorical-data", "p-values", "model-assumptions"],
    relatedSimulationSlugs: ["p-value-null-model"]
  },
  {
    title: "Correlation, Regression, and Calibration Curves",
    description:
      "Modelling relationships between quantitative variables, including correlation, regression, and calibration curves.",
    keyIdea:
      "Regression describes a relationship with uncertainty; it does not by itself establish causation.",
    commonMisconception:
      "A high correlation is not proof that one variable causes the other.",
    tryNext:
      "Use model assumption checks before treating a fitted line as evidence for a scientific claim.",
    conceptIds: ["correlation-regression", "effect-size", "model-assumptions"],
    relatedSimulationSlugs: []
  },
  {
    title: "Model Choice and Diagnostics",
    description:
      "How to choose, check, and communicate statistical models through diagnostics and assumption checks.",
    keyIdea:
      "Diagnostics ask whether the model is useful enough for the claim being made.",
    commonMisconception:
      "Passing one assumption check does not validate every conclusion from a model.",
    tryNext:
      "Revisit the inference labs and read each result through its assumptions panel.",
    conceptIds: ["model-assumptions", "data-generating-processes", "statistical-conclusions"],
    relatedSimulationSlugs: ["confidence-intervals", "p-value-null-model"]
  },
  {
    title: "Writing Statistical Conclusions",
    description:
      "A practical guide to writing defensible statistical conclusions that connect evidence back to scientific claims.",
    keyIdea:
      "A defensible conclusion names the evidence, the uncertainty, the assumptions, and the claim boundary.",
    commonMisconception:
      "Statistical wording should not turn model-based evidence into certainty.",
    tryNext:
      "Use generated conclusions and reflection notes from the simulations as drafting practice.",
    conceptIds: ["statistical-conclusions", "p-values", "confidence-intervals"],
    relatedSimulationSlugs: ["confidence-intervals", "p-value-null-model"]
  }
] satisfies Array<{
  title: string;
  description: string;
  keyIdea: string;
  commonMisconception: string;
  tryNext: string;
  conceptIds: ConceptId[];
  relatedSimulationSlugs: string[];
}>;

export const statisticsUnits: StatisticsUnit[] = unitDetails.map((unit, index) => {
  const number = index + 1;
  const padded = String(number).padStart(2, "0");
  const fileName = `unit${padded}_statistics_for_scientific_claims`;

  return {
    number,
    slug: `unit-${padded}`,
    title: unit.title,
    description: unit.description,
    keyIdea: unit.keyIdea,
    commonMisconception: unit.commonMisconception,
    tryNext: unit.tryNext,
    conceptIds: unit.conceptIds,
    relatedSimulationSlugs: unit.relatedSimulationSlugs,
    pdfPath: `/pdfs/${fileName}.pdf`,
    texPath: `/sources/${fileName}.tex`,
    hasTex: false
  };
});

export function getStatisticsUnit(slug: string) {
  return statisticsUnits.find((unit) => unit.slug === slug);
}

export function getAdjacentStatisticsUnits(unit: StatisticsUnit) {
  const index = statisticsUnits.findIndex((candidate) => candidate.slug === unit.slug);

  return {
    previous: index > 0 ? statisticsUnits[index - 1] : null,
    next: index >= 0 && index < statisticsUnits.length - 1 ? statisticsUnits[index + 1] : null
  };
}
