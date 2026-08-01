import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import {
  DollarSign,
  Plus,
  FolderOpen,
  Package,
  ShieldCheck,
  MapPin,
  Brain,
  Cloud,
  TrendingUp,
  Save,
  LucideIcon,
} from "lucide-react";
import { ANALYZE_THEME } from "@/lib/chartTheme";
import { loadAdmins, loadCategories, loadItems, loadMarkets } from "@/lib/storage";

// Types
export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "super" | "market" | "viewer" | string;
  marketId?: string;
  createdAt?: string;
  isActive?: boolean;
}

export type MarketType = "dambulla" | "kappetipola" | null;

interface OverviewManagementProps {
  market: MarketType;
  admin: Admin | null;
  onNavigate?: (actionId: string) => void;
}

interface QuickAction {
  id: string;
  label: string;
  icon: LucideIcon;
  desc: string;
  color: string;
}

// Fallback Theme object if not globally imported
const DEFAULT_THEME = {
  accent: "#10b981",
  accentSoft: "#e6f4ea",
  accentInk: "#047857",
  surface: "#f9fafb",
  surfaceRaised: "#ffffff",
  border: "#e5e7eb",
  ink: "#111827",
  inkMuted: "#4b5563",
  inkFaint: "#9ca3af",
};

// Replace with your global ANALYZE_THEME import if available
const THEME = typeof ANALYZE_THEME !== "undefined" ? ANALYZE_THEME : DEFAULT_THEME;

