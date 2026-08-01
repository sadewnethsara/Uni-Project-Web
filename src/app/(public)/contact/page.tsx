"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Sprout,
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  Send,
  MessageSquare,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building2,
  HelpCircle,
} from "lucide-react";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";

export default function ContactPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [subject, setSubject] = useState("general");
  const [message, setMessage] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!fullName || !email || !message) {
      setError("Please complete all required fields.");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 1000);
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden select-none rounded-t-2xl"
      style={{
        background: `linear-gradient(165deg, ${ANALYZE_THEME.page} 0%, #efe4d4 48%, ${ANALYZE_THEME.page} 100%)`,
      }}
    >
      {/* Decorative Glows */}
      <div
        className="absolute top-10 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: ANALYZE_THEME.accentSoft }}
      />
      <div
        className="absolute bottom-10 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: "#d4e0d7" }}
      />

      {/* Top Navigation Bar */}
      <div className="w-full max-w-7xl mx-auto flex items-center justify-between relative z-20 mb-6">
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

        <div className="flex items-center gap-3">
          <Link
            href="/about"
            className="text-xs font-bold px-3.5 py-2 rounded-xl hover:underline"
            style={{ color: ANALYZE_THEME.inkMuted }}
          >
            About Us
          </Link>
          <Link
            href="/login"
            className="text-xs font-black px-4 py-2 rounded-xl text-white transition-all shadow-xs"
            style={{ background: ANALYZE_THEME.accent }}
          >
            Terminal Access
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start my-auto py-4">
        
        {/* Left Side (5 Columns) — Contact Details */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="lg:col-span-5 space-y-6"
        >
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider mb-3"
              style={{
                background: ANALYZE_THEME.accentSoft,
                borderColor: `${ANALYZE_THEME.accent}40`,
                color: ANALYZE_THEME.accentInk,
              }}
            >
              <MessageSquare size={14} />
              <span>Get in Touch</span>
            </div>
            <h1
              className="text-3xl sm:text-4xl font-black tracking-tight"
              style={{ color: ANALYZE_THEME.ink }}
            >
              We are here to help <br />
              <span style={{ color: ANALYZE_THEME.accentInk }}>
                your agricultural trade
              </span>
            </h1>
            <p
              className="text-xs sm:text-sm font-medium mt-3 leading-relaxed"
              style={{ color: ANALYZE_THEME.inkMuted }}
            >
              Have questions about spot price feeds, enterprise data APIs, or partnership opportunities? Reach out to our team in Colombo.
            </p>
          </div>

          {/* Info Cards */}
          <div className="space-y-3">
            <InfoBox
              icon={<Phone size={18} />}
              title="Hotline & Support"
              subtitle="+94 11 234 5678 / +94 77 123 4567"
            />
            <InfoBox
              icon={<Mail size={18} />}
              title="Email Inquiries"
              subtitle="support@agrilanka.lk / info@agrilanka.lk"
            />
            <InfoBox
              icon={<MapPin size={18} />}
              title="Headquarters"
              subtitle="Level 8, Central Commercial Tower, Rajagiriya, Colombo"
            />
            <InfoBox
              icon={<Clock size={18} />}
              title="Market Desk Hours"
              subtitle="Monday – Saturday: 5:30 AM – 7:30 PM (SLST)"
            />
          </div>
        </motion.div>

        {/* Right Side (7 Columns) — Interactive Contact Form */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="lg:col-span-7"
        >
          <div
            className={`${PANEL_CLASS} p-6 sm:p-8 shadow-xl relative`}
            style={{
              background: ANALYZE_THEME.surfaceRaised,
              borderColor: ANALYZE_THEME.border,
            }}
          >
            {isSubmitted ? (
              <div className="text-center py-10 space-y-4">
                <div
                  className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
                  style={{ background: "#eef9f2", color: "#1b7a43" }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <h3 className="text-2xl font-black" style={{ color: ANALYZE_THEME.ink }}>
                  Message Sent Successfully
                </h3>
                <p className="text-xs sm:text-sm font-medium max-w-md mx-auto" style={{ color: ANALYZE_THEME.inkMuted }}>
                  Thank you for reaching out. Our market analysis team will review your inquiry and respond within 2 business hours.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setIsSubmitted(false);
                    setMessage("");
                  }}
                  className="px-6 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all text-white mt-4 cursor-pointer"
                  style={{ background: ANALYZE_THEME.accent }}
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <>
                <div className="mb-6">
                  <h3 className="text-xl font-black" style={{ color: ANALYZE_THEME.ink }}>
                    Send us a message
                  </h3>
                  <p className="text-xs font-medium mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
                    Fill in the form below and our team will get back to you promptly.
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
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
                        Full Name *
                      </label>
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Nimal Perera"
                        required
                        className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border focus:outline-none transition-all"
                        style={{
                          background: ANALYZE_THEME.surface,
                          borderColor: ANALYZE_THEME.border,
                          color: ANALYZE_THEME.ink,
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
                        Work Email *
                      </label>
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="nimal@example.lk"
                        required
                        className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border focus:outline-none transition-all"
                        style={{
                          background: ANALYZE_THEME.surface,
                          borderColor: ANALYZE_THEME.border,
                          color: ANALYZE_THEME.ink,
                        }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
                        Mobile Phone
                      </label>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+94 7X XXX XXXX"
                        className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border focus:outline-none transition-all"
                        style={{
                          background: ANALYZE_THEME.surface,
                          borderColor: ANALYZE_THEME.border,
                          color: ANALYZE_THEME.ink,
                        }}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
                        Inquiry Topic
                      </label>
                      <select
                        value={subject}
                        onChange={(e) => setSubject(e.target.value)}
                        className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border focus:outline-none transition-all cursor-pointer"
                        style={{
                          background: ANALYZE_THEME.surface,
                          borderColor: ANALYZE_THEME.border,
                          color: ANALYZE_THEME.ink,
                        }}
                      >
                        <option value="general">General Inquiry</option>
                        <option value="price_discrepancy">Price Data Correction</option>
                        <option value="enterprise">Enterprise API Access</option>
                        <option value="account">Account Support</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
                      Your Message *
                    </label>
                    <textarea
                      rows={4}
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Describe your request or question in detail..."
                      required
                      className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border focus:outline-none transition-all resize-none"
                      style={{
                        background: ANALYZE_THEME.surface,
                        borderColor: ANALYZE_THEME.border,
                        color: ANALYZE_THEME.ink,
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer text-white disabled:opacity-60"
                    style={{ background: ANALYZE_THEME.accent }}
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Transmitting...
                      </>
                    ) : (
                      <>
                        <Send size={15} />
                        Submit Message
                      </>
                    )}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>

      </div>
    </div>
  );
}

function InfoBox({ icon, title, subtitle }: { icon: React.ReactNode; title: string; subtitle: string }) {
  return (
    <div
      className={`${PANEL_CLASS} p-3.5 flex items-start gap-3`}
      style={{
        background: ANALYZE_THEME.surfaceRaised,
        borderColor: ANALYZE_THEME.border,
      }}
    >
      <div
        className="p-2.5 rounded-xl shrink-0"
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
          {subtitle}
        </p>
      </div>
    </div>
  );
}