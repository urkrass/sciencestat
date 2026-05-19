"use client";

import { useState, type DragEvent } from "react";
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

const labelChipClass =
  "inline-flex min-h-10 items-center rounded-full border px-4 py-2 text-sm font-medium transition";

export function ClaimClassifierExercise({
  exercise,
  state,
  onChange,
  onCheck,
  onTryAgain
}: ClaimClassifierExerciseProps) {
  const [draggedLabel, setDraggedLabel] = useState<string | null>(null);
  const [pickedLabel, setPickedLabel] = useState<string | null>(null);
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

  const assignLabelToClaim = (index: number, label: string) => {
    updateClaimAnswer(index, label);
    setPickedLabel(null);
  };

  const handleLabelDragStart = (event: DragEvent<HTMLButtonElement>, label: string) => {
    event.dataTransfer.effectAllowed = "copy";
    event.dataTransfer.setData("text/plain", label);
    setDraggedLabel(label);
  };

  const handleClaimDrop = (event: DragEvent<HTMLButtonElement>, index: number) => {
    event.preventDefault();
    const droppedLabel = event.dataTransfer.getData("text/plain") || draggedLabel;

    if (droppedLabel && exercise.labels.includes(droppedLabel)) {
      assignLabelToClaim(index, droppedLabel);
    }

    setDraggedLabel(null);
  };

  const togglePickedLabel = (label: string) => {
    setPickedLabel((currentLabel) => (currentLabel === label ? null : label));
  };

  return (
    <article>
      <div>
        <h3 className="text-lg font-semibold text-ink">{exercise.title}</h3>
        <p className="mt-2 leading-7 text-slate-600">{exercise.prompt}</p>
      </div>

      <p id={`${exercise.id}-interaction-help`} className="sr-only">
        Drag a label to a statement, or activate a label and then activate a statement.
      </p>

      <div className="mt-6 grid gap-6 md:grid-cols-[minmax(0,1fr)_13rem]">
        <div className="order-2 divide-y divide-line md:order-1">
          {exercise.claims.map((claim, index) => {
            const selectedLabel = claimAnswers[String(index)] ?? "";
            const isCorrect = selectedLabel === claim.correctLabel;

            return (
              <div key={claim.text} className="py-4 first:pt-0">
                <button
                  type="button"
                  aria-describedby={`${exercise.id}-interaction-help`}
                  aria-label={
                    selectedLabel
                      ? `${claim.text} Classification: ${selectedLabel}`
                      : `${claim.text} No classification selected`
                  }
                  onClick={() => {
                    if (pickedLabel) {
                      assignLabelToClaim(index, pickedLabel);
                    }
                  }}
                  onDragOver={(event) => event.preventDefault()}
                  onDrop={(event) => handleClaimDrop(event, index)}
                  className="group block w-full text-left outline-none"
                >
                  <span className="block text-sm leading-6 text-slate-700">{claim.text}</span>
                  <span className="mt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Classification
                    </span>
                    <span
                      className={[
                        "inline-flex min-h-9 items-center rounded-full border px-3 py-1 text-sm font-medium transition",
                        selectedLabel
                          ? "border-moss/30 bg-moss/10 text-moss"
                          : "border-dashed border-line bg-paper text-slate-500 group-hover:border-moss/60"
                      ].join(" ")}
                    >
                      {selectedLabel || "Drop label"}
                    </span>
                  </span>
                </button>

                {state.checked ? (
                  <div
                    className={[
                      "mt-3 border-l-4 py-1 pl-4 text-sm leading-6",
                      isCorrect ? "border-moss text-ink" : "border-amber-400 text-amber-950"
                    ].join(" ")}
                  >
                    <p className="font-semibold">
                      {isCorrect ? "Correct" : `Not quite. Best label: ${claim.correctLabel}`}
                    </p>
                    <p className="mt-1">{claim.explanation}</p>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>

        <div className="order-1 md:order-2 md:border-l md:border-line md:pl-5">
          <p className="text-xs font-semibold uppercase tracking-[0.14em] text-moss">
            Labels
          </p>
          <div className="mt-3 flex flex-wrap gap-2 md:flex-col">
            {exercise.labels.map((label) => {
              const isPicked = pickedLabel === label;

              return (
                <button
                  key={label}
                  type="button"
                  draggable
                  aria-pressed={isPicked}
                  onClick={() => togglePickedLabel(label)}
                  onDragStart={(event) => handleLabelDragStart(event, label)}
                  onDragEnd={() => setDraggedLabel(null)}
                  className={[
                    labelChipClass,
                    isPicked
                      ? "border-moss bg-moss text-white"
                      : "border-line bg-white text-ink hover:border-moss hover:text-moss"
                  ].join(" ")}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
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
