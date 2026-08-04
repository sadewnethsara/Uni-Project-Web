import { HTMLAttributes } from "react";

export interface CommodityBadgeProps extends HTMLAttributes<HTMLSpanElement> {
  trend?: "up" | "down" | "stable" | "none";
  available?: boolean;
  text?: string;
  size?: "sm" | "md";
}

export function CommodityBadge({
  trend = "none",
  available = true,
  text,
  size = "md",
  className = "",
  ...props
}: CommodityBadgeProps) {
  if (!available) {
    return (
      <span
        className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium opacity-60 bg-red-500/10 text-red-400 border border-red-500/20 ${className}`}
        {...props}
      >
        Unavailable
      </span>
    );
  }

  const getTrendStyle = () => {
    switch (trend) {
      case "up":
        return "bg-emerald-500/15 text-emerald-400 border-emerald-500/30";
      case "down":
        return "bg-rose-500/15 text-rose-400 border-rose-500/30";
      case "stable":
        return "bg-amber-500/15 text-amber-300 border-amber-500/30";
      default:
        return "bg-white/10 text-slate-300 border-white/10";
    }
  };

  const getTrendIcon = () => {
    switch (trend) {
      case "up":
        return "▲";
      case "down":
        return "▼";
      case "stable":
        return "►";
      default:
        return null;
    }
  };

  const sizeClass = size === "sm" ? "px-1.5 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs";

  return (
    <span
      className={`inline-flex items-center gap-1 font-semibold rounded-lg border transition-all ${getTrendStyle()} ${sizeClass} ${className}`}
      {...props}
    >
      {getTrendIcon() && <span className="text-[9px]">{getTrendIcon()}</span>}
      {text || (trend !== "none" ? trend.toUpperCase() : "AVAILABLE")}
    </span>
  );
}
