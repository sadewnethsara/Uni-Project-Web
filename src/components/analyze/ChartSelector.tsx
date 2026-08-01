"use client";

import { ANALYZE_THEME } from "@/lib/chartTheme";

interface ChartSelectorProps {
  currentChart: string;
  onChartChange: (chart: string) => void;
}

const chartOptions = [
  { id: "candle", label: "Candlestick", description: "OHLC price action" },
  { id: "line", label: "Line Chart", description: "Simple price trend" },
  { id: "area", label: "Area Chart", description: "Filled price trend" },
  { id: "scatter", label: "Scatter Plot", description: "Price vs Volume" },
  { id: "histogram", label: "Histogram", description: "Price distribution" },
  { id: "bar", label: "Bar Chart", description: "Compare by date" },
  { id: "column", label: "Column Chart", description: "Compare by market" },
];

export default function ChartSelector({ currentChart, onChartChange }: ChartSelectorProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
      {chartOptions.map((option) => (
        <button
          key={option.id}
          type="button"
          onClick={() => onChartChange(option.id)}
          className="p-3 rounded-xl border text-left transition-all hover:scale-[1.02]"
          style={{
            background: currentChart === option.id ? ANALYZE_THEME.accentSoft : ANALYZE_THEME.surface,
            borderColor: currentChart === option.id ? ANALYZE_THEME.accent : ANALYZE_THEME.border,
            boxShadow: currentChart === option.id ? "0 2px 8px rgba(15,118,110,0.15)" : undefined,
          }}
        >
          <div className="text-[11px] font-bold mb-1" style={{ color: currentChart === option.id ? ANALYZE_THEME.accentInk : ANALYZE_THEME.ink }}>
            {option.label}
          </div>
          <div className="text-[9px]" style={{ color: ANALYZE_THEME.inkFaint }}>
            {option.description}
          </div>
        </button>
      ))}
    </div>
  );
}
