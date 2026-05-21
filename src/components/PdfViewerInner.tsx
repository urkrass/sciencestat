"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Minimize2,
  Search
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
  readerContext?: React.ReactNode;
  workspaceSwitch?: React.ReactNode;
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
    <div className="flex h-full min-h-0 items-center justify-center rounded-lg border border-dashed border-line bg-white p-8 text-center text-sm text-slate-600">
      {children}
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

type ReaderSize = {
  height: number;
  width: number;
};

const magnifierSize = 190;
const magnifierScale = 2.25;

export default function PdfViewerInner({
  file,
  title,
  readerContext,
  workspaceSwitch
}: PdfViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const readerRef = useRef<HTMLDivElement>(null);
  const magnifierCanvasRef = useRef<HTMLCanvasElement>(null);
  const flipBookRef = useRef<FlipBookRef | null>(null);
  const wheelDeltaRef = useRef(0);
  const [containerWidth, setContainerWidth] = useState(760);
  const [readerSize, setReaderSize] = useState<ReaderSize>({ height: 0, width: 0 });
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [pageAspectRatio, setPageAspectRatio] = useState(1.414);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [fullscreenError, setFullscreenError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMagnifierEnabled, setIsMagnifierEnabled] = useState(false);
  const [magnifierPosition, setMagnifierPosition] = useState({
    left: 0,
    top: 0,
    visible: false
  });

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
    const node = readerRef.current;
    if (!node) {
      return;
    }

    const updateReaderSize = () => {
      const rect = node.getBoundingClientRect();
      setReaderSize({
        height: Math.floor(rect.height),
        width: Math.floor(rect.width)
      });
    };

    updateReaderSize();

    const observer = new ResizeObserver(updateReaderSize);
    observer.observe(node);

    return () => observer.disconnect();
  }, [isFullscreen, loadError, numPages]);

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

  const readerWidth = isFullscreen && readerSize.width ? readerSize.width : containerWidth;
  const shouldUsePortrait = readerWidth < 760;

  const basePageWidth = useMemo(() => {
    const horizontalPadding = isFullscreen ? 32 : 24;
    const hasSpreadRoom = !shouldUsePortrait;
    const availablePageWidth = hasSpreadRoom
      ? (readerWidth - horizontalPadding * 2 - 16) / 2
      : readerWidth - horizontalPadding;
    const availablePageHeight = readerSize.height
      ? (readerSize.height - (isFullscreen ? 40 : 28)) / pageAspectRatio
      : Infinity;
    const maxPageWidth = isFullscreen ? 680 : 560;
    const minPageWidth = isFullscreen ? 160 : 240;

    return clamp(
      Math.floor(Math.min(availablePageWidth, availablePageHeight, maxPageWidth)),
      minPageWidth,
      maxPageWidth
    );
  }, [isFullscreen, pageAspectRatio, readerSize.height, readerWidth, shouldUsePortrait]);

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

  const hideMagnifier = () => {
    setMagnifierPosition((currentPosition) => ({
      ...currentPosition,
      visible: false
    }));
  };

  const handleReaderPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (!isMagnifierEnabled) {
      return;
    }

    const reader = readerRef.current;
    const lensCanvas = magnifierCanvasRef.current;

    if (!reader || !lensCanvas) {
      return;
    }

    const sourceCanvas = document
      .elementsFromPoint(event.clientX, event.clientY)
      .find(
        (element): element is HTMLCanvasElement =>
          element instanceof HTMLCanvasElement && Boolean(element.closest(".pdf-flipbook"))
      );

    if (!sourceCanvas) {
      hideMagnifier();
      return;
    }

    const readerRect = reader.getBoundingClientRect();
    const sourceRect = sourceCanvas.getBoundingClientRect();

    if (sourceRect.width <= 0 || sourceRect.height <= 0) {
      hideMagnifier();
      return;
    }

    const devicePixelRatio = window.devicePixelRatio || 1;
    const lensPixelSize = Math.round(magnifierSize * devicePixelRatio);

    if (lensCanvas.width !== lensPixelSize || lensCanvas.height !== lensPixelSize) {
      lensCanvas.width = lensPixelSize;
      lensCanvas.height = lensPixelSize;
    }

    const sourceScaleX = sourceCanvas.width / sourceRect.width;
    const sourceScaleY = sourceCanvas.height / sourceRect.height;
    const pointerX = (event.clientX - sourceRect.left) * sourceScaleX;
    const pointerY = (event.clientY - sourceRect.top) * sourceScaleY;
    const sourceWidth = (magnifierSize / magnifierScale) * sourceScaleX;
    const sourceHeight = (magnifierSize / magnifierScale) * sourceScaleY;
    const sourceX = clamp(pointerX - sourceWidth / 2, 0, sourceCanvas.width - sourceWidth);
    const sourceY = clamp(pointerY - sourceHeight / 2, 0, sourceCanvas.height - sourceHeight);
    const context = lensCanvas.getContext("2d");

    if (!context) {
      return;
    }

    context.clearRect(0, 0, lensCanvas.width, lensCanvas.height);
    context.imageSmoothingEnabled = true;
    context.imageSmoothingQuality = "high";
    context.drawImage(
      sourceCanvas,
      sourceX,
      sourceY,
      sourceWidth,
      sourceHeight,
      0,
      0,
      lensCanvas.width,
      lensCanvas.height
    );

    const maxLensLeft = Math.max(8, readerRect.width - magnifierSize - 8);
    const maxLensTop = Math.max(8, readerRect.height - magnifierSize - 8);

    setMagnifierPosition({
      left: clamp(event.clientX - readerRect.left - magnifierSize / 2, 8, maxLensLeft),
      top: clamp(event.clientY - readerRect.top - magnifierSize / 2, 8, maxLensTop),
      visible: true
    });
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
      className="pdf-viewer-shell flex h-full min-h-0 min-w-0 flex-col overflow-hidden rounded-lg border border-line bg-white p-3 shadow-sm sm:p-4"
    >
      <div className="pdf-viewer-toolbar flex shrink-0 flex-col gap-3 border-b border-line pb-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex min-w-0 flex-wrap items-center gap-3">
          <div>
            <h2 className="text-base font-semibold text-ink">Reader</h2>
            <p className="text-sm text-slate-500">
              Page {pageNumber} / {totalPagesLabel}
            </p>
          </div>
          {workspaceSwitch}
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
            onClick={() => {
              setIsMagnifierEnabled((enabled) => !enabled);
              hideMagnifier();
            }}
            aria-pressed={isMagnifierEnabled}
            className={[
              "inline-flex h-10 w-10 items-center justify-center rounded-md border transition",
              isMagnifierEnabled
                ? "border-moss bg-moss text-white hover:bg-moss-dark"
                : "border-line text-ink hover:border-moss hover:text-moss"
            ].join(" ")}
            aria-label={
              isMagnifierEnabled ? "Disable magnifying glass" : "Enable magnifying glass"
            }
            title={isMagnifierEnabled ? "Disable magnifying glass" : "Enable magnifying glass"}
          >
            <Search aria-hidden="true" className="h-4 w-4" />
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
      {readerContext && !isFullscreen ? (
        <div className="mt-2 shrink-0">{readerContext}</div>
      ) : null}

      {loadError ? (
        <ViewerStatus>{loadError}</ViewerStatus>
      ) : (
        <div
          ref={readerRef}
          onKeyDown={handleReaderKeyDown}
          onPointerLeave={hideMagnifier}
          onPointerMove={handleReaderPointerMove}
          className={[
            "pdf-page pdf-page-book mt-4 flex min-h-0 flex-1 items-center justify-center rounded-md bg-slate-100 px-3 py-4 text-center",
            isMagnifierEnabled ? "pdf-page-book-magnifying" : ""
          ].join(" ")}
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
                useMouseEvents={!isMagnifierEnabled}
                usePortrait={shouldUsePortrait}
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
          {isMagnifierEnabled ? (
            <canvas
              ref={magnifierCanvasRef}
              aria-hidden="true"
              className="pdf-magnifier-lens"
              style={{
                height: magnifierSize,
                left: magnifierPosition.left,
                opacity: magnifierPosition.visible ? 1 : 0,
                top: magnifierPosition.top,
                width: magnifierSize
              }}
            />
          ) : null}
        </div>
      )}
    </section>
  );
}
