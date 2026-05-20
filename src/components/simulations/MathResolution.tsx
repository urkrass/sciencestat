"use client";

import { motion, useReducedMotion } from "motion/react";
import { MathExpression } from "@/components/simulations/MathExpression";

type MathResolutionStep = {
  label: string;
  math: string;
};

type MathResolutionProps = {
  animationKey: number;
  steps: MathResolutionStep[];
};

export function MathResolution({ animationKey, steps }: MathResolutionProps) {
  const shouldReduceMotion = useReducedMotion();

  return (
    <div
      key={animationKey}
      aria-live="polite"
      className="simulation-math-resolution mt-3 grid gap-1.5 text-xs text-slate-700"
    >
      {steps.map((step, index) => (
        <motion.div
          key={`${step.label}-${step.math}`}
          className="flex flex-wrap items-center gap-x-2 gap-y-1"
          initial={
            shouldReduceMotion
              ? false
              : { opacity: 0, y: 4, filter: "blur(4px)" }
          }
          animate={{ opacity: 1, y: 0, filter: "blur(0)" }}
          transition={{
            duration: shouldReduceMotion ? 0 : 0.54,
            delay: shouldReduceMotion ? 0 : index * 0.095,
            ease: [0.2, 0.85, 0.25, 1]
          }}
        >
          <span className="min-w-[4.25rem] text-[0.66rem] font-semibold uppercase tracking-[0.12em] text-moss">
            {step.label}
          </span>
          <MathExpression math={step.math} />
        </motion.div>
      ))}
    </div>
  );
}
