import React, { useState, useEffect } from "react";
import { createClient } from "@/utils/supabase/client";
import { motion, AnimatePresence } from "framer-motion";
import {
  DollarSign,
  Cloud,
  Fuel,
  ChevronRight,
  ChevronLeft,
  Save,
  X,
  TrendingUp,
  Thermometer,
  CloudRain,
  Droplets,
} from "lucide-react";
import { ANALYZE_THEME } from "@/lib/chartTheme";

// Fallback helper if clsx/tailwind-merge isn't imported
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

type MarketType = string;
type DataType = "prices" | "weather" | "fuel";

interface QuickAddEntry {
  id: string;
  itemId: string;
  value: number;
  date: string;
  market: MarketType;
  dataType: DataType;
}

interface QuickAddManagementProps {
  market: MarketType | null;
  isSuperAdmin: boolean;
  onSave: (entries: QuickAddEntry[]) => void;
  saveStatus: "idle" | "saving" | "saved";
  onClose: () => void;
}

// Data definitions by category
const PRICING_ITEMS = [
  { id: "carrots", name: "Carrots", nameSi: "කැරට්", emoji: "🥕", unit: "kg", minPrice: 250, maxPrice: 300 },
  { id: "tomatoes", name: "Tomatoes", nameSi: "තක්කාලි", emoji: "🍅", unit: "kg", minPrice: 300, maxPrice: 400 },
  { id: "potatoes", name: "Potatoes", nameSi: "අල", emoji: "🥔", unit: "kg", minPrice: 180, maxPrice: 250 },
  { id: "onions", name: "Onions", nameSi: "ලූණු", emoji: "🧅", unit: "kg", minPrice: 280, maxPrice: 350 },
  { id: "cabbage", name: "Cabbage", nameSi: "ගෝවා", emoji: "🥬", unit: "kg", minPrice: 150, maxPrice: 200 },
  { id: "beans", name: "Beans", nameSi: "බෝංචි", emoji: "🫘", unit: "kg", minPrice: 200, maxPrice: 250 },
  { id: "leeks", name: "Leeks", nameSi: "ලීක්ස්", emoji: "🧄", unit: "kg", minPrice: 320, maxPrice: 400 },
];

const WEATHER_ITEMS = [
  { id: "rainfall", name: "Rainfall", nameSi: "වර්ෂාපතනය", emoji: "🌧️", unit: "mm", icon: CloudRain },
  { id: "temperature", name: "Avg Temperature", nameSi: "උෂ්ණත්වය", emoji: "🌡️", unit: "°C", icon: Thermometer },
  { id: "humidity", name: "Humidity", nameSi: "ආර්ද්‍රතාවය", emoji: "💧", unit: "%", icon: Droplets },
];

const FUEL_ITEMS = [
  { id: "petrol_92", name: "Petrol 92", nameSi: "පෙට්රල් 92", emoji: "⛽", unit: "Liter", minPrice: 340, maxPrice: 370 },
  { id: "petrol_95", name: "Petrol 95", nameSi: "පෙට්රල් 95", emoji: "⛽", unit: "Liter", minPrice: 420, maxPrice: 460 },
  { id: "auto_diesel", name: "Auto Diesel", nameSi: "ලංකා ඩීසල්", emoji: "🚛", unit: "Liter", minPrice: 320, maxPrice: 350 },
  { id: "super_diesel", name: "Super Diesel", nameSi: "සුපර් ඩීසල්", emoji: "🚛", unit: "Liter", minPrice: 380, maxPrice: 420 },
];

