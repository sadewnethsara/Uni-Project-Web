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
    waterOpacity: MotionValue<number>;
    baseMapOpacity: MotionValue<number>;
    outlinePathLength: MotionValue<number>;
    scrollYProgress: MotionValue<number>;
    locations: LocationData[];
    onLocationClick: (loc: LocationData) => void;
}

export default function HeroMap({
    mapOpacity, mapX, mapY, mapScale, waterOpacity,
    baseMapOpacity, outlinePathLength, scrollYProgress,
    locations, onLocationClick
}: Props) {
    return (
        <div className="relative w-full h-full max-w-[100rem] mx-auto flex items-center justify-center px-4 md:px-10 mt-10 md:mt-0">
            <motion.div
                style={{ opacity: mapOpacity, x: mapX, y: mapY, scale: mapScale }}
                className="relative z-30 w-full h-screen max-h-[900px] flex items-center justify-center pointer-events-auto"
            >
                {/* WATER EFFECT - Only within map section */}
                <motion.div
                    className="absolute inset-0 overflow-hidden"
                    style={{ opacity: waterOpacity }}
                >
                    <RippleBackground elements={[
                        {
                            type: 'text',
                            content: 'SRI LANKA',
                            fontFamily: 'Montserrat, system-ui, sans-serif',
                            fontWeight: '900',
                            fontSize: 220,
                            color: 'rgba(255, 255, 255, 0.22)',
                            x: 0.5,
                            y: 0.38,
                        }
                    ]} />
                </motion.div>

                <svg viewBox="-160 -60 1100 700" className="w-full h-full object-contain filter drop-shadow-2xl overflow-visible">
                    <defs>
                        <filter id="neon-glow-emerald" x="-25%" y="-25%" width="150%" height="150%">
                            <feGaussianBlur stdDeviation="4" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                        <filter id="pin-glow" x="-50%" y="-50%" width="200%" height="200%">
                            <feGaussianBlur stdDeviation="2.5" result="blur" />
                            <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
                        </filter>
                    </defs>

                    {/* 1. Base Map Shape */}
                    <motion.path
                        d={SRI_LANKA_PATH}
                        fill="#F8FAFC"
                        stroke="#cbd5e1"
                        strokeWidth="0.5"
                        style={{ opacity: baseMapOpacity }}
                    />

                    {/* 2. Animated Glowing Map Outline */}
                    <motion.path
                        d={SRI_LANKA_PATH}
                        fill="none"
                        stroke="#A67C52"
                        strokeWidth="2"
                        strokeLinecap="round"
                        style={{ pathLength: outlinePathLength }}
                    />

                    {/* 3. Map Nodes & Dashed Arrows */}
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

            {/* Mini Card Chip */}
            <foreignObject
                x={loc.tx - (loc.tx < loc.cx ? 150 : 0)}
                y={loc.ty - 18}
                width="150"
                height="60"
                className="overflow-visible pointer-events-auto"
            >
                <motion.div style={{ opacity: cardOpacity, y: cardY }} className="w-full p-1">
                    <button onClick={() => onClick(loc)} className="w-full text-left">
                        <div
                            className="flex items-center gap-1.5 bg-white/85 backdrop-blur-md border border-white/60 rounded-xl shadow-md px-2.5 py-1.5 cursor-pointer hover:-translate-y-0.5 transition-all duration-200"
                            style={{ borderLeft: `3px solid ${loc.color}` }}
                        >
                            <div className="w-1.5 h-1.5 rounded-full shrink-0" style={{ backgroundColor: loc.color }} />
                            <div className="overflow-hidden">
                                <p className="font-extrabold text-[9px] text-slate-800 uppercase tracking-wider leading-none truncate">
                                    {loc.name}
                                </p>
                                <p className="text-[9px] font-bold mt-0.5 leading-none" style={{ color: loc.color }}>
                                    {loc.stat}
                                </p>
                            </div>
                        </div>
                    </button>
                </motion.div>
            </foreignObject>
        </motion.g>
    );
}
