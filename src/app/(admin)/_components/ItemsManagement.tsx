import React, { useState, useEffect } from "react";
import { Save, X, Edit2, Trash2, Package, Plus, Sparkles, Tag, ChevronDown, Banknote, Loader2, Check, AlertCircle } from "lucide-react";
import { ANALYZE_THEME } from "@/lib/chartTheme";
import { Category, Item } from "@/lib/types";
import { ADMIN_SECTION_CONTENT } from "../data/demoData";
import { AdminPageLayout } from "./AdminPageLayout";
import { AnimatePresence, motion } from "framer-motion";

export function ItemsManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [itemForm, setItemForm] = useState({
    categoryId: "",
    name: "",
    nameSi: "",
    emoji: "",
    unit: "kg",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [catRes, vegRes] = await Promise.all([
        fetch('http://localhost/NAMIS/backend/api/categories.php'),
        fetch('http://localhost/NAMIS/backend/api/vegetables.php')
      ]);
      const catData = await catRes.json();
      const vegData = await vegRes.json();

      if (Array.isArray(catData)) {
        setCategories(catData.map((c: any) => ({
          id: c.id.toString(),
          name: c.name,
          nameSi: c.name_si || "",
          emoji: c.image_url || "📁"
        })));
      }
      
      if (Array.isArray(vegData)) {
        setItems(vegData.map((v: any) => ({
          id: v.id.toString(),
          categoryId: v.category_id?.toString() || "",
          name: v.name,
          nameSi: v.name_si || "",
          emoji: v.image_url || "🥬",
          unit: "kg",
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
    if (!itemForm.name.trim() || !itemForm.emoji.trim() || !itemForm.categoryId) return;
    setIsProcessing(true);

    try {
      const method = editingItem ? 'PUT' : 'POST';
      const body = {
        id: editingItem?.id,
        category_id: itemForm.categoryId,
        name: itemForm.name,
        name_si: itemForm.nameSi,
        image_url: itemForm.emoji
      };

      const res = await fetch('http://localhost/NAMIS/backend/api/vegetables.php', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      const result = await res.json();
      if (result.success) {
        showToast(editingItem ? "Item updated" : "Item added", "success");
        handleCancel();
        fetchData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showToast("Failed to save item", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this item?")) return;
    setIsProcessing(true);
    
    try {
      const res = await fetch('http://localhost/NAMIS/backend/api/vegetables.php', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const result = await res.json();
      if (result.success) {
        showToast("Item deleted", "success");
        if (editingItem?.id === id) handleCancel();
        fetchData();
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      showToast("Failed to delete item", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (item: Item) => {
    setEditingItem(item);
    setItemForm({
      categoryId: item.categoryId,
      name: item.name,
      nameSi: item.nameSi || "",
      emoji: item.emoji,
      unit: item.unit || "kg",
    });
  };

  const handleCancel = () => {
    setEditingItem(null);
    setItemForm({ categoryId: "", name: "", nameSi: "", emoji: "", unit: "kg" });
  };

  const isFormValid = itemForm.name.trim() && itemForm.emoji.trim() && itemForm.categoryId;

  return (
    <AdminPageLayout
      title={ADMIN_SECTION_CONTENT.items.title}
      subtitle={ADMIN_SECTION_CONTENT.items.subtitle}
      icon={Package}
      countLabel={ADMIN_SECTION_CONTENT.items.countLabel}
      countValue={items.length}
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
            <span className="w-2 h-2 rounded-full" style={{ background: editingItem ? "#f59e0b" : ANALYZE_THEME.accent }} />
            <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: ANALYZE_THEME.ink }}>
              {editingItem ? "Edit Produce Item" : "Add New Produce Item"}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-6 lg:col-span-4">
            <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.inkMuted }}>
              Category *
            </label>
            <div className="relative">
              <select
                value={itemForm.categoryId}
                onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-2xl border font-medium focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer pr-10 shadow-sm"
                style={{
                  background: ANALYZE_THEME.surface,
                  borderColor: ANALYZE_THEME.border,
                  color: ANALYZE_THEME.ink,
                }}
              >
                <option value="">Select Category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>
                ))}
              </select>
              <ChevronDown className="w-4 h-4 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: ANALYZE_THEME.inkMuted }} />
            </div>
          </div>

          <div className="sm:col-span-6 lg:col-span-4">
            <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.inkMuted }}>
              Item Name (English) *
            </label>
            <input
              type="text"
              value={itemForm.name}
              onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })}
              placeholder="e.g. Green Beans"
              className="w-full px-4 py-2.5 rounded-2xl border font-medium focus:outline-none focus:ring-2 transition-all shadow-sm"
              style={{
                background: ANALYZE_THEME.surface,
                borderColor: ANALYZE_THEME.border,
                color: ANALYZE_THEME.ink,
              }}
            />
          </div>

          <div className="sm:col-span-6 lg:col-span-4">
            <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.inkMuted }}>
              Name (Sinhala)
            </label>
            <input
              type="text"
              value={itemForm.nameSi}
              onChange={(e) => setItemForm({ ...itemForm, nameSi: e.target.value })}
              placeholder="e.g. බෝංචි"
              className="w-full px-4 py-2.5 rounded-2xl border font-medium focus:outline-none focus:ring-2 transition-all shadow-sm"
              style={{
                background: ANALYZE_THEME.surface,
                borderColor: ANALYZE_THEME.border,
                color: ANALYZE_THEME.ink,
              }}
            />
          </div>

          <div className="sm:col-span-3 lg:col-span-2">
            <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.inkMuted }}>
              Emoji *
            </label>
            <input
              type="text"
              value={itemForm.emoji}
              onChange={(e) => setItemForm({ ...itemForm, emoji: e.target.value })}
              placeholder="🫘"
              className="w-full px-4 py-2.5 rounded-2xl border text-center text-lg font-medium focus:outline-none focus:ring-2 transition-all shadow-sm"
              style={{
                background: ANALYZE_THEME.surface,
                borderColor: ANALYZE_THEME.border,
                color: ANALYZE_THEME.ink,
              }}
            />
          </div>

          <div className="sm:col-span-3 lg:col-span-2">
            <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.inkMuted }}>
              Unit
            </label>
            <div className="relative">
              <select
                value={itemForm.unit}
                onChange={(e) => setItemForm({ ...itemForm, unit: e.target.value })}
                className="w-full px-3 py-2.5 rounded-2xl border font-medium focus:outline-none focus:ring-2 transition-all appearance-none cursor-pointer pr-8 shadow-sm"
                style={{
                  background: ANALYZE_THEME.surface,
                  borderColor: ANALYZE_THEME.border,
                  color: ANALYZE_THEME.ink,
                }}
              >
                <option value="kg">kg</option>
                <option value="piece">piece</option>
                <option value="bunch">bunch</option>
                <option value="pack">pack</option>
              </select>
              <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: ANALYZE_THEME.inkMuted }} />
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-5 mt-2 border-t" style={{ borderColor: `${ANALYZE_THEME.border}80` }}>
          {editingItem && (
            <button
              onClick={handleCancel}
              disabled={isProcessing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-2xl font-semibold text-sm transition-all border active:scale-95"
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
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingItem ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
            {editingItem ? "Update Item" : "Add Item"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
          <p className="text-gray-500 font-medium">Loading items...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center gap-3 m-6" style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}>
          <div className="p-4 rounded-full" style={{ background: `${ANALYZE_THEME.accent}10`, color: ANALYZE_THEME.accent }}>
            <Sparkles className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-base" style={{ color: ANALYZE_THEME.ink }}>No Items Available</h4>
          <p className="text-xs max-w-sm" style={{ color: ANALYZE_THEME.inkMuted }}>
            Select a category and fill out the details above to add produce items to your catalog.
          </p>
        </div>
      ) : (
        <div className="space-y-8 p-6">
          {categories.map((cat) => {
            const catItems = items.filter((i) => i.categoryId === cat.id);
            if (catItems.length === 0) return null;

            return (
              <div key={cat.id} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b" style={{ borderColor: `${ANALYZE_THEME.border}80` }}>
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl p-1.5 rounded-xl border" style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}>
                      {cat.emoji}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold" style={{ color: ANALYZE_THEME.ink }}>
                          {cat.name}
                        </h3>
                        {cat.nameSi && (
                          <span className="text-xs font-medium" style={{ color: ANALYZE_THEME.inkMuted }}>
                            ({cat.nameSi})
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-bold border" style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border, color: ANALYZE_THEME.inkMuted }}>
                    {catItems.length} {catItems.length === 1 ? 'item' : 'items'}
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {catItems.map((item) => (
                    <div
                      key={item.id}
                      className="group p-5 rounded-3xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-4"
                      style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3.5">
                          <span className="text-2xl p-3 rounded-2xl border shadow-inner flex items-center justify-center shrink-0" style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}>
                            {item.emoji}
                          </span>
                          <div className="space-y-0.5">
                            <h4 className="font-bold text-base leading-snug group-hover:opacity-90 transition-opacity" style={{ color: ANALYZE_THEME.ink }}>
                              {item.name}
                            </h4>
                            {item.nameSi && (
                              <p className="text-xs font-semibold" style={{ color: ANALYZE_THEME.inkMuted }}>
                                {item.nameSi}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={() => handleEdit(item)}
                            title="Edit"
                            className="p-2 rounded-xl transition-all hover:bg-black/5 active:scale-90 cursor-pointer"
                            style={{ color: ANALYZE_THEME.inkMuted }}
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            title="Delete"
                            className="p-2 rounded-xl transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-90 cursor-pointer"
                            style={{ color: ANALYZE_THEME.inkFaint }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="pt-3 border-t flex items-center justify-between gap-2" style={{ borderColor: `${ANALYZE_THEME.border}60` }}>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border" style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border, color: ANALYZE_THEME.accentInk }}>
                            <Tag className="w-3 h-3" />
                            {item.unit}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminPageLayout>
  );
}