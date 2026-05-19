export function mean(values: number[]): number {
  if (values.length === 0) {
    return Number.NaN;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

export function sampleStandardDeviation(values: number[]): number {
  if (values.length < 2) {
    return 0;
  }

  const average = mean(values);
  const sumOfSquares = values.reduce((total, value) => {
    const difference = value - average;
    return total + difference * difference;
  }, 0);

  return Math.sqrt(sumOfSquares / (values.length - 1));
}

export function roundTo(value: number, digits: number): string {
  if (!Number.isFinite(value)) {
    return "n/a";
  }

  return value.toFixed(digits);
}
