"use client";

import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANALYZE_THEME } from "@/lib/chartTheme";
import { MARKET_COMMODITIES, formatRs, type CommodityDayPrice } from "@/lib/marketPageData";
import { toISODate } from "@/lib/analyticsData";
import DateRangeCalendar from "@/components/DateRangeCalendar";
import type { DatePreset } from "@/lib/marketPageData";

interface MobileBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  board: CommodityDayPrice[];
  selectedCommodityId: string | null;
  onCommoditySelect: (id: string | null) => void;
  datePreset: DatePreset;
  customDate: string;
  viewDateLabel: string;
  onPresetChange: (preset: DatePreset) => void;
  onCustomDateChange: (iso: string) => void;
  marketId: string;
  defaultTab?: "vegetables" | "date";
}

/* ── Extracted Helper Components (Outside Render Scope for Pure React Lifecycle) ── */

interface VegetableListProps {
  board: CommodityDayPrice[];
  selectedCommodityId: string | null;
  onCommoditySelect: (id: string | null) => void;
  onClose: () => void;
}

function VegetableListContent({
  board,
  selectedCommodityId,
  onCommoditySelect,
  onClose,
}: VegetableListProps) {
  return (
    <div className="px-4 py-4 space-y-2">
      {MARKET_COMMODITIES.map((item) => {
        const row = board.find((b) => b.commodityId === item.id);
        const isActive = selectedCommodityId === item.id;
        const unavailable = !row?.available;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => {
              onCommoditySelect(item.id);
              onClose();
            }}
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
                <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm truncate" style={{ color: ANALYZE_THEME.ink }}>
                  {item.name}
                </h4>
                <span className="text-[11px] font-medium" style={{ color: ANALYZE_THEME.inkMuted }}>
                  {unavailable ? "No price today" : "Wholesale price"}
                </span>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              {unavailable ? (
                <span className="text-xs font-semibold" style={{ color: ANALYZE_THEME.inkFaint }}>
                  —
                </span>
              ) : (
                <>
                  <div className="font-extrabold text-base tabular-nums" style={{ color: ANALYZE_THEME.ink }}>
                    {row?.price != null ? formatRs(row.price).replace("Rs. ", "Rs.") : "—"}
                  </div>
                  {row?.changeVsPrior != null && (
                    <div
                      className="text-[11px] font-semibold mt-0.5 tabular-nums"
                      style={{
                        color:
                          row?.trend === "up"
                            ? ANALYZE_THEME.up
                            : row?.trend === "down"
                            ? ANALYZE_THEME.down
                            : ANALYZE_THEME.inkMuted,
                      }}
                    >
                      {row?.changeVsPrior >= 0 ? "+" : ""}
                      {row?.changeVsPrior}%
                    </div>
                  )}
                </>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}

interface DatePanelProps {
  activeSelectedIso: string;
  todayIso: string;
  yesterdayIso: string;
  datePreset: DatePreset;
  viewDateLabel: string;
  presets: { id: DatePreset; label: string; iso: string }[];
  onPresetChange: (preset: DatePreset) => void;
  onCustomDateChange: (iso: string) => void;
}

function DatePanelContent({
  activeSelectedIso,
  todayIso,
  yesterdayIso,
  datePreset,
  viewDateLabel,
  presets,
  onPresetChange,
  onCustomDateChange,
}: DatePanelProps) {
  return (
    <div className="px-4 py-4 space-y-4">
      <div
        className="w-full rounded-2xl overflow-hidden border p-1"
        style={{ borderColor: ANALYZE_THEME.border, background: ANALYZE_THEME.surface }}
      >
        <DateRangeCalendar
          mode="single"
          onModeChange={() => {}}
          rangeFrom={activeSelectedIso}
          rangeTo={activeSelectedIso}
          onRangeChange={(from) => {
            onCustomDateChange(from);
            if (from === todayIso) onPresetChange("today");
            else if (from === yesterdayIso) onPresetChange("yesterday");
            else onPresetChange("custom");
          }}
          selectedDates={[]}
          onSelectedDatesChange={() => {}}
          onApply={() => {}}
          hideModeSwitcher={true}
          embedded={true}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        {presets.map((p) => {
          const active = datePreset === p.id;
          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onPresetChange(p.id);
                onCustomDateChange(p.iso);
              }}
              className="px-4 py-3 rounded-xl text-xs font-bold cursor-pointer transition-all active:scale-[0.98] border"
              style={{
                background: active ? ANALYZE_THEME.accent : ANALYZE_THEME.surface,
                borderColor: active ? ANALYZE_THEME.accent : ANALYZE_THEME.border,
                color: active ? "#fff" : ANALYZE_THEME.ink,
              }}
            >
              {p.label}
            </button>
          );
        })}
      </div>
      <div
        className="flex items-center justify-between py-3 px-4 rounded-xl border"
        style={{ background: ANALYZE_THEME.surfaceMuted, borderColor: ANALYZE_THEME.border }}
      >
        <div>
          <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: ANALYZE_THEME.inkMuted }}>
            Selected Date
          </p>
          <p className="text-sm font-black" style={{ color: ANALYZE_THEME.ink }}>
            {viewDateLabel}
          </p>
        </div>
        <div
          className="px-2.5 py-1 rounded-full text-[11px] font-bold"
          style={{ background: ANALYZE_THEME.accentSoft, color: ANALYZE_THEME.accent }}
        >
          Active
        </div>
      </div>
    </div>
  );
}

