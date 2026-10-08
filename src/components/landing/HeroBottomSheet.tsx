"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { LocationData, T } from "./HeroData";

// Note: Using pre-built UI components for consistent design system
// Images are handled via props from the parent to keep this component clean

interface Props {
    loc: LocationData | null;
    onClose: () => void;
    images: string[];
}

export default function HeroBottomSheet({ loc, onClose, images }: Props) {
    const [slide, setSlide] = useState(0);
    const [prevLocId, setPrevLocId] = useState(loc?.id);

    // Reset slide when location changes
    if (loc?.id !== prevLocId) {
        setPrevLocId(loc?.id);
        setSlide(0);
    }

    return (
        <>
            {/* Backdrop */}
            {loc && (
                <motion.div
                    className="fixed inset-0 z-[60] bg-black/25"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                />
            )}

            {/* Sheet */}
            <motion.div
                className="fixed bottom-0 left-0 right-0 z-[70] w-full lg:left-1/2 lg:-translate-x-1/2 lg:w-[50vw] rounded-t-[28px] overflow-hidden shadow-[0_-8px_60px_rgba(0,0,0,0.22)]"
                initial={{ y: '100vh' }}
                animate={{ y: loc ? '0vh' : '100vh' }}
                transition={{ type: 'spring', damping: 30, stiffness: 320 }}
                style={{ background: T.page }}
            >
                {loc && (
                    <div>
                        {/* ── Drag handle ── */}
                        <div className="flex justify-center pt-3 pb-1">
                            <div className="w-10 h-1 rounded-full" style={{ background: T.borderStrong }} />
                        </div>

                        {/* ── Carousel ── */}
                        <div className="relative h-52 mx-4 rounded-2xl overflow-hidden"
                            style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.18)' }}>
                            <AnimatePresence mode="wait">
                                <motion.img
                                    key={slide}
                                    src={images[slide]}
                                    alt={`${loc.name} ${slide + 1}`}
                                    className="absolute inset-0 w-full h-full object-cover"
                                    initial={{ opacity: 0, scale: 1.04 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.97 }}
                                    transition={{ duration: 0.38, ease: 'easeInOut' }}
                                />
                            </AnimatePresence>

                            {/* gradient overlay */}
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />

                            {/* close */}
                            <button onClick={onClose}
                                className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110"
                                style={{ background: 'rgba(0,0,0,0.45)' }}>
                                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* arrow prev */}
                            {images.length > 1 && (
                                <>
                                    <button onClick={() => setSlide((s) => (s - 1 + images.length) % images.length)}
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110"
                                        style={{ background: 'rgba(0,0,0,0.40)' }}>
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button onClick={() => setSlide((s) => (s + 1) % images.length)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center transition hover:scale-110"
                                        style={{ background: 'rgba(0,0,0,0.40)' }}>
                                        <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </>
                            )}

                            {/* dot indicators */}
                            {images.length > 1 && (
                                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 pointer-events-none">
                                    {images.map((_, i) => (
                                        <div key={i} className="rounded-full transition-all duration-300"
                                            style={{ width: i === slide ? 18 : 6, height: 6, background: i === slide ? '#fff' : 'rgba(255,255,255,0.45)' }} />
                                    ))}
                                </div>
                            )}

                            {/* name overlay */}
                            <div className="absolute bottom-5 left-4">
                                <div className="flex items-center gap-1.5 mb-1">
                                    <div className="w-2 h-2 rounded-full" style={{ background: loc.color }} />
                                    <span className="text-[10px] font-black uppercase tracking-widest" style={{ color: 'rgba(255,255,255,0.65)' }}>Agricultural Hub</span>
                                </div>
                                <h2 className="text-[22px] font-black text-white leading-tight tracking-tight">{loc.name}</h2>
                            </div>
                        </div>

                        {/* ── Body ── */}
                        <div className="px-4 pt-4 pb-6 space-y-4">

                            {/* Stats row */}
                            <div className="grid grid-cols-3 gap-2">
                                {[
                                    { label: 'Vol. / Day', value: loc.stat },
                                    { label: 'Commodities', value: String(loc.items.length) },
                                    { label: 'Status', value: 'Active' },
                                ].map(({ label, value }) => (
                                    <div key={label} className="rounded-xl px-3 py-3 border"
                                        style={{ background: T.surface, borderColor: T.border }}>
                                        <p className="text-[9px] font-black uppercase tracking-wider mb-1" style={{ color: T.inkFaint }}>{label}</p>
                                        <p className="text-base font-black" style={{ color: label === 'Vol. / Day' ? loc.color : T.ink }}>{value}</p>
                                    </div>
                                ))}
                            </div>

                            {/* Divider */}
                            <div className="border-t" style={{ borderColor: T.border }} />

                            {/* Commodities */}
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-widest mb-2" style={{ color: T.inkFaint }}>Key Commodities</p>
                                <div className="flex flex-wrap gap-2">
                                    {loc.items.map(item => (
                                        <span key={item}
                                            className="px-3 py-1.5 rounded-full text-[11px] font-bold border"
                                            style={{ color: loc.color, borderColor: loc.color + '50', background: loc.color + '12' }}>
                                            {item}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Info paragraph */}
                            <p className="text-[12px] leading-relaxed" style={{ color: T.inkMuted }}>
                                {loc.name} is a key agricultural distribution hub in Sri Lanka, facilitating wholesale trade for regional farmers and buyers. Real-time price analytics are available on the market page.
                            </p>

                            {/* CTA */}
                            <Link
                                href={`/market/${loc.id}`}
                                onClick={onClose}
                                className="flex items-center justify-center gap-2.5 w-full py-3.5 rounded-2xl font-black text-[13px] uppercase tracking-widest text-white transition-all active:scale-[0.98] hover:brightness-110"
                                style={{ background: `linear-gradient(135deg, ${loc.color}, ${T.accent})`, boxShadow: `0 4px 20px ${loc.color}55` }}
                            >
                                View {loc.name} Market
                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </Link>
                        </div>
                    </div>
                )}
            </motion.div>
        </>
    );
}
