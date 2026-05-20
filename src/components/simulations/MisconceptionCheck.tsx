"use client";

import { useState } from "react";

type MisconceptionAnswer = "yes" | "no";

type MisconceptionCheckProps = {
  question: string;
  correctAnswer: MisconceptionAnswer;
  explanation: string;
};

const answerOptions: { value: MisconceptionAnswer; label: string }[] = [
  { value: "yes", label: "Yes" },
  { value: "no", label: "No" }
];

export function MisconceptionCheck({
  question,
  correctAnswer,
  explanation
}: MisconceptionCheckProps) {
  const [answer, setAnswer] = useState<MisconceptionAnswer | null>(null);

  return (
    <section className="border-t border-line pt-2">
      <h3 className="text-xs font-semibold uppercase tracking-[0.12em] text-moss">
        Misconception check
      </h3>
      <p className="mt-1 text-xs leading-5 text-slate-700">{question}</p>
      <div className="mt-2 grid grid-cols-2 gap-1">
        {answerOptions.map((option) => {
          const isSelected = answer === option.value;

          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={isSelected}
              onClick={() => setAnswer(option.value)}
              className={[
                "min-h-8 rounded-md border px-2 text-center text-xs font-semibold transition",
                isSelected
                  ? "border-moss bg-moss text-white"
                  : "border-line bg-transparent text-ink hover:border-moss hover:text-moss"
              ].join(" ")}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      {answer ? (
        <p
          role="status"
          className="mt-2 border-l-2 border-line pl-3 text-xs leading-5 text-slate-700"
        >
          <span className="font-semibold text-ink">
            {answer === correctAnswer ? "Correct." : "Not quite."}
          </span>{" "}
          {explanation}
        </p>
      ) : null}
    </section>
  );
}
