"use client";

import type { MultipleChoiceExercise as MultipleChoiceExerciseData } from "@/content/exercises";

type MultipleChoiceAnswerState = {
  checked?: boolean;
  correct?: boolean;
  selectedIndex?: number;
};

type MultipleChoiceExerciseProps = {
  exercise: MultipleChoiceExerciseData;
  state: MultipleChoiceAnswerState;
  onChange: (patch: Partial<MultipleChoiceAnswerState>) => void;
  onCheck: (correct: boolean) => void;
  onTryAgain: () => void;
};

const actionButtonClass =
  "inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition";

export function MultipleChoiceExercise({
  exercise,
  state,
  onChange,
  onCheck,
  onTryAgain
}: MultipleChoiceExerciseProps) {
  const hasSelection = typeof state.selectedIndex === "number";

  return (
    <article className="rounded-md border border-line bg-white p-5">
      <div>
        <h3 className="text-lg font-semibold text-ink">{exercise.title}</h3>
        <p className="mt-2 leading-7 text-slate-600">{exercise.prompt}</p>
      </div>

      <fieldset className="mt-4 space-y-3">
        <legend className="sr-only">{exercise.title}</legend>
        {exercise.options.map((option, index) => {
          const inputId = `${exercise.id}-${index}`;

          return (
            <label
              key={option}
              htmlFor={inputId}
              className="flex cursor-pointer gap-3 rounded-md border border-line bg-paper/60 p-3 text-sm leading-6 text-slate-700 transition hover:border-moss"
            >
              <input
                id={inputId}
                name={exercise.id}
                type="radio"
                checked={state.selectedIndex === index}
                onChange={() =>
                  onChange({
                    checked: false,
                    correct: undefined,
                    selectedIndex: index
                  })
                }
                className="mt-1 h-4 w-4 accent-moss"
              />
              <span>{option}</span>
            </label>
          );
        })}
      </fieldset>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!hasSelection}
          onClick={() => {
            if (typeof state.selectedIndex === "number") {
              onCheck(state.selectedIndex === exercise.correctIndex);
            }
          }}
          className={`${actionButtonClass} border-moss bg-moss text-white hover:bg-moss-dark disabled:cursor-not-allowed disabled:border-line disabled:bg-slate-100 disabled:text-slate-400`}
        >
          Check
        </button>
        {state.checked ? (
          <button
            type="button"
            onClick={onTryAgain}
            className={`${actionButtonClass} border-line bg-white text-ink hover:border-moss hover:text-moss`}
          >
            Try again
          </button>
        ) : null}
      </div>

      {state.checked ? (
        <div
          aria-live="polite"
          className={[
            "mt-4 rounded-md border px-4 py-3 text-sm leading-6",
            state.correct
              ? "border-moss/30 bg-moss/10 text-ink"
              : "border-amber-200 bg-amber-50 text-amber-950"
          ].join(" ")}
        >
          <p className="font-semibold">{state.correct ? "Correct" : "Not quite"}</p>
          <p className="mt-1">{exercise.explanation}</p>
        </div>
      ) : null}
    </article>
  );
}
