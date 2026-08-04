"use client";

import React, { useRef, useState } from "react";
import { useScroll, useTransform } from "framer-motion";
import AppShowcase from "@/components/landing/AppShowcase";
import LandingFooter from "@/components/landing/LandingFooter";
import ScrollProgress from "@/components/landing/ScrollProgress";
import MobileHero from "@/components/landing/MobileHero";

// Import new Hero sub-components
import { locations, LocationData } from "@/components/landing/HeroData";
import HeroBackground from "@/components/landing/HeroBackground";
import HeroHeader from "@/components/landing/HeroHeader";
import HeroMap from "@/components/landing/HeroMap";
import HeroAnalyticsPanel from "@/components/landing/HeroAnalyticsPanel";
import HeroBottomSheet from "@/components/landing/HeroBottomSheet";
import Newsletter from "@/components/NewsletterSection";

// Images for bottom sheet
const CAROUSEL_IMAGES: Record<string, string[]> = {
    thambuththegama: [
        "https://images.unsplash.com/photo-1573246123716-6b1782bc49ca?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1506484381205-f7945653044d?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800",
    ],
    veyangoda: [
        "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800",
    ],
    meegoda: [
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1573246123716-6b1782bc49ca?auto=format&fit=crop&q=80&w=800",
    ],
    manning: [
        "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1601493700631-2b16ec4b4716?auto=format&fit=crop&q=80&w=800",
    ],
    dambulla: [
        "https://images.unsplash.com/photo-1488459716781-31db52582fe9?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1596199050105-6d5d32222916?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=800",
    ],
    keppetipola: [
        "https://images.unsplash.com/photo-1596199050105-6d5d32222916?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1519999482648-25049ddd37b1?auto=format&fit=crop&q=80&w=800",
    ],
    "nuwara-eliya": [
        "https://images.unsplash.com/photo-1576085898323-218337e3e43c?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&q=80&w=800",
        "https://images.unsplash.com/photo-1596199050105-6d5d32222916?auto=format&fit=crop&q=80&w=800",
    ],
};

export default function Home() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [selectedLoc, setSelectedLoc] = useState<LocationData | null>(null);

    // Setup scroll interactions for the Hero section
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ["start start", "end end"]
    });

    // Intro Title Hooks (0% -> 15%)
    const introDisplay = useTransform(scrollYProgress, [0, 0.15], ["flex", "none"]);
    const introOpacity = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]);
    const introScale = useTransform(scrollYProgress, [0, 0.15], [1, 0.9]);
    const introPointer = useTransform(scrollYProgress, [0, 0.15], ["auto", "none"]);
    const cardsOpacity = useTransform(scrollYProgress, [0, 0.1, 0.15], [1, 1, 0]);
    const cardsY = useTransform(scrollYProgress, [0, 0.15], [0, -50]);

    // Map Base Drawing (15% -> 30%)
    const mapOpacity = useTransform(scrollYProgress, [0.18, 0.25, 0.95, 1], [0, 1, 1, 0]);
    const initialBgOpacity = useTransform(scrollYProgress, [0.12, 0.18], [1, 0]);
    const initialBgDisplay = useTransform(scrollYProgress, [0.12, 0.18], ["block", "none"]);
    const outlinePathLength = useTransform(scrollYProgress, [0.15, 0.3], [0, 1]);

    // Mid-Scroll Initialization Panels (15% -> 35%)
    const initOpacity = useTransform(scrollYProgress, [0.15, 0.2, 0.3, 0.4], [0, 1, 1, 0]);
    const initScale = useTransform(scrollYProgress, [0.15, 0.4], [0.95, 1.05]);
    const initY = useTransform(scrollYProgress, [0.1, 0.4], [100, -100]);
    const baseMapOpacity = useTransform(scrollYProgress, [0.12, 0.18], [0, 1]);

    // Map Shift & 3D Motion transforms for scrolling
    const mapX = useTransform(scrollYProgress, [0.85, 0.92], ["0%", "-24%"]);
    const mapY = useTransform(scrollYProgress, [0.85, 0.92], ["0%", "0%"]);
    const mapScale = useTransform(scrollYProgress, [0.85, 0.92], [1, 0.92]);
    const mapRotateY = useTransform(scrollYProgress, [0.85, 0.92], [0, -6]);

    const panelOpacity = useTransform(scrollYProgress, [0.85, 0.92, 0.98, 1], [0, 1, 1, 0]);
    const panelX = useTransform(scrollYProgress, [0.85, 0.92], [120, 0]);
    const panelScale = useTransform(scrollYProgress, [0.85, 0.92], [0.88, 1]);
    const panelRotateY = useTransform(scrollYProgress, [0.85, 0.92], [18, 0]);
    const panelRotateX = useTransform(scrollYProgress, [0.85, 0.92], [8, 0]);

    const waterOpacity = useTransform(scrollYProgress, [0.12, 0.22, 0.75, 0.85], [0, 1, 1, 0]);

    return (
        <div className="w-full relative text-slate-900">
            {/* MOBILE HERO — shown only on small screens */}
            <MobileHero />

            {/* DESKTOP SCROLL HERO — hidden on mobile */}
            <div className="hidden md:block">
            <ScrollProgress />

            {/* HERO SCROLL AREA */}
            <div ref={containerRef} className="relative w-full">

                {/* STICKY CONTAINER FOR HERO */}
                <div className="sticky top-0 h-screen w-full flex items-center justify-center overflow-hidden z-10 pointer-events-none">

                    <HeroBackground
                        initialBgOpacity={initialBgOpacity}
                        initialBgDisplay={initialBgDisplay}
                        initOpacity={initOpacity}
                        initY={initY}
                        initScale={initScale}
                    />

                    <HeroHeader
                        introDisplay={introDisplay}
                        introOpacity={introOpacity}
                        introScale={introScale}
                        introPointer={introPointer}
                        cardsOpacity={cardsOpacity}
                        cardsY={cardsY}
                    />

                    <HeroMap
                        mapOpacity={mapOpacity}
                        mapX={mapX}
                        mapY={mapY}
                        mapScale={mapScale}
                        mapRotateY={mapRotateY}
                        waterOpacity={waterOpacity}
                        baseMapOpacity={baseMapOpacity}
                        outlinePathLength={outlinePathLength}
                        scrollYProgress={scrollYProgress}
                        locations={locations}
                        onLocationClick={setSelectedLoc}
                    />

                    <HeroAnalyticsPanel
                        panelOpacity={panelOpacity}
                        panelX={panelX}
                        panelScale={panelScale}
                        panelRotateY={panelRotateY}
                        panelRotateX={panelRotateX}
                        locations={locations}
                    />

                </div>

                {/* BOTTOM SHEET MODAL */}
                <HeroBottomSheet
                    loc={selectedLoc}
                    onClose={() => setSelectedLoc(null)}
                    images={selectedLoc ? (CAROUSEL_IMAGES[selectedLoc.id] ?? [selectedLoc.image]) : []}
                />

                {/* TALL SCROLL AREA TO DRIVE THE HERO ANIMATIONS */}
                <div className="h-[1200vh] w-full relative pointer-events-none" />
            </div>{/* end HERO SCROLL AREA */}
            </div>{/* end desktop scroll hero */}

            {/* REST OF THE LANDING PAGE */}
            <AppShowcase />
            <Newsletter />
            <LandingFooter />
        </div>
    );
}