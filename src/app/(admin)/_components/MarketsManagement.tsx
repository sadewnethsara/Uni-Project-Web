import React, { useState, useEffect } from "react";
import { Save, X, MapPin, Edit2, Trash2, Building2, Plus, Sparkles, Loader2, Check, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ANALYZE_THEME } from "@/lib/chartTheme";
import { MarketCenter } from "@/lib/types";
import { ADMIN_SECTION_CONTENT } from "../data/demoData";
import { AdminPageLayout } from "./AdminPageLayout";
import { AnimatePresence, motion } from "framer-motion";

export function MarketsManagement() {
  const [markets, setMarkets] = useState<MarketCenter[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [editingMarket, setEditingMarket] = useState<MarketCenter | null>(null);
  const [marketForm, setMarketForm] = useState({ name: "", nameSi: "", district: "", emoji: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('markets')
        .select('*')
        .order('name', { ascending: true });

      if (error) throw error;

      if (Array.isArray(data)) {
        setMarkets(data.map((m: any) => ({
          id: m.id,
          name: m.name,
          nameSi: m.name_si || "",
          district: m.district || "Unknown",
          emoji: m.emoji || "🏛️"
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

  const handleSave = async () => {
    if (!marketForm.name.trim() || !marketForm.district.trim() || !marketForm.emoji.trim()) return;
    setIsProcessing(true);

    try {
      const supabase = createClient();
      const payload = {
        name: marketForm.name,
        name_si: marketForm.nameSi,
        district: marketForm.district,
        emoji: marketForm.emoji
      };

      if (editingMarket) {
        const { error } = await supabase
          .from('markets')
          .update(payload)
          .eq('id', editingMarket.id);

        if (error) throw error;
        showToast("Market updated", "success");
      } else {
        const { error } = await supabase
          .from('markets')
          .insert([{
            id: marketForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            ...payload
          }]);

        if (error) throw error;
        showToast("Market added", "success");
      }
      handleCancel();
      fetchData();
    } catch (error) {
      showToast("Failed to save market", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this market center?")) return;
    setIsProcessing(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('markets')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast("Market deleted", "success");
      if (editingMarket?.id === id) handleCancel();
      fetchData();
    } catch (error) {
      showToast("Failed to delete market", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (m: MarketCenter) => {
    setEditingMarket(m);
    setMarketForm({ name: m.name, nameSi: m.nameSi, district: m.district, emoji: m.emoji });
  };

  const handleCancel = () => {
    setEditingMarket(null);
    setMarketForm({ name: "", nameSi: "", district: "", emoji: "" });
  };

  const isFormValid = marketForm.name.trim() && marketForm.district.trim() && marketForm.emoji.trim();

  return (
    <AdminPageLayout
      title={ADMIN_SECTION_CONTENT.markets.title}
      subtitle={ADMIN_SECTION_CONTENT.markets.subtitle}
      icon={Building2}
      countLabel={ADMIN_SECTION_CONTENT.markets.countLabel}
      countValue={markets.length}
      accentColor={ANALYZE_THEME.accent}
      accentSoftColor={ANALYZE_THEME.accentSoft}
      surfaceColor={ANALYZE_THEME.surface}
      surfaceRaisedColor={ANALYZE_THEME.surfaceRaised}
      borderColor={ANALYZE_THEME.border}
      inkColor={ANALYZE_THEME.ink}
      inkMutedColor={ANALYZE_THEME.inkMuted}
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

      <div className="p-6 sm:p-7 transition-all duration-300 relative overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: editingMarket ? "#f59e0b" : ANALYZE_THEME.accent }} />
            <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: ANALYZE_THEME.ink }}>
              {editingMarket ? "Edit Market Center" : "Add New Market Center"}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-3 lg:col-span-2">
            <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.inkMuted }}>
              Emoji / Icon
            </label>
            <div className="relative flex items-center">
              <input
                type="text"
                value={marketForm.emoji}
                onChange={(e) => setMarketForm({ ...marketForm, emoji: e.target.value })}
                placeholder="🏛️"
                className="w-full px-4 py-2.5 rounded-2xl border text-center text-lg font-medium focus:outline-none focus:ring-2 transition-all shadow-sm"
                style={{
                  background: ANALYZE_THEME.surface,
                  borderColor: ANALYZE_THEME.border,
                  color: ANALYZE_THEME.ink,
                }}
              />
            </div>
          </div>

          <div className="sm:col-span-9 lg:col-span-4">
            <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.inkMuted }}>
              District
            </label>
            <input
              type="text"
              value={marketForm.district}
              onChange={(e) => setMarketForm({ ...marketForm, district: e.target.value })}
              placeholder="e.g. Matale"
              className="w-full px-4 py-2.5 rounded-2xl border font-medium focus:outline-none focus:ring-2 transition-all shadow-sm"
              style={{
                background: ANALYZE_THEME.surface,
                borderColor: ANALYZE_THEME.border,
                color: ANALYZE_THEME.ink,
              }}
            />
          </div>

          <div className="sm:col-span-6 lg:col-span-3">
            <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.inkMuted }}>
              Market Name (English)
            </label>
            <input
              type="text"
              value={marketForm.name}
              onChange={(e) => setMarketForm({ ...marketForm, name: e.target.value })}
              placeholder="e.g. Dambulla Economic Centre"
              className="w-full px-4 py-2.5 rounded-2xl border font-medium focus:outline-none focus:ring-2 transition-all shadow-sm"
              style={{
                background: ANALYZE_THEME.surface,
                borderColor: ANALYZE_THEME.border,
                color: ANALYZE_THEME.ink,
              }}
            />
          </div>

          <div className="sm:col-span-6 lg:col-span-3">
            <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.inkMuted }}>
              Name (Sinhala)
            </label>
            <input
              type="text"
              value={marketForm.nameSi}
              onChange={(e) => setMarketForm({ ...marketForm, nameSi: e.target.value })}
              placeholder="e.g. දඹුල්ල ආර්ථික මධ්‍යස්ථානය"
              className="w-full px-4 py-2.5 rounded-2xl border font-medium focus:outline-none focus:ring-2 transition-all shadow-sm"
              style={{
                background: ANALYZE_THEME.surface,
                borderColor: ANALYZE_THEME.border,
                color: ANALYZE_THEME.ink,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 mt-2 border-t" style={{ borderColor: `${ANALYZE_THEME.border}80` }}>
          {editingMarket && (
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all border active:scale-95 cursor-pointer"
              style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border, color: ANALYZE_THEME.inkMuted }}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!isFormValid || isProcessing}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
            style={{ background: ANALYZE_THEME.accent }}
          >
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingMarket ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
            {editingMarket ? "Update Market" : "Add Market"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
          <p className="text-gray-500 font-medium">Loading markets...</p>
        </div>
      ) : markets.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center gap-3 m-6" style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}>
          <div className="p-4 rounded-full" style={{ background: `${ANALYZE_THEME.accent}10`, color: ANALYZE_THEME.accent }}>
            <Sparkles className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-base" style={{ color: ANALYZE_THEME.ink }}>No Market Centers Found</h4>
          <p className="text-xs max-w-sm" style={{ color: ANALYZE_THEME.inkMuted }}>
            Use the form above to add your first economic or trading center to the system.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
          {markets.map((m) => (
            <div
              key={m.id}
              className="group p-5 rounded-3xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-4"
              style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  <span className="text-2xl p-3 rounded-2xl border shadow-inner flex items-center justify-center shrink-0" style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}>
                    {m.emoji}
                  </span>
                  <div className="space-y-1">
                    <h4 className="font-bold text-base leading-snug group-hover:opacity-90 transition-opacity" style={{ color: ANALYZE_THEME.ink }}>
                      {m.name}
                    </h4>
                    {m.nameSi && (
                      <p className="text-xs font-semibold leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                        {m.nameSi}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(m)}
                    title="Edit"
                    className="p-2 rounded-xl transition-all hover:bg-black/5 active:scale-90 cursor-pointer"
                    style={{ color: ANALYZE_THEME.inkMuted }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    title="Delete"
                    className="p-2 rounded-xl transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-90 cursor-pointer"
                    style={{ color: ANALYZE_THEME.inkFaint }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="pt-3 border-t flex items-center justify-between" style={{ borderColor: `${ANALYZE_THEME.border}60` }}>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold" style={{ background: `${ANALYZE_THEME.accent}12`, color: ANALYZE_THEME.accent }}>
                  <MapPin className="w-3 h-3" />
                  {m.district}
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider" style={{ color: ANALYZE_THEME.inkFaint }}>
                  ID: {m.id}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </AdminPageLayout>
  );
}