import type { ExerciseSet } from "./types";

export const unit01ExerciseSet: ExerciseSet = {
  unitSlug: "unit-01",
  title: "Interactive exercises",
  intro:
    "Use these checks to test whether you can reason about measurement, uncertainty, and defensible scientific wording.",
  conceptIds: ["measurement-uncertainty", "statistical-conclusions"],
  recommendedSimulationSlugs: [],
  exercises: [
    {
      id: "unit01-precision-accuracy",
      type: "multipleChoice",
      title: "Precision and accuracy",
      prompt:
        "A student measures the mass of a 10.00 g standard three times and obtains 9.81 g, 9.82 g, and 9.81 g. Which description is most defensible?",
      options: [
        "A. The measurements are precise and accurate.",
        "B. The measurements are precise but not accurate.",
        "C. The measurements are accurate but not precise.",
        "D. The measurements are neither precise nor accurate."
      ],
      correctIndex: 1,
      explanation:
        "The repeated values are close to each other, so they are precise. However, they are consistently below the accepted value of 10.00 g, so they are not accurate."
    },
    {
      id: "unit01-systematic-error",
      type: "trueFalse",
      title: "Systematic error",
      prompt:
        "A balance that always reads 0.20 g too high mainly introduces random error.",
      correctAnswer: false,
      explanation:
        "A consistent offset is a systematic error. Random error causes scatter; systematic error shifts results in one direction."
    },
    {
      id: "unit01-percentage-uncertainty",
      type: "numeric",
      title: "Percentage uncertainty",
      prompt:
        "A volume is recorded as 25.0 mL using apparatus with an uncertainty of ±0.5 mL. Calculate the percentage uncertainty.",
      acceptedAnswer: 2,
      tolerance: 0.05,
      unitLabel: "%",
      explanation:
        "Percentage uncertainty = absolute uncertainty / measured value × 100 = 0.5 / 25.0 × 100 = 2.0%."
    },
    {
      id: "unit01-significant-figures",
      type: "multipleChoice",
      title: "Significant figures and reporting",
      prompt:
        "A calculator gives 12.347892 for a result based on measurements recorded to three significant figures. Which reported value is usually most defensible?",
      options: ["A. 12.347892", "B. 12.35", "C. 12.3", "D. 10"],
      correctIndex: 2,
      explanation:
        "A calculated result should not imply more precision than the measurements support. Three significant figures gives 12.3."
    },
    {
      id: "unit01-classify-claims",
      type: "classifyClaim",
      title: "Classify measurement claims",
      prompt: "Classify each statement as Defensible, Too strong, or Wrong.",
      labels: ["Defensible", "Too strong", "Wrong"],
      claims: [
        {
          text: "The repeated measurements were close together, so the method was precise.",
          correctLabel: "Defensible",
          explanation: "Precision refers to the closeness of repeated measurements."
        },
        {
          text: "The result is precise, so it must also be accurate.",
          correctLabel: "Wrong",
          explanation:
            "Precision and accuracy are different. Repeated values can be close together but consistently far from the accepted value."
        },
        {
          text: "The value 8.40 ± 0.05 cm suggests the measured length is probably near 8.40 cm, within the resolution limits of the apparatus.",
          correctLabel: "Defensible",
          explanation:
            "This wording connects the result to uncertainty without overstating certainty."
        },
        {
          text: "The uncertainty is small, so there is no measurement error.",
          correctLabel: "Wrong",
          explanation:
            "Small uncertainty does not mean zero error. It means the expected range of measurement variation is smaller."
        }
      ]
    },
    {
      id: "unit01-defensible-conclusion",
      type: "multipleChoice",
      title: "Defensible conclusion",
      prompt:
        "A student obtains 4.8 g, 5.1 g, and 5.0 g for repeated measurements of the same sample. The accepted value is 5.0 g. Which conclusion is best?",
      options: [
        "A. The measurements prove the true mass is exactly 5.0 g.",
        "B. The measurements are reasonably close to the accepted value, but the scatter should be considered when reporting the result.",
        "C. The first measurement must be deleted because it is lower than the others.",
        "D. The experiment has no uncertainty because the average is close to 5.0 g."
      ],
      correctIndex: 1,
      explanation:
        "The data are close to the accepted value, but repeated measurements still show variation. A defensible conclusion mentions both agreement and uncertainty."
    }
  ]
};
