"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  Sprout,
  AlertCircle,
  TrendingUp,
  Activity,
  BarChart3,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
} from "lucide-react";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";

import { usePageTitle } from "@/hooks/usePageTitle";
import { getErrorMessage } from "@/utils/errorHelpers";

export default function LoginPage() {
  usePageTitle("Sign In");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }

    setIsLoading(true);

    try {
      await login(email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden select-none"
      style={{
        background: `linear-gradient(165deg, ${ANALYZE_THEME.page} 0%, #efe4d4 48%, ${ANALYZE_THEME.page} 100%)`,
        borderRadius: "1.5rem"
      }}
    >
      {/* Decorative background lights */}
      <div
        className="absolute top-10 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: ANALYZE_THEME.accentSoft }}
      />
      <div
        className="absolute bottom-10 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: "#d4e0d7" }}
      />

      {/* Top Header Bar with Back Button */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between relative z-20 mb-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs hover:bg-white/60"
          style={{
            background: ANALYZE_THEME.surface,
            borderColor: ANALYZE_THEME.border,
            color: ANALYZE_THEME.ink,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-2 text-xs font-medium" style={{ color: ANALYZE_THEME.inkMuted }}>
          <span className="hidden md:block ">Need an account?</span>
          <Link
            href="/signup"
            className="font-bold hover:underline"
            style={{ color: ANALYZE_THEME.accentInk }}
          >
            Create account
          </Link>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center relative z-10 my-auto py-4">
        
        {/* Left Side (7 Columns) — Live Snapshot / Returning User View */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="lg:col-span-7 flex flex-col justify-center pr-0 lg:pr-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="p-3 rounded-2xl shadow-sm flex items-center justify-center shrink-0"
              style={{ background: ANALYZE_THEME.accent, color: "#ffffff" }}
            >
              <Sprout className="w-7 h-7 stroke-[2.5]" />
            </div>
            <div>
              <p
                className="text-[10px] font-black uppercase tracking-[0.25em]"
                style={{ color: ANALYZE_THEME.accentInk }}
              >
                AgriLanka · Member Portal
              </p>
              <h1
                className="text-2xl font-black tracking-tight"
                style={{ color: ANALYZE_THEME.ink }}
              >
                Market Intelligence Network
              </h1>
            </div>
          </div>

          <h2
            className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] mb-5 max-w-2xl"
            style={{ color: ANALYZE_THEME.ink }}
          >
            Welcome back to your <br />
            <span style={{ color: ANALYZE_THEME.accentInk }}>
              daily pricing dashboard
            </span>
          </h2>

          <p
            className="text-sm sm:text-base font-medium mb-8 leading-relaxed max-w-xl"
            style={{ color: ANALYZE_THEME.inkMuted }}
          >
            Log in to monitor live price indexes across Dambulla, Pettah & Keppetipola Economic Centers.
          </p>

          {/* Login-Specific Metrics Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
            <MetricBox label="Active Centers" value="12 Hubs" icon={<Activity size={16} />} />
            <MetricBox label="Daily Tonnage" value="2,450 MT" icon={<TrendingUp size={16} />} />
            <MetricBox label="Index Accuracy" value="99.4%" icon={<BarChart3 size={16} />} />
          </div>

          {/* Testimonial Quote */}
          <div
            className={`${PANEL_CLASS} p-4 border-l-4`}
            style={{
              background: ANALYZE_THEME.surfaceRaised,
              borderColor: ANALYZE_THEME.border,
              borderLeftColor: ANALYZE_THEME.accent,
            }}
          >
            <p className="text-xs font-semibold italic leading-relaxed" style={{ color: ANALYZE_THEME.ink }}>
              &ldquo;AgriLanka gives our purchasing team exact morning spot rates before trucks leave Dambulla. It saved us millions in Q2.&rdquo;
            </p>
            <p className="text-[11px] font-bold mt-2" style={{ color: ANALYZE_THEME.accentInk }}>
              — Commercial Director, Ceylon Foods PLC
            </p>
          </div>
        </motion.div>

        {/* Right Side (5 Columns) — Login Card */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
          className="lg:col-span-5 flex justify-center lg:justify-end w-full"
        >
          <div
            className={`${PANEL_CLASS} w-full max-w-lg p-6 sm:p-8 shadow-xl relative`}
            style={{
              background: ANALYZE_THEME.surfaceRaised,
              borderColor: ANALYZE_THEME.border,
            }}
          >
            <div className="mb-6">
              <span
                className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full inline-block mb-2.5"
                style={{
                  background: ANALYZE_THEME.accentSoft,
                  color: ANALYZE_THEME.accentInk,
                }}
              >
                Sign In
              </span>
              <h3
                className="text-2xl font-black tracking-tight"
                style={{ color: ANALYZE_THEME.ink }}
              >
                Access your workspace
              </h3>
              <p
                className="text-xs font-medium mt-1"
                style={{ color: ANALYZE_THEME.inkMuted }}
              >
                Enter your credentials to access the analytics terminal.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 overflow-hidden"
                >
                  <div
                    className="p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-bold"
                    style={{
                      background: "#fdf2f2",
                      border: `1px solid ${ANALYZE_THEME.down}30`,
                      color: ANALYZE_THEME.down,
                    }}
                  >
                    <AlertCircle size={16} className="shrink-0" />
                    <span>{error}</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
                  Work Email Address
                </label>
                <div className="relative">
                  <Mail
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    size={18}
                    style={{ color: ANALYZE_THEME.inkFaint }}
                  />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@agrilanka.lk"
                    required
                    className="w-full pl-11 pr-4 py-2.5 text-sm font-medium rounded-xl border focus:outline-none transition-all"
                    style={{
                      background: ANALYZE_THEME.surface,
                      borderColor: ANALYZE_THEME.border,
                      color: ANALYZE_THEME.ink,
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold" style={{ color: ANALYZE_THEME.ink }}>
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-bold hover:underline"
                    style={{ color: ANALYZE_THEME.accentInk }}
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock
                    className="absolute left-3.5 top-1/2 -translate-y-1/2"
                    size={18}
                    style={{ color: ANALYZE_THEME.inkFaint }}
                  />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    className="w-full pl-11 pr-11 py-2.5 text-sm font-medium rounded-xl border focus:outline-none transition-all"
                    style={{
                      background: ANALYZE_THEME.surface,
                      borderColor: ANALYZE_THEME.border,
                      color: ANALYZE_THEME.ink,
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 cursor-pointer"
                    style={{ color: ANALYZE_THEME.inkFaint }}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    title={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer"
                  />
                  <span className="text-xs font-medium" style={{ color: ANALYZE_THEME.inkMuted }}>
                    Remember this device
                  </span>
                </label>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 px-4 mt-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60 text-white"
                style={{
                  background: ANALYZE_THEME.accent,
                }}
              >
                {isLoading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight size={16} />
                  </>
                )}
              </button>
            </form>


          </div>
        </motion.div>

      </div>
      <div />
    </div>
  );
}

function MetricBox({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) {
  return (
    <div
      className={`${PANEL_CLASS} p-3 flex flex-col justify-between`}
      style={{
        background: ANALYZE_THEME.surfaceRaised,
        borderColor: ANALYZE_THEME.border,
      }}
    >
      <div className="flex items-center justify-between text-xs font-bold mb-1" style={{ color: ANALYZE_THEME.inkMuted }}>
        <span>{label}</span>
        <span style={{ color: ANALYZE_THEME.accentInk }}>{icon}</span>
      </div>
      <p className="text-lg font-black" style={{ color: ANALYZE_THEME.ink }}>
        {value}
      </p>
    </div>
  );
}