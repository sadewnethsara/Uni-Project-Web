"use client";

import { useRef } from "react";
import { motion, useInView, Variants } from "framer-motion";
import Link from "next/link";
import { ANALYZE_THEME } from "@/lib/chartTheme";
import Antigravity from "./effects/Antigravity";

const containerVariants: Variants = {
  hidden: { opacity: 0, y: 30 },
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
  hidden: { opacity: 0, y: 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      ease: "easeOut",
    },
  },
};

export default function Footer() {
  const footerRef = useRef<HTMLElement>(null);

  const isInView = useInView(footerRef, {
    once: true,
    amount: 0.2,
  });

  return (
    <footer
      ref={footerRef}
      className="relative w-full overflow-hidden rounded-b-2xl border-t py-12 transition-colors"
      style={{
        backgroundColor: ANALYZE_THEME.ink,
        borderColor: `${ANALYZE_THEME.border}40`,
      }}
    >
      {/* PixelBlast Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden hidden md:block">
          <Antigravity
            count={300}
            magnetRadius={6}
            ringRadius={7}
            waveSpeed={0.4}
            waveAmplitude={1}
            particleSize={1.5}
            lerpSpeed={0.05}
            color="#f7efe3"
            autoAnimate={true}
            particleVariance={1}
            rotationSpeed={0}
            depthFactor={1}
            pulseSpeed={3}
            particleShape="capsule"
            fieldStrength={10}
        />
      </div>

      {/* Footer Content */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative z-10 mx-auto max-w-8xl space-y-12 px-6 md:px-12"
      >
        {/* Top Section */}
        <div className="grid grid-cols-1 gap-8 md:grid-cols-3 lg:grid-cols-7">
          {/* Brand Info */}
          <motion.div
            variants={itemVariants}
            className="space-y-4 md:col-span-2 lg:col-span-2"
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 animate-pulse rounded-full"
                style={{
                  backgroundColor: ANALYZE_THEME.accent,
                }}
              />

              <span className="text-lg font-bold uppercase tracking-wider text-white">
                AgriLanka Terminal
              </span>
            </div>

            <p className="max-w-sm text-sm leading-relaxed text-gray-400">
              Real-time agricultural market intelligence, price trends, and
              distribution hub updates across Sri Lanka.
            </p>
          </motion.div>

          {/* Public Pages */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Public
            </h4>

            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/markets"
                  className="text-gray-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Market Intelligence
                </Link>
              </li>
              <li>
                <Link
                  href="/trends"
                  className="text-gray-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Price Index
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Main Pages */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Main
            </h4>

            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/dashboard"
                  className="text-gray-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Dashboard
                </Link>
              </li>
              <li>
                <Link
                  href="/analyze"
                  className="text-gray-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Analysis
                </Link>
              </li>
              <li>
                <Link
                  href="/hubs"
                  className="text-gray-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Economic Centers
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Auth Pages */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Auth
            </h4>

            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/login"
                  className="text-gray-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Login
                </Link>
              </li>
              <li>
                <Link
                  href="/signup"
                  className="text-gray-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Sign Up
                </Link>
              </li>
              <li>
                <Link
                  href="/forgot-password"
                  className="text-gray-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Reset Password
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Admin Pages */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Admin
            </h4>

            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/admin"
                  className="text-gray-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Admin Panel
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/users"
                  className="text-gray-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Users
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/settings"
                  className="text-gray-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Settings
                </Link>
              </li>
            </ul>
          </motion.div>

          {/* Support Pages */}
          <motion.div variants={itemVariants} className="space-y-3">
            <h4 className="text-xs font-semibold uppercase tracking-widest text-gray-400">
              Support
            </h4>

            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/support"
                  className="text-gray-300 transition-colors hover:text-white hover:underline underline-offset-4"
                >
                  Support Desk
                </Link>
              </li>
            </ul>
          </motion.div>
        </div>

        {/* Divider */}
        <motion.div
          variants={itemVariants}
          className="h-px w-full"
          style={{
            backgroundColor: `${ANALYZE_THEME.border}30`,
          }}
        />

        {/* Bottom Section */}
        <motion.div
          variants={itemVariants}
          className="flex flex-col items-center justify-between gap-4 text-xs text-gray-500 sm:flex-row"
        >
          <div className="flex gap-6">
            <Link
              href="/privacy"
              className="transition-colors hover:text-gray-300"
            >
              Privacy Policy
            </Link>

            <Link
              href="/terms"
              className="transition-colors hover:text-gray-300"
            >
              Terms of Service
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </footer>
  );
}