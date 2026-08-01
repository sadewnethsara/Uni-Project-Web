import React, { useState } from "react";
import { Search, Edit2, Save, TrendingUp, TrendingDown, X, Check } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Helper utility fallback for classnames if 'cn' isn't available
function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(" ");
}

// Fallback theme structure to keep styles consistent & prevent undefined errors
const ANALYZE_THEME = {
  accent: "#0f766e",
  accentSoft: "#f0fdfa",
  accentInk: "#115e59",
  surface: "#ffffff",
  surfaceRaised: "#f9fafb",
  border: "#e5e7eb",
  ink: "#111827",
  inkMuted: "#4b5563",
  inkFaint: "#9ca3af",
};

interface VegetableItem {
  id: number;
  name: string;
  emoji: string;
  todayPrice: number;
  yesterdayPrice: number;
  lastWeekPrice: number;
  category: string;
}

interface PriceManagementProps {
  market: "dambulla" | "kappetipola" | null;
  isSuperAdmin: boolean;
  onSave: () => void;
  saveStatus: "idle" | "saving" | "saved";
}

export function PriceManagement({
  market,
  isSuperAdmin,
  onSave,
  saveStatus,
}: PriceManagementProps) {
  const [selectedMarket, setSelectedMarket] = useState<"dambulla" | "kappetipola">(
    () => market || "dambulla"
  );

  const [vegetableData, setVegetableData] = useState<VegetableItem[]>([
    { id: 1, name: "Carrots", emoji: "🥕", todayPrice: 180, yesterdayPrice: 175, lastWeekPrice: 170, category: "Vegetables" },
    { id: 2, name: "Tomatoes", emoji: "🍅", todayPrice: 220, yesterdayPrice: 210, lastWeekPrice: 200, category: "Vegetables" },
    { id: 3, name: "Onions", emoji: "🧅", todayPrice: 160, yesterdayPrice: 155, lastWeekPrice: 150, category: "Vegetables" },
    { id: 4, name: "Potatoes", emoji: "🥔", todayPrice: 140, yesterdayPrice: 138, lastWeekPrice: 135, category: "Root Vegetables" },
    { id: 5, name: "Cabbage", emoji: "🥬", todayPrice: 90, yesterdayPrice: 85, lastWeekPrice: 80, category: "Leafy Greens" },
    { id: 6, name: "Leeks", emoji: "🧄", todayPrice: 200, yesterdayPrice: 195, lastWeekPrice: 190, category: "Leafy Greens" },
    { id: 7, name: "Beans", emoji: "🫘", todayPrice: 250, yesterdayPrice: 240, lastWeekPrice: 230, category: "Legumes" },
    { id: 8, name: "Chili", emoji: "🌶️", todayPrice: 350, yesterdayPrice: 340, lastWeekPrice: 330, category: "Spices" },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [bulkEditMode, setBulkEditMode] = useState(false);
  const [bulkPrice, setBulkPrice] = useState("");
  const [selectedVegetable, setSelectedVegetable] = useState<number | null>(null);
  const [editingPrice, setEditingPrice] = useState("");

  const handleEdit = (id: number, currentPrice: number) => {
    setSelectedVegetable(id);
    setEditingPrice(currentPrice.toString());
  };

  const handleCancelEdit = () => {
    setSelectedVegetable(null);
    setEditingPrice("");
  };

  const handleSavePrice = () => {
    if (selectedVegetable === null) return;
    const newPrice = parseFloat(editingPrice);
    if (isNaN(newPrice) || newPrice < 0) {
      handleCancelEdit();
      return;
    }

    setVegetableData((prev) =>
      prev.map((v) => (v.id === selectedVegetable ? { ...v, todayPrice: newPrice } : v))
    );
    setSelectedVegetable(null);
    setEditingPrice("");
    onSave();
  };

  const handleBulkUpdate = () => {
    const newPrice = parseFloat(bulkPrice);
    if (isNaN(newPrice) || newPrice < 0) return;

    // Apply bulk price only to the filtered items if filtering/searching, or all items
    setVegetableData((prev) =>
      prev.map((v) => {
        const matchesCategory = selectedCategory === "all" || v.category === selectedCategory;
        const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch ? { ...v, todayPrice: newPrice } : v;
      })
    );

    setBulkEditMode(false);
    setBulkPrice("");
    onSave();
  };

  const filteredData = vegetableData.filter((v) => {
    const matchesCategory = selectedCategory === "all" || v.category === selectedCategory;
    const matchesSearch = v.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = ["all", ...Array.from(new Set(vegetableData.map((v) => v.category)))];
  const activeMarketName = (isSuperAdmin ? selectedMarket : market) === "dambulla" ? "Dambulla" : "Kappetipola";

  return (
    <div className="space-y-5 max-w-8xl mx-auto px-1 sm:px-0">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-gray-100">
        <div className="min-w-0">
          <h2 className="text-2xl font-black tracking-tight" style={{ color: ANALYZE_THEME.ink }}>
            Price Management
          </h2>
          <p className="text-sm font-medium mt-0.5" style={{ color: ANALYZE_THEME.inkMuted }}>
            Manage daily vegetable prices for <span className="font-bold">{activeMarketName}</span> Market
          </p>
        </div>

        <button
          onClick={onSave}
          disabled={saveStatus === "saving"}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white active:scale-[0.98] transition-all disabled:opacity-70 disabled:active:scale-100 shadow-sm hover:shadow-md"
          style={{ background: ANALYZE_THEME.accent }}
        >
          {saveStatus === "saving" ? (
            <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
          ) : saveStatus === "saved" ? (
            <Check className="w-4 h-4 text-white" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {saveStatus === "saving" ? "Saving..." : saveStatus === "saved" ? "Saved!" : "Save All"}
        </button>
      </div>

      {/* Super Admin Market Toggle */}
      {isSuperAdmin && (
        <div
          className="p-3.5 sm:p-4 rounded-2xl border shadow-sm"
          style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
        >
          <label className="block text-xs uppercase tracking-wider font-extrabold mb-2.5" style={{ color: ANALYZE_THEME.inkMuted }}>
            Switch Admin Market Context
          </label>
          <div className="grid grid-cols-2 gap-2.5 max-w-md">
            {[
              { id: "dambulla" as const, label: "Dambulla", emoji: "🏛️" },
              { id: "kappetipola" as const, label: "Kappetipola", emoji: "🏪" },
            ].map((m) => {
              const isSelected = selectedMarket === m.id;
              return (
                <button
                  key={m.id}
                  onClick={() => setSelectedMarket(m.id)}
                  className={cn(
                    "flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border-2 font-bold text-sm transition-all",
                    isSelected ? "shadow-sm" : "hover:border-gray-300"
                  )}
                  style={{
                    borderColor: isSelected ? ANALYZE_THEME.accent : ANALYZE_THEME.border,
                    background: isSelected ? ANALYZE_THEME.accentSoft : ANALYZE_THEME.surface,
                    color: isSelected ? ANALYZE_THEME.accentInk : ANALYZE_THEME.ink,
                  }}
                >
                  <span className="text-lg">{m.emoji}</span>
                  <span>{m.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Controls: Search, Categories, Bulk Toggle */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Search bar */}
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search vegetables..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border font-medium text-sm focus:outline-none focus:ring-2 transition-all"
              style={{
                background: ANALYZE_THEME.surface,
                borderColor: ANALYZE_THEME.border,
                color: ANALYZE_THEME.ink,
              }}
            />
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" style={{ color: ANALYZE_THEME.inkFaint }} />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-md text-gray-400 hover:text-gray-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Bulk Edit Toggle Button */}
          <button
            onClick={() => setBulkEditMode(!bulkEditMode)}
            className="px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-center gap-2 border shadow-sm shrink-0"
            style={{
              background: bulkEditMode ? ANALYZE_THEME.accent : ANALYZE_THEME.surface,
              color: bulkEditMode ? "white" : ANALYZE_THEME.ink,
              borderColor: bulkEditMode ? ANALYZE_THEME.accent : ANALYZE_THEME.border,
            }}
          >
            <Edit2 className="w-4 h-4" />
            {bulkEditMode ? "Cancel Bulk" : "Bulk Edit"}
          </button>
        </div>

        {/* Categories Horizontal Scrollbar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 no-scrollbar -mx-1 px-1">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap shrink-0 border"
                style={{
                  background: isActive ? ANALYZE_THEME.accent : ANALYZE_THEME.surface,
                  color: isActive ? "white" : ANALYZE_THEME.inkMuted,
                  borderColor: isActive ? ANALYZE_THEME.accent : ANALYZE_THEME.border,
                }}
              >
                {cat === "all" ? "All Categories" : cat}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bulk Edit Drawer */}
      <AnimatePresence>
        {bulkEditMode && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div
              className="p-4 rounded-2xl border shadow-sm space-y-3"
              style={{ background: ANALYZE_THEME.accentSoft, borderColor: ANALYZE_THEME.accent }}
            >
              <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                <div className="flex-1">
                  <label className="block text-xs font-bold mb-1.5" style={{ color: ANALYZE_THEME.accentInk }}>
                    Set Price for {selectedCategory === "all" ? "All Items" : `"${selectedCategory}" Category`} (Rs.)
                  </label>
                  <input
                    type="number"
                    value={bulkPrice}
                    onChange={(e) => setBulkPrice(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleBulkUpdate()}
                    placeholder="e.g. 200"
                    className="w-full px-4 py-2.5 rounded-xl border text-base font-bold focus:outline-none focus:ring-2"
                    style={{
                      background: ANALYZE_THEME.surface,
                      borderColor: ANALYZE_THEME.accent,
                      color: ANALYZE_THEME.ink,
                    }}
                    autoFocus
                  />
                </div>
                <button
                  onClick={handleBulkUpdate}
                  disabled={!bulkPrice}
                  className="px-6 py-2.5 rounded-xl font-bold text-white text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
                  style={{ background: ANALYZE_THEME.accent }}
                >
                  <Save className="w-4 h-4" />
                  Apply Update
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State */}
      {filteredData.length === 0 && (
        <div
          className="text-center py-12 px-4 rounded-3xl border border-dashed"
          style={{ borderColor: ANALYZE_THEME.border, background: ANALYZE_THEME.surfaceRaised }}
        >
          <p className="text-base font-bold" style={{ color: ANALYZE_THEME.ink }}>
            No vegetables found
          </p>
          <p className="text-sm mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
            Try resetting your search query or selecting a different category.
          </p>
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
            }}
            className="mt-4 px-4 py-2 text-xs font-bold rounded-xl border"
            style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border, color: ANALYZE_THEME.ink }}
          >
            Clear Filters
          </button>
        </div>
      )}

      {/* Desktop Table */}
      {filteredData.length > 0 && (
        <div
          className="hidden md:block overflow-hidden rounded-3xl border shadow-sm"
          style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-xs uppercase tracking-wider" style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}>
                <th className="px-6 py-4 text-left font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>Commodity</th>
                <th className="px-6 py-4 text-right font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>Today (Rs.)</th>
                <th className="px-6 py-4 text-right font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>Yesterday</th>
                <th className="px-6 py-4 text-right font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>Last Week</th>
                <th className="px-6 py-4 text-right font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>24h Change</th>
                <th className="px-6 py-4 text-right font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y" style={{ borderColor: ANALYZE_THEME.border }}>
              {filteredData.map((veg) => {
                const change = ((veg.todayPrice - veg.yesterdayPrice) / veg.yesterdayPrice) * 100;
                const isUp = change >= 0;
                const isEditing = selectedVegetable === veg.id;

                return (
                  <tr key={veg.id} className="transition-colors hover:bg-gray-50/70 group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{veg.emoji}</span>
                        <div>
                          <div className="font-bold text-base" style={{ color: ANALYZE_THEME.ink }}>{veg.name}</div>
                          <div className="text-xs" style={{ color: ANALYZE_THEME.inkFaint }}>{veg.category}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {isEditing ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <input
                            type="number"
                            value={editingPrice}
                            onChange={(e) => setEditingPrice(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSavePrice();
                              if (e.key === "Escape") handleCancelEdit();
                            }}
                            className="w-28 px-3 py-1.5 rounded-lg border text-right font-bold focus:outline-none focus:ring-2"
                            style={{ borderColor: ANALYZE_THEME.accent, background: ANALYZE_THEME.surface, color: ANALYZE_THEME.ink }}
                            autoFocus
                          />
                          <button
                            onClick={handleSavePrice}
                            className="p-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700"
                            title="Confirm"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={handleCancelEdit}
                            className="p-1.5 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                            title="Cancel"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <span className="font-black text-base" style={{ color: ANALYZE_THEME.ink }}>
                          Rs. {veg.todayPrice.toLocaleString()}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium" style={{ color: ANALYZE_THEME.inkMuted }}>
                      Rs. {veg.yesterdayPrice}
                    </td>
                    <td className="px-6 py-4 text-right font-medium" style={{ color: ANALYZE_THEME.inkFaint }}>
                      Rs. {veg.lastWeekPrice}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={cn(
                        "inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full",
                        isUp ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-rose-50 text-rose-700 border border-rose-200"
                      )}>
                        {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                        {Math.abs(change).toFixed(1)}%
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!isEditing && (
                        <button
                          onClick={() => handleEdit(veg.id, veg.todayPrice)}
                          className="p-2 rounded-lg transition-all opacity-0 group-hover:opacity-100 hover:bg-gray-100 focus:opacity-100"
                          style={{ color: ANALYZE_THEME.inkMuted }}
                          title="Edit Price"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mobile Cards */}
      {filteredData.length > 0 && (
        <div className="md:hidden space-y-3">
          {filteredData.map((veg) => {
            const change = ((veg.todayPrice - veg.yesterdayPrice) / veg.yesterdayPrice) * 100;
            const isUp = change >= 0;
            const isEditing = selectedVegetable === veg.id;

            return (
              <div
                key={veg.id}
                className="p-4 rounded-2xl border shadow-sm transition-all"
                style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
              >
                <div className="flex items-center justify-between mb-3.5">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{veg.emoji}</span>
                    <div>
                      <div className="font-bold text-base leading-tight" style={{ color: ANALYZE_THEME.ink }}>
                        {veg.name}
                      </div>
                      <span className="text-[11px] font-medium" style={{ color: ANALYZE_THEME.inkFaint }}>
                        {veg.category}
                      </span>
                    </div>
                  </div>
                  <span className={cn(
                    "inline-flex items-center gap-1 font-bold text-xs px-2.5 py-1 rounded-full border",
                    isUp ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-rose-50 text-rose-700 border-rose-200"
                  )}>
                    {isUp ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                    {Math.abs(change).toFixed(1)}%
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <div className="text-center p-2.5 rounded-xl border" style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider mb-1" style={{ color: ANALYZE_THEME.inkFaint }}>
                      Today
                    </div>
                    {isEditing ? (
                      <input
                        type="number"
                        value={editingPrice}
                        onChange={(e) => setEditingPrice(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") handleSavePrice();
                          if (e.key === "Escape") handleCancelEdit();
                        }}
                        className="w-full px-1 py-0.5 rounded border text-center text-sm font-bold focus:outline-none"
                        style={{ borderColor: ANALYZE_THEME.accent, background: ANALYZE_THEME.surface, color: ANALYZE_THEME.ink }}
                        autoFocus
                      />
                    ) : (
                      <div className="font-black text-sm" style={{ color: ANALYZE_THEME.ink }}>
                        Rs.{veg.todayPrice}
                      </div>
                    )}
                  </div>

                  <div className="text-center p-2.5 rounded-xl" style={{ background: ANALYZE_THEME.surface }}>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider mb-1" style={{ color: ANALYZE_THEME.inkFaint }}>
                      Y-Day
                    </div>
                    <div className="font-bold text-sm" style={{ color: ANALYZE_THEME.inkMuted }}>
                      Rs.{veg.yesterdayPrice}
                    </div>
                  </div>

                  <div className="text-center p-2.5 rounded-xl" style={{ background: ANALYZE_THEME.surface }}>
                    <div className="text-[10px] font-extrabold uppercase tracking-wider mb-1" style={{ color: ANALYZE_THEME.inkFaint }}>
                      Last Wk
                    </div>
                    <div className="font-bold text-sm" style={{ color: ANALYZE_THEME.inkFaint }}>
                      Rs.{veg.lastWeekPrice}
                    </div>
                  </div>
                </div>

                {/* Edit Controls */}
                {isEditing ? (
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={handleSavePrice}
                      className="py-2 rounded-xl font-bold text-xs bg-emerald-600 text-white flex items-center justify-center gap-1"
                    >
                      <Check className="w-3.5 h-3.5" /> Save
                    </button>
                    <button
                      onClick={handleCancelEdit}
                      className="py-2 rounded-xl font-bold text-xs bg-gray-200 text-gray-700 flex items-center justify-center gap-1"
                    >
                      <X className="w-3.5 h-3.5" /> Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleEdit(veg.id, veg.todayPrice)}
                    className="w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-xs transition-colors border"
                    style={{
                      color: ANALYZE_THEME.accentInk,
                      background: ANALYZE_THEME.accentSoft,
                      borderColor: `${ANALYZE_THEME.accent}30`,
                    }}
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Price
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}