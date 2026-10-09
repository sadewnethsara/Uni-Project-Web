"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  ANALYZE_COMMODITIES,
  ANALYZE_MARKETS,
  DEFAULT_COMPARE_MARKETS,
  TIMEFRAME_PRESETS,
  getCommodityLabel,
  getMarketLabel,
  getSeriesColor,
  type GradeFilter,
  type TimeframePreset,
} from "@/lib/analyticsData";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";
import DateRangeCalendar, { type CalendarSelectMode } from "./DateRangeCalendar";

interface FilterBarProps {
  selectedCommodities: string[];
  setSelectedCommodities: (val: string[]) => void;
  selectedMarkets: string[];
  setSelectedMarkets: (val: string[]) => void;
  timeframe: TimeframePreset;
  setTimeframe: (val: TimeframePreset) => void;
  calendarMode: CalendarSelectMode;
  setCalendarMode: (val: CalendarSelectMode) => void;
  customFrom: string;
  customTo: string;
  setCustomRange: (from: string, to: string) => void;
  selectedDates: string[];
  setSelectedDates: (dates: string[]) => void;
  onCalendarApply: () => void;
  gradeFilter: GradeFilter;
  setGradeFilter: (val: GradeFilter) => void;
  chartStyle: "line" | "candle" | "area" | "scatter" | "histogram" | "bar" | "column";
  setChartStyle: (val: "line" | "candle" | "area" | "scatter" | "histogram" | "bar" | "column") => void;
}

