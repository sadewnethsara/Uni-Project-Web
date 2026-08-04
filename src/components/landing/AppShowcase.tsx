"use client";

import { motion, useInView, Variants } from "framer-motion";
import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

// ─── Design Tokens ───────────────────────────────────────────────────────────
const T = {
  page: "#fdf6e3",
  surface: "#ffffff",
  ink: "#1a1a18",
  inkMuted: "#6b6b5c",
  inkFaint: "#a8a89a",
  accent: "#0d9488",       // teal-600
  accentSoft: "#ccfbf1",   // teal-100
  accentInk: "#0f766e",    // teal-700
  up: "#059669",
  down: "#e11d48",
  border: "#e8e0cc",
};

// ─── Stats data ───────────────────────────────────────────────────────────────
const STATS = [
  { value: "48+",     label: "Economic Centers" },
  { value: "1,200+",  label: "Live Price Points" },
  { value: "12,000+", label: "Active Farmers" },
  { value: "7",       label: "Provinces Covered" },
];

// ─── Feature bullets ─────────────────────────────────────────────────────────
const MARKET_BULLETS = [
  "Wholesale prices updated every session",
  "Side-by-side comparison: today vs yesterday vs last year",
  "Filter by vegetable, market, or date range",
  "Works on any device — no expertise needed",
];

const ANALYTICS_BULLETS = [
  "Candlestick & line charts across multiple markets",
  "AI-generated 30-day price forecasts per commodity",
  "Cross-market correlation & arbitrage insights",
  "Custom date ranges with historical trend overlays",
];

// ─── How It Works steps ───────────────────────────────────────────────────────
const HOW_STEPS = [
  {
    step: "01",
    title: "Browse the Market Board",
    desc: "Select any economic center — Dambulla, Manning, Keppetipola and more. See all vegetables with live wholesale prices in one clean view.",
    icon: "🏪",
  },
  {
    step: "02",
    title: "Analyse Price Trends",
    desc: "Dive into charts, spot seasonality, compare markets side-by-side and let our AI highlight the signals that matter most.",
    icon: "📈",
  },
  {
    step: "03",
    title: "Make Smarter Decisions",
    desc: "Time your buy or sell with confidence. Share insights with your team, export data, or query our AI in plain language.",
    icon: "✅",
  },
];

// ─── Testimonials ─────────────────────────────────────────────────────────────
const TESTIMONIALS = [
  {
    quote: "Before AgriLanka I was guessing prices based on word of mouth. Now I check the board every morning and negotiate from a position of knowledge.",
    name: "Chaminda Perera",
    role: "Vegetable Trader · Dambulla",
    initials: "CP",
    color: "#0d9488",
  },
  {
    quote: "The AI price prediction for carrots in Keppetipola was within 3% of the actual market close. I've never seen anything like this for Sri Lankan agriculture.",
    name: "Dilani Rathnayake",
    role: "Farmer · Nuwara Eliya",
    initials: "DR",
    color: "#7c3aed",
  },
  {
    quote: "My wholesale buyers now call me because I know the prices before they do. AgriLanka completely changed how I run my supply chain.",
    name: "Suresh Bandara",
    role: "Produce Exporter · Colombo",
    initials: "SB",
    color: "#d97706",
  },
];

// ─── Animation variants ───────────────────────────────────────────────────────
const EASE = [0.22, 1, 0.36, 1] as [number, number, number, number];

const fadeUp: Variants = {
  hidden: { opacity: 0, y: 32 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, delay: i * 0.12, ease: EASE },
  }),
};

