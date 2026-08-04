"use client";

import React, { useEffect, useRef } from "react";

// --- Type Definitions (kept for API compatibility) ---
type TextElement = {
  type: "text";
  content: string;
  fontFamily?: string;
  fontWeight?: string;
  fontSize?: number;
  color?: string;
  textAlign?: "left" | "center" | "right";
  textBaseline?: "top" | "middle" | "bottom";
  x: number;
  y: number;
};

type ImageElement = {
  type: "image";
  src: string;
  width?: number;
  height?: number;
  opacity?: number;
  x: number;
  y: number;
  img?: HTMLImageElement | null;
};

type CanvasElement = TextElement | ImageElement;

interface RippleBackgroundProps {
  elements?: CanvasElement[];
}

/**
 * Lightweight CSS-animated water shimmer background.
 * Replaces the heavy Three.js WebGL water simulation for better performance.
 * Renders subtle animated gradients that mimic calm tropical coastal waters
 * around Sri Lanka — complementing the map without overwhelming it.
 */
const RippleBackground: React.FC<RippleBackgroundProps> = ({ elements = [] }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Render text/image elements onto a 2D canvas if needed (backwards compat)
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const draw = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      elements.forEach((el) => {
        if (el.type === "text") {
          const fontSize = (el.fontSize ?? 150) * (window.innerWidth < 768 ? 0.45 : 1);
          ctx.font = `${el.fontWeight ?? "bold"} ${fontSize}px '${el.fontFamily ?? "Montserrat"}', sans-serif`;
          ctx.fillStyle = el.color ?? "rgba(255,255,255,0.12)";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(el.content, el.x * canvas.width, el.y * canvas.height);
        }
      });
    };

    draw();
    window.addEventListener("resize", draw);
    return () => window.removeEventListener("resize", draw);
  }, [elements]);

  return (
    <>
      {/* ── Lightweight CSS water shimmer ─────────────────────────── */}
      <style>{`
        @keyframes shimmer-drift-1 {
          0%   { transform: translateX(0%) translateY(0%) scale(1); opacity: 0.55; }
          33%  { transform: translateX(4%) translateY(-6%) scale(1.06); opacity: 0.70; }
          66%  { transform: translateX(-3%) translateY(4%) scale(0.97); opacity: 0.50; }
          100% { transform: translateX(0%) translateY(0%) scale(1); opacity: 0.55; }
        }
        @keyframes shimmer-drift-2 {
          0%   { transform: translateX(0%) translateY(0%) scale(1); opacity: 0.45; }
          40%  { transform: translateX(-5%) translateY(5%) scale(1.08); opacity: 0.60; }
          70%  { transform: translateX(4%) translateY(-3%) scale(0.95); opacity: 0.40; }
          100% { transform: translateX(0%) translateY(0%) scale(1); opacity: 0.45; }
        }
        @keyframes shimmer-drift-3 {
          0%   { transform: translateX(0%) translateY(0%) rotate(0deg); opacity: 0.30; }
          50%  { transform: translateX(2%) translateY(6%) rotate(3deg); opacity: 0.45; }
          100% { transform: translateX(0%) translateY(0%) rotate(0deg); opacity: 0.30; }
        }
        @keyframes wave-lines {
          0%   { background-position: 0% 0%; }
          100% { background-position: 100% 100%; }
        }
      `}</style>

      {/* Base: very soft coastal gradient */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 90% 80% at 50% 40%, rgba(186,230,255,0.38) 0%, rgba(147,210,255,0.22) 40%, rgba(103,182,255,0.10) 70%, transparent 100%)",
          pointerEvents: "none",
        }}
      />

      {/* Layer 1: warm teal shimmer blob */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 70% 60% at 38% 55%, rgba(20,184,166,0.20) 0%, transparent 70%)",
          animation: "shimmer-drift-1 14s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Layer 2: sky blue blob */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 60% 55% at 65% 45%, rgba(56,189,248,0.18) 0%, transparent 65%)",
          animation: "shimmer-drift-2 18s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Layer 3: soft sapphire deep tone */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 80% 50% at 50% 80%, rgba(14,165,233,0.12) 0%, transparent 60%)",
          animation: "shimmer-drift-3 22s ease-in-out infinite",
          pointerEvents: "none",
        }}
      />

      {/* Subtle diagonal wave lines (very faint) */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          backgroundImage:
            "repeating-linear-gradient(135deg, transparent, transparent 48px, rgba(56,189,248,0.04) 48px, rgba(56,189,248,0.04) 50px)",
          animation: "wave-lines 30s linear infinite",
          pointerEvents: "none",
        }}
      />

      {/* 2D canvas for text/image elements (e.g. "SRI LANKA" watermark) */}
      <canvas
        ref={canvasRef}
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
        }}
      />
    </>
  );
};

export default RippleBackground;
