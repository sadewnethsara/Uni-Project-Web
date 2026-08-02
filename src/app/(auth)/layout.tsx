"use client";

import FloatingLanguageSwitcher from "@/components/FloatingLanguageSwitcher";
import ConditionalFloatingChat from "@/components/ConditionalFloatingChat";
import { AuthProvider } from "@/contexts/AuthContext";
import { ANALYZE_THEME } from "@/lib/chartTheme";
import { AnimatePresence, motion } from "motion/react";
import { useState, useEffect } from "react";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showScrollButton, setShowScrollButton] = useState(false);
  const scrollToTop = () => {
    const startPosition = window.scrollY;
    const duration = 1200; // milliseconds

    let startTime: number | null = null;

    const easeInOutCubic = (t: number) =>
      t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2;

    const animateScroll = (currentTime: number) => {
      if (!startTime) startTime = currentTime;

      const elapsedTime = currentTime - startTime;
      const progress = Math.min(elapsedTime / duration, 1);

      const easedProgress = easeInOutCubic(progress);

      window.scrollTo({
        top: startPosition * (1 - easedProgress),
      });

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  };
  useEffect(() => {
    const handleScroll = () => setShowScrollButton(window.scrollY > 200);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div>
      <div className="fixed right-4 md:right-auto md:left-7 bottom-4 md:bottom-6 z-50 pointer-events-none">
        <AnimatePresence>
          {showScrollButton && (
            <motion.button
              onClick={scrollToTop}
              initial={{ opacity: 0, scale: 0.7, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.7, y: 20 }}
              whileHover={{ scale: 1.12 }}
              whileTap={{ scale: 0.92 }}
              transition={{ type: "spring", stiffness: 400, damping: 18 }}
              className="pointer-events-auto flex items-center justify-center w-12 h-12 rounded-xl shadow-2xl cursor-pointer transition-colors focus:outline-none border"
              style={{
                background: ANALYZE_THEME.ink,
                color: ANALYZE_THEME.surfaceRaised,
                borderColor: "rgba(255,255,255,0.1)"
              }}
              aria-label="Scroll to top"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5L12 3m0 0l7.5 7.5M12 3v18" />
              </svg>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
      <div suppressHydrationWarning className="min-h-full flex flex-col bg-[#fdf6e3]">
        <AuthProvider>
          <ConditionalFloatingChat />
          <main className="flex-1 w-full max-w-8xl mx-auto px-4 sm:px-6 lg:px-4 pb-4 sm:pb-6 lg:pb-4">
            {children}
          </main>
          {/* Footer copyright */}
          <div
            className="pb-3 pt-0 text-center text-xs font-semibold relative z-10"
            style={{
              borderColor: `${ANALYZE_THEME.border}80`,
              color: ANALYZE_THEME.inkMuted
            }}
          >
            <span className="block sm:inline">
              © {new Date().getFullYear()} AgriLanka Intelligence Network.
            </span>
            <span className="block sm:inline">
              {" "}All rights reserved.
            </span>
          </div>
        </AuthProvider>
      </div>
    </div>
  );
}