const fadeLeft: Variants = {
  hidden: { opacity: 0, x: -48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

const fadeRight: Variants = {
  hidden: { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: EASE } },
};

// ─── Browser Frame wrapper ─────────────────────────────────────────────────────
function BrowserFrame({
  src,
  alt,
  url,
}: {
  src: string;
  alt: string;
  url: string;
}) {
  return (
    <div className="relative w-full">
      {/* Glow halo */}
      <div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        style={{
          background: `radial-gradient(ellipse at 50% 0%, ${T.accentSoft}80 0%, transparent 70%)`,
          filter: "blur(32px)",
          transform: "translateY(12px) scale(0.92)",
        }}
      />
      {/* The frame */}
      <div
        className="relative rounded-2xl overflow-hidden shadow-[0_32px_64px_-16px_rgba(0,0,0,0.22),0_0_0_1px_rgba(0,0,0,0.06)]"
        style={{ background: T.surface }}
      >
        {/* Chrome top bar */}
        <div
          className="flex items-center gap-3 px-4 py-3 border-b"
          style={{ background: "#f5f0e8", borderColor: T.border }}
        >
          {/* Traffic lights */}
          <div className="flex items-center gap-1.5">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <div className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          {/* URL bar */}
          <div
            className="flex-1 mx-2 flex items-center gap-2 px-3 py-1 rounded-md text-xs font-mono truncate"
            style={{ background: T.surface, color: T.inkFaint, border: `1px solid ${T.border}` }}
          >
            <svg className="w-3 h-3 shrink-0" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            </svg>
            {url}
          </div>
          {/* Live pill */}
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest shrink-0"
            style={{ background: T.accentSoft, color: T.accentInk }}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-pulse" />
            Live
          </div>
        </div>

        {/* Screenshot */}
        <div className="w-full overflow-hidden" style={{ maxHeight: "520px" }}>
          <Image
            src={src}
            alt={alt}
            width={1200}
            height={900}
            className="w-full object-cover object-top"
            priority
          />
        </div>
      </div>
    </div>
  );
}

// ─── Section label ────────────────────────────────────────────────────────────
function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span
      className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-[0.18em]"
      style={{ background: T.accentSoft, color: T.accentInk }}
    >
      {children}
    </span>
  );
}

