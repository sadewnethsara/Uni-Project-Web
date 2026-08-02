"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import {
  FileText,
  ArrowLeft,
  ShieldAlert,
  AlertTriangle,
  Scale,
  Ban,
  Lock,
  Cpu,
  Globe,
  ChevronRight,
  HelpCircle,
} from "lucide-react";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";

const SECTIONS = [
  { id: "acceptance", title: "1. Acceptance of Terms" },
  { id: "disclaimer", title: "2. Market Data Disclaimer" },
  { id: "accounts", title: "3. Account Responsibilities" },
  { id: "usage", title: "4. Acceptable Use & Scraping" },
  { id: "intellectual", title: "5. Intellectual Property" },
  { id: "liability", title: "6. Limitation of Liability" },
  { id: "contact", title: "7. Legal Inquiries" },
];

export default function TermsPage() {
  const [activeSection, setActiveSection] = useState("acceptance");

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
      {/* Background Decorative Glows */}
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
            href="/privacy"
            className="text-xs font-bold px-3.5 py-2 rounded-xl hover:underline text-center"
            style={{ color: ANALYZE_THEME.inkMuted }}
          >
            Privacy Policy
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
              <FileText size={14} />
              <span>User Agreement</span>
            </div>
            <h1
              className="text-2xl sm:text-3xl font-black tracking-tight"
              style={{ color: ANALYZE_THEME.ink }}
            >
              Terms of Service
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
          
          {/* Notice Card */}
          <div
            className={`${PANEL_CLASS} p-6 border-l-4`}
            style={{
              background: ANALYZE_THEME.surfaceRaised,
              borderColor: ANALYZE_THEME.accent,
            }}
          >
            <p className="text-xs sm:text-sm font-medium leading-relaxed" style={{ color: ANALYZE_THEME.ink }}>
              Please read these Terms of Service carefully before accessing or using the <strong>AgriLanka Terminal</strong>, mobile APIs, or SMS notification networks. By registering an account or accessing price feeds, you agree to be bound by these legal terms.
            </p>
          </div>

          {/* Terms Content Panel */}
          <div
            className={`${PANEL_CLASS} p-6 sm:p-8 space-y-8`}
            style={{
              background: ANALYZE_THEME.surfaceRaised,
              borderColor: ANALYZE_THEME.border,
            }}
          >
            {/* Section 1 */}
            <section id="acceptance" className="space-y-3">
              <h2 className="text-base font-black flex items-center gap-2" style={{ color: ANALYZE_THEME.ink }}>
                <Scale size={18} style={{ color: ANALYZE_THEME.accentInk }} />
                1. Acceptance of Terms
              </h2>
              <div className="text-xs sm:text-sm font-medium space-y-2 leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                <p>
                  By creating an account or using any service provided by AgriLanka Intelligence Network ("AgriLanka", "we", "us"), you confirm that you are at least 18 years old or operating under legal commercial authority in Sri Lanka.
                </p>
                <p>
                  If you are using the terminal on behalf of a corporate entity, cooperative, or wholesale enterprise, you represent that you have the authority to bind that organization to these terms.
                </p>
              </div>
            </section>

            <hr style={{ borderColor: `${ANALYZE_THEME.border}60` }} />

            {/* Section 2 */}
            <section id="disclaimer" className="space-y-3">
              <h2 className="text-base font-black flex items-center gap-2" style={{ color: ANALYZE_THEME.ink }}>
                <AlertTriangle size={18} style={{ color: ANALYZE_THEME.accentInk }} />
                2. Market Data & Pricing Disclaimer
              </h2>
              <div className="text-xs sm:text-sm font-medium space-y-2 leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                <p>
                  AgriLanka collects, standardizes, and publishes daily agricultural spot prices and arrival estimates from Sri Lankan Dedicated Economic Centers (including Dambulla, Pettah, and Keppetipola).
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li><strong>Informational Purpose Only:</strong> Market feeds, price indexes, and yield estimates are provided for informational and analytical purposes. They do not constitute binding commercial price quotes or financial advice.</li>
                  <li><strong>No Guaranteed Execution:</strong> Actual transaction rates negotiated between buyers and sellers at economic hubs may vary based on commodity grade, moisture content, transport logistics, and private settlement terms.</li>
                </ul>
              </div>
            </section>

            <hr style={{ borderColor: `${ANALYZE_THEME.border}60` }} />

            {/* Section 3 */}
            <section id="accounts" className="space-y-3">
              <h2 className="text-base font-black flex items-center gap-2" style={{ color: ANALYZE_THEME.ink }}>
                <Lock size={18} style={{ color: ANALYZE_THEME.accentInk }} />
                3. Account Security & Verification
              </h2>
              <div className="text-xs sm:text-sm font-medium space-y-2 leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                <p>
                  Subscribers are responsible for maintaining the confidentiality of their credentials and OTP verification codes. You agree to:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Provide accurate and complete registration information (including a valid mobile phone number).</li>
                  <li>Notify us immediately of any unauthorized access to your account or security breach.</li>
                  <li>Prevent account sharing across unauthorized third parties outside of approved Enterprise team licenses.</li>
                </ul>
              </div>
            </section>

            <hr style={{ borderColor: `${ANALYZE_THEME.border}60` }} />

            {/* Section 4 */}
            <section id="usage" className="space-y-3">
              <h2 className="text-base font-black flex items-center gap-2" style={{ color: ANALYZE_THEME.ink }}>
                <Ban size={18} style={{ color: ANALYZE_THEME.accentInk }} />
                4. Acceptable Use & Scraping Prohibition
              </h2>
              <div className="text-xs sm:text-sm font-medium space-y-2 leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                <p>
                  To protect the integrity of the network, subscribers are strictly prohibited from:
                </p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Deploying automated web scrapers, bots, or extraction scripts to harvest pricing data without an active Enterprise API license.</li>
                  <li>Attempting to manipulate, fabricate, or inject false spot rate submissions into the platform.</li>
                  <li>Reselling or redistributing raw AgriLanka price feeds to third-party commercial databases without explicit authorization.</li>
                </ul>
              </div>
            </section>

            <hr style={{ borderColor: `${ANALYZE_THEME.border}60` }} />

            {/* Section 5 */}
            <section id="intellectual" className="space-y-3">
              <h2 className="text-base font-black flex items-center gap-2" style={{ color: ANALYZE_THEME.ink }}>
                <Cpu size={18} style={{ color: ANALYZE_THEME.accentInk }} />
                5. Intellectual Property
              </h2>
              <div className="text-xs sm:text-sm font-medium space-y-2 leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                <p>
                  All platform software, historical pricing databases, proprietary index algorithms, visual interfaces, and trademarks remain the sole property of AgriLanka Intelligence Network.
                </p>
              </div>
            </section>

            <hr style={{ borderColor: `${ANALYZE_THEME.border}60` }} />

            {/* Section 6 */}
            <section id="liability" className="space-y-3">
              <h2 className="text-base font-black flex items-center gap-2" style={{ color: ANALYZE_THEME.ink }}>
                <ShieldAlert size={18} style={{ color: ANALYZE_THEME.accentInk }} />
                6. Limitation of Liability
              </h2>
              <div className="text-xs sm:text-sm font-medium space-y-2 leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                <p>
                  To the maximum extent permitted under Sri Lankan law, AgriLanka shall not be liable for direct, indirect, incidental, or consequential losses—including trading losses, spoiled produce, or lost revenues—resulting from price volatility, network downtime, or data delays.
                </p>
              </div>
            </section>

            <hr style={{ borderColor: `${ANALYZE_THEME.border}60` }} />

            {/* Section 7 */}
            <section id="contact" className="space-y-3">
              <h2 className="text-base font-black flex items-center gap-2" style={{ color: ANALYZE_THEME.ink }}>
                <Globe size={18} style={{ color: ANALYZE_THEME.accentInk }} />
                7. Legal Inquiries & Governance
              </h2>
              <div className="text-xs sm:text-sm font-medium space-y-2 leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                <p>
                  For questions regarding these Terms of Service or corporate legal compliance, reach out to our legal desk:
                </p>
                <div
                  className="p-4 rounded-xl border mt-2 space-y-1"
                  style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}
                >
                  <p className="font-bold" style={{ color: ANALYZE_THEME.ink }}>AgriLanka Legal Affairs</p>
                  <p>Email: legal@agrilanka.lk</p>
                  <p>Address: Level 8, Central Commercial Tower, Rajagiriya, Colombo</p>
                </div>
              </div>
            </section>

          </div>

        </div>

      </div>
    </div>
  );
}