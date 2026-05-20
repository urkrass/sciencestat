"use client";

import { bin as createBinGenerator } from "d3-array";
import { scaleLinear } from "d3-scale";
import { motion, useReducedMotion } from "motion/react";
import type { TailMode } from "@/lib/statistics/inference";
import { roundTo } from "@/lib/statistics/summary";

type NullModelHistogramProps = {
  values: number[];
  nullMean: number;
  observedMean: number;
  tailMode: TailMode;
  animationKey: number;
  compact?: boolean;
  ariaLabel?: string;
  title?: string;
};

type HistogramBin = {
  start: number;
  end: number;
  count: number;
};

function svgNumber(value: number) {
  return Number.isFinite(value) ? Number(value.toFixed(3)) : 0;
}

function buildBins(values: number[], min: number, max: number): HistogramBin[] {
  const binCount = Math.min(28, Math.max(14, Math.round(Math.sqrt(values.length))));
  const bins = createBinGenerator()
    .domain([min, max])
    .thresholds(binCount)(values);

  return bins.map((bin) => ({
    start: bin.x0 ?? min,
    end: bin.x1 ?? max,
    count: bin.length
  }));
}

export function NullModelHistogram({
  values,
  nullMean,
  observedMean,
  tailMode,
  animationKey,
  compact = false,
  ariaLabel,
  title
}: NullModelHistogramProps) {
  const shouldReduceMotion = useReducedMotion();
  const observedDistance = Math.abs(observedMean - nullMean);
  const rawMin =
    tailMode === "twoSided"
      ? Math.min(nullMean - observedDistance, observedMean, ...values)
      : Math.min(nullMean, observedMean, ...values);
  const rawMax =
    tailMode === "twoSided"
      ? Math.max(nullMean + observedDistance, observedMean, ...values)
      : Math.max(nullMean, observedMean, ...values);
  const rawRange = rawMax - rawMin || 1;
  const min = rawMin - rawRange * 0.08;
  const max = rawMax + rawRange * 0.08;
  const bins = buildBins(values, min, max);
  const maxCount = Math.max(...bins.map((bin) => bin.count), 1);

  const width = 760;
  const height = compact ? 330 : 410;
  const margin = {
    top: compact ? 30 : 34,
    right: 28,
    bottom: compact ? 54 : 62,
    left: 64
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScaleRaw = scaleLinear()
    .domain([min, max])
    .range([margin.left, margin.left + innerWidth]);
  const yScaleRaw = scaleLinear()
    .domain([0, maxCount])
    .range([margin.top + innerHeight, margin.top]);
  const xScale = (value: number) => svgNumber(xScaleRaw(value));
  const yScale = (count: number) => svgNumber(yScaleRaw(count));

  const nullX = xScale(nullMean);
  const observedX = xScale(observedMean);
  const tailLabel =
    tailMode === "greater"
      ? "greater-than tail"
      : tailMode === "less"
        ? "less-than tail"
        : "two-tailed extremes";

  const isExtremeBin = (binCenter: number) => {
    if (tailMode === "greater") {
      return binCenter >= observedMean;
    }

    if (tailMode === "less") {
      return binCenter <= observedMean;
    }

    return Math.abs(binCenter - nullMean) >= observedDistance;
  };

  return (
    <svg
      role="img"
      aria-label={
        ariaLabel ??
        `Null model histogram with ${tailLabel} shaded, a dashed line for the null mean, and a line for the observed sample mean`
      }
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full overflow-visible"
    >
      <title>{title ?? `Null model simulation: ${tailLabel}`}</title>
      <rect width={width} height={height} rx="8" fill="#f9faf6" />
      {!shouldReduceMotion ? (
        <motion.rect
          key={`wash-${animationKey}`}
          initial={{ x: margin.left - innerWidth * 0.55, opacity: 0.34 }}
          animate={{ x: margin.left + innerWidth * 0.85, opacity: 0 }}
          transition={{ duration: 0.78, ease: "easeOut" }}
          y={margin.top}
          width={innerWidth * 0.7}
          height={innerHeight}
          fill="#dfece6"
        />
      ) : null}
      <line
        x1={margin.left}
        x2={margin.left + innerWidth}
        y1={margin.top + innerHeight}
        y2={margin.top + innerHeight}
        stroke="#8b98aa"
        strokeWidth="1"
      />
      <line
        x1={margin.left}
        x2={margin.left}
        y1={margin.top}
        y2={margin.top + innerHeight}
        stroke="#8b98aa"
        strokeWidth="1"
      />
      {bins.map((bin, index) => {
        const binCenter = (bin.start + bin.end) / 2;
        const isExtreme = isExtremeBin(binCenter);
        const barX = xScale(bin.start);
        const nextX = xScale(bin.end);
        const barY = yScale(bin.count);
        const barHeight = margin.top + innerHeight - barY;

        return (
          <motion.rect
            key={`${animationKey}-${bin.start}-${bin.end}`}
            x={barX + 1}
            y={barY}
            width={Math.max(1, nextX - barX - 2)}
            height={barHeight}
            fill={isExtreme ? "#b25b35" : "#367765"}
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, scaleY: 0.08 }
            }
            animate={{
              opacity: isExtreme && !shouldReduceMotion ? [0, 0.94, 0.74] : isExtreme ? 0.74 : 0.82,
              scaleY: 1
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : isExtreme ? 0.68 : 0.52,
              delay: shouldReduceMotion ? 0 : index * 0.016,
              ease: [0.2, 0.85, 0.25, 1]
            }}
            style={{
              transformBox: "fill-box",
              transformOrigin: "center bottom"
            }}
          />
        );
      })}
      <motion.line
        x1={nullX}
        x2={nullX}
        y1={margin.top - 2}
        y2={margin.top + innerHeight}
        stroke="#2f6f5f"
        strokeDasharray="5 5"
        strokeWidth="2"
        initial={shouldReduceMotion ? false : { opacity: 0, pathLength: 0 }}
        animate={{ opacity: 1, pathLength: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.68, ease: "easeOut" }}
      />
      <motion.line
        x1={observedX}
        x2={observedX}
        y1={margin.top - 2}
        y2={margin.top + innerHeight}
        stroke="#9a5a32"
        strokeWidth="2"
        initial={shouldReduceMotion ? false : { opacity: 0, pathLength: 0 }}
        animate={{ opacity: 1, pathLength: 1 }}
        transition={{
          duration: shouldReduceMotion ? 0 : 0.68,
          delay: shouldReduceMotion ? 0 : 0.08,
          ease: "easeOut"
        }}
      />
      <text
        x={nullX}
        y={margin.top - 10}
        textAnchor="middle"
        fill="#2f6f5f"
        fontSize="13"
        fontWeight="600"
      >
        null mean
      </text>
      <text
        x={observedX}
        y={margin.top + 16}
        textAnchor="middle"
        fill="#9a5a32"
        fontSize="13"
        fontWeight="600"
      >
        observed
      </text>
      <text
        x={margin.left}
        y={margin.top + innerHeight + 28}
        textAnchor="middle"
        fill="#4b5870"
        fontSize="12"
      >
        {roundTo(min, 1)}
      </text>
      <text
        x={nullX}
        y={margin.top + innerHeight + 28}
        textAnchor="middle"
        fill="#4b5870"
        fontSize="12"
      >
        {roundTo(nullMean, 1)}
      </text>
      <text
        x={margin.left + innerWidth}
        y={margin.top + innerHeight + 28}
        textAnchor="middle"
        fill="#4b5870"
        fontSize="12"
      >
        {roundTo(max, 1)}
      </text>
      <text
        x={margin.left + innerWidth / 2}
        y={height - 13}
        textAnchor="middle"
        fill="#172033"
        fontSize="13"
        fontWeight="600"
      >
        simulated sample mean under the null
      </text>
    </svg>
  );
}
