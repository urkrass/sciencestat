"use client";

import { useState } from "react";
import { ExerciseBlock } from "@/components/exercises/ExerciseBlock";
import { PdfViewerShell } from "@/components/PdfViewerShell";
import {
  UnitReaderGuide,
  type UnitReaderGuideUnit
} from "@/components/UnitReaderGuide";
import type { ExerciseSet } from "@/content/exercises";

type WorkspaceTab = "reader" | "practice";

type UnitWorkspaceProps = {
  exerciseSet: ExerciseSet | null;
  unit: UnitReaderGuideUnit;
};

const modeButtonClass =
  "inline-flex h-8 items-center justify-center rounded px-3 text-xs font-semibold transition";

export function UnitWorkspace({ exerciseSet, unit }: UnitWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>("reader");

  if (!exerciseSet) {
    return (
      <section aria-label={`${unit.title} workspace`} className="h-full min-h-0">
        <PdfViewerShell
          file={unit.pdfPath}
          title={unit.title}
          readerContext={<UnitReaderGuide unit={unit} />}
        />
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
    <section aria-label={`${unit.title} workspace`} className="h-full min-h-0">
      <div
        id="unit-reader-panel"
        role="tabpanel"
        aria-labelledby="unit-reader-tab"
        hidden={activeTab !== "reader"}
        className="h-full min-h-0"
      >
        {activeTab === "reader" ? (
          <PdfViewerShell
            file={unit.pdfPath}
            title={unit.title}
            readerContext={<UnitReaderGuide unit={unit} />}
            workspaceSwitch={workspaceSwitch}
          />
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
