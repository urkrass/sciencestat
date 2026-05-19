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
  "inline-flex h-10 items-center justify-center rounded-md border px-4 text-sm font-medium transition";

export function UnitWorkspace({ exerciseSet, pdfPath, title }: UnitWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("reader");

  if (!exerciseSet) {
    return <PdfViewerShell file={pdfPath} title={title} />;
  }

  return (
    <section aria-label={`${title} workspace`} className="space-y-4">
      <div
        aria-label="Unit workspace"
        className="inline-flex rounded-lg border border-line bg-white p-1 shadow-sm"
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
            tabButtonClass,
            activeTab === "reader"
              ? "border-moss bg-moss text-white"
              : "border-transparent bg-white text-ink hover:bg-slate-100 hover:text-moss"
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
              ? "border-moss bg-moss text-white"
              : "border-transparent bg-white text-ink hover:bg-slate-100 hover:text-moss"
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
