import type { ConfidenceInterval } from "@/lib/statistics/inference";
import { roundTo } from "@/lib/statistics/summary";

type ConfidenceIntervalPlotProps = {
  intervals: ConfidenceInterval[];
  trueMean: number;
  animationKey: number;
};

export function ConfidenceIntervalPlot({
  intervals,
  trueMean,
  animationKey
}: ConfidenceIntervalPlotProps) {
  const visibleIntervals = intervals.slice(0, 80);
  const rawMin = Math.min(trueMean, ...visibleIntervals.map((interval) => interval.lower));
  const rawMax = Math.max(trueMean, ...visibleIntervals.map((interval) => interval.upper));
  const rawRange = rawMax - rawMin || 1;
  const min = rawMin - rawRange * 0.08;
  const max = rawMax + rawRange * 0.08;

  const width = 760;
  const height = 410;
  const margin = {
    top: 40,
    right: 28,
    bottom: 58,
    left: 64
  };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  const rowGap = innerHeight / Math.max(visibleIntervals.length - 1, 1);

  const xScale = (value: number) =>
    margin.left + ((value - min) / (max - min)) * innerWidth;
  const trueMeanX = xScale(trueMean);

  return (
    <svg
      role="img"
      aria-label="Simulated confidence intervals with a vertical line marking the true population mean"
      viewBox={`0 0 ${width} ${height}`}
      className="h-auto w-full overflow-visible"
    >
      <title>Confidence interval coverage plot</title>
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
        className="simulation-reference-line"
        x1={trueMeanX}
        x2={trueMeanX}
        y1={margin.top - 4}
        y2={margin.top + innerHeight}
        stroke="#9a5a32"
        strokeDasharray="5 5"
        strokeWidth="2"
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
          <g
            key={`${animationKey}-${index}-${interval.lower}-${interval.upper}`}
            className="simulation-ci-interval"
            style={{ animationDelay: `${index * 8}ms` }}
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
          </g>
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
