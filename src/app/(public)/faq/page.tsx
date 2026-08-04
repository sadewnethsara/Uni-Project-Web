"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import {
  Sprout,
  ArrowLeft,
  Search,
  ChevronDown,
  HelpCircle,
  BarChart3,
  User,
  ShieldCheck,
  MessageSquare,
  ArrowRight,
  TrendingUp,
} from "lucide-react";
import { ANALYZE_THEME, PANEL_CLASS } from "@/lib/chartTheme";
import Footer from "@/components/Footer";
import NewsletterSection from "@/components/NewsletterSection";

type Category = "all" | "market_data" | "account" | "api";

interface FAQItem {
  id: string;
  category: Category;
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    id: "1",
    category: "market_data",
    question: "Where does AgriLanka source its spot market pricing?",
    answer:
      "Our pricing feeds are collected directly by on-site reporters stationed at major Sri Lankan Dedicated Economic Centers (DECs), including Dambulla, Pettah, Keppetipola, and Narahenpita. Rates are updated every morning between 5:30 AM and 8:00 AM before major trading begins.",
  },
  {
    id: "2",
    category: "market_data",
    question: "How often are prices updated on the terminal?",
    answer:
      "Wholesale spot market prices update twice daily (morning trade open and mid-day reconciliation). Historical charts and trend indexes refresh continuously as new transaction logs are verified.",
  },
  {
    id: "3",
    category: "market_data",
    question: "Are the prices wholesale or retail?",
    answer:
      "All baseline quotes on AgriLanka represent bulk wholesale spot prices (measured in LKR per Kilogram or Metric Ton). Retail margin estimates can be enabled in your terminal settings for consumer price indexing.",
  },
  {
    id: "4",
    category: "account",
    question: "How do I sign up for SMS price alerts?",
    answer:
      "Once you create an account and verify your phone number, navigate to 'Terminal Settings' > 'Alert Preferences'. Select your preferred economic hubs and specific crops to receive daily morning SMS digests.",
  },
  {
    id: "5",
    category: "account",
    question: "Can I share my account with team members?",
    answer:
      "Individual accounts are designed for single users. If you require multi-user access with shared watchlists and custom reporting, explore our Institutional or Enterprise plans.",
  },
  {
    id: "6",
    category: "api",
    question: "Does AgriLanka provide an API for business integration?",
    answer:
      "Yes! Our REST and WebSocket APIs allow enterprise buyers, food processors, and logistics providers to stream live price feeds directly into their ERPs or inventory management systems.",
  },
  {
    id: "7",
    category: "api",
    question: "What format is historical market data delivered in?",
    answer:
      "API subscribers can export historical price trends, arrival volume estimations, and district-level supply metrics in JSON, CSV, or formatted Excel sheets.",
  },
];

import { usePageTitle } from "@/hooks/usePageTitle";

