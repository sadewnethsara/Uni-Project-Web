"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
  Sprout,
  ArrowLeft,
  TrendingUp,
  ShieldCheck,
  Building2,
  Users,
  Award,
  Globe,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  MapPin,
} from "lucide-react";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";

export default function AboutPage() {
  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden select-none rounded-t-2xl"
      style={{
        background: `linear-gradient(165deg, ${ANALYZE_THEME.page} 0%, #efe4d4 48%, ${ANALYZE_THEME.page} 100%)`,
      }}
    >
      {/* Decorative Glows */}
      <div
        className="absolute top-10 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: ANALYZE_THEME.accentSoft }}
      />
      <div
        className="absolute bottom-10 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: "#d4e0d7" }}
      />

      {/* Top Header Navigation */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between relative z-20 mb-8">
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
            href="/login"
            className="text-xs font-bold px-4 py-2 rounded-xl border transition-all"
            style={{
              borderColor: ANALYZE_THEME.border,
              color: ANALYZE_THEME.ink,
              background: ANALYZE_THEME.surface,
            }}
          >
            Sign In
          </Link>
          <Link
            href="/signup"
            className="text-xs font-black px-4 py-2 rounded-xl text-white transition-all shadow-xs"
            style={{ background: ANALYZE_THEME.accent }}
          >
            Get Started
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto relative z-10 space-y-12 my-auto py-4">
        
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto space-y-4"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider mb-2"
            style={{
              background: ANALYZE_THEME.accentSoft,
              borderColor: `${ANALYZE_THEME.accent}40`,
              color: ANALYZE_THEME.accentInk,
            }}
          >
            <Sprout size={14} />
            <span>Empowering Sri Lankan Agriculture</span>
          </div>

          <h1
            className="text-3xl sm:text-5xl font-black tracking-tight leading-tight"
            style={{ color: ANALYZE_THEME.ink }}
          >
            Bridging the Gap Between <br />
            <span style={{ color: ANALYZE_THEME.accentInk }}>
              Economic Centers & Traders
            </span>
          </h1>

          <p
            className="text-sm sm:text-base font-medium leading-relaxed"
            style={{ color: ANALYZE_THEME.inkMuted }}
          >
            AgriLanka is Sri Lanka’s premier agricultural intelligence platform. We collect, standardise, and distribute real-time spot pricing across key economic hubs—helping farmers, buyers, and wholesalers make transparent commercial decisions.
          </p>
        </motion.div>

        {/* Impact Numbers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          <StatCard value="12+" label="Economic Hubs Monitored" icon={<MapPin size={18} />} />
          <StatCard value="2,450 MT" label="Daily Tonnage Tracked" icon={<TrendingUp size={18} />} />
          <StatCard value="12,000+" label="Active Network Users" icon={<Users size={18} />} />
          <StatCard value="99.4%" label="Price Index Accuracy" icon={<BarChart3 size={18} />} />
        </motion.div>

        {/* Core Pillars */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="space-y-6"
        >
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-black" style={{ color: ANALYZE_THEME.ink }}>
              Why AgriLanka Exists
            </h2>
            <p className="text-xs font-medium mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
              Built to solve market information asymmetry across the island.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <PillarCard
              icon={<TrendingUp size={22} />}
              title="Real-Time Price Discovery"
              description="Direct morning spot rates from Dambulla, Pettah, Keppetipola, and Narahenpita centers before trade execution."
            />
            <PillarCard
              icon={<ShieldCheck size={22} />}
              title="Verified Market Data"
              description="Multi-point validation on every price entry to prevent market manipulation and ensure reliable baseline indexes."
            />
            <PillarCard
              icon={<Globe size={22} />}
              title="Island-Wide Accessibility"
              description="Accessible via web terminal and instant SMS notifications, bridging digital and rural supply chains seamlessly."
            />
          </div>
        </motion.div>

        {/* Mission Statement Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className={`${PANEL_CLASS} p-6 sm:p-8 relative overflow-hidden`}
          style={{
            background: ANALYZE_THEME.surfaceRaised,
            borderColor: ANALYZE_THEME.border,
          }}
        >
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            <div className="lg:col-span-8 space-y-3">
              <span
                className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full inline-block"
                style={{
                  background: ANALYZE_THEME.accentSoft,
                  color: ANALYZE_THEME.accentInk,
                }}
              >
                Our Commitment
              </span>
              <h3 className="text-2xl font-black" style={{ color: ANALYZE_THEME.ink }}>
                Transforming agricultural commerce into a predictable, transparent ecosystem.
              </h3>
              <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                Whether you are a commercial buyer sourcing vegetable shipments or a producer planning your next harvest season, AgriLanka equips you with historical trends, price forecasts, and spot market visibility.
              </p>
            </div>

            <div className="lg:col-span-4 flex justify-start lg:justify-end">
              <Link
                href="/signup"
                className="w-full sm:w-auto px-6 py-3.5 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 text-white shadow-sm"
                style={{ background: ANALYZE_THEME.accent }}
              >
                <span>Join the Network</span>
                <ArrowRight size={16} />
              </Link>
            </div>
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function StatCard({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) {
  return (
    <div
      className={`${PANEL_CLASS} p-4 text-center flex flex-col items-center justify-center`}
      style={{
        background: ANALYZE_THEME.surfaceRaised,
        borderColor: ANALYZE_THEME.border,
      }}
    >
      <div className="p-2 rounded-xl mb-2" style={{ background: ANALYZE_THEME.accentSoft, color: ANALYZE_THEME.accentInk }}>
        {icon}
      </div>
      <p className="text-2xl sm:text-3xl font-black" style={{ color: ANALYZE_THEME.ink }}>
        {value}
      </p>
      <p className="text-[11px] font-bold mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
        {label}
      </p>
    </div>
  );
}

function PillarCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div
      className={`${PANEL_CLASS} p-6 flex flex-col justify-between space-y-4`}
      style={{
        background: ANALYZE_THEME.surfaceRaised,
        borderColor: ANALYZE_THEME.border,
      }}
    >
      <div className="p-3 rounded-2xl w-fit" style={{ background: ANALYZE_THEME.accentSoft, color: ANALYZE_THEME.accentInk }}>
        {icon}
      </div>
      <div>
        <h3 className="text-base font-black mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
          {title}
        </h3>
        <p className="text-xs font-medium leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
          {description}
        </p>
      </div>
    </div>
  );
}