"use client";

import React, { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "rectangular" | "circular" | "text" | "card";
}

export function Skeleton({ className, variant = "rectangular", ...props }: SkeletonProps) {
  const variantStyles = {
    rectangular: "rounded-xl",
    circular: "rounded-full",
    text: "rounded-md h-4 w-full",
    card: "rounded-2xl h-36 w-full",
  };

  return (
    <div
      className={cn(
        "animate-pulse bg-[#f0e6d8]/80 dark:bg-slate-800/80 border border-black/5 dark:border-white/5",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2.5 w-full", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          variant="text"
          className={cn(
            i === lines - 1 ? "w-3/4" : "w-full",
            "h-3.5 bg-[#e8dccb]/70 dark:bg-slate-700/60"
          )}
        />
      ))}
    </div>
  );
}
