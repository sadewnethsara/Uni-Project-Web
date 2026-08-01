"use client";

import { useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ANALYZE_THEME } from "@/lib/chartTheme";
import { toISODate } from "@/lib/analyticsData";
import type { DatePreset } from "@/lib/marketPageData";
import DateRangeCalendar from "../DateRangeCalendar";

interface MarketDatePickerProps {
  preset: DatePreset;
  customDate: string;
  viewDateLabel: string;
  onPresetChange: (preset: DatePreset) => void;
  onCustomDateChange: (iso: string) => void;
}

export default function MarketDatePicker({
  preset,
  customDate,
  viewDateLabel,
  onPresetChange,
  onCustomDateChange,
}: MarketDatePickerProps) {
  const [showCalendar, setShowCalendar] = useState(false);
  const todayIso = useMemo(() => toISODate(new Date()), []);

  const presets: { id: DatePreset; label: string }[] = [
    { id: "today", label: "Today" },
    { id: "yesterday", label: "Yesterday" },
  ];

  return (
    <div className="flex flex-col gap-2">
      {/* Preset buttons */}
      <div
        className="flex w-full md:w-2/3 mx-auto gap-1 rounded-xl"
        style={{ background: ANALYZE_THEME.surfaceMuted }}
      >
        {presets.map((p) => {
          const active = preset === p.id;

          return (
            <button
              key={p.id}
              type="button"
              onClick={() => {
                onPresetChange(p.id);
                setShowCalendar(false);
              }}
              className="flex-1 text-[11px] font-bold px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-center"
              style={{
                background: active
                  ? ANALYZE_THEME.surfaceRaised
                  : "transparent",
                color: active
                  ? ANALYZE_THEME.ink
                  : ANALYZE_THEME.inkMuted,
                boxShadow: active
                  ? "0 1px 3px rgba(61,48,36,0.08)"
                  : "none",
              }}
            >
              {p.label}
            </button>
          );
        })}

        <button
          type="button"
          onClick={() => {
            onPresetChange("custom");
            setShowCalendar((v) => !v);
          }}
          className="flex-1 text-[11px] font-bold px-3 py-2.5 rounded-lg cursor-pointer transition-colors text-center"
          style={{
            background:
              preset === "custom"
                ? ANALYZE_THEME.surfaceRaised
                : "transparent",
            color:
              preset === "custom"
                ? ANALYZE_THEME.ink
                : ANALYZE_THEME.inkMuted,
            boxShadow:
              preset === "custom"
                ? "0 1px 3px rgba(61,48,36,0.08)"
                : "none",
          }}
        >
          {preset === "custom"
            ? `📅 ${viewDateLabel}`
            : "Pick date"}
        </button>
      </div>

      {/* Calendar */}
      <AnimatePresence>
        {showCalendar && preset === "custom" && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            className="w-full flex justify-center"
          >
            <div className="w-full md:w-3/4">
              <DateRangeCalendar
                mode="single"
                onModeChange={() => { }}
                rangeFrom={customDate || todayIso}
                rangeTo={customDate || todayIso}
                onRangeChange={(from) => {
                  onCustomDateChange(from);
                  setShowCalendar(false);
                }}
                selectedDates={[]}
                onSelectedDatesChange={() => { }}
                onApply={() => {
                  if (customDate) setShowCalendar(false);
                }}
                onClose={() => setShowCalendar(false)}
                hideModeSwitcher={true}
              />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}