"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  ShieldCheck,
  ArrowLeft,
  Lock,
  Eye,
  Database,
  UserCheck,
  FileText,
  Mail,
  ChevronRight,
} from "lucide-react";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";

const SECTIONS = [
  { id: "collection", title: "1. Data We Collect" },
  { id: "usage", title: "2. How We Use Your Data" },
  { id: "sms_alerts", title: "3. Mobile & SMS Data Rules" },
  { id: "sharing", title: "4. Third-Party Disclosures" },
  { id: "security", title: "5. Data Security & Storage" },
  { id: "rights", title: "6. Your Rights & Control" },
  { id: "contact", title: "7. Privacy Desk Contact" },
];

import { usePageTitle } from "@/hooks/usePageTitle";

export default function PrivacyPage() {
  usePageTitle("Privacy Policy");
  const [activeSection, setActiveSection] = useState("collection");

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <div
      className="min-h-screen w-full flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden select-none rounded-t-2xl"
      style={{
        background: `linear-gradient(165deg, ${ANALYZE_THEME.page} 0%, #efe4d4 48%, ${ANALYZE_THEME.page} 100%)`,
      }}
    >
      {/* Background Decorative Elements */}
      <div
        className="absolute top-10 -right-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-3xl pointer-events-none opacity-40"
        style={{ background: ANALYZE_THEME.accentSoft }}
      />
      <div
        className="absolute bottom-10 -left-20 w-80 sm:w-96 h-80 sm:h-96 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: "#d4e0d7" }}
      />

      {/* Navigation Header */}
      <div className="w-full max-w-5xl mx-auto flex items-center justify-between relative z-20 mb-8">
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
            href="/terms"
            className="text-xs font-bold px-3.5 py-2 rounded-xl hover:underline text-center"
            style={{ color: ANALYZE_THEME.inkMuted }}
          >
            Terms of Service
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
      <div className="w-full max-w-5xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-auto py-4">
        
        {/* Left Sticky Sidebar Index (4 Cols) */}
        <div className="lg:col-span-4 space-y-4 lg:sticky lg:top-8">
          <div>
            <div
              className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider mb-2"
              style={{
                background: ANALYZE_THEME.accentSoft,
                borderColor: `${ANALYZE_THEME.accent}40`,
                color: ANALYZE_THEME.accentInk,
              }}
            >
              <ShieldCheck size={14} />
              <span>Legal Compliance</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ color: ANALYZE_THEME.ink }}
            >
              Privacy Policy
            </h1>
            <p className="text-xs font-medium mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
              Last revised: July 2026
            </p>
          </div>

          <div
            className={`${PANEL_CLASS} p-3 space-y-1`}
            style={{
              background: ANALYZE_THEME.surfaceRaised,
              borderColor: ANALYZE_THEME.border,
            }}
          >
            {SECTIONS.map((sec) => {
              const isActive = activeSection === sec.id;
              return (
                <button
                  key={sec.id}
                  type="button"
                  onClick={() => scrollToSection(sec.id)}
                  className="w-full text-left px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-between cursor-pointer"
                  style={{
                    background: isActive ? ANALYZE_THEME.accentSoft : "transparent",
                    color: isActive ? ANALYZE_THEME.accentInk : ANALYZE_THEME.ink,
                  }}
                >
                  <span>{sec.title}</span>
                  {isActive && <ChevronRight size={14} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Content Column (8 Cols) */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Introductory Card */}
          <div
            className={`${PANEL_CLASS} p-6 border-l-4`}
            style={{
              background: ANALYZE_THEME.surfaceRaised,
              borderColor: ANALYZE_THEME.accent,
            }}
          >
            <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: ANALYZE_THEME.ink }}>
              At <strong>AgriLanka Intelligence Network</strong>, protecting subscriber data and trader identity is integral to maintaining open, unmanipulated commodity markets. This policy outlines how we collect, process, and secure user information across our Web Terminal, Mobile APIs, and SMS Price Feeds.
            </p>
          </div>

          {/* Policy Detail Sections */}
          <div
            className={`${PANEL_CLASS} p-6 sm:p-8 space-y-8`}
            style={{
              background: ANALYZE_THEME.surfaceRaised,
              borderColor: ANALYZE_THEME.border,
            }}
          >
            {/* Section 1 */}
            <section id="collection" className="space-y-3">
              <h2 className="text-base font-black flex items-center gap-2" style={{ color: ANALYZE_THEME.ink }}>
                <Database size={18} style={{ color: ANALYZE_THEME.accentInk }} />
                1. Data We Collect
              </h2>
              <div className="text-xs sm:text-sm font-medium space-y-2 leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                <p>We collect essential information necessary to deliver accurate spot rate indexes and account management services:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Account Identifiers:</strong> Name, work email address, and mobile phone number for OTP authentication.</li>
                  <li><strong>Trading Preferences:</strong> Selected crops, watchlists, and economic center subscriptions (e.g., Dambulla, Pettah).</li>
                  <li><strong>Field Submission Data:</strong> Price quotes and volume metrics submitted by verified market reporters or institutional traders.</li>
                  <li><strong>Technical Telemetry:</strong> IP address, device type, browser logs, and session tokens used to detect unauthorized automated scrapers.</li>
                </ul>
              </div>
            </section>

            <hr style={{ borderColor: `${ANALYZE_THEME.border}60` }} />

            {/* Section 2 */}
            <section id="usage" className="space-y-3">
              <h2 className="text-base font-black flex items-center gap-2" style={{ color: ANALYZE_THEME.ink }}>
                <Eye size={18} style={{ color: ANALYZE_THEME.accentInk }} />
                2. How We Use Your Data
              </h2>
              <div className="text-xs sm:text-sm font-medium space-y-2 leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                <p>Your information is processed strictly for the following operational tasks:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Delivering daily morning spot price alerts via SMS and push notifications.</li>
                  <li>Aggregating anonymized market price data into official district indexes.</li>
                  <li>Preventing fraud, wash trading reporting, and price index manipulation.</li>
                  <li>Processing enterprise API subscriptions and authentication tokens.</li>
                </ul>
              </div>
            </section>

            <hr style={{ borderColor: `${ANALYZE_THEME.border}60` }} />

            {/* Section 3 */}
            <section id="sms_alerts" className="space-y-3">
              <h2 className="text-base font-black flex items-center gap-2" style={{ color: ANALYZE_THEME.ink }}>
                <Lock size={18} style={{ color: ANALYZE_THEME.accentInk }} />
                3. Mobile & SMS Data Protection
              </h2>
              <div className="text-xs sm:text-sm font-medium space-y-2 leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                <p>
                  AgriLanka maintains strict protocols regarding mobile contact details. Mobile phone numbers collected for OTP verification or daily price alerts are <strong>never sold, rented, or shared</strong> with third-party telemarketers or external advertisers.
                </p>
                <p>
                  You can opt out of SMS alerts at any time by updating your preferences in the terminal settings or by replying "STOP" to any automated market update message.
                </p>
              </div>
            </section>

            <hr style={{ borderColor: `${ANALYZE_THEME.border}60` }} />

            {/* Section 4 */}
            <section id="sharing" className="space-y-3">
              <h2 className="text-base font-black flex items-center gap-2" style={{ color: ANALYZE_THEME.ink }}>
                <UserCheck size={18} style={{ color: ANALYZE_THEME.accentInk }} />
                4. Third-Party Disclosures
              </h2>
              <div className="text-xs sm:text-sm font-medium space-y-2 leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                <p>
                  We do not monetise individual subscriber data. Data is shared exclusively with technical service providers under binding confidentiality terms to maintain our infrastructure:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>SMS Gateway Partners:</strong> Local Sri Lankan telecom operators for dispatching time-sensitive trading digests.</li>
                  <li><strong>Cloud Infrastructure Providers:</strong> Encrypted database hosts for uptime and redundant data backups.</li>
                  <li><strong>Regulatory Authorities:</strong> Only when strictly mandated by Sri Lankan law or official judicial orders.</li>
                </ul>
              </div>
            </section>

            <hr style={{ borderColor: `${ANALYZE_THEME.border}60` }} />

            {/* Section 5 */}
            <section id="security" className="space-y-3">
              <h2 className="text-base font-black flex items-center gap-2" style={{ color: ANALYZE_THEME.ink }}>
                <ShieldCheck size={18} style={{ color: ANALYZE_THEME.accentInk }} />
                5. Data Security & Storage
              </h2>
              <div className="text-xs sm:text-sm font-medium space-y-2 leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                <p>
                  All active network traffic is encrypted using standard TLS 1.3 encryption protocols. Sensitive credentials, including API keys and hashed access tokens, are stored using industry-standard key vault infrastructure.
                </p>
              </div>
            </section>

            <hr style={{ borderColor: `${ANALYZE_THEME.border}60` }} />

            {/* Section 6 */}
            <section id="rights" className="space-y-3">
              <h2 className="text-base font-black flex items-center gap-2" style={{ color: ANALYZE_THEME.ink }}>
                <FileText size={18} style={{ color: ANALYZE_THEME.accentInk }} />
                6. Your Rights & Control
              </h2>
              <div className="text-xs sm:text-sm font-medium space-y-2 leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                <p>Subscribers hold complete ownership over their account profiles. You have the right to:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Request a full export of your personal platform interaction history.</li>
                  <li>Request immediate deletion of your account credentials and personal records.</li>
                  <li>Modify active crop alert subscriptions at any time.</li>
                </ul>
              </div>
            </section>

            <hr style={{ borderColor: `${ANALYZE_THEME.border}60` }} />

            {/* Section 7 */}
            <section id="contact" className="space-y-3">
              <h2 className="text-base font-black flex items-center gap-2" style={{ color: ANALYZE_THEME.ink }}>
                <Mail size={18} style={{ color: ANALYZE_THEME.accentInk }} />
                7. Privacy Desk Contact
              </h2>
              <div className="text-xs sm:text-sm font-medium space-y-2 leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                <p>
                  For privacy-related inquiries, data export requests, or security disclosures, contact our Data Governance team:
                </p>
                <div
                  className="p-4 rounded-xl border mt-2 space-y-1"
                  style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}
                >
                  <p className="font-bold" style={{ color: ANALYZE_THEME.ink }}>AgriLanka Data Privacy Officer</p>
                  <p>Email: privacy@agrilanka.lk</p>
                  <p>Location: Level 8, Central Commercial Tower, Rajagiriya, Colombo</p>
                </div>
              </div>
            </section>

          </div>

        </div>

      </div>
    </div>
  );
}