export default function FaqPage() {
  usePageTitle("FAQ");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState<Category>("all");
  const [openId, setOpenId] = useState<string | null>("1");

  // Filter FAQs based on category and search query
  const filteredFaqs = FAQ_DATA.filter((item) => {
    const matchesCategory =
      activeCategory === "all" || item.category === activeCategory;
    const matchesSearch =
      item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleAccordion = (id: string) => {
    setOpenId(openId === id ? null : id);
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

      {/* Top Header Navigation */}
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
            href="/contact"
            className="text-xs font-bold px-3.5 py-2 rounded-xl hover:underline text-center"
            style={{ color: ANALYZE_THEME.inkMuted }}
          >
            Contact Support
          </Link>
          <Link
            href="/login"
            className="text-xs font-black px-4 py-2 rounded-xl text-white transition-all shadow-xs text-center"
            style={{ background: ANALYZE_THEME.accent }}
          >
            Sign In
          </Link>
        </div>
      </div>

      {/* Main Container */}
      <div className="w-full max-w-4xl mx-auto relative z-10 space-y-8 my-auto py-4">
        
        {/* Title & Search Bar */}
        <div className="text-center space-y-4 max-w-2xl mx-auto">
          <div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border text-[11px] font-black uppercase tracking-wider mb-1"
            style={{
              background: ANALYZE_THEME.accentSoft,
              borderColor: `${ANALYZE_THEME.accent}40`,
              color: ANALYZE_THEME.accentInk,
            }}
          >
            <HelpCircle size={14} />
            <span>Help Center & Knowledge Base</span>
          </div>

          <h1
            className="text-3xl sm:text-4xl font-black tracking-tight"
            style={{ color: ANALYZE_THEME.ink }}
          >
            Frequently Asked Questions
          </h1>

          <p
            className="text-xs sm:text-sm font-medium leading-relaxed"
            style={{ color: ANALYZE_THEME.inkMuted }}
          >
            Find answers regarding spot price gathering, market indexes, account configuration, and enterprise API feeds.
          </p>

          {/* Search Input Box */}
          <div className="relative pt-2">
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none mt-1"
              style={{ color: ANALYZE_THEME.inkMuted }}
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search questions (e.g., Dambulla, SMS alerts, API)..."
              className="w-full pl-11 pr-4 py-3 text-sm font-medium rounded-2xl border shadow-xs focus:outline-none transition-all"
              style={{
                background: ANALYZE_THEME.surface,
                borderColor: ANALYZE_THEME.border,
                color: ANALYZE_THEME.ink,
              }}
            />
          </div>
        </div>

        {/* Category Pill Filters */}
        <div className="flex items-center justify-center gap-2 flex-wrap pt-2">
          <CategoryPill
            label="All Questions"
            active={activeCategory === "all"}
            onClick={() => setActiveCategory("all")}
          />
          <CategoryPill
            label="Market Data & Spot Rates"
            icon={<BarChart3 size={14} />}
            active={activeCategory === "market_data"}
            onClick={() => setActiveCategory("market_data")}
          />
          <CategoryPill
            label="Account & Alerts"
            icon={<User size={14} />}
            active={activeCategory === "account"}
            onClick={() => setActiveCategory("account")}
          />
          <CategoryPill
            label="API & Integration"
            icon={<ShieldCheck size={14} />}
            active={activeCategory === "api"}
            onClick={() => setActiveCategory("api")}
          />
        </div>

        {/* FAQ Accordion List */}
        <div className="space-y-3 pt-2">
          {filteredFaqs.length > 0 ? (
            filteredFaqs.map((faq) => {
              const isOpen = openId === faq.id;
              return (
                <div
                  key={faq.id}
                  className={`${PANEL_CLASS} overflow-hidden transition-all`}
                  style={{
                    background: ANALYZE_THEME.surfaceRaised,
                    borderColor: ANALYZE_THEME.border,
                  }}
                >
                  <button
                    type="button"
                    onClick={() => toggleAccordion(faq.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer"
                  >
                    <span
                      className="text-sm font-bold sm:text-base pr-2"
                      style={{ color: ANALYZE_THEME.ink }}
                    >
                      {faq.question}
                    </span>
                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                      className="shrink-0 p-1.5 rounded-lg"
                      style={{
                        background: ANALYZE_THEME.surface,
                        color: ANALYZE_THEME.inkMuted,
                      }}
                    >
                      <ChevronDown size={16} />
                    </motion.div>
                  </button>

                  <AnimatePresence mode="wait">
                    {isOpen && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div
                          className="px-4 pb-5 sm:px-5 sm:pb-5 pt-1 text-xs sm:text-sm font-medium leading-relaxed border-t"
                          style={{
                            borderColor: `${ANALYZE_THEME.border}60`,
                            color: ANALYZE_THEME.inkMuted,
                          }}
                        >
                          {faq.answer}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })
          ) : (
            <div
              className={`${PANEL_CLASS} p-8 text-center space-y-2`}
              style={{
                background: ANALYZE_THEME.surfaceRaised,
                borderColor: ANALYZE_THEME.border,
              }}
            >
              <p className="text-sm font-bold" style={{ color: ANALYZE_THEME.ink }}>
                No matching questions found
              </p>
              <p className="text-xs font-medium" style={{ color: ANALYZE_THEME.inkMuted }}>
                Try adjusting your search terms or filter category.
              </p>
            </div>
          )}
        </div>

        {/* Support Banner CTA */}
        <div
          className={`${PANEL_CLASS} p-6 sm:p-8 relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-6`}
          style={{
            background: ANALYZE_THEME.surfaceRaised,
            borderColor: ANALYZE_THEME.border,
          }}
        >
          <div className="space-y-1 text-center sm:text-left">
            <h3 className="text-base font-black" style={{ color: ANALYZE_THEME.ink }}>
              Still have questions?
            </h3>
            <p className="text-xs font-medium" style={{ color: ANALYZE_THEME.inkMuted }}>
              Can't find the answer you're looking for? Speak directly to our market operations desk.
            </p>
          </div>

          <Link
            href="/contact"
            className="px-5 py-3 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 text-white shrink-0 shadow-xs"
            style={{ background: ANALYZE_THEME.accent }}
          >
            <MessageSquare size={15} />
            <span>Contact Market Desk</span>
          </Link>
        </div>

      </div>
      
    </div>
  );
}

function CategoryPill({
  label,
  icon,
  active,
  onClick,
}: {
  label: string;
  icon?: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border"
      style={{
        background: active ? ANALYZE_THEME.accent : ANALYZE_THEME.surface,
        borderColor: active ? ANALYZE_THEME.accent : ANALYZE_THEME.border,
        color: active ? "#ffffff" : ANALYZE_THEME.ink,
      }}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
}