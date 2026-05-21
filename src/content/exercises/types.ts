import type { ConceptId } from "@/content/concepts";

export type PracticeKind = "conceptual" | "claim" | "output";

export type ExerciseMetadata = {
  conceptIds?: ConceptId[];
  misconceptionTags?: string[];
  practiceKind?: PracticeKind;
};

export type MultipleChoiceExercise = {
  id: string;
  type: "multipleChoice";
  title: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
} & ExerciseMetadata;

export type TrueFalseExercise = {
  id: string;
  type: "trueFalse";
  title: string;
  prompt: string;
  correctAnswer: boolean;
  explanation: string;
} & ExerciseMetadata;

export type NumericExercise = {
  id: string;
  type: "numeric";
  title: string;
  prompt: string;
  acceptedAnswer: number;
  tolerance: number;
  unitLabel?: string;
  explanation: string;
} & ExerciseMetadata;

export type ClaimClassification = {
  text: string;
  correctLabel: string;
  explanation: string;
};

export type ClaimClassifierExercise = {
  id: string;
  type: "classifyClaim";
  title: string;
  prompt: string;
  labels: string[];
  claims: ClaimClassification[];
} & ExerciseMetadata;

export type Exercise =
  | MultipleChoiceExercise
  | TrueFalseExercise
  | NumericExercise
  | ClaimClassifierExercise;

export type ExerciseSet = {
  unitSlug: string;
  title: string;
  intro: string;
  conceptIds?: ConceptId[];
  recommendedSimulationSlugs?: string[];
  exercises: Exercise[];
};
