"use client";

import { HTMLAttributes, ReactNode } from "react";
import { ANALYZE_THEME } from "@/lib/chartTheme";

export interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: "default" | "raised" | "deep" | "dark";
  border?: boolean;
}

export function GlassPanel({
  children,
  variant = "default",
  border = true,
  className = "",
  style,
  ...props
}: GlassPanelProps) {
  const getBackground = () => {
    switch (variant) {
      case "raised":
        return ANALYZE_THEME.surfaceRaised;
      case "deep":
        return ANALYZE_THEME.surfaceDeep;
      case "dark":
        return "var(--agri-surface-deep)";
      default:
        return ANALYZE_THEME.surface;
    }
  };

  return (
    <div
      className={`rounded-2xl backdrop-blur-xl shadow-xl transition-all ${
        border ? "border" : ""
      } ${className}`}
      style={{
        background: getBackground(),
        borderColor: border ? ANALYZE_THEME.border : undefined,
        ...style
      }}
      {...props}
    >
      {children}
    </div>
  );
}
