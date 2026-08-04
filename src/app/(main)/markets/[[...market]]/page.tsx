"use client";

import { use, useEffect, useMemo, useState, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import FloatingNavigationDock from "@/components/FloatingNavigationDock";
import CommoditySidebar from "@/components/CommoditySidebar";
import MarketDatePicker from "@/components/market/MarketDatePicker";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import MarketOverviewGrid from "@/components/market/MarketOverviewGrid";
import MarketCompareStrip from "@/components/market/MarketCompareStrip";
import MarketSimpleChart from "@/components/market/MarketSimpleChart";
import MarketComparisonChart from "@/components/market/MarketComparisonChart";
import MarketAnalyzeLink from "@/components/market/MarketAnalyzeLink";
import MobileBottomSheet from "@/components/market/MobileBottomSheet";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";
import { formatDisplayDate, toISODate } from "@/lib/analyticsData";
import { analyzeStore } from "@/lib/analyzeStore";
import {
  getMarketDisplayName,
  getMarketMeta,
  getCommodityById,
  resolveViewDate,
  formatRs,
  MARKET_SLUGS,
  type DatePreset,
} from "@/lib/marketPageData";

interface PageProps {
  params: Promise<{ market?: string[] }>;
}

const normalizeMarketSlug = (slug: string): string => {
  const normalized = slug.toLowerCase().trim();
  if (normalized === "kappetipola") return "keppetipola";
  return MARKET_SLUGS.includes(normalized) ? normalized : "dambulla";
};

export default function MarketPage({ params }: PageProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const unwrappedParams = use(params);
  const urlSegments = unwrappedParams?.market || [];
  const currentSlug = urlSegments[0] || "";

  const [datePreset, setDatePreset] = useState<DatePreset>("today");
  const [customDate, setCustomDate] = useState(() => toISODate(new Date()));
  const scrollPositionRef = useRef<number>(0);
  const [isBottomSheetOpen, setIsBottomSheetOpen] = useState(false);
  const [bottomSheetTab, setBottomSheetTab] = useState<"vegetables" | "date">("vegetables");
  const [isScrolled, setIsScrolled] = useState(false);

  // Data fetching state
  const [apiBoard, setApiBoard] = useState<any[]>([]);
  const [apiPrices, setApiPrices] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (urlSegments.length === 0) {
      router.replace("/markets/dambulla");
    }
  }, [router, urlSegments.length]);

  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const marketId = normalizeMarketSlug(currentSlug || "dambulla");
  const selectedCommodityId = searchParams.get("commodity") || null;
  const marketMeta = getMarketMeta(marketId);
  const marketName = getMarketDisplayName(marketId);
  const locationList = MARKET_SLUGS.map((id) => getMarketDisplayName(id));

  const viewDate = useMemo(
    () => resolveViewDate(datePreset, customDate),
    [datePreset, customDate]
  );
  const viewDateLabel = formatDisplayDate(toISODate(viewDate));

  // Fetch prices and vegetables from API
  useEffect(() => {
    setIsLoading(true);
    Promise.all([
      fetch(`http://localhost/NAMIS/backend/api/prices.php`),
      fetch(`http://localhost/NAMIS/backend/api/vegetables.php`)
    ])
      .then(responses => Promise.all(responses.map(res => res.json())))
      .then(([prices, vegetables]) => {
        setApiPrices(prices);

        // Transform into the board format expected by components
        let targetDateStr = toISODate(viewDate);
        let currentMarketPrices = prices.filter((p: any) => p.market_id === marketId && p.date === targetDateStr);

        // Fallback: If selected viewDate has no entries, use latest available date for this market
        if (currentMarketPrices.length === 0) {
          const marketEntries = prices.filter((p: any) => p.market_id === marketId);
          if (marketEntries.length > 0) {
            targetDateStr = marketEntries[0].date;
            currentMarketPrices = prices.filter((p: any) => p.market_id === marketId && p.date === targetDateStr);
          }
        }

        const newBoard = vegetables.map((v: any) => {
          let pEntry = currentMarketPrices.find((p: any) => p.vegetable_id === v.id);
          // If still null, find any latest entry for this vegetable in this market
          if (!pEntry) {
            pEntry = prices.find((p: any) => p.market_id === marketId && p.vegetable_id === v.id);
          }

          // Find yesterday's price for trend
          const yEntry = prices.find((p: any) => p.market_id === marketId && p.vegetable_id === v.id && p.date !== (pEntry?.date ?? targetDateStr));

          let trend: "up" | "down" | "stable" | "none" = "none";
          let changeVsPrior = null;

          if (pEntry && yEntry) {
            const diff = pEntry.price - yEntry.price;
            if (diff > 0) trend = "up";
            else if (diff < 0) trend = "down";
            else trend = "stable";
            changeVsPrior = Math.round((diff / yEntry.price) * 100);
          }

          return {
            commodityId: v.id,
            price: pEntry ? parseFloat(pEntry.price) : null,
            available: !!pEntry,
            changeVsPrior,
            trend
          };
        });

        setApiBoard(newBoard);
        setIsLoading(false);
      })
      .catch(err => {
        console.error("Error fetching market data", err);
        setIsLoading(false);
      });
  }, [marketId, viewDateLabel]);

  const syncCommoditySelection = (commodityId: string | null) => {
    const nextPath = `/markets/${marketId}${commodityId ? `?commodity=${encodeURIComponent(commodityId)}` : ""}`;
    router.replace(nextPath, { scroll: false });
  };

  const handleMarketChange = (newMarketName: string) => {
    scrollPositionRef.current = window.scrollY;
    const newMarketId = normalizeMarketSlug(
      MARKET_SLUGS.find((slug) => getMarketDisplayName(slug) === newMarketName) || "dambulla"
    );
    const nextPath = `/markets/${newMarketId}${selectedCommodityId ? `?commodity=${encodeURIComponent(selectedCommodityId)}` : ""}`;
    router.push(nextPath, { scroll: false });
    setTimeout(() => {
      window.scrollTo({ top: scrollPositionRef.current, behavior: "smooth" });
    }, 50);
  };

  const board = apiBoard;
  const selectedCommodity = selectedCommodityId ? getCommodityById(selectedCommodityId) : null;
  const selectedRow = selectedCommodityId
    ? board.find((b) => b.commodityId === selectedCommodityId)
    : null;

  // Compute stats based on API data instead of mocked functions
  const comparison = useMemo(() => {
    if (!selectedCommodityId || apiPrices.length === 0) return null;
    const todayStr = toISODate(viewDate);

    const yesterday = new Date(viewDate);
    yesterday.setDate(yesterday.getDate() - 1);
    const yestStr = toISODate(yesterday);

    const lastYear = new Date(viewDate);
    lastYear.setFullYear(lastYear.getFullYear() - 1);
    const lastYearStr = toISODate(lastYear);

    const getPrice = (dateStr: string) => {
      const p = apiPrices.find(p => p.market_id === marketId && p.vegetable_id === selectedCommodityId && p.date === dateStr);
      return p ? parseFloat(p.price) : null;
    };

    const pToday = getPrice(todayStr);
    const pYest = getPrice(yestStr);
    const pLastYear = getPrice(lastYearStr);

    return {
      selected: { date: todayStr, label: "Selected", price: pToday, available: pToday !== null },
      yesterday: { date: yestStr, label: "Yesterday", price: pYest, available: pYest !== null },
      lastYear: { date: lastYearStr, label: "Last Year", price: pLastYear, available: pLastYear !== null },
      changeVsYesterday: pToday && pYest ? Math.round(((pToday - pYest) / pYest) * 100) : null,
      changeVsLastYear: pToday && pLastYear ? Math.round(((pToday - pLastYear) / pLastYear) * 100) : null,
    };
  }, [selectedCommodityId, apiPrices, marketId, viewDate]);

  const sparkline = useMemo(() => {
    if (!selectedCommodityId || apiPrices.length === 0) return [];
    const todayStr = toISODate(viewDate);
    return apiPrices
      .filter(p => p.market_id === marketId && p.vegetable_id === selectedCommodityId && p.date <= todayStr)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 7)
      .map(p => ({ date: p.date, label: formatDisplayDate(p.date), price: parseFloat(p.price) }))
      .reverse();
  }, [selectedCommodityId, apiPrices, marketId, viewDate]);

  const lowestPrice = useMemo(() => {
    if (!selectedCommodityId || apiPrices.length === 0) return null;
    const todayStr = toISODate(viewDate);
    const prices = apiPrices.filter(p => p.vegetable_id === selectedCommodityId && p.date === todayStr);
    if (prices.length === 0) return null;
    const minP = Math.min(...prices.map(p => parseFloat(p.price)));
    const minM = prices.find(p => parseFloat(p.price) === minP);
    return minM ? { marketId: minM.market_id, marketName: getMarketDisplayName(minM.market_id), price: minP } : null;
  }, [selectedCommodityId, apiPrices, viewDate]);

  const highestPrice = useMemo(() => {
    if (!selectedCommodityId || apiPrices.length === 0) return null;
    const todayStr = toISODate(viewDate);
    const prices = apiPrices.filter(p => p.vegetable_id === selectedCommodityId && p.date === todayStr);
    if (prices.length === 0) return null;
    const maxP = Math.max(...prices.map(p => parseFloat(p.price)));
    const maxM = prices.find(p => parseFloat(p.price) === maxP);
    return maxM ? { marketId: maxM.market_id, marketName: getMarketDisplayName(maxM.market_id), price: maxP } : null;
  }, [selectedCommodityId, apiPrices, viewDate]);

  const weeklyMarketPrices = useMemo(() => {
    if (!selectedCommodityId || apiPrices.length === 0) return [];

    const out: any[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(viewDate);
      d.setDate(d.getDate() - i);
      const iso = toISODate(d);

      const selectedPrice = apiPrices.find(p => p.market_id === marketId && p.vegetable_id === selectedCommodityId && p.date === iso);

      const pricesForDay = apiPrices.filter(p => p.vegetable_id === selectedCommodityId && p.date === iso);
      const lowest = pricesForDay.length > 0
        ? pricesForDay.reduce((min, p) => parseFloat(p.price) < parseFloat(min.price) ? p : min)
        : null;
      const highest = pricesForDay.length > 0
        ? pricesForDay.reduce((max, p) => parseFloat(p.price) > parseFloat(max.price) ? p : max)
        : null;

      out.push({
        date: iso,
        label: d.toLocaleDateString("en-LK", { weekday: "short", day: "numeric", month: "short" }),
        lowest: lowest ? { price: parseFloat(lowest.price), marketName: getMarketDisplayName(lowest.market_id) } : null,
        highest: highest ? { price: parseFloat(highest.price), marketName: getMarketDisplayName(highest.market_id) } : null,
        selectedMarket: selectedPrice ? { price: parseFloat(selectedPrice.price), marketName: getMarketDisplayName(marketId) } : null,
      });
    }
    return out;
  }, [selectedCommodityId, apiPrices, marketId, viewDate]);

  const listedCount = board.filter((b) => b.available).length;
  const missingCount = board.length - listedCount;

  const goToAnalyze = () => {
    const prev = analyzeStore.get();
    analyzeStore.set({
      commodities: selectedCommodityId ? [selectedCommodityId] : prev.commodities,
      markets: [marketId],
      timeframe: "7D",
      chartStyle: "line",
      aiNonce: prev.aiNonce + 1,
      lastAiSummary: selectedCommodityId
        ? `Opened analytics for ${selectedCommodity?.name} at ${marketName}.`
        : `Opened analytics for ${marketName}.`,
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#fdf6e3] via-[#f5edd6] to-[#ebe5d5]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-600"></div>
      </div>
    );
  }

  return (
    <div
      className="relative w-full max-w-full mx-auto pb-24 sm:pb-16 pt-1 sm:pt-2"
      style={{
        background: `linear-gradient(165deg, ${ANALYZE_THEME.page} 0%, #efe4d4 48%, ${ANALYZE_THEME.page} 100%)`,
        borderRadius: "1.5rem",
      }}
    >
      <div id="market-top-anchor" className="absolute top-0 left-0 w-1 h-1 pointer-events-none" />

      {/* Sticky sub-header: visible when main Header hides on scroll */}
      <div
        className="sticky top-0 z-40 w-full px-3 sm:px-5 lg:px-3"
        style={{
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: "1.5rem",
        }}
      >

        {/* Page header */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-0 flex flex-col gap-4"
        >
          <div className="pt-5 px-1 flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">

            <div className="min-w-0 flex-1">
              <p
                className="text-[10px] font-black uppercase tracking-[0.2em] mb-1"
                style={{ color: ANALYZE_THEME.accentInk }}
              >
                AgriLanka · Daily Market Board
              </p>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight" style={{ color: ANALYZE_THEME.ink }}>
                <AnimatePresence mode="wait">
                  <motion.span
                    key={marketId}
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeInOut" }}
                    className="inline-block"
                  >
                    {marketMeta?.name ?? marketName}
                  </motion.span>
                </AnimatePresence>
              </h1>
              <p
                className={`text-xs font-medium max-w-2xl transition-all duration-300 overflow-hidden
                  ${isScrolled ? 'opacity-0 max-h-0 mt-0' : 'opacity-100 max-h-20 mt-1.5'}
                  md:!opacity-100 md:!max-h-20 md:!mt-1.5
                `}
                style={{ color: ANALYZE_THEME.inkMuted }}
              >
                Plain wholesale prices — pick a vegetable to see today, yesterday, and last year side by side.
                No charts expertise needed.
              </p>
            </div>

            <div className="flex flex-col items-start lg:items-end gap-3 shrink-0 mt-2 lg:mt-0">
              {/* Mobile action buttons - only show when vegetable is selected */}
              {selectedCommodityId && (
                <div className="flex gap-2 lg:hidden w-full">
                  <button
                    onClick={() => {
                      setBottomSheetTab("vegetables");
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
                    Change
                  </button>
                  <button
                    onClick={() => {
                      setBottomSheetTab("date");
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
                    Date
                  </button>
                </div>
              )}

              <div
                className="hidden md:flex items-center gap-2 text-[10px] font-bold px-3 py-2 rounded-full"
                style={{ background: ANALYZE_THEME.accentSoft, color: ANALYZE_THEME.accentInk }}
              >
                <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ANALYZE_THEME.up }} />
                Daily prices
              </div>

              <div className="text-left lg:text-right">
                <p className="text-[11px] font-medium" style={{ color: ANALYZE_THEME.inkMuted }}>
                  <strong style={{ color: ANALYZE_THEME.ink }}>{listedCount}</strong> vegetables with prices on{" "}
                  {viewDateLabel}
                  {missingCount > 0 && (
                    <>
                      <span className="hidden lg:inline"><br /></span>
                      <span className="lg:hidden">{" · "}</span>
                      <strong style={{ color: ANALYZE_THEME.down }}>{missingCount}</strong> with no recorded data
                    </>
                  )}
                </p>
                {!selectedCommodityId && (
                  <p className="text-[10px] font-semibold mt-1" style={{ color: ANALYZE_THEME.accentInk }}>
                    Tap any card below to compare prices
                  </p>
                )}
              </div>

              {!selectedCommodityId && (
                <div className="relative lg:hidden mt-1 w-full">
                  <MarketDatePicker
                    preset={datePreset}
                    customDate={customDate}
                    viewDateLabel={viewDateLabel}
                    onPresetChange={setDatePreset}
                    onCustomDateChange={(iso) => {
                      setCustomDate(iso);
                      setDatePreset("custom");
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="px-3 sm:px-5 lg:px-3 py-4 sm:py-5">


        {/* Summary moved to header */}

        <div className="flex flex-col xl:flex-row gap-4 items-start">
          <CommoditySidebar
            selectedId={selectedCommodityId}
            onSelect={syncCommoditySelection}
            board={board}
            marketName={marketName}
            marketId={marketId}
          />

          <main className="flex-1 min-w-0 w-full flex flex-col gap-4">
            {!selectedCommodityId ? (
              <>
                <div
                  className={`${PANEL_CLASS} p-4 sm:p-5`}
                  style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
                >
                  <h2 className="text-lg font-black" style={{ color: ANALYZE_THEME.ink }}>
                    All vegetables at{" "}
                    <AnimatePresence mode="wait">
                      <motion.span
                        key={marketId}
                        initial={{ opacity: 0, y: -10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.2, ease: "easeInOut" }}
                        className="inline-block"
                      >
                        {marketName}
                      </motion.span>
                    </AnimatePresence>
                  </h2>
                  <p className="text-xs font-medium mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
                    Prices for {viewDateLabel}. Select one to view yesterday and last-year comparison.
                  </p>
                </div>

                <MarketOverviewGrid
                  board={board}
                  selectedId={selectedCommodityId}
                  onSelect={syncCommoditySelection}
                  marketId={marketId}
                />

                <MarketAnalyzeLink marketId={marketId} onNavigate={goToAnalyze} />
              </>
            ) : (
              <>
                {/* Detail header */}
                <div
                  className={`${PANEL_CLASS} p-4 sm:p-5`}
                  style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                    <div>
                      <p
                        className="text-[10px] font-black uppercase tracking-wider"
                        style={{ color: ANALYZE_THEME.accentInk }}
                      >
                        <AnimatePresence mode="wait">
                          <motion.span
                            key={marketId}
                            initial={{ opacity: 0, y: -10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            transition={{ duration: 0.2, ease: "easeInOut" }}
                            className="inline-block"
                          >
                            {marketName}
                          </motion.span>
                        </AnimatePresence>
                        {" · "}{viewDateLabel}
                      </p>
                      <AnimatePresence mode="wait">
                        <motion.h2
                          key={`${marketId}-${selectedCommodityId}-${viewDateLabel}`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18, ease: "easeInOut" }}
                          className="text-2xl sm:text-3xl font-black mt-1"
                          style={{ color: ANALYZE_THEME.ink }}
                        >
                          {selectedCommodity?.name}
                          {selectedCommodity?.nameSi && (
                            <span className="text-base font-bold ml-2" style={{ color: ANALYZE_THEME.inkFaint }}>
                              ({selectedCommodity.nameSi})
                            </span>
                          )}
                        </motion.h2>
                      </AnimatePresence>
                      {selectedCommodity?.description && (
                        <p className="text-xs font-medium mt-2 max-w-xl" style={{ color: ANALYZE_THEME.inkMuted }}>
                          {selectedCommodity.description}
                        </p>
                      )}
                    </div>

                    {!selectedRow?.available ? (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${marketId}-${selectedCommodityId}-${viewDateLabel}-unavailable`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18, ease: "easeInOut" }}
                          className="px-4 py-3 rounded-xl text-center sm:text-right"
                          style={{ background: ANALYZE_THEME.surfaceMuted }}
                        >
                          <p className="text-sm font-black" style={{ color: ANALYZE_THEME.inkMuted }}>
                            No price on this day
                          </p>
                          <p className="text-[11px] font-medium mt-1" style={{ color: ANALYZE_THEME.inkFaint }}>
                            Try Yesterday or another date
                          </p>
                        </motion.div>
                      </AnimatePresence>
                    ) : (
                      <AnimatePresence mode="wait">
                        <motion.div
                          key={`${marketId}-${selectedCommodityId}-${viewDateLabel}-price`}
                          initial={{ opacity: 0, y: 8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.18, ease: "easeInOut" }}
                          className="text-left sm:text-right"
                        >
                          <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.inkFaint }}>
                            Wholesale spot
                          </p>
                          <p className="text-3xl sm:text-4xl font-black tabular-nums mt-1" style={{ color: ANALYZE_THEME.ink }}>
                            {formatRs(selectedRow?.price)}
                          </p>
                          <p className="text-xs font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
                            per kg
                          </p>
                          {selectedRow?.changeVsPrior != null && (
                            <p
                              className="text-sm font-black mt-2 tabular-nums"
                              style={{
                                color:
                                  selectedRow?.trend === "up"
                                    ? ANALYZE_THEME.up
                                    : selectedRow?.trend === "down"
                                      ? ANALYZE_THEME.down
                                      : ANALYZE_THEME.inkMuted,
                              }}
                            >
                              {selectedRow?.changeVsPrior >= 0 ? "+" : ""}
                              {selectedRow?.changeVsPrior}% vs previous day
                            </p>
                          )}
                        </motion.div>
                      </AnimatePresence>
                    )}
                  </div>
                </div>

                {comparison && (
                  <MarketCompareStrip
                    comparison={comparison}
                    lowestPrice={lowestPrice}
                    highestPrice={highestPrice}
                    selectedMarketPrice={selectedRow?.price ?? null}
                    selectedMarketName={marketName}
                  />
                )}

                <MarketSimpleChart
                  points={sparkline}
                  commodityName={selectedCommodity?.name ?? "Vegetable"}
                />

                <MarketComparisonChart
                  weeklyData={weeklyMarketPrices}
                  commodityName={selectedCommodity?.name ?? "Vegetable"}
                />

                <MarketAnalyzeLink
                  marketId={marketId}
                  commodityId={selectedCommodityId}
                  onNavigate={goToAnalyze}
                />

                <button
                  type="button"
                  onClick={() => syncCommoditySelection(null)}
                  className="text-[11px] font-bold self-start px-3 py-2 rounded-lg cursor-pointer"
                  style={{ color: ANALYZE_THEME.accentInk, background: ANALYZE_THEME.accentSoft }}
                >
                  ← Back to all vegetables
                </button>
              </>
            )}
          </main>

          <aside className="hidden xl:flex flex-col shrink-0 sticky top-30 self-start z-10 w-[300px] xl:w-[320px]">
            <DateRangeCalendar
              mode="single"
              onModeChange={() => { }}
              rangeFrom={customDate || toISODate(new Date())}
              rangeTo={customDate || toISODate(new Date())}
              onRangeChange={(from) => {
                setCustomDate(from);
                setDatePreset("custom");
              }}
              selectedDates={[]}
              onSelectedDatesChange={() => { }}
              onApply={() => { }}
              hideModeSwitcher={true}
            />
          </aside>
        </div>

      </div>

      <FloatingNavigationDock
        locations={locationList}
        activeLocation={marketName}
        onLocationChange={handleMarketChange}
      />

      <MobileBottomSheet
        isOpen={isBottomSheetOpen}
        onClose={() => setIsBottomSheetOpen(false)}
        board={board}
        selectedCommodityId={selectedCommodityId}
        onCommoditySelect={syncCommoditySelection}
        datePreset={datePreset}
        customDate={customDate}
        viewDateLabel={viewDateLabel}
        onPresetChange={setDatePreset}
        onCustomDateChange={(iso) => {
          setCustomDate(iso);
          setDatePreset("custom");
        }}
        marketId={marketId}
        defaultTab={bottomSheetTab}
      />
    </div >
  );
}
