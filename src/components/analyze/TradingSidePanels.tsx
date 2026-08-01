"use client";

import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";
import { getMarketLabel } from "@/lib/analyticsData";
import type { DepthLevel, TapeTrade } from "@/lib/marketDepth";

export function DrawingToolbar({
  tool,
  onTool,
  onUndo,
  onClear,
  drawingCount,
}: {
  tool: string;
  onTool: (t: string) => void;
  onUndo: () => void;
  onClear: () => void;
  drawingCount: number;
}) {
  const tools = [
    { id: "cursor", label: "Cursor", icon: "✛" },
    { id: "trend", label: "Trend", icon: "/" },
    { id: "hline", label: "H-Line", icon: "—" },
    { id: "rect", label: "Rect", icon: "▭" },
    { id: "fib", label: "Fib", icon: "ƒ" },
    { id: "measure", label: "Measure", icon: "↔" },
  ];

  return (
    <div
      className={`flex flex-wrap items-center gap-1 px-2 py-1.5 ${PANEL_CLASS}`}
      style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}
    >
      {tools.map((t) => (
        <button
          key={t.id}
          type="button"
          title={t.label}
          onClick={() => onTool(t.id)}
          className="h-8 min-w-8 px-2 rounded-lg text-xs font-bold cursor-pointer transition-colors"
          style={{
            background: tool === t.id ? ANALYZE_THEME.ink : "transparent",
            color: tool === t.id ? ANALYZE_THEME.surfaceRaised : ANALYZE_THEME.inkMuted,
          }}
        >
          <span className="mr-1 opacity-80">{t.icon}</span>
          <span className="hidden sm:inline">{t.label}</span>
        </button>
      ))}
      <div className="w-px h-5 mx-1" style={{ background: ANALYZE_THEME.borderStrong }} />
      <button
        type="button"
        onClick={onUndo}
        disabled={drawingCount === 0}
        className="h-8 px-2.5 rounded-lg text-[11px] font-bold cursor-pointer disabled:opacity-40"
        style={{ color: ANALYZE_THEME.inkMuted }}
      >
        Undo
      </button>
      <button
        type="button"
        onClick={onClear}
        disabled={drawingCount === 0}
        className="h-8 px-2.5 rounded-lg text-[11px] font-bold cursor-pointer disabled:opacity-40"
        style={{ color: ANALYZE_THEME.down }}
      >
        Clear ({drawingCount})
      </button>
    </div>
  );
}

export function IndicatorToggles({
  flags,
  onChange,
}: {
  flags: Record<string, boolean>;
  onChange: (key: string, val: boolean) => void;
}) {
  const items = [
    { id: "ma7", label: "MA7", color: ANALYZE_THEME.ma7 },
    { id: "ma25", label: "MA25", color: ANALYZE_THEME.ma25 },
    { id: "ma99", label: "EMA99", color: ANALYZE_THEME.ma99 },
    { id: "bollinger", label: "BB", color: ANALYZE_THEME.bb },
    { id: "rsi", label: "RSI", color: ANALYZE_THEME.accent },
    { id: "volume", label: "Vol", color: ANALYZE_THEME.inkMuted },
  ];

  return (
    <div className="flex flex-wrap gap-1">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => onChange(item.id, !flags[item.id])}
          className="text-[10px] font-bold px-2.5 py-1.5 rounded-lg cursor-pointer border transition-colors"
          style={{
            background: flags[item.id] ? `${item.color}18` : ANALYZE_THEME.surfaceMuted,
            borderColor: flags[item.id] ? item.color : ANALYZE_THEME.border,
            color: flags[item.id] ? item.color : ANALYZE_THEME.inkMuted,
          }}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function OrderBookPanel({
  bids,
  asks,
  spread,
  mid,
}: {
  bids: DepthLevel[];
  asks: DepthLevel[];
  spread: number;
  mid: number;
}) {
  const maxTotal = Math.max(...bids.map((b) => b.total), ...asks.map((a) => a.total), 1);

  return (
    <div
      className={`${PANEL_CLASS} overflow-hidden flex flex-col h-full min-h-[320px]`}
      style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}
    >
      <div className="px-3 py-2.5 border-b flex items-center justify-between" style={{ borderColor: ANALYZE_THEME.border }}>
        <h3 className="text-[11px] font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.inkMuted }}>
          Order book
        </h3>
        <span className="text-[10px] font-bold tabular-nums" style={{ color: ANALYZE_THEME.inkFaint }}>
          Mid {mid.toFixed(2)}
        </span>
      </div>
      <div className="grid grid-cols-3 px-3 py-1.5 text-[9px] font-bold uppercase" style={{ color: ANALYZE_THEME.inkFaint }}>
        <span>Price</span>
        <span className="text-right">Qty</span>
        <span className="text-right">Total</span>
      </div>
      <div className="flex-1 overflow-y-auto px-1.5">
        {[...asks].reverse().map((a) => (
          <DepthRow key={`a-${a.price}`} level={a} side="ask" maxTotal={maxTotal} />
        ))}
        <div
          className="mx-1.5 my-1.5 rounded-lg px-2 py-1.5 flex items-center justify-between text-[11px] font-black"
          style={{ background: ANALYZE_THEME.surfaceMuted, color: ANALYZE_THEME.ink }}
        >
          <span>Spread</span>
          <span className="tabular-nums" style={{ color: ANALYZE_THEME.accentInk }}>
            {spread.toFixed(2)}
          </span>
        </div>
        {bids.map((b) => (
          <DepthRow key={`b-${b.price}`} level={b} side="bid" maxTotal={maxTotal} />
        ))}
      </div>
    </div>
  );
}

