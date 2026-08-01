"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { ANALYZE_THEME } from "@/lib/chartTheme";

const features = [
  {
    title: "Real-Time Market Data",
    description: "Track daily vegetable prices across Sri Lanka's major economic centers with live updates.",
    icon: "📊",
    color: "#0f766e"
  },
  {
    title: "AI-Powered Analytics",
    description: "Get intelligent price predictions and trend analysis powered by advanced machine learning.",
    icon: "🤖",
    color: "#059669"
  },
  {
    title: "Market Comparison",
    description: "Compare prices across different markets to make informed buying and selling decisions.",
    icon: "⚖️",
    color: "#10b981"
  },
  {
    title: "Historical Trends",
    description: "Access comprehensive historical data to understand seasonal patterns and price movements.",
    icon: "📈",
    color: "#14b8a6"
  }
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.22, 1, 0.36, 1] as const
    }
  }
};

export default function AppShowcase() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.2 });

  return (
    <section ref={ref} className="py-24 px-4 sm:px-6 lg:px-8" style={{ background: ANALYZE_THEME.page }}>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="max-w-7xl mx-auto"
      >
        {/* Section Header */}
        <motion.div variants={itemVariants} className="text-center mb-16">
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            className="inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4"
            style={{ background: ANALYZE_THEME.accentSoft, color: ANALYZE_THEME.accentInk }}
          >
            Platform Features
          </motion.span>
          <h2 className="text-4xl md:text-5xl font-black mb-4" style={{ color: ANALYZE_THEME.ink }}>
            Everything You Need
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: ANALYZE_THEME.inkMuted }}>
            A comprehensive platform designed for farmers, traders, and buyers to make data-driven decisions.
          </p>
        </motion.div>

        {/* Feature Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-20">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="p-6 rounded-3xl border-2 cursor-pointer group"
              style={{
                background: ANALYZE_THEME.surface,
                borderColor: ANALYZE_THEME.border
              }}
            >
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform duration-300"
                style={{ background: `${feature.color}15` }}
              >
                {feature.icon}
              </div>
              <h3 className="text-lg font-bold mb-2" style={{ color: ANALYZE_THEME.ink }}>
                {feature.title}
              </h3>
              <p className="text-sm leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                {feature.description}
              </p>
            </motion.div>
          ))}
        </div>

        {/* App Screenshots */}
        <motion.div variants={itemVariants} className="space-y-16">
          {/* Market Page Screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ delay: 0.3, duration: 0.6 }}
            >
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: ANALYZE_THEME.accentInk }}>
                Market Intelligence
              </span>
              <h3 className="text-3xl font-black mt-2 mb-4" style={{ color: ANALYZE_THEME.ink }}>
                Live Market Board
              </h3>
              <p className="text-base mb-6 leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                View real-time wholesale prices from major economic centers across Sri Lanka. Compare today's prices with yesterday and last year's data at a glance.
              </p>
              <ul className="space-y-3">
                {[
                  "Daily price updates from 7+ major markets",
                  "Commodity-wise price tracking",
                  "Historical comparison views",
                  "Mobile-optimized interface"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm" style={{ color: ANALYZE_THEME.ink }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: ANALYZE_THEME.accentSoft }}>
                      <svg className="w-3 h-3" style={{ color: ANALYZE_THEME.accentInk }} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ delay: 0.4, duration: 0.6 }}
              className="relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ background: ANALYZE_THEME.ink }}>
                <div className="aspect-[16/10] p-6" style={{ background: `linear-gradient(165deg, ${ANALYZE_THEME.page} 0%, #efe4d4 48%, ${ANALYZE_THEME.page} 100%)` }}>
                  {/* Mock Market Interface */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: ANALYZE_THEME.accentInk }}>Dambulla Economic Center</p>
                        <p className="text-xl font-black" style={{ color: ANALYZE_THEME.ink }}>Today's Prices</p>
                      </div>
                      <div className="px-3 py-1 rounded-full text-[10px] font-bold" style={{ background: ANALYZE_THEME.accentSoft, color: ANALYZE_THEME.accentInk }}>
                        LIVE
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      {[
                        { name: "Carrot", price: "Rs. 240/kg", change: "+5%" },
                        { name: "Tomato", price: "Rs. 180/kg", change: "-8%" },
                        { name: "Leeks", price: "Rs. 320/kg", change: "+12%" }
                      ].map((item, i) => (
                        <div key={i} className="p-3 rounded-xl" style={{ background: ANALYZE_THEME.surface, border: `1px solid ${ANALYZE_THEME.border}` }}>
                          <p className="text-xs font-bold mb-1" style={{ color: ANALYZE_THEME.ink }}>{item.name}</p>
                          <p className="text-sm font-black" style={{ color: ANALYZE_THEME.ink }}>{item.price}</p>
                          <p className="text-[10px] font-bold mt-1" style={{ color: item.change.startsWith('+') ? ANALYZE_THEME.up : ANALYZE_THEME.down }}>{item.change}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full opacity-20" style={{ background: ANALYZE_THEME.accent, filter: 'blur(40px)' }} />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 rounded-full opacity-20" style={{ background: ANALYZE_THEME.up, filter: 'blur(50px)' }} />
            </motion.div>
          </div>

          {/* Analytics Page Screenshot */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: 50 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="order-2 lg:order-1 relative"
            >
              <div className="relative rounded-3xl overflow-hidden shadow-2xl" style={{ background: ANALYZE_THEME.ink }}>
                <div className="aspect-[16/10] p-6" style={{ background: `linear-gradient(165deg, ${ANALYZE_THEME.page} 0%, #efe4d4 48%, ${ANALYZE_THEME.page} 100%)` }}>
                  {/* Mock Analytics Interface */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest" style={{ color: ANALYZE_THEME.accentInk }}>Price Analytics</p>
                        <p className="text-xl font-black" style={{ color: ANALYZE_THEME.ink }}>7-Day Trend</p>
                      </div>
                      <div className="flex gap-2">
                        <div className="px-3 py-1 rounded-lg text-[10px] font-bold" style={{ background: ANALYZE_THEME.surface, color: ANALYZE_THEME.ink }}>Carrot</div>
                        <div className="px-3 py-1 rounded-lg text-[10px] font-bold" style={{ background: ANALYZE_THEME.surface, color: ANALYZE_THEME.ink }}>Tomato</div>
                      </div>
                    </div>
                    {/* Mock Chart */}
                    <div className="h-32 rounded-xl p-4 flex items-end gap-2" style={{ background: ANALYZE_THEME.surface, border: `1px solid ${ANALYZE_THEME.border}` }}>
                      {[40, 65, 45, 80, 55, 70, 90].map((height, i) => (
                        <motion.div
                          key={i}
                          initial={{ height: 0 }}
                          animate={isInView ? { height: `${height}%` } : { height: 0 }}
                          transition={{ delay: 0.6 + i * 0.1, duration: 0.4 }}
                          className="flex-1 rounded-t-lg"
                          style={{ background: ANALYZE_THEME.accent }}
                        />
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3 rounded-xl text-center" style={{ background: ANALYZE_THEME.surface, border: `1px solid ${ANALYZE_THEME.border}` }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: ANALYZE_THEME.inkFaint }}>Avg Price</p>
                        <p className="text-lg font-black" style={{ color: ANALYZE_THEME.ink }}>Rs. 215</p>
                      </div>
                      <div className="p-3 rounded-xl text-center" style={{ background: ANALYZE_THEME.surface, border: `1px solid ${ANALYZE_THEME.border}` }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: ANALYZE_THEME.inkFaint }}>High</p>
                        <p className="text-lg font-black" style={{ color: ANALYZE_THEME.up }}>Rs. 320</p>
                      </div>
                      <div className="p-3 rounded-xl text-center" style={{ background: ANALYZE_THEME.surface, border: `1px solid ${ANALYZE_THEME.border}` }}>
                        <p className="text-[10px] font-bold uppercase" style={{ color: ANALYZE_THEME.inkFaint }}>Low</p>
                        <p className="text-lg font-black" style={{ color: ANALYZE_THEME.down }}>Rs. 180</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              {/* Decorative elements */}
              <div className="absolute -top-4 -left-4 w-24 h-24 rounded-full opacity-20" style={{ background: ANALYZE_THEME.up, filter: 'blur(40px)' }} />
              <div className="absolute -bottom-4 -right-4 w-32 h-32 rounded-full opacity-20" style={{ background: ANALYZE_THEME.accent, filter: 'blur(50px)' }} />
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -50 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="order-1 lg:order-2"
            >
              <span className="text-xs font-bold uppercase tracking-widest" style={{ color: ANALYZE_THEME.accentInk }}>
                Advanced Analytics
              </span>
              <h3 className="text-3xl font-black mt-2 mb-4" style={{ color: ANALYZE_THEME.ink }}>
                AI-Powered Insights
              </h3>
              <p className="text-base mb-6 leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                Leverage machine learning to predict price trends, analyze market patterns, and make data-driven decisions for your agricultural business.
              </p>
              <ul className="space-y-3">
                {[
                  "7-day and 30-day trend analysis",
                  "Multi-market comparison charts",
                  "AI-powered price predictions",
                  "Custom date range analytics"
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-sm" style={{ color: ANALYZE_THEME.ink }}>
                    <div className="w-5 h-5 rounded-full flex items-center justify-center" style={{ background: ANALYZE_THEME.accentSoft }}>
                      <svg className="w-3 h-3" style={{ color: ANALYZE_THEME.accentInk }} fill="none" stroke="currentColor" strokeWidth={3} viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
