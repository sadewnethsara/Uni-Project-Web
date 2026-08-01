"use client";

import { motion, Variants } from "framer-motion";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";
import { ANALYZE_THEME } from "@/lib/chartTheme";

type PageTransitionProps = {
  children: ReactNode;
};

// Add `as const` here so TypeScript knows it's a fixed 4-number tuple
const transitionConfig = {
  duration: 0.6,
  ease: [0.76, 0, 0.24, 1] as const,
};

// Overlay 1: Covers the screen on EXIT (scales UP from bottom)
const wipeIn: Variants = {
  initial: { scaleY: 0 },
  animate: { scaleY: 0 },
  exit: { scaleY: 1, transition: transitionConfig },
};

// Overlay 2: Uncovers the screen on ENTER (scales DOWN to top)
const wipeOut: Variants = {
  initial: { scaleY: 1 },
  animate: { scaleY: 0, transition: transitionConfig },
  exit: { scaleY: 0 },
};

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Route Content Wrapper */}
      <motion.div key={pathname} className="w-full min-h-screen">
        {children}

        {/* Wipe-in Overlay (Triggers when leaving current page) */}
        <motion.div
          variants={wipeIn}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed top-0 left-0 w-full h-screen z-50 origin-bottom pointer-events-none"
          style={{ background: ANALYZE_THEME.ink }}
        />

        {/* Wipe-out Overlay (Triggers when entering new page) */}
        <motion.div
          variants={wipeOut}
          initial="initial"
          animate="animate"
          exit="exit"
          className="fixed top-0 left-0 w-full h-screen z-50 origin-top pointer-events-none"
          style={{ background: ANALYZE_THEME.ink }}
        />
      </motion.div>
    </>
  );
}