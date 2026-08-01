"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sprout,
  ArrowLeft,
  Home,
  LayoutDashboard,
  HelpCircle,
  Search,
  Compass,
} from "lucide-react";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";

export default function NotFound() {
  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden select-none"
      style={{
        background: `linear-gradient(165deg, ${ANALYZE_THEME.page} 0%, #efe4d4 48%, ${ANALYZE_THEME.page} 100%)`,
      }}
    >
      {/* Background Decorative Glows */}
      <div
        className="absolute top-10 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: ANALYZE_THEME.accentSoft }}
      />
      <div
        className="absolute bottom-10 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: "#d4e0d7" }}
      />

      {/* Header Navigation */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between relative z-20 mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs hover:bg-white/60"
          style={{
            background: ANALYZE_THEME.surface,
            borderColor: ANALYZE_THEME.border,
            color: ANALYZE_THEME.ink,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/faq"
            className="text-xs font-bold px-3.5 py-2 rounded-xl hover:underline"
            style={{ color: ANALYZE_THEME.inkMuted }}
          >
            Help Center
          </Link>
          <Link
            href="/contact"
            className="text-xs font-bold px-3.5 py-2 rounded-xl hover:underline"
            style={{ color: ANALYZE_THEME.inkMuted }}
          >
            Contact
          </Link>
        </div>
      </div>

      {/* Main Content Card */}
      <div className="w-full max-w-2xl mx-auto relative z-10 text-center space-y-6 my-auto py-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className={`${PANEL_CLASS} p-8 sm:p-12 shadow-xl space-y-6 relative`}
          style={{
            background: ANALYZE_THEME.surfaceRaised,
            borderColor: ANALYZE_THEME.border,
          }}
        >
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider mx-auto"
            style={{
              background: ANALYZE_THEME.accentSoft,
              borderColor: `${ANALYZE_THEME.accent}40`,
              color: ANALYZE_THEME.accentInk,
            }}
          >
            <Compass size={14} />
            <span>404 — Route Not Found</span>
          </div>

          {/* Big 404 Headline */}
          <div className="space-y-2">
            <h1
              className="text-6xl sm:text-7xl font-black tracking-tight"
              style={{ color: ANALYZE_THEME.ink }}
            >
              404
            </h1>
            <h2
              className="text-xl sm:text-2xl font-black"
              style={{ color: ANALYZE_THEME.ink }}
            >
              This page has moved or doesn't exist
            </h2>
            <p
              className="text-xs sm:text-sm font-medium max-w-md mx-auto leading-relaxed pt-1"
              style={{ color: ANALYZE_THEME.inkMuted }}
            >
              The market feed, route, or resource you are trying to access could not be located on the AgriLanka network.
            </p>
          </div>

          <hr style={{ borderColor: `${ANALYZE_THEME.border}80` }} />

          {/* Navigation Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <Link
              href="/"
              className="px-5 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 border shadow-xs hover:bg-white/80"
              style={{
                background: ANALYZE_THEME.surface,
                borderColor: ANALYZE_THEME.border,
                color: ANALYZE_THEME.ink,
              }}
            >
              <Home size={16} />
              <span>Go to Home Page</span>
            </Link>

            <Link
              href="/dashboard"
              className="px-5 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 text-white shadow-sm"
              style={{ background: ANALYZE_THEME.accent }}
            >
              <LayoutDashboard size={16} />
              <span>Open Terminal</span>
            </Link>
          </div>

          {/* Quick links footer inside card */}
          <div className="pt-2 flex items-center justify-center gap-4 text-xs font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
            <Link href="/faq" className="hover:underline flex items-center gap-1">
              <HelpCircle size={13} />
              <span>FAQ</span>
            </Link>
            <span>•</span>
            <Link href="/about" className="hover:underline">
              About Us
            </Link>
            <span>•</span>
            <Link href="/contact" className="hover:underline">
              Support Desk
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer Copyright */}
      <div
        className="w-full max-w-5xl mx-auto pt-6 text-center border-t text-xs font-semibold relative z-10"
        style={{ borderColor: `${ANALYZE_THEME.border}80`, color: ANALYZE_THEME.inkMuted }}
      >
        © {new Date().getFullYear()} AgriLanka Intelligence Network. All rights reserved.
      </div>
    </div>
  );
}