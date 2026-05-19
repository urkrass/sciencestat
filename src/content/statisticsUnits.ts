export type StatisticsUnit = {
  number: number;
  slug: `unit-${string}`;
  title: string;
  description: string;
  pdfPath: string;
  texPath: string;
  hasTex: boolean;
};

const descriptions = [
  "Foundations for reliable scientific measurements, error, precision, accuracy, and uncertainty in experimental data.",
  "Tools for summarising, visualising, and interpreting patterns in biological and chemical measurements.",
  "How common probability distributions arise from real data-generating processes and experimental variation.",
  "Principles for planning fair comparisons, reducing bias, and choosing sample sizes with a scientific claim in mind.",
  "A careful introduction to null hypotheses, p-values, confidence intervals, and what statistical evidence can and cannot say.",
  "Statistical strategies for comparing two groups while keeping assumptions, effect sizes, and uncertainty visible.",
  "Methods for comparing several groups, including the logic behind analysis of variance and follow-up comparisons.",
  "Reasoning with counts, proportions, contingency tables, and chi-square tests in scientific investigations.",
  "Modelling relationships between quantitative variables, including correlation, regression, and calibration curves.",
  "How to choose, check, and communicate statistical models through diagnostics and assumption checks.",
  "A practical guide to writing defensible statistical conclusions that connect evidence back to scientific claims."
] as const;

const titles = [
  "Data, Measurement, and Uncertainty",
  "Descriptive Statistics and Visualisation",
  "Distributions and Data-Generating Processes",
  "Experimental Design and Sample Size",
  "Null Hypotheses, P-values, and Confidence Intervals",
  "Comparing Two Groups",
  "Comparing More Than Two Groups",
  "Categorical Data and Chi-square Tests",
  "Correlation, Regression, and Calibration Curves",
  "Model Choice and Diagnostics",
  "Writing Statistical Conclusions"
] as const;

export const statisticsUnits: StatisticsUnit[] = titles.map((title, index) => {
  const number = index + 1;
  const padded = String(number).padStart(2, "0");
  const fileName = `unit${padded}_statistics_for_scientific_claims`;

  return {
    number,
    slug: `unit-${padded}`,
    title,
    description: descriptions[index],
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
