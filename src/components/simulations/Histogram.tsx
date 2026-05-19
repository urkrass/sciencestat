import { roundTo } from "@/lib/statistics/summary";

type HistogramProps = {
  values: number[];
  referenceValue: number;
  xLabel: string;
  yLabel: string;
  animationKey?: number;
};

type HistogramBin = {
  start: number;
  end: number;
  count: number;
};

function buildBins(values: number[], min: number, max: number): HistogramBin[] {
  const binCount = Math.min(24, Math.max(12, Math.round(Math.sqrt(values.length))));
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

export function Histogram({
  values,
  referenceValue,
  xLabel,
  yLabel,
  animationKey = 0
}: HistogramProps) {
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

  const referenceX = xScale(referenceValue);

  return (
    <svg
      role="img"
      aria-label="Histogram of simulated sample means with a reference line at the true population mean"
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full overflow-visible"
    >
      <title>Histogram of sample means</title>
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
            fill="#367765"
            opacity="0.82"
            style={{ animationDelay: `${index * 18}ms` }}
          />
        );
      })}
      <line
        className="simulation-reference-line"
        x1={referenceX}
        x2={referenceX}
        y1={margin.top - 2}
        y2={margin.top + innerHeight}
        stroke="#9a5a32"
        strokeWidth="2"
        strokeDasharray="5 5"
      />
      <text
        x={referenceX}
        y={margin.top - 7}
        textAnchor="middle"
        fill="#9a5a32"
        fontSize="13"
        fontWeight="600"
      >
        true mean 50
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
        x={referenceX}
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
        {xLabel}
      </text>
      <text
        x={22}
        y={margin.top + innerHeight / 2}
        textAnchor="middle"
        transform={`rotate(-90 22 ${margin.top + innerHeight / 2})`}
        fill="#172033"
        fontSize="13"
        fontWeight="600"
      >
        {yLabel}
      </text>
      <text
        x={margin.left - 9}
        y={margin.top + innerHeight + 4}
        textAnchor="end"
        fill="#4b5870"
        fontSize="12"
      >
        0
      </text>
      <text
        x={margin.left - 9}
        y={margin.top + 4}
        textAnchor="end"
        fill="#4b5870"
        fontSize="12"
      >
        {maxCount}
      </text>
    </svg>
  );
}
