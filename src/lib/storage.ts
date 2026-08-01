import { DEMO_PRICES, CATEGORIES, ITEMS, MARKETS, ADMINS } from "./demo-data";
import type { PriceEntry, Category, Item, MarketCenter, Admin } from "./types";

const STORAGE_KEY_PRICES = "lanka-market-prices";
const STORAGE_KEY_CATEGORIES = "lanka-market-categories";
const STORAGE_KEY_ITEMS = "lanka-market-items";
const STORAGE_KEY_MARKETS = "lanka-market-centers";
const STORAGE_KEY_ADMINS = "lanka-market-admins";

export function loadPrices(): PriceEntry[] {
  if (typeof window === "undefined") return DEMO_PRICES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PRICES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_PRICES, JSON.stringify(DEMO_PRICES));
      return DEMO_PRICES;
    }
    return JSON.parse(raw) as PriceEntry[];
  } catch {
    return DEMO_PRICES;
  }
}

export function savePrices(prices: PriceEntry[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_PRICES, JSON.stringify(prices));
}

export function loadCategories(): Category[] {
  if (typeof window === "undefined") return CATEGORIES;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CATEGORIES);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(CATEGORIES));
      return CATEGORIES;
    }
    return JSON.parse(raw) as Category[];
  } catch {
    return CATEGORIES;
  }
}

export function saveCategories(categories: Category[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_CATEGORIES, JSON.stringify(categories));
}

export function loadItems(): Item[] {
  if (typeof window === "undefined") return ITEMS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ITEMS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(ITEMS));
      return ITEMS;
    }
    return JSON.parse(raw) as Item[];
  } catch {
    return ITEMS;
  }
}

export function saveItems(items: Item[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_ITEMS, JSON.stringify(items));
}

export function loadMarkets(): MarketCenter[] {
  if (typeof window === "undefined") return MARKETS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MARKETS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_MARKETS, JSON.stringify(MARKETS));
      return MARKETS;
    }
    return JSON.parse(raw) as MarketCenter[];
  } catch {
    return MARKETS;
  }
}

export function saveMarkets(markets: MarketCenter[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_MARKETS, JSON.stringify(markets));
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function loadAdmins(): Admin[] {
  if (typeof window === "undefined") return ADMINS;
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ADMINS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(ADMINS));
      return ADMINS;
    }
    return JSON.parse(raw) as Admin[];
  } catch {
    return ADMINS;
  }
}

export function saveAdmins(admins: Admin[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY_ADMINS, JSON.stringify(admins));
}

export function findAdminByEmail(email: string): Admin | null {
  const admins = loadAdmins();
  return admins.find(admin => admin.email === email && admin.isActive) || null;
}
