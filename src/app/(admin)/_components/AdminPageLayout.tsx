import React from "react";
import { LucideIcon } from "lucide-react";

interface AdminPageLayoutProps {
  title: string;
  subtitle?: string;
  icon: LucideIcon;
  countLabel?: string;
  countValue?: number;
  children: React.ReactNode;
  accentColor?: string;
  accentSoftColor?: string;
  surfaceColor?: string;
  surfaceRaisedColor?: string;
  borderColor?: string;
  inkColor?: string;
  inkMutedColor?: string;
}

export function AdminPageLayout({
  title,
  subtitle,
  icon: Icon,
  countLabel,
  countValue,
  children,
  accentColor = "#10b981",
  accentSoftColor = "#e6f4ea",
  surfaceColor = "#f9fafb",
  surfaceRaisedColor = "#ffffff",
  borderColor = "#e5e7eb",
  inkColor = "#111827",
  inkMutedColor = "#4b5563",
}: AdminPageLayoutProps) {
  return (
    <div className="space-y-5 max-w-8xl mx-auto px-1 sm:px-0">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl" style={{ background: `${accentColor}15`, color: accentColor }}>
              <Icon className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: inkColor }}>
              {title}
            </h2>
          </div>
          {subtitle && (
            <p className="text-sm font-medium" style={{ color: inkMutedColor }}>
              {subtitle}
            </p>
          )}
        </div>

        {countLabel && typeof countValue === "number" && (
          <div className="flex items-center gap-2 self-start sm:self-auto px-3 py-1.5 rounded-full border text-xs font-semibold shadow-sm" style={{ background: surfaceColor, borderColor, color: inkColor }}>
            <span>{countLabel}:</span>
            <span className="px-2 py-0.5 rounded-full text-white text-xs font-bold" style={{ background: accentColor }}>
              {countValue}
            </span>
          </div>
        )}
      </div>

      <div className="rounded-3xl border shadow-sm transition-all duration-300" style={{ background: surfaceRaisedColor, borderColor }}>
        {children}
      </div>
    </div>
  );
}
