import type { ExerciseSet } from "./types";
import { supplementalExerciseSets } from "./supplemental";
import { unit01ExerciseSet } from "./unit01";
import { unit05ExerciseSet } from "./unit05";

const exerciseSetsByUnitSlug = new Map<string, ExerciseSet>([
  [unit01ExerciseSet.unitSlug, unit01ExerciseSet],
  ...supplementalExerciseSets.map((exerciseSet) => [
    exerciseSet.unitSlug,
    exerciseSet
  ] as const),
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
  PracticeKind,
  TrueFalseExercise
} from "./types";
