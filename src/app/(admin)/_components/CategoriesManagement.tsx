import React, { useState, useEffect } from "react";
import { Save, X, Edit2, Trash2, Layers, Plus, Sparkles, Package, Loader2, Check, AlertCircle } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { ANALYZE_THEME } from "@/lib/chartTheme";
import { Category, Item } from "@/lib/types";
import { ADMIN_SECTION_CONTENT } from "../data/demoData";
import { AdminPageLayout } from "./AdminPageLayout";
import { AnimatePresence, motion } from "framer-motion";

export function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", nameSi: "", emoji: "" });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const supabase = createClient();
      const [catRes, vegRes] = await Promise.all([
        supabase.from('categories').select('*').order('name', { ascending: true }),
        supabase.from('vegetables').select('*').order('name', { ascending: true })
      ]);

      if (catRes.error) throw catRes.error;
      if (vegRes.error) throw vegRes.error;

      if (Array.isArray(catRes.data)) {
        setCategories(catRes.data.map((c: any) => ({
          id: c.id.toString(),
          name: c.name,
          nameSi: c.name_si || "",
          emoji: c.emoji || "📁"
        })));
      }
      
      if (Array.isArray(vegRes.data)) {
        setItems(vegRes.data.map((v: any) => ({
          id: v.id.toString(),
          categoryId: v.category_id?.toString() || "",
          name: v.name,
          nameSi: v.name_si || "",
          emoji: v.emoji || "🥬",
          unit: v.unit || "kg",
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
    if (!categoryForm.name.trim() || !categoryForm.emoji.trim()) return;
    setIsProcessing(true);

    try {
      const supabase = createClient();
      const payload = {
        name: categoryForm.name,
        name_si: categoryForm.nameSi,
        emoji: categoryForm.emoji
      };

      if (editingCategory) {
        const { error } = await supabase
          .from('categories')
          .update(payload)
          .eq('id', editingCategory.id);

        if (error) throw error;
        showToast("Category updated", "success");
      } else {
        const { error } = await supabase
          .from('categories')
          .insert([{
            id: categoryForm.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            ...payload
          }]);

        if (error) throw error;
        showToast("Category added", "success");
      }
      handleCancel();
      fetchData();
    } catch (error) {
      showToast("Failed to save category", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category? Items in this category might become orphaned.")) return;
    setIsProcessing(true);
    
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('categories')
        .delete()
        .eq('id', id);

      if (error) throw error;

      showToast("Category deleted", "success");
      if (editingCategory?.id === id) handleCancel();
      fetchData();
    } catch (error) {
      showToast("Failed to delete category", "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryForm({ name: cat.name, nameSi: cat.nameSi || "", emoji: cat.emoji });
  };

  const handleCancel = () => {
    setEditingCategory(null);
    setCategoryForm({ name: "", nameSi: "", emoji: "" });
  };

  const isFormValid = categoryForm.name.trim() && categoryForm.emoji.trim();

  return (
    <AdminPageLayout
      title={ADMIN_SECTION_CONTENT.categories.title}
      subtitle={ADMIN_SECTION_CONTENT.categories.subtitle}
      icon={Layers}
      countLabel={ADMIN_SECTION_CONTENT.categories.countLabel}
      countValue={categories.length}
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
            <span className="w-2 h-2 rounded-full" style={{ background: editingCategory ? "#f59e0b" : ANALYZE_THEME.accent }} />
            <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: ANALYZE_THEME.ink }}>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h3>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          <div className="sm:col-span-3 lg:col-span-2">
            <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.inkMuted }}>
              Emoji / Icon *
            </label>
            <input
              type="text"
              value={categoryForm.emoji}
              onChange={(e) => setCategoryForm({ ...categoryForm, emoji: e.target.value })}
              placeholder="🥬"
              className="w-full px-4 py-2.5 rounded-2xl border text-center text-lg font-medium focus:outline-none focus:ring-2 transition-all shadow-sm"
              style={{
                background: ANALYZE_THEME.surface,
                borderColor: ANALYZE_THEME.border,
                color: ANALYZE_THEME.ink,
              }}
            />
          </div>

          <div className="sm:col-span-9 lg:col-span-5">
            <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.inkMuted }}>
              Category Name (English) *
            </label>
            <input
              type="text"
              value={categoryForm.name}
              onChange={(e) => setCategoryForm({ ...categoryForm, name: e.target.value })}
              placeholder="e.g. Vegetables"
              className="w-full px-4 py-2.5 rounded-2xl border font-medium focus:outline-none focus:ring-2 transition-all shadow-sm"
              style={{
                background: ANALYZE_THEME.surface,
                borderColor: ANALYZE_THEME.border,
                color: ANALYZE_THEME.ink,
              }}
            />
          </div>

          <div className="sm:col-span-12 lg:col-span-5">
            <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.inkMuted }}>
              Name (Sinhala)
            </label>
            <input
              type="text"
              value={categoryForm.nameSi}
              onChange={(e) => setCategoryForm({ ...categoryForm, nameSi: e.target.value })}
              placeholder="e.g. එළවළු"
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
          {editingCategory && (
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
            {isProcessing ? <Loader2 className="w-4 h-4 animate-spin" /> : (editingCategory ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />)}
            {editingCategory ? "Update Category" : "Add Category"}
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="p-12 text-center flex flex-col items-center">
          <Loader2 className="w-8 h-8 animate-spin text-emerald-500 mb-4" />
          <p className="text-gray-500 font-medium">Loading categories...</p>
        </div>
      ) : categories.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center gap-3 m-6" style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}>
          <div className="p-4 rounded-full" style={{ background: `${ANALYZE_THEME.accent}10`, color: ANALYZE_THEME.accent }}>
            <Sparkles className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-base" style={{ color: ANALYZE_THEME.ink }}>No Categories Found</h4>
          <p className="text-xs max-w-sm" style={{ color: ANALYZE_THEME.inkMuted }}>
            Create your first produce category using the form above to start organizing items.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 p-6">
          {categories.map((cat) => {
            const itemCount = items.filter((i) => i.categoryId === cat.id).length;

            return (
              <div
                key={cat.id}
                className="group p-5 rounded-3xl border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between gap-4"
                style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3.5">
                    <span className="text-2xl p-2 rounded-2xl border shadow-inner flex items-center justify-center shrink-0 w-12 h-12 overflow-hidden" style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}>
                      {cat.emoji && (cat.emoji.startsWith('/') || cat.emoji.includes('.svg')) ? (
                        <img src={cat.emoji} alt={cat.name} className="w-8 h-8 object-contain" />
                      ) : (
                        cat.emoji
                      )}
                    </span>
                    <div className="space-y-1">
                      <h4 className="font-bold text-base leading-snug group-hover:opacity-90 transition-opacity" style={{ color: ANALYZE_THEME.ink }}>
                        {cat.name}
                      </h4>
                      {cat.nameSi && (
                        <p className="text-xs font-semibold leading-relaxed" style={{ color: ANALYZE_THEME.inkMuted }}>
                          {cat.nameSi}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(cat)}
                      title="Edit"
                      className="p-2 rounded-xl transition-all hover:bg-black/5 active:scale-90 cursor-pointer"
                      style={{ color: ANALYZE_THEME.inkMuted }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
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
                    <Package className="w-3.5 h-3.5" />
                    {itemCount} {itemCount === 1 ? 'item' : 'items'}
                  </span>
                  <span className="text-[10px] uppercase font-mono tracking-wider" style={{ color: ANALYZE_THEME.inkFaint }}>
                    ID: {cat.id}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </AdminPageLayout>
  );
}