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

const tabButtonClass =
  "inline-flex h-11 items-center justify-center border-b-2 px-1 text-sm font-semibold transition";

export function UnitWorkspace({ exerciseSet, pdfPath, title }: UnitWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("reader");

  if (!exerciseSet) {
    return <PdfViewerShell file={pdfPath} title={title} />;
  }

  return (
    <section aria-label={`${title} workspace`} className="space-y-4">
      <div aria-label="Unit workspace" className="flex gap-6 border-b border-line" role="tablist">
        <button
          type="button"
          role="tab"
          aria-selected={activeTab === "reader"}
          aria-controls="unit-reader-panel"
          id="unit-reader-tab"
          onClick={() => setActiveTab("reader")}
          className={[
            tabButtonClass,
            activeTab === "reader"
              ? "border-moss text-moss"
              : "border-transparent text-slate-500 hover:text-ink"
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
            tabButtonClass,
            activeTab === "practice"
              ? "border-moss text-moss"
              : "border-transparent text-slate-500 hover:text-ink"
          ].join(" ")}
        >
          Practice
        </button>
      </div>

      <div
        id="unit-reader-panel"
        role="tabpanel"
        aria-labelledby="unit-reader-tab"
        hidden={activeTab !== "reader"}
      >
        {activeTab === "reader" ? <PdfViewerShell file={pdfPath} title={title} /> : null}
      </div>

      <div
        id="unit-practice-panel"
        role="tabpanel"
        aria-labelledby="unit-practice-tab"
        hidden={activeTab !== "practice"}
      >
        {activeTab === "practice" ? <ExerciseBlock exerciseSet={exerciseSet} /> : null}
      </div>
    </section>
  );
}
