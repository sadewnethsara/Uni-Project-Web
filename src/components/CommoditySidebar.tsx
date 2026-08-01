"use client";

import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";
import {
  MARKET_COMMODITIES,
  formatRs,
  type CommodityDayPrice,
} from "@/lib/marketPageData";

interface CommoditySidebarProps {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  board: CommodityDayPrice[];
  marketName: string;
  marketId: string;
}

export default function CommoditySidebar({
  selectedId,
  onSelect,
  board,
  marketName,
  marketId,
}: CommoditySidebarProps) {
  const listed = board.filter((b) => b.available).length;
  const missing = board.length - listed;

  return (
    <aside
      className={`${PANEL_CLASS} w-full lg:w-[300px] xl:w-[320px] flex flex-col overflow-hidden lg:sticky lg:top-30 lg:self-start z-10 hidden lg:flex`}
      style={{
        background: ANALYZE_THEME.surfaceRaised,
        borderColor: ANALYZE_THEME.border,
        maxHeight: "min(510px, 75vh)",
      }}
    >
      <div
        className="p-4 border-b flex justify-between items-start gap-2"
        style={{ borderColor: ANALYZE_THEME.border, background: ANALYZE_THEME.surface }}
      >
        <div>
          <p
            className="text-[10px] font-black uppercase tracking-[0.16em]"
            style={{ color: ANALYZE_THEME.accentInk }}
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={marketName}
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="inline-block"
              >
                {marketName}
              </motion.span>
            </AnimatePresence>
          </p>
          <h2 className="text-sm font-black mt-0.5" style={{ color: ANALYZE_THEME.ink }}>
            Today&apos;s vegetables
          </h2>
          <p className="text-[11px] font-medium mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
            {listed} with prices · {missing} no data
          </p>
        </div>
        {selectedId && (
          <button
            type="button"
            onClick={() => onSelect(null)}
            className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer shrink-0"
            style={{ background: ANALYZE_THEME.surfaceMuted, color: ANALYZE_THEME.inkMuted }}
          >
            Show all
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain">
        {MARKET_COMMODITIES.map((item) => {
          const row = board.find((b) => b.commodityId === item.id)!;
          const isActive = selectedId === item.id;
          const unavailable = !row.available;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelect(item.id)}
              className="w-full flex items-center justify-between gap-3 px-4 py-3 border-b text-left cursor-pointer transition-colors"
              style={{
                borderColor: ANALYZE_THEME.border,
                background: isActive ? ANALYZE_THEME.accentSoft : "transparent",
              }}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="relative w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 border"
                  style={{ borderColor: ANALYZE_THEME.border }}
                >
                  <Image src={item.image} alt={item.name} fill sizes="44px" className="object-cover" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-sm truncate" style={{ color: ANALYZE_THEME.ink }}>
                    {item.name}
                  </h4>
                  <span className="text-[10px] font-medium" style={{ color: ANALYZE_THEME.inkFaint }}>
                    {unavailable ? "No price today" : "Wholesale / kg"}
                  </span>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                {unavailable ? (
                  <span className="text-[11px] font-bold" style={{ color: ANALYZE_THEME.inkFaint }}>
                    —
                  </span>
                ) : (
                  <>
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={`${marketId}`}
                        initial={{ opacity: 0, y: -5, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 5, scale: 0.95 }}
                        transition={{ duration: 0.15, ease: "easeInOut" }}
                      >
                        <div className="font-black text-sm tabular-nums" style={{ color: ANALYZE_THEME.ink }}>
                          {formatRs(row.price).replace("Rs. ", "Rs.")}
                        </div>
                        {row.changeVsPrior != null && (
                          <div
                            className="text-[10px] font-bold mt-0.5 tabular-nums"
                            style={{
                              color:
                                row.trend === "up"
                                  ? ANALYZE_THEME.up
                                  : row.trend === "down"
                                    ? ANALYZE_THEME.down
                                    : ANALYZE_THEME.inkMuted,
                            }}
                          >
                            {row.changeVsPrior >= 0 ? "+" : ""}
                            {row.changeVsPrior}%
                          </div>
                        )}

                      </motion.div>
                    </AnimatePresence>
                  </>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
