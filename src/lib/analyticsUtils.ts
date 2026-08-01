/** Advanced analytics utilities for data analysis */

import type { PricePoint, MarketSeries } from "./analyticsData";

export interface CorrelationResult {
  correlation: number;
  strength: "weak" | "moderate" | "strong";
  direction: "positive" | "negative" | "neutral";
}

export interface StatisticsSummary {
  mean: number;
  median: number;
  mode: number;
  standardDeviation: number;
  variance: number;
  range: number;
  quartiles: {
    q1: number;
    q2: number;
    q3: number;
  };
  skewness: number;
  kurtosis: number;
}

export function calculateCorrelation(series1: number[], series2: number[]): CorrelationResult {
  const n = Math.min(series1.length, series2.length);
  if (n < 2) return { correlation: 0, strength: "weak", direction: "neutral" };

  const mean1 = series1.slice(0, n).reduce((a, b) => a + b, 0) / n;
  const mean2 = series2.slice(0, n).reduce((a, b) => a + b, 0) / n;

  let numerator = 0;
  let denominator1 = 0;
  let denominator2 = 0;

  for (let i = 0; i < n; i++) {
    const diff1 = series1[i] - mean1;
    const diff2 = series2[i] - mean2;
    numerator += diff1 * diff2;
    denominator1 += diff1 * diff1;
    denominator2 += diff2 * diff2;
  }

  const correlation = denominator1 && denominator2 ? numerator / Math.sqrt(denominator1 * denominator2) : 0;

  let strength: "weak" | "moderate" | "strong";
  const absCorr = Math.abs(correlation);
  if (absCorr < 0.3) strength = "weak";
  else if (absCorr < 0.7) strength = "moderate";
  else strength = "strong";

  let direction: "positive" | "negative" | "neutral";
  if (correlation > 0.1) direction = "positive";
  else if (correlation < -0.1) direction = "negative";
  else direction = "neutral";

  return { correlation, strength, direction };
}

export function calculateStatistics(values: number[]): StatisticsSummary {
  if (values.length === 0) {
    return {
      mean: 0,
      median: 0,
      mode: 0,
      standardDeviation: 0,
      variance: 0,
      range: 0,
      quartiles: { q1: 0, q2: 0, q3: 0 },
      skewness: 0,
      kurtosis: 0,
    };
  }

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;

  // Mean
  const mean = sorted.reduce((a, b) => a + b, 0) / n;

  // Median
  const median = n % 2 === 0 ? (sorted[n / 2 - 1] + sorted[n / 2]) / 2 : sorted[Math.floor(n / 2)];

  // Mode
  const frequency: Record<number, number> = {};
  sorted.forEach((v) => {
    frequency[v] = (frequency[v] || 0) + 1;
  });
  const mode = Object.entries(frequency).reduce((a, b) => (frequency[a[0]] > frequency[b[0]] ? a : b))[0];

  // Variance and Standard Deviation
  const variance = sorted.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / n;
  const standardDeviation = Math.sqrt(variance);

  // Range
  const range = sorted[n - 1] - sorted[0];

  // Quartiles
  const q1 = sorted[Math.floor(n * 0.25)];
  const q2 = median;
  const q3 = sorted[Math.floor(n * 0.75)];

  // Skewness
  const skewness =
    sorted.reduce((sum, val) => sum + Math.pow((val - mean) / standardDeviation, 3), 0) / n;

  // Kurtosis
  const kurtosis =
    sorted.reduce((sum, val) => sum + Math.pow((val - mean) / standardDeviation, 4), 0) / n - 3;

  return {
    mean,
    median,
    mode: parseFloat(mode),
    standardDeviation,
    variance,
    range,
    quartiles: { q1, q2, q3 },
    skewness,
    kurtosis,
  };
}

export function detectOutliers(values: number[], multiplier: number = 1.5): {
  outliers: number[];
  lowerBound: number;
  upperBound: number;
} {
  if (values.length === 0) return { outliers: [], lowerBound: 0, upperBound: 0 };

  const sorted = [...values].sort((a, b) => a - b);
  const n = sorted.length;
  const q1 = sorted[Math.floor(n * 0.25)];
  const q3 = sorted[Math.floor(n * 0.75)];
  const iqr = q3 - q1;

  const lowerBound = q1 - multiplier * iqr;
  const upperBound = q3 + multiplier * iqr;

  const outliers = sorted.filter((v) => v < lowerBound || v > upperBound);

  return { outliers, lowerBound, upperBound };
}

export function calculateMovingAverage(values: number[], period: number): number[] {
  const result: number[] = [];
  for (let i = period - 1; i < values.length; i++) {
    const slice = values.slice(i - period + 1, i + 1);
    const avg = slice.reduce((a, b) => a + b, 0) / period;
    result.push(avg);
  }
  return result;
}

export function calculateTrend(values: number[]): {
  slope: number;
  intercept: number;
  rSquared: number;
  direction: "upward" | "downward" | "sideways";
} {
  const n = values.length;
  if (n < 2) return { slope: 0, intercept: 0, rSquared: 0, direction: "sideways" };

  const xValues = Array.from({ length: n }, (_, i) => i);
  const sumX = xValues.reduce((a, b) => a + b, 0);
  const sumY = values.reduce((a, b) => a + b, 0);
  const sumXY = xValues.reduce((sum, x, i) => sum + x * values[i], 0);
  const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);
  const sumY2 = values.reduce((sum, y) => sum + y * y, 0);

  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;

  const ssTotal = sumY2 - (sumY * sumY) / n;
  const ssResidual = values.reduce((sum, y, i) => {
    const predicted = slope * i + intercept;
    return sum + Math.pow(y - predicted, 2);
  }, 0);
  const rSquared = ssTotal ? 1 - ssResidual / ssTotal : 0;

  let direction: "upward" | "downward" | "sideways";
  if (Math.abs(slope) < 0.01) direction = "sideways";
  else direction = slope > 0 ? "upward" : "downward";

  return { slope, intercept, rSquared, direction };
}

export function compareSeries(series1: MarketSeries, series2: MarketSeries): {
  correlation: CorrelationResult;
  stats1: StatisticsSummary;
  stats2: StatisticsSummary;
  trend1: ReturnType<typeof calculateTrend>;
  trend2: ReturnType<typeof calculateTrend>;
} {
  const prices1 = series1.points.map((p) => p.price);
  const prices2 = series2.points.map((p) => p.price);

  const correlation = calculateCorrelation(prices1, prices2);
  const stats1 = calculateStatistics(prices1);
  const stats2 = calculateStatistics(prices2);
  const trend1 = calculateTrend(prices1);
  const trend2 = calculateTrend(prices2);

  return { correlation, stats1, stats2, trend1, trend2 };
}