export function QuickAddManagement({
  market,
  isSuperAdmin,
  onSave,
  saveStatus,
  onClose,
}: QuickAddManagementProps) {
  const [step, setStep] = useState<"setup" | "entry" | "done">("setup");
  const [dataType, setDataType] = useState<DataType>("prices");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [selectedMarket, setSelectedMarket] = useState<MarketType>(market || "dambulla");
  const [dbMarkets, setDbMarkets] = useState<any[]>([]);

  // Fetch active markets from database
  useEffect(() => {
    const fetchMarkets = async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.from("markets").select("*");
        if (data) setDbMarkets(data);
      } catch (err) {
        console.error("Failed to fetch markets in QuickAddManagement:", err);
      }
    };
    fetchMarkets();
  }, []);

  // Sync prop changes to selectedMarket
  useEffect(() => {
    if (market) {
      setSelectedMarket(market);
    }
  }, [market]);
  const [itemIndex, setItemIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [sessionEntries, setSessionEntries] = useState<QuickAddEntry[]>([]);

  // Pick target items based on chosen dataType
  const currentDataset =
    dataType === "prices"
      ? PRICING_ITEMS
      : dataType === "weather"
      ? WEATHER_ITEMS
      : FUEL_ITEMS;

  const currentItem = currentDataset[itemIndex];
  const progress =
    currentDataset.length > 0
      ? ((itemIndex + (step === "done" ? 1 : 0)) / currentDataset.length) * 100
      : 0;

  // Load existing input when moving between steps
  const loadExistingValue = (idx: number) => {
    const targetItem = currentDataset[idx];
    const existing = sessionEntries.find((e) => e.itemId === targetItem.id);
    setInputValue(existing ? existing.value.toString() : "");
  };

  const saveCurrentAndNext = () => {
    const val = parseFloat(inputValue);
    if (isNaN(val) || val < 0) return;

    const entry: QuickAddEntry = {
      id: `${currentItem.id}-${Date.now()}`,
      itemId: currentItem.id,
      value: val,
      date,
      market: selectedMarket,
      dataType,
    };

    setSessionEntries((prev) => {
      const filtered = prev.filter((e) => e.itemId !== currentItem.id);
      return [...filtered, entry];
    });

    if (itemIndex < currentDataset.length - 1) {
      const nextIdx = itemIndex + 1;
      setItemIndex(nextIdx);
      loadExistingValue(nextIdx);
    } else {
      setStep("done");
    }
  };

  const skipCurrent = () => {
    if (itemIndex < currentDataset.length - 1) {
      const nextIdx = itemIndex + 1;
      setItemIndex(nextIdx);
      loadExistingValue(nextIdx);
    } else {
      setStep("done");
    }
  };

  const goBack = () => {
    if (itemIndex > 0) {
      const prevIdx = itemIndex - 1;
      setItemIndex(prevIdx);
      loadExistingValue(prevIdx);
    } else {
      setStep("setup");
    }
  };

  const reset = () => {
    setStep("setup");
    setItemIndex(0);
    setInputValue("");
    setSessionEntries([]);
    setSelectedMarket(market || "dambulla");
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleFinish = () => {
    onSave(sessionEntries);
    handleClose();
  };

  // STEP 1: SETUP
  if (step === "setup") {
    return (
      <div className="space-y-6">
        <div className="text-center md:text-left">
          <h2 className="text-2xl font-bold tracking-tight" style={{ color: ANALYZE_THEME.ink }}>
            Quick Add Data
          </h2>
          <p style={{ color: ANALYZE_THEME.inkMuted }}>
            Rapidly enter data for{" "}
            {isSuperAdmin
              ? selectedMarket === "dambulla"
                ? "Dambulla"
                : "Kappetipola"
              : market === "dambulla"
              ? "Dambulla"
              : "Kappetipola"}
          </p>
        </div>

        <div
          className="p-6 sm:p-8 rounded-3xl border shadow-xl"
          style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
        >
          {/* Data Type Selection */}
          <div className="mb-8">
            <label className="block text-sm font-bold mb-3" style={{ color: ANALYZE_THEME.ink }}>
              Data Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {[
                { id: "prices" as const, label: "Prices", icon: DollarSign, desc: "Daily vegetable prices" },
                { id: "weather" as const, label: "Weather", icon: Cloud, desc: "Rainfall & temperature" },
                { id: "fuel" as const, label: "Fuel", icon: Fuel, desc: "Fuel prices" },
              ].map((type) => {
                const Icon = type.icon;
                const isActive = dataType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setDataType(type.id)}
                    className="p-4 rounded-2xl border-2 text-left transition-all relative overflow-hidden group"
                    style={{
                      borderColor: isActive ? ANALYZE_THEME.accent : ANALYZE_THEME.border,
                      background: isActive ? ANALYZE_THEME.accentSoft : ANALYZE_THEME.surface,
                    }}
                  >
                    <Icon
                      className="w-6 h-6 mb-3 transition-colors"
                      style={{ color: isActive ? ANALYZE_THEME.accent : ANALYZE_THEME.inkFaint }}
                    />
                    <div
                      className="font-bold mb-1"
                      style={{ color: isActive ? ANALYZE_THEME.accentInk : ANALYZE_THEME.ink }}
                    >
                      {type.label}
                    </div>
                    <div className="text-xs font-semibold" style={{ color: ANALYZE_THEME.inkMuted }}>
                      {type.desc}
                    </div>
                    {isActive && (
                      <div className="absolute top-3 right-3">
                        <div
                          className="w-2 h-2 rounded-full"
                          style={{ background: ANALYZE_THEME.accent }}
                        />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Market Selection for Super Admin */}
          {isSuperAdmin && (
            <div className="mb-8">
              <label className="block text-sm font-bold mb-3" style={{ color: ANALYZE_THEME.ink }}>
                Select Market
              </label>
              <div className="grid grid-cols-2 gap-3">
                {dbMarkets.map((m) => (
                  <button
                    key={m.id}
                    onClick={() => setSelectedMarket(m.id)}
                    className="p-4 rounded-2xl border-2 text-center transition-all"
                    style={{
                      borderColor: selectedMarket === m.id ? ANALYZE_THEME.accent : ANALYZE_THEME.border,
                      background: selectedMarket === m.id ? ANALYZE_THEME.accentSoft : ANALYZE_THEME.surface,
                    }}
                  >
                    <span className="text-2xl block mb-2">{m.emoji || "🏛️"}</span>
                    <span
                      className="font-bold text-sm"
                      style={{
                        color: selectedMarket === m.id ? ANALYZE_THEME.accentInk : ANALYZE_THEME.ink,
                      }}
                    >
                      {m.name.split(" ")[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Picker */}
          <div className="mb-8">
            <label className="block text-sm font-bold mb-3" style={{ color: ANALYZE_THEME.ink }}>
              Date
            </label>
            <input
              type="date"
              value={date}
              max={new Date().toISOString().split("T")[0]}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border font-medium focus:outline-none focus:ring-2 focus:ring-[#0f766e]/20"
              style={{
                background: ANALYZE_THEME.surface,
                borderColor: ANALYZE_THEME.border,
                color: ANALYZE_THEME.ink,
              }}
            />
          </div>

          <button
            onClick={() => {
              setItemIndex(0);
              loadExistingValue(0);
              setStep("entry");
            }}
            className="w-full py-4 rounded-2xl font-bold text-white active:scale-[0.98] transition-all flex items-center justify-center gap-2 shadow-lg mb-3"
            style={{ background: ANALYZE_THEME.accent }}
          >
            Start Quick Add
            <ChevronRight className="w-5 h-5" />
          </button>

          <button
            onClick={handleClose}
            className="w-full py-3 rounded-2xl font-bold transition-all"
            style={{ background: ANALYZE_THEME.surface, color: ANALYZE_THEME.inkMuted }}
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  // STEP 3: DONE SUMMARY
  if (step === "done") {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto"
      >
        <div
          className="p-8 rounded-3xl border shadow-xl text-center relative overflow-hidden"
          style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
        >
          <div
            className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-40 pointer-events-none"
            style={{
              background: `linear-gradient(to bottom, ${ANALYZE_THEME.accentSoft} 0%, transparent 100%)`,
            }}
          />

          <div
            className="mb-6 inline-flex h-20 w-20 items-center justify-center rounded-full relative z-10 shadow-inner"
            style={{ background: ANALYZE_THEME.accentSoft, color: ANALYZE_THEME.accent }}
          >
            <Save className="h-10 w-10" />
          </div>

          <h2 className="text-3xl font-bold mb-2 tracking-tight" style={{ color: ANALYZE_THEME.ink }}>
            All done!
          </h2>
          <p className="mb-8 font-medium" style={{ color: ANALYZE_THEME.inkMuted }}>
            Recorded {sessionEntries.length} entries for{" "}
            {selectedMarket === "dambulla" ? "Dambulla" : "Kappetipola"} on{" "}
            <span className="font-bold" style={{ color: ANALYZE_THEME.ink }}>
              {new Date(date).toLocaleDateString("en-LK", {
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </span>
          </p>

          {sessionEntries.length > 0 && (
            <div
              className="mb-8 text-left rounded-2xl p-4 border"
              style={{ background: ANALYZE_THEME.surface, borderColor: ANALYZE_THEME.border }}
            >
              <div
                className="text-xs font-bold mb-3 uppercase tracking-wider px-2"
                style={{ color: ANALYZE_THEME.inkMuted }}
              >
                Saved Entries ({dataType})
              </div>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                {sessionEntries.map((e) => {
                  const item = currentDataset.find((v) => v.id === e.itemId);
                  return (
                    <div
                      key={e.id}
                      className="flex items-center justify-between p-3 rounded-xl border shadow-sm"
                      style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
                    >
                      <span className="font-bold flex items-center gap-2" style={{ color: ANALYZE_THEME.ink }}>
                        <span className="text-lg">{item?.emoji}</span> {item?.name}
                      </span>
                      <span className="font-black" style={{ color: ANALYZE_THEME.accent }}>
                        {dataType === "prices" || dataType === "fuel" ? `Rs. ${e.value}` : `${e.value} ${item?.unit}`}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={reset}
              className="flex-1 py-3.5 rounded-xl font-bold transition-all"
              style={{ background: ANALYZE_THEME.surface, color: ANALYZE_THEME.inkMuted }}
            >
              Add More
            </button>
            <button
              onClick={handleFinish}
              disabled={saveStatus === "saving"}
              className="flex-1 py-3.5 rounded-xl font-bold text-white transition-all shadow-md disabled:opacity-50"
              style={{ background: ANALYZE_THEME.accent }}
            >
              {saveStatus === "saving" ? "Saving..." : "Finish Session"}
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  // STEP 2: ENTRY LOOP
  return (
    <div className="space-y-6">
      {/* Progress Header */}
      <div>
        <div className="mb-3 flex items-center justify-between text-sm">
          <span className="font-bold" style={{ color: ANALYZE_THEME.inkMuted }}>
            {selectedMarket === "dambulla" ? "Dambulla" : "Kappetipola"} •{" "}
            <span className="capitalize">{dataType}</span>
          </span>
          <span
            className="font-bold px-3 py-1 rounded-full text-xs"
            style={{ background: ANALYZE_THEME.accentSoft, color: ANALYZE_THEME.accentInk }}
          >
            {itemIndex + 1} / {currentDataset.length}
          </span>
        </div>
        <div className="h-2 overflow-hidden rounded-full" style={{ background: ANALYZE_THEME.surface }}>
          <motion.div
            className="h-full rounded-full"
            style={{ background: ANALYZE_THEME.accent }}
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        </div>
      </div>

      {/* Item Chips */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
        {currentDataset.map((v, i) => {
          const isPast = i < itemIndex;
          const isCurrent = i === itemIndex;
          return (
            <button
              key={v.id}
              onClick={() => {
                setItemIndex(i);
                loadExistingValue(i);
              }}
              className="flex shrink-0 items-center gap-1.5 rounded-full px-4 py-2 text-sm font-bold transition-all snap-start border-2"
              style={{
                borderColor: isCurrent
                  ? ANALYZE_THEME.accent
                  : isPast
                  ? ANALYZE_THEME.accentSoft
                  : ANALYZE_THEME.border,
                background: isCurrent
                  ? ANALYZE_THEME.accent
                  : isPast
                  ? ANALYZE_THEME.accentSoft
                  : ANALYZE_THEME.surface,
                color: isCurrent ? "white" : isPast ? ANALYZE_THEME.accentInk : ANALYZE_THEME.inkMuted,
              }}
            >
              <span>{v.emoji}</span>
              <span>{v.name}</span>
            </button>
          );
        })}
      </div>

      {/* Active Item Entry Card */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentItem.id}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden rounded-3xl border shadow-xl"
          style={{ background: ANALYZE_THEME.surfaceRaised, borderColor: ANALYZE_THEME.border }}
        >
          <div
            className="px-6 py-10 text-center border-b"
            style={{
              background: `linear-gradient(to bottom, ${ANALYZE_THEME.surface} 0%, ${ANALYZE_THEME.surfaceRaised} 100%)`,
              borderColor: ANALYZE_THEME.border,
            }}
          >
            <span className="text-7xl drop-shadow-sm inline-block transform hover:scale-110 transition-transform cursor-default">
              {currentItem.emoji}
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight" style={{ color: ANALYZE_THEME.ink }}>
              {currentItem.name}
            </h2>
            <p className="text-sm font-bold mt-1" style={{ color: ANALYZE_THEME.inkMuted }}>
              {currentItem.nameSi}
            </p>

            {"minPrice" in currentItem && "maxPrice" in currentItem && (
              <div
                className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border shadow-sm text-xs font-bold"
                style={{
                  background: ANALYZE_THEME.surface,
                  borderColor: ANALYZE_THEME.border,
                  color: ANALYZE_THEME.inkMuted,
                }}
              >
                <TrendingUp className="w-3.5 h-3.5" style={{ color: ANALYZE_THEME.accent }} />
                Typical: Rs. {currentItem.minPrice} - {currentItem.maxPrice}
              </div>
            )}
          </div>

          <div className="px-6 py-8 sm:px-8">
            <label className="mb-3 block text-sm font-bold" style={{ color: ANALYZE_THEME.ink }}>
              {dataType === "prices" || dataType === "fuel"
                ? `Price per ${currentItem.unit} (Rs.)`
                : `${currentItem.name} (${currentItem.unit})`}
            </label>
            <div className="relative">
              {(dataType === "prices" || dataType === "fuel") && (
                <span
                  className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-bold"
                  style={{ color: ANALYZE_THEME.inkFaint }}
                >
                  Rs.
                </span>
              )}
              <input
                type="number"
                inputMode="decimal"
                min="0"
                step="any"
                autoFocus
                placeholder="0"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && inputValue && saveCurrentAndNext()}
                className={cn(
                  "w-full rounded-2xl border-2 py-5 pr-6 text-4xl font-black focus:outline-none focus:ring-4 focus:ring-[#0f766e]/10 transition-all placeholder:text-[#a89886]",
                  dataType === "prices" || dataType === "fuel" ? "pl-16" : "pl-6"
                )}
                style={{
                  background: ANALYZE_THEME.surface,
                  borderColor: ANALYZE_THEME.border,
                  color: ANALYZE_THEME.ink,
                }}
              />
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Action Bar */}
      <div className="flex gap-3">
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-4 py-4 rounded-2xl font-bold transition-all border"
          style={{
            background: ANALYZE_THEME.surface,
            borderColor: ANALYZE_THEME.border,
            color: ANALYZE_THEME.inkMuted,
          }}
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="hidden sm:inline">Back</span>
        </button>
        <button
          onClick={handleClose}
          className="flex items-center gap-2 px-4 py-4 rounded-2xl font-bold transition-all border"
          style={{
            background: ANALYZE_THEME.surface,
            borderColor: ANALYZE_THEME.border,
            color: ANALYZE_THEME.inkMuted,
          }}
        >
          <X className="w-5 h-5" />
          <span className="hidden sm:inline">Close</span>
        </button>
        <button
          onClick={skipCurrent}
          className="flex items-center gap-2 px-6 py-4 rounded-2xl font-bold transition-all border"
          style={{
            background: ANALYZE_THEME.surface,
            borderColor: ANALYZE_THEME.border,
            color: ANALYZE_THEME.inkMuted,
          }}
        >
          Skip
        </button>
        <button
          className="flex-1 py-4 rounded-2xl font-bold text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:active:scale-100 shadow-lg"
          disabled={!inputValue || parseFloat(inputValue) < 0}
          onClick={saveCurrentAndNext}
          style={{ background: ANALYZE_THEME.accent }}
        >
          {itemIndex < currentDataset.length - 1 ? (
            <>
              Save & Next
              <ChevronRight className="w-5 h-5" />
            </>
          ) : (
            <>
              Save & Finish
              <Save className="w-5 h-5" />
            </>
          )}
        </button>
      </div>

      {/* Up Next Preview */}
      {itemIndex < currentDataset.length - 1 && (
        <p className="text-center text-sm font-medium" style={{ color: ANALYZE_THEME.inkFaint }}>
          Up next:{" "}
          <span style={{ color: ANALYZE_THEME.inkMuted }}>
            {currentDataset[itemIndex + 1].emoji} {currentDataset[itemIndex + 1].name}
          </span>
        </p>
      )}
    </div>
  );
}