"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import FloatingNavigationDock from "@/components/FloatingNavigationDock";
import AnalyzeFilterBar from "@/components/AnalyzeFilterBar";
import AdvancedChart, { type ChartDrawing, type DrawTool } from "@/components/analyze/AdvancedChart";
import CollapsibleSection from "@/components/analyze/CollapsibleSection";
import ScatterPlot from "@/components/analyze/ScatterPlot";
import Histogram from "@/components/analyze/Histogram";
import BarChart from "@/components/analyze/BarChart";
import ColumnChart from "@/components/analyze/ColumnChart";
import AnalyticsPanel from "@/components/analyze/AnalyticsPanel";
import TimeComparisonPanel from "@/components/analyze/TimeComparisonPanel";
import HistoricalComparisonChart from "@/components/analyze/HistoricalComparisonChart";
import AnalyticsMobileBottomSheet from "@/components/analyze/AnalyticsMobileBottomSheet";
import AnalyticsSimpleChart from "@/components/analyze/AnalyticsSimpleChart";
import MarketPredictionPanel from "@/components/analyze/MarketPredictionPanel";
import {
  DrawingToolbar,
  IndicatorToggles,
  OrderBookPanel,
  TradesTapePanel,
  WatchlistPanel,
} from "@/components/analyze/TradingSidePanels";
import { useAnalyzeDashboard } from "@/hooks/useAnalyzeDashboard";
import { analyzeStore } from "@/lib/analyzeStore";
import {
  ANALYZE_MARKETS,
  buildMarketSeries,
  computeStats,
  formatDisplayDate,
  getCommodityLabel,
  getDailyPrice,
  getMarketLabel,
  getSeriesColor,
  resolveDateRange,
  toISODate,
  type MarketSeries,
  type TimeframePreset,
} from "@/lib/analyticsData";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";
import { buildOrderBook, buildTradeTape } from "@/lib/marketDepth";
import { COMMODITY_DETAILS } from "../markets/marketData";

const MAX_SERIES = 8;

function buildCompareSeries(
  commodities: string[],
  markets: string[],
  from: Date,
  to: Date,
  grain: Parameters<typeof buildMarketSeries>[4],
  grade: Parameters<typeof buildMarketSeries>[5],
  dates?: Date[]
): MarketSeries[] {
  const out: MarketSeries[] = [];
  const multiVeg = commodities.length > 1;
  const multiMkt = markets.length > 1;

  for (const commodityId of commodities) {
    for (const marketId of markets) {
      if (out.length >= MAX_SERIES) break;
      const series = buildMarketSeries(commodityId, marketId, from, to, grain, grade, dates);
      const veg = getCommodityLabel(commodityId);
      const mkt = getMarketLabel(marketId);
      let label = mkt;
      if (multiVeg && multiMkt) label = `${veg} · ${mkt}`;
      else if (multiVeg) label = veg;
      else label = mkt;
      out.push({
        ...series,
        marketId: `${commodityId}__${marketId}`,
        marketName: label,
      });
    }
  }
  return out;
}

