"use client";

import { useState } from "react";
import { ExerciseBlock } from "@/components/exercises/ExerciseBlock";
import { PdfViewerShell } from "@/components/PdfViewerShell";
import type { ExerciseSet } from "@/content/exercises";

type WorkspaceTab = "reader" | "practice";

type UnitWorkspaceProps = {
  exerciseSet: ExerciseSet | null;
  pdfPath: string;
  title: string;
};

const modeButtonClass =
  "inline-flex h-8 items-center justify-center rounded px-3 text-xs font-semibold transition";

export function UnitWorkspace({ exerciseSet, pdfPath, title }: UnitWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("reader");

  if (!exerciseSet) {
    return (
      <section aria-label={`${title} workspace`} className="h-full min-h-0">
        <PdfViewerShell file={pdfPath} title={title} />
      </section>
    );
  }

  const workspaceSwitch = (
    <div
      aria-label="Unit workspace"
      className="inline-flex shrink-0 rounded-md border border-line bg-white/75 p-1"
      role="tablist"
    >
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "reader"}
        aria-controls="unit-reader-panel"
        id="unit-reader-tab"
        onClick={() => setActiveTab("reader")}
        className={[
          modeButtonClass,
          activeTab === "reader"
            ? "bg-moss text-white"
            : "text-slate-500 hover:bg-slate-100 hover:text-ink"
        ].join(" ")}
      >
        Reader
      </button>
      <button
        type="button"
        role="tab"
        aria-selected={activeTab === "practice"}
        aria-controls="unit-practice-panel"
        id="unit-practice-tab"
        onClick={() => setActiveTab("practice")}
        className={[
          modeButtonClass,
          activeTab === "practice"
            ? "bg-moss text-white"
            : "text-slate-500 hover:bg-slate-100 hover:text-ink"
        ].join(" ")}
      >
        Practice
      </button>
    </div>
  );

  return (
    <section aria-label={`${title} workspace`} className="h-full min-h-0">
      <div
        id="unit-reader-panel"
        role="tabpanel"
        aria-labelledby="unit-reader-tab"
        hidden={activeTab !== "reader"}
        className="h-full min-h-0"
      >
        {activeTab === "reader" ? (
          <PdfViewerShell file={pdfPath} title={title} workspaceSwitch={workspaceSwitch} />
        ) : null}
      </div>

      <div
        id="unit-practice-panel"
        role="tabpanel"
        aria-labelledby="unit-practice-tab"
        hidden={activeTab !== "practice"}
        className="h-full min-h-0"
      >
        {activeTab === "practice" ? (
          <ExerciseBlock exerciseSet={exerciseSet} workspaceSwitch={workspaceSwitch} />
        ) : null}
      </div>
    </section>
  );
}
