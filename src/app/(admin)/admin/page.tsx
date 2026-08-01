"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { ANALYZE_THEME } from "@/lib/chartTheme";
import { AdminPanel } from "../_components/AdminPanel";
import { Admin } from "../_components/OverviewManagement";
import { ADMIN_DEMO_DATA } from "../data/demoData";

// Fallback theme in case ANALYZE_THEME is partially defined
const DEFAULT_THEME = {
  page: "#f8fafc",
  surface: "#ffffff",
  surfaceRaised: "#ffffff",
  border: "#e2e8f0",
  accent: "#0d9488",
  accentSoft: "#ccfbf1",
  ink: "#0f172a",
  inkMuted: "#475569",
  inkFaint: "#94a3b8",
};

const THEME = typeof ANALYZE_THEME !== "undefined" ? ANALYZE_THEME : DEFAULT_THEME;

// Demo admin data used for fallback resolution
const MOCK_ADMINS: Admin[] = ADMIN_DEMO_DATA.admins as Admin[];

const findAdminByEmail = (email: string): Admin | null => {
  const normalizedEmail = email.trim().toLowerCase();
  return MOCK_ADMINS.find((a) => a.email.toLowerCase() === normalizedEmail) || null;
};

export default function AdminPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [market, setMarket] = useState<"dambulla" | "kappetipola" | null>(null);
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setIsAuthenticating(true);

    // Simulate backend auth check
    setTimeout(() => {
      const admin = findAdminByEmail(email);

      if (admin) {
        setCurrentAdmin(admin);
        if (admin.role === "super") {
          setMarket(null);
        } else if (admin.marketId) {
          setMarket(admin.marketId as "dambulla" | "kappetipola");
        }
        setIsLoggedIn(true);
      } else {
        setError("Invalid email. Please contact your administrator.");
      }
      setIsAuthenticating(false);
    }, 600);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentAdmin(null);
    setMarket(null);
    setEmail("");
    setError("");
  };

  if (!isLoggedIn) {
    return (
      <div
        className="min-h-screen flex items-center justify-center p-4 selection:bg-teal-100"
        style={{ background: THEME.page }}
      >
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div
            className="p-8 rounded-3xl border shadow-xl backdrop-blur-sm"
            style={{
              background: THEME.surfaceRaised,
              borderColor: THEME.border,
            }}
          >
            {/* Header Icon & Title */}
            <div className="text-center mb-8">
              <div
                className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-md transition-transform hover:scale-105"
                style={{ background: THEME.accent }}
              >
                <ShieldCheck className="w-8 h-8 text-white" />
              </div>
              <h1 className="text-2xl font-black tracking-tight mb-1" style={{ color: THEME.ink }}>
                Admin Portal
              </h1>
              <p className="text-sm font-medium" style={{ color: THEME.inkMuted }}>
                Sri Lanka Economic System
              </p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: THEME.ink }}>
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  autoComplete="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="admin@agri.lk"
                  className="w-full px-4 py-3.5 rounded-xl border text-sm font-medium outline-none transition-all focus:ring-2 focus:ring-teal-600/20"
                  style={{
                    background: THEME.surface,
                    borderColor: error ? "#ef4444" : THEME.border,
                    color: THEME.ink,
                  }}
                />
              </div>

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3.5 rounded-xl text-sm font-medium text-red-600 border border-red-200 flex items-center gap-2.5"
                  style={{ background: "#fef2f2" }}
                  role="alert"
                >
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </motion.div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuthenticating || !email.trim()}
                className="w-full py-4 rounded-2xl font-bold text-white transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100 shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                style={{ background: THEME.accent }}
              >
                {isAuthenticating ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-5 h-5" />
                  </>
                )}
              </button>
            </form>

            {/* Footer Notice & Quick Test Hint */}
            <div
              className="mt-6 pt-6 border-t text-center text-xs space-y-1"
              style={{ borderColor: THEME.border }}
            >
              <p style={{ color: THEME.inkFaint }}>
                Contact your system administrator for access credentials.
              </p>
              <p className="text-[11px] font-mono text-slate-400">
                Demo: <code className="text-teal-700">admin@agri.lk</code>
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div
      className="min-h-screen font-sans"
      style={{ background: THEME.page, color: THEME.ink }}
    >
      <AdminPanel market={market} admin={currentAdmin} onLogout={handleLogout} />
    </div>
  );
}