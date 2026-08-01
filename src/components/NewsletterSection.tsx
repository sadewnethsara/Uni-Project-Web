"use client";

import { useRef, useState } from "react";
import { motion, useInView, Variants } from "framer-motion";
import { Mail, ArrowRight, CheckCircle2, ShieldCheck, Sprout } from "lucide-react";
import { ANALYZE_THEME } from "@/lib/chartTheme";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 25 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      ease: [0.22, 1, 0.36, 1] as const,
      staggerChildren: 0.1,
    },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export default function NewsletterSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const isInView = useInView(sectionRef, { once: true, amount: 0.25 });

  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!email || !email.includes("@")) {
      setErrorMessage("Please enter a valid email address.");
      setStatus("error");
      return;
    }

    setStatus("loading");

    // Simulate API call
    setTimeout(() => {
      setStatus("success");
      setEmail("");
    }, 1000);
  };

  return (
    <section ref={sectionRef} className="w-full py-16 px-4 sm:px-6 lg:px-12 relative">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="max-w-8xl mx-auto"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center">
          
          {/* Left Column: Heading & Information (7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider"
              style={{
                background: ANALYZE_THEME.accentSoft,
                borderColor: `${ANALYZE_THEME.accent}30`,
                color: ANALYZE_THEME.accentInk,
              }}
            >
              <Sprout size={14} />
              <span>Daily Market Briefing</span>
            </motion.div>

            <motion.h2
              variants={itemVariants}
              className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight"
              style={{ color: ANALYZE_THEME.ink }}
            >
              Stay ahead with real-time Sri Lankan agricultural spot prices
            </motion.h2>

            <motion.p
              variants={itemVariants}
              className="text-xs sm:text-sm lg:text-base font-medium leading-relaxed max-w-2xl"
              style={{ color: ANALYZE_THEME.inkMuted }}
            >
              Get daily price movements, wholesale distribution alerts from Dambulla and Pettah, and weekly market intelligence delivered directly to your inbox.
            </motion.p>

            <motion.div variants={itemVariants} className="flex items-center gap-4 text-xs font-bold pt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
              <div className="flex items-center gap-1.5">
                <ShieldCheck size={15} style={{ color: ANALYZE_THEME.accent }} />
                <span>Zero Spam</span>
              </div>
              <span>•</span>
              <div>Unsubscribe anytime</div>
            </motion.div>
          </div>

          {/* Right Column: Interactive Subscription Form (5 Cols) */}
          <div className="lg:col-span-5">
            <motion.div variants={itemVariants}>
              {status === "success" ? (
                <div className="p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 size={22} className="text-emerald-600 shrink-0" />
                    <h3 className="text-sm font-black" style={{ color: ANALYZE_THEME.ink }}>
                      You're on the list!
                    </h3>
                  </div>
                  <p className="text-xs font-medium" style={{ color: ANALYZE_THEME.inkMuted }}>
                    Thank you for subscribing to the AgriLanka Daily Briefing. Check your inbox shortly for confirmation.
                  </p>
                  <button
                    type="button"
                    onClick={() => setStatus("idle")}
                    className="text-[11px] font-bold underline cursor-pointer pt-1 block"
                    style={{ color: ANALYZE_THEME.accentInk }}
                  >
                    Subscribe another email
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-3">
                  <div className="relative">
                    <Mail
                      size={18}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                      style={{ color: ANALYZE_THEME.inkMuted }}
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Enter your email address..."
                      disabled={status === "loading"}
                      className="w-full pl-10 pr-4 py-3.5 text-xs sm:text-sm font-medium rounded-xl border focus:outline-none transition-all disabled:opacity-60 shadow-xs"
                      style={{
                        background: ANALYZE_THEME.surface,
                        borderColor: status === "error" ? ANALYZE_THEME.down : ANALYZE_THEME.border,
                        color: ANALYZE_THEME.ink,
                      }}
                    />
                  </div>

                  {status === "error" && errorMessage && (
                    <p className="text-[11px] font-bold" style={{ color: ANALYZE_THEME.down }}>
                      {errorMessage}
                    </p>
                  )}

                  <button
                    type="submit"
                    disabled={status === "loading"}
                    className="w-full py-3.5 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 text-white shadow-sm cursor-pointer disabled:opacity-60 hover:brightness-105"
                    style={{ background: ANALYZE_THEME.accent }}
                  >
                    {status === "loading" ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Subscribe to Market Feed</span>
                        <ArrowRight size={15} />
                      </>
                    )}
                  </button>
                </form>
              )}
            </motion.div>
          </div>

        </div>
      </motion.div>
    </section>
  );
}