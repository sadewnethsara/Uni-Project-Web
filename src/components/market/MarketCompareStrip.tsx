"use client";

import { motion } from "framer-motion";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";
import { formatRs, type PriceComparison, type MarketPriceInfo } from "@/lib/marketPageData";

interface MarketCompareStripProps {
  comparison: PriceComparison;
  lowestPrice?: MarketPriceInfo | null;
  highestPrice?: MarketPriceInfo | null;
  selectedMarketPrice?: number | null;
  selectedMarketName?: string;
}

function CompareCell({
  title,
  subtitle,
  price,
  available,
  highlight,
  changeLabel,
  changeValue,
  marketName,
}: {
  title: string;
  subtitle: string;
  price: number | null;
  available: boolean;
  highlight?: boolean;
  changeLabel?: string;
  changeValue?: number | null;
  marketName?: string;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.18, ease: "easeInOut" }}
      className={`${PANEL_CLASS} p-4 flex-1 min-w-[140px]`}
      style={{
        background: highlight ? ANALYZE_THEME.surfaceRaised : ANALYZE_THEME.surface,
        borderColor: highlight ? ANALYZE_THEME.borderStrong : ANALYZE_THEME.border,
      }}
    >
      <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.inkFaint }}>
        {title}
      </p>
      <p className="text-[11px] font-medium mt-0.5 mb-3" style={{ color: ANALYZE_THEME.inkMuted }}>
        {subtitle}
      </p>
      {!available ? (
        <div>
          <p className="text-sm font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
            No data
          </p>
          <p className="text-[10px] font-medium mt-1" style={{ color: ANALYZE_THEME.inkFaint }}>
            Price not recorded for this day
          </p>
        </div>
      ) : (
        <>
          <p className="text-2xl font-black tabular-nums" style={{ color: ANALYZE_THEME.ink }}>
            {formatRs(price)}
          </p>
          <p className="text-[10px] font-bold mt-1" style={{ color: ANALYZE_THEME.inkFaint }}>
            per kg · wholesale
          </p>
          {marketName && (
            <p className="text-[11px] font-bold mt-1" style={{ color: ANALYZE_THEME.accentInk }}>
              {marketName}
            </p>
          )}
          {changeLabel != null && changeValue != null && (
            <p
              className="text-[11px] font-bold mt-2 tabular-nums"
              style={{
                color: changeValue >= 0 ? ANALYZE_THEME.up : changeValue < 0 ? ANALYZE_THEME.down : ANALYZE_THEME.inkMuted,
              }}
            >
              {changeValue >= 0 ? "+" : ""}
              {changeValue}% {changeLabel}
            </p>
          )}
        </>
      )}
    </motion.div>
  );
}

export default function MarketCompareStrip({ 
  comparison, 
  lowestPrice, 
  highestPrice, 
  selectedMarketPrice,
  selectedMarketName 
}: MarketCompareStripProps) {
  if (!comparison) {
    return null;
  }

  return (
    <motion.div
      key={`${comparison.selected.label}-${comparison.selected.price ?? "na"}-${comparison.changeVsYesterday ?? "na"}-${comparison.changeVsLastYear ?? "na"}`}
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="flex flex-col sm:flex-row gap-3 overflow-x-auto pb-1"
    >
      <CompareCell
        title="Lowest in all markets"
        subtitle={comparison.selected.label}
        price={lowestPrice?.price ?? null}
        available={lowestPrice != null}
        marketName={lowestPrice?.marketName}
      />
      <CompareCell
        title="Selected market today"
        subtitle={selectedMarketName || comparison.selected.label}
        price={selectedMarketPrice ?? comparison.selected.price}
        available={selectedMarketPrice != null || comparison.selected.available}
        highlight
        marketName={selectedMarketName}
      />
      <CompareCell
        title="Highest in all markets"
        subtitle={comparison.selected.label}
        price={highestPrice?.price ?? null}
        available={highestPrice != null}
        marketName={highestPrice?.marketName}
      />
    </motion.div>
  );
}
