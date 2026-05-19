"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import HTMLFlipBook from "react-pageflip";
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

type FlipBookApi = {
  flipNext: (corner?: "top" | "bottom") => void;
  flipPrev: (corner?: "top" | "bottom") => void;
  getCurrentPageIndex: () => number;
  turnToPage: (page: number) => void;
};

type FlipBookRef = {
  pageFlip?: () => FlipBookApi | undefined;
};

type PdfPageProxyLike = {
  getViewport: (options: { scale: number }) => {
    height: number;
    width: number;
  };
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
  const readerRef = useRef<HTMLDivElement>(null);
  const flipBookRef = useRef<FlipBookRef | null>(null);
  const wheelDeltaRef = useRef(0);
  const [containerWidth, setContainerWidth] = useState(760);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1);
  const [pageAspectRatio, setPageAspectRatio] = useState(1.414);
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
      const maxWidth = isFullscreen ? 1280 : 940;
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
    setPageNumber(1);
    wheelDeltaRef.current = 0;
    flipBookRef.current?.pageFlip?.()?.turnToPage(0);
  }, [file]);

  const basePageWidth = useMemo(() => {
    const hasSpreadRoom = containerWidth >= 760;
    const availablePageWidth = hasSpreadRoom ? (containerWidth - 48) / 2 : containerWidth - 24;
    const maxPageWidth = isFullscreen ? 680 : 560;

    return clamp(Math.floor(availablePageWidth * scale), 240, maxPageWidth);
  }, [containerWidth, isFullscreen, scale]);

  const pageHeight = useMemo(
    () => Math.max(320, Math.round(basePageWidth * pageAspectRatio)),
    [basePageWidth, pageAspectRatio]
  );

  const totalPagesLabel = numPages ?? "...";

  const getPageFlip = useCallback(() => {
    try {
      return flipBookRef.current?.pageFlip?.() ?? null;
    } catch {
      return null;
    }
  }, []);

  const goToPreviousPage = useCallback(() => {
    getPageFlip()?.flipPrev("top");
  }, [getPageFlip]);

  const goToNextPage = useCallback(() => {
    getPageFlip()?.flipNext("top");
  }, [getPageFlip]);

  useEffect(() => {
    const node = readerRef.current;
    if (!node) {
      return;
    }

    const handleWheel = (event: WheelEvent) => {
      event.preventDefault();
      wheelDeltaRef.current +=
        Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;

      if (Math.abs(wheelDeltaRef.current) < 90) {
        return;
      }

      if (wheelDeltaRef.current > 0) {
        goToNextPage();
      } else {
        goToPreviousPage();
      }

      wheelDeltaRef.current = 0;
    };

    node.addEventListener("wheel", handleWheel, { passive: false });

    return () => {
      node.removeEventListener("wheel", handleWheel);
    };
  }, [goToNextPage, goToPreviousPage]);

  const handleReaderKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "ArrowRight" || event.key === "PageDown") {
      event.preventDefault();
      goToNextPage();
    }

    if (event.key === "ArrowLeft" || event.key === "PageUp") {
      event.preventDefault();
      goToPreviousPage();
    }
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
          ref={readerRef}
          onKeyDown={handleReaderKeyDown}
          className="pdf-page pdf-page-book mt-4 max-w-full rounded-md bg-slate-100 px-3 py-6 text-center"
          tabIndex={0}
        >
          <Document
            file={file}
            loading={<ViewerStatus>Loading book...</ViewerStatus>}
            error={<ViewerStatus>Unable to load this PDF.</ViewerStatus>}
            onLoadError={(error) => setLoadError(error.message)}
            onLoadSuccess={({ numPages: loadedPages }: { numPages: number }) => {
              setLoadError(null);
              setNumPages(loadedPages);
              setPageNumber((currentPage) => clamp(currentPage, 1, loadedPages));
            }}
          >
            {numPages ? (
              <HTMLFlipBook
                key={`${file}-${basePageWidth}-${pageHeight}`}
                ref={flipBookRef}
                autoSize
                className="pdf-flipbook"
                clickEventForward
                disableFlipByClick={false}
                drawShadow
                flippingTime={720}
                height={pageHeight}
                maxHeight={pageHeight}
                maxShadowOpacity={0.22}
                maxWidth={basePageWidth}
                minHeight={pageHeight}
                minWidth={basePageWidth}
                mobileScrollSupport
                onFlip={(event) => setPageNumber(Number(event.data) + 1)}
                onInit={(event) => setPageNumber(Number(event.data.page) + 1)}
                renderOnlyPageLengthChange={false}
                showCover
                showPageCorners
                size="fixed"
                startPage={pageNumber - 1}
                startZIndex={0}
                style={{ margin: "0 auto" }}
                swipeDistance={36}
                useMouseEvents
                usePortrait
                width={basePageWidth}
              >
                {Array.from({ length: numPages }, (_, index) => {
                  const renderedPageNumber = index + 1;

                  return (
                    <div
                      key={`${file}-${renderedPageNumber}`}
                      className="pdf-flipbook-page"
                      data-density={
                        renderedPageNumber === 1 || renderedPageNumber === numPages
                          ? "hard"
                          : "soft"
                      }
                    >
                      <Page
                        pageNumber={renderedPageNumber}
                        width={basePageWidth}
                        renderAnnotationLayer={false}
                        renderTextLayer={false}
                        onLoadSuccess={(page: PdfPageProxyLike) => {
                          if (renderedPageNumber === 1) {
                            const viewport = page.getViewport({ scale: 1 });
                            setPageAspectRatio(viewport.height / viewport.width);
                          }
                        }}
                      />
                    </div>
                  );
                })}
              </HTMLFlipBook>
            ) : null}
          </Document>
        </div>
      )}
    </section>
  );
}
