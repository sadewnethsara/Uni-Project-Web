import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Brain,
  ChevronRight,
  ChevronLeft,
  LogOut,
  LucideIcon,
} from "lucide-react";
import { ANALYZE_THEME } from "@/lib/chartTheme";

// Types
export type AdminView =
  | "overview"
  | "prices"
  | "admins"
  | "categories"
  | "items"
  | "markets"
  | "settings";

export interface Admin {
  id?: string;
  name: string;
  email?: string;
  role: "super" | "market" | "viewer" | string;
}

export interface SidebarTabItem {
  id: AdminView;
  label: string;
  icon: LucideIcon;
}

interface SidebarContentProps {
  tabs: SidebarTabItem[];
  activeTab: AdminView;
  setActiveTab: (tab: AdminView) => void;
  admin: Admin | null;
  marketName?: string;
  onLogout: () => void;
  isCollapsed: boolean;
  onToggleCollapse?: () => void;
}

// Fallback Theme object
const DEFAULT_THEME = {
  accent: "#0d9488",
  accentSoft: "#ccfbf1",
  accentInk: "#115e59",
  surface: "#f8fafc",
  surfaceRaised: "#ffffff",
  surfaceMuted: "#f1f5f9",
  border: "#e2e8f0",
  ink: "#0f172a",
  inkMuted: "#475569",
  inkFaint: "#94a3b8",
};

// Replace with global ANALYZE_THEME if available
const THEME = typeof ANALYZE_THEME !== "undefined" ? ANALYZE_THEME : DEFAULT_THEME;

export function SidebarContent({
  tabs,
  activeTab,
  setActiveTab,
  admin,
  onLogout,
  isCollapsed,
  onToggleCollapse,
}: SidebarContentProps) {
  const getRoleLabel = (role?: string) => {
    switch (role) {
      case "super":
        return "Super Admin";
      case "viewer":
        return "Viewer";
      default:
        return "Market Admin";
    }
  };

  return (
    <div className="h-full flex flex-col justify-between select-none">
      <div>
        {/* Brand Header */}
        <div
          className="p-5 border-b flex items-center justify-between"
          style={{ borderColor: THEME.border }}
        >
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ background: THEME.accentSoft }}
            >
              <Brain className="w-6 h-6" style={{ color: THEME.accent }} />
            </div>

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="flex items-center whitespace-nowrap min-w-0"
                >
                  <span className="text-xl font-black tracking-tight" style={{ color: THEME.ink }}>
                    Agri
                  </span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-teal-100 text-teal-800 tracking-wider ml-1.5 uppercase">
                    ADMIN
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="p-1.5 rounded-xl transition-colors hover:bg-gray-100 cursor-pointer"
              style={{ color: THEME.inkMuted }}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
              aria-label="Toggle Sidebar Collapse"
            >
              {isCollapsed ? (
                <ChevronRight className="w-5 h-5" />
              ) : (
                <ChevronLeft className="w-5 h-5" />
              )}
            </button>
          )}
        </div>

        {/* User Card */}
        <div
          className="p-3.5 mx-3 my-4 rounded-2xl border shadow-xs transition-all"
          style={{ background: THEME.surface, borderColor: THEME.border }}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-600 to-teal-800 flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
              {admin?.name?.charAt(0).toUpperCase() || "A"}
            </div>

            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                  className="min-w-0 flex-1"
                >
                  <h4 className="font-bold truncate text-sm" style={{ color: THEME.ink }}>
                    {admin?.name || "Admin User"}
                  </h4>
                  <span
                    className="inline-block text-[10px] font-bold px-2 py-0.5 rounded mt-0.5"
                    style={{ background: THEME.accentSoft, color: THEME.accentInk }}
                  >
                    {getRoleLabel(admin?.role)}
                  </span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="px-3 space-y-1 overflow-y-auto max-h-[calc(100vh-280px)]">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                title={isCollapsed ? tab.label : undefined}
                className="w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all relative overflow-hidden group cursor-pointer"
                style={{
                  background: isActive ? THEME.accentSoft : "transparent",
                  color: isActive ? THEME.accentInk : THEME.inkMuted,
                }}
              >
                <Icon
                  className="w-5 h-5 shrink-0 transition-transform group-hover:scale-105"
                  style={{ color: isActive ? THEME.accent : THEME.inkFaint }}
                />

                <AnimatePresence mode="wait">
                  {!isCollapsed && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.15 }}
                      className="truncate"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </AnimatePresence>

                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-tab"
                    className="absolute left-0 top-2 bottom-2 w-1 rounded-r-full"
                    style={{ background: THEME.accent }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer & Logout */}
      <div className="p-3 border-t space-y-2" style={{ borderColor: THEME.border }}>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="text-center text-[11px] font-medium tracking-tight"
              style={{ color: THEME.inkFaint }}
            >
              Sri Lanka Economic System v1.1
            </motion.div>
          )}
        </AnimatePresence>

        <button
          onClick={onLogout}
          title={isCollapsed ? "Logout" : undefined}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-2xl text-sm font-semibold border active:scale-[0.98] transition-all hover:bg-red-50/60 hover:text-red-600 cursor-pointer"
          style={{
            background: THEME.surface,
            borderColor: THEME.border,
            color: THEME.inkMuted,
          }}
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>
    </div>
  );
}