export default function AnalyzeFilterBar({
  selectedCommodities,
  setSelectedCommodities,
  selectedMarkets,
  setSelectedMarkets,
  timeframe,
  setTimeframe,
  calendarMode,
  setCalendarMode,
  customFrom,
  customTo,
  setCustomRange,
  selectedDates,
  setSelectedDates,
  onCalendarApply,
  gradeFilter,
  setGradeFilter,
  chartStyle,
  setChartStyle,
}: FilterBarProps) {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [marketSearch, setMarketSearch] = useState("");
  const [vegSearch, setVegSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const toggle = (name: string) => setOpenDropdown(openDropdown === name ? null : name);

  const toggleMarket = (id: string) => {
    if (selectedMarkets.includes(id)) {
      if (selectedMarkets.length <= 1) return;
      setSelectedMarkets(selectedMarkets.filter((m) => m !== id));
    } else {
      setSelectedMarkets([...selectedMarkets, id]);
    }
  };

  const toggleCommodity = (id: string) => {
    if (selectedCommodities.includes(id)) {
      if (selectedCommodities.length <= 1) return;
      setSelectedCommodities(selectedCommodities.filter((c) => c !== id));
    } else {
      setSelectedCommodities([...selectedCommodities, id]);
    }
  };

  // ⚡ Bolt Performance Optimization:
  // Memoize search filtering to prevent recalculation on every re-render (especially when toggling other dropdowns or filters)
  const filteredMarkets = useMemo(() => ANALYZE_MARKETS.filter(
    (m) =>
      m.shortName.toLowerCase().includes(marketSearch.toLowerCase()) ||
      m.id.includes(marketSearch.toLowerCase())
  ), [marketSearch]);

  const filteredVeg = useMemo(() => ANALYZE_COMMODITIES.filter((c) =>
    c.name.toLowerCase().includes(vegSearch.toLowerCase())
  ), [vegSearch]);

  const calendarLabel =
    timeframe !== "CUSTOM"
      ? "Calendar"
      : calendarMode === "multi"
        ? `${selectedDates.length || 0} dates`
        : "Range set";

  return (
    <div
      ref={containerRef}
      className={`w-full ${PANEL_CLASS} mb-4 relative z-30 sticky top-0 sm:top-4`}
      style={{
        background: "rgba(255,253,248,0.92)",
        backdropFilter: "blur(12px)",
        WebkitBackdropFilter: "blur(12px)",
        borderColor: ANALYZE_THEME.border,
        color: ANALYZE_THEME.ink,
        boxShadow: "0 8px 28px rgba(61,48,36,0.08)",
      }}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 px-3 py-2.5">
        <div className="flex flex-wrap items-center gap-1">
          {TIMEFRAME_PRESETS.map((tf) => (
            <button
              key={tf.id}
              type="button"
              onClick={() => {
                setTimeframe(tf.id);
                if (tf.id === "CUSTOM") setOpenDropdown("calendar");
                else setOpenDropdown(null);
              }}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors"
              style={{
                background: timeframe === tf.id ? ANALYZE_THEME.ink : "transparent",
                color: timeframe === tf.id ? ANALYZE_THEME.surfaceRaised : ANALYZE_THEME.inkMuted,
              }}
            >
              {tf.label}
            </button>
          ))}

          <div className="relative ml-1">
            <button
              type="button"
              onClick={() => {
                setTimeframe("CUSTOM");
                toggle("calendar");
              }}
              className="text-[11px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer border transition-colors"
              style={{
                background:
                  openDropdown === "calendar" || timeframe === "CUSTOM"
                    ? ANALYZE_THEME.accentSoft
                    : ANALYZE_THEME.surfaceMuted,
                borderColor:
                  openDropdown === "calendar" || timeframe === "CUSTOM"
                    ? ANALYZE_THEME.accent
                    : ANALYZE_THEME.border,
                color:
                  openDropdown === "calendar" || timeframe === "CUSTOM"
                    ? ANALYZE_THEME.accentInk
                    : ANALYZE_THEME.inkMuted,
              }}
            >
              {calendarLabel}
            </button>
            {openDropdown === "calendar" && (
              <div className="absolute left-0 top-full mt-2 z-[60]">
                <DateRangeCalendar
                  mode={calendarMode}
                  onModeChange={setCalendarMode}
                  rangeFrom={customFrom}
                  rangeTo={customTo}
                  onRangeChange={setCustomRange}
                  selectedDates={selectedDates}
                  onSelectedDatesChange={setSelectedDates}
                  onApply={() => {
                    onCalendarApply();
                    setOpenDropdown(null);
                  }}
                  onClose={() => setOpenDropdown(null)}
                />
              </div>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="flex gap-0.5 p-0.5 rounded-lg flex-wrap" style={{ background: ANALYZE_THEME.surfaceMuted }}>
            {(
              [
                { id: "candle", label: "Candles" },
                { id: "line", label: "Line" },
                { id: "area", label: "Area" },
                { id: "scatter", label: "Scatter" },
                { id: "histogram", label: "Histogram" },
                { id: "bar", label: "Bar" },
                { id: "column", label: "Column" },
              ] as const
            ).map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setChartStyle(c.id)}
                className="text-[10px] font-bold px-2 py-1 rounded-md cursor-pointer"
                style={{
                  background: chartStyle === c.id ? ANALYZE_THEME.surfaceRaised : "transparent",
                  color: chartStyle === c.id ? ANALYZE_THEME.ink : ANALYZE_THEME.inkMuted,
                  boxShadow: chartStyle === c.id ? "0 1px 3px rgba(61,48,36,0.08)" : undefined,
                }}
              >
                {c.label}
              </button>
            ))}
          </div>

          {/* Vegetables multi */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggle("veg")}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg border cursor-pointer"
              style={{
                borderColor: ANALYZE_THEME.border,
                background: openDropdown === "veg" ? ANALYZE_THEME.accentSoft : ANALYZE_THEME.surface,
                color: openDropdown === "veg" ? ANALYZE_THEME.accentInk : ANALYZE_THEME.ink,
              }}
            >
              Vegetables · {selectedCommodities.length}
            </button>
            {openDropdown === "veg" && (
              <div
                className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] shadow-xl rounded-2xl p-2 z-[60] border"
                style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.borderStrong }}
              >
                <input
                  type="text"
                  placeholder="Search vegetables…"
                  value={vegSearch}
                  onChange={(e) => setVegSearch(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs outline-none mb-2 border"
                  style={{
                    background: ANALYZE_THEME.surfaceMuted,
                    borderColor: ANALYZE_THEME.border,
                    color: ANALYZE_THEME.ink,
                  }}
                />
                <div className="flex gap-1 mb-2">
                  <button
                    type="button"
                    onClick={() => setSelectedCommodities(ANALYZE_COMMODITIES.map((c) => c.id))}
                    className="flex-1 text-[10px] font-bold uppercase rounded-lg py-1.5 cursor-pointer"
                    style={{ background: ANALYZE_THEME.surfaceMuted, color: ANALYZE_THEME.inkMuted }}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedCommodities(["carrot", "beans"])}
                    className="flex-1 text-[10px] font-bold uppercase rounded-lg py-1.5 cursor-pointer"
                    style={{ background: ANALYZE_THEME.surfaceMuted, color: ANALYZE_THEME.inkMuted }}
                  >
                    Carrot+Beans
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto flex flex-col gap-0.5">
                  {filteredVeg.map((c) => {
                    const checked = selectedCommodities.includes(c.id);
                    return (
                      <label
                        key={c.id}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer text-xs font-medium"
                        style={{ color: ANALYZE_THEME.ink }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleCommodity(c.id)}
                          className="w-3.5 h-3.5 accent-teal-800"
                        />
                        <span>{c.name}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Markets multi */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggle("markets")}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg border cursor-pointer"
              style={{
                borderColor: ANALYZE_THEME.border,
                background: openDropdown === "markets" ? ANALYZE_THEME.surfaceMuted : ANALYZE_THEME.surface,
                color: ANALYZE_THEME.ink,
              }}
            >
              Markets · {selectedMarkets.length}
            </button>
            {openDropdown === "markets" && (
              <div
                className="absolute right-0 mt-2 w-72 max-w-[calc(100vw-2rem)] shadow-xl rounded-2xl p-2 z-[60] border"
                style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.borderStrong }}
              >
                <input
                  type="text"
                  placeholder="Search markets…"
                  value={marketSearch}
                  onChange={(e) => setMarketSearch(e.target.value)}
                  className="w-full rounded-xl px-3 py-2 text-xs outline-none mb-2 border"
                  style={{
                    background: ANALYZE_THEME.surfaceMuted,
                    borderColor: ANALYZE_THEME.border,
                    color: ANALYZE_THEME.ink,
                  }}
                />
                <div className="flex gap-1 mb-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMarkets(ANALYZE_MARKETS.map((m) => m.id))}
                    className="flex-1 text-[10px] font-bold uppercase rounded-lg py-1.5 cursor-pointer"
                    style={{ background: ANALYZE_THEME.surfaceMuted, color: ANALYZE_THEME.inkMuted }}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMarkets([...DEFAULT_COMPARE_MARKETS])}
                    className="flex-1 text-[10px] font-bold uppercase rounded-lg py-1.5 cursor-pointer"
                    style={{ background: ANALYZE_THEME.surfaceMuted, color: ANALYZE_THEME.inkMuted }}
                  >
                    Defaults
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedMarkets(["dambulla", "keppetipola"])}
                    className="flex-1 text-[10px] font-bold uppercase rounded-lg py-1.5 cursor-pointer"
                    style={{ background: ANALYZE_THEME.surfaceMuted, color: ANALYZE_THEME.inkMuted }}
                  >
                    D+K
                  </button>
                </div>
                <div className="max-h-56 overflow-y-auto flex flex-col gap-0.5">
                  {filteredMarkets.map((m) => {
                    const checked = selectedMarkets.includes(m.id);
                    const colorIdx = selectedMarkets.indexOf(m.id);
                    return (
                      <label
                        key={m.id}
                        className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl cursor-pointer text-xs font-medium"
                        style={{ color: ANALYZE_THEME.ink }}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleMarket(m.id)}
                          className="w-3.5 h-3.5 accent-teal-800"
                        />
                        {checked && (
                          <span className="w-2 h-2 rounded-full" style={{ background: getSeriesColor(colorIdx) }} />
                        )}
                        <span>{m.shortName}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Grade */}
          <div className="relative">
            <button
              type="button"
              onClick={() => toggle("grade")}
              className="text-[11px] font-bold px-3 py-1.5 rounded-lg border cursor-pointer"
              style={{
                borderColor: ANALYZE_THEME.border,
                color: ANALYZE_THEME.inkMuted,
                background: ANALYZE_THEME.surface,
              }}
            >
              Grade · {gradeFilter === "all" ? "All" : gradeFilter === "premium" ? "A" : "B"}
            </button>
            {openDropdown === "grade" && (
              <div
                className="absolute right-0 mt-2 w-44 shadow-xl rounded-xl p-1.5 z-[60] border flex flex-col gap-0.5"
                style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.borderStrong }}
              >
                {(
                  [
                    { id: "all", label: "All grades" },
                    { id: "premium", label: "Premium A" },
                    { id: "standard", label: "Standard B" },
                  ] as { id: GradeFilter; label: string }[]
                ).map((g) => (
                  <button
                    key={g.id}
                    type="button"
                    onClick={() => {
                      setGradeFilter(g.id);
                      setOpenDropdown(null);
                    }}
                    className="text-left text-xs font-bold px-3 py-2 rounded-lg cursor-pointer"
                    style={{
                      background: gradeFilter === g.id ? ANALYZE_THEME.accentSoft : "transparent",
                      color: gradeFilter === g.id ? ANALYZE_THEME.accentInk : ANALYZE_THEME.inkMuted,
                    }}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Active chips */}
      <div
        className="flex flex-wrap gap-1.5 px-3 pb-2.5 border-t pt-2"
        style={{ borderColor: ANALYZE_THEME.border }}
      >
        {selectedCommodities.map((id) => (
          <button
            key={`c-${id}`}
            type="button"
            onClick={() => toggleCommodity(id)}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer"
            style={{
              background: ANALYZE_THEME.accentSoft,
              borderColor: "transparent",
              color: ANALYZE_THEME.accentInk,
            }}
          >
            {getCommodityLabel(id)}
            {selectedCommodities.length > 1 && <span style={{ opacity: 0.7 }}>×</span>}
          </button>
        ))}
        {selectedMarkets.map((id, idx) => (
          <button
            key={`m-${id}`}
            type="button"
            onClick={() => toggleMarket(id)}
            className="inline-flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-lg border cursor-pointer"
            style={{
              background: ANALYZE_THEME.surfaceMuted,
              borderColor: ANALYZE_THEME.border,
              color: ANALYZE_THEME.ink,
            }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: getSeriesColor(idx) }} />
            {getMarketLabel(id)}
            {selectedMarkets.length > 1 && <span style={{ color: ANALYZE_THEME.inkFaint }}>×</span>}
          </button>
        ))}
      </div>
    </div>
  );
}
