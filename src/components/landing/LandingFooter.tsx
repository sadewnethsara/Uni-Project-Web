"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import Link from "next/link";
import { ANALYZE_THEME } from "@/lib/chartTheme";

const footerLinks = {
  platform: [
    { label: "Market Intelligence", href: "/markets" },
    { label: "Price Analytics", href: "/analytics" },
    { label: "Economic Centers", href: "/hubs" },
    { label: "Price Index", href: "/trends" },
  ],
  resources: [
    { label: "API Documentation", href: "#" },
    { label: "Data Sources", href: "#" },
    { label: "Market Guides", href: "#" },
    { label: "FAQ", href: "/faq" },
  ],
  company: [
    { label: "About Us", href: "#" },
    { label: "Contact", href: "#" },
    { label: "Privacy Policy", href: "/privacy" },
    { label: "Terms of Service", href: "/terms" },
  ],
};

const socialLinks = [
  { name: "Twitter", icon: "𝕏", href: "#" },
  { name: "LinkedIn", icon: "in", href: "#" },
  { name: "GitHub", icon: "⌘", href: "#" },
];

export default function LandingFooter() {
  const footerRef = useRef<HTMLElement>(null);
  const isInView = useInView(footerRef, { once: true, amount: 0.1 });

  return (
    <footer
      ref={footerRef}
      className="relative w-full overflow-hidden py-16 px-4 sm:px-6 lg:px-8"
      style={{
        background: ANALYZE_THEME.ink,
        borderTop: `1px solid ${ANALYZE_THEME.border}30`
      }}
    >
      {/* Animated background gradient */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: ANALYZE_THEME.accent, filter: 'blur(120px)' }} />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full opacity-10" style={{ background: ANALYZE_THEME.up, filter: 'blur(100px)' }} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
            transition={{ delay: 0.1, duration: 0.5 }}
            className="space-y-4"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: ANALYZE_THEME.accent }}>
                <span className="text-xl font-black" style={{ color: ANALYZE_THEME.surface }}>🌾</span>
              </div>
              <div>
                <h3 className="text-lg font-bold" style={{ color: ANALYZE_THEME.surface }}>
                  AgriLanka
                </h3>
                <p className="text-xs font-bold uppercase tracking-wider" style={{ color: ANALYZE_THEME.surface }}>
                  Terminal
                </p>
              </div>
            </div>
            <p className="text-sm leading-relaxed" style={{ color: ANALYZE_THEME.surface }}>
              Sri Lanka&apos;s premier agricultural market intelligence platform, empowering farmers and buyers with real-time data and AI-driven insights.
            </p>
          </motion.div>

          {/* Platform Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="space-y-4"
          >
            <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: ANALYZE_THEME.surface }}>
              Platform
            </h4>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: ANALYZE_THEME.surface }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Resources Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="space-y-4"
          >
            <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: ANALYZE_THEME.surface }}>
              Resources
            </h4>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: ANALYZE_THEME.surface }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Company Links */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="space-y-4"
          >
            <h4 className="text-xs font-bold uppercase tracking-widest" style={{ color: ANALYZE_THEME.surface }}>
              Company
            </h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm transition-colors hover:text-white"
                    style={{ color: ANALYZE_THEME.surface }}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          initial={{ opacity: 0, scaleX: 0 }}
          animate={isInView ? { opacity: 1, scaleX: 1 } : { opacity: 0, scaleX: 0 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="h-px w-full mb-12"
          style={{ background: `${ANALYZE_THEME.border}30` }}
        />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Copyright */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ delay: 0.6, duration: 0.5 }}
            className="text-xs font-medium"
            style={{ color: ANALYZE_THEME.surface }}
          >
            © 2024 AgriLanka Terminal. All rights reserved.
          </motion.p>

          {/* Social Links */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="flex items-center gap-4"
          >
            {socialLinks.map((social) => (
              <motion.a
                key={social.name}
                href={social.href}
                whileHover={{ scale: 1.1, y: -2 }}
                whileTap={{ scale: 0.95 }}
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-colors"
                style={{
                  background: ANALYZE_THEME.surfaceRaised,
                  color: ANALYZE_THEME.ink
                }}
                aria-label={social.name}
              >
                <span className="font-bold text-sm">{social.icon}</span>
              </motion.a>
            ))}
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ delay: 0.8, duration: 0.5 }}
          className="mt-12 text-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest cursor-pointer"
            style={{ color: ANALYZE_THEME.surface }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          >
            <span>Back to top</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5 10l7-7m0 0l7 7m-7-7v18" />
            </svg>
          </motion.div>
        </motion.div>
      </div>
    </footer>
  );
}
