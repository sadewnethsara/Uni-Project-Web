"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";
import type { PricePoint } from "@/lib/analyticsData";

interface AnalyticsSimpleChartProps {
  points: PricePoint[];
  seriesName: string;
  color?: string;
}

export default function AnalyticsSimpleChart({ points, seriesName, color }: AnalyticsSimpleChartProps) {
  const [chartType, setChartType] = useState<"area" | "line" | "scatter" | "bar">("area");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const valid = points.filter((p) => p.price != null);
  const hasEnough = valid.length >= 2;

  if (!hasEnough) {
    return (
      <div
        className={`${PANEL_CLASS} p-6 flex flex-col items-center justify-center text-center min-h-[160px]`}
        style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}
      >
        <p className="text-sm font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
          Not enough price history to show a trend
        </p>
        <p className="text-[11px] font-medium mt-1 max-w-xs" style={{ color: ANALYZE_THEME.inkFaint }}>
          Try selecting a different date range or timeframe.
        </p>
      </div>
    );
  }

  const prices = valid.map((p) => p.price);
  const min = Math.min(...prices) * 0.97;
  const max = Math.max(...prices) * 1.03;
  const range = max - min || 1;
  const w = 480;
  const h = 140;
  const padX = 28;
  const chartW = w - padX * 2;
  const padY = 16;
  const chartKey = `${seriesName}-${valid[0]?.date ?? "na"}-${valid[valid.length - 1]?.date ?? "na"}-${chartType}`;

  const coords = valid.map((p, i) => {
    const x = padX + (i / (valid.length - 1)) * chartW;
    const y = padY + (h - padY * 2) - ((p.price - min) / range) * (h - padY * 2);
    return { x, y, ...p };
  });

  const line = coords.map((c) => `${c.x},${c.y}`).join(" ");
  const area = `${coords[0].x},${h} ${line} ${coords[coords.length - 1].x},${h}`;
  const last = coords[coords.length - 1];
  const first = coords[0];
  const up = last.price >= first.price;
  const chartColor = color || (up ? ANALYZE_THEME.up : ANALYZE_THEME.down);

  return (
    <div
      className={`${PANEL_CLASS} p-4 sm:p-5 relative z-20`}
      style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}
    >
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.inkFaint }}>
            Price Trend
          </p>
          <p className="text-xs font-semibold mt-0.5" style={{ color: ANALYZE_THEME.inkMuted }}>
            {seriesName}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span
            className="text-[10px] font-bold px-2.5 py-1 rounded-full hidden sm:inline-block"
            style={{
              background: up ? `${ANALYZE_THEME.up}18` : `${ANALYZE_THEME.down}18`,
              color: up ? ANALYZE_THEME.up : ANALYZE_THEME.down,
            }}
          >
            {up ? "Trending up" : "Trending down"}
          </span>
          <div className="flex gap-0.5 p-0.5 rounded-lg" style={{ background: ANALYZE_THEME.surfaceMuted }}>
            {(["line", "area", "bar", "scatter"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setChartType(type)}
                className="text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer transition-colors capitalize"
                style={{
                  background: chartType === type ? ANALYZE_THEME.ink : "transparent",
                  color: chartType === type ? ANALYZE_THEME.surfaceRaised : ANALYZE_THEME.inkMuted,
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      <motion.div
        key={chartKey}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.18, ease: "easeInOut" }}
        className="relative z-20"
        onMouseLeave={() => setHoverIndex(null)}
      >
        <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-auto overflow-visible" aria-hidden>
          {[0, 0.25, 0.5, 0.75, 1].map((t) => {
            const y = padY + t * (h - padY * 2);
            const val = max - t * range;
            return (
              <g key={t}>
                <line
                  x1={0}
                  y1={y}
                  x2={w}
                  y2={y}
                  stroke={ANALYZE_THEME.grid}
                  strokeDasharray="4 4"
                />
                <text
                  x={0}
                  y={y - 4}
                  fontSize="9"
                  fontWeight="bold"
                  fill={ANALYZE_THEME.inkMuted}
                  opacity={0.6}
                >
                  {Math.round(val)}
                </text>
              </g>
            );
          })}
          
          {chartType === "area" && (
            <motion.polygon
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              points={area}
              fill={`${chartColor}22`}
            />
          )}

          {(chartType === "area" || chartType === "line") && (
            <motion.polyline
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              fill="none"
              stroke={chartColor}
              strokeWidth={3}
              strokeLinejoin="round"
              strokeLinecap="round"
              points={line}
            />
          )}

          {chartType === "bar" &&
            valid.map((p, i) => {
              const barW = (chartW / valid.length) * 0.6;
              const barX = padX + (i / valid.length) * chartW + (chartW / valid.length) * 0.2;
              const barY = padY + (h - padY * 2) - ((p.price - min) / range) * (h - padY * 2);
              const isHovered = hoverIndex === i;
              return (
                <motion.rect
                  key={p.date}
                  x={barX}
                  y={barY}
                  width={barW}
                  height={h - barY}
                  fill={chartColor}
                  initial={{ opacity: 0, scaleY: 0.4 }}
                  animate={{ opacity: isHovered ? 1 : 0.75, scaleY: 1 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  rx={2}
                  style={{ transformOrigin: "center bottom" }}
                />
              );
            })}

          {chartType !== "bar" &&
            coords.map((c, i) => {
              const isHovered = hoverIndex === i;
              return (
                <motion.circle
                  key={c.date}
                  cx={c.x}
                  cy={c.y}
                  r={isHovered ? 6 : chartType === "scatter" ? 5 : 4}
                  fill={chartType === "scatter" ? chartColor : ANALYZE_THEME.surfaceRaised}
                  stroke={chartColor}
                  strokeWidth={chartType === "scatter" ? 0 : 2}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                />
              );
            })}

          {/* Hover interaction zones */}
          {valid.map((_, i) => {
            const segment = chartW / (valid.length - 1 || 1);
            const left = i === 0 ? 0 : padX + (i - 0.5) * segment;
            const right = i === valid.length - 1 ? w : padX + (i + 0.5) * segment;
            
            return (
              <rect
                key={`zone-${i}`}
                x={left}
                y={0}
                width={right - left}
                height={h}
                fill="transparent"
                onMouseEnter={() => setHoverIndex(i)}
                style={{ cursor: "crosshair" }}
              />
            );
          })}

          {/* Hover tooltip */}
          <AnimatePresence>
            {hoverIndex !== null && (
              <motion.g
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.15 }}
              >
                <motion.rect
                  x={coords[hoverIndex].x - 40}
                  y={10}
                  width={80}
                  height={28}
                  rx={4}
                  fill={ANALYZE_THEME.ink}
                  opacity={0.9}
                />
                <text
                  x={coords[hoverIndex].x}
                  y={22}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#fff"
                >
                  Rs. {valid[hoverIndex].price.toFixed(0)}
                </text>
                <text
                  x={coords[hoverIndex].x}
                  y={33}
                  textAnchor="middle"
                  fontSize="8"
                  fontWeight="bold"
                  fill={ANALYZE_THEME.inkMuted}
                >
                  {valid[hoverIndex].label}
                </text>
              </motion.g>
            )}
          </AnimatePresence>
        </svg>
      </motion.div>
    </div>
  );
}