export function OverviewManagement({ market, admin, onNavigate }: OverviewManagementProps) {
  const [stats] = useState(() => ({
    categories: loadCategories().length,
    items: loadItems().length,
    markets: loadMarkets().length,
    admins: loadAdmins().length,
  }));

  const isSuperAdmin = admin?.role === "super";

  const getMarketName = (marketKey: MarketType) => {
    switch (marketKey) {
      case "dambulla":
        return "Dambulla Dedicated Economic Center";
      case "kappetipola":
        return "Keppetipola Dedicated Economic Center";
      default:
        return "Dedicated Economic Center Panel";
    }
  };

  const quickActions = useMemo<QuickAction[]>(() => {
    const baseActions: QuickAction[] = [
      { id: "prices", label: "Update Prices", icon: DollarSign, desc: "Edit today's market prices", color: THEME.accent },
      { id: "quickadd", label: "Quick Add", icon: Plus, desc: "Fast data entry workflow", color: "#8b5cf6" },
      { id: "categories", label: "Categories", icon: FolderOpen, desc: "Manage produce categories", color: "#f59e0b" },
      { id: "items", label: "Items", icon: Package, desc: "Add or edit produce items", color: "#10b981" },
    ];

    if (isSuperAdmin) {
      return [
        ...baseActions,
        { id: "admins", label: "Admins", icon: ShieldCheck, desc: "Manage user permissions", color: "#ef4444" },
        { id: "markets", label: "Markets", icon: MapPin, desc: "Configure economic centers", color: "#3b82f6" },
      ];
    }

    return baseActions;
  }, [isSuperAdmin]);

  const metrics = [
    { label: "Categories", value: stats.categories, icon: FolderOpen, badge: "+12%" },
    { label: "Produce Items", value: stats.items, icon: Package, badge: "+8%" },
    { label: "Economic Centers", value: stats.markets, icon: MapPin, badge: `+${stats.markets}` },
    { label: "Active Admins", value: stats.admins, icon: ShieldCheck, badge: "Active" },
  ];

  const recentActivities = [
    { action: "Price updated for Carrots", time: "2 min ago", icon: DollarSign },
    { action: "New category added", time: "15 min ago", icon: FolderOpen },
    { action: "Admin user created", time: "1 hour ago", icon: ShieldCheck },
    { action: "System backup completed", time: "3 hours ago", icon: Save },
  ];

  return (
    <div className="space-y-5 max-w-8xl mx-auto px-1 sm:px-0">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-8 sm:p-10 rounded-3xl border shadow-lg relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, ${THEME.accentSoft} 0%, ${THEME.surfaceRaised} 100%)`,
          borderColor: THEME.border,
        }}
      >
        <div className="absolute top-0 right-0 w-96 h-96 opacity-5 pointer-events-none">
          <Brain className="w-full h-full" style={{ color: THEME.accent }} />
        </div>
        <div className="relative z-10">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-md shrink-0"
                  style={{ background: THEME.accent }}
                >
                  <ShieldCheck className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl sm:text-4xl font-black tracking-tight" style={{ color: THEME.ink }}>
                    Welcome back, {admin?.name?.split(" ")[0] || "Admin"}!
                  </h2>
                  <p className="text-sm font-semibold uppercase tracking-wider" style={{ color: THEME.accentInk }}>
                    {isSuperAdmin ? "Super Administrator" : "Market Administrator"}
                  </p>
                </div>
              </div>
              <p className="text-base sm:text-lg font-medium leading-relaxed" style={{ color: THEME.inkMuted }}>
                {isSuperAdmin
                  ? "You have full super administrator access to manage all economic centers, produce catalogs, user roles, and system parameters across the platform."
                  : `You are managing the ${getMarketName(market)} with full access to price management and data entry tools.`}
              </p>
            </div>
            <div className="hidden sm:block">
              <div className="text-right">
                <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: THEME.inkFaint }}>
                  Last Login
                </div>
                <div className="text-sm font-semibold" style={{ color: THEME.ink }}>
                  {new Date().toLocaleDateString("en-LK", {
                    weekday: "short",
                    month: "short",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-lg font-bold mb-4" style={{ color: THEME.ink }}>
          Quick Actions
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {quickActions.map((action, idx) => {
            const Icon = action.icon;
            return (
              <motion.button
                key={action.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.05 }}
                onClick={() => onNavigate?.(action.id)}
                className="p-4 rounded-2xl border text-left transition-all hover:scale-[1.02] active:scale-[0.98] shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                style={{
                  background: THEME.surfaceRaised,
                  borderColor: THEME.border,
                }}
              >
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center mb-3"
                  style={{ background: `${action.color}20`, color: action.color }}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <div className="font-bold text-sm mb-1" style={{ color: THEME.ink }}>
                  {action.label}
                </div>
                <div className="text-xs line-clamp-2" style={{ color: THEME.inkFaint }}>
                  {action.desc}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Metrics Grid */}
      <div>
        <h3 className="text-lg font-bold mb-4" style={{ color: THEME.ink }}>
          System Overview
        </h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {metrics.map((metric, idx) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 + idx * 0.05 }}
                className="p-6 rounded-3xl border shadow-sm flex flex-col"
                style={{ background: THEME.surfaceRaised, borderColor: THEME.border }}
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center"
                    style={{ background: THEME.accentSoft, color: THEME.accent }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <span
                    className="text-xs font-bold px-2 py-1 rounded-full"
                    style={{ background: `${THEME.accent}20`, color: THEME.accent }}
                  >
                    {metric.badge}
                  </span>
                </div>
                <div className="text-3xl sm:text-4xl font-black" style={{ color: THEME.ink }}>
                  {metric.value}
                </div>
                <div className="text-xs font-semibold uppercase tracking-wider mt-1" style={{ color: THEME.inkMuted }}>
                  {metric.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* System Status & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* System Status */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6"
          style={{ background: THEME.surfaceRaised, borderColor: THEME.border }}
        >
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-lg" style={{ color: THEME.ink }}>
              System Status
            </h3>
            <div
              className="flex items-center gap-2 text-xs font-bold px-3 py-1.5 rounded-full"
              style={{ background: THEME.accentSoft, color: THEME.accentInk }}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Operational
            </div>
          </div>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: THEME.surface }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${THEME.accent}20` }}
                >
                  <Cloud className="w-4 h-4" style={{ color: THEME.accent }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: THEME.ink }}>
                  Data Sync
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-600">Active</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: THEME.surface }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${THEME.accent}20` }}
                >
                  <ShieldCheck className="w-4 h-4" style={{ color: THEME.accent }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: THEME.ink }}>
                  Security
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-600">Secure</span>
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl" style={{ background: THEME.surface }}>
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ background: `${THEME.accent}20` }}
                >
                  <TrendingUp className="w-4 h-4" style={{ color: THEME.accent }} />
                </div>
                <span className="text-sm font-semibold" style={{ color: THEME.ink }}>
                  Price Updates
                </span>
              </div>
              <span className="text-xs font-bold text-emerald-600">Real-time</span>
            </div>
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.35 }}
          className="p-6 sm:p-8 rounded-3xl border shadow-sm space-y-6"
          style={{ background: THEME.surfaceRaised, borderColor: THEME.border }}
        >
          <h3 className="font-bold text-lg" style={{ color: THEME.ink }}>
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentActivities.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 rounded-xl"
                  style={{ background: THEME.surface }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
                    style={{ background: `${THEME.accent}20` }}
                  >
                    <Icon className="w-4 h-4" style={{ color: THEME.accent }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold truncate" style={{ color: THEME.ink }}>
                      {item.action}
                    </p>
                    <p className="text-xs" style={{ color: THEME.inkFaint }}>
                      {item.time}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </div>
    </div>
  );
}