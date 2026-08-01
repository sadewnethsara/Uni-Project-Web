"use client";

import { useMemo, useRef, useState } from "react";
import type { PricePoint } from "@/lib/analyticsData";
import { getSeriesColor } from "@/lib/analyticsData";
import { ANALYZE_THEME } from "@/lib/chartTheme";

interface HistogramProps {
  seriesList: { marketId: string; marketName: string; points: PricePoint[] }[];
}

export default function Histogram({ seriesList }: HistogramProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverBin, setHoverBin] = useState<number | null>(null);

  const chartW = 760;
  const chartH = 350;
  const padL = 50;
  const padR = 30;
  const padT = 20;
  const padB = 40;
  const plotW = chartW - padL - padR;
  const plotH = chartH - padT - padB;

  // Create histogram data from price distribution
  const histogramData = useMemo(() => {
    const primary = seriesList[0];
    if (!primary) return { bins: [], binWidth: 0, maxCount: 0 };

    const prices = primary.points.map((p) => p.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    const binCount = 12;
    const binWidth = (maxPrice - minPrice) / binCount || 1;

    const bins = Array.from({ length: binCount }, (_, i) => ({
      start: minPrice + i * binWidth,
      end: minPrice + (i + 1) * binWidth,
      count: 0,
      percentage: 0,
    }));

    prices.forEach((price) => {
      const binIndex = Math.min(Math.floor((price - minPrice) / binWidth), binCount - 1);
      bins[binIndex].count++;
    });

    const maxCount = Math.max(...bins.map((b) => b.count), 1);
    bins.forEach((bin) => {
      bin.percentage = (bin.count / prices.length) * 100;
    });

    return { bins, binWidth, maxCount };
  }, [seriesList]);

  const xScale = (binIndex: number) => padL + (binIndex / histogramData.bins.length) * plotW;
  const yScale = (count: number) => padT + plotH - (count / histogramData.maxCount) * plotH;

  const barWidth = (plotW / histogramData.bins.length) * 0.8;

  return (
    <div className="w-full overflow-x-auto">
      <svg
        ref={svgRef}
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
          const value = Math.round(histogramData.maxCount * (1 - t));
          return (
            <text
              key={`y-label-${t}`}
              x={padL - 8}
              y={padT + plotH * t + 3}
              textAnchor="end"
              style={{ fontSize: 9, fill: ANALYZE_THEME.inkFaint }}
            >
              {value}
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
          Frequency
        </text>

        {/* Histogram bars */}
        {histogramData.bins.map((bin, i) => {
          const x = xScale(i) + (plotW / histogramData.bins.length - barWidth) / 2;
          const y = yScale(bin.count);
          const height = padT + plotH - y;

          return (
            <g key={`bin-${i}`}>
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={height}
                fill={
                  hoverBin === i
                    ? ANALYZE_THEME.accent
                    : getSeriesColor(0)
                }
                opacity={hoverBin === i ? 0.9 : 0.7}
                style={{ cursor: "pointer", transition: "all 0.15s" }}
                onMouseEnter={() => setHoverBin(i)}
                onMouseLeave={() => setHoverBin(null)}
              />
              {hoverBin === i && (
                <g>
                  <rect
                    x={x + barWidth + 5}
                    y={y - 10}
                    width={95}
                    height={50}
                    fill={ANALYZE_THEME.ink}
                    opacity={0.9}
                    rx={4}
                  />
                  <text
                    x={x + barWidth + 12}
                    y={y + 5}
                    style={{ fontSize: 9, fontWeight: 600, fill: ANALYZE_THEME.surfaceRaised }}
                  >
                    {bin.start.toFixed(1)} - {bin.end.toFixed(1)}
                  </text>
                  <text
                    x={x + barWidth + 12}
                    y={y + 20}
                    style={{ fontSize: 8, fill: ANALYZE_THEME.surfaceMuted }}
                  >
                    Count: {bin.count}
                  </text>
                  <text
                    x={x + barWidth + 12}
                    y={y + 35}
                    style={{ fontSize: 8, fill: ANALYZE_THEME.surfaceMuted }}
                  >
                    {bin.percentage.toFixed(1)}%
                  </text>
                </g>
              )}
            </g>
          );
        })}

        {/* X-axis labels */}
        {histogramData.bins.map((bin, i) => {
          if (i % 2 !== 0) return null; // Show every other label
          return (
            <text
              key={`x-label-${i}`}
              x={xScale(i) + (plotW / histogramData.bins.length) / 2}
              y={padT + plotH + 15}
              textAnchor="middle"
              style={{ fontSize: 8, fill: ANALYZE_THEME.inkFaint }}
            >
              {bin.start.toFixed(0)}
            </text>
          );
        })}
        <text
          x={padL + plotW / 2}
          y={chartH - 5}
          textAnchor="middle"
          style={{ fontSize: 10, fontWeight: 600, fill: ANALYZE_THEME.inkMuted }}
        >
          Price Range (Rs/kg)
        </text>
      </svg>
    </div>
  );
}
