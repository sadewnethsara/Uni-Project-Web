"use client";

import { useMemo } from "react";
import { ANALYZE_THEME } from "@/lib/chartTheme";
import { compareSeries, calculateStatistics, detectOutliers, calculateTrend } from "@/lib/analyticsUtils";
import type { MarketSeries } from "@/lib/analyticsData";

interface AnalyticsPanelProps {
  seriesList: MarketSeries[];
}

export default function AnalyticsPanel({ seriesList }: AnalyticsPanelProps) {
  const analytics = useMemo(() => {
    if (seriesList.length < 2) return null;

    const primary = seriesList[0];
    const secondary = seriesList[1];

    const comparison = compareSeries(primary, secondary);
    const primaryStats = calculateStatistics(primary.points.map((p) => p.price));
    const outliers = detectOutliers(primary.points.map((p) => p.price));
    const trend = calculateTrend(primary.points.map((p) => p.price));

    return {
      comparison,
      primaryStats,
      outliers,
      trend,
    };
  }, [seriesList]);

  if (!analytics) {
    return (
      <div className="p-4 text-center" style={{ color: ANALYZE_THEME.inkMuted }}>
        <p className="text-xs">Select at least 2 series to see comparative analytics</p>
      </div>
    );
  }

  const { comparison, primaryStats, outliers, trend } = analytics;

  return (
    <div className="space-y-4 p-3">
      {/* Correlation Analysis */}
      <div className="p-3 rounded-xl" style={{ background: ANALYZE_THEME.surfaceMuted }}>
        <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: ANALYZE_THEME.ink }}>
          Correlation Analysis
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[10px]" style={{ color: ANALYZE_THEME.inkFaint }}>
              Correlation
            </div>
            <div className="text-sm font-bold" style={{ color: ANALYZE_THEME.accent }}>
              {comparison.correlation.correlation.toFixed(3)}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[10px]" style={{ color: ANALYZE_THEME.inkFaint }}>
              Strength
            </div>
            <div className="text-sm font-bold capitalize" style={{ color: ANALYZE_THEME.ink }}>
              {comparison.correlation.strength}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[10px]" style={{ color: ANALYZE_THEME.inkFaint }}>
              Direction
            </div>
            <div className="text-sm font-bold capitalize" style={{ color: ANALYZE_THEME.ink }}>
              {comparison.correlation.direction}
            </div>
          </div>
        </div>
      </div>

      {/* Statistical Summary */}
      <div className="p-3 rounded-xl" style={{ background: ANALYZE_THEME.surfaceMuted }}>
        <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: ANALYZE_THEME.ink }}>
          Statistical Summary
        </h4>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          <div className="p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[9px]" style={{ color: ANALYZE_THEME.inkFaint }}>
              Mean
            </div>
            <div className="text-xs font-bold" style={{ color: ANALYZE_THEME.ink }}>
              {primaryStats.mean.toFixed(2)}
            </div>
          </div>
          <div className="p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[9px]" style={{ color: ANALYZE_THEME.inkFaint }}>
              Median
            </div>
            <div className="text-xs font-bold" style={{ color: ANALYZE_THEME.ink }}>
              {primaryStats.median.toFixed(2)}
            </div>
          </div>
          <div className="p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[9px]" style={{ color: ANALYZE_THEME.inkFaint }}>
              Std Dev
            </div>
            <div className="text-xs font-bold" style={{ color: ANALYZE_THEME.ink }}>
              {primaryStats.standardDeviation.toFixed(2)}
            </div>
          </div>
          <div className="p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[9px]" style={{ color: ANALYZE_THEME.inkFaint }}>
              Range
            </div>
            <div className="text-xs font-bold" style={{ color: ANALYZE_THEME.ink }}>
              {primaryStats.range.toFixed(2)}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-2">
          <div className="p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[9px]" style={{ color: ANALYZE_THEME.inkFaint }}>
              Q1 (25%)
            </div>
            <div className="text-xs font-bold" style={{ color: ANALYZE_THEME.ink }}>
              {primaryStats.quartiles.q1.toFixed(2)}
            </div>
          </div>
          <div className="p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[9px]" style={{ color: ANALYZE_THEME.inkFaint }}>
              Q2 (50%)
            </div>
            <div className="text-xs font-bold" style={{ color: ANALYZE_THEME.ink }}>
              {primaryStats.quartiles.q2.toFixed(2)}
            </div>
          </div>
          <div className="p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[9px]" style={{ color: ANALYZE_THEME.inkFaint }}>
              Q3 (75%)
            </div>
            <div className="text-xs font-bold" style={{ color: ANALYZE_THEME.ink }}>
              {primaryStats.quartiles.q3.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="p-3 rounded-xl" style={{ background: ANALYZE_THEME.surfaceMuted }}>
        <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: ANALYZE_THEME.ink }}>
          Trend Analysis
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[10px]" style={{ color: ANALYZE_THEME.inkFaint }}>
              Direction
            </div>
            <div
              className="text-sm font-bold capitalize"
              style={{
                color: trend.direction === "upward" ? ANALYZE_THEME.up : trend.direction === "downward" ? ANALYZE_THEME.down : ANALYZE_THEME.inkMuted,
              }}
            >
              {trend.direction}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[10px]" style={{ color: ANALYZE_THEME.inkFaint }}>
              Slope
            </div>
            <div className="text-sm font-bold" style={{ color: ANALYZE_THEME.ink }}>
              {trend.slope.toFixed(4)}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[10px]" style={{ color: ANALYZE_THEME.inkFaint }}>
              R²
            </div>
            <div className="text-sm font-bold" style={{ color: ANALYZE_THEME.accent }}>
              {trend.rSquared.toFixed(3)}
            </div>
          </div>
        </div>
      </div>

      {/* Outlier Detection */}
      <div className="p-3 rounded-xl" style={{ background: ANALYZE_THEME.surfaceMuted }}>
        <h4 className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: ANALYZE_THEME.ink }}>
          Outlier Detection
        </h4>
        <div className="grid grid-cols-3 gap-2">
          <div className="text-center p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[10px]" style={{ color: ANALYZE_THEME.inkFaint }}>
              Outliers
            </div>
            <div className="text-sm font-bold" style={{ color: outliers.outliers.length > 0 ? ANALYZE_THEME.down : ANALYZE_THEME.up }}>
              {outliers.outliers.length}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[10px]" style={{ color: ANALYZE_THEME.inkFaint }}>
              Lower Bound
            </div>
            <div className="text-sm font-bold" style={{ color: ANALYZE_THEME.ink }}>
              {outliers.lowerBound.toFixed(2)}
            </div>
          </div>
          <div className="text-center p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[10px]" style={{ color: ANALYZE_THEME.inkFaint }}>
              Upper Bound
            </div>
            <div className="text-sm font-bold" style={{ color: ANALYZE_THEME.ink }}>
              {outliers.upperBound.toFixed(2)}
            </div>
          </div>
        </div>
        {outliers.outliers.length > 0 && (
          <div className="mt-2 p-2 rounded-lg" style={{ background: ANALYZE_THEME.surface }}>
            <div className="text-[9px] mb-1" style={{ color: ANALYZE_THEME.inkFaint }}>
              Outlier values:
            </div>
            <div className="flex flex-wrap gap-1">
              {outliers.outliers.map((outlier, i) => (
                <span
                  key={i}
                  className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                  style={{ background: ANALYZE_THEME.down + "20", color: ANALYZE_THEME.down }}
                >
                  {outlier.toFixed(2)}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
