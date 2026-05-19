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
  "inline-flex h-12 items-center justify-center rounded-md border px-5 text-base font-semibold transition";

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
  const checkAnswer = () => {
    onCheck(Math.abs(parsedAnswer - exercise.acceptedAnswer) <= exercise.tolerance);
  };

  return (
    <article
      onKeyDown={(event) => {
        if (event.key === "Enter" && hasValidAnswer && !(event.target instanceof HTMLButtonElement)) {
          event.preventDefault();
          checkAnswer();
        }
      }}
    >
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-[0.14em] text-moss">
          {exercise.title}
        </h3>
        <p className="mt-3 text-2xl leading-snug text-ink sm:text-3xl">
          {exercise.prompt}
        </p>
      </div>

      <div className="mt-8">
        <label
          htmlFor={`${exercise.id}-answer`}
          className="block text-sm font-semibold uppercase tracking-[0.12em] text-moss"
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
          className="mt-3 h-14 w-full max-w-sm rounded-md border border-moss/60 bg-white/70 px-4 text-2xl text-ink outline-none transition placeholder:text-slate-400 focus:border-moss focus:ring-4 focus:ring-moss/10"
        />
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!hasValidAnswer}
          onClick={checkAnswer}
          className={`${actionButtonClass} border-moss bg-moss text-white hover:bg-moss-dark disabled:cursor-not-allowed disabled:border-line disabled:bg-slate-100 disabled:text-slate-400`}
        >
          OK
        </button>
        <span className="text-sm text-slate-500">press Enter after answering</span>
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
            "mt-6 border-l-4 py-1 pl-4 text-base leading-7",
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
