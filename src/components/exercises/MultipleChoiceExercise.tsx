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
  "practice-action-button inline-flex items-center justify-center rounded-md border font-semibold transition";

function getOptionKey(index: number) {
  return String.fromCharCode(65 + index);
}

export function MultipleChoiceExercise({
  exercise,
  state,
  onChange,
  onCheck,
  onTryAgain
}: MultipleChoiceExerciseProps) {
  const selectedOption =
    typeof state.selectedIndex === "number" ? exercise.options[state.selectedIndex] : undefined;
  const hasSelection = typeof state.selectedIndex === "number" && selectedOption !== undefined;
  const displaySelectedOption = selectedOption?.replace(/^[A-Z]\.\s*/, "") ?? "";
  const checkAnswer = () => {
    if (hasSelection && typeof state.selectedIndex === "number") {
      onCheck(state.selectedIndex === exercise.correctIndex);
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
              {typeof state.selectedIndex === "number"
                ? `${getOptionKey(state.selectedIndex)}. ${displaySelectedOption}`
                : displaySelectedOption}
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
            {exercise.options.map((option, index) => {
              const inputId = `${exercise.id}-${index}`;
              const isSelected = state.selectedIndex === index;
              const displayOption = option.replace(/^[A-Z]\.\s*/, "");

              return (
                <label
                  key={option}
                  htmlFor={inputId}
                  className={[
                    "practice-choice-option group flex cursor-pointer items-start rounded-md border transition",
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
                        selectedIndex: index
                      })
                    }
                    className="sr-only"
                  />
                  <span
                  aria-hidden="true"
                  className={[
                      "practice-option-key mt-0.5 inline-flex shrink-0 items-center justify-center rounded border font-semibold",
                      isSelected
                        ? "border-moss bg-moss text-white"
                        : "border-moss/60 bg-white text-moss group-hover:border-moss"
                    ].join(" ")}
                  >
                    {getOptionKey(index)}
                  </span>
                  <span>{displayOption}</span>
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
