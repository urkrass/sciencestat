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

function getActiveIndexStorageKey(unitSlug: string) {
  return `sciencestat:exercises:${unitSlug}:activeIndex`;
}

export function ExerciseBlock({ exerciseSet }: ExerciseBlockProps) {
  const [exerciseState, setExerciseState] = useState<ExerciseStateById>({});
  const [activeIndex, setActiveIndex] = useState(0);
  const [hasLoadedStorage, setHasLoadedStorage] = useState(false);
  const storageKey = getStorageKey(exerciseSet.unitSlug);
  const activeIndexStorageKey = getActiveIndexStorageKey(exerciseSet.unitSlug);
  const exerciseCount = exerciseSet.exercises.length;

  useEffect(() => {
    try {
      const savedState = window.localStorage.getItem(storageKey);
      const savedActiveIndex = window.localStorage.getItem(activeIndexStorageKey);

      if (savedState) {
        const parsedState: unknown = JSON.parse(savedState);

        if (isExerciseStateById(parsedState)) {
          setExerciseState(parsedState);
        }
      }

      if (savedActiveIndex) {
        const parsedActiveIndex = Number(savedActiveIndex);

        if (Number.isInteger(parsedActiveIndex)) {
          setActiveIndex(Math.min(Math.max(parsedActiveIndex, 0), exerciseSet.exercises.length));
        }
      }
    } catch {
      // Progress persistence is optional; exercises still work without storage.
    } finally {
      setHasLoadedStorage(true);
    }
  }, [activeIndexStorageKey, exerciseSet.exercises.length, storageKey]);

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

  useEffect(() => {
    if (!hasLoadedStorage) {
      return;
    }

    try {
      if (activeIndex === 0 && Object.keys(exerciseState).length === 0) {
        window.localStorage.removeItem(activeIndexStorageKey);
        return;
      }

      window.localStorage.setItem(activeIndexStorageKey, String(activeIndex));
    } catch {
      // Active question persistence is optional.
    }
  }, [activeIndex, activeIndexStorageKey, exerciseState, hasLoadedStorage]);

  const checkedCount = useMemo(
    () =>
      exerciseSet.exercises.reduce(
        (count, exercise) => count + (exerciseState[exercise.id]?.checked ? 1 : 0),
        0
      ),
    [exerciseSet.exercises, exerciseState]
  );

  const correctCount = useMemo(
    () =>
      exerciseSet.exercises.reduce(
        (count, exercise) => count + (exerciseState[exercise.id]?.correct ? 1 : 0),
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
    setActiveIndex(0);

    try {
      window.localStorage.removeItem(storageKey);
      window.localStorage.removeItem(activeIndexStorageKey);
    } catch {
      // Reset should still clear in-memory progress when storage is unavailable.
    }
  };

  const goToPrevious = () => {
    setActiveIndex((currentIndex) => Math.max(currentIndex - 1, 0));
  };

  const goToNext = () => {
    setActiveIndex((currentIndex) => Math.min(currentIndex + 1, exerciseCount));
  };

  const reviewAnswers = () => {
    setActiveIndex(0);
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

  const isComplete = activeIndex >= exerciseCount;
  const activeExercise = isComplete ? null : exerciseSet.exercises[activeIndex];
  const questionNumber = Math.min(activeIndex + 1, exerciseCount);
  const progressValue = isComplete ? 100 : (questionNumber / exerciseCount) * 100;

  return (
    <section
      aria-labelledby={`${exerciseSet.unitSlug}-exercises-heading`}
      className="relative flex min-h-[42rem] flex-col overflow-hidden rounded-lg border border-line bg-paper"
    >
      <div aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-moss/20">
        <div
          className="h-full bg-moss transition-[width] duration-200"
          style={{ width: `${progressValue}%` }}
        />
      </div>

      <div className="flex items-center justify-between gap-3 px-5 pt-5 sm:px-7">
        <div className="min-w-0">
          <h2
            id={`${exerciseSet.unitSlug}-exercises-heading`}
            className="text-sm font-semibold uppercase tracking-[0.14em] text-moss"
          >
            {exerciseSet.title}
          </h2>
          <p className="sr-only">{exerciseSet.intro}</p>
        </div>
        <div className="flex shrink-0 items-center gap-3">
          <p className="hidden text-sm font-medium text-slate-500 sm:block" aria-live="polite">
            {checkedCount}/{exerciseSet.exercises.length} checked
          </p>
          <button
            type="button"
            onClick={resetExercises}
            className="inline-flex h-9 items-center justify-center rounded-md border border-line bg-white/70 px-3 text-sm font-medium text-ink transition hover:border-moss hover:text-moss"
          >
            Reset
          </button>
        </div>
      </div>

      <div className="flex min-h-0 flex-1 flex-col">
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-10 sm:px-7 sm:py-14">
          <div className="mx-auto w-full max-w-3xl">
            <p className="mb-6 text-base font-semibold text-moss" aria-live="polite">
              {isComplete ? "Complete" : `${questionNumber} ->`}
              {!isComplete ? (
                <span className="ml-2 text-sm font-medium text-slate-500">
                  Question {questionNumber} of {exerciseCount}
                </span>
              ) : null}
            </p>
          {activeExercise ? (
            renderExercise(activeExercise)
          ) : (
            <div className="flex min-h-[22rem] flex-col items-start justify-center">
              <h3 className="text-3xl font-semibold text-ink">Practice complete</h3>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                You checked {checkedCount} of {exerciseCount} questions and marked{" "}
                {correctCount} correct. You can review your responses or reset the
                practice set.
              </p>
              <div className="mt-6 flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={reviewAnswers}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-moss bg-moss px-4 text-sm font-medium text-white transition hover:bg-moss-dark"
                >
                  Review answers
                </button>
                <button
                  type="button"
                  onClick={resetExercises}
                  className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-medium text-ink transition hover:border-moss hover:text-moss"
                >
                  Reset exercises
                </button>
              </div>
            </div>
          )}
          </div>
        </div>

        {!isComplete && activeExercise ? (
          <div className="flex flex-col gap-3 border-t border-line bg-white/45 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-7">
            <button
              type="button"
              onClick={goToPrevious}
              disabled={activeIndex === 0}
              className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-medium text-ink transition hover:border-moss hover:text-moss disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            >
              Back
            </button>
            <p className="text-sm text-slate-500">
              {exerciseState[activeExercise.id]?.checked
                ? `${exerciseState[activeExercise.id]?.correct ? "Correct" : "Not quite"}`
                : `${correctCount} correct after checking`}
            </p>
            <button
              type="button"
              onClick={goToNext}
              className="inline-flex h-10 items-center justify-center rounded-md border border-moss bg-moss px-4 text-sm font-medium text-white transition hover:bg-moss-dark"
            >
              {activeIndex === exerciseCount - 1 ? "Finish" : "Next"}
            </button>
          </div>
        ) : null}
      </div>
    </section>
  );
}
