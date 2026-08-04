"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Lock,
  Mail,
  User,
  ArrowRight,
  ArrowLeft,
  Eye,
  EyeOff,
  Sprout,
  CheckCircle2,
  AlertCircle,
  Building2,
  Phone,
  Briefcase,
  KeyRound,
  Check,
  ShieldAlert,
  Layers,
} from "lucide-react";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";

type UserRole = "buyer" | "farmer" | "trader";

import { usePageTitle } from "@/hooks/usePageTitle";

export default function SignupPage() {
  usePageTitle("Create Account");
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [role, setRole] = useState<UserRole>("buyer");

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");
  const [isOtpVerified, setIsOtpVerified] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [isSendingOtp, setIsSendingOtp] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const { login, register } = useAuth();
  const router = useRouter();

  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 8) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const passwordScore = getPasswordStrength();

  const handleSendOtp = async () => {
    if (!phone || phone.length < 9) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setError("");
    setIsSendingOtp(true);

    const code = Math.floor(1000 + Math.random() * 9000).toString();
    console.log("[Dev Info] Generated OTP:", code);

    try {
      const response = await fetch("/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          recipient: phone,
          otp: code,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "Failed to send OTP.");
      }

      setGeneratedOtp(code);
      setOtpSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send OTP. Please try again.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = () => {
    if (otp === generatedOtp) {
      setIsOtpVerified(true);
      setError("");
    } else {
      setError("Invalid OTP code. Please enter the correct code.");
    }
  };

  const handleNextStep = () => {
    setError("");
    if (step === 1) {
      setStep(2);
    } else if (step === 2) {
      if (!fullName.trim()) {
        setError("Please enter your full name.");
        return;
      }
      if (!isOtpVerified) {
        setError("Please verify your mobile number with OTP first.");
        return;
      }
      setStep(3);
    }
  };

  const handlePrevStep = () => {
    setError("");
    if (step > 1) setStep((prev) => (prev - 1) as 1 | 2 | 3);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName.trim()) {
      setError("Please enter your full name.");
      return;
    }

    if (!email || !password) {
      setError("Please fill out all required fields.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (!isOtpVerified) {
      setError("Please verify your mobile number with OTP first.");
      return;
    }

    setIsLoading(true);

    try {
      await register(fullName, email, password, role, phone);
      router.push("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden select-none"
      style={{
        background: `linear-gradient(165deg, ${ANALYZE_THEME.page} 0%, #efe4d4 48%, ${ANALYZE_THEME.page} 100%)`,
        borderRadius: "1.5rem",
      }}
    >
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
          <span className="hidden md:block">Already registered?</span>
          <Link
            href="/login"
            className="font-bold hover:underline"
            style={{ color: ANALYZE_THEME.accentInk }}
          >
            Sign in
          </Link>
        </div>
      </div>

      {/* Main Grid Content */}
      <div className="w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center relative z-10 my-auto py-4">

        {/* Left Side (7 Columns) — Onboarding & Value Propositions */}
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
                AgriLanka · New Registration
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
            Create your account & <br />
            <span style={{ color: ANALYZE_THEME.accentInk }}>
              unlock commercial price data
            </span>
          </h2>

          <p
            className="text-sm sm:text-base font-medium mb-8 leading-relaxed max-w-xl"
            style={{ color: ANALYZE_THEME.inkMuted }}
          >
            Join over 12,000 farmers, traders, and institutional buyers using direct economic center spot prices to negotiate better deals.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-8">
            <HighlightCard
              icon={<ShieldAlert size={18} />}
              title="SMS Price Alerts"
              description="Get instant notifications when vegetable or spice prices spike."
            />
            <HighlightCard
              icon={<Layers size={18} />}
              title="Historical Trends"
              description="Compare 3-year seasonal price cycles before planting or buying."
            />
          </div>

          <div className="space-y-3 pt-2 border-t" style={{ borderColor: `${ANALYZE_THEME.border}80` }}>
            <BenefitItem text="Free 30-day access to premium price forecasting" />
            <BenefitItem text="Multi-market comparative view (Pettah vs Dambulla)" />
            <BenefitItem text="Exportable CSV/Excel reports for financial planning" />
          </div>
        </motion.div>

        {/* Right Side (5 Columns) — Multi-Step Card */}
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
              <div className="flex items-center justify-between mb-2">
                <span
                  className="text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full inline-block"
                  style={{
                    background: ANALYZE_THEME.accentSoft,
                    color: ANALYZE_THEME.accentInk,
                  }}
                >
                  Step {step} of 3
                </span>
                <span className="text-xs font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
                  {step === 1 && "Account Role"}
                  {step === 2 && "Verification"}
                  {step === 3 && "Credentials"}
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                {[1, 2, 3].map((s) => (
                  <div
                    key={s}
                    className="h-1.5 rounded-full transition-all duration-300"
                    style={{
                      background:
                        s <= step ? ANALYZE_THEME.accent : ANALYZE_THEME.border,
                    }}
                  />
                ))}
              </div>
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

            <form onSubmit={handleSubmit}>
              <AnimatePresence mode="wait">

                {/* STEP 1 */}
                {step === 1 && (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-xl font-black" style={{ color: ANALYZE_THEME.ink }}>
                        Select account role
                      </h3>
                      <p className="text-xs font-medium mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
                        Tailors your dashboard view and market feeds.
                      </p>
                    </div>

                    <div className="space-y-3 pt-2">
                      <RoleCard
                        title="Commercial Buyer"
                        description="Supermarkets, exporters, and wholesale purchasers"
                        icon={<Briefcase size={18} />}
                        selected={role === "buyer"}
                        onClick={() => setRole("buyer")}
                      />
                      <RoleCard
                        title="Producer / Farmer"
                        description="Agricultural growers, farms, and cooperatives"
                        icon={<Sprout size={18} />}
                        selected={role === "farmer"}
                        onClick={() => setRole("farmer")}
                      />
                      <RoleCard
                        title="Market Trader"
                        description="Economic center stallholders and brokers"
                        icon={<Building2 size={18} />}
                        selected={role === "trader"}
                        onClick={() => setRole("trader")}
                      />
                    </div>

                    <button
                      type="button"
                      onClick={handleNextStep}
                      className="w-full py-3 px-4 mt-6 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-white"
                      style={{
                        background: ANALYZE_THEME.accent,
                      }}
                    >
                      Continue to Profile
                      <ArrowRight size={16} />
                    </button>
                  </motion.div>
                )}

                {/* STEP 2 */}
                {step === 2 && (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-xl font-black" style={{ color: ANALYZE_THEME.ink }}>
                        Personal Details & Mobile
                      </h3>
                      <p className="text-xs font-medium mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
                        Used for account security and price alert SMS.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
                        Full Name
                      </label>
                      <div className="relative">
                        <User
                          className="absolute left-3.5 top-1/2 -translate-y-1/2"
                          size={18}
                          style={{ color: ANALYZE_THEME.inkFaint }}
                        />
                        <input
                          type="text"
                          value={fullName}
                          onChange={(e) => setFullName(e.target.value)}
                          placeholder="e.g. Bandara Jayasundara"
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
                      <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
                        Mobile Number
                      </label>
                      <div className="flex gap-2">
                        <div className="relative flex-1">
                          <Phone
                            className="absolute left-3.5 top-1/2 -translate-y-1/2"
                            size={18}
                            style={{ color: ANALYZE_THEME.inkFaint }}
                          />
                          <input
                            type="tel"
                            disabled={isOtpVerified}
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            placeholder="+94 7X XXX XXXX"
                            className="w-full pl-11 pr-4 py-2.5 text-sm font-medium rounded-xl border focus:outline-none transition-all disabled:opacity-60"
                            style={{
                              background: ANALYZE_THEME.surface,
                              borderColor: ANALYZE_THEME.border,
                              color: ANALYZE_THEME.ink,
                            }}
                          />
                        </div>
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isOtpVerified || isSendingOtp}
                          className="px-3.5 py-2.5 text-xs font-bold rounded-xl border shrink-0 transition-all cursor-pointer disabled:opacity-50"
                          style={{
                            background: ANALYZE_THEME.accentSoft,
                            borderColor: ANALYZE_THEME.accent,
                            color: ANALYZE_THEME.accentInk,
                          }}
                        >
                          {isSendingOtp ? "Sending..." : otpSent ? "Resend OTP" : "Send OTP"}
                        </button>
                      </div>
                    </div>

                    {otpSent && !isOtpVerified && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        className="pt-1"
                      >
                        <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
                          Enter 4-Digit OTP
                        </label>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <KeyRound
                              className="absolute left-3.5 top-1/2 -translate-y-1/2"
                              size={18}
                              style={{ color: ANALYZE_THEME.inkFaint }}
                            />
                            <input
                              type="text"
                              maxLength={4}
                              value={otp}
                              onChange={(e) => setOtp(e.target.value)}
                              placeholder="1234"
                              className="w-full pl-11 pr-4 py-2.5 text-sm font-bold tracking-widest rounded-xl border focus:outline-none transition-all"
                              style={{
                                background: ANALYZE_THEME.surface,
                                borderColor: ANALYZE_THEME.border,
                                color: ANALYZE_THEME.ink,
                              }}
                            />
                          </div>
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            className="px-4 py-2.5 text-xs font-bold rounded-xl shrink-0 transition-all cursor-pointer text-white"
                            style={{
                              background: ANALYZE_THEME.accent,
                            }}
                          >
                            Verify
                          </button>
                        </div>
                      </motion.div>
                    )}

                    {isOtpVerified && (
                      <div
                        className="p-3 rounded-xl flex items-center gap-2 text-xs font-bold"
                        style={{ background: "#eef9f2", color: "#1b7a43" }}
                      >
                        <CheckCircle2 size={16} />
                        <span>Mobile number verified!</span>
                      </div>
                    )}

                    <div className="flex items-center gap-3 pt-4">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="p-3 rounded-xl border transition-all cursor-pointer"
                        style={{
                          borderColor: ANALYZE_THEME.border,
                          color: ANALYZE_THEME.inkMuted,
                        }}
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <button
                        type="button"
                        onClick={handleNextStep}
                        className="flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer text-white"
                        style={{
                          background: ANALYZE_THEME.accent,
                        }}
                      >
                        Next Step
                        <ArrowRight size={16} />
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* STEP 3 */}
                {step === 3 && (
                  <motion.div
                    key="step3"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <div>
                      <h3 className="text-xl font-black" style={{ color: ANALYZE_THEME.ink }}>
                        Credentials & Access
                      </h3>
                      <p className="text-xs font-medium mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
                        Set your email address and security password.
                      </p>
                    </div>

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
                      <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
                        Create Password
                      </label>
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
                          placeholder="Min. 8 characters"
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
                        >
                          {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                      </div>

                      {password.length > 0 && (
                        <div className="mt-2 flex items-center gap-1.5">
                          <div className="flex gap-1 flex-1">
                            {[1, 2, 3, 4].map((s) => (
                              <div
                                key={s}
                                className="h-1 flex-1 rounded-full transition-all"
                                style={{
                                  background:
                                    passwordScore >= s
                                      ? s <= 2
                                        ? "#e6a23c"
                                        : ANALYZE_THEME.accentInk
                                      : ANALYZE_THEME.border,
                                }}
                              />
                            ))}
                          </div>
                          <span
                            className="text-[10px] font-bold uppercase tracking-wider shrink-0"
                            style={{ color: ANALYZE_THEME.inkMuted }}
                          >
                            {passwordScore <= 1
                              ? "Weak"
                              : passwordScore <= 3
                                ? "Good"
                                : "Strong"}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="flex items-start gap-2 pt-1">
                      <input
                        type="checkbox"
                        id="terms"
                        required
                        className="mt-0.5 w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-gray-300 cursor-pointer shrink-0"
                      />
                      <label
                        htmlFor="terms"
                        className="text-xs font-medium leading-normal cursor-pointer select-none"
                        style={{ color: ANALYZE_THEME.inkMuted }}
                      >
                        I agree to the Terms of Service & Privacy Policy.
                      </label>
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={handlePrevStep}
                        className="p-3 rounded-xl border transition-all cursor-pointer"
                        style={{
                          borderColor: ANALYZE_THEME.border,
                          color: ANALYZE_THEME.inkMuted,
                        }}
                      >
                        <ArrowLeft size={16} />
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="flex-1 py-3 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer disabled:opacity-60 text-white"
                        style={{
                          background: ANALYZE_THEME.accent,
                        }}
                      >
                        {isLoading ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Creating Account...
                          </>
                        ) : (
                          <>
                            Complete Registration
                            <ArrowRight size={16} />
                          </>
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}

              </AnimatePresence>
            </form>
          </div>
        </motion.div>

      </div>
      <div />
    </div>
  );
}

function HighlightCard({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) {
  return (
    <div
      className={`${PANEL_CLASS} p-3.5 flex items-start gap-3`}
      style={{
        background: ANALYZE_THEME.surfaceRaised,
        borderColor: ANALYZE_THEME.border,
      }}
    >
      <div
        className="p-2 rounded-xl shrink-0"
        style={{
          background: ANALYZE_THEME.accentSoft,
          color: ANALYZE_THEME.accentInk,
        }}
      >
        {icon}
      </div>
      <div>
        <h4 className="text-xs font-black" style={{ color: ANALYZE_THEME.ink }}>
          {title}
        </h4>
        <p className="text-[11px] font-medium leading-relaxed mt-0.5" style={{ color: ANALYZE_THEME.inkMuted }}>
          {description}
        </p>
      </div>
    </div>
  );
}

function BenefitItem({ text }: { text: string }) {
  return (
    <div className="flex items-center gap-2.5">
      <CheckCircle2 size={16} style={{ color: ANALYZE_THEME.accentInk }} className="shrink-0" />
      <span className="text-xs sm:text-sm font-bold" style={{ color: ANALYZE_THEME.ink }}>
        {text}
      </span>
    </div>
  );
}

function RoleCard({
  title,
  description,
  icon,
  selected,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full p-3.5 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-3"
      style={{
        background: selected ? ANALYZE_THEME.accentSoft : ANALYZE_THEME.surface,
        borderColor: selected ? ANALYZE_THEME.accent : ANALYZE_THEME.border,
      }}
    >
      <div className="flex items-center gap-3">
        <div
          className="p-2.5 rounded-xl shrink-0"
          style={{
            background: selected ? ANALYZE_THEME.accent : ANALYZE_THEME.surfaceRaised,
            color: selected ? "#ffffff" : ANALYZE_THEME.inkMuted,
          }}
        >
          {icon}
        </div>
        <div>
          <h4
            className="text-xs font-black"
            style={{ color: selected ? ANALYZE_THEME.accentInk : ANALYZE_THEME.ink }}
          >
            {title}
          </h4>
          <p className="text-[11px] font-medium mt-0.5" style={{ color: ANALYZE_THEME.inkMuted }}>
            {description}
          </p>
        </div>
      </div>
      {selected && (
        <div
          className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
          style={{ background: ANALYZE_THEME.accent, color: "#ffffff" }}
        >
          <Check size={12} strokeWidth={3} />
        </div>
      )}
    </button>
  );
}