"use client";

import { scaleLinear } from "d3-scale";
import { motion, useReducedMotion } from "motion/react";
import type { ConfidenceInterval } from "@/lib/statistics/inference";
import { roundTo } from "@/lib/statistics/summary";

type ConfidenceIntervalPlotProps = {
  intervals: ConfidenceInterval[];
  trueMean: number;
  animationKey: number;
  compact?: boolean;
  ariaLabel?: string;
  title?: string;
};

function svgNumber(value: number) {
  return Number.isFinite(value) ? Number(value.toFixed(3)) : 0;
}

export function ConfidenceIntervalPlot({
  intervals,
  trueMean,
  animationKey,
  compact = false,
  ariaLabel = "Simulated confidence intervals with a vertical line marking the true population mean",
  title = "Confidence interval coverage plot"
}: ConfidenceIntervalPlotProps) {
  const shouldReduceMotion = useReducedMotion();
  const visibleIntervals = intervals.slice(0, compact ? 60 : 80);
  const rawMin = Math.min(trueMean, ...visibleIntervals.map((interval) => interval.lower));
  const rawMax = Math.max(trueMean, ...visibleIntervals.map((interval) => interval.upper));
  const rawRange = rawMax - rawMin || 1;
  const min = rawMin - rawRange * 0.08;
  const max = rawMax + rawRange * 0.08;

  const width = 760;
  const height = compact ? 330 : 410;
  const margin = {
    top: compact ? 34 : 40,
    right: 28,
    bottom: compact ? 52 : 58,
    left: 64
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const rowGap = innerHeight / Math.max(visibleIntervals.length - 1, 1);

  const xScaleRaw = scaleLinear()
    .domain([min, max])
    .range([margin.left, margin.left + innerWidth]);
  const xScale = (value: number) => svgNumber(xScaleRaw(value));
  const trueMeanX = xScale(trueMean);

  return (
    <svg
      role="img"
      aria-label={ariaLabel}
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full overflow-visible"
    >
      <title>{title}</title>
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
      <motion.line
        x1={trueMeanX}
        x2={trueMeanX}
        y1={margin.top - 4}
        y2={margin.top + innerHeight}
        stroke="#9a5a32"
        strokeDasharray="5 5"
        strokeWidth="2"
        initial={shouldReduceMotion ? false : { opacity: 0, pathLength: 0 }}
        animate={{ opacity: 1, pathLength: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.68, ease: "easeOut" }}
      />
      <text
        x={trueMeanX}
        y={margin.top - 10}
        textAnchor="middle"
        fill="#9a5a32"
        fontSize="13"
        fontWeight="600"
      >
        true mean 50
      </text>
      {visibleIntervals.map((interval, index) => {
        const y = margin.top + rowGap * index;
        const intervalColor = interval.capturesMean ? "#367765" : "#b25b35";

        return (
          <motion.g
            key={`${animationKey}-${index}-${interval.lower}-${interval.upper}`}
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, scaleX: 0.08 }
            }
            animate={{
              opacity:
                !interval.capturesMean && !shouldReduceMotion
                  ? [0, 1, 0.86]
                  : 0.86,
              scaleX: 1
            }}
            transition={{
              duration: shouldReduceMotion ? 0 : !interval.capturesMean ? 0.68 : 0.52,
              delay: shouldReduceMotion ? 0 : index * 0.008,
              ease: [0.2, 0.85, 0.25, 1]
            }}
            style={{
              transformBox: "fill-box",
              transformOrigin: "left center"
            }}
          >
            <line
              x1={xScale(interval.lower)}
              x2={xScale(interval.upper)}
              y1={y}
              y2={y}
              stroke={intervalColor}
              strokeLinecap="round"
              strokeWidth="2"
              opacity="0.86"
            />
            <circle
              cx={xScale(interval.sampleMean)}
              cy={y}
              r="2.4"
              fill={intervalColor}
            />
          </motion.g>
        );
      })}
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
        x={trueMeanX}
        y={margin.top + innerHeight + 28}
        textAnchor="middle"
        fill="#4b5870"
        fontSize="12"
      >
        50
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
        interval estimate for the mean
      </text>
    </svg>
  );
}
