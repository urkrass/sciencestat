import type { ExerciseSet } from "./types";

export const unit05ExerciseSet: ExerciseSet = {
  unitSlug: "unit-05",
  title: "Interactive exercises",
  intro:
    "Use these checks to test whether you can interpret p-values and confidence intervals without reversing the logic.",
  conceptIds: ["p-values", "confidence-intervals", "model-assumptions"],
  recommendedSimulationSlugs: ["confidence-intervals", "p-value-null-model"],
  exercises: [
    {
      id: "unit05-pvalue-meaning",
      type: "multipleChoice",
      title: "What does a p-value mean?",
      prompt:
        "A student obtains p = 0.03 in a test of the null hypothesis. Which interpretation is most defensible?",
      options: [
        "A. There is a 3% probability that the null hypothesis is true.",
        "B. If the null hypothesis were true, results at least this extreme would occur about 3% of the time.",
        "C. There is a 97% probability that the alternative hypothesis is true.",
        "D. The experiment has a 3% probability of being wrong."
      ],
      correctIndex: 1,
      explanation:
        "A p-value is conditional on the null model. It is not the probability that the null hypothesis is true."
    },
    {
      id: "unit05-misuse-check",
      type: "trueFalse",
      title: "Misuse check",
      prompt:
        "A p-value tells us the probability that the observed result happened by random chance.",
      correctAnswer: false,
      explanation:
        "This wording is too loose. A p-value is the probability of obtaining results at least as extreme as the observed result, assuming the null hypothesis and test assumptions are true."
    },
    {
      id: "unit05-standard-error",
      type: "numeric",
      title: "Standard error",
      prompt:
        "A sample has standard deviation SD = 12 and sample size n = 36. Calculate the standard error of the mean.",
      acceptedAnswer: 2,
      tolerance: 0.05,
      unitLabel: "SE",
      explanation: "SE = SD / sqrt(n) = 12 / sqrt(36) = 12 / 6 = 2."
    },
    {
      id: "unit05-confidence-interval",
      type: "multipleChoice",
      title: "Confidence interval interpretation",
      prompt:
        "A 95% confidence interval for the mean difference is [1.2, 4.8]. Which statement is best?",
      options: [
        "A. There is a 95% probability that this exact interval contains the true mean difference.",
        "B. The data are compatible with mean differences from 1.2 to 4.8 under the method used.",
        "C. 95% of individual observations lie between 1.2 and 4.8.",
        "D. The null hypothesis is false with 95% certainty."
      ],
      correctIndex: 1,
      explanation:
        "In frequentist statistics, the interval is produced by a method that captures the true parameter in 95% of repeated samples. The specific computed interval is not usually described as having a 95% probability."
    },
    {
      id: "unit05-classify-claims",
      type: "classifyClaim",
      title: "Classify statistical claims",
      prompt:
        "Classify each statistical statement as Defensible, Too strong, or Wrong.",
      labels: ["Defensible", "Too strong", "Wrong"],
      claims: [
        {
          text: "The result was statistically significant, so the effect is important.",
          correctLabel: "Too strong",
          explanation:
            "Statistical significance does not automatically imply practical or biological importance. Effect size and context are needed."
        },
        {
          text: "The p-value was 0.04, so the data would be somewhat unusual if the null model were true.",
          correctLabel: "Defensible",
          explanation: "This keeps the conditional logic of the p-value."
        },
        {
          text: "The p-value was 0.04, so there is a 4% probability that the null hypothesis is true.",
          correctLabel: "Wrong",
          explanation: "This reverses the conditional probability."
        },
        {
          text: "The confidence interval excludes zero, so the result is consistent with a non-zero effect under this model.",
          correctLabel: "Defensible",
          explanation: "This is cautious and model-aware."
        }
      ]
    },
    {
      id: "unit05-better-conclusion",
      type: "multipleChoice",
      title: "Choose the better conclusion",
      prompt:
        "An experiment comparing two treatments gives p = 0.08 and a small effect size. Which conclusion is best?",
      options: [
        "A. The treatments are identical.",
        "B. The null hypothesis is proven true.",
        "C. The data do not provide strong evidence for a difference; the estimated effect is small in this sample.",
        "D. The experiment failed and should be ignored."
      ],
      correctIndex: 2,
      explanation:
        "A non-significant result does not prove no effect. The conclusion should mention evidence strength, effect size, and uncertainty."
    }
  ]
};
