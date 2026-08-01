"use client";

import { useSyncExternalStore } from "react";
import { analyzeStore, type AnalyzeDashboardState } from "@/lib/analyzeStore";

export function useAnalyzeDashboard(): AnalyzeDashboardState {
  return useSyncExternalStore(
    analyzeStore.subscribe,
    analyzeStore.get,
    analyzeStore.get
  );
}
