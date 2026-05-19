"use client";

import type { ClaimClassifierExercise as ClaimClassifierExerciseData } from "@/content/exercises";

type ClaimClassifierAnswerState = {
  checked?: boolean;
  correct?: boolean;
  claimAnswers?: Record<string, string>;
};

type ClaimClassifierExerciseProps = {
  exercise: ClaimClassifierExerciseData;
  state: ClaimClassifierAnswerState;
  onChange: (patch: Partial<ClaimClassifierAnswerState>) => void;
  onCheck: (correct: boolean) => void;
  onTryAgain: () => void;
};

const actionButtonClass =
  "inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition";

export function ClaimClassifierExercise({
  exercise,
  state,
  onChange,
  onCheck,
  onTryAgain
}: ClaimClassifierExerciseProps) {
  const claimAnswers = state.claimAnswers ?? {};
  const allClaimsAnswered = exercise.claims.every((_, index) => claimAnswers[String(index)]);

  const updateClaimAnswer = (index: number, value: string) => {
    onChange({
      checked: false,
      claimAnswers: {
        ...claimAnswers,
        [String(index)]: value
      },
      correct: undefined
    });
  };

  return (
    <article className="rounded-lg border border-line bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-semibold text-ink">{exercise.title}</h3>
        <p className="mt-2 leading-7 text-slate-600">{exercise.prompt}</p>
      </div>

      <div className="mt-4 space-y-4">
        {exercise.claims.map((claim, index) => {
          const selectedLabel = claimAnswers[String(index)] ?? "";
          const isCorrect = selectedLabel === claim.correctLabel;

          return (
            <div key={claim.text} className="rounded-md border border-line bg-paper/60 p-4">
              <p className="text-sm leading-6 text-slate-700">{claim.text}</p>
              <label
                htmlFor={`${exercise.id}-claim-${index}`}
                className="mt-3 block text-sm font-medium text-ink"
              >
                Classification
              </label>
              <select
                id={`${exercise.id}-claim-${index}`}
                value={selectedLabel}
                onChange={(event) => updateClaimAnswer(index, event.target.value)}
                className="mt-2 h-11 w-full rounded-md border border-line bg-white px-3 text-ink shadow-sm outline-none transition focus:border-moss focus:ring-2 focus:ring-moss/20 sm:max-w-xs"
              >
                <option value="">Choose a label</option>
                {exercise.labels.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>

              {state.checked ? (
                <div
                  className={[
                    "mt-3 rounded-md border px-3 py-2 text-sm leading-6",
                    isCorrect
                      ? "border-moss/30 bg-moss/10 text-ink"
                      : "border-amber-200 bg-amber-50 text-amber-950"
                  ].join(" ")}
                >
                  <p className="font-semibold">{isCorrect ? "Correct" : "Not quite"}</p>
                  <p className="mt-1">{claim.explanation}</p>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={!allClaimsAnswered}
          onClick={() =>
            onCheck(
              exercise.claims.every(
                (claim, index) => claimAnswers[String(index)] === claim.correctLabel
              )
            )
          }
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
    </article>
  );
}