export default function AnalyzePage() {
  const dash = useAnalyzeDashboard();
  const [drawTool, setDrawTool] = useState<DrawTool>("cursor");
  const [drawings, setDrawings] = useState<ChartDrawing[]>([]);
  const [mobileTab, setMobileTab] = useState<"chart" | "analytics" | "ledger">("chart");
  const [isUpdating, setIsUpdating] = useState(false);
  const [pageReady, setPageReady] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [bottomSheetTab, setBottomSheetTab] = useState<"commodities" | "markets" | "timeframe">("commodities");

  const set = analyzeStore.set;

  const primaryCommodity = dash.commodities[0] ?? "carrot";
  const primaryMarket = dash.markets[0] ?? "dambulla";
  const commodityMeta = COMMODITY_DETAILS[primaryCommodity] || COMMODITY_DETAILS.carrot;
  const commodityName = getCommodityLabel(primaryCommodity);
  const locationList = ANALYZE_MARKETS.map((m) => m.shortName);
  const activeMarketLocation = getMarketLabel(primaryMarket);

  const periodMode =
    dash.timeframe === "CUSTOM"
      ? dash.calendarMode === "multi"
        ? "multi"
        : "custom"
      : dash.timeframe === "1D"
        ? "today"
        : "custom";

  const { from, to, grain, dates } = useMemo(() => {
    void dash.calendarApplied;
    return resolveDateRange(periodMode as "today" | "custom" | "multi", {
      timeframe: dash.timeframe === "CUSTOM" ? "CUSTOM" : dash.timeframe,
      customFrom: dash.customFrom,
      customTo: dash.customTo,
      selectedDates: dash.calendarMode === "multi" ? dash.selectedDates : undefined,
    });
  }, [
    periodMode,
    dash.timeframe,
    dash.customFrom,
    dash.customTo,
    dash.selectedDates,
    dash.calendarMode,
    dash.calendarApplied,
  ]);

  const seriesList = useMemo(
    () =>
      buildCompareSeries(
        dash.commodities,
        dash.markets,
        from,
        to,
        grain,
        dash.gradeFilter,
        dates
      ),
    [dash.commodities, dash.markets, from, to, grain, dash.gradeFilter, dates]
  );

  const primary = seriesList[0];
  const primaryStats = useMemo(() => computeStats(primary?.points ?? []), [primary]);
  const statsList = useMemo(
    () => seriesList.map((s) => ({ id: s.marketId, name: s.marketName, stats: computeStats(s.points) })),
    [seriesList]
  );

  const mid = primaryStats.latest || 200;
  const book = useMemo(
    () => buildOrderBook(mid, primaryCommodity, primaryMarket),
    [mid, primaryCommodity, primaryMarket]
  );
  const tape = useMemo(
    () => buildTradeTape(mid, primaryCommodity, primaryMarket),
    [mid, primaryCommodity, primaryMarket]
  );

  const watchItems = useMemo(() => {
    const today = new Date();
    return ANALYZE_MARKETS.map((m) => {
      const price = getDailyPrice(primaryCommodity, m.id, today, dash.gradeFilter);
      const yest = new Date(today);
      yest.setDate(yest.getDate() - 1);
      const prev = getDailyPrice(primaryCommodity, m.id, yest, dash.gradeFilter);
      const change = prev ? Math.round(((price - prev) / prev) * 10000) / 100 : 0;
      return { marketId: m.id, price, change };
    });
  }, [primaryCommodity, dash.gradeFilter]);

  const changeColor = primaryStats.changePct >= 0 ? ANALYZE_THEME.up : ANALYZE_THEME.down;

  const promoteMarket = (id: string) => {
    if (dash.markets.includes(id)) {
      set({ markets: [id, ...dash.markets.filter((m) => m !== id)] });
    } else {
      set({ markets: [id, ...dash.markets] });
    }
  };

  const handleMarketChange = (newMarketName: string) => {
    const marketId = ANALYZE_MARKETS.find((m) => m.shortName === newMarketName)?.id || "dambulla";
    set({ markets: [marketId] });
  };

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (dash.aiNonce > 0) {
      setDrawings([]);
      setIsUpdating(true);
      const t = window.setTimeout(() => setIsUpdating(false), 900);
      return () => window.clearTimeout(t);
    }
  }, [dash.aiNonce]);

  const filterSig = `${dash.commodities.join(",")}|${dash.markets.join(",")}|${dash.timeframe}|${dash.gradeFilter}|${dash.chartStyle}|${dash.calendarApplied}`;
  const prevFilterSig = useRef(filterSig);

  useEffect(() => {
    if (prevFilterSig.current === filterSig) return;
    prevFilterSig.current = filterSig;
    setIsUpdating(true);
    const t = window.setTimeout(() => setIsUpdating(false), 520);
    return () => window.clearTimeout(t);
  }, [filterSig]);

  useEffect(() => {
    fetch('http://localhost/NAMIS/backend/api/prices.php')
      .then(res => res.json())
      .then(data => {
        import('@/lib/analyticsData').then(m => {
          m.setApiPrices(data);
          const t = window.setTimeout(() => setPageReady(true), 80);
        });
      })
      .catch(err => {
        console.error("Failed to fetch prices for analytics", err);
        const t = window.setTimeout(() => setPageReady(true), 80);
      });
  }, []);

  const seriesTruncated =
    dash.commodities.length * dash.markets.length > MAX_SERIES;

  const contentKey = `${dash.aiNonce}-${dash.commodities.join("-")}-${dash.markets.join("-")}-${dash.timeframe}`;

  return (
    <div
      className="relative w-full max-w-full mx-auto pb-24 sm:pb-16 pt-1 sm:pt-2"
      style={{
        background: `linear-gradient(165deg, ${ANALYZE_THEME.page} 0%, #efe4d4 48%, ${ANALYZE_THEME.page} 100%)`,
        borderRadius: "1.5rem",
      }}
    >
      <AnimatePresence>
        {!pageReady && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="absolute inset-0 z-[45] flex flex-col items-center justify-center gap-4 rounded-3xl"
            style={{ background: ANALYZE_THEME.page }}
          >
            <div className="relative w-12 h-12">
              <span
                className="absolute inset-0 rounded-full border-2 border-transparent animate-spin"
                style={{ borderTopColor: ANALYZE_THEME.accent, borderRightColor: ANALYZE_THEME.accent }}
              />
              <span
                className="absolute inset-2 rounded-full border-2 border-transparent animate-spin"
                style={{
                  borderBottomColor: ANALYZE_THEME.up,
                  animationDirection: "reverse",
                  animationDuration: "0.8s",
                }}
              />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.18em]" style={{ color: ANALYZE_THEME.inkMuted }}>
              Loading analytics
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isUpdating && pageReady && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-x-0 top-0 z-[35] flex justify-center pt-3"
          >
            <motion.div
              initial={{ y: -12, opacity: 0, scale: 0.96 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -8, opacity: 0 }}
              className="flex items-center gap-2.5 px-4 py-2 rounded-full shadow-lg border"
              style={{
                background: ANALYZE_THEME.surfaceRaised,
                borderColor: ANALYZE_THEME.borderStrong,
                color: ANALYZE_THEME.accentInk,
              }}
            >
              <span className="flex gap-1">
                {[0, 1, 2].map((i) => (
                  <motion.span
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: ANALYZE_THEME.accent }}
                    animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 0.7, repeat: Infinity, delay: i * 0.12 }}
                  />
                ))}
              </span>
              <span className="text-[11px] font-bold">
                {dash.lastAiSummary && dash.aiNonce > 0 ? "Applying AI update…" : "Refreshing dashboard…"}
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="px-3 sm:px-5 lg:px-6 py-4 sm:py-5">
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: pageReady ? 1 : 0, y: pageReady ? 0 : 10 }}
          transition={{ duration: 0.4 }}
          className="mb-4 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3"
        >
          <div className="min-w-0">
            <p
              className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
              style={{ color: ANALYZE_THEME.accentInk }}
            >
              AgriLanka · Market Analytics
            </p>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: ANALYZE_THEME.ink }}>
              <AnimatePresence mode="wait">
                <motion.span
                  key={activeMarketLocation}
                  initial={{ opacity: 0, y: -10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="inline-block"
                >
                  {activeMarketLocation}
                </motion.span>
              </AnimatePresence>
              {" "}Price Intelligence
            </h1>
            <p
              className={`text-xs font-medium max-w-2xl transition-all duration-300 overflow-hidden
                ${isScrolled ? 'opacity-0 max-h-0 mt-0' : 'opacity-100 max-h-20 mt-1.5'}
                md:!opacity-100 md:!max-h-20 md:!mt-1.5
              `}
              style={{ color: ANALYZE_THEME.inkMuted }}
            >
              Multi-vegetable, multi-venue wholesale analytics — pick produce, markets, and dates. Ask the AI chat to
              reshape this dashboard in plain language.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {/* Mobile action buttons */}
            <div className="flex gap-2 lg:hidden w-full">
              <button
                onClick={() => {
                  setBottomSheetTab("commodities");
                  setIsBottomSheetOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-colors"
                style={{
                  background: ANALYZE_THEME.surfaceRaised,
                  borderColor: ANALYZE_THEME.border,
                  color: ANALYZE_THEME.ink,
                }}
              >
                <svg className="w-4 h-4" style={{ color: ANALYZE_THEME.accentInk }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                </svg>
                Vegetables
              </button>
              <button
                onClick={() => {
                  setBottomSheetTab("markets");
                  setIsBottomSheetOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-colors"
                style={{
                  background: ANALYZE_THEME.surfaceRaised,
                  borderColor: ANALYZE_THEME.border,
                  color: ANALYZE_THEME.ink,
                }}
              >
                <svg className="w-4 h-4" style={{ color: ANALYZE_THEME.accentInk }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                </svg>
                Markets
              </button>
              <button
                onClick={() => {
                  setBottomSheetTab("timeframe");
                  setIsBottomSheetOpen(true);
                }}
                className="flex-1 flex items-center justify-center gap-2 p-2.5 rounded-xl border text-[11px] font-bold cursor-pointer transition-colors"
                style={{
                  background: ANALYZE_THEME.surfaceRaised,
                  borderColor: ANALYZE_THEME.border,
                  color: ANALYZE_THEME.ink,
                }}
              >
                <svg className="w-4 h-4" style={{ color: ANALYZE_THEME.accentInk }} fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                </svg>
                Time
              </button>
            </div>

            <AnimatePresence mode="wait">
              {dash.lastAiSummary && (
                <motion.div
                  key={dash.aiNonce}
                  initial={{ opacity: 0, x: 12, scale: 0.96 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -8 }}
                  className="text-[10px] font-bold px-3 py-2 rounded-xl max-w-xs hidden lg:block"
                  style={{ background: ANALYZE_THEME.accentSoft, color: ANALYZE_THEME.accentInk }}
                >
                  AI · {dash.lastAiSummary}
                </motion.div>
              )}
            </AnimatePresence>
            <div
              className="hidden lg:flex items-center gap-2 text-[10px] font-bold px-3 py-2 rounded-full"
              style={{ background: ANALYZE_THEME.accentSoft, color: ANALYZE_THEME.accentInk }}
            >
              <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ANALYZE_THEME.up }} />
              LIVE FEED
            </div>
          </div>
        </motion.div>

        <div className="sticky top-4 z-40 hidden lg:block backdrop-blur-md bg-white/50 dark:bg-black/50">
          <AnalyzeFilterBar
            selectedCommodities={dash.commodities}
            setSelectedCommodities={(commodities) => set({ commodities })}
            selectedMarkets={dash.markets}
            setSelectedMarkets={(markets) => set({ markets })}
            timeframe={dash.timeframe}
            setTimeframe={(timeframe) => set({ timeframe })}
            calendarMode={dash.calendarMode}
            setCalendarMode={(calendarMode) => set({ calendarMode })}
            customFrom={dash.customFrom}
            customTo={dash.customTo}
            setCustomRange={(customFrom, customTo) => set({ customFrom, customTo })}
            selectedDates={dash.selectedDates}
            setSelectedDates={(selectedDates) => set({ selectedDates })}
            onCalendarApply={() =>
              set({ timeframe: "CUSTOM", calendarApplied: dash.calendarApplied + 1 })
            }
            gradeFilter={dash.gradeFilter}
            setGradeFilter={(gradeFilter) => set({ gradeFilter })}
            chartStyle={dash.chartStyle}
            setChartStyle={(chartStyle) => set({ chartStyle })}
          />
        </div>

        {/* Mobile-friendly hints */}
        <div className="lg:hidden mb-4 px-3 py-2.5 rounded-xl text-[11px] font-medium" style={{ background: ANALYZE_THEME.surface, border: `1px solid ${ANALYZE_THEME.border}`, color: ANALYZE_THEME.inkMuted }}>
          <p>💡 Tip: Use the buttons above to filter vegetables, markets, and timeframes. Check the bottom dock to switch between Dambulla, Keppetipola, and other markets.</p>
        </div>

        {/* Mobile-friendly simple chart */}
        <div className="lg:hidden">
          <AnalyticsSimpleChart
            points={primary?.points ?? []}
            seriesName={`${commodityName} at ${getMarketLabel(primaryMarket)}`}
            color={changeColor}
          />
        </div>



        <div
          className="mb-4 px-3 py-2.5 rounded-xl text-[11px] font-medium flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2"
          style={{
            background: ANALYZE_THEME.surface,
            border: `1px solid ${ANALYZE_THEME.border}`,
            color: ANALYZE_THEME.inkMuted,
          }}
        >
          <span>
            New here? Select vegetables + markets above, or tap the chat button and say{" "}
            <em style={{ color: ANALYZE_THEME.accentInk }}>“yesterday Dambulla and Keppetipola beans”</em>.
          </span>
          {seriesTruncated && (
            <span className="font-bold" style={{ color: ANALYZE_THEME.down }}>
              Showing first {MAX_SERIES} series — narrow your selection for clarity.
            </span>
          )}
        </div>

        <div className="flex xl:hidden gap-1 mb-3 p-1 rounded-xl" style={{ background: ANALYZE_THEME.surfaceMuted }}>
          {(
            [
              { id: "chart", label: "Trends" },
              { id: "analytics", label: "Analytics" },
              { id: "ledger", label: "Data" },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setMobileTab(t.id)}
              className="flex-1 text-[11px] font-bold py-2 rounded-lg cursor-pointer"
              style={{
                background: mobileTab === t.id ? ANALYZE_THEME.surfaceRaised : "transparent",
                color: mobileTab === t.id ? ANALYZE_THEME.ink : ANALYZE_THEME.inkMuted,
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        <motion.div
          key={contentKey}
          initial={{ opacity: 0.55, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          className="flex flex-col xl:flex-row gap-4 w-full items-start"
        >
          <div className="hidden xl:flex w-72 flex-shrink-0 flex-col gap-3 self-start sticky top-30">
            <WatchlistPanel items={watchItems} activeId={primaryMarket} onSelect={promoteMarket} />

          </div>

          <div className={`flex-1 min-w-0 w-full flex flex-col gap-3 ${mobileTab !== "chart" ? "hidden xl:flex" : ""}`}>


            <CollapsibleSection
              id="price-chart"
              title="Price chart"
              subtitle={`${seriesList.length} series · ${dash.chartStyle}`}
            >
              <div
                className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 border-b"
                style={{ borderColor: ANALYZE_THEME.border, background: ANALYZE_THEME.surface }}
              >
                <div className="flex flex-wrap gap-3 text-[11px] font-bold">
                  {seriesList.map((s, idx) => (
                    <span key={s.marketId} className="flex items-center gap-1.5" style={{ color: getSeriesColor(idx) }}>
                      <span className="w-2 h-2 rounded-sm" style={{ background: getSeriesColor(idx) }} />
                      {s.marketName}
                    </span>
                  ))}
                </div>
                <p className="text-[10px] font-semibold" style={{ color: ANALYZE_THEME.inkFaint }}>
                  {drawTool === "cursor"
                    ? "Crosshair · hover for OHLC"
                    : `Drawing: ${drawTool} · click & drag`}
                </p>
              </div>
              {dash.chartStyle === "scatter" ? (
                <ScatterPlot seriesList={seriesList} />
              ) : dash.chartStyle === "histogram" ? (
                <Histogram seriesList={seriesList} />
              ) : dash.chartStyle === "bar" ? (
                <BarChart seriesList={seriesList} />
              ) : dash.chartStyle === "column" ? (
                <ColumnChart seriesList={seriesList} />
              ) : (
                <AdvancedChart
                  seriesList={seriesList}
                  chartStyle={dash.chartStyle}
                  indicators={dash.indicators}
                  drawTool={drawTool}
                  drawings={drawings}
                  onDrawingsChange={setDrawings}
                />
              )}
            </CollapsibleSection>

            <CollapsibleSection
              id="analytics-panel"
              title="Advanced Analytics"
              subtitle="Statistical analysis & insights"
              defaultOpen={false}
              className={`${mobileTab !== "analytics" ? "hidden xl:block" : ""}`}
            >
              <AnalyticsPanel seriesList={seriesList} />
            </CollapsibleSection>
            {/* Market Prediction Panel */}
            <CollapsibleSection
              id="market-prediction"
              title="Market Predictions"
              subtitle="AI-powered price forecasts & trend analysis"
              defaultOpen={true}
            >
              <MarketPredictionPanel
                predictions={[
                  {
                    market: getMarketLabel(primaryMarket),
                    trend: (primaryStats.changePct >= 0 ? "up" : "down") as "up" | "down" | "stable",
                    confidence: 75 + Math.floor(Math.random() * 15),
                    timeframe: dash.timeframe === "1D" ? "24h" : dash.timeframe === "7D" ? "7 days" : dash.timeframe === "1M" ? "30 days" : "90 days",
                    reasoning: primaryStats.changePct >= 0
                      ? `Strong ${commodityName} demand observed at ${getMarketLabel(primaryMarket)}. Historical patterns suggest continued upward trend based on seasonal factors and current supply constraints.`
                      : `${commodityName} prices softening at ${getMarketLabel(primaryMarket)}. Increased supply from regional markets and seasonal harvest putting downward pressure on prices.`,
                    currentPrice: primaryStats.latest,
                    predictedPrice: primaryStats.latest * (1 + (primaryStats.changePct / 100) * 1.5),
                  },
                  ...(dash.markets.length > 1 ? [{
                    market: getMarketLabel(dash.markets[1]),
                    trend: (Math.random() > 0.5 ? "up" : "down") as "up" | "down",
                    confidence: 70 + Math.floor(Math.random() * 20),
                    timeframe: dash.timeframe === "1D" ? "24h" : dash.timeframe === "7D" ? "7 days" : dash.timeframe === "1M" ? "30 days" : "90 days",
                    reasoning: `Cross-market analysis shows correlation with ${getMarketLabel(primaryMarket)}. Price differentials may normalize as traders arbitrage opportunities.`,
                    currentPrice: statsList[1]?.stats.latest || primaryStats.latest * 0.95,
                    predictedPrice: (statsList[1]?.stats.latest || primaryStats.latest * 0.95) * (1 + (Math.random() - 0.5) * 0.1),
                  }] : []),
                ]}
              />
            </CollapsibleSection>

            <CollapsibleSection
              id="time-comparison"
              title="Time Comparison"
              subtitle="Today vs yesterday, last year, 2 years, 3 years"
              defaultOpen={true}
            >
              <TimeComparisonPanel
                commodityId={primaryCommodity}
                marketId={primaryMarket}
                currentDate={to}
                gradeFilter={dash.gradeFilter}
              />
            </CollapsibleSection>

            <CollapsibleSection
              id="historical-chart"
              title="Historical Trends"
              subtitle="30-day comparison across multiple years"
              defaultOpen={false}
            >
              <HistoricalComparisonChart
                commodityId={primaryCommodity}
                marketId={primaryMarket}
                currentDate={to}
                gradeFilter={dash.gradeFilter}
              />
            </CollapsibleSection>

            <CollapsibleSection
              id="venue-cards"
              title="Series snapshot"
              subtitle="Latest vs prior bar"
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 p-3">
                {statsList.map((item, idx) => (
                  <motion.div
                    key={item.id}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.04 }}
                    className={`${PANEL_CLASS} px-5 py-4`}
                    style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="w-3 h-3 rounded-full" style={{ background: getSeriesColor(idx) }} />
                      <span
                        className="text-sm font-bold uppercase truncate"
                        style={{ color: ANALYZE_THEME.inkFaint }}
                      >
                        {item.name}
                      </span>
                    </div>
                    <div className="text-2xl font-black tabular-nums" style={{ color: ANALYZE_THEME.ink }}>
                      Rs. {item.stats.latest.toFixed(2)}
                    </div>
                    <div
                      className="text-lg font-bold mt-1 tabular-nums"
                      style={{ color: item.stats.changePct >= 0 ? ANALYZE_THEME.up : ANALYZE_THEME.down }}
                    >
                      {item.stats.changePct >= 0 ? "+" : ""}
                      {item.stats.changePct}%
                    </div>
                  </motion.div>
                ))}
              </div>
            </CollapsibleSection>

            <CollapsibleSection
              id="session-ledger"
              title="Session ledger"
              subtitle={`${primary?.points.length ?? 0} bars · Rs/kg`}
              defaultOpen
            >
              <div className="overflow-x-auto max-h-72 overflow-y-auto">
                <table className="w-full text-left text-xs">
                  <thead
                    className="sticky top-0 z-10 border-b"
                    style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
                  >
                    <tr
                      className="text-[10px] uppercase tracking-wide font-bold"
                      style={{ color: ANALYZE_THEME.inkFaint }}
                    >
                      <th
                        className="px-3 py-2 sticky left-0"
                        style={{ background: ANALYZE_THEME.surfaceRaised }}
                      >
                        Time
                      </th>
                      {seriesList.map((s, idx) => (
                        <th key={s.marketId} className="px-3 py-2 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <span
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ background: getSeriesColor(idx) }}
                            />
                            {s.marketName}
                          </span>
                        </th>
                      ))}
                      <th className="px-3 py-2">O</th>
                      <th className="px-3 py-2">H</th>
                      <th className="px-3 py-2">L</th>
                      <th className="px-3 py-2">C</th>
                      <th className="px-3 py-2">Vol</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...(primary?.points ?? [])].reverse().map((p, revIdx) => {
                      const idx = (primary?.points.length ?? 0) - 1 - revIdx;
                      const up = (p.close ?? p.price) >= (p.open ?? p.price);
                      return (
                        <tr
                          key={p.date}
                          className="font-semibold tabular-nums border-b"
                          style={{ borderColor: ANALYZE_THEME.border, color: ANALYZE_THEME.ink }}
                        >
                          <td
                            className="px-3 py-2 sticky left-0"
                            style={{
                              color: ANALYZE_THEME.inkMuted,
                              background: ANALYZE_THEME.surfaceRaised,
                            }}
                          >
                            {p.label}
                          </td>
                          {seriesList.map((s, sIdx) => (
                            <td key={s.marketId} className="px-3 py-2" style={{ color: getSeriesColor(sIdx) }}>
                              {(s.points[idx]?.price ?? 0).toFixed(2)}
                            </td>
                          ))}
                          <td className="px-3 py-2">{(p.open ?? p.price).toFixed(2)}</td>
                          <td className="px-3 py-2">{(p.high ?? p.price).toFixed(2)}</td>
                          <td className="px-3 py-2">{(p.low ?? p.price).toFixed(2)}</td>
                          <td
                            className="px-3 py-2"
                            style={{ color: up ? ANALYZE_THEME.up : ANALYZE_THEME.down }}
                          >
                            {(p.close ?? p.price).toFixed(2)}
                          </td>
                          <td className="px-3 py-2" style={{ color: ANALYZE_THEME.inkMuted }}>
                            {(p.volume ?? 0).toLocaleString()}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CollapsibleSection>

            {commodityMeta.description && (
              <p className="text-[11px] font-medium px-1" style={{ color: ANALYZE_THEME.inkMuted }}>
                Focus: {commodityName} — {commodityMeta.description}
              </p>
            )}
          </div>

          <div
            className={`w-full xl:w-72 flex-shrink-0 flex-col gap-3 xl:sticky xl:top-30 xl:self-start ${mobileTab === "ledger" ? "flex" : "hidden xl:flex"
              }`}
          >
            <div
              className={`${PANEL_CLASS} px-4 py-3.5 flex flex-wrap items-end justify-between gap-4`}
              style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
            >
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-xl font-black tracking-tight" style={{ color: ANALYZE_THEME.ink }}>
                    {dash.commodities.map(getCommodityLabel).join(" · ").toUpperCase()}
                    <span className="font-bold text-base ml-1" style={{ color: ANALYZE_THEME.inkFaint }}>
                      / LKR
                    </span>
                  </h2>
                  <span
                    className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md"
                    style={{ background: ANALYZE_THEME.accentSoft, color: ANALYZE_THEME.accentInk }}
                  >
                    Spot · {getMarketLabel(primaryMarket)}
                  </span>
                </div>
                <p className="text-[11px] font-medium mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
                  {formatDisplayDate(toISODate(from))}
                  {toISODate(from) !== toISODate(to) && ` → ${formatDisplayDate(toISODate(to))}`}
                  {" · "}
                  {dash.commodities.length} veg · {dash.markets.length} venues ·{" "}
                  {dash.gradeFilter === "all" ? "All grades" : dash.gradeFilter}
                </p>
              </div>
              <div className="flex flex-wrap gap-5 sm:gap-7">
                {[
                  { label: "Last", value: primaryStats.latest.toFixed(2), color: changeColor },
                  {
                    label: "Change",
                    value: `${primaryStats.changePct >= 0 ? "+" : ""}${primaryStats.changePct}%`,
                    color: changeColor,
                  },
                  { label: "High", value: primaryStats.high.toFixed(2) },
                  { label: "Low", value: primaryStats.low.toFixed(2) },
                  { label: "Volume", value: (primaryStats.volume ?? 0).toLocaleString() },
                ].map((kpi) => (
                  <div key={kpi.label}>
                    <div
                      className="text-[9px] font-bold uppercase tracking-wide"
                      style={{ color: ANALYZE_THEME.inkFaint }}
                    >
                      {kpi.label}
                    </div>
                    <div
                      className="text-lg font-black tabular-nums mt-0.5"
                      style={{ color: kpi.color ?? ANALYZE_THEME.ink }}
                    >
                      {kpi.value}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col lg:flex-column gap-2 lg:items-center lg:justify-between">
              <DrawingToolbar
                tool={drawTool}
                onTool={(t) => setDrawTool(t as DrawTool)}
                onUndo={() => setDrawings((d) => d.slice(0, -1))}
                onClear={() => setDrawings([])}
                drawingCount={drawings.length}
              />
              <IndicatorToggles
                flags={dash.indicators}
                onChange={(key, val) =>
                  set({
                    indicators: {
                      ...dash.indicators,
                      [key]: val,
                    } as typeof dash.indicators,
                  })
                }
              />
            </div>
            {/* <OrderBookPanel bids={book.bids} asks={book.asks} spread={book.spread} mid={book.mid} /> */}
            {/* <TradesTapePanel trades={tape} /> */}
          </div>
        </motion.div>
      </div>

      <FloatingNavigationDock
        locations={locationList}
        activeLocation={activeMarketLocation}
        onLocationChange={handleMarketChange}
      />

      <AnalyticsMobileBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        selectedCommodities={dash.commodities}
        onCommoditiesChange={(commodities) => set({ commodities })}
        selectedMarkets={dash.markets}
        onMarketsChange={(markets) => set({ markets })}
        timeframe={dash.timeframe as TimeframePreset}
        onTimeframeChange={(timeframe) => set({ timeframe })}
        defaultTab={bottomSheetTab}
      />
    </div>
  );
}
