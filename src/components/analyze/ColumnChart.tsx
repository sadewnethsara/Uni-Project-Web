"use client";

import { useMemo, useState } from "react";
import type { PricePoint } from "@/lib/analyticsData";
import { getSeriesColor } from "@/lib/analyticsData";
import { ANALYZE_THEME } from "@/lib/chartTheme";

interface ColumnChartProps {
  seriesList: { marketId: string; marketName: string; points: PricePoint[] }[];
}

export default function ColumnChart({ seriesList }: ColumnChartProps) {
  const [hoverColumn, setHoverColumn] = useState<{ seriesIndex: number; pointIndex: number } | null>(null);

  const chartW = 760;
  const chartH = 350;
  const padL = 60;
  const padR = 30;
  const padT = 20;
  const padB = 60;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  // Aggregate data: compare average prices across series
  const columnData = useMemo(() => {
    if (seriesList.length === 0) return { data: [], maxValue: 0 };

    const data = seriesList.map((series, seriesIdx) => {
      const prices = series.points.map((p) => p.price);
      const avgPrice = prices.reduce((sum, p) => sum + p, 0) / prices.length;
      const maxPrice = Math.max(...prices);
      const minPrice = Math.min(...prices);
      
      return {
        seriesName: series.marketName,
        seriesId: series.marketId,
        avgPrice,
        maxPrice,
        minPrice,
        color: getSeriesColor(seriesIdx),
      };
    });

    const maxValue = Math.max(...data.map((d) => d.maxPrice), 1);

    return { data, maxValue };
  }, [seriesList]);

  const yScale = (value: number) => padT + plotH - (value / columnData.maxValue) * plotH;

  const columnWidth = (plotW * 0.6) / columnData.data.length;
  const columnGap = (plotW * 0.4) / (columnData.data.length + 1);

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
          const value = columnData.maxValue * (1 - t);
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

        {/* Columns */}
        {columnData.data.map((column, seriesIdx) => {
          const x = padL + columnGap + seriesIdx * (columnWidth + columnGap);
          const avgY = yScale(column.avgPrice);
          const maxY = yScale(column.maxPrice);
          const minY = yScale(column.minPrice);
          const avgHeight = padT + plotH - avgY;
          const isHovered = hoverColumn?.seriesIndex === seriesIdx;

          return (
            <g key={`column-${seriesIdx}`}>
              {/* Main column (average) */}
              <rect
                x={x}
                y={avgY}
                width={columnWidth}
                height={avgHeight}
                fill={column.color}
                opacity={isHovered ? 1 : 0.7}
                style={{ cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={() => setHoverColumn({ seriesIndex: seriesIdx, pointIndex: 0 })}
                onMouseLeave={() => setHoverColumn(null)}
              />

              {/* Min/Max range indicator */}
              <line
                x1={x + columnWidth / 2}
                y1={maxY}
                x2={x + columnWidth / 2}
                y2={minY}
                stroke={column.color}
                strokeWidth={2}
                opacity={0.5}
              />
              <line
                x1={x + columnWidth * 0.2}
                y1={maxY}
                x2={x + columnWidth * 0.8}
                y2={maxY}
                stroke={column.color}
                strokeWidth={2}
                opacity={0.5}
              />
              <line
                x1={x + columnWidth * 0.2}
                y1={minY}
                x2={x + columnWidth * 0.8}
                y2={minY}
                stroke={column.color}
                strokeWidth={2}
                opacity={0.5}
              />

              {/* Tooltip */}
              {isHovered && (
                <g>
                  <rect
                    x={x + columnWidth + 8}
                    y={avgY - 10}
                    width={100}
                    height={70}
                    fill={ANALYZE_THEME.ink}
                    opacity={0.9}
                    rx={4}
                  />
                  <text
                    x={x + columnWidth + 15}
                    y={avgY + 5}
                    style={{ fontSize: 9, fontWeight: 600, fill: ANALYZE_THEME.surfaceRaised }}
                  >
                    {column.seriesName}
                  </text>
                  <text
                    x={x + columnWidth + 15}
                    y={avgY + 20}
                    style={{ fontSize: 8, fill: ANALYZE_THEME.surfaceMuted }}
                  >
                    Avg: {column.avgPrice.toFixed(2)}
                  </text>
                  <text
                    x={x + columnWidth + 15}
                    y={avgY + 35}
                    style={{ fontSize: 8, fill: ANALYZE_THEME.surfaceMuted }}
                  >
                    Max: {column.maxPrice.toFixed(2)}
                  </text>
                  <text
                    x={x + columnWidth + 15}
                    y={avgY + 50}
                    style={{ fontSize: 8, fill: ANALYZE_THEME.surfaceMuted }}
                  >
                    Min: {column.minPrice.toFixed(2)}
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* X-axis labels */}
        {columnData.data.map((column, i) => {
          const x = padL + columnGap + i * (columnWidth + columnGap) + columnWidth / 2;
          return (
            <text
              key={`x-label-${i}`}
              x={x}
              y={padT + plotH + 20}
              textAnchor="middle"
              style={{ fontSize: 8, fill: ANALYZE_THEME.inkFaint }}
            >
              {column.seriesName.length > 8 
                ? column.seriesName.slice(0, 6) + "..." 
                : column.seriesName}
            </text>
          );
        })}
        <text
          x={padL + plotW / 2}
          y={chartH - 10}
          textAnchor="middle"
          style={{ fontSize: 10, fontWeight: 600, fill: ANALYZE_THEME.inkMuted }}
        >
          Market Comparison
        </text>

        {/* Legend */}
        <g transform={`translate(${padL + 20}, ${padT + 10})`}>
          <rect width={12} height={12} fill={ANALYZE_THEME.inkMuted} opacity={0.5} rx={2} />
          <text x={16} y={9} style={{ fontSize: 8, fill: ANALYZE_THEME.inkFaint }}>
            Min-Max Range
          </text>
        </g>
      </svg>
    </div>
  );
}
