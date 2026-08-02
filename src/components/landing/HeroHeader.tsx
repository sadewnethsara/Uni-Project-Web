"use client";

import React from "react";
import { motion, MotionValue } from "framer-motion";

interface Props {
    introDisplay: MotionValue<string>;
    introOpacity: MotionValue<number>;
    introScale: MotionValue<number>;
    introPointer: MotionValue<string>;
    cardsOpacity: MotionValue<number>;
    cardsY: MotionValue<number>;
}

export default function HeroHeader({
    introDisplay, introOpacity, introScale, introPointer, cardsOpacity, cardsY
}: Props) {
    return (
        <motion.div
            style={{ opacity: introOpacity, scale: introScale, pointerEvents: introPointer as any, display: introDisplay }}
            className="absolute inset-0 flex flex-col items-center justify-center text-center px-6 z-50 w-full max-w-7xl mx-auto"
        >
            {/* Floating Cards to fill empty space */}
            <motion.div
                style={{ opacity: cardsOpacity, y: cardsY }}
                className="absolute inset-0 pointer-events-none hidden lg:block"
            >
                {/* Card 1: Top Left */}
                <motion.div
                    animate={{ y: [0, -15, 0] }} transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                    className="absolute top-[20%] left-[5%] bg-white/60 backdrop-blur-xl border border-white/40 p-4 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex items-center gap-4"
                >
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-600 font-bold text-xl">🥕</div>
                    <div className="text-left">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Keppetipola</p>
                        <p className="text-sm font-black text-slate-900">Carrot - Rs. 240/kg</p>
                        <p className="text-xs font-bold text-emerald-500 mt-0.5 flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                            -12% today
                        </p>
                    </div>
                </motion.div>

                {/* Card 2: Bottom Right */}
                <motion.div
                    animate={{ y: [0, 15, 0] }} transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
                    className="absolute bottom-[30%] right-[3%] bg-white/60 backdrop-blur-xl border border-white/40 p-4 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex items-center gap-4"
                >
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Prediction</p>
                        <p className="text-sm font-black text-slate-900">Tomato Trend</p>
                        <p className="text-xs font-bold text-rose-500 mt-0.5 flex items-center justify-end gap-1">
                            Expected +15%
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" /></svg>
                        </p>
                    </div>
                    <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center text-rose-600 font-bold text-xl">🍅</div>
                </motion.div>

                {/* Card 3: Top Right */}
                <motion.div
                    animate={{ y: [0, -10, 0] }} transition={{ repeat: Infinity, duration: 7, ease: "easeInOut", delay: 2 }}
                    className="absolute top-[18%] right-[8%] bg-white/60 backdrop-blur-xl border border-white/40 p-4 rounded-3xl shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] flex flex-col items-start gap-2"
                >
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Market Compare</p>
                    <div className="flex gap-4">
                        <div>
                            <p className="text-xs font-bold text-slate-600">Dambulla</p>
                            <p className="text-sm font-black text-slate-900">450/kg</p>
                        </div>
                        <div className="w-px bg-slate-200" />
                        <div>
                            <p className="text-xs font-bold text-slate-600">Colombo</p>
                            <p className="text-sm font-black text-slate-900">520/kg</p>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1 }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-emerald-50/80 backdrop-blur-md border border-emerald-200/50 text-emerald-700 text-xs font-bold uppercase tracking-[0.2em] mb-10 shadow-sm"
            >
                Sri Lanka's #1 Agri-Market Platform
            </motion.div>
            <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.1 }}
                className="text-[4rem] md:text-[7rem] lg:text-[8rem] font-black tracking-tighter text-slate-900 leading-[0.9]"
            >
                Market <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
                    Intelligence.
                </span>
            </motion.h1>
            <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 0.2 }}
                className="mt-8 max-w-2xl text-lg md:text-xl text-slate-500 font-medium leading-relaxed"
            >
                Track daily vegetable prices, compare regional economic centers, and predict future trends with AI-driven analytics. Designed for farmers, traders, and everyday consumers.
            </motion.p>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="mt-16 flex flex-col items-center gap-4"
            >
                <span className="text-xs font-extrabold uppercase tracking-[0.3em] text-slate-400">Scroll to Explore</span>
                <div className="w-[1px] h-16 bg-gradient-to-b from-emerald-300 to-transparent" />
            </motion.div>
        </motion.div>
    );
}
