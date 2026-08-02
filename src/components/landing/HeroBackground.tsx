"use client";

import React from "react";
import { motion, MotionValue } from "framer-motion";
import { BackgroundLines } from "../ui/background-lines";

interface Props {
    initialBgOpacity: MotionValue<number>;
    initialBgDisplay: MotionValue<string>;
    initOpacity: MotionValue<number>;
    initY: MotionValue<number>;
    initScale: MotionValue<number>;
}

export default function HeroBackground({
    initialBgOpacity, initialBgDisplay, initOpacity, initY, initScale
}: Props) {
    return (
        <>
            {/* BACKGROUND DECORATION (FADES OUT) */}
            <motion.div className="fixed inset-0 pointer-events-none overflow-hidden" style={{ opacity: initialBgOpacity, display: initialBgDisplay as any }}>
                <BackgroundLines children={undefined}></BackgroundLines>

                <div className="absolute inset-0 opacity-[0.03]"
                    style={{ backgroundImage: `linear-gradient(#000 1px, transparent 1px), linear-gradient(90deg, #000 1px, transparent 1px)`, backgroundSize: '50px 50px' }}
                />
                <div className="absolute -top-24 -left-24 w-96 h-96 bg-emerald-100/40 rounded-full blur-[120px]" />
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-emerald-50/30 rounded-full blur-[150px]" />
            </motion.div>

            {/* MASSIVE SCROLLING BACKGROUND TEXT (15% -> 35%) */}
            <motion.div
                style={{ opacity: initOpacity, y: initY }}
                className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden"
            >
                <h2 className="text-[10rem] md:text-[18rem] whitespace-nowrap font-black text-slate-100/50 tracking-tighter select-none">
                    MARKET DATA
                </h2>
            </motion.div>

            {/* MID-SCROLL SCANNING PANELS (Fills empty space 15%-35%) */}
            <motion.div
                style={{ opacity: initOpacity, scale: initScale }}
                className="absolute inset-0 flex items-center justify-between px-4 md:px-10 pointer-events-none w-full max-w-7xl mx-auto z-10 hidden md:flex"
            >
                {/* Left Panel */}
                <div className="w-64 bg-white/60 backdrop-blur-3xl border border-white/50 p-6 rounded-3xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)]">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
                            className="w-5 h-5 border-[3px] border-emerald-500 border-t-transparent rounded-full"
                        />
                    </div>
                    <h4 className="text-xs font-black text-slate-900 uppercase tracking-widest mb-1">Connecting Hubs</h4>
                    <p className="text-[10px] text-slate-500 font-bold mb-4 leading-relaxed">Initializing secure data link to provincial economic centers...</p>
                    <div className="space-y-2">
                        {[0, 1, 2].map((i) => (
                            <motion.div key={i} className="h-1.5 bg-slate-100 rounded-full overflow-hidden w-full">
                                <motion.div
                                    animate={{ x: ["-100%", "100%"] }}
                                    transition={{ repeat: Infinity, duration: 1.5, delay: i * 0.3, ease: "easeInOut" }}
                                    className="h-full bg-emerald-400 w-1/2 rounded-full"
                                />
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* Right Panel */}
                <div className="w-64 bg-white/60 backdrop-blur-3xl border border-white/50 p-6 rounded-3xl shadow-[0_20px_40px_-20px_rgba(0,0,0,0.1)] text-right flex flex-col items-end">
                    <motion.h4
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ repeat: Infinity, duration: 2 }}
                        className="text-4xl font-black text-slate-900 leading-none"
                    >
                        Live
                    </motion.h4>
                    <p className="text-[10px] font-black text-emerald-500 uppercase tracking-widest mt-2">Data Stream Active</p>
                    <p className="text-[10px] text-slate-500 font-bold mt-4 leading-relaxed line-clamp-3">
                        Cross-referencing historical market data. Preparing algorithmic price predictions based on supply metrics...
                    </p>
                    <div className="mt-4 flex gap-1 items-end h-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <motion.div
                                key={i}
                                animate={{ height: ["20%", "100%", "20%"] }}
                                transition={{ repeat: Infinity, duration: 1, delay: i * 0.1, ease: "easeInOut" }}
                                className="w-1.5 bg-emerald-300 rounded-t-sm"
                            />
                        ))}
                    </div>
                </div>
            </motion.div>
        </>
    );
}
