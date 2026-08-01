/** Deterministic demo order book + trade tape for analytics terminal */

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function unit(seed: number) {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  return x - Math.floor(x);
}

export interface DepthLevel {
  price: number;
  qty: number;
  total: number;
}

export interface TapeTrade {
  id: string;
  time: string;
  price: number;
  qty: number;
  side: "buy" | "sell";
}

export function buildOrderBook(
  mid: number,
  commodityId: string,
  marketId: string,
  levels = 12
): { bids: DepthLevel[]; asks: DepthLevel[]; spread: number; mid: number } {
  const seed = hash(`${commodityId}|${marketId}|book`);
  const tick = Math.max(0.5, Math.round(mid * 0.002 * 2) / 2);
  const bids: DepthLevel[] = [];
  const asks: DepthLevel[] = [];
  let bidTotal = 0;
  let askTotal = 0;

  for (let i = 0; i < levels; i++) {
    const bq = Math.round(40 + unit(seed + i * 3) * 320 + (levels - i) * 8);
    const aq = Math.round(35 + unit(seed + i * 5 + 9) * 300 + (levels - i) * 7);
    bidTotal += bq;
    askTotal += aq;
    bids.push({
      price: Math.round((mid - tick * (i + 1)) * 100) / 100,
      qty: bq,
      total: bidTotal,
    });
    asks.push({
      price: Math.round((mid + tick * (i + 1)) * 100) / 100,
      qty: aq,
      total: askTotal,
    });
  }

  const spread = Math.round((asks[0].price - bids[0].price) * 100) / 100;
  return { bids, asks, spread, mid };
}

export function buildTradeTape(
  mid: number,
  commodityId: string,
  marketId: string,
  count = 28
): TapeTrade[] {
  const seed = hash(`${commodityId}|${marketId}|tape`);
  const trades: TapeTrade[] = [];
  let price = mid;

  for (let i = 0; i < count; i++) {
    const side: "buy" | "sell" = unit(seed + i * 7) > 0.48 ? "buy" : "sell";
    const delta = (unit(seed + i * 11) - 0.5) * mid * 0.012;
    price = Math.round((price + delta) * 100) / 100;
    // Deterministic clock (avoids SSR/client hydration mismatch)
    const totalSec = Math.floor(unit(seed + i * 17) * 86400);
    const hh = String(Math.floor(totalSec / 3600) % 24).padStart(2, "0");
    const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
    const ss = String(totalSec % 60).padStart(2, "0");
    trades.push({
      id: `${marketId}-${i}`,
      time: `${hh}:${mm}:${ss}`,
      price,
      qty: Math.round(5 + unit(seed + i * 13) * 95),
      side,
    });
  }
  return trades;
}

export function buildWatchlistQuotes(
  commodityId: string,
  basePrices: Record<string, number>
): { marketId: string; price: number; change: number }[] {
  return Object.entries(basePrices).map(([marketId, price], i) => {
    const seed = hash(`${commodityId}|${marketId}|wl`);
    const change = Math.round(((unit(seed) - 0.45) * 8) * 100) / 100;
    return { marketId, price, change };
  });
}
