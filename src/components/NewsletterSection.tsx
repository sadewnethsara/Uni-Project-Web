"use client";

import { motion, useInView } from "framer-motion";
import { useRef, useState } from "react";
import { ANALYZE_THEME } from "@/lib/chartTheme";

export default function Newsletter() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });
  const [email, setEmail] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setIsSubmitted(true);
      setTimeout(() => setIsSubmitted(false), 3000);
      setEmail("");
    }
  };

  return (
    <section ref={ref} className="py-8 md:py-24 px-2 sm:px-0 md:px-8 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full opacity-30" style={{ background: ANALYZE_THEME.accent, filter: 'blur(100px)' }} />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 rounded-full opacity-20" style={{ background: ANALYZE_THEME.up, filter: 'blur(120px)' }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] as const }}
        className="max-w-5xl mx-auto relative z-10"
      >
        {/* Main Card */}
        <div
          className="rounded-3xl p-8 md:p-12 text-center relative overflow-hidden"
          style={{
            background: ANALYZE_THEME.ink,
            border: `1px solid ${ANALYZE_THEME.border}30`
          }}
        >
          {/* Animated background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{
              backgroundImage: `radial-gradient(circle at 2px 2px, ${ANALYZE_THEME.surface} 1px, transparent 0)`,
              backgroundSize: '40px 40px'
            }} />
          </div>

          <div className="relative z-10">
            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-6"
              style={{ background: ANALYZE_THEME.accentSoft, color: ANALYZE_THEME.accentInk }}
            >
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ background: ANALYZE_THEME.up }} />
              Stay Updated
            </motion.div>

            {/* Heading */}
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-3xl md:text-4xl lg:text-5xl font-black mb-4"
              style={{ color: ANALYZE_THEME.surface }}
            >
              Get Market Insights
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-base md:text-lg mb-8 max-w-2xl mx-auto leading-relaxed"
              style={{ color: ANALYZE_THEME.inkMuted }}
            >
              Subscribe to receive daily price updates, market trends, and AI-powered predictions directly in your inbox.
            </motion.p>

            {/* Form */}
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              onSubmit={handleSubmit}
              className="flex flex-col sm:flex-row gap-4 max-w-lg mx-auto"
            >
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="flex-1 px-6 py-4 rounded-xl text-sm font-medium focus:outline-none transition-all"
                style={{
                  background: ANALYZE_THEME.surfaceRaised,
                  border: `1px solid ${ANALYZE_THEME.border}50`,
                  color: ANALYZE_THEME.ink
                }}
              />
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                className="px-8 py-4 rounded-xl text-sm font-bold uppercase tracking-wider transition-all"
                style={{
                  background: ANALYZE_THEME.accent,
                  color: ANALYZE_THEME.surface
                }}
              >
                {isSubmitted ? "Subscribed!" : "Subscribe"}
              </motion.button>
            </motion.form>

            {/* Trust indicators */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={isInView ? { opacity: 1 } : { opacity: 0 }}
              transition={{ delay: 0.6, duration: 0.5 }}
              className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs"
              style={{ color: ANALYZE_THEME.inkFaint }}
            >
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>No spam</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Unsubscribe anytime</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
                <span>Daily updates</span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ delay: 0.7, duration: 0.5 }}
          className="mt-12 grid grid-cols-3 gap-8"
        >
          {[
            { value: "7+", label: "Markets" },
            { value: "50+", label: "Commodities" },
            { value: "24/7", label: "Updates" }
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <p className="text-3xl md:text-4xl font-black" style={{ color: ANALYZE_THEME.ink }}>
                {stat.value}
              </p>
              <p className="text-xs font-bold uppercase tracking-wider mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
                {stat.label}
              </p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
