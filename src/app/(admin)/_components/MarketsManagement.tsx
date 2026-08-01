import React, { useState } from "react";
import { Save, X, MapPin, Edit2, Trash2, Building2, Plus, Sparkles } from "lucide-react";
import { ANALYZE_THEME } from "@/lib/chartTheme";
import { loadMarkets, generateId, saveMarkets } from "@/lib/storage";
import { MarketCenter } from "@/lib/types";
import { ADMIN_DEMO_DATA, ADMIN_SECTION_CONTENT } from "../data/demoData";
import { AdminPageLayout } from "./AdminPageLayout";

export function MarketsManagement() {
  const [markets, setMarkets] = useState<MarketCenter[]>(() => {
    const stored = loadMarkets();
    return stored.length > 0 ? stored : ADMIN_DEMO_DATA.markets;
  });
  const [editingMarket, setEditingMarket] = useState<MarketCenter | null>(null);
  const [marketForm, setMarketForm] = useState({ name: "", nameSi: "", district: "", emoji: "" });

  const handleSave = () => {
    if (!marketForm.name.trim() || !marketForm.district.trim() || !marketForm.emoji.trim()) return;

    let updated: MarketCenter[];
    if (editingMarket) {
      updated = markets.map((m) =>
        m.id === editingMarket.id ? { ...m, ...marketForm } : m
      );
    } else {
      const newMkt: MarketCenter = { id: generateId(), ...marketForm };
      updated = [...markets, newMkt];
    }
    setMarkets(updated);
    saveMarkets(updated);
    handleCancel();
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this market center?")) {
      const updated = markets.filter((m) => m.id !== id);
      setMarkets(updated);
      saveMarkets(updated);
      if (editingMarket?.id === id) {
        handleCancel();
      }
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
      <div className="p-6 sm:p-7 transition-all duration-300 relative overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: editingMarket ? "#f59e0b" : ANALYZE_THEME.accent }} />
            <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: ANALYZE_THEME.ink }}>
              {editingMarket ? "Edit Market Center" : "Add New Market Center"}
            </h3>
          </div>
          {editingMarket && (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${ANALYZE_THEME.accent}15`, color: ANALYZE_THEME.accent }}>
              Editing #{editingMarket.id}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Emoji Field */}
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

          {/* District Field */}
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

          {/* English Name Field */}
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

          {/* Sinhala Name Field */}
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

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-2 border-t" style={{ borderColor: `${ANALYZE_THEME.border}80` }}>
          {editingMarket && (
            <button
              onClick={handleCancel}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all border active:scale-95"
              style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border, color: ANALYZE_THEME.inkMuted }}
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          )}
          <button
            onClick={handleSave}
            disabled={!isFormValid}
            className="flex items-center gap-2 px-6 py-2.5 rounded-2xl font-bold text-sm text-white transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
            style={{ background: ANALYZE_THEME.accent }}
          >
            {editingMarket ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingMarket ? "Update Market" : "Add Market"}
          </button>
        </div>
      </div>

      {/* Grid List Section */}
      {markets.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center gap-3" style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}>
          <div className="p-4 rounded-full" style={{ background: `${ANALYZE_THEME.accent}10`, color: ANALYZE_THEME.accent }}>
            <Sparkles className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-base" style={{ color: ANALYZE_THEME.ink }}>No Market Centers Found</h4>
          <p className="text-xs max-w-sm" style={{ color: ANALYZE_THEME.inkMuted }}>
            Use the form above to add your first economic or trading center to the system.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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

                {/* Actions */}
                <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleEdit(m)}
                    title="Edit"
                    className="p-2 rounded-xl transition-all hover:bg-black/5 active:scale-90"
                    style={{ color: ANALYZE_THEME.inkMuted }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(m.id)}
                    title="Delete"
                    className="p-2 rounded-xl transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-90"
                    style={{ color: ANALYZE_THEME.inkFaint }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* District Badge */}
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