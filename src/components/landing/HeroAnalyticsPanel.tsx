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
    locations: LocationData[];
}

export default function HeroAnalyticsPanel({ panelOpacity, panelX, locations }: Props) {
    return (
        <motion.div
            style={{ opacity: panelOpacity, x: panelX }}
            className="absolute right-[3%] top-[12%] w-full max-w-xl z-30 pointer-events-auto hidden lg:block"
        >
            <Card className="bg-white/90 backdrop-blur-2xl rounded-2xl shadow-lg border-none">
                <CardContent className="px-6 py-8 flex flex-col gap-6">
                    {/* Header with live badge */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex items-center justify-center">
                            <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20"></div>
                            <div className="relative w-3 h-3 bg-red-500 rounded-full border border-white"></div>
                        </div>
                        <h3 className="font-black text-slate-900 tracking-tight text-lg">Live Market Intelligence</h3>
                    </div>

                    <p className="text-slate-500 text-sm leading-relaxed border-l-2 border-emerald-500 pl-3">
                        Machine-learning algorithms analyze real-time supply from 7 major economic centers to predict price volatility for tomorrow's market open.
                    </p>

                    {/* Stats mini-grid */}
                    <div className="grid grid-cols-2 gap-3 mt-2">
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <p className="text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Active Nodes</p>
                            <p className="text-xl font-black text-slate-800">7 Centers</p>
                        </div>
                        <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <p className="text-[9px] uppercase font-bold text-slate-400 mb-1 tracking-widest">Total Volume</p>
                            <p className="text-xl font-black text-emerald-600">2,210 Tons</p>
                        </div>
                    </div>

                    {/* Trend list */}
                    <div className="bg-slate-900 rounded-xl p-1 overflow-hidden relative shadow-inner">
                        <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />
                        <div className="flex animate-marquee whitespace-nowrap">
                            {[...locations, ...locations].map((loc, i) => (
                                <div key={i} className="flex items-center gap-2 px-4 py-2 shrink-0">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: loc.color }} />
                                    <span className="text-[10px] font-bold text-white uppercase tracking-wider">{loc.name}</span>
                                    <span className="text-[10px] font-mono text-slate-400">{loc.stat}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    {/* CTA button – vertical placement */}
                    <div className="flex flex-col items-start mt-2">
                        <Link href="/markets">
                            <Button size="lg" className="group relative overflow-hidden bg-slate-950 text-white rounded-xl shadow-md hover:shadow-lg transition px-5 py-6">
                                <span className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-gradient-to-r from-transparent via-white/10 to-transparent skew-x-12"></span>
                                <span className="font-black text-sm uppercase tracking-widest mr-2">Explore Markets</span>
                                <span className="w-6 h-6 rounded-lg bg-white/10 flex items-center justify-center group-hover:bg-emerald-500 transition-all duration-300 text-sm">→</span>
                            </Button>
                        </Link>
                        <p className="mt-2 text-[10px] text-slate-400">Free • Updated daily • 7 hubs</p>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
