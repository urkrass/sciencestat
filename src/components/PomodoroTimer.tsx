"use client";

import { Pause, Play, RotateCcw } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const FOCUS_SECONDS = 25 * 60;

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function TomatoIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      className="h-7 w-7 shrink-0"
      fill="none"
    >
      <path
        d="M16 11.2c5.3 0 9.6 3.5 9.6 8.3 0 5.1-4.3 8.7-9.6 8.7s-9.6-3.6-9.6-8.7c0-4.8 4.3-8.3 9.6-8.3Z"
        className="fill-red-600"
      />
      <path
        d="M14.6 11.7 11.8 8l4.1 1.3L16 4.8l1.9 4.1L22 7.8l-2.6 3.8"
        className="fill-moss"
      />
      <path
        d="M10.8 17.5c.8-1.5 2.4-2.4 4.2-2.6"
        stroke="white"
        strokeLinecap="round"
        strokeWidth="1.7"
        opacity="0.55"
      />
    </svg>
  );
}

export function PomodoroTimer() {
  const [remainingSeconds, setRemainingSeconds] = useState(FOCUS_SECONDS);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!isRunning || remainingSeconds === 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setRemainingSeconds((currentSeconds) => Math.max(currentSeconds - 1, 0));
    }, 1000);

    return () => window.clearTimeout(timeoutId);
  }, [isRunning, remainingSeconds]);

  useEffect(() => {
    if (remainingSeconds === 0) {
      setIsRunning(false);
    }
  }, [remainingSeconds]);

  const timeLabel = useMemo(() => formatTime(remainingSeconds), [remainingSeconds]);
  const progress = ((FOCUS_SECONDS - remainingSeconds) / FOCUS_SECONDS) * 100;

  const toggleTimer = () => {
    if (remainingSeconds === 0) {
      setRemainingSeconds(FOCUS_SECONDS);
      setIsRunning(true);
      return;
    }

    setIsRunning((current) => !current);
  };

  const resetTimer = () => {
    setIsRunning(false);
    setRemainingSeconds(FOCUS_SECONDS);
  };

  return (
    <section
      aria-label="Pomodoro timer"
      className="mt-auto shrink-0 border-t border-line pt-3"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <TomatoIcon />
          <div className="min-w-0">
            <h2 className="text-sm font-semibold leading-none text-ink">Pomodoro</h2>
            <p className="mt-1 text-xs text-slate-500">25 minute focus</p>
          </div>
        </div>
        <p
          aria-live="polite"
          className="font-mono text-2xl font-semibold tabular-nums text-ink"
        >
          {timeLabel}
        </p>
      </div>

      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div
            className="h-full rounded-full bg-moss transition-[width] duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex shrink-0 gap-1.5">
          <button
            type="button"
            aria-label={isRunning ? "Pause pomodoro timer" : "Start pomodoro timer"}
            aria-pressed={isRunning}
            onClick={toggleTimer}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-moss bg-moss text-white transition hover:bg-moss-dark"
          >
            {isRunning ? (
              <Pause aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Play aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
          <button
            type="button"
            aria-label="Reset pomodoro timer"
            onClick={resetTimer}
            className="inline-flex h-8 w-8 items-center justify-center rounded-md border border-line bg-white text-ink transition hover:border-moss hover:text-moss"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>
    </section>
  );
}
