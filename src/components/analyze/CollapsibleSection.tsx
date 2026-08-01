"use client";

import { useCallback, useRef, useState, type ReactNode } from "react";
import { Camera, ChevronDown, Maximize2, Minimize2, X } from "lucide-react";
import { captureElementPng } from "@/lib/captureSection";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";

interface CollapsibleSectionProps {
  id: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
  defaultOpen?: boolean;
  /** Extra classes on the body wrapper */
  bodyClassName?: string;
  /** Extra classes on the section wrapper */
  className?: string;
  actions?: ReactNode;
}

export default function CollapsibleSection({
  id,
  title,
  subtitle,
  children,
  defaultOpen = true,
  bodyClassName = "",
  className = "",
  actions,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  const [fullscreen, setFullscreen] = useState(false);
  const [shotBusy, setShotBusy] = useState(false);
  const [shotMsg, setShotMsg] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const captureRef = useRef<HTMLDivElement>(null);

  const exitFullscreen = useCallback(() => setFullscreen(false), []);

  const takeScreenshot = useCallback(async () => {
    const node = captureRef.current;
    if (!node || shotBusy) return;
    setShotBusy(true);
    setShotMsg(null);
    try {
      await captureElementPng(node, `agri-${id}-${Date.now()}`);
      setShotMsg("Saved");
      setTimeout(() => setShotMsg(null), 1800);
    } catch {
      setShotMsg("Failed");
      setTimeout(() => setShotMsg(null), 1800);
    } finally {
      setShotBusy(false);
    }
  }, [id, shotBusy]);

  const shell = (
    <div
      ref={panelRef}
      className={`${PANEL_CLASS} overflow-hidden ${fullscreen ? "h-full flex flex-col rounded-none border-0 shadow-none" : ""} ${className}`}
      style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
    >
      <div ref={captureRef} className={fullscreen ? "flex flex-col h-full" : ""}>
      <div
        className="flex items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b sticky top-0 z-20"
        style={{ borderColor: ANALYZE_THEME.border, background: ANALYZE_THEME.surface }}
      >
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 min-w-0 text-left cursor-pointer group"
          aria-expanded={open}
        >
          <ChevronDown
            className={`w-4 h-4 flex-shrink-0 transition-transform ${open ? "" : "-rotate-90"}`}
            style={{ color: ANALYZE_THEME.inkMuted }}
          />
          <div className="min-w-0">
            <h3 className="text-[11px] sm:text-xs font-black uppercase tracking-wider truncate" style={{ color: ANALYZE_THEME.ink }}>
              {title}
            </h3>
            {subtitle && (
              <p className="text-[10px] font-medium truncate" style={{ color: ANALYZE_THEME.inkFaint }}>
                {subtitle}
              </p>
            )}
          </div>
        </button>

        <div className="flex items-center gap-1 flex-shrink-0">
          {actions}
          {shotMsg && (
            <span className="text-[10px] font-bold px-1.5" style={{ color: ANALYZE_THEME.accentInk }}>
              {shotMsg}
            </span>
          )}
          <button
            type="button"
            title="Screenshot section"
            onClick={takeScreenshot}
            disabled={shotBusy}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg cursor-pointer disabled:opacity-50"
            style={{ color: ANALYZE_THEME.inkMuted, background: ANALYZE_THEME.surfaceMuted }}
          >
            <Camera className="w-3.5 h-3.5" />
          </button>
          <button
            type="button"
            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            onClick={() => setFullscreen((v) => !v)}
            className="h-8 w-8 inline-flex items-center justify-center rounded-lg cursor-pointer"
            style={{ color: ANALYZE_THEME.inkMuted, background: ANALYZE_THEME.surfaceMuted }}
          >
            {fullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
          {fullscreen && (
            <button
              type="button"
              title="Close"
              onClick={exitFullscreen}
              className="h-8 w-8 inline-flex items-center justify-center rounded-lg cursor-pointer"
              style={{ color: ANALYZE_THEME.inkMuted, background: ANALYZE_THEME.surfaceMuted }}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {open && (
        <div
          className={`${fullscreen ? "flex-1 overflow-auto" : ""} ${bodyClassName}`}
          style={{ background: ANALYZE_THEME.surfaceRaised }}
        >
          {children}
        </div>
      )}
      </div>
    </div>
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 z-[80] p-2 sm:p-4" style={{ background: "rgba(42,33,24,0.55)" }}>
        <div className="w-full h-full max-w-[1600px] mx-auto">{shell}</div>
      </div>
    );
  }

  return shell;
}
