"use client";

import { useEffect, useMemo, useState } from "react";
import type { Exercise, ExerciseSet } from "@/content/exercises";
import { ClaimClassifierExercise } from "./ClaimClassifierExercise";
import { MultipleChoiceExercise } from "./MultipleChoiceExercise";
import { NumericExercise } from "./NumericExercise";
import { TrueFalseExercise } from "./TrueFalseExercise";

type ExerciseAnswerState = {
  checked?: boolean;
  claimAnswers?: Record<string, string>;
  correct?: boolean;
  numericAnswer?: string;
  selectedAnswer?: boolean;
  selectedIndex?: number;
};

type ExerciseStateById = Record<string, ExerciseAnswerState>;

type ExerciseBlockProps = {
  exerciseSet: ExerciseSet;
};

function isExerciseStateById(value: unknown): value is ExerciseStateById {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getStorageKey(unitSlug: string) {
  return `sciencestat:exercises:${unitSlug}`;
}

export function ExerciseBlock({ exerciseSet }: ExerciseBlockProps) {
  const [exerciseState, setExerciseState] = useState<ExerciseStateById>({});
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const storageKey = getStorageKey(exerciseSet.unitSlug);

  useEffect(() => {
    try {
      const savedState = window.localStorage.getItem(storageKey);

      if (savedState) {
        const parsedState: unknown = JSON.parse(savedState);

        if (isExerciseStateById(parsedState)) {
          setExerciseState(parsedState);
        }
      }
    } catch {
      // Progress persistence is optional; exercises still work without storage.
    } finally {
      setHasLoadedStorage(true);
    }
  }, [storageKey]);

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    try {
      if (Object.keys(exerciseState).length === 0) {
        window.localStorage.removeItem(storageKey);
        return;
      }

      window.localStorage.setItem(storageKey, JSON.stringify(exerciseState));
    } catch {
      // Ignore storage failures so private browsing or blocked storage does not break exercises.
    }
  }, [exerciseState, hasLoadedStorage, storageKey]);

  const checkedCount = useMemo(
    () =>
      exerciseSet.exercises.reduce(
        (count, exercise) => count + (exerciseState[exercise.id]?.checked ? 1 : 0),
        0
      ),
    [exerciseSet.exercises, exerciseState]
  );

  const updateExerciseState = (exerciseId: string, patch: Partial<ExerciseAnswerState>) => {
    setExerciseState((currentState) => ({
      ...currentState,
      [exerciseId]: {
        ...currentState[exerciseId],
        ...patch
      }
    }));
  };

  const markExerciseChecked = (exerciseId: string, correct: boolean) => {
    updateExerciseState(exerciseId, {
      checked: true,
      correct
    });
  };

  const tryExerciseAgain = (exerciseId: string) => {
    updateExerciseState(exerciseId, {
      checked: false,
      correct: undefined
    });
  };

  const resetExercises = () => {
    setExerciseState({});

    try {
      window.localStorage.removeItem(storageKey);
    } catch {
      // Reset should still clear in-memory progress when storage is unavailable.
    }
  };

  const renderExercise = (exercise: Exercise) => {
    const state = exerciseState[exercise.id] ?? {};
    const sharedProps = {
      onChange: (patch: Partial<ExerciseAnswerState>) =>
        updateExerciseState(exercise.id, patch),
      onCheck: (correct: boolean) => markExerciseChecked(exercise.id, correct),
      onTryAgain: () => tryExerciseAgain(exercise.id),
      state
    };

    switch (exercise.type) {
      case "multipleChoice":
        return (
          <MultipleChoiceExercise
            key={exercise.id}
            exercise={exercise}
            {...sharedProps}
          />
        );
      case "trueFalse":
        return (
          <TrueFalseExercise key={exercise.id} exercise={exercise} {...sharedProps} />
        );
      case "numeric":
        return <NumericExercise key={exercise.id} exercise={exercise} {...sharedProps} />;
      case "classifyClaim":
        return (
          <ClaimClassifierExercise
            key={exercise.id}
            exercise={exercise}
            {...sharedProps}
          />
        );
    }
  };

  return (
    <section
      aria-labelledby={`${exerciseSet.unitSlug}-exercises-heading`}
      className="rounded-lg border border-line bg-paper/80 p-5 shadow-sm sm:p-7"
    >
      <div className="flex flex-col gap-4 border-b border-line pb-5 md:flex-row md:items-start md:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
            Practice
          </p>
          <h2
            id={`${exerciseSet.unitSlug}-exercises-heading`}
            className="mt-2 text-2xl font-semibold text-ink"
          >
            {exerciseSet.title}
          </h2>
          <p className="mt-3 max-w-3xl leading-7 text-slate-600">{exerciseSet.intro}</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-3">
          <p className="text-sm font-medium text-slate-600" aria-live="polite">
            {checkedCount} of {exerciseSet.exercises.length} checked
          </p>
          <button
            type="button"
            onClick={resetExercises}
            className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-medium text-ink transition hover:border-moss hover:text-moss"
          >
            Reset exercises
          </button>
        </div>
      </div>

      <div className="mt-5 space-y-4">{exerciseSet.exercises.map(renderExercise)}</div>
    </section>
  );
}
