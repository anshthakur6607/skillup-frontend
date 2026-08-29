"use client";
/**
 * LanguageContext — site-wide multilingual support.
 *
 * Uses local translation dictionary for instant switching.
 * No API calls needed — translations load immediately.
 * Currently supports English + Hindi. Other languages show English fallback.
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";
import { type LanguageCode, getTranslation, ALL_TRANSLATIONS } from "@/lib/translations";

type LanguageCode2 = LanguageCode;

interface LanguageOption {
  code: LanguageCode2;
  label: string;
  nativeLabel: string;
}

export const LANGUAGES: LanguageOption[] = [
  { code: "en", label: "English", nativeLabel: "English" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी" },
  { code: "bn", label: "Bengali", nativeLabel: "বাংলা" },
  { code: "ta", label: "Tamil", nativeLabel: "தமிழ்" },
  { code: "te", label: "Telugu", nativeLabel: "తెలుగు" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी" },
  { code: "gu", label: "Gujarati", nativeLabel: "ગુજરાતી" },
  { code: "kn", label: "Kannada", nativeLabel: "ಕನ್ನಡ" },
  { code: "ml", label: "Malayalam", nativeLabel: "മലയാളം" },
  { code: "pa", label: "Punjabi", nativeLabel: "ਪੰਜਾਬੀ" },
];


interface LanguageContextValue {
  language: LanguageCode;
  setLanguage: (lang: LanguageCode) => void;
  t: (key: string) => string;
  translateText: (text: string, targetLang: LanguageCode) => Promise<string>;
  languages: LanguageOption[];
}

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<LanguageCode>("en");

  // Load saved language preference
  useEffect(() => {
    try {
      const saved = localStorage.getItem("skillup_language") as LanguageCode;
      if (saved && LANGUAGES.some((l) => l.code === saved)) {
        setLanguageState(saved);
      }
    } catch {
      // SSR or storage unavailable
    }
  }, []);

  const setLanguage = useCallback((lang: LanguageCode) => {
    setLanguageState(lang);
    try {
      localStorage.setItem("skillup_language", lang);
    } catch {
      // silent
    }
  }, []);

  // Instant translation from local dictionary — no API calls
  const t = useCallback(
    (key: string): string => {
      return getTranslation(key, language);
    },
    [language]
  );

  // Translate arbitrary text via backend API (for dynamic content)
  const translateText = useCallback(
    async (text: string, targetLang: LanguageCode): Promise<string> => {
      if (targetLang === "en" || !text) return text;
      try {
        const resp = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, targetLang }),
        });
        if (!resp.ok) throw new Error("Translation failed");
        const data = await resp.json();
        return data.translated || text;
      } catch {
        return text;
      }
    },
    []
  );

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, translateText, languages: LANGUAGES }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
}
