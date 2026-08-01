"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import type { PricePoint } from "@/lib/analyticsData";
import { getSeriesColor } from "@/lib/analyticsData";
import { bollinger, ema, rsi, sma, type IndicatorFlags } from "@/lib/chartIndicators";
import { ANALYZE_THEME } from "@/lib/chartTheme";

export type DrawTool = "cursor" | "trend" | "hline" | "rect" | "fib" | "measure";

export type ChartDrawing =
  | { id: string; type: "trend"; x1: number; y1: number; x2: number; y2: number }
  | { id: string; type: "hline"; price: number }
  | { id: string; type: "rect"; x1: number; y1: number; x2: number; y2: number }
  | { id: string; type: "fib"; x1: number; y1: number; x2: number; y2: number }
  | { id: string; type: "measure"; x1: number; y1: number; x2: number; y2: number };

interface SeriesView {
  marketId: string;
  marketName: string;
  points: PricePoint[];
}

interface AdvancedChartProps {
  seriesList: SeriesView[];
  chartStyle: "line" | "candle" | "area" | "scatter" | "histogram" | "bar" | "column";
  indicators: IndicatorFlags;
  drawTool: DrawTool;
  drawings: ChartDrawing[];
  onDrawingsChange: (next: ChartDrawing[]) => void;
}

const FIB_LEVELS = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1];

