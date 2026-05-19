export type MultipleChoiceExercise = {
  id: string;
  type: "multipleChoice";
  title: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

export type TrueFalseExercise = {
  id: string;
  type: "trueFalse";
  title: string;
  prompt: string;
  correctAnswer: boolean;
  explanation: string;
};

export type NumericExercise = {
  id: string;
  type: "numeric";
  title: string;
  prompt: string;
  acceptedAnswer: number;
  tolerance: number;
  unitLabel?: string;
  explanation: string;
};

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
};

export type Exercise =
  | MultipleChoiceExercise
  | TrueFalseExercise
  | NumericExercise
  | ClaimClassifierExercise;

export type ExerciseSet = {
  unitSlug: string;
  title: string;
  intro: string;
  exercises: Exercise[];
};
