import React, { useState } from "react";
import { Save, X, Edit2, Trash2, Layers, Plus, Sparkles, Package } from "lucide-react";
import { ANALYZE_THEME } from "@/lib/chartTheme";
import { loadCategories, loadItems, generateId, saveCategories, saveItems } from "@/lib/storage";
import { Category, Item } from "@/lib/types";
import { ADMIN_DEMO_DATA, ADMIN_SECTION_CONTENT } from "../data/demoData";
import { AdminPageLayout } from "./AdminPageLayout";

export function CategoriesManagement() {
  const [categories, setCategories] = useState<Category[]>(() => {
    const stored = loadCategories();
    return stored.length > 0 ? stored : ADMIN_DEMO_DATA.categories;
  });
  const [items, setItems] = useState<Item[]>(() => {
    const stored = loadItems();
    return stored.length > 0 ? stored : ADMIN_DEMO_DATA.items;
  });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({ name: "", nameSi: "", emoji: "" });

  const handleSave = () => {
    if (!categoryForm.name.trim() || !categoryForm.emoji.trim()) return;

    let updated: Category[];
    if (editingCategory) {
      updated = categories.map((c) =>
        c.id === editingCategory.id ? { ...c, ...categoryForm } : c
      );
    } else {
      const newCat: Category = { id: generateId(), ...categoryForm };
      updated = [...categories, newCat];
    }
    setCategories(updated);
    saveCategories(updated);
    handleCancel();
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this category? All items in this category will also be deleted.")) {
      const updatedCats = categories.filter((c) => c.id !== id);
      const updatedItems = items.filter((i) => i.categoryId !== id);
      setCategories(updatedCats);
      setItems(updatedItems);
      saveCategories(updatedCats);
      saveItems(updatedItems);
      if (editingCategory?.id === id) {
        handleCancel();
      }
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
      <div className="p-6 sm:p-7 transition-all duration-300 relative overflow-hidden">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full" style={{ background: editingCategory ? "#f59e0b" : ANALYZE_THEME.accent }} />
            <h3 className="font-bold text-xs uppercase tracking-wider" style={{ color: ANALYZE_THEME.ink }}>
              {editingCategory ? "Edit Category" : "Add New Category"}
            </h3>
          </div>
          {editingCategory && (
            <span className="text-xs px-2.5 py-1 rounded-full font-medium" style={{ background: `${ANALYZE_THEME.accent}15`, color: ANALYZE_THEME.accent }}>
              Editing #{editingCategory.id}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
          {/* Emoji Field */}
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

          {/* English Name Field */}
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

          {/* Sinhala Name Field */}
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

        {/* Form Actions */}
        <div className="flex items-center justify-end gap-3 pt-5 mt-2 border-t" style={{ borderColor: `${ANALYZE_THEME.border}80` }}>
          {editingCategory && (
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
            {editingCategory ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            {editingCategory ? "Update Category" : "Add Category"}
          </button>
        </div>
      </div>

      {/* Grid List Section */}
      {categories.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed flex flex-col items-center justify-center gap-3" style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}>
          <div className="p-4 rounded-full" style={{ background: `${ANALYZE_THEME.accent}10`, color: ANALYZE_THEME.accent }}>
            <Sparkles className="w-8 h-8" />
          </div>
          <h4 className="font-bold text-base" style={{ color: ANALYZE_THEME.ink }}>No Categories Found</h4>
          <p className="text-xs max-w-sm" style={{ color: ANALYZE_THEME.inkMuted }}>
            Create your first produce category using the form above to start organizing items.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
                    <span className="text-2xl p-3 rounded-2xl border shadow-inner flex items-center justify-center shrink-0" style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}>
                      {cat.emoji}
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

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleEdit(cat)}
                      title="Edit"
                      className="p-2 rounded-xl transition-all hover:bg-black/5 active:scale-90"
                      style={{ color: ANALYZE_THEME.inkMuted }}
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(cat.id)}
                      title="Delete"
                      className="p-2 rounded-xl transition-all hover:bg-rose-50 hover:text-rose-600 active:scale-90"
                      style={{ color: ANALYZE_THEME.inkFaint }}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Bottom Info Bar */}
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