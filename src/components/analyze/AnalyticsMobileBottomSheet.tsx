"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANALYZE_THEME } from "@/lib/chartTheme";
import { ANALYZE_MARKETS, getCommodityLabel, getMarketLabel, type TimeframePreset } from "@/lib/analyticsData";
import { COMMODITY_DETAILS } from "@/app/(main)/markets/marketData";

interface AnalyticsMobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  selectedCommodities: string[];
  onCommoditiesChange: (commodities: string[]) => void;
  selectedMarkets: string[];
  onMarketsChange: (markets: string[]) => void;
  timeframe: TimeframePreset;
  onTimeframeChange: (timeframe: TimeframePreset) => void;
  defaultTab?: "commodities" | "markets" | "timeframe";
}

export default function AnalyticsMobileBottomSheet({
  isOpen,
  onClose,
  selectedCommodities,
  onCommoditiesChange,
  selectedMarkets,
  onMarketsChange,
  timeframe,
  onTimeframeChange,
  defaultTab = "commodities",
}: AnalyticsMobileBottomSheetProps) {
  const [activeTab, setActiveTab] = useState<"commodities" | "markets" | "timeframe">(defaultTab);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);
  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }

  const toggleCommodity = (commodityId: string) => {
    if (selectedCommodities.includes(commodityId)) {
      if (selectedCommodities.length > 1) {
        onCommoditiesChange(selectedCommodities.filter((c) => c !== commodityId));
      }
    } else {
      onCommoditiesChange([...selectedCommodities, commodityId]);
    }
  };

  const toggleMarket = (marketId: string) => {
    if (selectedMarkets.includes(marketId)) {
      if (selectedMarkets.length > 1) {
        onMarketsChange(selectedMarkets.filter((m) => m !== marketId));
      }
    } else {
      onMarketsChange([...selectedMarkets, marketId]);
    }
  };

  const timeframes: TimeframePreset[] = ["1D", "7D", "1M", "3M", "1Y", "YTD", "CUSTOM"];

  const renderCommoditiesList = () => (
    <div className="px-4 py-4 space-y-2">
      {Object.entries(COMMODITY_DETAILS).map(([id, details]) => {
        const isActive = selectedCommodities.includes(id);
        return (
          <button
            key={id}
            type="button"
            onClick={() => toggleCommodity(id)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-left cursor-pointer transition-all active:scale-[0.98] border"
            style={{
              borderColor: isActive ? ANALYZE_THEME.accent : ANALYZE_THEME.border,
              background: isActive ? ANALYZE_THEME.accentSoft : ANALYZE_THEME.surface,
              boxShadow: isActive ? `0 0 0 1px ${ANALYZE_THEME.accent}` : "none",
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="relative w-12 h-12 rounded-xl overflow-hidden flex-shrink-0"
                style={{ background: ANALYZE_THEME.surfaceMuted }}
              >
                <img src={details.image} alt={details.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm truncate" style={{ color: ANALYZE_THEME.ink }}>
                  {details.name}
                </h4>
                <span className="text-[11px] font-medium" style={{ color: ANALYZE_THEME.inkMuted }}>
                  {details.category}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              {isActive && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: ANALYZE_THEME.accent }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderMarketsList = () => (
    <div className="px-4 py-4 space-y-2">
      {ANALYZE_MARKETS.map((market) => {
        const isActive = selectedMarkets.includes(market.id);
        return (
          <button
            key={market.id}
            type="button"
            onClick={() => toggleMarket(market.id)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-left cursor-pointer transition-all active:scale-[0.98] border"
            style={{
              borderColor: isActive ? ANALYZE_THEME.accent : ANALYZE_THEME.border,
              background: isActive ? ANALYZE_THEME.accentSoft : ANALYZE_THEME.surface,
              boxShadow: isActive ? `0 0 0 1px ${ANALYZE_THEME.accent}` : "none",
            }}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ background: ANALYZE_THEME.surfaceMuted }}
              >
                <svg className="w-6 h-6" style={{ color: ANALYZE_THEME.accentInk }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm truncate" style={{ color: ANALYZE_THEME.ink }}>
                  {market.shortName}
                </h4>
                <span className="text-[11px] font-medium" style={{ color: ANALYZE_THEME.inkMuted }}>
                  {market.name}
                </span>
              </div>
            </div>
            <div className="flex-shrink-0">
              {isActive && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: ANALYZE_THEME.accent }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderTimeframeList = () => (
    <div className="px-4 py-4 space-y-2">
      {timeframes.map((tf) => {
        const isActive = timeframe === tf;
        return (
          <button
            key={tf}
            type="button"
            onClick={() => { onTimeframeChange(tf); onClose(); }}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 rounded-2xl text-left cursor-pointer transition-all active:scale-[0.98] border"
            style={{
              borderColor: isActive ? ANALYZE_THEME.accent : ANALYZE_THEME.border,
              background: isActive ? ANALYZE_THEME.accentSoft : ANALYZE_THEME.surface,
              boxShadow: isActive ? `0 0 0 1px ${ANALYZE_THEME.accent}` : "none",
            }}
          >
            <div className="min-w-0">
              <h4 className="font-bold text-sm" style={{ color: ANALYZE_THEME.ink }}>
                {tf}
              </h4>
              <span className="text-[11px] font-medium" style={{ color: ANALYZE_THEME.inkMuted }}>
                {tf === "1D" ? "Today" : tf === "7D" ? "7 Days" : tf === "1M" ? "1 Month" : tf === "3M" ? "3 Months" : tf === "1Y" ? "1 Year" : tf === "YTD" ? "Year to Date" : "Custom Range"}
              </span>
            </div>
            <div className="flex-shrink-0">
              {isActive && (
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center"
                  style={{ background: ANALYZE_THEME.accent }}
                >
                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                </div>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );

  const renderModalHeader = () => (
    <div
      className="sticky top-0 z-10 px-4 py-3 border-b flex items-center justify-between"
      style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
    >
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full" style={{ background: ANALYZE_THEME.accent }} />
        <h3 className="text-base font-bold tracking-tight" style={{ color: ANALYZE_THEME.ink }}>
          {activeTab === "commodities" ? "Select Vegetables" : activeTab === "markets" ? "Select Markets" : "Select Timeframe"}
        </h3>
      </div>
      <button
        type="button"
        onClick={onClose}
        className="p-2 rounded-full cursor-pointer transition-colors hover:bg-black/5 active:scale-95"
        style={{ color: ANALYZE_THEME.inkMuted }}
        aria-label="Close"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );

  const renderTabSelector = () => (
    <div className="flex gap-2 px-4 py-3 border-b" style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}>
      {[
        { id: "commodities", label: "Vegetables" },
        { id: "markets", label: "Markets" },
        { id: "timeframe", label: "Time" },
      ].map((tab) => (
        <button
          key={tab.id}
          type="button"
          onClick={() => setActiveTab(tab.id as any)}
          className="flex-1 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-all"
          style={{
            background: activeTab === tab.id ? ANALYZE_THEME.accent : ANALYZE_THEME.surfaceMuted,
            color: activeTab === tab.id ? "#fff" : ANALYZE_THEME.inkMuted,
          }}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
          />
          
          {/* Bottom Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[85vh] flex flex-col"
            style={{ background: ANALYZE_THEME.surfaceRaised }}
          >
            {renderModalHeader()}
            {renderTabSelector()}
            
            <div className="flex-1 overflow-y-auto">
              {activeTab === "commodities" && renderCommoditiesList()}
              {activeTab === "markets" && renderMarketsList()}
              {activeTab === "timeframe" && renderTimeframeList()}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}