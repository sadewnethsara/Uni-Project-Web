"use client";

import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldCheck, ArrowRight, AlertCircle, Loader2 } from "lucide-react";
import { ANALYZE_THEME } from "@/lib/chartTheme";
import { AdminPanel } from "../_components/AdminPanel";
import { Admin } from "../_components/OverviewManagement";
import { createClient } from "@/utils/supabase/client";
import { usePageTitle } from "@/hooks/usePageTitle";

import { getErrorMessage } from "@/utils/errorHelpers";

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

export default function AdminPage() {
  usePageTitle("Admin Dashboard");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentAdmin, setCurrentAdmin] = useState<Admin | null>(null);
  const [market, setMarket] = useState<string | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Check for active admin session on mount
  useEffect(() => {
    const supabase = createClient();
    const checkActiveSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: adminProfile, error: profileError } = await supabase
            .from("admins")
            .select("*")
            .eq("id", session.user.id)
            .single();

          if (!profileError && adminProfile && (adminProfile.role === "super" || adminProfile.role === "market")) {
            setCurrentAdmin(adminProfile as Admin);
            if (adminProfile.role === "super") {
              setMarket(null);
            } else if (adminProfile.market_id) {
              setMarket(adminProfile.market_id);
            }
            setIsLoggedIn(true);
          }
        }
      } catch (err) {
        console.error("Session restoration error:", err);
      }
    };
    checkActiveSession();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim() || !email.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    if (!password) {
      setError("Please enter your password.");
      return;
    }

    setIsAuthenticating(true);
    const supabase = createClient();

    try {
      // 1. Authenticate with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (authError) {
        throw new Error(authError.message);
      }

      if (!authData.user) {
        throw new Error("Authentication failed.");
      }

      // 2. Fetch corresponding profile from public.admins
      const { data: adminProfile, error: profileError } = await supabase
        .from("admins")
        .select("*")
        .eq("id", authData.user.id)
        .single();

      if (profileError || !adminProfile) {
        // Sign out if they successfully authenticated but are not registered in the admin table
        await supabase.auth.signOut();
        throw new Error("Access denied. You do not have administrator permissions.");
      }

      // 3. Verify admin role
      if (adminProfile.role === "super" || adminProfile.role === "market") {
        setCurrentAdmin(adminProfile as Admin);
        if (adminProfile.role === "super") {
          setMarket(null);
        } else if (adminProfile.market_id) {
          setMarket(adminProfile.market_id);
        }
        setIsLoggedIn(true);
      } else {
        await supabase.auth.signOut();
        throw new Error("Access denied. You do not have administrator permissions.");
      }
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Sign out error:", err);
    } finally {
      setIsLoggedIn(false);
      setCurrentAdmin(null);
      setMarket(null);
      setEmail("");
      setPassword("");
      setError("");
    }
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

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider mb-2" style={{ color: THEME.ink }}>
                  Password
                </label>
                <input
                  type="password"
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="••••••••"
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
                disabled={isAuthenticating || !email.trim() || !password.trim()}
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

            {/* Footer Notice */}
            <div
              className="mt-6 pt-6 border-t text-center text-xs space-y-1"
              style={{ borderColor: THEME.border }}
            >
              <p style={{ color: THEME.inkFaint }}>
                Contact your system administrator for access credentials.
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