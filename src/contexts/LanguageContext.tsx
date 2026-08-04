"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

export type LanguageCode = "EN" | "SI" | "TA";

export interface Translations {
  [key: string]: {
    EN: string;
    SI: string;
    TA: string;
  };
}

// Core application dictionary for English, Sinhala, and Tamil
const DICTIONARY: Translations = {
  // Navigation & Branding
  brandName: { EN: "NAMIS", SI: "නැමිස්", TA: "நமிஸ்" },
  brandSubtitle: { EN: "National Market System", SI: "ජාතික වෙළඳපොළ පද්ධතිය", TA: "தேசிய சந்தை அமைப்பு" },
  navHome: { EN: "Home", SI: "මුල් පිටුව", TA: "முகப்பு" },
  navMarkets: { EN: "Markets", SI: "වෙළඳපොළවල්", TA: "சந்தைகள்" },
  navAnalytics: { EN: "Analytics", SI: "විශ්ලේෂණ", TA: "பகுப்பாய்வு" },
  navAbout: { EN: "About", SI: "අප ගැන", TA: "பற்றி" },
  navContact: { EN: "Contact", SI: "සම්බන්ධ වන්න", TA: "தொடர்பு கொள்ள" },
  
  // Search & Actions
  searchPlaceholder: { EN: "Search vegetables, markets, economic centers...", SI: "එළවළු, වෙළඳපොළවල්, ආර්ථික මධ්‍යස්ථාන සොයන්න...", TA: "காய்கறிகள், சந்தைகள், பொருளாதார மையங்களைத் தேடுங்கள்..." },
  loginBtn: { EN: "Log In", SI: "ඇතුළු වන්න", TA: "உள்நுழைக" },
  logoutBtn: { EN: "Log Out", SI: "නික්මෙන්න", TA: "வெளியேறு" },
  registerBtn: { EN: "Register", SI: "ලියාපදිංචි වන්න", TA: "பதிவு செய்க" },

  // Market & Commodities
  wholesalePrices: { EN: "Wholesale Market Prices", SI: "තොග වෙළඳපොළ මිල ගණන්", TA: "மொத்த விற்பனை சந்தை விலைகள்" },
  todayMarket: { EN: "Today's Market", SI: "අද වෙළඳපොළ", TA: "இன்றைய சந்தை" },
  economicCenter: { EN: "Economic Center", SI: "ආර්ථික මධ්‍යස්ථානය", TA: "பொருளாதார மையம்" },
  pricePerKg: { EN: "Rs. / kg", SI: "රු. / කි.ග්රෑ.", TA: "ரூ. / கிலா" },
  available: { EN: "Available", SI: "පවතී", TA: "கிடைக்கும்" },
  unavailable: { EN: "No Price Today", SI: "අද මිල නැත", TA: "இன்று விலை இல்லை" },
  
  // Floating Chat & Assistance
  aiAssistant: { EN: "Market Assistant", SI: "වෙළඳපොළ සහකාර", TA: "சந்தை உதவியாளர்" },
  askQuestion: { EN: "Ask a question...", SI: "ප්‍රශ්නයක් අසන්න...", TA: "கேள்வி கேட்கவும்..." },
  online: { EN: "Online", SI: "සක්‍රීයයි", TA: "ஆன்லைன்" },

  // General Status
  updatedToday: { EN: "Updated Today", SI: "අද යාවත්කාලීන කරන ලදී", TA: "இன்று புதுப்பிக்கப்பட்டது" },
  selectLanguage: { EN: "Select Language", SI: "භාෂාව තෝරන්න", TA: "மொழியைத் தேர்ந்தெடுக்கவும்" }
};

interface LanguageContextType {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>(() => {
    if (typeof window !== "undefined") {
      try {
        const savedLang = localStorage.getItem("namis_language") as LanguageCode;
        if (savedLang && (savedLang === "EN" || savedLang === "SI" || savedLang === "TA")) {
          return savedLang;
        }
      } catch (e) {
        console.warn("Could not load language setting:", e);
      }
    }
    return "EN";
  });

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("namis_language", lang);
    } catch (e) {
      console.warn("Could not save language setting:", e);
    }
  }, []);

  // Helper translation function
  const t = useCallback(
    (key: string): string => {
      if (DICTIONARY[key]) {
        return DICTIONARY[key][language] || DICTIONARY[key].EN;
      }
      return key;
    },
    [language]
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
