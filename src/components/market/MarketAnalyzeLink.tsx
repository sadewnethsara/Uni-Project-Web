"use client";

import Link from "next/link";
import { ArrowRight2, Chart2 } from "iconsax-react";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";

interface MarketAnalyzeLinkProps {
  marketId: string;
  commodityId?: string | null;
  onNavigate?: () => void;
}

export default function MarketAnalyzeLink({ marketId, commodityId, onNavigate }: MarketAnalyzeLinkProps) {
  const queryParams = new URLSearchParams();
  if (marketId) queryParams.set("market", marketId);
  if (commodityId) queryParams.set("commodity", commodityId);
  const href = `/analytics${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={`${PANEL_CLASS} group flex items-center gap-3 p-4 cursor-pointer transition-transform active:scale-[0.99]`}
      style={{
        background: `linear-gradient(135deg, ${ANALYZE_THEME.accentSoft} 0%, ${ANALYZE_THEME.surfaceRaised} 100%)`,
        borderColor: ANALYZE_THEME.borderStrong,
      }}
    >
      <div
        className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: ANALYZE_THEME.accent, color: "#fff" }}
      >
        <Chart2 size={20} color="currentColor" variant="Bold" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.accentInk }}>
          Need deeper insight?
        </p>
        <p className="text-sm font-black truncate" style={{ color: ANALYZE_THEME.ink }}>
          Open full analytics dashboard
        </p>
        <p className="text-[11px] font-medium mt-0.5" style={{ color: ANALYZE_THEME.inkMuted }}>
          Charts, compare markets, AI filters
          {commodityId ? ` · starting with your selection` : ""}
        </p>
      </div>
      <ArrowRight2
        size={18}
        className="flex-shrink-0 transition-transform group-hover:translate-x-0.5"
        color={ANALYZE_THEME.accentInk}
      />
    </Link>
  );
}
