"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, RotateCcw, ZoomIn, ZoomOut } from "lucide-react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export type PdfViewerProps = {
  file: string;
  title: string;
};

type ViewerStatusProps = {
  children: React.ReactNode;
};

function ViewerStatus({ children }: ViewerStatusProps) {
  return (
    <div className="flex min-h-[22rem] items-center justify-center rounded-lg border border-dashed border-line bg-white p-8 text-center text-sm text-slate-600">
      {children}
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

export default function PdfViewerInner({ file, title }: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(760);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const updateWidth = () => {
      const nextWidth = Math.floor(node.getBoundingClientRect().width);
      setContainerWidth(clamp(nextWidth - 24, 280, 900));
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    return () => observer.disconnect();
  }, []);

  const pageWidth = useMemo(() => Math.round(containerWidth * scale), [containerWidth, scale]);
  const totalPagesLabel = numPages ?? "...";

  const goToPreviousPage = () => {
    setPageNumber((currentPage) => Math.max(1, currentPage - 1));
  };

  const goToNextPage = () => {
    setPageNumber((currentPage) =>
      numPages ? Math.min(numPages, currentPage + 1) : currentPage
    );
  };

  return (
    <section
      ref={containerRef}
      aria-label={`PDF viewer for ${title}`}
      className="min-w-0 rounded-lg border border-line bg-white p-3 shadow-sm sm:p-4"
    >
      <div className="flex flex-col gap-3 border-b border-line pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-ink">Reader</h2>
          <p className="text-sm text-slate-500">
            Page {pageNumber} / {totalPagesLabel}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={goToPreviousPage}
            disabled={pageNumber <= 1}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink transition hover:border-moss hover:text-moss disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            aria-label="Previous page"
            title="Previous page"
          >
            <ChevronLeft aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={goToNextPage}
            disabled={!numPages || pageNumber >= numPages}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink transition hover:border-moss hover:text-moss disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
            aria-label="Next page"
            title="Next page"
          >
            <ChevronRight aria-hidden="true" className="h-4 w-4" />
          </button>
          <span className="mx-1 hidden h-10 w-px bg-line sm:block" />
          <button
            type="button"
            onClick={() => setScale((currentScale) => clamp(currentScale - 0.15, 0.7, 1.6))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink transition hover:border-moss hover:text-moss"
            aria-label="Zoom out"
            title="Zoom out"
          >
            <ZoomOut aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setScale(1)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink transition hover:border-moss hover:text-moss"
            aria-label="Reset zoom"
            title="Reset zoom"
          >
            <RotateCcw aria-hidden="true" className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setScale((currentScale) => clamp(currentScale + 0.15, 0.7, 1.6))}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink transition hover:border-moss hover:text-moss"
            aria-label="Zoom in"
            title="Zoom in"
          >
            <ZoomIn aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>
      </div>

      {loadError ? (
        <ViewerStatus>{loadError}</ViewerStatus>
      ) : (
        <div className="pdf-page mt-4 max-w-full overflow-x-auto rounded-md bg-slate-100 px-3 py-6 text-center">
          <Document
            file={file}
            loading={<ViewerStatus>Loading page...</ViewerStatus>}
            error={<ViewerStatus>Unable to load this PDF.</ViewerStatus>}
            onLoadError={(error) => setLoadError(error.message)}
            onLoadSuccess={({ numPages: loadedPages }: { numPages: number }) => {
              setLoadError(null);
              setNumPages(loadedPages);
              setPageNumber((currentPage) => clamp(currentPage, 1, loadedPages));
            }}
          >
            <Page
              key={`${file}-${pageNumber}-${pageWidth}`}
              pageNumber={pageNumber}
              width={pageWidth}
              renderAnnotationLayer
              renderTextLayer
            />
          </Document>
        </div>
      )}
    </section>
  );
}
