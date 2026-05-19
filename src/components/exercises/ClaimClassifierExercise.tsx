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
  "inline-flex h-12 items-center justify-center rounded-md border px-5 text-base font-semibold transition";

const labelChipClass =
  "inline-flex min-h-11 items-center gap-2 rounded-md border px-3 py-2 text-base font-semibold transition";

function getOptionKey(index: number) {
  return String.fromCharCode(65 + index);
}

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

  const checkAnswer = () => {
    onCheck(
      exercise.claims.every(
        (claim, index) => claimAnswers[String(index)] === claim.correctLabel
      )
    );
  };

  return (
    <article
      onKeyDown={(event) => {
        if (
          event.key === "Enter" &&
          allClaimsAnswered &&
          !(event.target instanceof HTMLButtonElement)
        ) {
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

      <p id={`${exercise.id}-interaction-help`} className="sr-only">
        Drag a label to a statement, or activate a label and then activate a statement.
      </p>

      <div className="mt-8 grid gap-7 md:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="order-2 space-y-3 md:order-1">
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
                  className={[
                    "group block w-full rounded-md border px-4 py-4 text-left outline-none transition",
                    selectedLabel
                      ? "border-moss/50 bg-moss/5"
                      : "border-moss/40 bg-white/70 hover:bg-moss/5"
                  ].join(" ")}
                >
                  <span className="flex gap-3">
                    <span
                      aria-hidden="true"
                      className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border border-moss/50 bg-white text-sm font-semibold text-moss"
                    >
                      {index + 1}
                    </span>
                    <span className="block text-base leading-7 text-ink">{claim.text}</span>
                  </span>
                  <span className="mt-3 flex flex-wrap items-center gap-2 pl-10">
                    <span className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">
                      Match
                    </span>
                    <span
                      className={[
                        "inline-flex min-h-9 items-center rounded-md border px-3 py-1 text-sm font-semibold transition",
                        selectedLabel
                          ? "border-moss bg-white text-moss"
                          : "border-dashed border-moss/40 bg-paper/70 text-slate-500 group-hover:border-moss"
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
            {exercise.labels.map((label, index) => {
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
                      : "border-moss/50 bg-white/70 text-ink hover:bg-moss/5"
                  ].join(" ")}
                >
                  <span
                    aria-hidden="true"
                    className={[
                      "inline-flex h-7 w-7 shrink-0 items-center justify-center rounded border text-sm",
                      isPicked ? "border-white/50" : "border-moss/60 bg-white text-moss"
                    ].join(" ")}
                  >
                    {getOptionKey(index)}
                  </span>
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-3">
        <button
          type="button"
          disabled={!allClaimsAnswered}
          onClick={checkAnswer}
          className={`${actionButtonClass} border-moss bg-moss text-white hover:bg-moss-dark disabled:cursor-not-allowed disabled:border-line disabled:bg-slate-100 disabled:text-slate-400`}
        >
          OK
        </button>
        <span className="text-sm text-slate-500">drag a label or click a label, then a statement</span>
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
