"use client";

import { bin as createBinGenerator } from "d3-array";
import { scaleLinear } from "d3-scale";
import { motion, useReducedMotion } from "motion/react";
import { roundTo } from "@/lib/statistics/summary";

type HistogramProps = {
  values: number[];
  referenceValue: number;
  xLabel: string;
  yLabel: string;
  animationKey?: number;
  compact?: boolean;
  ariaLabel?: string;
  title?: string;
};

type HistogramBin = {
  start: number;
  end: number;
  count: number;
};

function buildBins(values: number[], min: number, max: number): HistogramBin[] {
  const binCount = Math.min(24, Math.max(12, Math.round(Math.sqrt(values.length))));
  const bins = createBinGenerator()
    .domain([min, max])
    .thresholds(binCount)(values);

  return bins.map((bin) => ({
    start: bin.x0 ?? min,
    end: bin.x1 ?? max,
    count: bin.length
  }));
}

export function Histogram({
  values,
  referenceValue,
  xLabel,
  yLabel,
  animationKey = 0,
  compact = false,
  ariaLabel = "Histogram of simulated sample means with a reference line at the true population mean",
  title = "Histogram of sample means"
}: HistogramProps) {
  const shouldReduceMotion = useReducedMotion();

  if (values.length === 0) {
    return (
      <div className="flex h-72 items-center justify-center rounded-lg border border-line bg-paper text-sm text-slate-500">
        Run the simulation to draw a histogram.
      </div>
    );
  }

  const rawMin = Math.min(referenceValue, ...values);
  const rawMax = Math.max(referenceValue, ...values);
  const rawRange = rawMax - rawMin || 1;
  const min = rawMin - rawRange * 0.08;
  const max = rawMax + rawRange * 0.08;
  const bins = buildBins(values, min, max);
  const maxCount = Math.max(...bins.map((bin) => bin.count), 1);

  const width = compact ? 680 : 760;
  const height = compact ? 330 : 410;
  const margin = {
    top: compact ? 30 : 34,
    right: compact ? 24 : 28,
    bottom: compact ? 52 : 62,
    left: compact ? 58 : 64
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = scaleLinear()
    .domain([min, max])
    .range([margin.left, margin.left + innerWidth]);
  const yScale = scaleLinear()
    .domain([0, maxCount])
    .range([margin.top + innerHeight, margin.top]);

  const referenceX = xScale(referenceValue);
  const yTicks = Array.from({ length: 4 }, (_, index) =>
    Math.round((maxCount / 3) * index)
  );

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
      <line
        x1={margin.left}
        x2={margin.left}
        y1={margin.top}
        y2={margin.top + innerHeight}
        stroke="#8b98aa"
        strokeWidth="1"
      />
      {yTicks.slice(1).map((tick) => {
        const tickY = yScale(tick);

        return (
          <g key={tick}>
            <line
              x1={margin.left}
              x2={margin.left + innerWidth}
              y1={tickY}
              y2={tickY}
              stroke="#d9dee7"
              strokeWidth="1"
            />
            <text
              x={margin.left - 9}
              y={tickY + 4}
              textAnchor="end"
              fill="#4b5870"
              fontSize={compact ? "11" : "12"}
            >
              {tick}
            </text>
          </g>
        );
      })}
      {bins.map((bin, index) => {
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
            fill="#367765"
            initial={
              shouldReduceMotion
                ? false
                : { opacity: 0, scaleY: 0.08 }
            }
            animate={{ opacity: 0.82, scaleY: 1 }}
            transition={{
              duration: shouldReduceMotion ? 0 : 0.52,
              delay: shouldReduceMotion ? 0 : index * 0.018,
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
        x1={referenceX}
        x2={referenceX}
        y1={margin.top - 2}
        y2={margin.top + innerHeight}
        stroke="#9a5a32"
        strokeWidth="2"
        strokeDasharray="5 5"
        initial={shouldReduceMotion ? false : { opacity: 0, pathLength: 0 }}
        animate={{ opacity: 1, pathLength: 1 }}
        transition={{ duration: shouldReduceMotion ? 0 : 0.68, ease: "easeOut" }}
      />
      <text
        x={referenceX}
        y={margin.top - 7}
        textAnchor="middle"
        fill="#9a5a32"
        fontSize={compact ? "11" : "13"}
        fontWeight="600"
      >
        true mean 50
      </text>
      <text
        x={margin.left}
        y={margin.top + innerHeight + 28}
        textAnchor="middle"
        fill="#4b5870"
        fontSize={compact ? "11" : "12"}
      >
        {roundTo(min, 1)}
      </text>
      <text
        x={referenceX}
        y={margin.top + innerHeight + 28}
        textAnchor="middle"
        fill="#4b5870"
        fontSize={compact ? "11" : "12"}
      >
        50
      </text>
      <text
        x={margin.left + innerWidth}
        y={margin.top + innerHeight + 28}
        textAnchor="middle"
        fill="#4b5870"
        fontSize={compact ? "11" : "12"}
      >
        {roundTo(max, 1)}
      </text>
      <text
        x={margin.left + innerWidth / 2}
        y={height - 13}
        textAnchor="middle"
        fill="#172033"
        fontSize={compact ? "12" : "13"}
        fontWeight="600"
      >
        {xLabel}
      </text>
      <text
        x={22}
        y={margin.top + innerHeight / 2}
        textAnchor="middle"
        transform={`rotate(-90 22 ${margin.top + innerHeight / 2})`}
        fill="#172033"
        fontSize={compact ? "12" : "13"}
        fontWeight="600"
      >
        {yLabel}
      </text>
      <text
        x={margin.left - 9}
        y={margin.top + innerHeight + 4}
        textAnchor="end"
        fill="#4b5870"
        fontSize={compact ? "11" : "12"}
      >
        0
      </text>
    </svg>
  );
}
