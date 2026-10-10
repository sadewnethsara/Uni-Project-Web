"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ANALYZE_THEME } from "@/lib/chartTheme";

// Helper to slugify names for clean URLs
const slugify = (text: string) => text.toLowerCase().replace(/\s+/g, "-");

interface FloatingDockProps {
    locations: string[];
    activeLocation: string;
    onLocationChange?: (location: string) => void;
}

export default function FloatingNavigationDock({ locations, activeLocation, onLocationChange }: FloatingDockProps) {
    const router = useRouter();
    const scrollContainerRef = useRef<HTMLDivElement>(null);
    const activeItemRef = useRef<HTMLButtonElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    const scrollToTop = () => {
  const startPosition = window.scrollY;
  const duration = 1200; // milliseconds

  let startTime: number | null = null;

  const easeInOutCubic = (t: number) =>
    t < 0.5
      ? 4 * t * t * t
      : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const animateScroll = (currentTime: number) => {
    if (!startTime) startTime = currentTime;

    const elapsedTime = currentTime - startTime;
    const progress = Math.min(elapsedTime / duration, 1);

    const easedProgress = easeInOutCubic(progress);

    window.scrollTo({
      top: startPosition * (1 - easedProgress),
    });

    if (progress < 1) {
      requestAnimationFrame(animateScroll);
    }
  };

  requestAnimationFrame(animateScroll);
};

    // Monitor screen scroll positioning for the Back-to-Top button
    useEffect(() => {
        const handleScroll = () => setShowScrollButton(window.scrollY > 200);
        // ⚡ Bolt: Added passive: true to prevent scroll events from blocking the main thread, resulting in smoother scrolling.
        window.addEventListener("scroll", handleScroll, { passive: true });
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Automatically scroll the container to center the active selected item into view
    useEffect(() => {
        const timer = setTimeout(() => {
            if (scrollContainerRef.current && activeItemRef.current) {
                const container = scrollContainerRef.current;
                const activeChild = activeItemRef.current;

                const scrollLeftTarget =
                    activeChild.offsetLeft -
                    container.clientWidth / 2 +
                    activeChild.clientWidth / 2;

                container.scrollTo({
                    left: scrollLeftTarget,
                    behavior: "smooth"
                });
            }
        }, 50);

        return () => clearTimeout(timer);
    }, [activeLocation]);

    const handleLocationClick = (loc: string) => {
        if (onLocationChange) {
            onLocationChange(loc);
        } else {
            router.push(`/market/${slugify(loc)}`);
        }
    };

    return (
        <>
            {/* SCROLL TO TOP BUTTON (Stacked above Chat button on Mobile, Bottom-Left on Desktop) */}
            <div className="fixed right-4 md:right-auto md:left-7 bottom-40 md:bottom-6 z-50 pointer-events-none">
                <AnimatePresence>
                    {showScrollButton && (
                        <motion.button
                            onClick={scrollToTop}
                            initial={{ opacity: 0, scale: 0.7, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.7, y: 20 }}
                            whileHover={{ scale: 1.12 }}
                            whileTap={{ scale: 0.92 }}
                            transition={{ type: "spring", stiffness: 400, damping: 18 }}
                            className="pointer-events-auto flex items-center justify-center w-12 h-12 rounded-xl shadow-2xl cursor-pointer transition-colors focus:outline-none border"
                            style={{
                                background: ANALYZE_THEME.ink,
                                color: ANALYZE_THEME.surfaceRaised,
                                borderColor: "rgba(255,255,255,0.1)"
                            }}
                            aria-label="Scroll to top"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
                            </svg>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            {/* DOCK CONTAINER WITH AUTOMATIC ELEMENT VIEW ALIGNMENT */}
            <div className="fixed bottom-6 left-0 right-0 z-50 flex items-center justify-center px-4 pointer-events-none">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="pointer-events-auto flex items-center h-14 rounded-2xl shadow-2xl px-2 w-full md:w-2/3 lg:max-w-2xl overflow-hidden relative border"
                    style={{
                        background: ANALYZE_THEME.ink,
                        borderColor: "rgba(255,255,255,0.1)"
                    }}
                >
                    {/* Left Brand Identifier - Hidden on mobile */}
                    <div
                        className="hidden md:flex items-center justify-center h-10 px-3.5 rounded-xl font-black text-sm tracking-tight border flex-shrink-0 z-10"
                        style={{
                            background: ANALYZE_THEME.surfaceRaised,
                            color: ANALYZE_THEME.ink,
                            borderColor: "transparent"
                        }}
                    >
                        Agri.
                    </div>

                    {/* Core Navigation Slider Area */}
                    <div
                        ref={scrollContainerRef}
                        className="flex items-center gap-1.5 px-3 overflow-x-auto h-full scroll-smooth scrollbar-none flex-1"
                        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                    >
                        {locations.map((loc) => {
                            const isSelected = activeLocation === loc;
                            return (
                                <motion.button
                                    key={loc}
                                    ref={isSelected ? activeItemRef : null}
                                    onClick={() => handleLocationClick(loc)}
                                    whileHover={{ scale: 1.04 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="whitespace-nowrap px-3 py-2 rounded-lg border text-[12px] font-bold tracking-wide transition-all cursor-pointer focus:outline-none"
                                    style={{
                                        background: isSelected ? ANALYZE_THEME.surfaceRaised : "transparent",
                                        color: isSelected ? ANALYZE_THEME.ink : ANALYZE_THEME.surface,
                                        borderColor: isSelected ? "transparent" : "transparent",
                                        opacity: isSelected ? 1 : 0.7,
                                    }}
                                >
                                    {loc}
                                </motion.button>
                            );
                        })}
                    </div>
                </motion.div>
            </div>
        </>
    );
}