export type ConceptId =
  | "measurement-uncertainty"
  | "descriptive-statistics"
  | "data-generating-processes"
  | "sampling-distribution"
  | "experimental-design"
  | "sample-size"
  | "p-values"
  | "confidence-intervals"
  | "effect-size"
  | "two-group-comparison"
  | "group-comparison"
  | "categorical-data"
  | "correlation-regression"
  | "model-assumptions"
  | "statistical-conclusions";

export type Concept = {
  id: ConceptId;
  label: string;
  description: string;
};

export const concepts: Record<ConceptId, Concept> = {
  "measurement-uncertainty": {
    id: "measurement-uncertainty",
    label: "Measurement uncertainty",
    description:
      "How error, precision, accuracy, and reporting limits shape scientific claims."
  },
  "descriptive-statistics": {
    id: "descriptive-statistics",
    label: "Descriptive statistics",
    description:
      "How summaries and visual displays reveal structure in measured data."
  },
  "data-generating-processes": {
    id: "data-generating-processes",
    label: "Data-generating processes",
    description:
      "How repeated measurements arise from population patterns and random variation."
  },
  "sampling-distribution": {
    id: "sampling-distribution",
    label: "Sampling distributions",
    description:
      "How sample statistics vary across repeated samples from the same population."
  },
  "experimental-design": {
    id: "experimental-design",
    label: "Experimental design",
    description:
      "How fair comparisons, bias control, and planning affect statistical evidence."
  },
  "sample-size": {
    id: "sample-size",
    label: "Sample size",
    description:
      "How the amount of data affects stability, precision, and simulated uncertainty."
  },
  "p-values": {
    id: "p-values",
    label: "P-values",
    description:
      "How unusual an observed result would be under a specified null model."
  },
  "confidence-intervals": {
    id: "confidence-intervals",
    label: "Confidence intervals",
    description:
      "How interval methods express precision and long-run coverage."
  },
  "effect-size": {
    id: "effect-size",
    label: "Effect size",
    description:
      "How large a difference or relationship is in scientific context."
  },
  "two-group-comparison": {
    id: "two-group-comparison",
    label: "Two-group comparisons",
    description:
      "How evidence changes when comparing two treatments, groups, or conditions."
  },
  "group-comparison": {
    id: "group-comparison",
    label: "Several groups",
    description:
      "How variation within and between groups affects multi-group comparisons."
  },
  "categorical-data": {
    id: "categorical-data",
    label: "Categorical data",
    description:
      "How counts, proportions, and contingency tables support claims."
  },
  "correlation-regression": {
    id: "correlation-regression",
    label: "Correlation and regression",
    description:
      "How quantitative variables move together and support prediction or calibration."
  },
  "model-assumptions": {
    id: "model-assumptions",
    label: "Model assumptions",
    description:
      "How assumptions, diagnostics, and model choice limit statistical conclusions."
  },
  "statistical-conclusions": {
    id: "statistical-conclusions",
    label: "Statistical conclusions",
    description:
      "How to connect evidence, uncertainty, and assumptions back to a scientific claim."
  }
};

export function getConcept(id: ConceptId) {
  return concepts[id];
}

export function getConcepts(ids: readonly ConceptId[]) {
  return ids.map((id) => concepts[id]);
}