function DepthRow({
  level,
  side,
  maxTotal,
}: {
  level: DepthLevel;
  side: "bid" | "ask";
  maxTotal: number;
}) {
  const pct = (level.total / maxTotal) * 100;
  const color = side === "bid" ? ANALYZE_THEME.up : ANALYZE_THEME.down;
  return (
    <div className="relative grid grid-cols-3 px-1.5 py-0.5 text-[11px] font-semibold tabular-nums rounded-md overflow-hidden">
      <div
        className="absolute inset-y-0 right-0 opacity-15"
        style={{ width: `${pct}%`, background: color }}
      />
      <span style={{ color }} className="relative">
        {level.price.toFixed(2)}
      </span>
      <span className="text-right relative" style={{ color: ANALYZE_THEME.ink }}>
        {level.qty}
      </span>
      <span className="text-right relative" style={{ color: ANALYZE_THEME.inkMuted }}>
        {level.total}
      </span>
    </div>
  );
}

export function TradesTapePanel({ trades }: { trades: TapeTrade[] }) {
  return (
    <div
      className={`${PANEL_CLASS} overflow-hidden flex flex-col h-full min-h-[240px]`}
      style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}
    >
      <div className="px-3 py-2.5 border-b" style={{ borderColor: ANALYZE_THEME.border }}>
        <h3 className="text-[11px] font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.inkMuted }}>
          Market trades
        </h3>
      </div>
      <div className="grid grid-cols-3 px-3 py-1.5 text-[9px] font-bold uppercase" style={{ color: ANALYZE_THEME.inkFaint }}>
        <span>Time</span>
        <span className="text-right">Price</span>
        <span className="text-right">Qty</span>
      </div>
      <div className="flex-1 overflow-y-auto max-h-56">
        {trades.map((t) => (
          <div
            key={t.id}
            className="grid grid-cols-3 px-3 py-1 text-[11px] font-semibold tabular-nums hover:bg-black/[0.02]"
          >
            <span style={{ color: ANALYZE_THEME.inkFaint }}>{t.time}</span>
            <span className="text-right" style={{ color: t.side === "buy" ? ANALYZE_THEME.up : ANALYZE_THEME.down }}>
              {t.price.toFixed(2)}
            </span>
            <span className="text-right" style={{ color: ANALYZE_THEME.inkMuted }}>
              {t.qty}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function WatchlistPanel({
  items,
  activeId,
  onSelect,
}: {
  items: { marketId: string; price: number; change: number }[];
  activeId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      className={`${PANEL_CLASS} overflow-hidden`}
      style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}
    >
      <div className="px-3 py-2.5 border-b" style={{ borderColor: ANALYZE_THEME.border }}>
        <h3 className="text-[11px] font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.inkMuted }}>
          Watchlist
        </h3>
      </div>
      <div className="divide-y" style={{ borderColor: ANALYZE_THEME.border }}>
        {items.map((item) => {
          const active = item.marketId === activeId;
          return (
            <button
              key={item.marketId}
              type="button"
              onClick={() => onSelect(item.marketId)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left cursor-pointer transition-colors"
              style={{
                background: active ? ANALYZE_THEME.surfaceMuted : "transparent",
              }}
            >
              <span className="text-xs font-bold" style={{ color: ANALYZE_THEME.ink }}>
                {getMarketLabel(item.marketId)}
              </span>
              <div className="text-right">
                <div className="text-xs font-black tabular-nums" style={{ color: ANALYZE_THEME.ink }}>
                  {item.price.toFixed(2)}
                </div>
                <div
                  className="text-[10px] font-bold tabular-nums"
                  style={{ color: item.change >= 0 ? ANALYZE_THEME.up : ANALYZE_THEME.down }}
                >
                  {item.change >= 0 ? "+" : ""}
                  {item.change}%
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
