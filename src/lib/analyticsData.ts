/** Deterministic multi-market commodity price analytics (Rs/kg). */

export type PeriodMode = "today" | "week" | "month" | "year" | "custom" | "multi";
export type GradeFilter = "all" | "premium" | "standard";
export type AggregateGrain = "hour" | "day" | "week" | "month";
export type ChartStyle = "line" | "candle" | "area" | "scatter" | "histogram" | "bar" | "column";
export type TimeframePreset = "1D" | "7D" | "1M" | "3M" | "1Y" | "YTD" | "CUSTOM";

export interface MarketMeta {
  id: string;
  name: string;
  shortName: string;
}

export interface PricePoint {
  date: string; // ISO date or datetime key
  label: string;
  price: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
}

export interface MarketSeries {
  marketId: string;
  marketName: string;
  points: PricePoint[];
}

export interface SeriesStats {
  latest: number;
  previous: number;
  changeAbs: number;
  changePct: number;
  high: number;
  low: number;
  avg: number;
  count: number;
  volume?: number;
}

export const ANALYZE_MARKETS: MarketMeta[] = [
  { id: "dambulla", name: "Dambulla Dedicated Economic Center", shortName: "Dambulla" },
  { id: "manning", name: "Manning Market (Colombo)", shortName: "Manning" },
  { id: "minuwangoda", name: "Minuwangoda Dedicated Economic Center", shortName: "Minuwangoda" },
  { id: "keppetipola", name: "Keppetipola Dedicated Economic Center", shortName: "Keppetipola" },
  { id: "meegoda", name: "Meegoda Dedicated Economic Center", shortName: "Meegoda" },
  { id: "welisara", name: "Welisara Dedicated Economic Center", shortName: "Welisara" },
  { id: "thambuttegama", name: "Thambuttegama Dedicated Economic Center", shortName: "Thambuttegama" },
  { id: "narahenpita", name: "Narahenpita Dedicated Economic Center", shortName: "Narahenpita" },
  { id: "embilipitiya", name: "Embilipitiya Dedicated Economic Center", shortName: "Embilipitiya" },
  { id: "nuwara-eliya", name: "Nuwara Eliya Economic Center", shortName: "Nuwara Eliya" },
];

/** Stable palette for multi-market chart / legend series */
export const SERIES_COLORS = [
  "#171717",
  "#ea580c",
  "#059669",
  "#2563eb",
  "#9333ea",
  "#db2777",
  "#0891b2",
  "#ca8a04",
  "#dc2626",
  "#4f46e5",
];

export function getSeriesColor(index: number): string {
  return SERIES_COLORS[index % SERIES_COLORS.length];
}

export const DEFAULT_COMPARE_MARKETS = ["dambulla", "keppetipola", "nuwara-eliya"];

/** Base wholesale Rs/kg anchors per commodity */
const COMMODITY_BASE: Record<string, number> = {
  carrot: 260,
  leeks: 185,
  cabbage: 145,
  potato: 205,
  tomato: 290,
  brinjal: 170,
  beans: 235,
  chilli: 420,
  cucumber: 155,
  pumpkin: 95,
  onion: 310,
  capsicum: 380,
  beetroot: 175,
  knol_khol: 140,
};

export const ANALYZE_COMMODITIES = [
  { id: "carrot", name: "Carrot" },
  { id: "beans", name: "Beans" },
  { id: "leeks", name: "Leeks" },
  { id: "cabbage", name: "Cabbage" },
  { id: "potato", name: "Potato" },
  { id: "tomato", name: "Tomato" },
  { id: "brinjal", name: "Brinjal" },
  { id: "chilli", name: "Green Chilli" },
  { id: "cucumber", name: "Cucumber" },
  { id: "pumpkin", name: "Pumpkin" },
  { id: "onion", name: "Onion" },
  { id: "capsicum", name: "Capsicum" },
  { id: "beetroot", name: "Beetroot" },
  { id: "knol_khol", name: "Knol Khol" },
] as const;

export function getCommodityLabel(id: string): string {
  return ANALYZE_COMMODITIES.find((c) => c.id === id)?.name ?? id;
}

/** Market price multipliers vs national baseline */
const MARKET_FACTOR: Record<string, number> = {
  dambulla: 0.92,
  manning: 1.18,
  minuwangoda: 1.05,
  keppetipola: 0.88,
  meegoda: 1.12,
  welisara: 1.08,
  thambuttegama: 0.85,
  narahenpita: 1.22,
  embilipitiya: 0.95,
  "nuwara-eliya": 0.9,
};

