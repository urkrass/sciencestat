import type { TailMode } from "@/lib/statistics/inference";
import { roundTo } from "@/lib/statistics/summary";

type NullModelHistogramProps = {
  values: number[];
  nullMean: number;
  observedMean: number;
  tailMode: TailMode;
  animationKey: number;
};

type HistogramBin = {
  start: number;
  end: number;
  count: number;
};

function buildBins(values: number[], min: number, max: number): HistogramBin[] {
  const binCount = Math.min(28, Math.max(14, Math.round(Math.sqrt(values.length))));
  const binWidth = (max - min) / binCount;
  const bins = Array.from({ length: binCount }, (_, index) => ({
    start: min + index * binWidth,
    end: min + (index + 1) * binWidth,
    count: 0
  }));

  values.forEach((value) => {
    const rawIndex = Math.floor((value - min) / binWidth);
    const index = Math.min(binCount - 1, Math.max(0, rawIndex));
    bins[index].count += 1;
  });

  return bins;
}

export function NullModelHistogram({
  values,
  nullMean,
  observedMean,
  tailMode,
  animationKey
}: NullModelHistogramProps) {
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
  const height = 410;
  const margin = {
    top: 34,
    right: 28,
    bottom: 62,
    left: 64
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;

  const xScale = (value: number) =>
    margin.left + ((value - min) / (max - min)) * innerWidth;
  const yScale = (count: number) =>
    margin.top + innerHeight - (count / maxCount) * innerHeight;

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
      aria-label={`Null model histogram with ${tailLabel} shaded, a dashed line for the null mean, and a line for the observed sample mean`}
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full overflow-visible"
    >
      <title>Null model simulation: {tailLabel}</title>
      <rect width={width} height={height} rx="8" fill="#f9faf6" />
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
          <rect
            key={`${animationKey}-${bin.start}-${bin.end}`}
            className="simulation-histogram-bar"
            x={barX + 1}
            y={barY}
            width={Math.max(1, nextX - barX - 2)}
            height={barHeight}
            fill={isExtreme ? "#b25b35" : "#367765"}
            opacity={isExtreme ? "0.74" : "0.82"}
            style={{ animationDelay: `${index * 16}ms` }}
          />
        );
      })}
      <line
        className="simulation-reference-line"
        x1={nullX}
        x2={nullX}
        y1={margin.top - 2}
        y2={margin.top + innerHeight}
        stroke="#2f6f5f"
        strokeDasharray="5 5"
        strokeWidth="2"
      />
      <line
        className="simulation-reference-line"
        x1={observedX}
        x2={observedX}
        y1={margin.top - 2}
        y2={margin.top + innerHeight}
        stroke="#9a5a32"
        strokeWidth="2"
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
