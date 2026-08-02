"use client";

import React from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const stats = [
  { label: "Markets Tracked", value: "48+", icon: "🏪" },
  { label: "Live Prices", value: "1,200+", icon: "📊" },
  { label: "Farmers", value: "12,000+", icon: "🌾" },
];

const prices = [
  { name: "Carrot", hub: "Keppetipola", price: "Rs. 240/kg", change: "-12%", up: false },
  { name: "Tomato", hub: "Dambulla", price: "Rs. 380/kg", change: "+8%", up: true },
  { name: "Beans", hub: "Nuwara Eliya", price: "Rs. 520/kg", change: "-5%", up: false },
];

export default function MobileHero() {
  return (
    <section className="md:hidden min-h-[100svh] flex flex-col justify-between px-5 pt-8 pb-10 bg-[#fdf6e3] relative overflow-hidden">
      {/* Soft background blobs — lightweight, CSS only */}
      <div className="absolute -top-20 -right-20 w-64 h-64 bg-emerald-100/60 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 -left-16 w-52 h-52 bg-teal-100/50 rounded-full blur-3xl pointer-events-none" />

      {/* Top: Badge + Headline */}
      <div className="relative z-10 mt-4">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-bold uppercase tracking-widest mb-5"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          Sri Lanka&apos;s #1 Agri Platform
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-[2.8rem] font-black tracking-tighter text-slate-900 leading-[0.92] mb-4"
        >
          Market<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
            Intelligence.
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-sm text-slate-500 font-medium leading-relaxed max-w-xs"
        >
          Live vegetable prices across Sri Lanka&apos;s economic centers — for farmers, traders & consumers.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex gap-3 mt-6"
        >
          <Link
            href="/markets/dambulla"
            className="flex-1 flex items-center justify-center gap-2 bg-slate-900 text-white text-sm font-bold px-5 py-3 rounded-2xl shadow-md active:scale-95 transition-transform"
          >
            View Markets
          </Link>
          <Link
            href="/signup"
            className="flex-1 flex items-center justify-center gap-2 bg-white text-slate-900 text-sm font-bold px-5 py-3 rounded-2xl border border-slate-200 shadow-sm active:scale-95 transition-transform"
          >
            Get Started
          </Link>
        </motion.div>
      </div>

      {/* Live Price Cards */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="relative z-10 space-y-2.5 mt-8"
      >
        <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-3">Live Prices Today</p>
        {prices.map((p, i) => (
          <div
            key={i}
            className="flex items-center justify-between bg-white/70 backdrop-blur-sm border border-white/80 rounded-2xl px-4 py-3 shadow-sm"
          >
            <div>
              <p className="text-sm font-black text-slate-900">{p.name}</p>
              <p className="text-[10px] font-bold text-slate-400">{p.hub}</p>
            </div>
            <div className="text-right">
              <p className="text-sm font-black text-slate-900">{p.price}</p>
              <p className={`text-[11px] font-bold ${p.up ? "text-rose-500" : "text-emerald-500"}`}>
                {p.change} today
              </p>
            </div>
          </div>
        ))}
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.55 }}
        className="relative z-10 flex justify-between mt-6 bg-white/60 border border-white/80 rounded-2xl px-4 py-3 shadow-sm"
      >
        {stats.map((s, i) => (
          <div key={i} className="flex flex-col items-center text-center gap-0.5">
            <span className="text-lg">{s.icon}</span>
            <span className="text-sm font-black text-slate-900">{s.value}</span>
            <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider">{s.label}</span>
          </div>
        ))}
      </motion.div>
    </section>
  );
}