function uid() {
  return `d-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

export default function AdvancedChart({
  seriesList,
  chartStyle,
  indicators,
  drawTool,
  drawings,
  onDrawingsChange,
}: AdvancedChartProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);
  const [draft, setDraft] = useState<{
    type: DrawTool;
    x1: number;
    y1: number;
    x2: number;
    y2: number;
  } | null>(null);

  const primary = seriesList[0];
  const closes = useMemo(() => primary?.points.map((p) => p.price) ?? [], [primary]);

  const ma7 = useMemo(() => (indicators.ma7 ? sma(closes, 7) : []), [closes, indicators.ma7]);
  const ma25 = useMemo(() => (indicators.ma25 ? sma(closes, 25) : []), [closes, indicators.ma25]);
  const ma99 = useMemo(() => (indicators.ma99 ? ema(closes, 99) : []), [closes, indicators.ma99]);
  const bb = useMemo(
    () => (indicators.bollinger ? bollinger(closes, Math.min(20, Math.max(5, closes.length))) : null),
    [closes, indicators.bollinger]
  );
  const rsiVals = useMemo(() => (indicators.rsi ? rsi(closes, 14) : []), [closes, indicators.rsi]);

  const chartW = 760;
  const showRsi = indicators.rsi;
  const showVol = indicators.volume;
  const priceH = showRsi ? 260 : 300;
  const volH = showVol ? 56 : 0;
  const rsiH = showRsi ? 72 : 0;
  const gap = 10;
  const chartH = priceH + (showVol ? gap + volH : 0) + (showRsi ? gap + rsiH : 0);
  const padL = 12;
  const padR = 54;
  const padT = 18;
  const padB = 22;
  const plotW = chartW - padL - padR;
  const plotH = priceH - padT - padB;

  const indicatorPrices = [
    ...closes,
    ...ma7.filter((v): v is number => v != null),
    ...ma25.filter((v): v is number => v != null),
    ...ma99.filter((v): v is number => v != null),
    ...(bb?.upper.filter((v): v is number => v != null) ?? []),
    ...(bb?.lower.filter((v): v is number => v != null) ?? []),
    ...seriesList.flatMap((s) => s.points.flatMap((p) => [p.high ?? p.price, p.low ?? p.price])),
  ];

  const maxVal = (indicatorPrices.length ? Math.max(...indicatorPrices) : 100) * 1.03;
  const minVal = (indicatorPrices.length ? Math.min(...indicatorPrices) : 0) * 0.97;
  const range = maxVal - minVal || 1;

  const labels = primary?.points.map((p) => p.label) ?? [];
  const pointCount = labels.length;
  const volumes = primary?.points.map((p) => p.volume ?? 0) ?? [];
  const maxVol = Math.max(...volumes, 1);

  const priceY = useCallback((price: number) => padT + plotH - ((price - minVal) / range) * plotH, [padT, plotH, minVal, range]);
  const xAt = useCallback(
    (idx: number, n = Math.max(pointCount - 1, 1)) => padL + (idx / n) * plotW,
    [padL, plotW, pointCount]
  );

  const priceFromY = useCallback(
    (y: number) => minVal + ((padT + plotH - y) / plotH) * range,
    [minVal, padT, plotH, range]
  );

  const idxFromX = useCallback(
    (x: number) => {
      const n = Math.max(pointCount - 1, 1);
      return Math.max(0, Math.min(n, Math.round(((x - padL) / plotW) * n)));
    },
    [padL, plotW, pointCount]
  );

  const clientToSvg = (clientX: number, clientY: number) => {
    const svg = svgRef.current;
    if (!svg) return { x: 0, y: 0 };
    const pt = svg.createSVGPoint();
    pt.x = clientX;
    pt.y = clientY;
    const ctm = svg.getScreenCTM();
    if (!ctm) return { x: 0, y: 0 };
    const sp = pt.matrixTransform(ctm.inverse());
    return { x: sp.x, y: sp.y };
  };

  const buildPath = (vals: (number | null)[]) => {
    let d = "";
    let started = false;
    vals.forEach((v, idx) => {
      if (v == null) {
        started = false;
        return;
      }
      const cmd = started ? "L" : "M";
      d += `${cmd}${xAt(idx)},${priceY(v)} `;
      started = true;
    });
    return d.trim();
  };

  const buildArea = (prices: number[]) => {
    if (!prices.length) return "";
    const line = prices
      .map((p, idx) => `${idx === 0 ? "M" : "L"}${xAt(idx)},${priceY(p)}`)
      .join(" ");
    return `${line} L${xAt(prices.length - 1)},${padT + plotH} L${xAt(0)},${padT + plotH} Z`;
  };

  const yTicks = [0, 0.25, 0.5, 0.75, 1].map((t) => ({
    value: minVal + range * (1 - t),
    y: padT + t * plotH,
  }));
  const labelStep = Math.max(1, Math.ceil(labels.length / 8));
  const candleW = Math.max(3, Math.min(12, (plotW / Math.max(pointCount, 1)) * 0.55));

  const hoverPoint = hoverIndex != null ? primary?.points[hoverIndex] : null;
  const hoverUp = hoverPoint
    ? (hoverPoint.close ?? hoverPoint.price) >= (hoverPoint.open ?? hoverPoint.price)
    : true;

  const onPointerDown = (e: React.PointerEvent) => {
    if (drawTool === "cursor" || !primary) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = clientToSvg(e.clientX, e.clientY);
    if (y > priceH - 4) return;
    const price = priceFromY(y);
    const xi = idxFromX(x);
    if (drawTool === "hline") {
      onDrawingsChange([...drawings, { id: uid(), type: "hline", price }]);
      return;
    }
    setDraft({ type: drawTool, x1: xi, y1: price, x2: xi, y2: price });
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const { x, y } = clientToSvg(e.clientX, e.clientY);
    if (y <= priceH) setHoverIndex(idxFromX(x));
    if (!draft) return;
    const price = priceFromY(Math.min(y, priceH - padB));
    setDraft({ ...draft, x2: idxFromX(x), y2: price });
  };

  const onPointerUp = () => {
    if (!draft) return;
    if (draft.type === "trend" || draft.type === "measure") {
      onDrawingsChange([
        ...drawings,
        { id: uid(), type: draft.type, x1: draft.x1, y1: draft.y1, x2: draft.x2, y2: draft.y2 },
      ]);
    } else if (draft.type === "rect" || draft.type === "fib") {
      onDrawingsChange([
        ...drawings,
        { id: uid(), type: draft.type, x1: draft.x1, y1: draft.y1, x2: draft.x2, y2: draft.y2 },
      ]);
    }
    setDraft(null);
  };

  const renderDrawing = (
    d: ChartDrawing | { type: DrawTool; x1: number; y1: number; x2: number; y2: number; price?: number },
    key: string,
    dashed = false
  ) => {
    if (!d || d.type === "cursor") return null;
    const stroke = d.type === "fib" ? ANALYZE_THEME.fib : ANALYZE_THEME.draw;
    if (d.type === "hline") {
      const anyD = d as { price?: number; y1?: number };
      const hPrice = typeof anyD.price === "number" ? anyD.price : typeof anyD.y1 === "number" ? anyD.y1 : 0;
      const y = priceY(hPrice);
      return (
        <g key={key}>
          <line x1={padL} y1={y} x2={chartW - padR} y2={y} stroke={stroke} strokeWidth={1.2} strokeDasharray={dashed ? "4 3" : "6 4"} />
          <text x={chartW - padR + 4} y={y + 3} style={{ fontSize: 8, fontWeight: 700, fill: stroke }}>
            {hPrice.toFixed(1)}
          </text>
        </g>
      );
    }
    if (!("x1" in d) || typeof d.x1 !== "number") return null;
    const dx = d as { type: string; x1: number; y1: number; x2: number; y2: number };
    const x1 = xAt(dx.x1);
    const x2 = xAt(dx.x2);
    const y1 = priceY(dx.y1);
    const y2 = priceY(dx.y2);

    if (dx.type === "trend" || dx.type === "measure") {
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;
      const delta = dx.y2 - dx.y1;
      const pct = dx.y1 ? (delta / dx.y1) * 100 : 0;
      return (
        <g key={key}>
          <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={1.6} strokeDasharray={dashed ? "4 3" : undefined} />
          <circle cx={x1} cy={y1} r={3} fill={stroke} />
          <circle cx={x2} cy={y2} r={3} fill={stroke} />
          {dx.type === "measure" && (
            <text x={midX} y={midY - 6} textAnchor="middle" style={{ fontSize: 9, fontWeight: 700, fill: stroke }}>
              {delta >= 0 ? "+" : ""}
              {delta.toFixed(1)} ({pct >= 0 ? "+" : ""}
              {pct.toFixed(1)}%)
            </text>
          )}
        </g>
      );
    }

    if (dx.type === "rect") {
      const rx = Math.min(x1, x2);
      const ry = Math.min(y1, y2);
      const rw = Math.abs(x2 - x1);
      const rh = Math.abs(y2 - y1);
      return (
        <rect
          key={key}
          x={rx}
          y={ry}
          width={rw}
          height={rh}
          fill={`${stroke}18`}
          stroke={stroke}
          strokeWidth={1.4}
          strokeDasharray={dashed ? "4 3" : undefined}
        />
      );
    }

    if (dx.type === "fib") {
      const top = Math.max(dx.y1, dx.y2);
      const bot = Math.min(dx.y1, dx.y2);
      const span = top - bot || 1;
      return (
        <g key={key}>
          {FIB_LEVELS.map((lv) => {
            const price = top - span * lv;
            const y = priceY(price);
            return (
              <g key={lv}>
                <line
                  x1={Math.min(x1, x2)}
                  y1={y}
                  x2={Math.max(x1, x2)}
                  y2={y}
                  stroke={ANALYZE_THEME.fib}
                  strokeWidth={1}
                  opacity={0.85}
                  strokeDasharray={lv === 0 || lv === 1 ? undefined : "3 3"}
                />
                <text
                  x={Math.max(x1, x2) + 4}
                  y={y + 3}
                  style={{ fontSize: 8, fontWeight: 700, fill: ANALYZE_THEME.fib }}
                >
                  {(lv * 100).toFixed(1)}% · {price.toFixed(1)}
                </text>
              </g>
            );
          })}
        </g>
      );
    }
    return null;
  };

  const volTop = priceH + gap;
  const rsiTop = priceH + (showVol ? gap + volH : 0) + gap;

  return (
    <div className="relative">
      <svg
        ref={svgRef}
        viewBox={`0 0 ${chartW} ${chartH}`}
        className="w-full h-auto select-none touch-none"
        style={{
          background: `linear-gradient(180deg, ${ANALYZE_THEME.chartBg} 0%, #f5ebe0 100%)`,
          cursor: drawTool === "cursor" ? "crosshair" : "crosshair",
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={() => {
          setHoverIndex(null);
          if (draft) onPointerUp();
        }}
      >
        <defs>
          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={ANALYZE_THEME.accent} stopOpacity="0.22" />
            <stop offset="100%" stopColor={ANALYZE_THEME.accent} stopOpacity="0" />
          </linearGradient>
        </defs>

        {yTicks.map((t, i) => (
          <g key={i}>
            <line x1={padL} y1={t.y} x2={chartW - padR} y2={t.y} stroke={ANALYZE_THEME.grid} strokeDasharray={i === yTicks.length - 1 ? undefined : "4"} />
            <text x={chartW - padR + 6} y={t.y + 3} style={{ fontSize: 9, fontWeight: 600, fill: ANALYZE_THEME.inkFaint }}>
              {t.value.toFixed(0)}
            </text>
          </g>
        ))}

        {/* Bollinger */}
        {bb && (
          <g>
            <path d={buildPath(bb.upper)} fill="none" stroke={ANALYZE_THEME.bb} strokeWidth={1} opacity={0.45} strokeDasharray="3 3" />
            <path d={buildPath(bb.lower)} fill="none" stroke={ANALYZE_THEME.bb} strokeWidth={1} opacity={0.45} strokeDasharray="3 3" />
            <path d={buildPath(bb.mid)} fill="none" stroke={ANALYZE_THEME.bb} strokeWidth={1.2} opacity={0.7} />
          </g>
        )}

        {(chartStyle === "area" || chartStyle === "line") &&
          seriesList.map((s, sIdx) => {
            const prices = s.points.map((p) => p.price);
            const color = getSeriesColor(sIdx);
            return (
              <g key={s.marketId}>
                {chartStyle === "area" && sIdx === 0 && <path d={buildArea(prices)} fill="url(#areaFill)" />}
                <path
                  d={buildPath(prices)}
                  fill="none"
                  stroke={color}
                  strokeWidth={sIdx === 0 ? 2.4 : 1.5}
                  strokeDasharray={sIdx === 0 ? undefined : "5 3"}
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </g>
            );
          })}

        {chartStyle === "candle" && primary && (
          <g>
            {seriesList.slice(1).map((s, sIdx) => (
              <path
                key={s.marketId}
                d={buildPath(s.points.map((p) => p.price))}
                fill="none"
                stroke={getSeriesColor(sIdx + 1)}
                strokeWidth={1.3}
                strokeDasharray="4 3"
                opacity={0.8}
              />
            ))}
            {primary.points.map((p, idx) => {
              const o = p.open ?? p.price;
              const c = p.close ?? p.price;
              const h = p.high ?? Math.max(o, c);
              const l = p.low ?? Math.min(o, c);
              const up = c >= o;
              const color = up ? ANALYZE_THEME.up : ANALYZE_THEME.down;
              const cx = xAt(idx);
              const yO = priceY(o);
              const yC = priceY(c);
              const bodyTop = Math.min(yO, yC);
              const bodyH = Math.max(Math.abs(yC - yO), 1.2);
              return (
                <g key={p.date}>
                  <line x1={cx} y1={priceY(h)} x2={cx} y2={priceY(l)} stroke={color} strokeWidth={1.2} />
                  <rect x={cx - candleW / 2} y={bodyTop} width={candleW} height={bodyH} fill={color} rx={0.5} />
                </g>
              );
            })}
          </g>
        )}

        {/* MAs */}
        {indicators.ma7 && <path d={buildPath(ma7)} fill="none" stroke={ANALYZE_THEME.ma7} strokeWidth={1.3} />}
        {indicators.ma25 && <path d={buildPath(ma25)} fill="none" stroke={ANALYZE_THEME.ma25} strokeWidth={1.3} />}
        {indicators.ma99 && <path d={buildPath(ma99)} fill="none" stroke={ANALYZE_THEME.ma99} strokeWidth={1.3} />}

        {/* Drawings */}
        {drawings.map((d) => renderDrawing(d, d.id))}
        {draft && renderDrawing(draft as ChartDrawing, "draft", true)}

        {/* Hover bands */}
        {pointCount > 0 &&
          Array.from({ length: pointCount }).map((_, idx) => {
            const n = Math.max(pointCount - 1, 1);
            const x = xAt(idx);
            const band = plotW / n;
            return (
              <rect
                key={idx}
                x={x - band / 2}
                y={0}
                width={band}
                height={priceH}
                fill="transparent"
                onMouseEnter={() => drawTool === "cursor" && setHoverIndex(idx)}
              />
            );
          })}

        {hoverIndex != null && (
          <g>
            <line x1={xAt(hoverIndex)} y1={padT} x2={xAt(hoverIndex)} y2={priceH - padB} stroke={ANALYZE_THEME.inkFaint} strokeDasharray="3 3" />
            <line x1={padL} y1={priceY(primary?.points[hoverIndex]?.price ?? 0)} x2={chartW - padR} y2={priceY(primary?.points[hoverIndex]?.price ?? 0)} stroke={ANALYZE_THEME.inkFaint} strokeDasharray="3 3" opacity={0.5} />
          </g>
        )}

        {labels.map((label, idx) =>
          idx % labelStep === 0 || idx === labels.length - 1 ? (
            <text key={idx} x={xAt(idx)} y={priceH - 4} textAnchor="middle" style={{ fontSize: 8, fontWeight: 600, fill: ANALYZE_THEME.inkFaint }}>
              {label}
            </text>
          ) : null
        )}

        {/* Volume */}
        {showVol && (
          <g>
            <text x={padL} y={volTop - 2} style={{ fontSize: 8, fontWeight: 700, fill: ANALYZE_THEME.inkFaint }}>
              VOL
            </text>
            {primary?.points.map((p, idx) => {
              const vol = p.volume ?? 0;
              const vh = (vol / maxVol) * (volH - 8);
              const up = (p.close ?? p.price) >= (p.open ?? p.price);
              return (
                <rect
                  key={`v-${p.date}`}
                  x={xAt(idx) - candleW / 2}
                  y={volTop + volH - vh}
                  width={candleW}
                  height={Math.max(vh, 1)}
                  fill={up ? ANALYZE_THEME.up : ANALYZE_THEME.down}
                  opacity={0.45}
                />
              );
            })}
          </g>
        )}

        {/* RSI */}
        {showRsi && (
          <g>
            <text x={padL} y={rsiTop - 2} style={{ fontSize: 8, fontWeight: 700, fill: ANALYZE_THEME.inkFaint }}>
              RSI 14
            </text>
            <line x1={padL} y1={rsiTop + rsiH * 0.3} x2={chartW - padR} y2={rsiTop + rsiH * 0.3} stroke={ANALYZE_THEME.grid} strokeDasharray="3" />
            <line x1={padL} y1={rsiTop + rsiH * 0.7} x2={chartW - padR} y2={rsiTop + rsiH * 0.7} stroke={ANALYZE_THEME.grid} strokeDasharray="3" />
            <path
              d={(() => {
                let d = "";
                let started = false;
                rsiVals.forEach((v, idx) => {
                  if (v == null) {
                    started = false;
                    return;
                  }
                  const y = rsiTop + rsiH - (v / 100) * (rsiH - 6) - 3;
                  d += `${started ? "L" : "M"}${xAt(idx)},${y} `;
                  started = true;
                });
                return d.trim();
              })()}
              fill="none"
              stroke={ANALYZE_THEME.accent}
              strokeWidth={1.5}
            />
          </g>
        )}
      </svg>

      {/* Floating OHLC badge */}
      {hoverPoint && (
        <div
          className="absolute top-3 left-3 rounded-xl px-3 py-2 text-[10px] font-semibold tabular-nums pointer-events-none"
          style={{
            background: ANALYZE_THEME.surfaceRaised,
            border: `1px solid ${ANALYZE_THEME.borderStrong}`,
            color: ANALYZE_THEME.inkMuted,
            boxShadow: "0 8px 24px rgba(61,48,36,0.08)",
          }}
        >
          <span className="font-bold mr-2" style={{ color: ANALYZE_THEME.ink }}>
            {hoverPoint.label}
          </span>
          {hoverPoint.open != null ? (
            <>
              <span className="mr-2">
                O <b style={{ color: hoverUp ? ANALYZE_THEME.up : ANALYZE_THEME.down }}>{hoverPoint.open.toFixed(2)}</b>
              </span>
              <span className="mr-2">
                H <b style={{ color: ANALYZE_THEME.ink }}>{(hoverPoint.high ?? 0).toFixed(2)}</b>
              </span>
              <span className="mr-2">
                L <b style={{ color: ANALYZE_THEME.ink }}>{(hoverPoint.low ?? 0).toFixed(2)}</b>
              </span>
              <span className="mr-2">
                C <b style={{ color: hoverUp ? ANALYZE_THEME.up : ANALYZE_THEME.down }}>{(hoverPoint.close ?? hoverPoint.price).toFixed(2)}</b>
              </span>
              <span>
                Vol <b style={{ color: ANALYZE_THEME.ink }}>{(hoverPoint.volume ?? 0).toLocaleString()}</b>
              </span>
            </>
          ) : (
            <span>
              Px <b style={{ color: ANALYZE_THEME.ink }}>{hoverPoint.price.toFixed(2)}</b>
            </span>
          )}
        </div>
      )}
    </div>
  );
}
