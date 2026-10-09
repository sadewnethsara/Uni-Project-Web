"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Lock,
  Mail,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Sprout,
  AlertCircle,
  KeyRound,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";

import { usePageTitle } from "@/hooks/usePageTitle";

export default function ForgotPasswordPage() {
  usePageTitle("Reset Password");
  const [step, setStep] = useState<1 | 2>(1);
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleRequestCode = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email) {
      setError("Please enter your registered email address.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setStep(2);
    }, 800);
  };

  const handleResetPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (otp.length !== 4) {
      setError("Invalid OTP code. Please enter the 4-digit code.");
      return;
    }

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSuccess(true);
    }, 1000);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden select-none"
      style={{
        background: `linear-gradient(165deg, ${ANALYZE_THEME.page} 0%, #efe4d4 48%, ${ANALYZE_THEME.page} 100%)`,
        borderRadius: "1.5rem",
      }}
    >
      {/* Background Glow */}
      <div
        className="absolute top-10 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: ANALYZE_THEME.accentSoft }}
      />

      {/* Top Header Bar */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between relative z-20 mb-4">
        <Link
          href="/login"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs hover:bg-white/60"
          style={{
            background: ANALYZE_THEME.surface,
            borderColor: ANALYZE_THEME.border,
            color: ANALYZE_THEME.ink,
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Login</span>
        </Link>

        <Link
          href="/"
          className="text-xs font-bold hover:underline"
          style={{ color: ANALYZE_THEME.accentInk }}
        >
          Return to Home
        </Link>
      </div>

      {/* Main Grid Content */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center relative z-10 my-auto py-4">
        
        {/* Left Side (7 Columns) */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
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
              <p className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: ANALYZE_THEME.accentInk }}>
                Account Recovery
              </p>
              <h1 className="text-2xl font-black tracking-tight" style={{ color: ANALYZE_THEME.ink }}>
                AgriLanka Terminal
              </h1>
            </div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-[1.12] mb-5 max-w-2xl" style={{ color: ANALYZE_THEME.ink }}>
            Secure password reset & <br />
            <span style={{ color: ANALYZE_THEME.accentInk }}>
              credential verification
            </span>
          </h2>

          <p className="text-sm sm:text-base font-medium mb-8 leading-relaxed max-w-xl" style={{ color: ANALYZE_THEME.inkMuted }}>
            Enter your registered email address to receive a 4-digit verification code to safely update your password.
          </p>

          <div className={`${PANEL_CLASS} p-4 flex items-center gap-3 max-w-lg`} style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}>
            <ShieldCheck size={24} style={{ color: ANALYZE_THEME.accentInk }} className="shrink-0" />
            <p className="text-xs font-semibold leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
              All password reset requests are encrypted and expire within 15 minutes for security.
            </p>
          </div>
        </motion.div>

        {/* Right Side (5 Columns) */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="lg:col-span-5 flex justify-center lg:justify-end w-full"
        >
          <div
            className={`${PANEL_CLASS} w-full max-w-lg p-6 sm:p-8 shadow-xl relative`}
            style={{
              background: ANALYZE_THEME.surfaceRaised,
              borderColor: ANALYZE_THEME.border,
            }}
          >
            {isSuccess ? (
              <div className="text-center py-6 space-y-4">
                <div className="w-12 h-12 rounded-full mx-auto flex items-center justify-center" style={{ background: "#eef9f2", color: "#1b7a43" }}>
                  <CheckCircle2 size={28} />
                </div>
                <h3 className="text-xl font-black" style={{ color: ANALYZE_THEME.ink }}>
                  Password Reset Complete
                </h3>
                <p className="text-xs font-medium" style={{ color: ANALYZE_THEME.inkMuted }}>
                  Your password has been successfully updated. You can now log in with your new password.
                </p>
                <Link
                  href="/login"
                  className="inline-flex w-full py-3.5 text-xs font-black uppercase tracking-wider rounded-xl items-center justify-center gap-2 text-white mt-4"
                  style={{ background: ANALYZE_THEME.accent }}
                >
                  Return to Login
                  <ArrowRight size={16} />
                </Link>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <span
                    className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full inline-block mb-2.5"
                    style={{
                      background: ANALYZE_THEME.accentSoft,
                      color: ANALYZE_THEME.accentInk,
                    }}
                  >
                    Step {step} of 2
                  </span>
                  <h3 className="text-2xl font-black tracking-tight" style={{ color: ANALYZE_THEME.ink }}>
                    {step === 1 ? "Forgot your password?" : "Set new password"}
                  </h3>
                  <p className="text-xs font-medium mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
                    {step === 1
                      ? "Enter your email to receive a recovery OTP code."
                      : "Check your inbox for the 4-digit code."}
                  </p>
                </div>

                <AnimatePresence mode="wait">
                  {error && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mb-5 overflow-hidden">
                      <div className="p-3.5 rounded-xl flex items-center gap-2.5 text-xs font-bold" style={{ background: "#fdf2f2", border: `1px solid ${ANALYZE_THEME.down}30`, color: ANALYZE_THEME.down }}>
                        <AlertCircle size={16} className="shrink-0" />
                        <span>{error}</span>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {step === 1 ? (
                  <form onSubmit={handleRequestCode} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
                        Work Email Address <span className="text-red-500" aria-hidden="true">*</span>
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: ANALYZE_THEME.inkFaint }} />
                        <input
                          id="email"
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

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 mt-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 text-white cursor-pointer"
                      style={{ background: ANALYZE_THEME.accent }}
                    >
                      {isLoading ? "Sending OTP Code..." : "Send Verification Code"}
                      <ArrowRight size={16} />
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleResetPassword} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
                        Enter 4-Digit Verification OTP
                      </label>
                      <div className="relative">
                        <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: ANALYZE_THEME.inkFaint }} />
                        <input
                          type="text"
                          maxLength={4}
                          value={otp}
                          onChange={(e) => setOtp(e.target.value)}
                          placeholder="1234"
                          required
                          className="w-full pl-11 pr-4 py-2.5 text-sm font-bold tracking-widest rounded-xl border focus:outline-none transition-all"
                          style={{
                            background: ANALYZE_THEME.surface,
                            borderColor: ANALYZE_THEME.border,
                            color: ANALYZE_THEME.ink,
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
                        New Password
                      </label>
                      <div className="relative">
                        <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2" size={18} style={{ color: ANALYZE_THEME.inkFaint }} />
                        <input
                          type={showPassword ? "text" : "password"}
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="Min. 6 characters"
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

                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full py-3.5 px-4 mt-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 text-white cursor-pointer"
                      style={{ background: ANALYZE_THEME.accent }}
                    >
                      {isLoading ? "Updating Password..." : "Reset Password"}
                      <ArrowRight size={16} />
                    </button>
                  </form>
                )}
              </>
            )}
          </div>
        </motion.div>

      </div>
      <div />
    </div>
  );
}