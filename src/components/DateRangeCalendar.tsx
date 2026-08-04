"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MONTH_LABELS,
  formatDisplayDate,
  toISODate,
  parseISODate,
} from "@/lib/analyticsData";
import { ANALYZE_THEME } from "@/lib/chartTheme";

export type CalendarSelectMode = "range" | "multi" | "single";

interface DateRangeCalendarProps {
  mode: CalendarSelectMode;
  onModeChange: (mode: CalendarSelectMode) => void;
  rangeFrom: string;
  rangeTo: string;
  onRangeChange: (from: string, to: string) => void;
  selectedDates: string[];
  onSelectedDatesChange: (dates: string[]) => void;
  onApply: () => void;
  onClose?: () => void;
  hideModeSwitcher?: boolean;
  /** Set true when embedding directly inside sheets/modals without popover chromes */
  embedded?: boolean;
}

const WEEKDAYS = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

function startOfMonth(year: number, month: number) {
  return new Date(year, month, 1);
}

function daysInMonth(year: number, month: number) {
  return new Date(year, month + 1, 0).getDate();
}

/** Monday-first weekday index 0-6 */
function mondayIndex(d: Date) {
  const day = d.getDay();
  return day === 0 ? 6 : day - 1;
}

export default function DateRangeCalendar({
  mode,
  onModeChange,
  rangeFrom,
  rangeTo,
  onRangeChange,
  selectedDates,
  onSelectedDatesChange,
  onApply,
  onClose,
  hideModeSwitcher,
  embedded = false,
}: DateRangeCalendarProps) {
  const today = useMemo(() => {
    const t = new Date();
    return new Date(t.getFullYear(), t.getMonth(), t.getDate());
  }, []);
  const todayIso = toISODate(today);

  const [viewYear, setViewYear] = useState(() => today.getFullYear());
  const [viewMonth, setViewMonth] = useState(() => today.getMonth());
  const [rangeDraft, setRangeDraft] = useState<"from" | "to">("from");
  const [showYearList, setShowYearList] = useState(false);

  const selectedSet = useMemo(() => new Set(selectedDates), [selectedDates]);

  const cells = useMemo(() => {
    const first = startOfMonth(viewYear, viewMonth);
    const total = daysInMonth(viewYear, viewMonth);
    const offset = mondayIndex(first);
    const out: ({ iso: string; day: number; inMonth: true } | { inMonth: false })[] = [];
    for (let i = 0; i < offset; i++) out.push({ inMonth: false });
    for (let day = 1; day <= total; day++) {
      const iso = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
      out.push({ iso, day, inMonth: true });
    }
    while (out.length % 7 !== 0) out.push({ inMonth: false });
    return out;
  }, [viewYear, viewMonth]);

  const prevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else setViewMonth((m) => m + 1);
  };

  const isFuture = (iso: string) => iso > todayIso;

  const inRange = (iso: string) => {
    if (!rangeFrom || !rangeTo) return false;
    const a = rangeFrom <= rangeTo ? rangeFrom : rangeTo;
    const b = rangeFrom <= rangeTo ? rangeTo : rangeFrom;
    return iso >= a && iso <= b;
  };

  const handleDayClick = (iso: string) => {
    if (isFuture(iso)) return;

    if (mode === "single") {
      onRangeChange(iso, iso);
      return;
    }

    if (mode === "multi") {
      if (selectedSet.has(iso)) {
        onSelectedDatesChange(selectedDates.filter((d) => d !== iso));
      } else {
        onSelectedDatesChange([...selectedDates, iso].sort());
      }
      return;
    }

    // range mode
    if (rangeDraft === "from" || !rangeFrom) {
      onRangeChange(iso, iso);
      setRangeDraft("to");
      return;
    }
    if (iso < rangeFrom) {
      onRangeChange(iso, rangeFrom);
    } else {
      onRangeChange(rangeFrom, iso);
    }
    setRangeDraft("from");
  };

  const clearSelection = () => {
    if (mode === "multi") onSelectedDatesChange([]);
    else onRangeChange(todayIso, todayIso);
    if (mode === "range") setRangeDraft("from");

    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
  };

  return (
    <div
      className={`w-full rounded-2xl overflow-hidden ${embedded ? "" : "border shadow-xl"
        }`}
      style={{
        background: ANALYZE_THEME.surfaceRaised,
        borderColor: ANALYZE_THEME.borderStrong,
        color: ANALYZE_THEME.ink,
      }}
    >
      {/* Header controls (Mode Switcher & Optional Close) */}
      {(!hideModeSwitcher || (!embedded && onClose)) && (
        <div
          className="flex items-center justify-between px-3 py-2.5 border-b"
          style={{ borderColor: ANALYZE_THEME.border }}
        >
          {!hideModeSwitcher ? (
            <div
              className="flex gap-1 p-0.5 rounded-lg"
              style={{ background: ANALYZE_THEME.surfaceMuted }}
            >
              <button
                type="button"
                onClick={() => onModeChange("range")}
                className="text-[11px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                style={{
                  background: mode === "range" ? ANALYZE_THEME.ink : "transparent",
                  color: mode === "range" ? ANALYZE_THEME.surfaceRaised : ANALYZE_THEME.inkMuted,
                }}
              >
                Range
              </button>
              <button
                type="button"
                onClick={() => onModeChange("multi")}
                className="text-[11px] font-bold px-2.5 py-1 rounded-md cursor-pointer transition-colors"
                style={{
                  background: mode === "multi" ? ANALYZE_THEME.ink : "transparent",
                  color: mode === "multi" ? ANALYZE_THEME.surfaceRaised : ANALYZE_THEME.inkMuted,
                }}
              >
                Multi-select
              </button>
            </div>
          ) : (
            <div className="text-[11px] font-bold px-1" style={{ color: ANALYZE_THEME.ink }}>
              Select Date
            </div>
          )}

          {!embedded && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="text-sm font-bold cursor-pointer px-1 hover:opacity-75 transition-opacity"
              style={{ color: ANALYZE_THEME.inkFaint }}
            >
              ✕
            </button>
          )}
        </div>
      )}

      {/* Month Navigation */}
      <div className="flex items-center justify-between px-4 py-3">
        <button
          type="button"
          onClick={prevMonth}
          className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer font-bold text-lg hover:bg-black/5 transition-colors"
          style={{ color: ANALYZE_THEME.inkMuted }}
        >
          ‹
        </button>
        <button
          type="button"
          onClick={() => setShowYearList(!showYearList)}
          className="text-sm font-bold tracking-wide flex items-center gap-1.5 cursor-pointer px-3 py-1.5 rounded-xl transition-colors hover:bg-black/5"
        >
          <span>
            {MONTH_LABELS[viewMonth]} {viewYear}
          </span>
          <span className="text-[9px] opacity-60">▼</span>
        </button>
        <button
          type="button"
          onClick={nextMonth}
          className="w-9 h-9 rounded-xl flex items-center justify-center cursor-pointer font-bold text-lg hover:bg-black/5 transition-colors"
          style={{ color: ANALYZE_THEME.inkMuted }}
        >
          ›
        </button>
      </div>

      {/* Calendar Grid / Year Picker */}
      <AnimatePresence mode="wait">
        {showYearList ? (
          <motion.div
            key="years"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="grid grid-cols-4 gap-2 px-3 pb-3 pt-2 h-[230px] overflow-y-auto custom-scrollbar"
          >
            {Array.from({ length: 20 }).map((_, i) => {
              const y = today.getFullYear() - i;
              const isSelected = viewYear === y;
              return (
                <button
                  key={y}
                  type="button"
                  onClick={() => {
                    setViewYear(y);
                    setShowYearList(false);
                  }}
                  className="h-10 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                  style={{
                    background: isSelected ? ANALYZE_THEME.ink : "transparent",
                    color: isSelected ? ANALYZE_THEME.surfaceRaised : ANALYZE_THEME.ink,
                    border: `1px solid ${isSelected ? "transparent" : ANALYZE_THEME.border}`,
                  }}
                >
                  {y}
                </button>
              );
            })}
          </motion.div>
        ) : (
          <motion.div
            key={`month-${viewYear}-${viewMonth}`}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            transition={{ duration: 0.15 }}
          >
            <div className="grid grid-cols-7 gap-1 px-3 pb-1">
              {WEEKDAYS.map((d) => (
                <div
                  key={d}
                  className="text-center text-[11px] font-bold py-1"
                  style={{ color: ANALYZE_THEME.inkFaint }}
                >
                  {d}
                </div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 px-3 pb-4">
              {cells.map((cell, i) => {
                if (!cell.inMonth) return <div key={`e-${i}`} className="h-10" />;
                const iso = cell.iso;
                const future = isFuture(iso);
                const isToday = iso === todayIso;
                const isStart = (mode === "range" || mode === "single") && iso === rangeFrom;
                const isEnd = mode === "range" && iso === rangeTo;
                const mid = mode === "range" && inRange(iso) && !isStart && !isEnd;
                const multiOn = mode === "multi" && selectedSet.has(iso);
                const selected = isStart || isEnd || multiOn;

                return (
                  <button
                    key={iso}
                    type="button"
                    disabled={future}
                    onClick={() => handleDayClick(iso)}
                    className="h-10 text-xs font-bold rounded-xl transition-all relative cursor-pointer flex items-center justify-center"
                    style={{
                      background: selected
                        ? ANALYZE_THEME.ink
                        : mid
                          ? ANALYZE_THEME.accentSoft
                          : "transparent",
                      color: future
                        ? ANALYZE_THEME.inkFaint
                        : selected
                          ? ANALYZE_THEME.surfaceRaised
                          : mid
                            ? ANALYZE_THEME.accentInk
                            : ANALYZE_THEME.ink,
                      opacity: future ? 0.35 : 1,
                      boxShadow:
                        isToday && !selected
                          ? `inset 0 0 0 1.5px ${ANALYZE_THEME.accent}`
                          : undefined,
                      cursor: future ? "not-allowed" : "pointer",
                    }}
                  >
                    {cell.day}
                  </button>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selected tags list (Only rendered during multi-select mode) */}
      {mode === "multi" && selectedDates.length > 0 && (
        <div className="px-3 pb-3 flex flex-wrap gap-1 max-h-16 overflow-y-auto">
          {selectedDates.map((d, i) => {
            let label = d;
            try {
              const parsed = parseISODate(d.slice(0, 10));
              if (!isNaN(parsed.getTime())) {
                label = parsed.toLocaleDateString("en-LK", { day: "numeric", month: "short" });
              }
            } catch (e) {}

            return (
              <button
                key={`sel-date-${d}-${i}`}
                type="button"
                onClick={() => onSelectedDatesChange(selectedDates.filter((x) => x !== d))}
                className="text-[10px] font-bold px-2 py-1 rounded-lg cursor-pointer flex items-center gap-1"
                style={{ background: ANALYZE_THEME.surfaceMuted, color: ANALYZE_THEME.ink }}
              >
                {label} ×
              </button>
            );
          })}
        </div>
      )}

      {/* Footer (Clear and Apply buttons rendered ONLY when not embedded) */}
      {!embedded && (
        <div
          className="flex gap-2 px-3 py-3 border-t"
          style={{ borderColor: ANALYZE_THEME.border, background: ANALYZE_THEME.surfaceMuted }}
        >
          <button
            type="button"
            onClick={clearSelection}
            className="flex-1 text-xs font-bold py-2.5 rounded-xl border cursor-pointer"
            style={{
              borderColor: ANALYZE_THEME.border,
              color: ANALYZE_THEME.inkMuted,
              background: ANALYZE_THEME.surfaceRaised,
            }}
          >
            Clear
          </button>
          <button
            type="button"
            onClick={onApply}
            disabled={mode === "multi" && selectedDates.length === 0}
            className="flex-1 text-xs font-black py-2.5 rounded-xl disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            style={{ background: ANALYZE_THEME.ink, color: ANALYZE_THEME.surfaceRaised }}
          >
            Apply
          </button>
        </div>
      )}
    </div>
  );
}