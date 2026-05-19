function normalizeSeed(seed: number): number {
  const normalized = Math.trunc(seed) >>> 0;
  return normalized === 0 ? 1 : normalized;
}

export function createSeededRandom(seed: number): () => number {
  let state = normalizeSeed(seed);

  return () => {
    state += 0x6d2b79f5;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomNormal(
  rng: () => number,
  distributionMean: number,
  standardDeviation: number
): number {
  let first = 0;
  let second = 0;

  while (first === 0) {
    first = rng();
  }

  while (second === 0) {
    second = rng();
  }

  const standardNormal =
    Math.sqrt(-2 * Math.log(first)) * Math.cos(2 * Math.PI * second);

  return distributionMean + standardNormal * standardDeviation;
}

export function randomUniform(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

export function randomSkewed(
  rng: () => number,
  distributionMean: number,
  standardDeviation: number
): number {
  const value = Math.max(rng(), Number.EPSILON);
  const exponentialLike = -Math.log(value);

  return distributionMean + (exponentialLike - 1) * standardDeviation;
}
