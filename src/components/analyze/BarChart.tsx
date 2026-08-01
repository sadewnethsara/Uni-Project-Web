"use client";

import { useMemo, useState } from "react";
import type { PricePoint } from "@/lib/analyticsData";
import { getSeriesColor } from "@/lib/analyticsData";
import { ANALYZE_THEME } from "@/lib/chartTheme";

interface BarChartProps {
  seriesList: { marketId: string; marketName: string; points: PricePoint[] }[];
}

export default function BarChart({ seriesList }: BarChartProps) {
  const [hoverBar, setHoverBar] = useState<{ seriesIndex: number; pointIndex: number } | null>(null);

  const chartW = 760;
  const chartH = 350;
  const padL = 60;
  const padR = 30;
  const padT = 20;
  const padB = 60;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  // Aggregate data by date across all series
  const barData = useMemo(() => {
    if (seriesList.length === 0) return { data: [], maxValue: 0, labels: [] };

    // Get all unique dates
    const allDates = new Set<string>();
    seriesList.forEach((series) => {
      series.points.forEach((point) => allDates.add(point.label));
    });
    const sortedDates = Array.from(allDates).slice(-10); // Last 10 data points

    // Create grouped data
    const data = sortedDates.map((date) => {
      const values: { seriesName: string; value: number; color: string }[] = [];
      seriesList.forEach((series, seriesIdx) => {
        const point = series.points.find((p) => p.label === date);
        if (point) {
          values.push({
            seriesName: series.marketName,
            value: point.price,
            color: getSeriesColor(seriesIdx),
          });
        }
      });
      return { date, values };
    });

    const maxValue = Math.max(
      ...data.flatMap((d) => d.values.map((v) => v.value)),
      1
    );

    return { data, maxValue, labels: sortedDates };
  }, [seriesList]);

  const yScale = (value: number) => padT + plotH - (value / barData.maxValue) * plotH;

  const groupWidth = plotW / barData.data.length;
  const barWidth = (groupWidth * 0.8) / Math.max(seriesList.length, 1);

  return (
    <div className="w-full overflow-x-auto">
      <svg
        width={chartW}
        height={chartH}
        style={{ background: ANALYZE_THEME.chartBg, borderRadius: "0.75rem" }}
      >
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <line
            key={`grid-${t}`}
            x1={padL}
            y1={padT + plotH * t}
            x2={padL + plotW}
            y2={padT + plotH * t}
            stroke={ANALYZE_THEME.grid}
            strokeWidth={1}
          />
        ))}

        {/* Axes */}
        <line
          x1={padL}
          y1={padT}
          x2={padL}
          y2={padT + plotH}
          stroke={ANALYZE_THEME.inkMuted}
          strokeWidth={1.5}
        />
        <line
          x1={padL}
          y1={padT + plotH}
          x2={padL + plotW}
          y2={padT + plotH}
          stroke={ANALYZE_THEME.inkMuted}
          strokeWidth={1.5}
        />

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const value = barData.maxValue * (1 - t);
          return (
            <text
              key={`y-label-${t}`}
              x={padL - 8}
              y={padT + plotH * t + 3}
              textAnchor="end"
              style={{ fontSize: 9, fill: ANALYZE_THEME.inkFaint }}
            >
              {value.toFixed(0)}
            </text>
          );
        })}
        <text
          x={15}
          y={padT + plotH / 2}
          textAnchor="middle"
          transform={`rotate(-90, 15, ${padT + plotH / 2})`}
          style={{ fontSize: 10, fontWeight: 600, fill: ANALYZE_THEME.inkMuted }}
        >
          Price (Rs/kg)
        </text>

        {/* Bars */}
        {barData.data.map((group, groupIdx) => {
          const groupX = padL + groupIdx * groupWidth + (groupWidth * 0.1);

          return (
            <g key={`group-${groupIdx}`}>
              {group.values.map((value, valueIdx) => {
                const x = groupX + valueIdx * barWidth;
                const y = yScale(value.value);
                const height = padT + plotH - y;
                const isHovered =
                  hoverBar?.seriesIndex === valueIdx && hoverBar?.pointIndex === groupIdx;

                return (
                  <g key={`bar-${valueIdx}`}>
                    <rect
                      x={x}
                      y={y}
                      width={barWidth - 2}
                      height={height}
                      fill={value.color}
                      opacity={isHovered ? 1 : 0.7}
                      style={{ cursor: "pointer", transition: "all 0.15s" }}
                      onMouseEnter={() => setHoverBar({ seriesIndex: valueIdx, pointIndex: groupIdx })}
                      onMouseLeave={() => setHoverBar(null)}
                    />
                    {isHovered && (
                      <g>
                        <rect
                          x={x + barWidth + 5}
                          y={y - 10}
                          width={90}
                          height={45}
                          fill={ANALYZE_THEME.ink}
                          opacity={0.9}
                          rx={4}
                        />
                        <text
                          x={x + barWidth + 12}
                          y={y + 5}
                          style={{ fontSize: 9, fontWeight: 600, fill: ANALYZE_THEME.surfaceRaised }}
                        >
                          {value.seriesName}
                        </text>
                        <text
                          x={x + barWidth + 12}
                          y={y + 20}
                          style={{ fontSize: 8, fill: ANALYZE_THEME.surfaceMuted }}
                        >
                          {group.date}
                        </text>
                        <text
                          x={x + barWidth + 12}
                          y={y + 35}
                          style={{ fontSize: 8, fill: ANALYZE_THEME.surfaceMuted }}
                        >
                          Rs {value.value.toFixed(2)}
                        </text>
                      </g>
                    )}
                  </g>
                );
              })}
            </g>
          );
        })}

        {/* X-axis labels */}
        {barData.data.map((group, i) => {
          if (i % 2 !== 0 && barData.data.length > 5) return null; // Skip some labels if many
          return (
            <text
              key={`x-label-${i}`}
              x={padL + i * groupWidth + groupWidth / 2}
              y={padT + plotH + 20}
              textAnchor="middle"
              style={{ fontSize: 8, fill: ANALYZE_THEME.inkFaint }}
            >
              {group.date}
            </text>
          );
        })}
        <text
          x={padL + plotW / 2}
          y={chartH - 10}
          textAnchor="middle"
          style={{ fontSize: 10, fontWeight: 600, fill: ANALYZE_THEME.inkMuted }}
        >
          Date
        </text>

        {/* Legend */}
        <g transform={`translate(${padL + plotW - 100}, ${padT + 10})`}>
          {seriesList.slice(0, 3).map((series, i) => (
            <g key={`legend-${i}`} transform={`translate(0, ${i * 15})`}>
              <rect width={12} height={12} fill={getSeriesColor(i)} opacity={0.8} rx={2} />
              <text
                x={16}
                y={9}
                style={{ fontSize: 8, fill: ANALYZE_THEME.inkMuted }}
              >
                {series.marketName}
              </text>
            </g>
          ))}
        </g>
      </svg>
    </div>
  );
}
