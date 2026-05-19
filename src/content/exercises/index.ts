import type { ExerciseSet } from "./types";
import { unit05ExerciseSet } from "./unit05";

const exerciseSetsByUnitSlug = new Map<string, ExerciseSet>([
  [unit05ExerciseSet.unitSlug, unit05ExerciseSet]
]);

export function getExerciseSetForUnit(slug: string): ExerciseSet | null {
  return exerciseSetsByUnitSlug.get(slug) ?? null;
}

export type {
  ClaimClassifierExercise,
  Exercise,
  ExerciseSet,
  MultipleChoiceExercise,
  NumericExercise,
  TrueFalseExercise
} from "./types";
