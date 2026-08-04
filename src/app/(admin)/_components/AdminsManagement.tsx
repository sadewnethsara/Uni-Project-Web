import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { createClient } from "@/utils/supabase/client";
import { ANALYZE_THEME } from "@/lib/chartTheme";
import { Admin, AdminRole } from "@/lib/types";
import { ADMIN_SECTION_CONTENT } from "../data/demoData";
import { AdminPageLayout } from "./AdminPageLayout";
import { ShieldCheck, MapPin, Edit2, Trash2, Save, X, UserPlus, Loader2, Check, AlertCircle } from "lucide-react";

// Fallback Theme object
const DEFAULT_THEME = {
  accent: "#10b981",
  accentSoft: "#e6f4ea",
  surface: "#f9fafb",
  surfaceRaised: "#ffffff",
  surfaceMuted: "#f3f4f6",
  border: "#e5e7eb",
  ink: "#111827",
  inkMuted: "#4b5563",
  inkFaint: "#9ca3af",
};

const THEME = typeof ANALYZE_THEME !== "undefined" ? ANALYZE_THEME : DEFAULT_THEME;

interface AdminFormState {
  email: string;
  name: string;
  role: AdminRole;
  marketId: string;
  password?: string;
  phone?: string;
}

export function AdminsManagement() {
  const INITIAL_FORM: AdminFormState = {
    email: "",
    name: "",
    role: "market",
    marketId: "",
    password: "",
    phone: "",
  };

  const [admins, setAdmins] = useState<Admin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [editingAdmin, setEditingAdmin] = useState<Admin | null>(null);
  const [adminForm, setAdminForm] = useState<AdminFormState>(INITIAL_FORM);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('admins')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (Array.isArray(data)) {
        setAdmins(data.map((a: any) => ({
          id: a.id.toString(),
          email: a.email,
          name: a.name,
          role: a.role as AdminRole,
          marketId: a.market_id || undefined,
          createdAt: a.created_at,
          isActive: a.is_active !== false
        })));
      }
    } catch (error) {
      showToast("Failed to fetch data", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const resetForm = () => {
    setEditingAdmin(null);
    setAdminForm(INITIAL_FORM);
  };

  // Validation rule
  const isFormValid =
    adminForm.email.trim() !== "" &&
    adminForm.name.trim() !== "" &&
    (adminForm.role !== "market" || adminForm.marketId.trim() !== "") &&
    (editingAdmin || adminForm.password?.trim()); // Require password only for new

  const handleSave = async () => {
    if (!isFormValid) return;
    setIsProcessing(true);

    try {
      const supabase = createClient();
      const payload = {
        email: adminForm.email,
        name: adminForm.name,
        role: adminForm.role,
        market_id: adminForm.role === 'market' ? adminForm.marketId : null
      };

      if (editingAdmin) {
        const { error } = await supabase
          .from('admins')
          .update(payload)
          .eq('id', editingAdmin.id);

        if (error) throw error;
        showToast("Admin updated", "success");
      } else {
        const { error } = await supabase
          .from('admins')
          .insert([{
            id: adminForm.email.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            password_hash: '',
            is_active: true,
            ...payload
          }]);

        if (error) throw error;
        showToast("Admin added", "success");
      }
      resetForm();
      fetchData();
    } catch (error) {
      showToast("Failed to save admin", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this admin account?")) return;
    setIsProcessing(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('admins')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast("Admin deleted", "success");
      if (editingAdmin?.id === id) resetForm();
      fetchData();
    } catch (error) {
      showToast("Failed to delete admin", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleActive = (id: string) => {
    const updated = admins.map((a) =>
      a.id === id ? { ...a, isActive: !a.isActive } : a
    );
    setAdmins(updated);
  };

  const handleEdit = (a: Admin) => {
    setEditingAdmin(a);
    setAdminForm({
      email: a.email,
      name: a.name,
      role: a.role,
      marketId: a.marketId || "",
      password: ""
    });
  };

  const getRoleBadge = (role: AdminRole) => {
    switch (role) {
      case "super":
        return (
          <span
            className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
            style={{ background: THEME.accentSoft, color: THEME.accent }}
          >
            Super Admin
          </span>
        );
      case "market":
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0 bg-blue-50 text-blue-700 border border-blue-100">
            Market Admin
          </span>
        );
      case "viewer":
        return (
          <span
            className="px-2.5 py-1 rounded-full text-xs font-bold shrink-0"
            style={{ background: THEME.surfaceMuted, color: THEME.inkMuted }}
          >
            Viewer
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <AdminPageLayout
      title={ADMIN_SECTION_CONTENT.admins.title}
      subtitle={ADMIN_SECTION_CONTENT.admins.subtitle}
      icon={ShieldCheck}
      countLabel={ADMIN_SECTION_CONTENT.admins.countLabel}
      countValue={admins.length}
      accentColor={THEME.accent}
      accentSoftColor={THEME.accentSoft}
      surfaceColor={THEME.surface}
      surfaceRaisedColor={THEME.surfaceRaised}
      borderColor={THEME.border}
      inkColor={THEME.ink}
      inkMutedColor={THEME.inkMuted}
    >
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className={`fixed top-6 left-1/2 z-50 px-6 py-3 rounded-full shadow-lg flex items-center gap-3 backdrop-blur-md border ${
              toast.type === 'success' 
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-700' 
                : 'bg-red-500/10 border-red-500/20 text-red-700'
            }`}
          >
            {toast.type === 'success' ? <Check size={18} /> : <AlertCircle size={18} />}
            <span className="font-medium">{toast.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="p-6 sm:p-7 space-y-4 transition-all">
        <div className="flex items-center gap-2">
          {editingAdmin ? (
            <Edit2 className="w-4 h-4" style={{ color: THEME.accent }} />
          ) : (
            <UserPlus className="w-4 h-4" style={{ color: THEME.accent }} />
          )}
          <h3 className="font-semibold text-sm uppercase tracking-wider" style={{ color: THEME.ink }}>
            {editingAdmin ? "Edit Admin" : "Add New Admin"}
          </h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: THEME.inkMuted }}>
              Email Address
            </label>
            <input
              type="email"
              value={adminForm.email}
              onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
              placeholder="admin@example.com"
              className="w-full px-4 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              style={{
                background: THEME.surface,
                borderColor: THEME.border,
                color: THEME.ink,
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: THEME.inkMuted }}>
              Full Name
            </label>
            <input
              type="text"
              value={adminForm.name}
              onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
              placeholder="Admin Name"
              className="w-full px-4 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              style={{
                background: THEME.surface,
                borderColor: THEME.border,
                color: THEME.ink,
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: THEME.inkMuted }}>
              Password {editingAdmin && "(Leave blank to keep unchanged)"}
            </label>
            <input
              type="password"
              value={adminForm.password}
              onChange={(e) => setAdminForm({ ...adminForm, password: e.target.value })}
              placeholder={editingAdmin ? "••••••••" : "Create password"}
              className="w-full px-4 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              style={{
                background: THEME.surface,
                borderColor: THEME.border,
                color: THEME.ink,
              }}
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1" style={{ color: THEME.inkMuted }}>
              Role
            </label>
            <select
              value={adminForm.role}
              onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value as AdminRole })}
              className="w-full px-4 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
              style={{
                background: THEME.surface,
                borderColor: THEME.border,
                color: THEME.ink,
              }}
            >
              <option value="market">Market Admin</option>
              <option value="viewer">Viewer</option>
              <option value="super">Super Admin</option>
            </select>
          </div>

          {adminForm.role === "market" && (
            <div>
              <label className="block text-xs font-semibold mb-1" style={{ color: THEME.inkMuted }}>
                Assigned Market
              </label>
              <select
                value={adminForm.marketId}
                onChange={(e) => setAdminForm({ ...adminForm, marketId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
                style={{
                  background: THEME.surface,
                  borderColor: THEME.border,
                  color: THEME.ink,
                }}
              >
                <option value="">Select Market</option>
                <option value="dambulla">Dambulla</option>
                <option value="kappetipola">Kappetipola</option>
              </select>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 pt-2">
          <button
            onClick={handleSave}
            disabled={!isFormValid || isProcessing}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-white active:scale-[0.98] transition-all disabled:opacity-50 shadow-md cursor-pointer disabled:cursor-not-allowed"
            style={{ background: THEME.accent }}
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {editingAdmin ? "Update" : "Add"} Admin
          </button>

          {editingAdmin && (
            <button
              onClick={resetForm}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold transition-all hover:opacity-80 active:scale-[0.98] cursor-pointer"
              style={{ background: THEME.surfaceMuted, color: THEME.inkMuted }}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
          <p className="text-gray-500 font-medium">Loading admins...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-6">
          <AnimatePresence>
            {admins.map((a) => (
              <motion.div
                key={a.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="p-5 rounded-3xl border shadow-sm flex flex-col justify-between"
                style={{
                  background: THEME.surfaceRaised,
                  borderColor: THEME.border,
                }}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                        style={{ background: THEME.surfaceMuted }}
                      >
                        <ShieldCheck className="w-5 h-5" style={{ color: THEME.accent }} />
                      </div>
                      <div className="min-w-0">
                        <h4 className="font-bold truncate" style={{ color: THEME.ink }}>
                          {a.name}
                        </h4>
                        <p className="text-xs truncate" style={{ color: THEME.inkMuted }}>
                          {a.email}
                        </p>
                      </div>
                    </div>
                    {getRoleBadge(a.role)}
                  </div>

                  {a.marketId && (
                    <div
                      className="flex items-center gap-1.5 text-xs font-medium mb-3 px-2.5 py-1 rounded-lg w-max"
                      style={{ background: THEME.surface, color: THEME.inkMuted }}
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="capitalize">
                        {a.marketId === "dambulla" ? "Dambulla" : "Kappetipola"}
                      </span>
                    </div>
                  )}
                </div>

                <div
                  className="flex items-center justify-between mt-4 pt-3"
                  style={{ borderTop: `1px solid ${THEME.border}` }}
                >
                  <button
                    onClick={() => handleToggleActive(a.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      a.isActive
                        ? "text-emerald-700 bg-emerald-50 border border-emerald-200"
                        : "text-slate-500 bg-slate-100 border border-slate-200"
                    }`}
                  >
                    {a.isActive ? "Active" : "Inactive"}
                  </button>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleEdit(a)}
                      className="p-2 rounded-xl transition-colors hover:bg-gray-100 active:scale-95 cursor-pointer"
                      style={{ color: THEME.inkFaint }}
                      title="Edit Admin"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(a.id)}
                      className="p-2 rounded-xl transition-colors hover:bg-red-50 hover:text-red-500 active:scale-95 cursor-pointer"
                      style={{ color: THEME.inkFaint }}
                      title="Delete Admin"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </AdminPageLayout>
  );
}