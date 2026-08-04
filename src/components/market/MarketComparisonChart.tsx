"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";
import type { WeeklyMarketPrice } from "@/lib/marketPageData";

interface MarketComparisonChartProps {
  weeklyData: WeeklyMarketPrice[];
  commodityName: string;
}

export default function MarketComparisonChart({ weeklyData, commodityName }: MarketComparisonChartProps) {
  const [chartType, setChartType] = useState<"line" | "area" | "bar" | "scatter">("line");
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const formatRs = (n: number) => "Rs " + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const valid = weeklyData.filter((d) => d.lowest != null && d.highest != null);
  const hasEnough = valid.length >= 2;

  if (!hasEnough) {
    return (
      <div
        className={`${PANEL_CLASS} p-6 flex flex-col items-center justify-center text-center min-h-[160px]`}
        style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}
      >
        <p className="text-sm font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
          Not enough price history to show market comparison
        </p>
        <p className="text-[11px] font-medium mt-1 max-w-xs" style={{ color: ANALYZE_THEME.inkFaint }}>
          Try selecting a different date or vegetable — some days have no recorded prices.
        </p>
      </div>
    );
  }

  const lowestPrices = valid.map((d) => d.lowest!.price);
  const highestPrices = valid.map((d) => d.highest!.price);
  const selectedPrices = valid.filter((d) => d.selectedMarket != null).map((d) => d.selectedMarket!.price);
  const allPrices = [...lowestPrices, ...highestPrices, ...selectedPrices].filter((p): p is number => p != null);
  const min = Math.min(...allPrices) * 0.97;
  const max = Math.max(...allPrices) * 1.03;
  const range = max - min || 1;
  const w = 480;
  const h = 140;

  const padY = 18;
  const padLeft = 44;
  const padRight = 24;

  const chartW = w - padLeft - padRight;

  const lowestCoords = valid.map((d, i) => {
    const x = padLeft + (i / (valid.length - 1)) * chartW;
    const y = padY + (h - padY * 2) - (((d.lowest!.price ?? 0) - min) / range) * (h - padY * 2);
    return { x, y, ...d.lowest, date: d.date, label: d.label };
  });

  const highestCoords = valid.map((d, i) => {
    const x = padLeft + (i / (valid.length - 1)) * chartW;
    const y = padY + (h - padY * 2) - (((d.highest!.price ?? 0) - min) / range) * (h - padY * 2);
    return { x, y, ...d.highest, date: d.date, label: d.label };
  });

  const selectedCoords = valid.map((d, i) => {
    if (d.selectedMarket == null || d.selectedMarket.price == null) return null;
    const x = padLeft + (i / (valid.length - 1)) * chartW;
    const y = padY + (h - padY * 2) - ((d.selectedMarket.price - min) / range) * (h - padY * 2);
    return { x, y, price: d.selectedMarket.price, marketName: d.selectedMarket.marketName, date: d.date, label: d.label };
  }).filter((c): c is NonNullable<typeof c> => c != null);

  const lowestLine = lowestCoords.map((c) => `${c.x},${c.y}`).join(" ");
  const highestLine = highestCoords.map((c) => `${c.x},${c.y}`).join(" ");
  const selectedLine = selectedCoords.map((c) => `${c.x},${c.y}`).join(" ");

  const lowestArea = `${lowestCoords[0]?.x ?? padLeft},${h} ${lowestLine} ${lowestCoords[lowestCoords.length - 1]?.x ?? w},${h}`;
  const highestArea = `${highestCoords[0]?.x ?? padLeft},${h} ${highestLine} ${highestCoords[highestCoords.length - 1]?.x ?? w},${h}`;
  const selectedArea = selectedCoords.length > 0 ? `${selectedCoords[0]?.x ?? padLeft},${h} ${selectedLine} ${selectedCoords[selectedCoords.length - 1]?.x ?? w},${h}` : "";

  

  return (
    <div
      className={`${PANEL_CLASS} p-4 sm:p-5 relative z-20`}
      style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-3">
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.inkFaint }}>
            Last 7 days
          </p>
          <p className="text-xs font-semibold mt-0.5 truncate" style={{ color: ANALYZE_THEME.inkMuted }}>
            Lowest & Highest for {commodityName}
          </p>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3">
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ background: ANALYZE_THEME.down }} />
              <span className="text-[9px] sm:text-[10px] font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
                Low
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ background: "#3b82f6" }} />
              <span className="text-[9px] sm:text-[10px] font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
                Sel
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 sm:w-3 sm:h-3 rounded-full" style={{ background: ANALYZE_THEME.up }} />
              <span className="text-[9px] sm:text-[10px] font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
                High
              </span>
            </div>
          </div>
          
          <div className="flex gap-0.5 p-0.5 rounded-lg self-end sm:self-auto" style={{ background: ANALYZE_THEME.surfaceMuted }}>
            {(["line", "area", "bar", "scatter"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setChartType(type)}
                className="text-[9px] sm:text-[10px] font-bold px-1.5 sm:px-2 py-1 rounded-md cursor-pointer transition-colors capitalize"
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
                    x1={padLeft}
                    y1={y}
                    x2={w - padRight}
                    y2={y}
                    stroke={ANALYZE_THEME.grid}
                    strokeDasharray="4 4"
                />
                <text
                  x={padLeft - 6}
                  y={y + 3}
                  fontSize="8"
                  fontWeight="bold"
                  fill={ANALYZE_THEME.inkMuted}
                  opacity={0.6}
                  textAnchor="end"
                >
                  {Math.round(val)}
                </text>
              </g>
            );
          })}

          {/* Area fills for area chart type */}
          {chartType === "area" && (
            <>
              <motion.polygon
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2 }}
                points={lowestArea}
                fill={`${ANALYZE_THEME.down}22`}
              />
              <motion.polygon
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                points={highestArea}
                fill={`${ANALYZE_THEME.up}22`}
              />
              {selectedArea && (
                <motion.polygon
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2, delay: 0.1 }}
                  points={selectedArea}
                  fill={`${"#3b82f6"}22`}
                />
              )}
            </>
          )}

          {/* Bar chart */}
          {chartType === "bar" && (
            <>
              {valid.map((d, i) => {
                const groupW = chartW / valid.length;
                const barW = groupW * 0.22;
                const spacing = groupW * 0.05;
                const groupX = padLeft + i * groupW;
                
                const lowestY = d.lowest?.price != null ? padY + (h - padY * 2) - ((d.lowest.price - min) / range) * (h - padY * 2) : h;
                const highestY = d.highest?.price != null ? padY + (h - padY * 2) - ((d.highest.price - min) / range) * (h - padY * 2) : h;
                const selectedY = d.selectedMarket?.price ? padY + (h - padY * 2) - ((d.selectedMarket.price - min) / range) * (h - padY * 2) : h;
                
                const isHovered = hoverIndex === i;
                
                return (
                  <g key={`bar-group-${i}`}>
                    {d.lowest && (
                      <motion.rect
                        x={groupX + spacing}
                        y={lowestY}
                        width={barW}
                        height={h - lowestY}
                        fill={ANALYZE_THEME.down}
                        initial={{ opacity: 0, scaleY: 0.4 }}
                        animate={{ opacity: isHovered ? 1 : 0.75, scaleY: 1 }}
                        transition={{ duration: 0.2, ease: "easeOut" }}
                        rx={1}
                        style={{ transformOrigin: "center bottom" }}
                      />
                    )}
                    {d.selectedMarket?.price && (
                      <motion.rect
                        x={groupX + spacing + barW + spacing}
                        y={selectedY}
                        width={barW}
                        height={h - selectedY}
                        fill="#3b82f6"
                        initial={{ opacity: 0, scaleY: 0.4 }}
                        animate={{ opacity: isHovered ? 1 : 0.75, scaleY: 1 }}
                        transition={{ duration: 0.2, ease: "easeOut", delay: 0.05 }}
                        rx={1}
                        style={{ transformOrigin: "center bottom" }}
                      />
                    )}
                    {d.highest && (
                      <motion.rect
                        x={groupX + spacing + (barW + spacing) * 2}
                        y={highestY}
                        width={barW}
                        height={h - highestY}
                        fill={ANALYZE_THEME.up}
                        initial={{ opacity: 0, scaleY: 0.4 }}
                        animate={{ opacity: isHovered ? 1 : 0.75, scaleY: 1 }}
                        transition={{ duration: 0.2, ease: "easeOut", delay: 0.1 }}
                        rx={1}
                        style={{ transformOrigin: "center bottom" }}
                      />
                    )}
                  </g>
                );
              })}
            </>
          )}

          {/* Line and scatter charts */}
          {(chartType === "line" || chartType === "scatter") && (
            <>
              <motion.polyline
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: chartType === "scatter" ? 0 : 1 
                }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
                fill="none"
                stroke={ANALYZE_THEME.down}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={lowestLine}
              />

              <motion.polyline
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ 
                  pathLength: 1, 
                  opacity: chartType === "scatter" ? 0 : 1 
                }}
                transition={{ duration: 0.3, ease: "easeInOut", delay: 0.1 }}
                fill="none"
                stroke={ANALYZE_THEME.up}
                strokeWidth={2.5}
                strokeLinejoin="round"
                strokeLinecap="round"
                points={highestLine}
              />

              {selectedLine && (
                <motion.polyline
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ 
                    pathLength: 1, 
                    opacity: chartType === "scatter" ? 0 : 1 
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut", delay: 0.15 }}
                  fill="none"
                  stroke="#3b82f6"
                  strokeWidth={2.5}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                  points={selectedLine}
                />
              )}
            </>
          )}

          {/* Data points */}
          {chartType !== "bar" && (
            <>
              {lowestCoords.map((c, i) => {
                const isHovered = hoverIndex === i;
                return (
                  <motion.circle
                    key={`lowest-${c.date}-${i}`}
                    cx={c.x}
                    cy={c.y}
                    r={isHovered ? 6 : 4}
                    fill={ANALYZE_THEME.surfaceRaised}
                    stroke={ANALYZE_THEME.down}
                    strokeWidth={2}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  />
                );
              })}

              {highestCoords.map((c, i) => {
                const isHovered = hoverIndex === i;
                return (
                  <motion.circle
                    key={`highest-${c.date}-${i}`}
                    cx={c.x}
                    cy={c.y}
                    r={isHovered ? 6 : 4}
                    fill={ANALYZE_THEME.surfaceRaised}
                    stroke={ANALYZE_THEME.up}
                    strokeWidth={2}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  />
                );
              })}

              {selectedCoords.map((c, i) => {
                const isHovered = hoverIndex === i;
                return (
                  <motion.circle
                    key={`selected-${c.date}-${i}`}
                    cx={c.x}
                    cy={c.y}
                    r={isHovered ? 6 : 4}
                    fill={ANALYZE_THEME.surfaceRaised}
                    stroke="#3b82f6"
                    strokeWidth={2}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.18, ease: "easeOut" }}
                  />
                );
              })}
            </>
          )}

          {/* Corrected Invisible Hover Zones */}
          {valid.map((_, i) => {
            const left =
              i === 0
                  ? padLeft
                  : (lowestCoords[i - 1].x + lowestCoords[i].x) / 2;

            const right =
                i === valid.length - 1
                    ? w - padRight
                    : (lowestCoords[i].x + lowestCoords[i + 1].x) / 2;
            
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

          {hoverIndex !== null && (
            <line
              x1={lowestCoords[hoverIndex].x}
              y1={padY}
              x2={lowestCoords[hoverIndex].x}
              y2={h}
              stroke={ANALYZE_THEME.inkFaint}
              strokeWidth={1}
              strokeDasharray="4 4"
              className="pointer-events-none"
            />
          )}
        </svg>

        <AnimatePresence>
          {hoverIndex !== null && (
            <div
              className="absolute pointer-events-none z-10 w-full"
              style={{
                left: 0,
                top: "50%", 
              }}
            >
              {(() => {
                const progress = hoverIndex / (valid.length - 1);
                const xOffset = progress < 0.35 ? "12px" : progress > 0.65 ? "calc(-100% - 12px)" : "-50%";
                const absoluteLeftPct = (padLeft / w) * 100 + progress * ((w - padLeft) / w) * 100;
                
                return (
                  <motion.div
                    initial={{ opacity: 0, x: xOffset, y: "calc(-100% + 5px)", scale: 0.95 }}
                    animate={{ opacity: 1, x: xOffset, y: "calc(-100% - 10px)", scale: 1 }}
                    exit={{ opacity: 0, x: xOffset, y: "calc(-100% + 5px)", scale: 0.95 }}
                    transition={{ duration: 0.15 }}
                    className="flex flex-col gap-1.5 sm:gap-2 p-2.5 sm:p-3 rounded-2xl shadow-2xl border min-w-[140px] sm:min-w-[160px]"
                    style={{
                      background: ANALYZE_THEME.surfaceRaised,
                      borderColor: ANALYZE_THEME.borderStrong,
                      position: "absolute",
                      left: `${absoluteLeftPct}%`,
                    }}
                  >
                    <p className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.inkFaint }}>
                      {lowestCoords[hoverIndex].label}
                    </p>
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: ANALYZE_THEME.down }} />
                        <span className="text-[8px] sm:text-[9px] font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
                          Low
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-black tabular-nums" style={{ color: ANALYZE_THEME.ink }}>
                        {formatRs(lowestCoords[hoverIndex]?.price ?? 0)}
                      </p>
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-medium truncate" style={{ color: ANALYZE_THEME.accentInk }}>
                      {lowestCoords[hoverIndex]?.marketName ?? "N/A"}
                    </p>
                    
                    <div className="h-px my-0.5" style={{ background: ANALYZE_THEME.border }} />
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: "#3b82f6" }} />
                        <span className="text-[8px] sm:text-[9px] font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
                          Sel
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-black tabular-nums" style={{ color: ANALYZE_THEME.ink }}>
                        {selectedCoords[hoverIndex] ? formatRs(selectedCoords[hoverIndex].price) : "N/A"}
                      </p>
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-medium truncate" style={{ color: ANALYZE_THEME.accentInk }}>
                      {selectedCoords[hoverIndex]?.marketName ?? "N/A"}
                    </p>
                    
                    <div className="h-px my-0.5" style={{ background: ANALYZE_THEME.border }} />
                    
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full" style={{ background: ANALYZE_THEME.up }} />
                        <span className="text-[8px] sm:text-[9px] font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
                          High
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-black tabular-nums" style={{ color: ANALYZE_THEME.ink }}>
                        {formatRs(highestCoords[hoverIndex]?.price ?? 0)}
                      </p>
                    </div>
                    <p className="text-[9px] sm:text-[10px] font-medium truncate" style={{ color: ANALYZE_THEME.accentInk }}>
                      {highestCoords[hoverIndex]?.marketName ?? "N/A"}
                    </p>
                  </motion.div>
                );
              })()}
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="relative mt-3 h-5">
    {valid.map((d, i) => (
        <div
            key={d.date}
            className="absolute text-[9px] sm:text-[10px] font-bold -translate-x-1/2 whitespace-nowrap"
            style={{
                left: `${(lowestCoords[i].x / w) * 100}%`,
                opacity: hoverIndex === i ? 1 : 0.6,
                color:
                    hoverIndex === i
                        ? ANALYZE_THEME.ink
                        : ANALYZE_THEME.inkFaint,
                transition: "all .2s",
            }}
        >
            {d.label}
        </div>
    ))}
</div>
    </div>
  );
}