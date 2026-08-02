"use client";

import React from "react";
import { motion, MotionValue } from "framer-motion";
import Link from "next/link";
import { LocationData } from "./HeroData";

interface Props {
    panelOpacity: MotionValue<number>;
    sliderY: MotionValue<number>;
    locations: LocationData[];
}

export default function HeroSlider({ panelOpacity, sliderY, locations }: Props) {
    return (
        <motion.div
            style={{ opacity: panelOpacity, y: sliderY }}
            className="absolute bottom-4 sm:bottom-10 left-0 right-0 w-full overflow-hidden z-20 pointer-events-auto"
        >
            <motion.div
                animate={{ x: ["0%", "-50%"] }}
                transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
                className="flex gap-4 w-[200vw] px-8"
            >
                {/* Duplicate the array to allow for infinite smooth panning */}
                {[...locations, ...locations].map((loc, i) => (
                    <Link href={`/market/${loc.id}`} key={`${loc.id}-${i}`}>
                        <div className="relative w-56 sm:w-72 h-36 sm:h-48 rounded-2xl overflow-hidden shadow-[0_20px_40px_rgba(0,0,0,0.15)] shrink-0 border border-white/40 cursor-pointer group">
                            <img
                                src={loc.image}
                                alt={loc.name}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent transition-opacity group-hover:opacity-80" />

                            <div className="absolute bottom-5 left-5 right-5">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: loc.color }} />
                                    <h4 className="text-white font-black text-xs sm:text-sm uppercase tracking-wider truncate">{loc.name}</h4>
                                </div>
                                <p className="text-slate-300 font-bold text-[10px]">{loc.stat}</p>
                            </div>
                        </div>
                    </Link>
                ))}
            </motion.div>
        </motion.div>
    );
}
