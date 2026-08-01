"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";
import { getDailyPrice, formatDisplayDate, toISODate, parseISODate } from "@/lib/analyticsData";
import { getCommodityLabel, getMarketLabel } from "@/lib/analyticsData";

interface TimeComparisonPanelProps {
  commodityId: string;
  marketId: string;
  currentDate: Date;
  gradeFilter: "all" | "premium" | "standard";
}

interface TimeComparison {
  period: string;
  label: string;
  date: string;
  price: number | null;
  change: number | null;
  changePct: number | null;
}

export default function TimeComparisonPanel({
  commodityId,
  marketId,
  currentDate,
  gradeFilter,
}: TimeComparisonPanelProps) {
  const comparisons = useMemo(() => {
    const currentPrice = getDailyPrice(commodityId, marketId, currentDate, gradeFilter);
    
    const periods: TimeComparison[] = [
      {
        period: "current",
        label: "Today",
        date: toISODate(currentDate),
        price: currentPrice,
        change: null,
        changePct: null,
      },
    ];

    // Yesterday
    const yesterday = new Date(currentDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayPrice = getDailyPrice(commodityId, marketId, yesterday, gradeFilter);
    periods.push({
      period: "yesterday",
      label: "Yesterday",
      date: toISODate(yesterday),
      price: yesterdayPrice,
      change: currentPrice && yesterdayPrice ? currentPrice - yesterdayPrice : null,
      changePct: currentPrice && yesterdayPrice && yesterdayPrice !== 0 
        ? ((currentPrice - yesterdayPrice) / yesterdayPrice) * 100 
        : null,
    });

    // Last year same day
    const lastYear = new Date(currentDate);
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    const lastYearPrice = getDailyPrice(commodityId, marketId, lastYear, gradeFilter);
    periods.push({
      period: "lastYear",
      label: "Last year",
      date: toISODate(lastYear),
      price: lastYearPrice,
      change: currentPrice && lastYearPrice ? currentPrice - lastYearPrice : null,
      changePct: currentPrice && lastYearPrice && lastYearPrice !== 0 
        ? ((currentPrice - lastYearPrice) / lastYearPrice) * 100 
        : null,
    });

    // 2 years ago same day
    const twoYearsAgo = new Date(currentDate);
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    const twoYearsPrice = getDailyPrice(commodityId, marketId, twoYearsAgo, gradeFilter);
    periods.push({
      period: "twoYears",
      label: "2 years ago",
      date: toISODate(twoYearsAgo),
      price: twoYearsPrice,
      change: currentPrice && twoYearsPrice ? currentPrice - twoYearsPrice : null,
      changePct: currentPrice && twoYearsPrice && twoYearsPrice !== 0 
        ? ((currentPrice - twoYearsPrice) / twoYearsPrice) * 100 
        : null,
    });

    // 3 years ago same day
    const threeYearsAgo = new Date(currentDate);
    threeYearsAgo.setFullYear(threeYearsAgo.getFullYear() - 3);
    const threeYearsPrice = getDailyPrice(commodityId, marketId, threeYearsAgo, gradeFilter);
    periods.push({
      period: "threeYears",
      label: "3 years ago",
      date: toISODate(threeYearsAgo),
      price: threeYearsPrice,
      change: currentPrice && threeYearsPrice ? currentPrice - threeYearsPrice : null,
      changePct: currentPrice && threeYearsPrice && threeYearsPrice !== 0 
        ? ((currentPrice - threeYearsPrice) / threeYearsPrice) * 100 
        : null,
    });

    return periods;
  }, [commodityId, marketId, currentDate, gradeFilter]);

  const formatRs = (price: number | null) => {
    if (price == null) return "N/A";
    return `Rs. ${price.toFixed(2)}`;
  };

  const getChangeColor = (changePct: number | null) => {
    if (changePct == null) return ANALYZE_THEME.inkMuted;
    if (changePct > 0) return ANALYZE_THEME.up;
    if (changePct < 0) return ANALYZE_THEME.down;
    return ANALYZE_THEME.inkMuted;
  };

  return (
    <div className={`${PANEL_CLASS} p-4 sm:p-5`} style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}>
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.inkFaint }}>
          Time Comparison
        </p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: ANALYZE_THEME.inkMuted }}>
          {getCommodityLabel(commodityId)} at {getMarketLabel(marketId)}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {comparisons.map((comp, idx) => (
          <motion.div
            key={comp.period}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.08 }}
            className={`p-3 rounded-xl border ${
              comp.period === "current" 
                ? "border-2" 
                : "border"
            }`}
            style={{
              background: comp.period === "current" ? ANALYZE_THEME.surfaceRaised : ANALYZE_THEME.surfaceMuted,
              borderColor: comp.period === "current" ? ANALYZE_THEME.accent : ANALYZE_THEME.border,
            }}
          >
            <p className="text-[10px] font-bold uppercase tracking-wide mb-1" style={{ color: ANALYZE_THEME.inkFaint }}>
              {comp.label}
            </p>
            <p className="text-[9px] font-medium mb-2" style={{ color: ANALYZE_THEME.inkMuted }}>
              {formatDisplayDate(comp.date)}
            </p>
            <p className="text-lg font-black tabular-nums" style={{ color: ANALYZE_THEME.ink }}>
              {formatRs(comp.price)}
            </p>
            {comp.changePct != null && comp.period !== "current" && (
              <div className="mt-2">
                <p className="text-[10px] font-medium" style={{ color: ANALYZE_THEME.inkMuted }}>
                  vs Today
                </p>
                <p
                  className="text-sm font-bold tabular-nums"
                  style={{ color: getChangeColor(comp.changePct) }}
                >
                  {comp.changePct >= 0 ? "+" : ""}{comp.changePct.toFixed(1)}%
                </p>
                {comp.change != null && (
                  <p className="text-[10px] font-medium tabular-nums" style={{ color: ANALYZE_THEME.inkMuted }}>
                    {comp.change >= 0 ? "+" : ""}{comp.change.toFixed(2)} Rs
                  </p>
                )}
              </div>
            )}
            {comp.price == null && (
              <p className="text-[10px] font-medium mt-2" style={{ color: ANALYZE_THEME.down }}>
                No data
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
