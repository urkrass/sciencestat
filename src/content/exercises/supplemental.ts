import type { ExerciseSet } from "./types";

export const supplementalExerciseSets: ExerciseSet[] = [
  {
    unitSlug: "unit-02",
    title: "Interactive exercises",
    intro:
      "Check whether you can describe data without hiding spread, shape, or outliers.",
    conceptIds: ["descriptive-statistics", "measurement-uncertainty"],
    recommendedSimulationSlugs: ["sampling-distribution"],
    exercises: [
      {
        id: "unit02-average-alone",
        type: "multipleChoice",
        title: "Average alone",
        practiceKind: "conceptual",
        conceptIds: ["descriptive-statistics"],
        misconceptionTags: ["average hides spread"],
        prompt:
          "Two classes have the same mean test score. What extra information is most useful before comparing consistency?",
        options: [
          "A. The unit title",
          "B. A measure of spread such as SD or IQR",
          "C. The color of the graph",
          "D. The page number in the notes"
        ],
        correctIndex: 1,
        explanation:
          "Equal means can hide very different variability. Spread helps describe consistency."
      },
      {
        id: "unit02-outlier-claim",
        type: "trueFalse",
        title: "Outlier claim",
        practiceKind: "claim",
        conceptIds: ["descriptive-statistics"],
        misconceptionTags: ["automatic outlier removal"],
        prompt:
          "An outlier should always be deleted before calculating a summary statistic.",
        correctAnswer: false,
        explanation:
          "An outlier needs investigation. It may be an error, but it may also be scientifically meaningful."
      },
      {
        id: "unit02-range",
        type: "numeric",
        title: "Range",
        practiceKind: "output",
        conceptIds: ["descriptive-statistics"],
        prompt: "The values are 4, 7, 9, 13, and 15. What is the range?",
        acceptedAnswer: 11,
        tolerance: 0,
        explanation: "Range = largest value - smallest value = 15 - 4 = 11."
      }
    ]
  },
  {
    unitSlug: "unit-03",
    title: "Interactive exercises",
    intro:
      "Check whether you can connect distributions to data-generating processes.",
    conceptIds: ["data-generating-processes", "sampling-distribution"],
    recommendedSimulationSlugs: ["sampling-distribution"],
    exercises: [
      {
        id: "unit03-distribution-model",
        type: "multipleChoice",
        title: "Distribution as model",
        practiceKind: "conceptual",
        conceptIds: ["data-generating-processes"],
        misconceptionTags: ["distribution as decoration"],
        prompt: "What does a distribution model mainly describe?",
        options: [
          "A. How values could arise from a process",
          "B. The exact order of collected values",
          "C. The title of a figure",
          "D. A guarantee that every sample is symmetric"
        ],
        correctIndex: 0,
        explanation:
          "A distribution model describes possible values and their relative frequency under a process."
      },
      {
        id: "unit03-normal-perfect",
        type: "trueFalse",
        title: "Normal model",
        practiceKind: "claim",
        conceptIds: ["data-generating-processes"],
        misconceptionTags: ["perfect normality required"],
        prompt:
          "A normal model can be useful only when the observed data are perfectly bell-shaped.",
        correctAnswer: false,
        explanation:
          "Models are approximations. The question is whether the approximation is useful enough for the claim."
      },
      {
        id: "unit03-sampling-variable",
        type: "multipleChoice",
        title: "Repeated samples",
        practiceKind: "output",
        conceptIds: ["sampling-distribution"],
        prompt:
          "If you repeatedly sample from the same population, what usually changes from sample to sample?",
        options: [
          "A. The population mean",
          "B. The sample mean",
          "C. The definition of the variable",
          "D. The null hypothesis automatically"
        ],
        correctIndex: 1,
        explanation:
          "The population mean is fixed in the model, but each sample mean varies because the sampled observations vary."
      }
    ]
  },
  {
    unitSlug: "unit-04",
    title: "Interactive exercises",
    intro:
      "Check whether you can connect design choices to evidence quality.",
    conceptIds: ["experimental-design", "sample-size"],
    recommendedSimulationSlugs: ["sampling-distribution"],
    exercises: [
      {
        id: "unit04-bias-sample-size",
        type: "multipleChoice",
        title: "Bias and sample size",
        practiceKind: "conceptual",
        conceptIds: ["experimental-design", "sample-size"],
        misconceptionTags: ["large sample fixes bias"],
        prompt:
          "A study uses a large sample, but all measurements come from one biased source. What is the main concern?",
        options: [
          "A. The large sample automatically removes bias",
          "B. The sample may still support a biased conclusion",
          "C. The sample size must be ignored",
          "D. The mean cannot be calculated"
        ],
        correctIndex: 1,
        explanation:
          "Large samples reduce random variation, but they do not remove systematic bias from the design."
      },
      {
        id: "unit04-randomisation",
        type: "trueFalse",
        title: "Randomisation",
        practiceKind: "claim",
        conceptIds: ["experimental-design"],
        prompt:
          "Random assignment helps make groups more comparable before treatment is applied.",
        correctAnswer: true,
        explanation:
          "Random assignment reduces systematic differences between treatment groups at the start."
      },
      {
        id: "unit04-standard-error-change",
        type: "numeric",
        title: "Standard error change",
        practiceKind: "output",
        conceptIds: ["sample-size", "sampling-distribution"],
        prompt:
          "If population SD is 12 and n = 16, what is the expected standard error?",
        acceptedAnswer: 3,
        tolerance: 0.05,
        unitLabel: "SE",
        explanation: "SE = sigma / sqrt(n) = 12 / sqrt(16) = 3."
      }
    ]
  },
  {
    unitSlug: "unit-06",
    title: "Interactive exercises",
    intro:
      "Check whether you can compare two groups without hiding effect size or assumptions.",
    conceptIds: ["two-group-comparison", "effect-size", "confidence-intervals"],
    recommendedSimulationSlugs: ["confidence-intervals", "p-value-null-model"],
    exercises: [
      {
        id: "unit06-effect-size",
        type: "multipleChoice",
        title: "Effect size",
        practiceKind: "conceptual",
        conceptIds: ["effect-size", "two-group-comparison"],
        misconceptionTags: ["significance equals importance"],
        prompt:
          "Two treatments differ by 0.1 units with p = 0.01. What should a careful conclusion still discuss?",
        options: [
          "A. Whether the effect size is scientifically meaningful",
          "B. Why p = 0.01 proves the mechanism",
          "C. Why uncertainty no longer matters",
          "D. Why the groups must be identical"
        ],
        correctIndex: 0,
        explanation:
          "A small p-value does not by itself show that the difference is important in context."
      },
      {
        id: "unit06-ci-zero",
        type: "trueFalse",
        title: "Interval excluding zero",
        practiceKind: "claim",
        conceptIds: ["confidence-intervals"],
        prompt:
          "If a confidence interval for a mean difference excludes zero, the data are consistent with a non-zero difference under the model.",
        correctAnswer: true,
        explanation:
          "This is a cautious interpretation. It does not claim certainty or practical importance by itself."
      },
      {
        id: "unit06-difference",
        type: "numeric",
        title: "Mean difference",
        practiceKind: "output",
        conceptIds: ["two-group-comparison", "effect-size"],
        prompt: "Group A has mean 18.4 and Group B has mean 15.9. What is A - B?",
        acceptedAnswer: 2.5,
        tolerance: 0.05,
        explanation: "The estimated difference is 18.4 - 15.9 = 2.5."
      }
    ]
  },
  {
    unitSlug: "unit-07",
    title: "Interactive exercises",
    intro:
      "Check whether you can reason about several groups without cherry-picking comparisons.",
    conceptIds: ["group-comparison", "effect-size", "model-assumptions"],
    recommendedSimulationSlugs: ["confidence-intervals"],
    exercises: [
      {
        id: "unit07-between-within",
        type: "multipleChoice",
        title: "Between and within",
        practiceKind: "conceptual",
        conceptIds: ["group-comparison"],
        prompt:
          "Several-group methods compare between-group differences with what other source of variation?",
        options: [
          "A. Within-group variation",
          "B. The file name",
          "C. The number of graph colors",
          "D. The order of unit chapters"
        ],
        correctIndex: 0,
        explanation:
          "Large between-group differences are more convincing when within-group variation is small."
      },
      {
        id: "unit07-many-tests",
        type: "trueFalse",
        title: "Many tests",
        practiceKind: "claim",
        conceptIds: ["group-comparison", "p-values"],
        misconceptionTags: ["multiple comparisons ignored"],
        prompt:
          "Trying many pairwise tests and reporting only the smallest p-value is a safe analysis strategy.",
        correctAnswer: false,
        explanation:
          "Multiple testing increases the chance of finding a small p-value by chance unless the analysis accounts for it."
      },
      {
        id: "unit07-group-count",
        type: "numeric",
        title: "Pair count",
        practiceKind: "output",
        conceptIds: ["group-comparison"],
        prompt: "With 4 groups, how many pairwise comparisons are possible?",
        acceptedAnswer: 6,
        tolerance: 0,
        explanation: "There are 4 x 3 / 2 = 6 unique pairs."
      }
    ]
  },
  {
    unitSlug: "unit-08",
    title: "Interactive exercises",
    intro:
      "Check whether you can interpret categorical evidence from counts rather than percentages alone.",
    conceptIds: ["categorical-data", "p-values", "model-assumptions"],
    recommendedSimulationSlugs: ["p-value-null-model"],
    exercises: [
      {
        id: "unit08-counts-percentages",
        type: "multipleChoice",
        title: "Counts matter",
        practiceKind: "conceptual",
        conceptIds: ["categorical-data"],
        misconceptionTags: ["percentage without counts"],
        prompt:
          "Why should a categorical comparison report counts as well as percentages?",
        options: [
          "A. Counts show how much information supports the percentage",
          "B. Counts are never needed",
          "C. Percentages are always wrong",
          "D. Counts remove all uncertainty"
        ],
        correctIndex: 0,
        explanation:
          "A percentage based on 2 of 4 cases is less stable than the same percentage based on 200 of 400."
      },
      {
        id: "unit08-expected-counts",
        type: "trueFalse",
        title: "Expected counts",
        practiceKind: "claim",
        conceptIds: ["categorical-data", "model-assumptions"],
        prompt:
          "Very small expected counts can make some chi-square approximations unreliable.",
        correctAnswer: true,
        explanation:
          "The approximation depends on having enough expected count in the table cells."
      },
      {
        id: "unit08-proportion",
        type: "numeric",
        title: "Proportion",
        practiceKind: "output",
        conceptIds: ["categorical-data"],
        prompt: "In a sample of 80, 20 show the trait. What proportion show the trait?",
        acceptedAnswer: 0.25,
        tolerance: 0.001,
        explanation: "Proportion = 20 / 80 = 0.25."
      }
    ]
  },
  {
    unitSlug: "unit-09",
    title: "Interactive exercises",
    intro:
      "Check whether you can describe relationships without overstating causation.",
    conceptIds: ["correlation-regression", "effect-size", "model-assumptions"],
    recommendedSimulationSlugs: [],
    exercises: [
      {
        id: "unit09-correlation-causation",
        type: "multipleChoice",
        title: "Correlation and causation",
        practiceKind: "conceptual",
        conceptIds: ["correlation-regression"],
        misconceptionTags: ["correlation proves causation"],
        prompt: "A strong correlation is best described as evidence of what?",
        options: [
          "A. Association between variables",
          "B. Guaranteed causation",
          "C. No relationship",
          "D. Perfect prediction for every future case"
        ],
        correctIndex: 0,
        explanation:
          "Correlation describes association. Causal claims require design, mechanism, and alternative explanations."
      },
      {
        id: "unit09-residuals",
        type: "trueFalse",
        title: "Residuals",
        practiceKind: "claim",
        conceptIds: ["correlation-regression", "model-assumptions"],
        prompt:
          "Residual patterns can reveal when a straight-line model is a poor description.",
        correctAnswer: true,
        explanation:
          "Curvature, changing spread, or clusters in residuals can signal a model mismatch."
      },
      {
        id: "unit09-slope",
        type: "numeric",
        title: "Slope",
        practiceKind: "output",
        conceptIds: ["correlation-regression"],
        prompt:
          "A fitted line changes from y = 10 to y = 16 when x increases by 3. What is the slope?",
        acceptedAnswer: 2,
        tolerance: 0.05,
        explanation: "Slope = change in y / change in x = 6 / 3 = 2."
      }
    ]
  },
  {
    unitSlug: "unit-10",
    title: "Interactive exercises",
    intro:
      "Check whether you can keep model diagnostics connected to claim strength.",
    conceptIds: ["model-assumptions", "data-generating-processes", "statistical-conclusions"],
    recommendedSimulationSlugs: ["confidence-intervals", "p-value-null-model"],
    exercises: [
      {
        id: "unit10-assumption-purpose",
        type: "multipleChoice",
        title: "Assumption checks",
        practiceKind: "conceptual",
        conceptIds: ["model-assumptions"],
        prompt: "What is the main purpose of checking model assumptions?",
        options: [
          "A. To judge whether the model supports the intended claim",
          "B. To make the conclusion automatically true",
          "C. To avoid reporting uncertainty",
          "D. To remove all variation from data"
        ],
        correctIndex: 0,
        explanation:
          "Assumption checks help decide whether the model is reasonable enough for the claim."
      },
      {
        id: "unit10-one-check",
        type: "trueFalse",
        title: "One check",
        practiceKind: "claim",
        conceptIds: ["model-assumptions"],
        misconceptionTags: ["single diagnostic proves model"],
        prompt:
          "Passing one diagnostic check proves that every conclusion from the model is valid.",
        correctAnswer: false,
        explanation:
          "Diagnostics provide evidence about model fit, but no single check validates every possible conclusion."
      },
      {
        id: "unit10-conclusion-boundary",
        type: "multipleChoice",
        title: "Conclusion boundary",
        practiceKind: "claim",
        conceptIds: ["statistical-conclusions", "model-assumptions"],
        prompt: "Which phrase best keeps a model-based claim bounded?",
        options: [
          "A. Under this model and these assumptions",
          "B. With absolute certainty",
          "C. No uncertainty remains",
          "D. The data prove the mechanism"
        ],
        correctIndex: 0,
        explanation:
          "This wording reminds the reader that the conclusion depends on the model and assumptions."
      }
    ]
  },
  {
    unitSlug: "unit-11",
    title: "Interactive exercises",
    intro:
      "Check whether you can write statistical conclusions that stay defensible.",
    conceptIds: ["statistical-conclusions", "p-values", "confidence-intervals"],
    recommendedSimulationSlugs: ["confidence-intervals", "p-value-null-model"],
    exercises: [
      {
        id: "unit11-defensible-wording",
        type: "multipleChoice",
        title: "Defensible wording",
        practiceKind: "claim",
        conceptIds: ["statistical-conclusions"],
        prompt:
          "Which conclusion is most defensible after a small study finds p = 0.06?",
        options: [
          "A. The null hypothesis is proven true",
          "B. The result is not strong evidence by a 0.05 rule, and uncertainty remains",
          "C. The treatment has no possible effect",
          "D. The experiment should be ignored"
        ],
        correctIndex: 1,
        explanation:
          "A cautious conclusion reports evidence strength without claiming proof of no effect."
      },
      {
        id: "unit11-assumptions-mentioned",
        type: "trueFalse",
        title: "Assumptions in conclusions",
        practiceKind: "conceptual",
        conceptIds: ["statistical-conclusions", "model-assumptions"],
        prompt:
          "A statistical conclusion is stronger when it names important assumptions and limitations.",
        correctAnswer: true,
        explanation:
          "Assumptions and limitations define the boundary of what the evidence can support."
      },
      {
        id: "unit11-claim-classifier",
        type: "classifyClaim",
        title: "Classify conclusion claims",
        practiceKind: "claim",
        conceptIds: ["statistical-conclusions", "p-values", "confidence-intervals"],
        prompt: "Classify each conclusion as Defensible, Too strong, or Wrong.",
        labels: ["Defensible", "Too strong", "Wrong"],
        claims: [
          {
            text: "The confidence interval suggests the effect could plausibly be between 1.2 and 4.8 units under the model.",
            correctLabel: "Defensible",
            explanation:
              "This wording treats the interval as model-based uncertainty, not certainty."
          },
          {
            text: "Because p = 0.04, there is a 96% probability that the alternative hypothesis is true.",
            correctLabel: "Wrong",
            explanation:
              "A p-value is calculated under the null model; it is not the probability of the alternative."
          },
          {
            text: "The result is statistically significant, so the treatment must be important in practice.",
            correctLabel: "Too strong",
            explanation:
              "Practical importance depends on effect size, context, uncertainty, and costs."
          }
        ]
      }
    ]
  }
];
