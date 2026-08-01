"use client";

import { useMemo, useRef, useState } from "react";
import type { PricePoint } from "@/lib/analyticsData";
import { getSeriesColor } from "@/lib/analyticsData";
import { ANALYZE_THEME } from "@/lib/chartTheme";

interface ScatterPlotProps {
  seriesList: { marketId: string; marketName: string; points: PricePoint[] }[];
}

export default function ScatterPlot({ seriesList }: ScatterPlotProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const chartW = 760;
  const chartH = 350;
  const padL = 50;
  const padR = 30;
  const padT = 20;
  const padB = 40;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  // Prepare scatter data: price vs volume for each series
  const scatterData = useMemo(() => {
    return seriesList.map((series, seriesIdx) => {
      const color = getSeriesColor(seriesIdx);
      return {
        marketId: series.marketId,
        marketName: series.marketName,
        color,
        points: series.points.map((p, idx) => ({
          x: p.price,
          y: p.volume || 0,
          label: p.label,
          originalIndex: idx,
        })),
      };
    });
  }, [seriesList]);

  // Calculate scales
  const allX = scatterData.flatMap((s) => s.points.map((p) => p.x));
  const allY = scatterData.flatMap((s) => s.points.map((p) => p.y));

  const maxX = Math.max(...allX, 1) * 1.05;
  const minX = Math.min(...allX, 0) * 0.95;
  const maxY = Math.max(...allY, 1) * 1.05;
  const minY = Math.min(...allY, 0) * 0.95;

  const xScale = (val: number) => padL + ((val - minX) / (maxX - minX)) * plotW;
  const yScale = (val: number) => padT + plotH - ((val - minY) / (maxY - minY)) * plotH;

  const xFromScale = (x: number) => minX + ((x - padL) / plotW) * (maxX - minX);
  const yFromScale = (y: number) => minY + ((padT + plotH - y) / plotH) * (maxY - minY);

  // Grid lines and ticks
  const xTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    value: minX + (maxX - minX) * t,
    x: padL + plotW * t,
  }));

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    value: minY + (maxY - minY) * (1 - t),
    y: padT + plotH * t,
  }));

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Find closest point
    let minDist = Infinity;
    let closestIndex: number | null = null;
    let closestSeries: number | null = null;

    scatterData.forEach((series, seriesIdx) => {
      series.points.forEach((point, pointIdx) => {
        const px = xScale(point.x);
        const py = yScale(point.y);
        const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);
        if (dist < minDist && dist < 20) {
          minDist = dist;
          closestIndex = pointIdx;
          closestSeries = seriesIdx;
        }
      });
    });

    if (closestIndex !== null && closestSeries !== null) {
      setHoverIndex(closestIndex);
    } else {
      setHoverIndex(null);
    }
  };

  return (
    <div className="w-full overflow-x-auto">
      <svg
        ref={svgRef}
        width={chartW}
        height={chartH}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoverIndex(null)}
        style={{ background: ANALYZE_THEME.chartBg, borderRadius: "0.75rem" }}
      >
        {/* Grid */}
        {xTicks.map((tick) => (
          <line
            key={`x-grid-${tick.x}`}
            x1={tick.x}
            y1={padT}
            x2={tick.x}
            y2={padT + plotH}
            stroke={ANALYZE_THEME.grid}
            strokeWidth={1}
          />
        ))}
        {yTicks.map((tick) => (
          <line
            key={`y-grid-${tick.y}`}
            x1={padL}
            y1={tick.y}
            x2={padL + plotW}
            y2={tick.y}
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

        {/* X-axis labels */}
        {xTicks.map((tick) => (
          <text
            key={`x-label-${tick.x}`}
            x={tick.x}
            y={padT + plotH + 15}
            textAnchor="middle"
            style={{ fontSize: 9, fill: ANALYZE_THEME.inkFaint }}
          >
            {tick.value.toFixed(0)}
          </text>
        ))}
        <text
          x={padL + plotW / 2}
          y={chartH - 5}
          textAnchor="middle"
          style={{ fontSize: 10, fontWeight: 600, fill: ANALYZE_THEME.inkMuted }}
        >
          Price (Rs/kg)
        </text>

        {/* Y-axis labels */}
        {yTicks.map((tick) => (
          <text
            key={`y-label-${tick.y}`}
            x={padL - 8}
            y={tick.y + 3}
            textAnchor="end"
            style={{ fontSize: 9, fill: ANALYZE_THEME.inkFaint }}
          >
            {tick.value.toFixed(0)}
          </text>
        ))}
        <text
          x={15}
          y={padT + plotH / 2}
          textAnchor="middle"
          transform={`rotate(-90, 15, ${padT + plotH / 2})`}
          style={{ fontSize: 10, fontWeight: 600, fill: ANALYZE_THEME.inkMuted }}
        >
          Volume
        </text>

        {/* Scatter points */}
        {scatterData.map((series, seriesIdx) => (
          <g key={series.marketId}>
            {series.points.map((point, pointIdx) => (
              <circle
                key={`${series.marketId}-${pointIdx}`}
                cx={xScale(point.x)}
                cy={yScale(point.y)}
                r={hoverIndex === pointIdx ? 6 : 4}
                fill={series.color}
                opacity={hoverIndex === pointIdx ? 1 : 0.7}
                style={{ cursor: "pointer", transition: "all 0.15s" }}
              />
            ))}
          </g>
        ))}

        {/* Tooltip */}
        {hoverIndex !== null && (
          <g>
            {scatterData.map((series, seriesIdx) => {
              const point = series.points[hoverIndex];
              if (!point) return null;
              return (
                <g key={`tooltip-${series.marketId}`}>
                  <rect
                    x={xScale(point.x) + 8}
                    y={yScale(point.y) - 8}
                    width={85}
                    height={45}
                    fill={ANALYZE_THEME.ink}
                    opacity={0.9}
                    rx={4}
                  />
                  <text
                    x={xScale(point.x) + 14}
                    y={yScale(point.y) + 6}
                    style={{ fontSize: 9, fontWeight: 600, fill: ANALYZE_THEME.surfaceRaised }}
                  >
                    {series.marketName}
                  </text>
                  <text
                    x={xScale(point.x) + 14}
                    y={yScale(point.y) + 20}
                    style={{ fontSize: 8, fill: ANALYZE_THEME.surfaceMuted }}
                  >
                    Price: {point.x.toFixed(2)}
                  </text>
                  <text
                    x={xScale(point.x) + 14}
                    y={yScale(point.y) + 34}
                    style={{ fontSize: 8, fill: ANALYZE_THEME.surfaceMuted }}
                  >
                    Vol: {point.y.toFixed(0)}
                  </text>
                </g>
              );
            })}
          </g>
        )}
      </svg>
    </div>
  );
}
