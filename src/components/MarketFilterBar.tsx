"use client";

import { useState } from "react";

export default function MarketFilterBar() {
    const [selectedMarket, setSelectedMarket] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("");
    const [selectedCrop, setSelectedCrop] = useState("");
    const [selectedTrend, setSelectedTrend] = useState("");

    const activeCount = [selectedMarket, selectedCategory, selectedCrop, selectedTrend].filter(Boolean).length;

    const handleReset = () => {
        setSelectedMarket("");
        setSelectedCategory("");
        setSelectedCrop("");
        setSelectedTrend("");
    };

    return (
        /* 1. Changed max-w-6xl to w-full to stretch edge-to-edge */
        <div className="w-full mt-10">
            {/* 2. Container row stretches completely, border matches clean screenshot style */}
            <div className="bg-white/80 backdrop-blur-md border border-slate-200/60 shadow-xs rounded-xl p-3 flex flex-col md:flex-row md:items-center justify-between gap-4 w-full">

                {/* Left Hand: Dropdown Filters Stack */}
                <div className="flex flex-wrap items-center gap-2">

                    {/* Filter 1: Economic Centre Selection */}
                    <div className="relative">
                        <select
                            aria-label="Select Market"
                            value={selectedMarket}
                            onChange={(e) => setSelectedMarket(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold px-4 py-2.5 pr-8 rounded-lg cursor-pointer transition-colors outline-none focus:border-emerald-500"
                        >
                            <option value="">All Markets</option>
                            <option value="dambulla">Dambulla (දඹුල්ල)</option>
                            <option value="kappetipola">Kappetipola (කැප්පෙටිපොළ)</option>
                            <option value="meegoda">Meegoda</option>
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                        </div>
                    </div>

                    {/* Filter 2: Crop Category */}
                    <div className="relative">
                        <select
                            aria-label="Select Category"
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold px-4 py-2.5 pr-8 rounded-lg cursor-pointer transition-colors outline-none focus:border-emerald-500"
                        >
                            <option value="">All Categories</option>
                            <option value="upcountry">Up-Country Vegetables</option>
                            <option value="lowcountry">Low-Country Vegetables</option>
                            <option value="tubers">Tubers / Potatoes</option>
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                        </div>
                    </div>

                    {/* Filter 3: Specific High-Yield Crops */}
                    <div className="relative">
                        <select
                            aria-label="Select Crop"
                            value={selectedCrop}
                            onChange={(e) => setSelectedCrop(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold px-4 py-2.5 pr-8 rounded-lg cursor-pointer transition-colors outline-none focus:border-emerald-500"
                        >
                            <option value="">Select Crop</option>
                            <option value="carrot">Carrot (කැරට්)</option>
                            <option value="leeks">Leeks (ලීක්ස්)</option>
                            <option value="potato">Local Potato (අර්තාපල්)</option>
                            <option value="chilli">Green Chilli (අමු මිරිස්)</option>
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                        </div>
                    </div>

                    {/* Filter 4: AI Prediction Trend Direction */}
                    <div className="relative">
                        <select
                            aria-label="Select Trend Direction"
                            value={selectedTrend}
                            onChange={(e) => setSelectedTrend(e.target.value)}
                            className="appearance-none bg-slate-50 border border-slate-200 hover:border-slate-300 text-slate-700 text-xs font-semibold px-4 py-2.5 pr-8 rounded-lg cursor-pointer transition-colors outline-none focus:border-emerald-500"
                        >
                            <option value="">Forecast Trend</option>
                            <option value="up">Price Rising 📈</option>
                            <option value="stable">Stable Price 📊</option>
                            <option value="down">Price Dropping 📉</option>
                        </select>
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                        </div>
                    </div>

                </div>

                {/* Right Hand: Count Badge & Reset */}
                <div className="flex items-center justify-end gap-3 border-t md:border-t-0 pt-2 md:pt-0 border-slate-100">
                    {activeCount > 0 && (
                        <span className="w-5 h-5 bg-[#f97316] text-white text-[11px] font-bold rounded-full flex items-center justify-center shadow-xs">
                            {activeCount}
                        </span>
                    )}

                    <button
                        aria-label="Reset filters"
                        onClick={handleReset}
                        disabled={activeCount === 0}
                        className={`flex items-center gap-1.5 px-3 py-2 text-xs font-bold rounded-lg transition-colors border select-none cursor-pointer
              ${activeCount > 0
                                ? "bg-white border-slate-200 text-slate-700 hover:bg-slate-50 focus:outline-none"
                                : "bg-slate-50 border-slate-100 text-slate-300 cursor-not-allowed"
                            }`}
                    >
                        Reset filters
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 15L3 9m0 0l6-6M3 9h12a6 6 0 010 12h-3" />
                        </svg>
                    </button>
                </div>

            </div>
        </div>
    );
}