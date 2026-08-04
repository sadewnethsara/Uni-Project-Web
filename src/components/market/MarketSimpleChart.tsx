"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";
import type { SparkPoint } from "@/lib/marketPageData";

interface MarketSimpleChartProps {
  points: SparkPoint[];
  commodityName: string;
}

export default function MarketSimpleChart({ points, commodityName }: MarketSimpleChartProps) {
  const [chartType, setChartType] = useState<"area" | "line" | "scatter" | "bar">("area");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const formatRs = (n: number) => "Rs " + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const valid = points.filter((p) => p.price != null) as (SparkPoint & { price: number })[];
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
          Try selecting a different date or vegetable — some days have no recorded prices.
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
  const padX = 28; // Padding on left and right so points don't touch the exact borders
  const chartW = w - padX * 2;
  const padY = 16;
  const chartKey = `${commodityName}-${valid[0]?.date ?? "na"}-${valid[valid.length - 1]?.date ?? "na"}-${chartType}`;

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

  return (
    <div
      className={`${PANEL_CLASS} p-4 sm:p-5 relative z-20`}
      style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}
    >
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.inkFaint }}>
            Last 7 days
          </p>
          <p className="text-xs font-semibold mt-0.5" style={{ color: ANALYZE_THEME.inkMuted }}>
            Simple daily price for {commodityName}
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
              fill={up ? `${ANALYZE_THEME.up}22` : `${ANALYZE_THEME.down}22`}
            />
          )}

          {(chartType === "area" || chartType === "line") && (
            <motion.polyline
              initial={{ pathLength: 0, opacity: 0.4 }}
              animate={{ pathLength: 1, opacity: 1 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              fill="none"
              stroke={up ? ANALYZE_THEME.up : ANALYZE_THEME.down}
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
                  key={`bar-${p.date}-${i}`}
                  x={barX}
                  y={barY}
                  width={barW}
                  height={h - barY}
                  fill={up ? ANALYZE_THEME.up : ANALYZE_THEME.down}
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
                  key={`circle-${c.date}-${i}`}
                  cx={c.x}
                  cy={c.y}
                  r={isHovered ? 6 : chartType === "scatter" ? 5 : 4}
                  fill={chartType === "scatter" ? (up ? ANALYZE_THEME.up : ANALYZE_THEME.down) : ANALYZE_THEME.surfaceRaised}
                  stroke={up ? ANALYZE_THEME.up : ANALYZE_THEME.down}
                  strokeWidth={chartType === "scatter" ? 0 : 2}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.18, ease: "easeOut" }}
                />
              );
            })}

          {/* Hover interaction zones with padding offset */}
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
                onTouchStart={() => setHoverIndex(i)}
                className="cursor-crosshair"
              />
            );
          })}

          {/* Vertical indicator line for hover */}
          {hoverIndex !== null && chartType !== "bar" && (
            <line
              x1={coords[hoverIndex].x}
              y1={padY}
              x2={coords[hoverIndex].x}
              y2={h}
              stroke={ANALYZE_THEME.inkFaint}
              strokeWidth={1}
              strokeDasharray="4 4"
              className="pointer-events-none"
            />
          )}
        </svg>

        {/* Tooltip Anchor & Positioning */}
        <AnimatePresence>
          {hoverIndex !== null && (
            <div
              className="absolute pointer-events-none z-10"
              style={{
                left: `${(coords[hoverIndex].x / w) * 100}%`,
                top: `${(coords[hoverIndex].y / h) * 100}%`,
              }}
            >
              {(() => {
                const progress = hoverIndex / (valid.length - 1 || 1);
                const xOffset = progress < 0.35 ? "12px" : progress > 0.65 ? "calc(-100% - 12px)" : "-50%";
                
                return (
                  <motion.div
                    initial={{ opacity: 0, x: xOffset, y: "calc(-100% + 5px)", scale: 0.95 }}
                    animate={{ opacity: 1, x: xOffset, y: "calc(-100% - 10px)", scale: 1 }}
                    exit={{ opacity: 0, x: xOffset, y: "calc(-100% + 5px)", scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-1 p-3 rounded-2xl shadow-2xl border min-w-[140px]"
                    style={{
                      background: ANALYZE_THEME.surfaceRaised,
                      borderColor: ANALYZE_THEME.borderStrong,
                    }}
                  >
                    <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.inkFaint }}>
                      {coords[hoverIndex].label} · {coords[hoverIndex].date}
                    </p>
                    <div className="flex items-end justify-between gap-3">
                      <p className="text-xl font-black tabular-nums" style={{ color: ANALYZE_THEME.ink }}>
                        {formatRs(coords[hoverIndex].price)}
                      </p>
                      {hoverIndex > 0 && (
                        <p 
                          className="text-[11px] font-black tabular-nums pb-0.5" 
                          style={{ 
                            color: coords[hoverIndex].price >= coords[hoverIndex - 1].price ? ANALYZE_THEME.up : ANALYZE_THEME.down 
                          }}
                        >
                          {coords[hoverIndex].price >= coords[hoverIndex - 1].price ? "+" : ""}
                          {Math.round(((coords[hoverIndex].price - coords[hoverIndex - 1].price) / coords[hoverIndex - 1].price) * 100)}%
                        </p>
                      )}
                    </div>
                  </motion.div>
                );
              })()}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="relative mt-3 h-5">
  {valid.map((p, i) => (
    <div
      key={p.date}
      className="absolute text-[10px] font-bold -translate-x-1/2 whitespace-nowrap"
      style={{
        left: `${(coords[i].x / w) * 100}%`,
        opacity: hoverIndex === i ? 1 : 0.6,
        color:
          hoverIndex === i
            ? ANALYZE_THEME.ink
            : ANALYZE_THEME.inkFaint,
        transition: "all 0.2s",
      }}
    >
      {p.label}
    </div>
  ))}
</div>
    </div>
  );
}