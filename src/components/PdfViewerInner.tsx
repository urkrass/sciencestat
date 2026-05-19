"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from "lucide-react";
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
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const pageRefs = useRef<Array<HTMLDivElement | null>>([]);
  const [containerWidth, setContainerWidth] = useState(760);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);

  useEffect(() => {
    const node = containerRef.current;
    if (!node) {
      return;
    }

    const updateWidth = () => {
      const nextWidth = Math.floor(node.getBoundingClientRect().width);
      const horizontalPadding = isFullscreen ? 32 : 24;
      const maxWidth = isFullscreen ? 1220 : 900;
      setContainerWidth(clamp(nextWidth - horizontalPadding, 280, maxWidth));
    };

    updateWidth();

    const observer = new ResizeObserver(updateWidth);
    observer.observe(node);

    return () => observer.disconnect();
  }, [isFullscreen]);

  useEffect(() => {
    const syncFullscreenState = () => {
      setIsFullscreen(document.fullscreenElement === containerRef.current);
    };

    document.addEventListener("fullscreenchange", syncFullscreenState);

    return () => {
      document.removeEventListener("fullscreenchange", syncFullscreenState);
    };
  }, []);

  useEffect(() => {
    if (!numPages) {
      return;
    }

    pageRefs.current = pageRefs.current.slice(0, numPages);
  }, [numPages]);

  useEffect(() => {
    if (!numPages) {
      return;
    }

    const visibleRatios = new Map<number, number>();
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const page = Number((entry.target as HTMLElement).dataset.pageNumber);

          if (!Number.isNaN(page)) {
            visibleRatios.set(page, entry.isIntersecting ? entry.intersectionRatio : 0);
          }
        });

        let mostVisiblePage: number | null = null;
        let strongestRatio = 0;

        visibleRatios.forEach((ratio, page) => {
          if (ratio > strongestRatio) {
            strongestRatio = ratio;
            mostVisiblePage = page;
          }
        });

        if (mostVisiblePage) {
          setPageNumber(mostVisiblePage);
        }
      },
      {
        root: scrollAreaRef.current,
        threshold: [0.15, 0.35, 0.55, 0.75]
      }
    );

    pageRefs.current.forEach((pageElement) => {
      if (pageElement) {
        observer.observe(pageElement);
      }
    });

    return () => observer.disconnect();
  }, [isFullscreen, numPages]);

  const pageWidth = useMemo(() => Math.round(containerWidth * scale), [containerWidth, scale]);
  const pageFrameWidth = useMemo(
    () => Math.max(pageWidth + 32, containerWidth),
    [containerWidth, pageWidth]
  );
  const totalPagesLabel = numPages ?? "...";

  const scrollToPage = (targetPage: number) => {
    if (!numPages) {
      return;
    }

    const nextPage = clamp(targetPage, 1, numPages);
    const nextPageElement = pageRefs.current[nextPage - 1];
    const scrollArea = scrollAreaRef.current;

    setPageNumber(nextPage);

    if (nextPageElement && scrollArea) {
      scrollArea.scrollTo({
        left: nextPageElement.offsetLeft,
        behavior: "smooth"
      });
    }
  };

  const goToPreviousPage = () => {
    scrollToPage(pageNumber - 1);
  };

  const goToNextPage = () => {
    scrollToPage(pageNumber + 1);
  };

  const handleReaderWheel = (event: React.WheelEvent<HTMLDivElement>) => {
    const scrollArea = scrollAreaRef.current;

    if (!scrollArea || Math.abs(event.deltaY) <= Math.abs(event.deltaX)) {
      return;
    }

    event.preventDefault();
    scrollArea.scrollLeft += event.deltaY;
  };

  const toggleFullscreen = async () => {
    const node = containerRef.current;

    if (!node) {
      return;
    }

    setFullscreenError(null);

    try {
      if (document.fullscreenElement === node) {
        await document.exitFullscreen();
        return;
      }

      if (!node.requestFullscreen) {
        setFullscreenError("Fullscreen is not available in this browser.");
        return;
      }

      await node.requestFullscreen();
    } catch {
      setFullscreenError("Unable to enter fullscreen mode.");
    }
  };

  return (
    <section
      ref={containerRef}
      aria-label={`PDF viewer for ${title}`}
      className="pdf-viewer-shell min-w-0 rounded-lg border border-line bg-white p-3 shadow-sm sm:p-4"
    >
      <div className="pdf-viewer-toolbar flex flex-col gap-3 border-b border-line pb-3 lg:flex-row lg:items-center lg:justify-between">
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
          <span className="mx-1 hidden h-10 w-px bg-line sm:block" />
          <button
            type="button"
            onClick={toggleFullscreen}
            className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-line text-ink transition hover:border-moss hover:text-moss"
            aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            title={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
          >
            {isFullscreen ? (
              <Minimize2 aria-hidden="true" className="h-4 w-4" />
            ) : (
              <Maximize2 aria-hidden="true" className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
      {fullscreenError ? (
        <p className="mt-3 rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {fullscreenError}
        </p>
      ) : null}

      {loadError ? (
        <ViewerStatus>{loadError}</ViewerStatus>
      ) : (
        <div
          ref={scrollAreaRef}
          onWheel={handleReaderWheel}
          className="pdf-page pdf-page-book mt-4 max-w-full rounded-md bg-slate-100 px-3 py-6 text-center"
        >
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
            <div className="pdf-page-strip">
              {Array.from({ length: numPages ?? 0 }, (_, index) => {
                const renderedPageNumber = index + 1;

                return (
                  <div
                    key={`${file}-${renderedPageNumber}-${pageWidth}`}
                    ref={(element) => {
                      pageRefs.current[index] = element;
                    }}
                    data-page-number={renderedPageNumber}
                    className="pdf-page-frame"
                    style={{ width: pageFrameWidth }}
                  >
                    <p className="pdf-page-label">
                      Page {renderedPageNumber} of {totalPagesLabel}
                    </p>
                    <Page
                      pageNumber={renderedPageNumber}
                      width={pageWidth}
                      renderAnnotationLayer
                      renderTextLayer
                    />
                  </div>
                );
              })}
            </div>
          </Document>
        </div>
      )}
    </section>
  );
}