interface ModalHeaderProps {
  activeTab: "vegetables" | "date";
  onClose: () => void;
}

function ModalHeaderContent({ activeTab, onClose }: ModalHeaderProps) {
  return (
    <div
      className="sticky top-0 z-10 px-4 py-3 border-b flex items-center justify-between"
      style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
    >
      <div className="flex items-center gap-2">
        <div className="w-1 h-5 rounded-full" style={{ background: ANALYZE_THEME.accent }} />
        <h3 className="text-base font-bold tracking-tight" style={{ color: ANALYZE_THEME.ink }}>
          {activeTab === "vegetables" ? "Select Vegetable" : "Select Date"}
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
}

/* ── Main Export Component ── */

export default function MobileBottomSheet({
  isOpen,
  onClose,
  board,
  selectedCommodityId,
  onCommoditySelect,
  datePreset,
  customDate,
  viewDateLabel,
  onPresetChange,
  onCustomDateChange,
  defaultTab = "vegetables",
}: Omit<MobileBottomSheetProps, "marketId"> & { marketId?: string }) {
  const [activeTab, setActiveTab] = useState<"vegetables" | "date">(defaultTab);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }

  const todayIso = useMemo(() => toISODate(new Date()), []);
  const yesterdayIso = useMemo(() => {
    const d = new Date();
    d.setDate(d.getDate() - 1);
    return toISODate(d);
  }, []);

  const activeSelectedIso = useMemo(() => {
    if (datePreset === "yesterday") return yesterdayIso;
    if (datePreset === "today") return todayIso;
    return customDate || todayIso;
  }, [datePreset, customDate, todayIso, yesterdayIso]);

  const presets: { id: DatePreset; label: string; iso: string }[] = useMemo(
    () => [
      { id: "today", label: "Today", iso: todayIso },
      { id: "yesterday", label: "Yesterday", iso: yesterdayIso },
    ],
    [todayIso, yesterdayIso]
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
            onClick={onClose}
            className="fixed inset-0 bg-black/50 z-50 backdrop-blur-sm"
          />

          {/* MOBILE: full-width bottom sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="md:hidden fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
            style={{ background: ANALYZE_THEME.surfaceRaised, borderTop: `1px solid ${ANALYZE_THEME.border}` }}
          >
            <div className="w-full flex justify-center pt-2.5 pb-1">
              <div className="w-12 h-1.5 rounded-full opacity-30" style={{ background: ANALYZE_THEME.ink }} />
            </div>

            <ModalHeaderContent activeTab={activeTab} onClose={onClose} />

            <div className="overflow-y-auto pb-8">
              {activeTab === "vegetables" ? (
                <VegetableListContent
                  board={board}
                  selectedCommodityId={selectedCommodityId}
                  onCommoditySelect={onCommoditySelect}
                  onClose={onClose}
                />
              ) : (
                <DatePanelContent
                  activeSelectedIso={activeSelectedIso}
                  todayIso={todayIso}
                  yesterdayIso={yesterdayIso}
                  datePreset={datePreset}
                  viewDateLabel={viewDateLabel}
                  presets={presets}
                  onPresetChange={onPresetChange}
                  onCustomDateChange={onCustomDateChange}
                />
              )}
            </div>
          </motion.div>

          {/* TABLET+: centered modal dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 12 }}
            transition={{ type: "spring", damping: 28, stiffness: 320 }}
            className="hidden md:flex fixed inset-0 z-50 items-center justify-center p-8 pointer-events-none"
          >
            <div
              className="pointer-events-auto w-full max-w-md rounded-3xl shadow-2xl overflow-hidden flex flex-col border"
              style={{
                background: ANALYZE_THEME.surfaceRaised,
                borderColor: ANALYZE_THEME.border,
                maxHeight: "85vh",
              }}
            >
              <div
                className="flex items-center gap-1 p-1 mx-4 mt-4 rounded-xl"
                style={{ background: ANALYZE_THEME.surfaceMuted }}
              >
                {(["vegetables", "date"] as const).map((tab) => (
                  <button
                    key={tab}
                    type="button"
                    onClick={() => setActiveTab(tab)}
                    className="flex-1 text-[12px] font-bold py-2 rounded-lg cursor-pointer transition-all capitalize"
                    style={{
                      background: activeTab === tab ? ANALYZE_THEME.surfaceRaised : "transparent",
                      color: activeTab === tab ? ANALYZE_THEME.ink : ANALYZE_THEME.inkMuted,
                      boxShadow: activeTab === tab ? "0 1px 4px rgba(61,48,36,0.1)" : "none",
                    }}
                  >
                    {tab === "vegetables" ? "🥬 Vegetable" : "📅 Date"}
                  </button>
                ))}
              </div>

              <ModalHeaderContent activeTab={activeTab} onClose={onClose} />

              <div className="overflow-y-auto pb-4">
                {activeTab === "vegetables" ? (
                  <VegetableListContent
                    board={board}
                    selectedCommodityId={selectedCommodityId}
                    onCommoditySelect={onCommoditySelect}
                    onClose={onClose}
                  />
                ) : (
                  <DatePanelContent
                    activeSelectedIso={activeSelectedIso}
                    todayIso={todayIso}
                    yesterdayIso={yesterdayIso}
                    datePreset={datePreset}
                    viewDateLabel={viewDateLabel}
                    presets={presets}
                    onPresetChange={onPresetChange}
                    onCustomDateChange={onCustomDateChange}
                  />
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}