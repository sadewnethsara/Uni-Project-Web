import React, { useState, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  DollarSign,
  ShieldCheck,
  FolderOpen,
  Package,
  MapPin,
  Settings,
  Menu,
  Plus,
  X,
  LogOut,
  ChevronLeft,
  ChevronRight,
  LucideIcon,
  Store,
  Database,
} from "lucide-react";
import { ANALYZE_THEME } from "@/lib/chartTheme";
import { AdminsManagement } from "./AdminsManagement";
import { CategoriesManagement } from "./CategoriesManagement";
import { ItemsManagement } from "./ItemsManagement";
import { MarketsManagement } from "./MarketsManagement";
import { OverviewManagement } from "./OverviewManagement";
import { PriceManagement } from "./PriceManagement";
import { QuickAddManagement } from "./QuickAddManagement";
import { SettingsManagement } from "./SettingsManagement";
import { DataManagement } from "./DataManagement";

// Types
export type AdminView =
  | "overview"
  | "prices"
  | "admins"
  | "categories"
  | "items"
  | "markets"
  | "dataManagement"
  | "settings";

export type MarketType = "dambulla" | "kappetipola" | null;

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: "super" | "market" | "viewer" | string;
}

interface AdminPanelProps {
  market: MarketType;
  admin: Admin | null;
  onLogout: () => void;
}

interface TabItem {
  id: AdminView;
  label: string;
  icon: LucideIcon;
}

// Fallback Theme object
const DEFAULT_THEME = {
  accent: "#10b981",
  accentSoft: "#e6f4ea",
  accentInk: "#047857",
  surface: "#f9fafb",
  surfaceRaised: "#ffffff",
  surfaceMuted: "#f3f4f6",
  border: "#e5e7eb",
  ink: "#111827",
  inkMuted: "#4b5563",
  inkFaint: "#9ca3af",
};

// Replace with global ANALYZE_THEME if available
const THEME = typeof ANALYZE_THEME !== "undefined" ? ANALYZE_THEME : DEFAULT_THEME;

/* ==========================================================================
   Sidebar Content Sub-Component
   ========================================================================== */
interface SidebarContentProps {
  tabs: TabItem[];
  activeTab: AdminView;
  setActiveTab: (tab: AdminView) => void;
  admin: Admin | null;
  marketName: string;
  onLogout: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  onSelectTab?: () => void;
}