const GRADE_FACTOR: Record<GradeFilter, number> = {
  all: 1,
  premium: 1.12,
  standard: 0.94,
};

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seededUnit(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

function pad(n: number) {
  return String(n).padStart(2, "0");
}

export function toISODate(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function parseISODate(iso: string): Date {
  const [y, m, day] = iso.split("-").map(Number);
  return new Date(y, m - 1, day);
}

export function formatDisplayDate(iso: string): string {
  const d = parseISODate(iso.slice(0, 10));
  return d.toLocaleDateString("en-LK", { day: "numeric", month: "short", year: "numeric" });
}

export function getMarketLabel(id: string): string {
  return ANALYZE_MARKETS.find((m) => m.id === id)?.shortName ?? id;
}

/** Spot price for a commodity at a market on a calendar day (deterministic). */
export function getDailyPrice(
  commodityId: string,
  marketId: string,
  date: Date,
  grade: GradeFilter = "all"
): number {
  const base = COMMODITY_BASE[commodityId] ?? 200;
  const market = MARKET_FACTOR[marketId] ?? 1;
  const gradeMul = GRADE_FACTOR[grade];

  const dayKey = toISODate(date);
  const seed = hashString(`${commodityId}|${marketId}|${dayKey}`);
  const noise = (seededUnit(seed) - 0.5) * 0.22;
  const seasonal = Math.sin((date.getMonth() / 12) * Math.PI * 2 + hashString(commodityId) * 0.01) * 0.08;
  const weekly = Math.sin((date.getDay() / 7) * Math.PI * 2) * 0.03;
  const trend = ((date.getFullYear() - 2024) * 12 + date.getMonth()) * 0.004;

  const raw = base * market * gradeMul * (1 + noise + seasonal + weekly + trend);
  return Math.round(raw * 100) / 100;
}

/** OHLC + volume for candle charts (deterministic from daily close). */
export function getDailyOHLC(
  commodityId: string,
  marketId: string,
  date: Date,
  grade: GradeFilter = "all"
): Required<Pick<PricePoint, "open" | "high" | "low" | "close" | "volume" | "price">> {
  const close = getDailyPrice(commodityId, marketId, date, grade);
  const prev = new Date(date);
  prev.setDate(prev.getDate() - 1);
  const prevClose = getDailyPrice(commodityId, marketId, prev, grade);
  const seed = hashString(`${commodityId}|${marketId}|${toISODate(date)}|ohlc`);
  const rangePct = 0.025 + seededUnit(seed) * 0.04;
  const open = Math.round(prevClose * (1 + (seededUnit(seed + 1) - 0.5) * 0.02) * 100) / 100;
  const high = Math.round(Math.max(open, close) * (1 + rangePct) * 100) / 100;
  const low = Math.round(Math.min(open, close) * (1 - rangePct) * 100) / 100;
  const volume = Math.round(800 + seededUnit(seed + 7) * 4200 + Math.abs(close - open) * 12);
  return { open, high, low, close, volume, price: close };
}

function getHourlyPrice(
  commodityId: string,
  marketId: string,
  date: Date,
  hour: number,
  grade: GradeFilter
): number {
  const day = getDailyPrice(commodityId, marketId, date, grade);
  const seed = hashString(`${commodityId}|${marketId}|${toISODate(date)}|h${hour}`);
  const session = hour < 12 ? -0.03 : hour < 16 ? 0.01 : 0.04;
  const jitter = (seededUnit(seed) - 0.5) * 0.06;
  return Math.round(day * (1 + session + jitter) * 100) / 100;
}

function eachDay(from: Date, to: Date): Date[] {
  const out: Date[] = [];
  const cur = new Date(from.getFullYear(), from.getMonth(), from.getDate());
  const end = new Date(to.getFullYear(), to.getMonth(), to.getDate());
  while (cur <= end) {
    out.push(new Date(cur));
    cur.setDate(cur.getDate() + 1);
  }
  return out;
}

export function resolveDateRange(
  mode: PeriodMode,
  opts: {
    today?: Date;
    selectedYear?: number;
    selectedMonth?: number; // 0-11
    customFrom?: string;
    customTo?: string;
    weekAnchor?: string; // ISO date within the week
    selectedDates?: string[]; // multi-pick ISO dates
    timeframe?: TimeframePreset;
  } = {}
): { from: Date; to: Date; grain: AggregateGrain; dates?: Date[] } {
  const today = opts.today ?? new Date();
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

  // Timeframe presets (Binance-style) take priority when provided with custom/multi
  if (opts.timeframe && opts.timeframe !== "CUSTOM") {
    const to = endOfToday;
    const from = new Date(endOfToday);
    if (opts.timeframe === "1D") {
      return { from: endOfToday, to: endOfToday, grain: "hour" };
    }
    if (opts.timeframe === "7D") from.setDate(from.getDate() - 6);
    else if (opts.timeframe === "1M") from.setMonth(from.getMonth() - 1);
    else if (opts.timeframe === "3M") from.setMonth(from.getMonth() - 3);
    else if (opts.timeframe === "1Y") from.setFullYear(from.getFullYear() - 1);
    else if (opts.timeframe === "YTD") {
      from.setMonth(0);
      from.setDate(1);
    }
    const spanDays = Math.round((to.getTime() - from.getTime()) / 86400000);
    const grain: AggregateGrain = spanDays > 120 ? "week" : "day";
    return { from, to, grain };
  }

  if (mode === "multi" && opts.selectedDates?.length) {
    const sorted = [...opts.selectedDates].sort();
    const dates = sorted.map(parseISODate).filter((d) => d <= endOfToday);
    if (!dates.length) return { from: endOfToday, to: endOfToday, grain: "day", dates: [endOfToday] };
    return {
      from: dates[0],
      to: dates[dates.length - 1],
      grain: "day",
      dates,
    };
  }

  if (mode === "today") {
    return { from: endOfToday, to: endOfToday, grain: "hour" };
  }

  if (mode === "week") {
    const anchor = opts.weekAnchor ? parseISODate(opts.weekAnchor) : endOfToday;
    const day = anchor.getDay();
    const mondayOffset = day === 0 ? -6 : 1 - day;
    const from = new Date(anchor);
    from.setDate(anchor.getDate() + mondayOffset);
    const to = new Date(from);
    to.setDate(from.getDate() + 6);
    if (to > endOfToday) to.setTime(endOfToday.getTime());
    return { from, to, grain: "day" };
  }

  if (mode === "month") {
    const year = opts.selectedYear ?? endOfToday.getFullYear();
    const month = opts.selectedMonth ?? endOfToday.getMonth();
    const from = new Date(year, month, 1);
    const last = new Date(year, month + 1, 0);
    const to = last > endOfToday ? endOfToday : last;
    return { from, to, grain: "day" };
  }

  if (mode === "year") {
    const year = opts.selectedYear ?? endOfToday.getFullYear();
    const from = new Date(year, 0, 1);
    const last = new Date(year, 11, 31);
    const to = last > endOfToday ? endOfToday : last;
    return { from, to, grain: "week" };
  }

  // custom range
  const from = opts.customFrom ? parseISODate(opts.customFrom) : new Date(endOfToday.getFullYear(), endOfToday.getMonth(), endOfToday.getDate() - 30);
  let to = opts.customTo ? parseISODate(opts.customTo) : endOfToday;
  if (to > endOfToday) to = endOfToday;
  if (from > to) return { from: to, to, grain: "day" };

  const spanDays = Math.round((to.getTime() - from.getTime()) / 86400000);
  const grain: AggregateGrain = spanDays > 120 ? "week" : spanDays > 45 ? "week" : "day";
  return { from, to, grain };
}

function aggregatePoints(
  commodityId: string,
  marketId: string,
  from: Date,
  to: Date,
  grain: AggregateGrain,
  grade: GradeFilter
): PricePoint[] {
  if (grain === "hour") {
    const hours = [6, 8, 10, 12, 14, 16, 18];
    return hours.map((h) => {
      const close = getHourlyPrice(commodityId, marketId, from, h, grade);
      const open = getHourlyPrice(commodityId, marketId, from, Math.max(6, h - 2), grade);
      const seed = hashString(`${commodityId}|${marketId}|${toISODate(from)}|h${h}|ohlc`);
      const high = Math.round(Math.max(open, close) * (1.01 + seededUnit(seed) * 0.02) * 100) / 100;
      const low = Math.round(Math.min(open, close) * (0.98 - seededUnit(seed + 1) * 0.015) * 100) / 100;
      const volume = Math.round(200 + seededUnit(seed + 3) * 900);
      return {
        date: `${toISODate(from)}T${pad(h)}:00`,
        label: `${h > 12 ? h - 12 : h}${h >= 12 ? "PM" : "AM"}`,
        price: close,
        open,
        high,
        low,
        close,
        volume,
      };
    });
  }

  const days = eachDay(from, to);

  if (grain === "day") {
    return days.map((d) => {
      const ohlc = getDailyOHLC(commodityId, marketId, d, grade);
      return {
        date: toISODate(d),
        label: d.toLocaleDateString("en-LK", { day: "numeric", month: "short" }),
        ...ohlc,
      };
    });
  }

  if (grain === "week") {
    const weeks: PricePoint[] = [];
    for (let i = 0; i < days.length; i += 7) {
      const slice = days.slice(i, i + 7);
      const prices = slice.map((d) => getDailyPrice(commodityId, marketId, d, grade));
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const start = slice[0];
      weeks.push({
        date: toISODate(start),
        label: `W${Math.ceil(start.getDate() / 7)} ${start.toLocaleDateString("en-LK", { month: "short" })}`,
        price: Math.round(avg * 100) / 100,
      });
    }
    return weeks;
  }

  // month
  const byMonth = new Map<string, number[]>();
  for (const d of days) {
    const key = `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
    const list = byMonth.get(key) ?? [];
    list.push(getDailyPrice(commodityId, marketId, d, grade));
    byMonth.set(key, list);
  }
  return [...byMonth.entries()].map(([key, prices]) => {
    const [y, m] = key.split("-").map(Number);
    const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
    const labelDate = new Date(y, m - 1, 1);
    return {
      date: `${key}-01`,
      label: labelDate.toLocaleDateString("en-LK", { month: "short", year: "2-digit" }),
      price: Math.round(avg * 100) / 100,
    };
  });
}

export function buildMarketSeries(
  commodityId: string,
  marketId: string,
  from: Date,
  to: Date,
  grain: AggregateGrain,
  grade: GradeFilter = "all",
  onlyDates?: Date[]
): MarketSeries {
  const meta = ANALYZE_MARKETS.find((m) => m.id === marketId);
  if (onlyDates?.length) {
    const points = onlyDates.map((d) => {
      const ohlc = getDailyOHLC(commodityId, marketId, d, grade);
      return {
        date: toISODate(d),
        label: d.toLocaleDateString("en-LK", { day: "numeric", month: "short" }),
        ...ohlc,
      };
    });
    return {
      marketId,
      marketName: meta?.shortName ?? marketId,
      points,
    };
  }
  return {
    marketId,
    marketName: meta?.shortName ?? marketId,
    points: aggregatePoints(commodityId, marketId, from, to, grain, grade),
  };
}

export function computeStats(points: PricePoint[]): SeriesStats {
  if (!points.length) {
    return { latest: 0, previous: 0, changeAbs: 0, changePct: 0, high: 0, low: 0, avg: 0, count: 0, volume: 0 };
  }
  const prices = points.map((p) => p.price);
  const latest = prices[prices.length - 1];
  const previous = prices.length > 1 ? prices[prices.length - 2] : latest;
  const changeAbs = latest - previous;
  const changePct = previous === 0 ? 0 : (changeAbs / previous) * 100;
  const highs = points.map((p) => p.high ?? p.price);
  const lows = points.map((p) => p.low ?? p.price);
  const high = Math.max(...highs);
  const low = Math.min(...lows);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const volume = points.reduce((a, p) => a + (p.volume ?? 0), 0);
  return {
    latest: Math.round(latest * 100) / 100,
    previous: Math.round(previous * 100) / 100,
    changeAbs: Math.round(changeAbs * 100) / 100,
    changePct: Math.round(changePct * 100) / 100,
    high: Math.round(high * 100) / 100,
    low: Math.round(low * 100) / 100,
    avg: Math.round(avg * 100) / 100,
    count: points.length,
    volume,
  };
}

export function availableYears(today = new Date()): number[] {
  const y = today.getFullYear();
  return [y, y - 1, y - 2];
}

export const MONTH_LABELS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export const TIMEFRAME_PRESETS: { id: TimeframePreset; label: string }[] = [
  { id: "1D", label: "1D" },
  { id: "7D", label: "7D" },
  { id: "1M", label: "1M" },
  { id: "3M", label: "3M" },
  { id: "1Y", label: "1Y" },
  { id: "YTD", label: "YTD" },
  { id: "CUSTOM", label: "Custom" },
];