// ─── Feature bullet list ─────────────────────────────────────────────────────
function BulletList({ items }: { items: string[] }) {
  return (
    <ul className="space-y-3">
      {items.map((item, i) => (
        <motion.li
          key={i}
          custom={i}
          variants={fadeUp}
          className="flex items-start gap-3 text-sm leading-relaxed"
          style={{ color: T.ink }}
        >
          <div
            className="mt-0.5 w-5 h-5 rounded-full flex items-center justify-center shrink-0"
            style={{ background: T.accentSoft }}
          >
            <svg
              className="w-3 h-3"
              style={{ color: T.accentInk }}
              fill="none"
              stroke="currentColor"
              strokeWidth={2.5}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          {item}
        </motion.li>
      ))}
    </ul>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────
export default function AppShowcase() {
  const statsRef = useRef(null);
  const marketRef = useRef(null);
  const analyticsRef = useRef(null);
  const howRef = useRef(null);
  const testiRef = useRef(null);
  const ctaRef = useRef(null);

  const statsInView    = useInView(statsRef,     { once: true, amount: 0.3 });
  const marketInView   = useInView(marketRef,    { once: true, amount: 0.15 });
  const analyticsInView = useInView(analyticsRef, { once: true, amount: 0.15 });
  const howInView      = useInView(howRef,       { once: true, amount: 0.2 });
  const testiInView    = useInView(testiRef,     { once: true, amount: 0.2 });
  const ctaInView      = useInView(ctaRef,       { once: true, amount: 0.3 });

  return (
    <div style={{ background: T.page }}>

      {/* ━━━━━━━━━━━━━━━━━ 1. STATS BAR ━━━━━━━━━━━━━━━━━ */}
      <section
        ref={statsRef}
        className="relative border-y"
        style={{ borderColor: T.border, background: T.surface }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
          <motion.div
            initial="hidden"
            animate={statsInView ? "visible" : "hidden"}
            className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-0 md:divide-x"
            style={{ "--tw-divide-opacity": 1 } as React.CSSProperties}
          >
            {STATS.map((s, i) => (
              <motion.div
                key={i}
                custom={i}
                variants={fadeUp}
                className="flex flex-col items-center text-center px-4"
              >
                <span
                  className="text-5xl font-black tracking-tighter"
                  style={{ color: T.ink }}
                >
                  {s.value}
                </span>
                <span
                  className="mt-1 text-xs font-bold uppercase tracking-widest"
                  style={{ color: T.inkFaint }}
                >
                  {s.label}
                </span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━ 2. MARKET PAGE SHOWCASE ━━━━━━━━━━━━━━━━━ */}
      <section
        ref={marketRef}
        className="py-24 lg:py-36 px-6 lg:px-8 overflow-hidden"
        style={{ background: T.page }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section header — centred */}
          <motion.div
            initial="hidden"
            animate={marketInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <SectionLabel>Market Intelligence</SectionLabel>
            <h2
              className="mt-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.0]"
              style={{ color: T.ink }}
            >
              Every price, every market,<br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: `linear-gradient(135deg, ${T.accent}, #059669)` }}
              >
                updated every session.
              </span>
            </h2>
            <p
              className="mt-6 text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: T.inkMuted }}
            >
              Sri Lanka's most comprehensive wholesale vegetable price board. Pick a market, pick a commodity — and see exactly where prices stand today, yesterday, and a year ago.
            </p>
          </motion.div>

          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — copy */}
            <motion.div
              initial="hidden"
              animate={marketInView ? "visible" : "hidden"}
              variants={fadeLeft}
              className="space-y-8"
            >
              <div className="space-y-6">
                <BulletList items={MARKET_BULLETS} />
              </div>

              {/* Stat cards row */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                {[
                  { label: "Markets live", value: "48+" },
                  { label: "Avg. session update", value: "Daily" },
                ].map((card, i) => (
                  <div
                    key={i}
                    className="rounded-2xl p-5 border"
                    style={{ background: T.surface, borderColor: T.border }}
                  >
                    <p
                      className="text-3xl font-black"
                      style={{ color: T.ink }}
                    >
                      {card.value}
                    </p>
                    <p
                      className="text-xs font-bold uppercase tracking-wider mt-1"
                      style={{ color: T.inkFaint }}
                    >
                      {card.label}
                    </p>
                  </div>
                ))}
              </div>

              {/* CTA */}
              <Link
                href="/markets/dambulla"
                className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: T.ink, color: T.surface }}
              >
                Open Market Board
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </motion.div>

            {/* Right — screenshot */}
            <motion.div
              initial="hidden"
              animate={marketInView ? "visible" : "hidden"}
              variants={fadeRight}
            >
              <BrowserFrame
                src="/screenshot/market.png"
                alt="AgriLanka Daily Market Board — Dambulla"
                url="agrilanka.lk/markets/dambulla"
              />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━ DIVIDER ━━━━━━━━━━━━━━━━━ */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="h-px w-full" style={{ background: T.border }} />
      </div>

      {/* ━━━━━━━━━━━━━━━━━ 3. ANALYTICS SHOWCASE ━━━━━━━━━━━━━━━━━ */}
      <section
        ref={analyticsRef}
        className="py-24 lg:py-36 px-6 lg:px-8 overflow-hidden"
        style={{ background: T.page }}
      >
        <div className="max-w-7xl mx-auto">
          {/* Section header */}
          <motion.div
            initial="hidden"
            animate={analyticsInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <SectionLabel>Advanced Analytics</SectionLabel>
            <h2
              className="mt-6 text-4xl md:text-5xl lg:text-6xl font-black tracking-tighter leading-[1.0]"
              style={{ color: T.ink }}
            >
              AI that reads the market<br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: `linear-gradient(135deg, ${T.accent}, #059669)` }}
              >
                so you don't have to.
              </span>
            </h2>
            <p
              className="mt-6 text-lg max-w-2xl mx-auto leading-relaxed"
              style={{ color: T.inkMuted }}
            >
              From candlestick charts to AI-generated 30-day forecasts — our analytics suite brings institutional-grade intelligence to Sri Lanka's agricultural markets.
            </p>
          </motion.div>

          {/* Two-column — screenshot left, copy right */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left — screenshot */}
            <motion.div
              initial="hidden"
              animate={analyticsInView ? "visible" : "hidden"}
              variants={fadeLeft}
              className="order-2 lg:order-1"
            >
              <BrowserFrame
                src="/screenshot/analytics.png"
                alt="AgriLanka Price Intelligence Dashboard"
                url="agrilanka.lk/analytics/dambulla"
              />
            </motion.div>

            {/* Right — copy */}
            <motion.div
              initial="hidden"
              animate={analyticsInView ? "visible" : "hidden"}
              variants={fadeRight}
              className="order-1 lg:order-2 space-y-8"
            >
              <BulletList items={ANALYTICS_BULLETS} />

              {/* AI callout card */}
              <div
                className="flex items-start gap-4 rounded-2xl p-5 border"
                style={{ background: `${T.accentSoft}60`, borderColor: `${T.accent}30` }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-xl"
                  style={{ background: T.accentSoft }}
                >
                  🤖
                </div>
                <div>
                  <p className="text-sm font-black" style={{ color: T.ink }}>
                    AI Market Intelligence
                  </p>
                  <p className="text-xs leading-relaxed mt-1" style={{ color: T.inkMuted }}>
                    Ask our AI chat in plain language — "What's the carrot trend at Keppetipola this month?" — and get a data-backed answer instantly.
                  </p>
                </div>
              </div>

              {/* CTA */}
              <div className="flex items-center gap-4">
                <Link
                  href="/analytics"
                  className="inline-flex items-center gap-3 px-6 py-3.5 rounded-2xl text-sm font-bold transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg"
                  style={{ background: T.ink, color: T.surface }}
                >
                  Open Analytics
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </Link>
                <span className="text-xs font-bold" style={{ color: T.inkFaint }}>
                  Free · No sign-up required
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━ 4. HOW IT WORKS ━━━━━━━━━━━━━━━━━ */}
      <section
        ref={howRef}
        className="py-24 lg:py-36 px-6 lg:px-8 border-t"
        style={{ background: T.surface, borderColor: T.border }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate={howInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="text-center mb-20"
          >
            <SectionLabel>How It Works</SectionLabel>
            <h2
              className="mt-6 text-4xl md:text-5xl font-black tracking-tighter"
              style={{ color: T.ink }}
            >
              Three steps to market mastery.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-0">
            {HOW_STEPS.map((step, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate={howInView ? "visible" : "hidden"}
                variants={fadeUp}
                className="relative flex flex-col p-8 md:p-10"
                style={{
                  borderRight: i < 2 ? `1px solid ${T.border}` : "none",
                }}
              >
                {/* Step number */}
                <span
                  className="text-[80px] font-black leading-none mb-4 select-none"
                  style={{ color: `${T.border}` }}
                >
                  {step.step}
                </span>

                {/* Icon */}
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl mb-6"
                  style={{ background: T.accentSoft }}
                >
                  {step.icon}
                </div>

                <h3
                  className="text-xl font-black mb-3"
                  style={{ color: T.ink }}
                >
                  {step.title}
                </h3>
                <p
                  className="text-sm leading-relaxed"
                  style={{ color: T.inkMuted }}
                >
                  {step.desc}
                </p>

                {/* Connector arrow (between steps) */}
                {i < 2 && (
                  <div
                    className="hidden md:flex absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full items-center justify-center z-10 text-sm font-bold shadow"
                    style={{ background: T.surface, color: T.inkFaint, border: `1px solid ${T.border}` }}
                  >
                    →
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━ 5. TESTIMONIALS ━━━━━━━━━━━━━━━━━ */}
      <section
        ref={testiRef}
        className="py-24 lg:py-36 px-6 lg:px-8 border-t"
        style={{ background: T.page, borderColor: T.border }}
      >
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate={testiInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="text-center mb-16"
          >
            <SectionLabel>From the Community</SectionLabel>
            <h2
              className="mt-6 text-4xl md:text-5xl font-black tracking-tighter"
              style={{ color: T.ink }}
            >
              Trusted by the people<br />who feed Sri Lanka.
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={i}
                custom={i}
                initial="hidden"
                animate={testiInView ? "visible" : "hidden"}
                variants={fadeUp}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="flex flex-col p-8 rounded-3xl border cursor-default"
                style={{ background: T.surface, borderColor: T.border }}
              >
                {/* Quote mark */}
                <div
                  className="text-5xl font-black leading-none mb-4 select-none"
                  style={{ color: `${t.color}30` }}
                >
                  "
                </div>

                <p
                  className="text-sm leading-relaxed flex-1 mb-8"
                  style={{ color: T.inkMuted }}
                >
                  {t.quote}
                </p>

                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-black text-white shrink-0"
                    style={{ background: t.color }}
                  >
                    {t.initials}
                  </div>
                  <div>
                    <p className="text-sm font-black" style={{ color: T.ink }}>
                      {t.name}
                    </p>
                    <p className="text-xs font-bold" style={{ color: T.inkFaint }}>
                      {t.role}
                    </p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ━━━━━━━━━━━━━━━━━ 6. CTA BAND ━━━━━━━━━━━━━━━━━ */}
      <section
        ref={ctaRef}
        className="relative overflow-hidden py-24 lg:py-36 px-6 lg:px-8"
        style={{ background: T.ink }}
      >
        {/* Glow blobs */}
        <div
          className="absolute top-0 left-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: `${T.accent}20`, filter: "blur(120px)" }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: `${T.up}15`, filter: "blur(100px)" }}
        />

        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial="hidden"
            animate={ctaInView ? "visible" : "hidden"}
            variants={fadeUp}
            className="space-y-8"
          >
            {/* Pill */}
            <div
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest"
              style={{ background: `${T.accentSoft}15`, color: T.accentSoft }}
            >
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Free · No Registration Required
            </div>

            <h2 className="text-4xl md:text-6xl lg:text-7xl font-black tracking-tighter text-white leading-[0.95]">
              Start exploring<br />
              <span
                className="text-transparent bg-clip-text"
                style={{ backgroundImage: `linear-gradient(135deg, #5eead4, #34d399)` }}
              >
                today's markets.
              </span>
            </h2>

            <p
              className="text-lg max-w-xl mx-auto leading-relaxed"
              style={{ color: "#a1a1aa" }}
            >
              Real wholesale prices from Sri Lanka's major economic centers — no charts expertise needed. Just pick a market and start exploring.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <Link
                href="/markets/dambulla"
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_20px_40px_-12px_rgba(13,148,136,0.5)]"
                style={{ background: T.accent, color: "white" }}
              >
                View Market Board
                <svg
                  className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>

              <Link
                href="/analytics"
                className="group flex items-center gap-3 px-8 py-4 rounded-2xl text-sm font-bold border transition-all duration-200 hover:-translate-y-1"
                style={{ borderColor: "#3f3f46", color: "#e4e4e7", background: "transparent" }}
              >
                Explore Analytics
                <svg
                  className="w-4 h-4 opacity-60 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-200"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </Link>
            </div>

            {/* Trust badges */}
            <div
              className="flex flex-wrap items-center justify-center gap-6 pt-4 text-xs font-bold uppercase tracking-widest"
              style={{ color: "#52525b" }}
            >
              {["48+ Markets", "Updated Daily", "AI-Powered", "Free Access"].map((badge) => (
                <div key={badge} className="flex items-center gap-2">
                  <svg className="w-3 h-3 text-teal-500" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                  {badge}
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

    </div>
  );
}
