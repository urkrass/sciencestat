"use client";

import dynamic from "next/dynamic";
import type { PdfViewerProps } from "./PdfViewerInner";

const PdfViewerInner = dynamic(() => import("./PdfViewerInner"), {
  ssr: false,
  loading: () => (
    <div className="rounded-lg border border-line bg-white p-8 text-sm text-slate-600">
      Loading PDF viewer...
    </div>
  )
});

export function PdfViewerShell(props: PdfViewerProps) {
  return <PdfViewerInner {...props} />;
}
