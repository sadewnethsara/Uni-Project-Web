/** Daily market board data — simple prices per venue, no analytics jargon. */

import {
  ANALYZE_MARKETS,
  parseISODate,
} from "@/lib/analyticsData";

export type DatePreset = "today" | "yesterday" | "custom";

export interface MarketCommodity {
  id: string;
  name: string;
  nameSi?: string;
  category: "leafy" | "root" | "fruit-veg" | "legume";
  image: string;
  description: string;
}

export interface CommodityDayPrice {
  commodityId: string;
  price: number | null;
  available: boolean;
  changeVsPrior: number | null;
  trend: "up" | "down" | "stable" | "none";
}

export interface PriceComparison {
  selected: { date: string; label: string; price: number | null; available: boolean };
  yesterday: { date: string; label: string; price: number | null; available: boolean };
  lastYear: { date: string; label: string; price: number | null; available: boolean };
  changeVsYesterday: number | null;
  changeVsLastYear: number | null;
}

export interface SparkPoint {
  date: string;
  label: string;
  price: number | null;
}

export interface MarketPriceInfo {
  marketId?: string;
  marketName?: string;
  price: number | null;
  available?: boolean;
}

export interface WeeklyMarketPrice {
  date: string;
  label: string;
  lowest?: MarketPriceInfo | null;
  highest?: MarketPriceInfo | null;
  average?: number | null;
  selectedMarket?: MarketPriceInfo | null;
  marketCount?: number;
}
export const MARKET_COMMODITIES: MarketCommodity[] = [
  {
    id: "carrot",
    name: "Carrot",
    nameSi: "කැරට්",
    category: "root",
    image: "/icons/carrot/carrot.svg",
    description: "Upcountry carrots — most active in morning wholesale sessions.",
  },
  {
    id: "beans",
    name: "Beans",
    nameSi: "බෝංචි",
    category: "legume",
    image: "/icons/broad-bean/broad-bean.svg",
    description: "Green long beans — popular across Dambulla and Keppetipola.",
  },
  {
    id: "leeks",
    name: "Leeks",
    nameSi: "ලීක්ස්",
    category: "leafy",
    image: "/icons/leek/leek.svg",
    description: "Fresh bundles from central province farms.",
  },
  {
    id: "cabbage",
    name: "Cabbage",
    nameSi: "ගොවා",
    category: "leafy",
    image: "/icons/green-cabbage/green-cabbage.svg",
    description: "Green flatheads — steady household demand.",
  },
  {
    id: "potato",
    name: "Potato",
    nameSi: "අල",
    category: "root",
    image: "/icons/russet-potato/russet-potato.svg",
    description: "Local Welimada selection — stable baseline crop.",
  },
  {
    id: "tomato",
    name: "Tomato",
    nameSi: "තක්කාලි",
    category: "fruit-veg",
    image: "/icons/tomato/tomato.svg",
    description: "Red cluster tomatoes — weather-sensitive pricing.",
  },
  {
    id: "brinjal",
    name: "Brinjal",
    nameSi: "වම්බටු",
    category: "fruit-veg",
    image: "/icons/eggplant/eggplant.svg",
    description: "Purple long brinjal from low-country harvests.",
  },
  {
    id: "chilli",
    name: "Green Chilli",
    nameSi: "අමු මිරිස්",
    category: "fruit-veg",
    image: "/icons/green-birds-eye-chili/green-birds-eye-chili.svg",
    description: "Fresh green chilli — high turnover at urban markets.",
  },
  {
    id: "cucumber",
    name: "Cucumber",
    nameSi: "පිපිංචා",
    category: "fruit-veg",
    image: "/icons/cucumber/cucumber.svg",
    description: "Salad cucumbers — summer peak supply.",
  },
  {
    id: "pumpkin",
    name: "Pumpkin",
    nameSi: "වට්ටක්කා",
    category: "fruit-veg",
    image: "/icons/pumpkin/pumpkin.svg",
    description: "Large wholesale lots — seasonal availability.",
  },
  {
    id: "onion",
    name: "Onion",
    nameSi: "ලූණු",
    category: "root",
    image: "/icons/yellow-onion/yellow-onion.svg",
    description: "Big onion — import and local mix at Manning.",
  },
  {
    id: "capsicum",
    name: "Capsicum",
    nameSi: "මාළු මිරිස්",
    category: "fruit-veg",
    image: "/icons/green-bell-pepper/green-bell-pepper.svg",
    description: "Bell peppers — premium grade at Colombo hubs.",
  },
  {
    id: "beetroot",
    name: "Beetroot",
    nameSi: "බීට්",
    category: "root",
    image: "/icons/beet/beet.svg",
    description: "Upcountry beetroot — niche wholesale demand.",
  },
  {
    id: "knol_khol",
    name: "Knol Khol",
    nameSi: "කෝල් රබි",
    category: "leafy",
    image: "/icons/kohlrabi/kohlrabi.svg",
    description: "Kohlrabi — common in hill-country morning lots.",
  },
];

/** Re-export for parseAnalyzePrompt compatibility */
export const COMMODITY_LOOKUP_ALIASES: Record<string, string> = {
  "brinjals": "brinjal",
  "green-chillies": "chilli",
  "green-chilli": "chilli",
  "beet-root": "beetroot",
  "cabbage--kandy-": "cabbage",
  "knolkhol": "knol_khol",
  "potato--imported-": "potato",
  "potato--nuwaraeliya-": "potato",
  "potato-imported-": "potato",
  "ladies-fingers": "okra",
  "imported": "onion",
  "vedalan": "onion",
  "sinnan": "onion",
  "b-onion-imported": "onion",
  "b-onion-imported-": "onion"
};

export function getCommodityById(id: string): MarketCommodity | undefined {
  const targetId = COMMODITY_LOOKUP_ALIASES[id] || id;
  return MARKET_COMMODITIES.find((c) => c.id === targetId || c.id === id);
}

export function getMarketMeta(marketId: string) {
  return ANALYZE_MARKETS.find((m) => m.id === marketId);
}

export function resolveViewDate(preset: DatePreset, customIso: string, today = new Date()): Date {
  const base = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  if (preset === "yesterday") {
    base.setDate(base.getDate() - 1);
    return base;
  }
  if (preset === "custom" && customIso) {
    const d = parseISODate(customIso);
    return d > base ? base : d;
  }
  return base;
}

export const MARKET_SLUGS = ANALYZE_MARKETS.map((m) => m.id);

export function getMarketDisplayName(marketId: string): string {
  return ANALYZE_MARKETS.find((m) => m.id === marketId)?.name ?? marketId;
}

export function formatRs(amount: number | null): string {
  if (amount == null) return "Rs. —";
  return "Rs. " + amount.toLocaleString("en-LK", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}
