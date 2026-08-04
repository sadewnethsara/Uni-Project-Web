"use client";

import React from "react";
import { motion, MotionValue, useTransform } from "framer-motion";
import { LocationData, SRI_LANKA_PATH } from "./HeroData";
import RippleBackground from "../effects/RippleBackground";

interface Props {
    mapOpacity: MotionValue<number>;
    mapX: MotionValue<string>;
    mapY: MotionValue<string>;
    mapScale: MotionValue<number>;
    mapRotateY?: MotionValue<number>;
    waterOpacity: MotionValue<number>;
    baseMapOpacity: MotionValue<number>;
    outlinePathLength: MotionValue<number>;
    scrollYProgress: MotionValue<number>;
    locations: LocationData[];
    onLocationClick: (loc: LocationData) => void;
}

export default function HeroMap({
    mapOpacity, mapX, mapY, mapScale, mapRotateY, waterOpacity,
    baseMapOpacity, outlinePathLength, scrollYProgress,
    locations, onLocationClick
}: Props) {
    return (
        <div className="relative w-full h-full max-w-[100rem] mx-auto flex items-center justify-center px-4 md:px-10 mt-10 md:mt-0">
            <motion.div
                style={{ opacity: mapOpacity, x: mapX, y: mapY, scale: mapScale, rotateY: mapRotateY, transformPerspective: 1200 }}
                className="relative z-30 w-full h-screen max-h-[900px] flex items-center justify-center pointer-events-auto"
            >
                {/* WATER SHIMMER - Subtle coastal atmosphere behind the map */}
                <motion.div
                    className="absolute inset-[-10%] overflow-hidden rounded-[40px]"
                    style={{ opacity: waterOpacity }}
                >
                    <RippleBackground elements={[
                        {
                            type: 'text',
                            content: 'SRI LANKA',
                            fontFamily: 'Montserrat, system-ui, sans-serif',
                            fontWeight: '900',
                            fontSize: 160,
                            color: 'rgba(14, 165, 233, 0.08)',
                            x: 0.5,
                            y: 0.42,
                        }
                    ]} />
                    {/* Soft vignette so map stays dominant */}
                    <div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            background: 'radial-gradient(ellipse 55% 70% at 50% 50%, transparent 30%, rgba(248,250,252,0.55) 100%)',
                            pointerEvents: 'none',
                        }}
                    />
                </motion.div>

                <svg viewBox="-160 -60 1100 700" className="relative z-10 w-full h-full object-contain filter drop-shadow-2xl overflow-visible">
                    <defs>
                        <filter id="neon-glow-emerald" x="-25%" y="-25%" width="150%" height="150%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                        <filter id="pin-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                        {/* Subtle drop shadow for the island shape */}
                        <filter id="island-shadow" x="-15%" y="-10%" width="130%" height="130%">
                            <feDropShadow dx="0" dy="6" stdDeviation="12" floodColor="rgba(14,165,233,0.18)" />
                        </filter>
                    </defs>

                    {/* 1. Coastal water glow behind island */}
                    <motion.path
                        d={SRI_LANKA_PATH}
                        fill="rgba(186,230,255,0.35)"
                        stroke="none"
                        transform="scale(1.035) translate(-7, -8)"
                        style={{ opacity: baseMapOpacity }}
                        filter="url(#island-shadow)"
                    />

                    {/* 2. Base Map Shape */}
                    <motion.path
                        d={SRI_LANKA_PATH}
                        fill="#F8FAFC"
                        stroke="#bae6fd"
                        strokeWidth="0.8"
                        style={{ opacity: baseMapOpacity }}
                    />

                    {/* 3. Animated Glowing Map Outline */}
                    <motion.path
                        d={SRI_LANKA_PATH}
                        fill="none"
                        stroke="#0ea5e9"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeOpacity={0.7}
                        style={{ pathLength: outlinePathLength }}
                    />

                    {/* 4. Map Nodes & Dashed Arrows */}
                    {locations.map((loc) => (
                        <MapInteraction key={loc.id} loc={loc} scrollY={scrollYProgress} onClick={onLocationClick} />
                    ))}
                </svg>
            </motion.div>
        </div>
    );
}

