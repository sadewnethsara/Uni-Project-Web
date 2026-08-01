"use client";

import { ANALYZE_THEME } from "@/lib/chartTheme";
import {
  Carrot,
  Leaf,
  Bean,
  Wheat,
  Sprout,
  Apple,
  Banana,
  Citrus,
  Cherry,
  Grape,
  Flower2,
  TreeDeciduous,
  Salad,
} from "lucide-react";

// Expanded produce list with heavy emphasis on vegetables, greens, & crops
const PRODUCE_ITEMS = [
  // Vegetables & Roots
  { name: "Carrot", icon: Carrot, color: "#f97316", bg: "rgba(249, 115, 22, 0.12)" },
  { name: "Leafy Greens", icon: Leaf, color: "#22c55e", bg: "rgba(34, 197, 94, 0.12)" },
  { name: "Beans & Peas", icon: Bean, color: "#84cc16", bg: "rgba(132, 204, 22, 0.12)" },
  { name: "Microgreens", icon: Sprout, color: "#10b981", bg: "rgba(16, 185, 129, 0.12)" },
  { name: "Fresh Salad", icon: Salad, color: "#15803d", bg: "rgba(21, 128, 61, 0.12)" },
  { name: "Cabbage & Broccoli", icon: TreeDeciduous, color: "#16a34a", bg: "rgba(22, 163, 74, 0.12)" },
  
  // Grains & Crops
  { name: "Grains & Corn", icon: Wheat, color: "#d97706", bg: "rgba(217, 119, 6, 0.12)" },
  { name: "Artichoke & Florets", icon: Flower2, color: "#059669", bg: "rgba(5, 150, 105, 0.12)" },

  // Fruits & Berries
  { name: "Citrus & Lemon", icon: Citrus, color: "#f59e0b", bg: "rgba(245, 158, 11, 0.12)" },
  { name: "Red Apple", icon: Apple, color: "#ef4444", bg: "rgba(239, 68, 68, 0.12)" },
  { name: "Banana", icon: Banana, color: "#eab308", bg: "rgba(234, 179, 8, 0.12)" },
  { name: "Cherries", icon: Cherry, color: "#dc2626", bg: "rgba(220, 38, 38, 0.12)" },
  { name: "Grapes", icon: Grape, color: "#9333ea", bg: "rgba(147, 51, 234, 0.12)" },
];

export default function EmojiMarquee() {
  // Triplicated for a seamless infinite loop
  const duplicatedProduce = [
    ...PRODUCE_ITEMS,
    ...PRODUCE_ITEMS,
    ...PRODUCE_ITEMS,
  ];

  return (
    <div
      className="w-full relative overflow-hidden py-4 border-y"
      style={{
        borderColor: `${ANALYZE_THEME.border}40`,
      }}
    >
      {/* Left & Right Edge Fade Masks */}
      <div
        className="absolute left-0 top-0 bottom-0 w-16 sm:w-28 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to right, ${ANALYZE_THEME.surface}, transparent)`,
        }}
      />
      <div
        className="absolute right-0 top-0 bottom-0 w-16 sm:w-28 z-10 pointer-events-none"
        style={{
          background: `linear-gradient(to left, ${ANALYZE_THEME.surface}, transparent)`,
        }}
      />

      {/* Infinite Scrolling Track */}
      <div className="flex w-max animate-marquee hover:[animation-play-state:paused] cursor-pointer">
        {duplicatedProduce.map((item, index) => {
          const Icon = item.icon;
          return (
            <div
              key={index}
              className="flex items-center gap-2.5 px-4 py-2 mx-2 rounded-full border transition-all hover:scale-105"
              style={{
                background: ANALYZE_THEME.surfaceRaised,
                borderColor: ANALYZE_THEME.border,
              }}
            >
              <div
                className="w-7 h-7 rounded-full flex items-center justify-center shrink-0"
                style={{ background: item.bg }}
              >
                <Icon size={16} style={{ color: item.color }} />
              </div>
              <span
                className="text-xs font-bold whitespace-nowrap"
                style={{ color: ANALYZE_THEME.ink }}
              >
                {item.name}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}