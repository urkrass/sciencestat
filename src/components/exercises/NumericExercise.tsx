"use client";

import type { NumericExercise as NumericExerciseData } from "@/content/exercises";

type NumericAnswerState = {
  checked?: boolean;
  correct?: boolean;
  numericAnswer?: string;
};

type NumericExerciseProps = {
  exercise: NumericExerciseData;
  state: NumericAnswerState;
  onChange: (patch: Partial<NumericAnswerState>) => void;
  onCheck: (correct: boolean) => void;
  onTryAgain: () => void;
};

const actionButtonClass =
  "inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition";

export function NumericExercise({
  exercise,
  state,
  onChange,
  onCheck,
  onTryAgain
}: NumericExerciseProps) {
  const numericValue = state.numericAnswer ?? "";
  const parsedAnswer = Number(numericValue);
  const hasValidAnswer = numericValue.trim() !== "" && Number.isFinite(parsedAnswer);

  return (
    <article>
      <div>
        <h3 className="text-lg font-semibold text-ink">{exercise.title}</h3>
        <p className="mt-2 leading-7 text-slate-600">{exercise.prompt}</p>
      </div>

      <div className="mt-4">
        <label
          htmlFor={`${exercise.id}-answer`}
          className="block text-sm font-medium text-ink"
        >
          Answer{exercise.unitLabel ? ` (${exercise.unitLabel})` : ""}
        </label>
        <input
          id={`${exercise.id}-answer`}
          type="number"
          inputMode="decimal"
          step="any"
          value={numericValue}
          onChange={(event) =>
            onChange({
              checked: false,
              correct: undefined,
              numericAnswer: event.target.value
            })
          }
          className="mt-2 h-11 w-full max-w-xs rounded-md border border-line bg-white px-3 text-ink shadow-sm outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20"
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!hasValidAnswer}
          onClick={() => onCheck(Math.abs(parsedAnswer - exercise.acceptedAnswer) <= exercise.tolerance)}
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
            "mt-5 border-l-4 py-1 pl-4 text-sm leading-6",
            state.correct
              ? "border-moss text-ink"
              : "border-amber-400 text-amber-950"
          ].join(" ")}
        >
          <p className="font-semibold">{state.correct ? "Correct" : "Not quite"}</p>
          <p className="mt-1">{exercise.explanation}</p>
        </div>
      ) : null}
    </article>
  );
}
