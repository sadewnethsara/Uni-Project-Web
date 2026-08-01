"use client";

import { motion } from "framer-motion";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";

interface Prediction {
  market: string;
  trend: "up" | "down" | "stable";
  confidence: number;
  timeframe: string;
  reasoning: string;
  currentPrice: number;
  predictedPrice: number;
}

interface MarketPredictionPanelProps {
  predictions: Prediction[];
}

export default function MarketPredictionPanel({ predictions }: MarketPredictionPanelProps) {
  const getTrendColor = (trend: string) => {
    switch (trend) {
      case "up": return ANALYZE_THEME.up;
      case "down": return ANALYZE_THEME.down;
      default: return ANALYZE_THEME.inkMuted;
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case "up": return "↗";
      case "down": return "↘";
      default: return "→";
    }
  };

  return (
    <div className={`${PANEL_CLASS} p-4 sm:p-5`} style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.inkFaint }}>
            AI Market Intelligence
          </p>
          <p className="text-xs font-semibold mt-0.5" style={{ color: ANALYZE_THEME.inkMuted }}>
            Price predictions & trend analysis
          </p>
        </div>
        <div
          className="flex items-center gap-2 text-[10px] font-bold px-3 py-2 rounded-full"
          style={{ background: ANALYZE_THEME.accentSoft, color: ANALYZE_THEME.accentInk }}
        >
          <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: ANALYZE_THEME.accent }} />
          AI Powered
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {predictions.map((prediction, idx) => (
          <motion.div
            key={prediction.market}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            className="p-4 rounded-xl border"
            style={{
              background: ANALYZE_THEME.surfaceRaised,
              borderColor: ANALYZE_THEME.border,
            }}
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold" style={{ color: ANALYZE_THEME.ink }}>
                  {prediction.market}
                </h4>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: ANALYZE_THEME.inkMuted }}>
                  {prediction.timeframe} forecast
                </p>
              </div>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                style={{
                  background: `${getTrendColor(prediction.trend)}18`,
                  color: getTrendColor(prediction.trend),
                }}
              >
                {getTrendIcon(prediction.trend)}
              </div>
            </div>

            <div className="flex items-end gap-3 mb-3">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: ANALYZE_THEME.inkFaint }}>
                  Current
                </p>
                <p className="text-lg font-black tabular-nums" style={{ color: ANALYZE_THEME.ink }}>
                  Rs. {prediction.currentPrice.toFixed(2)}
                </p>
              </div>
              <div className="flex items-center pb-1">
                <svg className="w-4 h-4" style={{ color: ANALYZE_THEME.inkMuted }} fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17.25 8.25L21 12m0 0l-3.75 3.75M21 12H3" />
                </svg>
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wide" style={{ color: ANALYZE_THEME.inkFaint }}>
                  Predicted
                </p>
                <p className="text-lg font-black tabular-nums" style={{ color: getTrendColor(prediction.trend) }}>
                  Rs. {prediction.predictedPrice.toFixed(2)}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 mb-3">
              <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: ANALYZE_THEME.surfaceMuted }}>
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${prediction.confidence}%` }}
                  transition={{ duration: 0.8, delay: idx * 0.1 + 0.2 }}
                  className="h-full rounded-full"
                  style={{ background: getTrendColor(prediction.trend) }}
                />
              </div>
              <span className="text-[11px] font-bold tabular-nums" style={{ color: ANALYZE_THEME.inkMuted }}>
                {prediction.confidence}%
              </span>
            </div>

            <p className="text-[11px] font-medium leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
              {prediction.reasoning}
            </p>
          </motion.div>
        ))}
      </div>

      <div className="mt-4 p-3 rounded-xl border" style={{ background: ANALYZE_THEME.accentSoft, borderColor: ANALYZE_THEME.accent }}>
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: ANALYZE_THEME.accent }}>
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
            </svg>
          </div>
          <div>
            <p className="text-[11px] font-bold" style={{ color: ANALYZE_THEME.accentInk }}>
              AI Analysis Summary
            </p>
            <p className="text-[11px] font-medium mt-1" style={{ color: ANALYZE_THEME.accentInk }}>
              Based on historical data patterns, seasonal trends, and current market conditions. Predictions are updated daily and should be used as guidance alongside local market knowledge.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}