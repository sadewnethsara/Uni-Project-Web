"use client";

import { motion } from "framer-motion";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";
import { ANALYZE_COMMODITIES, ANALYZE_MARKETS, DEFAULT_COMPARE_MARKETS } from "@/lib/analyticsData";

interface QuickAnalyticsPresetsProps {
  onSelectPreset: (commodities: string[], markets: string[], timeframe: string) => void;
}

interface PresetOption {
  id: string;
  label: string;
  description: string;
  commodities: string[];
  markets: string[];
  timeframe: string;
  icon: string;
}

export default function QuickAnalyticsPresets({ onSelectPreset }: QuickAnalyticsPresetsProps) {
  const presets: PresetOption[] = [
    {
      id: "popular",
      label: "Popular Vegetables",
      description: "Carrot, Beans, Tomato across main markets",
      commodities: ["carrot", "beans", "tomato"],
      markets: DEFAULT_COMPARE_MARKETS,
      timeframe: "1M",
      icon: "🥕",
    },
    {
      id: "leafy",
      label: "Leafy Greens",
      description: "Leeks, Cabbage, Knol Khol price trends",
      commodities: ["leeks", "cabbage", "knol_khol"],
      markets: DEFAULT_COMPARE_MARKETS,
      timeframe: "1M",
      icon: "🥬",
    },
    {
      id: "root",
      label: "Root Vegetables",
      description: "Potato, Carrot, Beetroot, Onion",
      commodities: ["potato", "carrot", "beetroot", "onion"],
      markets: DEFAULT_COMPARE_MARKETS,
      timeframe: "3M",
      icon: "🥔",
    },
    {
      id: "all-markets",
      label: "All Markets",
      description: "Compare prices across all 10 markets",
      commodities: ["carrot"],
      markets: ANALYZE_MARKETS.map(m => m.id),
      timeframe: "7D",
      icon: "📊",
    },
    {
      id: "price-watch",
      label: "Price Watch",
      description: "Today's prices for top 5 vegetables",
      commodities: ["carrot", "beans", "tomato", "potato", "onion"],
      markets: ["dambulla", "manning"],
      timeframe: "1D",
      icon: "👀",
    },
    {
      id: "seasonal",
      label: "Seasonal Analysis",
      description: "Year-over-year comparison for key crops",
      commodities: ["carrot", "beans", "cabbage"],
      markets: DEFAULT_COMPARE_MARKETS,
      timeframe: "1Y",
      icon: "📅",
    },
  ];

  return (
    <div className={`${PANEL_CLASS} p-4 sm:p-5`} style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}>
      <div className="mb-4">
        <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.inkFaint }}>
          Quick Presets
        </p>
        <p className="text-xs font-semibold mt-0.5" style={{ color: ANALYZE_THEME.inkMuted }}>
          Start with popular analytics configurations
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {presets.map((preset, idx) => (
          <motion.button
            key={preset.id}
            type="button"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.05 }}
            onClick={() => onSelectPreset(preset.commodities, preset.markets, preset.timeframe)}
            className="text-left p-4 rounded-xl border cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98]"
            style={{
              background: ANALYZE_THEME.surfaceRaised,
              borderColor: ANALYZE_THEME.border,
            }}
          >
            <div className="flex items-start gap-3">
              <span className="text-2xl">{preset.icon}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold" style={{ color: ANALYZE_THEME.ink }}>
                  {preset.label}
                </p>
                <p className="text-[11px] font-medium mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
                  {preset.description}
                </p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md" style={{ background: ANALYZE_THEME.accentSoft, color: ANALYZE_THEME.accentInk }}>
                    {preset.commodities.length} veg
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md" style={{ background: ANALYZE_THEME.surfaceMuted, color: ANALYZE_THEME.inkMuted }}>
                    {preset.markets.length} markets
                  </span>
                  <span className="text-[9px] font-bold px-2 py-0.5 rounded-md" style={{ background: ANALYZE_THEME.surfaceMuted, color: ANALYZE_THEME.inkMuted }}>
                    {preset.timeframe}
                  </span>
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