// --- SUB-COMPONENT: MAP LINES & PINS & EMBEDDED CARDS ---
function MapInteraction({ loc, scrollY, onClick }: { loc: LocationData, scrollY: MotionValue<number>, onClick: (loc: LocationData) => void }) {
    const mid = (loc.range[0] + loc.range[1]) / 2;

    // Draw sweeping curved line OUTWARD, stay visible, then RETRACT backwards when panel appears
    const pathLength = useTransform(
        scrollY,
        [loc.range[0], mid, 0.82, 0.88],
        [0, 1, 1, 0]
    );

    const lineOpacity = useTransform(scrollY, [loc.range[0], mid, 0.83, 0.88], [0, 1, 1, 0]);

    // Nodes stay on the map even after lines retract
    const nodeOpacity = useTransform(scrollY, [loc.range[0], mid], [0, 1]);
    const pinScale = useTransform(scrollY, [loc.range[0], mid], [0.5, 1]);

    // Card slide up and fade in
    const cardOpacity = useTransform(scrollY, [loc.range[0], mid, 0.82, 0.88], [0, 1, 1, 0]);
    const cardY = useTransform(scrollY, [loc.range[0], mid, 0.82, 0.88], [30, 0, 0, 30]);

    // Calculate a beautiful bezier curve between the map node and the floating card
    const controlOffset = Math.abs(loc.tx - loc.cx) * 0.5;
    const cp1x = loc.cx + (loc.tx > loc.cx ? controlOffset : -controlOffset);
    const cp2x = loc.tx + (loc.tx > loc.cx ? -controlOffset : controlOffset);
    const curvedPath = `M ${loc.cx} ${loc.cy} C ${cp1x} ${loc.cy}, ${cp2x} ${loc.ty}, ${loc.tx} ${loc.ty}`;

    return (
        <motion.g className="group">
            {/* Smooth Sweeping Connected Line */}
            <motion.path
                d={curvedPath}
                fill="none"
                stroke={loc.color}
                strokeWidth="1.5"
                strokeDasharray="4 6"
                style={{ pathLength, opacity: lineOpacity }}
            />

            {/* Map Node Dot */}
            <motion.g style={{ opacity: nodeOpacity, scale: pinScale, transformOrigin: `${loc.cx}px ${loc.cy}px` }} className="pointer-events-none">
                <circle cx={loc.cx} cy={loc.cy} r="15" fill={loc.color} className="opacity-10" />
                <circle cx={loc.cx} cy={loc.cy} r="5" fill={loc.color} filter="url(#pin-glow)" />
                <circle cx={loc.cx} cy={loc.cy} r="2" fill="#ffffff" />
            </motion.g>

            {/* Enlarge Section Card */}
            <foreignObject
                x={loc.align === 'left' ? loc.tx - 230 : loc.tx}
                y={loc.ty - 35}
                width="230"
                height="110"
                className="overflow-visible pointer-events-auto"
            >
                <motion.div style={{ opacity: cardOpacity, y: cardY }} className="w-full p-1">
                    <button onClick={() => onClick(loc)} className="w-full text-left group/card">
                        <div
                            className="bg-white/95 backdrop-blur-2xl border border-slate-100 shadow-[0_16px_36px_-8px_rgba(0,0,0,0.14)] hover:shadow-[0_24px_48px_-10px_rgba(0,0,0,0.22)] rounded-2xl p-3.5 transition-all duration-300 relative overflow-hidden"
                            style={{ borderTop: `3px solid ${loc.color}` }}
                        >
                            {/* Subtle colored accent glow behind card */}
                            <div
                                className="absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl opacity-20 pointer-events-none"
                                style={{ backgroundColor: loc.color }}
                            />

                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 overflow-hidden">
                                    <div className="relative flex items-center justify-center shrink-0">
                                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: loc.color }} />
                                    </div>
                                    <h4 className="font-extrabold text-[11px] text-slate-900 uppercase tracking-wide truncate">
                                        {loc.name}
                                    </h4>
                                </div>
                                <span className="w-5 h-5 rounded-full bg-slate-100 group-hover/card:bg-emerald-500 group-hover/card:text-white flex items-center justify-center text-[10px] text-slate-500 transition-colors duration-200 shrink-0 font-bold">
                                    →
                                </span>
                            </div>

                            <div className="flex items-baseline justify-between">
                                <div>
                                    <p className="text-[9px] uppercase font-bold text-slate-400 tracking-wider">Daily Volume</p>
                                    <p className="text-sm font-black text-slate-900 tracking-tight" style={{ color: loc.color }}>
                                        {loc.stat}
                                    </p>
                                </div>

                                <div className="flex items-center gap-1">
                                    {loc.items.slice(0, 2).map((item, idx) => (
                                        <span key={idx} className="text-[9px] font-bold text-slate-600 bg-slate-100/90 px-1.5 py-0.5 rounded-md border border-slate-200/60">
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </button>
                </motion.div>
            </foreignObject>
        </motion.g>
    );
}
