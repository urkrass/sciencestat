"use client";

import type { TrueFalseExercise as TrueFalseExerciseData } from "@/content/exercises";

type TrueFalseAnswerState = {
  checked?: boolean;
  correct?: boolean;
  selectedAnswer?: boolean;
};

type TrueFalseExerciseProps = {
  exercise: TrueFalseExerciseData;
  state: TrueFalseAnswerState;
  onChange: (patch: Partial<TrueFalseAnswerState>) => void;
  onCheck: (correct: boolean) => void;
  onTryAgain: () => void;
};

const actionButtonClass =
  "inline-flex h-12 items-center justify-center rounded-md border px-5 text-base font-semibold transition";

export function TrueFalseExercise({
  exercise,
  state,
  onChange,
  onCheck,
  onTryAgain
}: TrueFalseExerciseProps) {
  const hasSelection = typeof state.selectedAnswer === "boolean";
  const checkAnswer = () => {
    if (typeof state.selectedAnswer === "boolean") {
      onCheck(state.selectedAnswer === exercise.correctAnswer);
    }
  };

  return (
    <article
      onKeyDown={(event) => {
        if (event.key === "Enter" && hasSelection && !(event.target instanceof HTMLButtonElement)) {
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

      {state.checked && hasSelection ? (
        <div className="mt-6 space-y-4">
          <div className="rounded-md border border-moss/40 bg-white/80 px-4 py-3">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
              Your answer
            </p>
            <p className="mt-1 text-lg font-medium leading-snug text-ink">
              {state.selectedAnswer ? "True" : "False"}
            </p>
          </div>
          <div
            aria-live="polite"
            className={[
              "border-l-4 py-1 pl-4 text-sm leading-6",
              state.correct
                ? "border-moss text-ink"
                : "border-amber-400 text-amber-950"
            ].join(" ")}
          >
            <p className="font-semibold">{state.correct ? "Correct" : "Not quite"}</p>
            <p className="mt-1">{exercise.explanation}</p>
          </div>
          <button
            type="button"
            onClick={onTryAgain}
            className="inline-flex h-10 items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-medium text-ink transition hover:border-moss hover:text-moss"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <fieldset className="mt-8 space-y-3">
            <legend className="sr-only">{exercise.title}</legend>
            {[true, false].map((answer, index) => {
              const inputId = `${exercise.id}-${answer ? "true" : "false"}`;
              const isSelected = state.selectedAnswer === answer;
              const optionKey = index === 0 ? "A" : "B";

              return (
                <label
                  key={String(answer)}
                  htmlFor={inputId}
                  className={[
                    "group flex cursor-pointer items-center gap-3 rounded-md border px-3 py-3 text-lg font-medium transition sm:px-4",
                    isSelected
                      ? "border-moss bg-moss/10 text-ink shadow-sm"
                      : "border-moss/50 bg-white/70 text-ink hover:bg-moss/5"
                  ].join(" ")}
                >
                  <input
                    id={inputId}
                    name={exercise.id}
                    type="radio"
                    checked={isSelected}
                    onChange={() =>
                      onChange({
                        checked: false,
                        correct: undefined,
                        selectedAnswer: answer
                      })
                    }
                    className="sr-only"
                  />
                  <span
                    aria-hidden="true"
                    className={[
                      "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border text-sm font-semibold",
                      isSelected
                        ? "border-moss bg-moss text-white"
                        : "border-moss/60 bg-white text-moss group-hover:border-moss"
                    ].join(" ")}
                  >
                    {optionKey}
                  </span>
                  {answer ? "True" : "False"}
                </label>
              );
            })}
          </fieldset>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={!hasSelection}
              onClick={checkAnswer}
              className={`${actionButtonClass} border-moss bg-moss text-white hover:bg-moss-dark disabled:cursor-not-allowed disabled:border-line disabled:bg-slate-100 disabled:text-slate-400`}
            >
              OK
            </button>
            <span className="text-sm text-slate-500">press Enter after choosing</span>
          </div>
        </>
      )}
    </article>
  );
}
