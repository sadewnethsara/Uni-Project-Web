"use client";

import React from "react";
import { motion, MotionValue } from "framer-motion";
import Link from "next/link";
import { Button } from "../ui/Button";
import { Card, CardContent } from "../ui/Card";
import { LocationData } from "./HeroData";

interface Props {
    panelOpacity: MotionValue<number>;
    panelX: MotionValue<number>;
    panelScale?: MotionValue<number>;
    panelRotateY?: MotionValue<number>;
    panelRotateX?: MotionValue<number>;
    locations: LocationData[];
}

export default function HeroAnalyticsPanel({
    panelOpacity, panelX, panelScale, panelRotateY, panelRotateX, locations
}: Props) {
    return (
        <motion.div
            style={{
                opacity: panelOpacity,
                x: panelX,
                scale: panelScale,
                rotateY: panelRotateY,
                rotateX: panelRotateX,
                transformPerspective: 1400,
            }}
            className="absolute right-[2%] xl:right-[4%] top-[5%] xl:top-[7%] w-[540px] xl:w-[620px] z-30 pointer-events-auto hidden lg:block transition-shadow duration-500"
        >
            <Card className="bg-white/95 backdrop-blur-3xl rounded-3xl shadow-[0_32px_64px_-16px_rgba(0,0,0,0.18)] border border-white/80 overflow-hidden relative">
                {/* Subtle top accent gradient bar */}
                <div className="h-1.5 w-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-500" />

                <CardContent className="p-7 flex flex-col gap-5">
                    {/* Header with live telemetry badge */}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="relative flex items-center justify-center">
                                <div className="absolute inset-0 bg-emerald-500 rounded-full animate-ping opacity-30"></div>
                                <div className="relative w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm"></div>
                            </div>
                            <span className="font-extrabold text-slate-900 tracking-wider text-xs uppercase">
                                Real-Time Telemetry
                            </span>
                        </div>

                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-700 text-[10px] font-bold uppercase tracking-wider">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            ML Engine v4.2 Active
                        </span>
                    </div>

                    {/* Headline */}
                    <div>
                        <h3 className="font-black text-slate-900 text-2xl tracking-tight leading-tight">
                            Economic Center Intelligence
                        </h3>
                        <p className="text-slate-500 text-xs font-medium mt-1 leading-relaxed">
                            Machine-learning models process wholesale supply from 7 national economic hubs to predict market prices before opening bell.
                        </p>
                    </div>

                    {/* 4-Stat Grid */}
                    <div className="grid grid-cols-4 gap-2.5">
                        <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100/80 flex flex-col justify-between">
                            <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Active Nodes</p>
                            <p className="text-lg font-black text-slate-900 mt-1">7 Hubs</p>
                        </div>
                        <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100/80 flex flex-col justify-between">
                            <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Daily Volume</p>
                            <p className="text-lg font-black text-emerald-600 mt-1">2,210 T</p>
                        </div>
                        <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100/80 flex flex-col justify-between">
                            <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Price Index</p>
                            <p className="text-lg font-black text-teal-600 mt-1">-3.4%</p>
                        </div>
                        <div className="bg-slate-50/90 rounded-2xl p-3 border border-slate-100/80 flex flex-col justify-between">
                            <p className="text-[9px] uppercase font-extrabold text-slate-400 tracking-wider">Accuracy</p>
                            <p className="text-lg font-black text-emerald-700 mt-1">98.4%</p>
                        </div>
                    </div>

                    {/* Economic Hub Leaderboard */}
                    <div className="bg-slate-900 text-white rounded-2xl p-4 shadow-xl border border-slate-800 flex flex-col gap-3">
                        <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                            <span className="uppercase tracking-wider text-[10px] text-slate-400 font-extrabold">Top Volume Hubs</span>
                            <span className="text-[10px] font-mono text-emerald-400">● Live Feed</span>
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            {locations.slice(0, 4).map((loc) => (
                                <div key={loc.id} className="flex items-center justify-between p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/60">
                                    <div className="flex items-center gap-2 overflow-hidden">
                                        <div className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: loc.color }} />
                                        <div className="truncate">
                                            <p className="text-[11px] font-extrabold text-white truncate">{loc.name}</p>
                                            <p className="text-[9px] font-medium text-slate-400">{loc.items.join(", ")}</p>
                                        </div>
                                    </div>
                                    <span className="text-xs font-black text-emerald-400 shrink-0 font-mono ml-2">{loc.stat}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Prediction Highlight Banner */}
                    <div className="bg-gradient-to-r from-emerald-50 via-teal-50 to-cyan-50 rounded-2xl p-3.5 border border-emerald-200/60 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white font-bold flex items-center justify-center text-sm shadow-md shrink-0">
                                ⚡
                            </div>
                            <div>
                                <p className="text-xs font-extrabold text-slate-900">AI Market Insight</p>
                                <p className="text-[11px] text-slate-600 font-medium leading-tight">
                                    Keppetipola carrot influx (+18%) expected to ease Western Province retail prices.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Marquee Ticker */}
                    <div className="bg-slate-100 rounded-xl p-1.5 overflow-hidden relative border border-slate-200/70">
                        <div className="absolute top-0 right-0 w-16 h-full bg-gradient-to-l from-slate-100 to-transparent z-10 pointer-events-none" />
                        <div className="flex animate-marquee whitespace-nowrap">
                            {[...locations, ...locations].map((loc, i) => (
                                <div key={i} className="flex items-center gap-2 px-3 py-1 shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: loc.color }} />
                                    <span className="text-[10px] font-extrabold text-slate-800 uppercase tracking-wider">{loc.name}</span>
                                    <span className="text-[10px] font-bold text-emerald-600 font-mono">{loc.stat}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* CTA Actions */}
                    <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-3 w-full">
                            <Link href="/markets" className="grow">
                                <Button size="lg" className="w-full group relative overflow-hidden bg-slate-950 text-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 py-6">
                                    <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/15 to-transparent skew-x-12"></span>
                                    <span className="font-extrabold text-xs uppercase tracking-widest mr-2">Explore Markets</span>
                                    <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 transition-all duration-300 text-xs">→</span>
                                </Button>
                            </Link>

                            <Link href="/analytics">
                                <Button size="lg" variant="outline" className="px-5 py-6 rounded-xl border-slate-200 text-slate-700 font-extrabold text-xs uppercase tracking-wider hover:bg-slate-50 transition-all">
                                    Analytics
                                </Button>
                            </Link>
                        </div>
                    </div>

                    <p className="text-[10px] text-slate-400 font-medium text-center -mt-1">
                        Updated every 5 minutes • Telemetry synchronized across 7 economic hubs
                    </p>
                </CardContent>
            </Card>
        </motion.div>
    );
}
