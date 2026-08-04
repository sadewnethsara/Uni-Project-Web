/** Parse natural-language analytics prompts into dashboard filters (demo AI). */

import {
  ANALYZE_MARKETS,
  toISODate,
  type ChartStyle,
  type GradeFilter,
  type TimeframePreset,
} from "@/lib/analyticsData";
import { SIDEBAR_ITEMS } from "@/app/(main)/markets/marketData";

export interface ParsedAnalyzeIntent {
  commodities?: string[];
  markets?: string[];
  timeframe?: TimeframePreset;
  calendarMode?: "range" | "multi";
  customFrom?: string;
  customTo?: string;
  selectedDates?: string[];
  gradeFilter?: GradeFilter;
  chartStyle?: ChartStyle;
  summary: string;
  /** Follow-up questions the assistant can ask */
  followUps: string[];
  understood: boolean;
}

const COMMODITY_ALIASES: Record<string, string[]> = {
  carrot: ["carrot", "carrots"],
  beans: ["bean", "beans", "green bean", "green beans"],
  leeks: ["leek", "leeks"],
  cabbage: ["cabbage", "cabbages"],
  potato: ["potato", "potatoes"],
  tomato: ["tomato", "tomatoes"],
  brinjal: ["brinjal", "eggplant", "aubergine"],
  chilli: ["chilli", "chili", "green chilli", "miris"],
  cucumber: ["cucumber", "cucumbers"],
  pumpkin: ["pumpkin", "wattakka"],
  onion: ["onion", "onions"],
  capsicum: ["capsicum", "bell pepper", "pepper"],
  beetroot: ["beetroot", "beet"],
  knol_khol: ["knol khol", "kohlrabi", "kohlila"],
};

const MARKET_ALIASES: Record<string, string[]> = Object.fromEntries(
  ANALYZE_MARKETS.map((m) => {
    const aliases = [
      m.id,
      m.shortName.toLowerCase(),
      m.id.replace(/-/g, " "),
      m.shortName.toLowerCase().replace(/ /g, ""),
    ];
    if (m.id === "keppetipola") aliases.push("kappetipola", "keppeti pola", "keppetipola");
    if (m.id === "nuwara-eliya") aliases.push("nuwara eliya", "nuwaraeliya");
    if (m.id === "manning") aliases.push("colombo", "manning market");
    return [m.id, aliases];
  })
);

function yesterdayISO(today = new Date()): string {
  const d = new Date(today);
  d.setDate(d.getDate() - 1);
  return toISODate(d);
}

function findAll(haystack: string, map: Record<string, string[]>): string[] {
  const found: string[] = [];
  for (const [id, aliases] of Object.entries(map)) {
    for (const a of aliases) {
      const re = new RegExp(`\\b${a.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i");
      if (re.test(haystack) && !found.includes(id)) {
        found.push(id);
        break;
      }
    }
  }
  return found;
}

export function parseAnalyzePrompt(raw: string, today = new Date()): ParsedAnalyzeIntent {
  const text = raw.trim().toLowerCase();
  if (!text) {
    return {
      summary: "Tell me what to analyse — for example: “yesterday Dambulla and Keppetipola beans trend”.",
      followUps: [
        "Compare carrot across Dambulla and Nuwara Eliya last 7 days",
        "Show beans candle chart for 1 month",
        "What markets should I watch today?",
      ],
      understood: false,
    };
  }

  const commodities = findAll(text, COMMODITY_ALIASES);
  const markets = findAll(text, MARKET_ALIASES);

  let timeframe: TimeframePreset | undefined;
  let calendarMode: "range" | "multi" | undefined;
  let customFrom: string | undefined;
  let customTo: string | undefined;
  let selectedDates: string[] | undefined;

  const yISO = yesterdayISO(today);

  if (/\byesterday\b/.test(text)) {
    timeframe = "CUSTOM";
    calendarMode = "multi";
    selectedDates = [yISO];
    customFrom = yISO;
    customTo = yISO;
  } else if (/\btoday\b|\bintraday\b|\b1d\b|\bone day\b/.test(text)) {
    timeframe = "1D";
  } else if (/\blast\s*7\s*days?\b|\bweek\b|\b7d\b/.test(text)) {
    timeframe = "7D";
  } else if (/\blast\s*30\s*days?\b|\b1\s*month\b|\b1m\b|\bmonth\b/.test(text)) {
    timeframe = "1M";
  } else if (/\b3\s*months?\b|\b3m\b|\bquarter\b/.test(text)) {
    timeframe = "3M";
  } else if (/\byear\b|\b1y\b|\b12\s*months?\b/.test(text)) {
    timeframe = "1Y";
  } else if (/\bytd\b|\byear to date\b/.test(text)) {
    timeframe = "YTD";
  }

  let gradeFilter: GradeFilter | undefined;
  if (/\bpremium\b|\bgrade\s*a\b/.test(text)) gradeFilter = "premium";
  else if (/\bstandard\b|\bgrade\s*b\b/.test(text)) gradeFilter = "standard";

  let chartStyle: ChartStyle | undefined;
  if (/\bcandle/.test(text) || /\bohlc\b/.test(text)) chartStyle = "candle";
  else if (/\barea\b/.test(text)) chartStyle = "area";
  else if (/\bline\b/.test(text)) chartStyle = "line";

  const parts: string[] = [];
  if (commodities.length) {
    const names = commodities.map((id) => SIDEBAR_ITEMS.find((s) => s.id === id)?.name ?? id);
    parts.push(names.join(" + "));
  }
  if (markets.length) {
    const names = markets.map((id) => ANALYZE_MARKETS.find((m) => m.id === id)?.shortName ?? id);
    parts.push(`at ${names.join(" & ")}`);
  }
  if (/\byesterday\b/.test(text)) parts.push("for yesterday");
  else if (timeframe) parts.push(`over ${timeframe}`);

  const understood = commodities.length > 0 || markets.length > 0 || Boolean(timeframe) || Boolean(gradeFilter);

  const summary = understood
    ? `Updated the dashboard: ${parts.join(" ") || "adjusted filters"}.`
    : "I can set vegetables, markets, and dates. Try: “analyse yesterday Dambulla and Keppetipola beans trend”.";

  const followUps: string[] = [];
  if (!commodities.length) followUps.push("Which vegetable — carrot, beans, tomato…?");
  if (!markets.length) followUps.push("Which markets — Dambulla, Keppetipola, Manning…?");
  if (!timeframe && !/\byesterday\b/.test(text)) followUps.push("What period — today, 7D, 1M, or a custom range?");
  if (followUps.length === 0) {
    followUps.push("Add RSI and Bollinger bands?");
    followUps.push("Compare with another vegetable?");
    followUps.push("Switch to candle or line chart?");
  }

  return {
    commodities: commodities.length ? commodities : undefined,
    markets: markets.length ? markets : undefined,
    timeframe,
    calendarMode,
    customFrom,
    customTo,
    selectedDates,
    gradeFilter,
    chartStyle,
    summary,
    followUps: followUps.slice(0, 3),
    understood,
  };
}

export const ANALYZE_CHAT_STARTERS = [
  "Analyse yesterday Dambulla and Keppetipola beans trend",
  "Compare carrot across Dambulla, Manning and Nuwara Eliya last 7 days",
  "Show tomato candle chart for 1 month with premium grade",
  "What is the beans price today in Dambulla?",
];
