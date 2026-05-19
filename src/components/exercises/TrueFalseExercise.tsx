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
  "practice-action-button inline-flex items-center justify-center rounded-md border font-semibold transition";

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
        <h3 className="practice-question-title font-semibold uppercase text-moss">
          {exercise.title}
        </h3>
        <p className="practice-prompt text-ink">{exercise.prompt}</p>
      </div>

      {state.checked && hasSelection ? (
        <div className="practice-checked-state grid">
          <div className="practice-answer-panel rounded-md border border-moss/40 bg-white/80">
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
              "practice-feedback border-l-4 py-1 pl-4",
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
            className="inline-flex h-9 w-fit items-center justify-center rounded-md border border-line bg-white px-4 text-sm font-medium text-ink transition hover:border-moss hover:text-moss"
          >
            Try again
          </button>
        </div>
      ) : (
        <>
          <fieldset className="practice-choice-list">
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
                    "practice-choice-option group flex cursor-pointer items-center rounded-md border font-medium transition",
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
                      "practice-option-key inline-flex shrink-0 items-center justify-center rounded border font-semibold",
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

          <div className="practice-action-row flex flex-wrap items-center">
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
