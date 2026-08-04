/** Daily market board data — simple prices per venue, no analytics jargon. */

import {
  ANALYZE_MARKETS,
  toISODate,
  parseISODate,
  formatDisplayDate,
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
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&auto=format&fit=crop&q=60",
    description: "Upcountry carrots — most active in morning wholesale sessions.",
  },
  {
    id: "beans",
    name: "Beans",
    nameSi: "බෝංචි",
    category: "legume",
    image: "https://images.unsplash.com/photo-1567375698348-5d9d5ae99de0?w=200&auto=format&fit=crop&q=60",
    description: "Green long beans — popular across Dambulla and Keppetipola.",
  },
  {
    id: "leeks",
    name: "Leeks",
    nameSi: "ලීක්ස්",
    category: "leafy",
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=200&auto=format&fit=crop&q=60",
    description: "Fresh bundles from central province farms.",
  },
  {
    id: "cabbage",
    name: "Cabbage",
    nameSi: "ගוב්බජ්",
    category: "leafy",
    image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=200&auto=format&fit=crop&q=60",
    description: "Green flatheads — steady household demand.",
  },
  {
    id: "potato",
    name: "Potato",
    nameSi: "අල",
    category: "root",
    image: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=200&auto=format&fit=crop&q=60",
    description: "Local Welimada selection — stable baseline crop.",
  },
  {
    id: "tomato",
    name: "Tomato",
    nameSi: "තakkali",
    category: "fruit-veg",
    image: "https://images.unsplash.com/photo-1595855759920-86582396756a?w=200&auto=format&fit=crop&q=60",
    description: "Red cluster tomatoes — weather-sensitive pricing.",
  },
  {
    id: "brinjal",
    name: "Brinjal",
    nameSi: "Wambatu",
    category: "fruit-veg",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=200&auto=format&fit=crop&q=60",
    description: "Purple long brinjal from low-country harvests.",
  },
  {
    id: "chilli",
    name: "Green Chilli",
    nameSi: "අමු මිරිස්",
    category: "fruit-veg",
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&auto=format&fit=crop&q=60",
    description: "Fresh green chilli — high turnover at urban markets.",
  },
  {
    id: "cucumber",
    name: "Cucumber",
    nameSi: "පිපිංච",
    category: "fruit-veg",
    image: "https://images.unsplash.com/photo-1449307220698-aa088fc7b993?w=200&auto=format&fit=crop&q=60",
    description: "Salad cucumbers — summer peak supply.",
  },
  {
    id: "pumpkin",
    name: "Pumpkin",
    nameSi: "Wattakka",
    category: "fruit-veg",
    image: "https://images.unsplash.com/photo-1570586437263-ab629fccc818?w=200&auto=format&fit=crop&q=60",
    description: "Large wholesale lots — seasonal availability.",
  },
  {
    id: "onion",
    name: "Onion",
    nameSi: "Lunu",
    category: "root",
    image: "https://images.unsplash.com/photo-1518977956812-cd3beadaaf57?w=200&auto=format&fit=crop&q=60",
    description: "Big onion — import and local mix at Manning.",
  },
  {
    id: "capsicum",
    name: "Capsicum",
    nameSi: "Maalu Miris",
    category: "fruit-veg",
    image: "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?w=200&auto=format&fit=crop&q=60",
    description: "Bell peppers — premium grade at Colombo hubs.",
  },
  {
    id: "beetroot",
    name: "Beetroot",
    nameSi: "Bit",
    category: "root",
    image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=200&auto=format&fit=crop&q=60",
    description: "Upcountry beetroot — niche wholesale demand.",
  },
  {
    id: "knol_khol",
    name: "Knol Khol",
    nameSi: "Kohlila",
    category: "leafy",
    image: "https://images.unsplash.com/photo-1540420773420-3366772f4999?w=200&auto=format&fit=crop&q=60",
    description: "Kohlrabi — common in hill-country morning lots.",
  },
];

/** Re-export for parseAnalyzePrompt compatibility */
export const SIDEBAR_COMMODITY_IDS = MARKET_COMMODITIES.map((c) => c.id);

export function getCommodityById(id: string): MarketCommodity | undefined {
  return MARKET_COMMODITIES.find((c) => c.id === id);
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
