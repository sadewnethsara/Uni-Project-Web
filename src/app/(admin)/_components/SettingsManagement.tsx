import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Settings,
  Cloud,
  LayoutDashboard,
  FolderOpen,
  ShieldCheck,
  Save,
  Check,
  Loader2,
  Download,
  LucideIcon,
} from "lucide-react";
import { ADMIN_SECTION_CONTENT } from "../data/demoData";
import { AdminPageLayout } from "./AdminPageLayout";
import type { AdminAccount, MarketType, SaveStatus, SectionId } from "../types/admin";
import { InputField, SelectField, SettingRow, Toggle } from "../helpers/settingsHelpers";

interface SettingsProps {
  market: MarketType;
  admin: AdminAccount | null;
  onSave: () => void;
  saveStatus: SaveStatus;
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

// --- Main Component ---

export function SettingsManagement({
  market,
  onSave,
  saveStatus,
}: SettingsProps) {
  const [settings, setSettings] = useState({
    // General Settings
    autoUpdatePrices: true,
    sendNotifications: true,
    dataRetentionDays: 90,
    defaultCurrency: "LKR",
    timezone: "Asia/Colombo",
    // Notification Settings
    emailAlerts: true,
    priceChangeThreshold: 10,
    weeklyReports: true,
    // UI Settings
    compactMode: false,
    showTooltips: true,
    animationSpeed: "normal",
    // Data Management
    autoBackup: true,
    backupFrequency: "daily",
    exportFormat: "csv",
    // Security Settings
    sessionTimeout: 30,
    twoFactorAuth: false,
    ipWhitelist: "",
  });

  const [activeSection, setActiveSection] = useState<SectionId>("general");

  const updateSetting = <K extends keyof typeof settings>(key: K, value: typeof settings[K]) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const marketName =
    market === "dambulla"
      ? "Dambulla"
      : market === "kappetipola"
      ? "Kappetipola"
      : "All Markets";

  const sections: { id: SectionId; label: string; icon: LucideIcon }[] = [
    { id: "general", label: "General", icon: Settings },
    { id: "notifications", label: "Notifications", icon: Cloud },
    { id: "ui", label: "Appearance", icon: LayoutDashboard },
    { id: "data", label: "Data Management", icon: FolderOpen },
    { id: "security", label: "Security", icon: ShieldCheck },
  ];

  return (
    <AdminPageLayout
      title={ADMIN_SECTION_CONTENT.settings.title}
      subtitle={`${ADMIN_SECTION_CONTENT.settings.subtitle} for ${marketName}`}
      icon={Settings}
      accentColor="#10b981"
      accentSoftColor="#e6f4ea"
      surfaceColor="#f8fafc"
      surfaceRaisedColor="#ffffff"
      borderColor="#e2e8f0"
      inkColor="#0f172a"
      inkMutedColor="#64748b"
    >
      <div className="p-4 sm:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar / Mobile Horizontal Tabs */}
        <nav className="lg:col-span-3 flex lg:flex-col overflow-x-auto gap-1 pb-2 lg:pb-0 scrollbar-none border-b lg:border-b-0 border-slate-200">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium whitespace-nowrap transition-all duration-150",
                  isActive
                    ? "bg-emerald-500 text-white shadow-sm font-semibold"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                )}
              >
                <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-white" : "text-slate-400")} />
                <span>{section.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content Area */}
        <div className="lg:col-span-9 bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 sm:p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSection}
                initial={{ opacity: 0, x: 8 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -8 }}
                transition={{ duration: 0.15 }}
                className="space-y-6"
              >
                {/* --- GENERAL SECTION --- */}
                {activeSection === "general" && (
                  <div>
                    <div className="border-b border-slate-100 pb-4 mb-4">
                      <h3 className="text-base font-bold text-slate-900">General Settings</h3>
                      <p className="text-xs text-slate-500">Core system configurations and defaults.</p>
                    </div>
                    
                    <SettingRow
                      title="Auto-update Prices"
                      description="Automatically synchronize market prices from verified external data feeds."
                    >
                      <Toggle
                        checked={settings.autoUpdatePrices}
                        onChange={(val) => updateSetting("autoUpdatePrices", val)}
                      />
                    </SettingRow>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <InputField
                        label="Data Retention (Days)"
                        type="number"
                        value={settings.dataRetentionDays}
                        onChange={(val) => updateSetting("dataRetentionDays", parseInt(val) || 0)}
                        description="Days to retain historical transaction logs."
                      />
                      <SelectField
                        label="Default Currency"
                        value={settings.defaultCurrency}
                        onChange={(val) => updateSetting("defaultCurrency", val)}
                        options={[
                          { value: "LKR", label: "LKR - Sri Lankan Rupee" },
                          { value: "USD", label: "USD - US Dollar" },
                        ]}
                      />
                      <div className="md:col-span-2">
                        <SelectField
                          label="Timezone"
                          value={settings.timezone}
                          onChange={(val) => updateSetting("timezone", val)}
                          options={[
                            { value: "Asia/Colombo", label: "Asia/Colombo (GMT+5:30)" },
                            { value: "UTC", label: "UTC (Coordinated Universal Time)" },
                          ]}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* --- NOTIFICATIONS SECTION --- */}
                {activeSection === "notifications" && (
                  <div>
                    <div className="border-b border-slate-100 pb-4 mb-4">
                      <h3 className="text-base font-bold text-slate-900">Notification Preferences</h3>
                      <p className="text-xs text-slate-500">Control how and when you receive system updates.</p>
                    </div>

                    <SettingRow
                      title="System Alerts"
                      description="Enable real-time push notifications for critical market fluctuations."
                    >
                      <Toggle
                        checked={settings.sendNotifications}
                        onChange={(val) => updateSetting("sendNotifications", val)}
                      />
                    </SettingRow>

                    <SettingRow
                      title="Email Alerts"
                      description="Receive immediate email digests when major changes occur."
                    >
                      <Toggle
                        checked={settings.emailAlerts}
                        onChange={(val) => updateSetting("emailAlerts", val)}
                      />
                    </SettingRow>

                    <SettingRow
                      title="Weekly Summary Reports"
                      description="Receive a weekly automated PDF analytics report via email."
                    >
                      <Toggle
                        checked={settings.weeklyReports}
                        onChange={(val) => updateSetting("weeklyReports", val)}
                      />
                    </SettingRow>

                    <div className="pt-2">
                      <InputField
                        label="Price Change Threshold (%)"
                        type="number"
                        value={settings.priceChangeThreshold}
                        onChange={(val) => updateSetting("priceChangeThreshold", parseInt(val) || 0)}
                        description="Triggers an alert whenever market prices shift equal to or above this percentage."
                      />
                    </div>
                  </div>
                )}

                {/* --- APPEARANCE SECTION --- */}
                {activeSection === "ui" && (
                  <div>
                    <div className="border-b border-slate-100 pb-4 mb-4">
                      <h3 className="text-base font-bold text-slate-900">Appearance & Interface</h3>
                      <p className="text-xs text-slate-500">Customize display options and visual density.</p>
                    </div>

                    <SettingRow
                      title="Compact Table Layout"
                      description="Reduce cell padding in data tables to display more information on screen."
                    >
                      <Toggle
                        checked={settings.compactMode}
                        onChange={(val) => updateSetting("compactMode", val)}
                      />
                    </SettingRow>

                    <SettingRow
                      title="Interactive Tooltips"
                      description="Display contextual guidance tooltips when hovering over interface elements."
                    >
                      <Toggle
                        checked={settings.showTooltips}
                        onChange={(val) => updateSetting("showTooltips", val)}
                      />
                    </SettingRow>

                    <div className="pt-2">
                      <SelectField
                        label="UI Animation Speed"
                        value={settings.animationSpeed}
                        onChange={(val) => updateSetting("animationSpeed", val)}
                        options={[
                          { value: "slow", label: "Relaxed (Slow)" },
                          { value: "normal", label: "Standard (Normal)" },
                          { value: "fast", label: "Snappy (Fast)" },
                          { value: "none", label: "Disabled (No animations)" },
                        ]}
                      />
                    </div>
                  </div>
                )}

                {/* --- DATA MANAGEMENT SECTION --- */}
                {activeSection === "data" && (
                  <div>
                    <div className="border-b border-slate-100 pb-4 mb-4">
                      <h3 className="text-base font-bold text-slate-900">Data Management</h3>
                      <p className="text-xs text-slate-500">Automate database backups and manage data exports.</p>
                    </div>

                    <SettingRow
                      title="Automated Backups"
                      description="Create regular encrypted database snapshots automatically."
                    >
                      <Toggle
                        checked={settings.autoBackup}
                        onChange={(val) => updateSetting("autoBackup", val)}
                      />
                    </SettingRow>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                      <SelectField
                        label="Backup Schedule"
                        value={settings.backupFrequency}
                        onChange={(val) => updateSetting("backupFrequency", val)}
                        options={[
                          { value: "hourly", label: "Hourly" },
                          { value: "daily", label: "Daily" },
                          { value: "weekly", label: "Weekly" },
                          { value: "monthly", label: "Monthly" },
                        ]}
                      />
                      <SelectField
                        label="Default Export Format"
                        value={settings.exportFormat}
                        onChange={(val) => updateSetting("exportFormat", val)}
                        options={[
                          { value: "csv", label: "Comma Separated Value (.csv)" },
                          { value: "json", label: "JSON (.json)" },
                          { value: "xlsx", label: "Microsoft Excel (.xlsx)" },
                        ]}
                      />
                    </div>

                    <div className="pt-6 mt-6 border-t border-slate-100">
                      <button
                        type="button"
                        className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 transition-colors"
                      >
                        <Download className="w-4 h-4 text-slate-500" />
                        Export All Market Data
                      </button>
                    </div>
                  </div>
                )}

                {/* --- SECURITY SECTION --- */}
                {activeSection === "security" && (
                  <div>
                    <div className="border-b border-slate-100 pb-4 mb-4">
                      <h3 className="text-base font-bold text-slate-900">Security & Access Control</h3>
                      <p className="text-xs text-slate-500">Configure authentication rules and IP restrictions.</p>
                    </div>

                    <SettingRow
                      title="Two-Factor Authentication (2FA)"
                      description="Require an authenticator app code during sign-in."
                    >
                      <Toggle
                        checked={settings.twoFactorAuth}
                        onChange={(val) => updateSetting("twoFactorAuth", val)}
                      />
                    </SettingRow>

                    <div className="space-y-4 pt-2">
                      <InputField
                        label="Session Inactivity Timeout (Minutes)"
                        type="number"
                        value={settings.sessionTimeout}
                        onChange={(val) => updateSetting("sessionTimeout", parseInt(val) || 0)}
                        description="Automatically log users out after a period of inactivity."
                      />

                      <div className="space-y-2">
                        <label className="block text-sm font-semibold text-slate-900">
                          IP Address Whitelist
                        </label>
                        <textarea
                          rows={3}
                          value={settings.ipWhitelist}
                          onChange={(e) => updateSetting("ipWhitelist", e.target.value)}
                          placeholder="e.g. 192.168.1.1, 10.0.0.1"
                          className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all resize-none"
                        />
                        <p className="text-xs text-slate-400">
                          Separate multiple IP addresses with commas. Leave empty to allow access from anywhere.
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Action Footer */}
          <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end">
            <button
              onClick={onSave}
              disabled={saveStatus === "saving"}
              className={cn(
                "inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold text-white shadow-sm transition-all duration-150 active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed",
                saveStatus === "saved"
                  ? "bg-slate-900 hover:bg-slate-800"
                  : "bg-emerald-500 hover:bg-emerald-600"
              )}
            >
              {saveStatus === "saving" ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Saving...</span>
                </>
              ) : saveStatus === "saved" ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Saved!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save Settings</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
      </div>
    </AdminPageLayout>
  );
}