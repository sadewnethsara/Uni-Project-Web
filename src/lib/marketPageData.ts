/** Daily market board data — simple prices per venue, no analytics jargon. */

import {
  ANALYZE_MARKETS,
  getDailyPrice,
  toISODate,
  parseISODate,
  formatDisplayDate,
  type GradeFilter,
} from "@/lib/analyticsData";

function hashString(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

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

function seededUnit(seed: number): number {
  const x = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

/** Some market × commodity × day combos intentionally have no recorded price. */
export function isPriceAvailable(
  marketId: string,
  commodityId: string,
  date: Date
): boolean {
  const seed = hashString(`${marketId}|${commodityId}|${toISODate(date)}|avail`);
  const u = seededUnit(seed);

  // Hill markets skip some low-country crops occasionally
  const hillMarkets = ["nuwara-eliya", "keppetipola", "thambuttegama"];
  const lowCountryOnly = ["brinjal", "cucumber", "pumpkin"];
  if (hillMarkets.includes(marketId) && lowCountryOnly.includes(commodityId) && u < 0.12) {
    return false;
  }

  // Manning rarely lists knol khol / beetroot
  if (marketId === "manning" && ["knol_khol", "beetroot"].includes(commodityId) && u < 0.35) {
    return false;
  }

  // Sundays: fewer listings
  if (date.getDay() === 0 && u < 0.18) return false;

  // Random gaps (~7%)
  if (u < 0.07) return false;

  return true;
}

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

export function getPriceForDay(
  marketId: string,
  commodityId: string,
  date: Date,
  grade: GradeFilter = "all"
): number | null {
  if (!isPriceAvailable(marketId, commodityId, date)) return null;
  return getDailyPrice(commodityId, marketId, date, grade);
}

function pctChange(current: number | null, prior: number | null): number | null {
  if (current == null || prior == null || prior === 0) return null;
  return Math.round(((current - prior) / prior) * 10000) / 100;
}

function trendFromChange(change: number | null): "up" | "down" | "stable" | "none" {
  if (change == null) return "none";
  if (change > 0.5) return "up";
  if (change < -0.5) return "down";
  return "stable";
}

export function getMarketBoard(
  marketId: string,
  viewDate: Date,
  grade: GradeFilter = "all"
): CommodityDayPrice[] {
  const prior = new Date(viewDate);
  prior.setDate(prior.getDate() - 1);

  return MARKET_COMMODITIES.map((c) => {
    const price = getPriceForDay(marketId, c.id, viewDate, grade);
    const priorPrice = getPriceForDay(marketId, c.id, prior, grade);
    const changeVsPrior = pctChange(price, priorPrice);
    return {
      commodityId: c.id,
      price,
      available: price != null,
      changeVsPrior,
      trend: trendFromChange(changeVsPrior),
    };
  });
}

export function getPriceComparison(
  marketId: string,
  commodityId: string,
  viewDate: Date,
  grade: GradeFilter = "all"
): PriceComparison {
  const yesterday = new Date(viewDate);
  yesterday.setDate(yesterday.getDate() - 1);

  const lastYear = new Date(viewDate);
  lastYear.setFullYear(lastYear.getFullYear() - 1);

  const selectedPrice = getPriceForDay(marketId, commodityId, viewDate, grade);
  const yesterdayPrice = getPriceForDay(marketId, commodityId, yesterday, grade);
  const lastYearPrice = getPriceForDay(marketId, commodityId, lastYear, grade);

  const selectedIso = toISODate(viewDate);
  const yesterdayIso = toISODate(yesterday);
  const lastYearIso = toISODate(lastYear);

  return {
    selected: {
      date: selectedIso,
      label: formatDisplayDate(selectedIso),
      price: selectedPrice,
      available: selectedPrice != null,
    },
    yesterday: {
      date: yesterdayIso,
      label: "Yesterday",
      price: yesterdayPrice,
      available: yesterdayPrice != null,
    },
    lastYear: {
      date: lastYearIso,
      label: "Same day last year",
      price: lastYearPrice,
      available: lastYearPrice != null,
    },
    changeVsYesterday: pctChange(selectedPrice, yesterdayPrice),
    changeVsLastYear: pctChange(selectedPrice, lastYearPrice),
  };
}

export function getRecentSparkline(
  marketId: string,
  commodityId: string,
  endDate: Date,
  days = 7,
  grade: GradeFilter = "all"
): SparkPoint[] {
  const out: SparkPoint[] = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const iso = toISODate(d);
    const price = getPriceForDay(marketId, commodityId, d, grade);
    out.push({
      date: iso,
      label: d.toLocaleDateString("en-LK", { weekday: "short", day: "numeric", month: "short" }),
      price,
    });
  }
  return out;
}

export function getMarketDisplayName(slug: string): string {
  const key = slug.toLowerCase();
  const meta = getMarketMeta(key);
  if (meta) return meta.shortName;
  if (key === "nuwara-eliya") return "Nuwara Eliya";
  if (!slug) return "Dambulla";
  return slug.charAt(0).toUpperCase() + slug.slice(1).toLowerCase();
}

export const MARKET_SLUGS = ANALYZE_MARKETS.map((m) => m.id);

export function formatRs(price: number | null): string {
  if (price == null) return "—";
  return `Rs. ${price.toFixed(2)}`;
}

export interface MarketPriceInfo {
  marketId: string;
  marketName: string;
  price: number;
}

export function getLowestPriceAcrossMarkets(
  commodityId: string,
  date: Date,
  grade: GradeFilter = "all"
): MarketPriceInfo | null {
  const prices: MarketPriceInfo[] = [];
  
  for (const market of ANALYZE_MARKETS) {
    const price = getPriceForDay(market.id, commodityId, date, grade);
    if (price != null) {
      prices.push({
        marketId: market.id,
        marketName: market.shortName,
        price,
      });
    }
  }
  
  if (prices.length === 0) return null;
  
  return prices.reduce((lowest, current) => 
    current.price < lowest.price ? current : lowest
  );
}

export function getHighestPriceAcrossMarkets(
  commodityId: string,
  date: Date,
  grade: GradeFilter = "all"
): MarketPriceInfo | null {
  const prices: MarketPriceInfo[] = [];
  
  for (const market of ANALYZE_MARKETS) {
    const price = getPriceForDay(market.id, commodityId, date, grade);
    if (price != null) {
      prices.push({
        marketId: market.id,
        marketName: market.shortName,
        price,
      });
    }
  }
  
  if (prices.length === 0) return null;
  
  return prices.reduce((highest, current) => 
    current.price > highest.price ? current : highest
  );
}

export interface WeeklyMarketPrice {
  date: string;
  label: string;
  lowest: MarketPriceInfo | null;
  highest: MarketPriceInfo | null;
  selectedMarket: { price: number | null; marketName: string } | null;
}

export function getWeeklyMarketPrices(
  commodityId: string,
  endDate: Date,
  selectedMarketId: string,
  selectedMarketName: string,
  days = 7,
  grade: GradeFilter = "all"
): WeeklyMarketPrice[] {
  const out: WeeklyMarketPrice[] = [];
  
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(endDate);
    d.setDate(d.getDate() - i);
    const iso = toISODate(d);
    
    const selectedPrice = getPriceForDay(selectedMarketId, commodityId, d, grade);
    
    out.push({
      date: iso,
      label: d.toLocaleDateString("en-LK", { weekday: "short", day: "numeric", month: "short" }),
      lowest: getLowestPriceAcrossMarkets(commodityId, d, grade),
      highest: getHighestPriceAcrossMarkets(commodityId, d, grade),
      selectedMarket: selectedPrice != null ? { price: selectedPrice, marketName: selectedMarketName } : null,
    });
  }
  
  return out;
}
