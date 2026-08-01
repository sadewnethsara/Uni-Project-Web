"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";
import {
  MARKET_COMMODITIES,
  formatRs,
  type CommodityDayPrice,
} from "@/lib/marketPageData";

interface MarketOverviewGridProps {
  board: CommodityDayPrice[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  marketId: string;
}

function TrendBadge({ trend, change }: { trend: CommodityDayPrice["trend"]; change: number | null }) {
  if (change == null || trend === "none") {
    return (
      <span className="text-[10px] font-bold" style={{ color: ANALYZE_THEME.inkFaint }}>
        No prior data
      </span>
    );
  }
  const color =
    trend === "up" ? ANALYZE_THEME.up : trend === "down" ? ANALYZE_THEME.down : ANALYZE_THEME.inkMuted;
  return (
    <span className="text-[11px] font-bold tabular-nums" style={{ color }}>
      {change >= 0 ? "+" : ""}
      {change}% vs prior day
    </span>
  );
}

export default function MarketOverviewGrid({ board, selectedId, onSelect, marketId }: MarketOverviewGridProps) {
  return (
    <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-2 2xl:grid-cols-3 gap-3">
      {MARKET_COMMODITIES.map((commodity, idx) => {
        const row = board.find((b) => b.commodityId === commodity.id)!;
        const isActive = selectedId === commodity.id;
        const unavailable = !row.available;

        return (
          <motion.button
            key={commodity.id}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.03 }}
            onClick={() => onSelect(commodity.id)}
            className={`${PANEL_CLASS} text-left p-4 flex gap-3 cursor-pointer transition-transform active:scale-[0.99] w-full`}
            style={{
              background: isActive ? ANALYZE_THEME.surfaceRaised : ANALYZE_THEME.surface,
              borderColor: isActive ? ANALYZE_THEME.accent : ANALYZE_THEME.border,
              outline: isActive ? `2px solid ${ANALYZE_THEME.accent}22` : "none",
              opacity: unavailable ? 0.72 : 1,
            }}
          >
            <div className="relative w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border" style={{ borderColor: ANALYZE_THEME.border }}>
              <Image src={commodity.image} alt={commodity.name} fill sizes="56px" className="object-cover" />
              {unavailable && (
                <div className="absolute inset-0 flex items-center justify-center text-[9px] font-black uppercase tracking-wide bg-black/45 text-white">
                  N/A
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-sm font-black truncate" style={{ color: ANALYZE_THEME.ink }}>
                    {commodity.name}
                  </h3>
                  {commodity.nameSi && (
                    <p className="text-[10px] font-medium" style={{ color: ANALYZE_THEME.inkFaint }}>
                      {commodity.nameSi}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-2">
                {unavailable ? (
                  <p className="text-xs font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
                    No price recorded
                  </p>
                ) : (
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${marketId}-${commodity.id}`}
                      initial={{ opacity: 0, y: -5, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 5, scale: 0.95 }}
                      transition={{ duration: 0.15, ease: "easeInOut" }}
                    >
                      <p className="text-lg font-black tabular-nums" style={{ color: ANALYZE_THEME.ink }}>
                        {formatRs(row.price)}
                        <span className="text-[11px] font-bold ml-1" style={{ color: ANALYZE_THEME.inkFaint }}>
                          / kg
                        </span>
                      </p>
                      <TrendBadge trend={row.trend} change={row.changeVsPrior} />
                    </motion.div>
                  </AnimatePresence>
                )}
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
}
