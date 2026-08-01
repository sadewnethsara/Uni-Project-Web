"use client";

import type { CalendarSelectMode } from "@/components/DateRangeCalendar";
import type { ChartStyle, GradeFilter, TimeframePreset } from "@/lib/analyticsData";
import type { IndicatorFlags } from "@/lib/chartIndicators";
import { DEFAULT_COMPARE_MARKETS } from "@/lib/analyticsData";

export interface AnalyzeDashboardState {
  commodities: string[];
  markets: string[];
  timeframe: TimeframePreset;
  calendarMode: CalendarSelectMode;
  customFrom: string;
  customTo: string;
  selectedDates: string[];
  gradeFilter: GradeFilter;
  chartStyle: ChartStyle;
  calendarApplied: number;
  indicators: IndicatorFlags;
  /** Bumps when AI applies a prompt so UI can flash feedback */
  aiNonce: number;
  lastAiSummary: string | null;
}

type Listener = (state: AnalyzeDashboardState) => void;

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function defaultFrom(): string {
  const d = new Date();
  d.setDate(d.getDate() - 30);
  return toISODate(d);
}

export const DEFAULT_ANALYZE_STATE: AnalyzeDashboardState = {
  commodities: ["carrot"],
  markets: [...DEFAULT_COMPARE_MARKETS],
  timeframe: "1M",
  calendarMode: "range",
  customFrom: defaultFrom(),
  customTo: toISODate(new Date()),
  selectedDates: [],
  gradeFilter: "all",
  chartStyle: "candle",
  calendarApplied: 0,
  indicators: {
    ma7: true,
    ma25: true,
    ma99: false,
    bollinger: false,
    rsi: true,
    volume: true,
  },
  aiNonce: 0,
  lastAiSummary: null,
};

let state: AnalyzeDashboardState = { ...DEFAULT_ANALYZE_STATE, markets: [...DEFAULT_COMPARE_MARKETS] };
const listeners = new Set<Listener>();

export const analyzeStore = {
  get(): AnalyzeDashboardState {
    return state;
  },
  set(partial: Partial<AnalyzeDashboardState>) {
    state = { ...state, ...partial };
    listeners.forEach((l) => l(state));
  },
  patch(updater: (prev: AnalyzeDashboardState) => AnalyzeDashboardState) {
    state = updater(state);
    listeners.forEach((l) => l(state));
  },
  subscribe(listener: Listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  reset() {
    state = {
      ...DEFAULT_ANALYZE_STATE,
      markets: [...DEFAULT_COMPARE_MARKETS],
      customFrom: defaultFrom(),
      customTo: toISODate(new Date()),
    };
    listeners.forEach((l) => l(state));
  },
};
