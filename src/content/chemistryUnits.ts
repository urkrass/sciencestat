export type ChemistryUnit = {
  number: number;
  slug: string;
  title: string;
  description: string;
  pdfPath: string;
};

export const chemistryUnits: ChemistryUnit[] = [
  {
    number: 1,
    slug: "measurement-uncertainty",
    title: "Measurement and Uncertainty",
    description:
      "Core chemistry measurement language: resolution, uncertainty, significant figures, and defensible reporting.",
    pdfPath: "/pdfs/chemistry/stat_methods_block1_measurement_uncertainty.pdf"
  },
  {
    number: 2,
    slug: "repeated-measurements",
    title: "Repeated Measurements",
    description:
      "How replicate measurements reveal variation, precision, summaries, and experimental reliability.",
    pdfPath: "/pdfs/chemistry/stat_methods_block2_repeated_measurements_v3.pdf"
  },
  {
    number: 3,
    slug: "calibration-regression",
    title: "Calibration and Regression",
    description:
      "Using calibration curves, linear models, and residual thinking to connect instrument response with concentration.",
    pdfPath: "/pdfs/chemistry/stat_methods_block3_calibration_regression.pdf"
  },
  {
    number: 4,
    slug: "statistical-comparison",
    title: "Statistical Comparison",
    description:
      "Comparing chemistry results while keeping uncertainty, evidence strength, and practical meaning visible.",
    pdfPath: "/pdfs/chemistry/stat_methods_block4_statistical_comparison.pdf"
  },
  {
    number: 5,
    slug: "method-validation",
    title: "Method Validation",
    description:
      "Statistical checks for accuracy, precision, linear range, detection limits, and method fitness.",
    pdfPath: "/pdfs/chemistry/stat_methods_block5_method_validation.pdf"
  },
  {
    number: 6,
    slug: "reporting-results",
    title: "Reporting Results",
    description:
      "Writing chemistry conclusions that report uncertainty, assumptions, statistical evidence, and limits clearly.",
    pdfPath: "/pdfs/chemistry/stat_methods_block6_reporting_results.pdf"
  },
  {
    number: 7,
    slug: "significant-figures-worksheet",
    title: "Significant Figures Worksheet",
    description:
      "Practice problems for significant figures, rounding, and precision-aware chemistry calculations.",
    pdfPath: "/pdfs/chemistry/stat_methods_sig_figs_chemistry_worksheet.pdf"
  },
  {
    number: 8,
    slug: "anova-chemistry-worksheet",
    title: "ANOVA Chemistry Worksheet",
    description:
      "A chemistry-focused worksheet for comparing more than two groups using analysis of variance.",
    pdfPath: "/pdfs/chemistry/stat_methods_anova_chemistry_worksheet.pdf"
  },
  {
    number: 9,
    slug: "t-distribution-reference",
    title: "t-Distribution Reference",
    description:
      "A compact reference for t-distribution values used in uncertainty and inference calculations.",
    pdfPath: "/pdfs/chemistry/t-Dist.pdf"
  }
];

export function getChemistryUnit(slug: string) {
  return chemistryUnits.find((unit) => unit.slug === slug);
}

export function getAdjacentChemistryUnits(unit: ChemistryUnit) {
  const index = chemistryUnits.findIndex((candidate) => candidate.slug === unit.slug);

  return {
    previous: index > 0 ? chemistryUnits[index - 1] : null,
    next: index >= 0 && index < chemistryUnits.length - 1 ? chemistryUnits[index + 1] : null
  };
}
