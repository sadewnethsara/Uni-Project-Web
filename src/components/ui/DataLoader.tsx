"use client";

import React from "react";
import { Skeleton, SkeletonText } from "./Skeleton";
import { ANALYZE_THEME } from "@/lib/chartTheme";

export interface DataLoaderProps {
  label?: string;
  sublabel?: string;
  minHeight?: string;
}

/** Full component / container spinner for async data fetching */
export function DataLoader({
  label = "Loading real-time market data...",
  sublabel = "Connecting to Economic Centers",
  minHeight = "min-h-[280px]",
}: DataLoaderProps) {
  return (
    <div
      className={`w-full flex flex-col items-center justify-center p-8 text-center rounded-2xl border ${minHeight}`}
      style={{
        background: ANALYZE_THEME.surfaceRaised,
        borderColor: ANALYZE_THEME.border,
        color: ANALYZE_THEME.ink,
      }}
    >
      <div className="relative flex items-center justify-center w-12 h-12 mb-4">
        <span
          className="absolute inset-0 rounded-2xl animate-ping opacity-25"
          style={{ background: ANALYZE_THEME.accent }}
        />
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs shadow-md border animate-bounce"
          style={{
            background: ANALYZE_THEME.accent,
            color: "#ffffff",
            borderColor: "rgba(15, 118, 110, 0.3)",
          }}
        >
          AI
        </div>
      </div>
      <p className="text-sm font-bold tracking-wide" style={{ color: ANALYZE_THEME.ink }}>
        {label}
      </p>
      <p className="text-xs font-medium mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
        {sublabel}
      </p>
    </div>
  );
}

/** Skeleton layout matching the Markets page */
export function MarketPageSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-pulse">
      {/* Header bar skeleton */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-2xl border bg-[#fff8ee]/70 dark:bg-slate-900/60 border-black/5 dark:border-white/5">
        <div className="space-y-2">
          <Skeleton className="h-7 w-56" />
          <Skeleton className="h-4 w-80" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32 rounded-xl" />
          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>
      </div>

      {/* Filter / Search bar skeleton */}
      <div className="h-14 w-full rounded-2xl bg-[#fff8ee]/60 dark:bg-slate-900/50 border border-black/5 dark:border-white/5 p-2 flex items-center gap-3">
        <Skeleton className="h-10 flex-1 rounded-xl" />
        <Skeleton className="h-10 w-28 rounded-xl hidden md:block" />
        <Skeleton className="h-10 w-28 rounded-xl hidden md:block" />
      </div>

      {/* Market Cards Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border bg-[#fffdf8]/80 dark:bg-slate-850/80 border-black/5 dark:border-white/5 space-y-4 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Skeleton className="w-10 h-10 rounded-xl" />
                <div className="space-y-1.5">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
              <Skeleton className="h-6 w-16 rounded-full" />
            </div>

            <SkeletonText lines={2} />

            <div className="pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
              <Skeleton className="h-6 w-24 rounded-lg" />
              <Skeleton className="h-6 w-20 rounded-lg" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/** Skeleton layout matching the Analytics page */
export function AnalyticsPageSkeleton() {
  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 space-y-6 animate-pulse">
      {/* Analytics Top Bar */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 p-5 rounded-2xl border bg-[#fff8ee]/70 dark:bg-slate-900/60 border-black/5 dark:border-white/5">
        <div className="space-y-2">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
          <Skeleton className="h-10 w-28 rounded-xl" />
        </div>
      </div>

      {/* KPI Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="p-4 rounded-2xl border bg-[#fffdf8]/80 dark:bg-slate-850/80 border-black/5 dark:border-white/5 space-y-2">
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-7 w-28" />
            <Skeleton className="h-3.5 w-16" />
          </div>
        ))}
      </div>

      {/* Main Chart Card Skeleton */}
      <div className="p-6 rounded-2xl border bg-[#fffdf8]/90 dark:bg-slate-850/90 border-black/5 dark:border-white/5 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-8 w-36 rounded-xl" />
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    </div>
  );
}