function SidebarContent({
  tabs,
  activeTab,
  setActiveTab,
  admin,
  onLogout,
  isCollapsed = false,
  onToggleCollapse,
  onSelectTab,
}: SidebarContentProps) {
  return (
    <div className="flex flex-col h-full justify-between p-4 relative select-none">
      <div>
        {/* Sidebar Header / Brand */}
        <div className="flex items-center justify-between mb-6 px-2">
          <div className="flex items-center gap-3 overflow-hidden">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm"
              style={{ background: THEME.accent, color: "#ffffff" }}
            >
              <Store className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <h2 className="font-extrabold text-sm truncate" style={{ color: THEME.ink }}>
                  Economic Center
                </h2>
                <p className="text-xs font-medium truncate" style={{ color: THEME.inkFaint }}>
                  Management Portal
                </p>
              </div>
            )}
          </div>

          {onToggleCollapse && (
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex p-1.5 rounded-xl border transition-colors hover:bg-gray-100"
              style={{ borderColor: THEME.border, color: THEME.inkMuted }}
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>
          )}
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  if (onSelectTab) onSelectTab();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl font-semibold text-sm transition-all relative ${
                  isActive ? "shadow-sm" : "hover:bg-gray-100/60"
                }`}
                style={{
                  background: isActive ? THEME.accentSoft : "transparent",
                  color: isActive ? THEME.accentInk : THEME.inkMuted,
                }}
              >
                <Icon
                  className="w-5 h-5 shrink-0"
                  style={{ color: isActive ? THEME.accent : THEME.inkFaint }}
                />
                {!isCollapsed && <span className="truncate">{tab.label}</span>}
                {isActive && !isCollapsed && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute right-2 w-1.5 h-5 rounded-full"
                    style={{ background: THEME.accent }}
                  />
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Admin User Profile & Logout */}
      <div className="pt-4 border-t space-y-3" style={{ borderColor: THEME.border }}>
        {!isCollapsed ? (
          <div className="flex items-center justify-between p-2 rounded-2xl" style={{ background: THEME.surface }}>
            <div className="min-w-0 pr-2">
              <p className="text-xs font-bold truncate" style={{ color: THEME.ink }}>
                {admin?.name || "Administrator"}
              </p>
              <p className="text-[10px] font-semibold uppercase tracking-wider truncate" style={{ color: THEME.accentInk }}>
                {admin?.role === "super" ? "Super Admin" : "Market Admin"}
              </p>
            </div>
            <button
              onClick={onLogout}
              className="p-2 rounded-xl transition-colors hover:bg-red-50 hover:text-red-600 shrink-0"
              style={{ color: THEME.inkFaint }}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <button
            onClick={onLogout}
            className="w-full flex justify-center p-2.5 rounded-2xl transition-colors hover:bg-red-50 hover:text-red-600"
            style={{ color: THEME.inkFaint }}
            title="Logout"
          >
            <LogOut className="w-5 h-5" />
          </button>
        )}
      </div>
    </div>
  );
}

/* ==========================================================================
   Main AdminPanel Component
   ========================================================================== */
export function AdminPanel({ market, admin, onLogout }: AdminPanelProps) {
  const [activeTab, setActiveTab] = useState<AdminView>("overview");
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">("idle");
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const isSuperAdmin = admin?.role === "super";

  const marketName = useMemo(() => {
    switch (market) {
      case "dambulla":
        return "Dambulla Dedicated Economic Center";
      case "kappetipola":
        return "Keppetipola Dedicated Economic Center";
      default:
        return "All Economic Centers";
    }
  }, [market]);

  const handleSave = useCallback(() => {
    setSaveStatus("saving");
    const timer1 = setTimeout(() => {
      setSaveStatus("saved");
      const timer2 = setTimeout(() => setSaveStatus("idle"), 2000);
      return () => clearTimeout(timer2);
    }, 1000);
    return () => clearTimeout(timer1);
  }, []);

  const tabs = useMemo<TabItem[]>(() => {
    const allTabs: TabItem[] = [
      { id: "overview", label: "Overview", icon: LayoutDashboard },
      { id: "prices", label: "Price Management", icon: DollarSign },
      ...(isSuperAdmin ? [{ id: "admins" as AdminView, label: "Admin Management", icon: ShieldCheck }] : []),
      { id: "categories", label: "Categories", icon: FolderOpen },
      { id: "items", label: "Items", icon: Package },
      ...(isSuperAdmin ? [{ id: "markets" as AdminView, label: "Markets", icon: MapPin }] : []),
      { id: "dataManagement", label: "Data Management", icon: Database },
      { id: "settings", label: "Settings", icon: Settings },
    ];

    if (admin?.role === "viewer") {
      return allTabs.filter(
        (tab) => tab.id === "overview" || tab.id === "prices" || tab.id === "settings"
      );
    }

    return allTabs;
  }, [isSuperAdmin, admin?.role]);

  const activeTabLabel = useMemo(() => {
    return tabs.find((t) => t.id === activeTab)?.label || "Dashboard";
  }, [tabs, activeTab]);

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: THEME.surface }}>
      {/* Mobile Menu Toggle Button */}
      <button
        onClick={() => setIsMobileMenuOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-40 p-2.5 rounded-2xl shadow-md border"
        style={{ background: THEME.surfaceRaised, borderColor: THEME.border }}
        aria-label="Open Navigation Menu"
      >
        <Menu className="w-5 h-5" style={{ color: THEME.ink }} />
      </button>

      {/* Mobile Sidebar Overlay Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-black/40 backdrop-blur-xs z-40 lg:hidden"
            />
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 lg:hidden shadow-2xl border-r"
              style={{ background: THEME.surfaceRaised, borderColor: THEME.border }}
            >
              <SidebarContent
                tabs={tabs}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                admin={admin}
                marketName={marketName}
                onLogout={onLogout}
                isCollapsed={false}
                onSelectTab={() => setIsMobileMenuOpen(false)}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Collapsible Sidebar */}
      <motion.aside
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="hidden lg:flex flex-col border-r shrink-0 z-20"
        style={{ background: THEME.surfaceRaised, borderColor: THEME.border }}
      >
        <SidebarContent
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          admin={admin}
          marketName={marketName}
          onLogout={onLogout}
          isCollapsed={!isSidebarOpen}
          onToggleCollapse={() => setIsSidebarOpen(!isSidebarOpen)}
        />
      </motion.aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header
          className="px-6 py-4 border-b flex items-center justify-between shrink-0"
          style={{ background: THEME.surfaceRaised, borderColor: THEME.border }}
        >
          <div className="pl-12 lg:pl-0">
            <h1 className="text-xl sm:text-2xl font-black tracking-tight truncate" style={{ color: THEME.ink }}>
              {marketName}
            </h1>
            <p className="text-xs font-semibold uppercase tracking-wider" style={{ color: THEME.accentInk }}>
              {activeTabLabel}
            </p>
          </div>

          {saveStatus !== "idle" && (
            <div
              className="text-xs font-bold flex items-center gap-2 px-3.5 py-1.5 rounded-full shadow-xs"
              style={{ background: THEME.accentSoft, color: THEME.accentInk }}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  saveStatus === "saving" ? "bg-amber-500 animate-ping" : "bg-emerald-500"
                }`}
              />
              {saveStatus === "saving" ? "Saving updates..." : "All changes saved"}
            </div>
          )}
        </header>

        {/* Dynamic Tab Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              {activeTab === "overview" && (
                typeof OverviewManagement !== "undefined" ? (
                  <OverviewManagement
                    market={market}
                    admin={admin}
                    onNavigate={(tabId) => setActiveTab(tabId as AdminView)}
                  />
                ) : (
                  <FallbackView name="Overview Management" />
                )
              )}

              {activeTab === "prices" && (
                typeof PriceManagement !== "undefined" ? (
                  <PriceManagement
                    market={market}
                    isSuperAdmin={isSuperAdmin}
                    onSave={handleSave}
                    saveStatus={saveStatus}
                  />
                ) : (
                  <FallbackView name="Price Management" />
                )
              )}

              {activeTab === "admins" && isSuperAdmin && (
                typeof AdminsManagement !== "undefined" ? (
                  <AdminsManagement />
                ) : (
                  <FallbackView name="Admins Management" />
                )
              )}

              {activeTab === "categories" && (
                typeof CategoriesManagement !== "undefined" ? (
                  <CategoriesManagement />
                ) : (
                  <FallbackView name="Categories Management" />
                )
              )}

              {activeTab === "items" && (
                typeof ItemsManagement !== "undefined" ? (
                  <ItemsManagement />
                ) : (
                  <FallbackView name="Items Management" />
                )
              )}

              {activeTab === "markets" && isSuperAdmin && (
                typeof MarketsManagement !== "undefined" ? (
                  <MarketsManagement />
                ) : (
                  <FallbackView name="Markets Management" />
                )
              )}

              {activeTab === "dataManagement" && (
                typeof DataManagement !== "undefined" ? (
                  <DataManagement />
                ) : (
                  <FallbackView name="Data Management" />
                )
              )}

              {activeTab === "settings" && (
                typeof SettingsManagement !== "undefined" ? (
                  <SettingsManagement
                    market={market}
                    admin={admin}
                    onSave={handleSave}
                    saveStatus={saveStatus}
                  />
                ) : (
                  <FallbackView name="Settings Management" />
                )
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Quick Add Floating Trigger */}
        <motion.button
          onClick={() => setIsQuickAddOpen(true)}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.92 }}
          className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full shadow-xl flex items-center justify-center cursor-pointer"
          style={{ background: THEME.accent }}
          aria-label="Quick Add Entry"
        >
          <Plus className="w-7 h-7 text-white" />
        </motion.button>

        {/* Quick Add Modal Dialog */}
        <AnimatePresence>
          {isQuickAddOpen && (
            <>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsQuickAddOpen(false)}
                className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50"
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="fixed inset-4 sm:inset-8 lg:inset-16 z-50 flex items-center justify-center pointer-events-none"
              >
                <div
                  className="w-full max-w-2xl max-h-full overflow-y-auto pointer-events-auto rounded-3xl border shadow-2xl flex flex-col"
                  style={{ background: THEME.surfaceRaised, borderColor: THEME.border }}
                >
                  <div
                    className="sticky top-0 z-10 p-4 border-b flex items-center justify-between"
                    style={{ background: THEME.surfaceRaised, borderColor: THEME.border }}
                  >
                    <h2 className="text-lg font-bold" style={{ color: THEME.ink }}>
                      Quick Add Workflow
                    </h2>
                    <button
                      onClick={() => setIsQuickAddOpen(false)}
                      className="p-2 rounded-xl transition-colors hover:bg-gray-100"
                      style={{ color: THEME.inkMuted }}
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                  <div className="p-4 sm:p-6 flex-1">
                    {typeof QuickAddManagement !== "undefined" ? (
                      <QuickAddManagement
                        market={market}
                        isSuperAdmin={isSuperAdmin}
                        onSave={handleSave}
                        saveStatus={saveStatus}
                        onClose={() => setIsQuickAddOpen(false)}
                      />
                    ) : (
                      <FallbackView name="Quick Add Management" />
                    )}
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// Fallback Placeholder Component for missing modules during integration
function FallbackView({ name }: { name: string }) {
  return (
    <div
      className="p-12 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center"
      style={{ borderColor: THEME.border }}
    >
      <Package className="w-12 h-12 mb-3" style={{ color: THEME.inkFaint }} />
      <h3 className="font-bold text-lg mb-1" style={{ color: THEME.ink }}>
        {name}
      </h3>
      <p className="text-xs" style={{ color: THEME.inkMuted }}>
        Component view module is ready to be linked.
      </p>
    </div>
  );
}