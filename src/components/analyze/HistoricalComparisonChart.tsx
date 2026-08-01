"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";
import { getDailyPrice, toISODate, formatDisplayDate } from "@/lib/analyticsData";
import { getCommodityLabel, getMarketLabel } from "@/lib/analyticsData";

interface HistoricalComparisonChartProps {
  commodityId: string;
  marketId: string;
  currentDate: Date;
  gradeFilter: "all" | "premium" | "standard";
}

interface HistoricalDataPoint {
  date: string;
  label: string;
  current: number | null;
  lastYear: number | null;
  twoYears: number | null;
  threeYears: number | null;
}

export default function HistoricalComparisonChart({
  commodityId,
  marketId,
  currentDate,
  gradeFilter,
}: HistoricalComparisonChartProps) {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  const formatRs = (n: number) => "Rs " + n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 });

  const data = useMemo(() => {
    const points: HistoricalDataPoint[] = [];
    
    // Get data for last 30 days for current year
    for (let i = 29; i >= 0; i--) {
      const d = new Date(currentDate);
      d.setDate(d.getDate() - i);
      const iso = toISODate(d);
      
      const currentPrice = getDailyPrice(commodityId, marketId, d, gradeFilter);
      
      // Same day last year
      const lastYear = new Date(d);
      lastYear.setFullYear(lastYear.getFullYear() - 1);
      const lastYearPrice = getDailyPrice(commodityId, marketId, lastYear, gradeFilter);
      
      // Same day 2 years ago
      const twoYears = new Date(d);
      twoYears.setFullYear(twoYears.getFullYear() - 2);
      const twoYearsPrice = getDailyPrice(commodityId, marketId, twoYears, gradeFilter);
      
      // Same day 3 years ago
      const threeYears = new Date(d);
      threeYears.setFullYear(threeYears.getFullYear() - 3);
      const threeYearsPrice = getDailyPrice(commodityId, marketId, threeYears, gradeFilter);
      
      points.push({
        date: iso,
        label: d.toLocaleDateString("en-LK", { day: "numeric", month: "short" }),
        current: currentPrice,
        lastYear: lastYearPrice,
        twoYears: twoYearsPrice,
        threeYears: threeYearsPrice,
      });
    }
    
    return points;
  }, [commodityId, marketId, currentDate, gradeFilter]);

  const validData = data.filter(d => d.current != null);
  const hasEnough = validData.length >= 2;

  if (!hasEnough) {
    return (
      <div
        className={`${PANEL_CLASS} p-6 flex flex-col items-center justify-center text-center min-h-[200px]`}
        style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}
      >
        <p className="text-sm font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
          Not enough historical data to show comparison
        </p>
        <p className="text-[11px] font-medium mt-1 max-w-xs" style={{ color: ANALYZE_THEME.inkFaint }}>
          Try selecting a different date or vegetable.
        </p>
      </div>
    );
  }

  const allPrices = [
    ...validData.map(d => d.current).filter((p): p is number => p != null),
    ...validData.map(d => d.lastYear).filter((p): p is number => p != null),
    ...validData.map(d => d.twoYears).filter((p): p is number => p != null),
    ...validData.map(d => d.threeYears).filter((p): p is number => p != null),
  ];
  
  const min = Math.min(...allPrices) * 0.95;
  const max = Math.max(...allPrices) * 1.05;
  const range = max - min || 1;
  const w = 600;
  const h = 180;
  const padY = 24;

  const currentCoords = validData.map((d, i) => {
    if (d.current == null) return null;
    const x = (i / (validData.length - 1)) * w;
    const y = padY + (h - padY * 2) - ((d.current - min) / range) * (h - padY * 2);
    return { x, y, price: d.current, date: d.date, label: d.label };
  }).filter((c): c is NonNullable<typeof c> => c != null);

  const lastYearCoords = validData.map((d, i) => {
    if (d.lastYear == null) return null;
    const x = (i / (validData.length - 1)) * w;
    const y = padY + (h - padY * 2) - ((d.lastYear - min) / range) * (h - padY * 2);
    return { x, y, price: d.lastYear, date: d.date, label: d.label };
  }).filter((c): c is NonNullable<typeof c> => c != null);

  const twoYearsCoords = validData.map((d, i) => {
    if (d.twoYears == null) return null;
    const x = (i / (validData.length - 1)) * w;
    const y = padY + (h - padY * 2) - ((d.twoYears - min) / range) * (h - padY * 2);
    return { x, y, price: d.twoYears, date: d.date, label: d.label };
  }).filter((c): c is NonNullable<typeof c> => c != null);

  const threeYearsCoords = validData.map((d, i) => {
    if (d.threeYears == null) return null;
    const x = (i / (validData.length - 1)) * w;
    const y = padY + (h - padY * 2) - ((d.threeYears - min) / range) * (h - padY * 2);
    return { x, y, price: d.threeYears, date: d.date, label: d.label };
  }).filter((c): c is NonNullable<typeof c> => c != null);

  const currentLine = currentCoords.map(c => `${c.x},${c.y}`).join(" ");
  const lastYearLine = lastYearCoords.map(c => `${c.x},${c.y}`).join(" ");
  const twoYearsLine = twoYearsCoords.map(c => `${c.x},${c.y}`).join(" ");
  const threeYearsLine = threeYearsCoords.map(c => `${c.x},${c.y}`).join(" ");

  return (
    <div className={`${PANEL_CLASS} p-4 sm:p-5 relative z-20`} style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}>
      <div className="flex items-center justify-between mb-4 gap-2 flex-wrap">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.inkFaint }}>
            Historical Comparison
          </p>
          <p className="text-xs font-semibold mt-0.5" style={{ color: ANALYZE_THEME.inkMuted }}>
            Last 30 days · {getCommodityLabel(commodityId)} at {getMarketLabel(marketId)}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: "#171717" }} />
            <span className="text-[10px] font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
              Current
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: "#ea580c" }} />
            <span className="text-[10px] font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
              Last Year
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: "#059669" }} />
            <span className="text-[10px] font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
              2 Years
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full" style={{ background: "#2563eb" }} />
            <span className="text-[10px] font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
              3 Years
            </span>
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

          <motion.polyline
            initial={{ pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            fill="none"
            stroke="#171717"
            strokeWidth={2.5}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={currentLine}
          />

          <motion.polyline
            initial={{ pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut", delay: 0.1 }}
            fill="none"
            stroke="#ea580c"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={lastYearLine}
          />

          <motion.polyline
            initial={{ pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut", delay: 0.15 }}
            fill="none"
            stroke="#059669"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={twoYearsLine}
          />

          <motion.polyline
            initial={{ pathLength: 0, opacity: 0.4 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: "easeInOut", delay: 0.2 }}
            fill="none"
            stroke="#2563eb"
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            points={threeYearsLine}
          />

          {currentCoords.map((c, i) => {
            const isHovered = hoverIndex === i;
            return (
              <motion.circle
                key={`current-${c.date}`}
                cx={c.x}
                cy={c.y}
                r={isHovered ? 6 : 4}
                fill={ANALYZE_THEME.surfaceRaised}
                stroke="#171717"
                strokeWidth={2}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              />
            );
          })}

          {validData.map((_, i) => {
            const zoneW = w / validData.length;
            const zoneX = (i / validData.length) * w;
            return (
              <rect
                key={`zone-${i}`}
                x={zoneX}
                y={0}
                width={zoneW}
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
              x1={(hoverIndex / (validData.length - 1)) * w}
              y1={padY}
              x2={(hoverIndex / (validData.length - 1)) * w}
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
              <motion.div
                initial={{ opacity: 0, y: 5, scale: 0.95 }}
                animate={{ opacity: 1, y: -10, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="flex flex-col gap-2 p-3 rounded-2xl shadow-2xl border min-w-[140px]"
                style={{
                  background: ANALYZE_THEME.surfaceRaised,
                  borderColor: ANALYZE_THEME.borderStrong,
                  position: "absolute",
                  left: `${((hoverIndex / (validData.length - 1)) * 100)}%`,
                  transform: `translate(${hoverIndex > validData.length - 2 ? "-100%" : hoverIndex < 1 ? "0%" : "-50%"}, -100%)`,
                  maxWidth: "calc(100% - 16px)",
                }}
              >
                <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.inkFaint }}>
                  {validData[hoverIndex].label}
                </p>
                
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#171717" }} />
                    <span className="text-[9px] font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
                      Current
                    </span>
                  </div>
                  <p className="text-sm font-black tabular-nums" style={{ color: ANALYZE_THEME.ink }}>
                    {currentCoords[hoverIndex] ? formatRs(currentCoords[hoverIndex].price) : "N/A"}
                  </p>
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#ea580c" }} />
                    <span className="text-[9px] font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
                      Last Year
                    </span>
                  </div>
                  <p className="text-sm font-black tabular-nums" style={{ color: ANALYZE_THEME.ink }}>
                    {lastYearCoords[hoverIndex] ? formatRs(lastYearCoords[hoverIndex].price) : "N/A"}
                  </p>
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#059669" }} />
                    <span className="text-[9px] font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
                      2 Years
                    </span>
                  </div>
                  <p className="text-sm font-black tabular-nums" style={{ color: ANALYZE_THEME.ink }}>
                    {twoYearsCoords[hoverIndex] ? formatRs(twoYearsCoords[hoverIndex].price) : "N/A"}
                  </p>
                </div>
                
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2 h-2 rounded-full" style={{ background: "#2563eb" }} />
                    <span className="text-[9px] font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
                      3 Years
                    </span>
                  </div>
                  <p className="text-sm font-black tabular-nums" style={{ color: ANALYZE_THEME.ink }}>
                    {threeYearsCoords[hoverIndex] ? formatRs(threeYearsCoords[hoverIndex].price) : "N/A"}
                  </p>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </motion.div>

      <div className="flex justify-between mt-3 text-[10px] font-bold px-2 relative" style={{ color: ANALYZE_THEME.inkFaint }}>
        {validData.map((d, i) => (
          <div 
            key={d.date} 
            className="flex-1 text-center truncate" 
            style={{ 
              opacity: hoverIndex === i ? 1 : 0.6,
              color: hoverIndex === i ? ANALYZE_THEME.ink : "inherit",
              transition: "all 0.2s",
              minWidth: `${100 / validData.length}%`
            }}
          >
            {d.label}
          </div>
        ))}
      </div>
    </div>
  );
}
