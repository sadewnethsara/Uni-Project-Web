"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  LifeBuoy,
  ArrowLeft,
  Headphones,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Phone,
  MessageSquare,
  Paperclip,
  Send,
  ShieldAlert,
  Server,
  Zap,
  HelpCircle,
} from "lucide-react";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";
import { createClient } from "@/utils/supabase/client";

import { usePageTitle } from "@/hooks/usePageTitle";

export default function SupportDeskPage() {
  usePageTitle("Support Desk");
  const [ticketSubject, setTicketSubject] = useState("");
  const [category, setCategory] = useState("feed_issue");
  const [priority, setPriority] = useState("normal");
  const [description, setDescription] = useState("");
  const [phoneOrEmail, setPhoneOrEmail] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedTicketId, setSubmittedTicketId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage("");

    if (!ticketSubject || !description || !phoneOrEmail) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);

    try {
      const randomTicketId = `AGRI-SUP-${Math.floor(100000 + Math.random() * 900000)}`;
      const supabase = createClient();
      const { error: submitError } = await supabase
        .from("support_tickets")
        .insert([
          {
            ticket_id: randomTicketId,
            phone_or_email: phoneOrEmail,
            category: category,
            subject: ticketSubject,
            priority: priority,
            description: description,
          },
        ]);

      if (submitError) {
        throw new Error(submitError.message);
      }

      setSubmittedTicketId(randomTicketId);
    } catch (err: any) {
      setErrorMessage(err?.message || "An unexpected error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
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

      {/* Top Navigation */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between relative z-20 mb-6">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all border shadow-xs hover:bg-white/60 text-center"
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
            href="/faq"
            className="text-xs font-bold px-3.5 py-2 rounded-xl hover:underline flex items-center gap-1.5 text-center"
            style={{ color: ANALYZE_THEME.inkMuted }}
          >
            <HelpCircle size={15} />
            <span>Knowledge Base</span>
          </Link>
          <Link
            href="/login"
            className="text-xs font-black px-4 py-2 rounded-xl text-white transition-all shadow-xs text-center"
            style={{ background: ANALYZE_THEME.accent }}
          >
            Terminal Access
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-5xl mx-auto relative z-10 space-y-8 my-auto py-4">
        
        {/* Header Title */}
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider mb-1"
            style={{
              background: ANALYZE_THEME.accentSoft,
              borderColor: `${ANALYZE_THEME.accent}40`,
              color: ANALYZE_THEME.accentInk,
            }}
          >
            <Headphones size={14} />
            <span>Customer Care & Market Operations Desk</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ color: ANALYZE_THEME.ink }}
          >
            AgriLanka Support Desk
          </h1>

          <p
            className="text-xs sm:text-sm font-medium leading-relaxed"
            style={{ color: ANALYZE_THEME.inkMuted }}
          >
            Need help with market price feeds, SMS alerts, or account issues? Log a support ticket below or reach our market operators directly.
          </p>
        </div>

        {/* System Status Overview Bar */}
        <div
          className={`${PANEL_CLASS} p-4 sm:p-5 shadow-sm`}
          style={{
            background: ANALYZE_THEME.surfaceRaised,
            borderColor: ANALYZE_THEME.border,
          }}
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl" style={{ background: "#eef9f2", color: "#1b7a43" }}>
                <Zap size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-xs font-black uppercase tracking-wider" style={{ color: ANALYZE_THEME.ink }}>
                    System Status: Operational
                  </h3>
                </div>
                <p className="text-[11px] font-medium mt-0.5" style={{ color: ANALYZE_THEME.inkMuted }}>
                  Morning spot price reconciliation completed across 12 economic hubs.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 text-xs font-bold border-t md:border-t-0 md:border-l pt-3 md:pt-0 md:pl-6 w-full md:w-auto justify-around md:justify-start" style={{ borderColor: `${ANALYZE_THEME.border}80` }}>
              <StatusBadge label="Dambulla Hub" status="online" />
              <StatusBadge label="Pettah Market" status="online" />
              <StatusBadge label="SMS Gateway" status="online" />
              <StatusBadge label="REST API" status="online" />
            </div>
          </div>
        </div>

        {/* Two-Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Side: Direct Contact & Emergency Desk (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <h3 className="text-base font-black" style={{ color: ANALYZE_THEME.ink }}>
              Direct Operator Channels
            </h3>

            <ChannelBox
              icon={<Phone size={18} />}
              title="Hotline Support"
              detail="+94 11 234 5678 / +94 77 123 4567"
              sub="Mon – Sat: 5:30 AM – 7:30 PM (SLST)"
            />

            <ChannelBox
              icon={<MessageSquare size={18} />}
              title="Instant WhatsApp Support"
              detail="+94 70 999 8888"
              sub="Fastest response for active floor traders"
            />

            <ChannelBox
              icon={<Clock size={18} />}
              title="Expected Ticket SLA"
              detail="Normal: < 2 Hours | Urgent: < 15 Mins"
              sub="Critical feed discrepancies are escalated immediately"
            />

            {/* Emergency Discrepancy Notice Box */}
            <div
              className={`${PANEL_CLASS} p-4 border-l-4 space-y-1.5`}
              style={{
                background: "#fffbeb",
                borderColor: "#f59e0b",
              }}
            >
              <div className="flex items-center gap-2 text-xs font-black text-amber-800">
                <AlertTriangle size={16} />
                <span>Reporting Price Discrepancies?</span>
              </div>
              <p className="text-[11px] font-medium text-amber-900 leading-relaxed">
                If you observe a baseline spot price discrepancy exceeding ±10% at Dambulla or Pettah, mark your ticket priority as <strong>"Urgent / Critical"</strong> for immediate verification.
              </p>
            </div>
          </div>

          {/* Right Side: Interactive Support Ticket Form (7 Cols) */}
          <div className="lg:col-span-7">
            <div
              className={`${PANEL_CLASS} p-6 sm:p-8 shadow-xl relative`}
              style={{
                background: ANALYZE_THEME.surfaceRaised,
                borderColor: ANALYZE_THEME.border,
              }}
            >
              {submittedTicketId ? (
                <div className="text-center py-10 space-y-4">
                  <div
                    className="w-14 h-14 rounded-full mx-auto flex items-center justify-center"
                    style={{ background: "#eef9f2", color: "#1b7a43" }}
                  >
                    <CheckCircle2 size={32} />
                  </div>
                  <h3 className="text-2xl font-black" style={{ color: ANALYZE_THEME.ink }}>
                    Support Ticket Logged
                  </h3>
                  <p className="text-xs font-bold uppercase tracking-wider" style={{ color: ANALYZE_THEME.accentInk }}>
                    Ticket Reference: <span className="font-mono text-sm underline">{submittedTicketId}</span>
                  </p>
                  <p className="text-xs sm:text-sm font-medium max-w-md mx-auto" style={{ color: ANALYZE_THEME.inkMuted }}>
                    Your request has been dispatched to our Market Operations team. An acknowledgment has been routed to your phone/email.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedTicketId(null);
                      setTicketSubject("");
                      setDescription("");
                    }}
                    className="px-6 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all text-white mt-4 cursor-pointer"
                    style={{ background: ANALYZE_THEME.accent }}
                  >
                    Log Another Inquiry
                  </button>
                </div>
              ) : (
                <>
                  <div className="mb-6">
                    <h3 className="text-xl font-black" style={{ color: ANALYZE_THEME.ink }}>
                      Log a Support Ticket
                    </h3>
                    <p className="text-xs font-medium mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
                      Our support team monitors incoming issues continuously during trading hours.
                    </p>
                  </div>

                  <AnimatePresence mode="wait">
                    {errorMessage && (
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
                          <ShieldAlert size={16} className="shrink-0" />
                          <span>{errorMessage}</span>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
                          Contact Email or Mobile *
                        </label>
                        <input
                          type="text"
                          value={phoneOrEmail}
                          onChange={(e) => setPhoneOrEmail(e.target.value)}
                          placeholder="+94 7X XXX XXXX or name@domain.lk"
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
                          Issue Category
                        </label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border focus:outline-none transition-all cursor-pointer"
                          style={{
                            background: ANALYZE_THEME.surface,
                            borderColor: ANALYZE_THEME.border,
                            color: ANALYZE_THEME.ink,
                          }}
                        >
                          <option value="feed_issue">Market Price / Spot Feed Discrepancy</option>
                          <option value="sms_alert">SMS Alert Delivery Failure</option>
                          <option value="api_key">API / WebSocket Integration Issue</option>
                          <option value="billing">Billing & Subscription Plan</option>
                          <option value="general">General Platform Inquiry</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
                          Ticket Subject *
                        </label>
                        <input
                          type="text"
                          value={ticketSubject}
                          onChange={(e) => setTicketSubject(e.target.value)}
                          placeholder="e.g. Dambulla Tomato Spot Price Delay"
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
                          Priority Level
                        </label>
                        <select
                          value={priority}
                          onChange={(e) => setPriority(e.target.value)}
                          className="w-full px-4 py-2.5 text-sm font-medium rounded-xl border focus:outline-none transition-all cursor-pointer font-bold"
                          style={{
                            background: ANALYZE_THEME.surface,
                            borderColor: ANALYZE_THEME.border,
                            color: priority === "urgent" ? ANALYZE_THEME.down : ANALYZE_THEME.ink,
                          }}
                        >
                          <option value="normal">Normal Priority</option>
                          <option value="high">High Priority</option>
                          <option value="urgent">Urgent / Critical (Trading Affected)</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.ink }}>
                        Detailed Explanation *
                      </label>
                      <textarea
                        rows={4}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Provide details such as the relevant commodity, economic center, timestamp, or API endpoint..."
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
                      disabled={isSubmitting}
                      className="w-full py-3.5 px-4 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer text-white disabled:opacity-60"
                      style={{ background: ANALYZE_THEME.accent }}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          Submitting Ticket...
                        </>
                      ) : (
                        <>
                          <Send size={15} />
                          Submit Support Ticket
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function StatusBadge({ label, status }: { label: string; status: "online" | "degraded" | "offline" }) {
  return (
    <div className="flex items-center gap-1.5">
      <span
        className={`w-2 h-2 rounded-full ${
          status === "online" ? "bg-emerald-500" : status === "degraded" ? "bg-amber-500" : "bg-red-500"
        }`}
      />
      <span style={{ color: ANALYZE_THEME.ink }}>{label}</span>
    </div>
  );
}

function ChannelBox({
  icon,
  title,
  detail,
  sub,
}: {
  icon: React.ReactNode;
  title: string;
  detail: string;
  sub: string;
}) {
  return (
    <div
      className={`${PANEL_CLASS} p-4 flex items-start gap-3.5`}
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
        <p className="text-xs font-bold mt-0.5" style={{ color: ANALYZE_THEME.accentInk }}>
          {detail}
        </p>
        <p className="text-[11px] font-medium mt-0.5" style={{ color: ANALYZE_THEME.inkMuted }}>
          {sub}
        </p>
      </div>
    </div>
  );
}