"use client";
/**
 * LanguageContext — site-wide multilingual support.
 *
 * Supports 10 Indian languages + English.
 * Uses Sarvam AI translation API (server-side proxy via /api/translate).
 * Falls back to English if translation fails.
 *
 * Usage:
 *   const { t, language, setLanguage } = useLanguage();
 *   <p>{t("welcome_message")}</p>
 */
import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react";

type LanguageCode = "en" | "hi" | "bn" | "ta" | "te" | "mr" | "gu" | "kn" | "ml" | "pa";

interface LanguageOption {
  code: LanguageCode;
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

/**
 * All translatable UI strings — keys are used with t().
 * If a key is missing from translations, the English fallback is used.
 */
const ENGLISH_STRINGS: Record<string, string> = {
  // Navigation
  nav_home: "Home",
  nav_features: "Features",
  nav_how_it_works: "How It Works",
  nav_about: "About",
  nav_courses: "Courses",
  nav_login: "Login",
  nav_signup: "Sign Up",
  nav_dashboard: "Dashboard",
  nav_logout: "Logout",

  // Landing page
  hero_badge: "Built for Bharat. Trusted by Skills.",
  hero_title_1: "Assess.",
  hero_title_2: "Recognize.",
  hero_title_3: "Advance.",
  hero_desc: "A unified AI-powered platform for skill assessment, competency mapping, and career growth for India's Official Statistical System.",
  hero_cta_1: "Get Assessed",
  hero_cta_2: "Explore Courses",
  hero_secure: "Secure",
  hero_transparent: "Transparent",
  hero_govt: "Government Aligned",

  // Stats
  stat_officials: "Officials Trained",
  stat_skills: "Skills Mapped",
  stat_domains: "Skill Domains",
  stat_institutions: "Partner Institutions",
  stat_trust: "Trust & Accuracy",

  // Features
  features_title: "For Every Learner, A Path Forward",
  features_desc: "Whether you're a field officer or a senior administrator, SkillUp helps you discover, assess, and grow.",
  feature_1_title: "AI Skill Gap Analysis",
  feature_1_desc: "Personalized competency mapping across 4 domains using adaptive assessments and Bloom's taxonomy.",
  feature_2_title: "iGOT Karmayogi Integration",
  feature_2_desc: "Direct access to government training courses with real-time progress tracking and recommendations.",
  feature_3_title: "Adaptive Assessments",
  feature_3_desc: "AI-generated MCQs that adjust difficulty based on your performance using IRT calibration.",
  feature_4_title: "Career Growth Tracking",
  feature_4_desc: "Competency radar charts, skill heatmaps, and progress visualization for career planning.",
  feature_5_title: "Verified Certificates",
  feature_5_desc: "Digital certificates with verification codes for completed courses and passed assessments.",
  feature_6_title: "Smart Recommendations",
  feature_6_desc: "Hybrid recommender combining content-based, collaborative, and rule-based signals.",

  // How it works
  how_title: "How It Works",
  how_step1_title: "Create Profile",
  how_step1_desc: "Register and complete your professional profile with designation, department, and qualifications.",
  how_step2_title: "Take Assessment",
  how_step2_desc: "AI generates adaptive questions tagged with Bloom's taxonomy across 4 competency domains.",
  how_step3_title: "Get Recommendations",
  how_step3_desc: "Personalized course recommendations based on your skill gaps, role, and department needs.",
  how_step4_title: "Learn & Certify",
  how_step4_desc: "Complete courses on iGOT Karmayogi, pass assessments, and earn verified certificates.",

  // CTA
  cta_title: "Ready to Advance Your Career?",
  cta_desc: "Join thousands of government officials who are building their skills with AI-powered assessments and personalized learning paths.",
  cta_btn1: "Get Started",
  cta_btn2: "Sign In",

  // Partners
  partners_label: "Aligned with National Initiatives",

  // Footer
  footer_desc: "AI-powered Skill Intelligence & Learning Platform for India's Official Statistical System.",
  footer_links: "Quick Links",
  footer_account: "Account",
  footer_compliance: "Compliance",
  footer_policy: "Privacy Policy",
  footer_terms: "Terms of Use",
  footer_accessibility: "Accessibility",
  footer_gigw: "GIGW 3.0 Aligned",
  footer_copyright: "All rights reserved. A MoSPI Initiative.",
  footer_tagline: "Government Aligned. People Focused.",

  // Dashboard
  dash_welcome: "Welcome",
  dash_xp: "XP",
  dash_streak: "Streak",
  dash_badges: "Badges",
  dash_courses: "Courses",
  dash_certificates: "Certificates",
  dash_competency_radar: "Competency Radar",
  dash_overall: "Overall",
  dash_earned_badges: "Earned Badges",
  dash_quick_actions: "Quick Actions",
  dash_take_assessment: "Take Assessment",
  dash_browse_courses: "Browse Courses",
  dash_skill_heatmap: "Skill Heatmap",
  dash_competencies: "Competencies",
  dash_recommended: "Recommended for You",
  dash_igot_courses: "iGOT Karmayogi Courses",
  dash_view_all: "View All",
  dash_no_courses: "No courses available.",
  dash_days_row: "days in a row",
  dash_of: "of",

  // Learn
  learn_title: "Learn Hub",
  learn_desc: "Explore courses from iGOT Karmayogi to build your competencies",
  learn_search: "Search courses...",
  learn_loading: "Fetching courses from iGOT Karmayogi...",
  learn_found: "courses found",
  learn_no_courses: "No courses found",
  learn_view: "View",

  // Courses
  courses_title: "Course Catalogue",
  courses_desc: "Browse courses from iGOT Karmayogi and SkillUp internal library",
  courses_all: "All Courses",
  courses_igot: "iGOT Karmayogi",
  courses_internal: "SkillUp Internal",
  courses_view_details: "View Details",

  // Assessment
  assessment_title: "Competency Assessment",
  assessment_start: "Start Assessment",
  assessment_next: "Next Question",
  assessment_submit: "Submit Assessment",
  assessment_score: "Your Score",
  assessment_passed: "Passed",
  assessment_failed: "Failed",

  // Auth
  login_title: "Sign In",
  login_email: "Email Address",
  login_password: "Password",
  login_btn: "Sign In",
  login_forgot: "Forgot Password?",
  login_no_account: "Don't have an account?",
  login_signup_link: "Sign Up",
  login_or: "or",
  login_google: "Continue with Google",
  login_sso: "Government SSO",

  register_title: "Create Account",
  register_name: "Full Name",
  register_email: "Email Address",
  register_password: "Password",
  register_confirm: "Confirm Password",
  register_btn: "Create Account",
  register_has_account: "Already have an account?",
  register_login_link: "Sign In",

  // Profile setup
  setup_title: "Complete Your Profile",
  setup_step: "Step",
  setup_of: "of",
  setup_next: "Next",
  setup_back: "Back",
  setup_save: "Save & Continue",
  setup_finish: "Complete Setup",

  // Admin
  admin_title: "Admin Dashboard",
  admin_users: "User Management",
  admin_system: "System Settings",
  admin_analytics: "Analytics",

  // Common
  common_loading: "Loading...",
  common_error: "Something went wrong",
  common_retry: "Retry",
  common_save: "Save",
  common_cancel: "Cancel",
  common_delete: "Delete",
  common_edit: "Edit",
  common_search: "Search",
  common_filter: "Filter",
  common_back: "Back",
  common_more: "More",
  common_less: "Less",
};

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
  const [translationCache, setTranslationCache] = useState<Record<string, string>>({});

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

  /**
   * Translate a UI string key.
   * If language is English, returns the string directly.
   * If a cached translation exists, returns it.
   * Otherwise triggers an async translation and returns English for now.
   */
  const t = useCallback(
    (key: string): string => {
      if (language === "en") {
        return ENGLISH_STRINGS[key] || key;
      }
      const cacheKey = `${language}:${key}`;
      if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
      }
      return ENGLISH_STRINGS[key] || key;
    },
    [language, translationCache]
  );

  /**
   * Translate arbitrary text using the backend proxy to Sarvam AI.
   * Used for translating dynamic content (course descriptions, chatbot, etc.)
   */
  const translateText = useCallback(
    async (text: string, targetLang: LanguageCode): Promise<string> => {
      if (targetLang === "en" || !text) return text;

      const cacheKey = `text:${targetLang}:${text.substring(0, 100)}`;
      if (translationCache[cacheKey]) {
        return translationCache[cacheKey];
      }

      try {
        const resp = await fetch("/api/translate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text, targetLang }),
        });
        if (!resp.ok) throw new Error("Translation failed");
        const data = await resp.json();
        const translated = data.translated || text;
        setTranslationCache((prev) => ({ ...prev, [cacheKey]: translated }));
        return translated;
      } catch {
        return text; // fallback to original
      }
    },
    [translationCache]
  );

  // Batch-translate all UI strings when language changes (except English)
  useEffect(() => {
    if (language === "en") return;

    const translateAll = async () => {
      const keys = Object.keys(ENGLISH_STRINGS);
      // Translate in batches of 10 to avoid rate limits
      for (let i = 0; i < keys.length; i += 10) {
        const batch = keys.slice(i, i + 10);
        const texts = batch.map((k) => ENGLISH_STRINGS[k]);
        try {
          const resp = await fetch("/api/translate", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ texts, targetLang: language }),
          });
          if (resp.ok) {
            const data = await resp.json();
            if (data.translations && Array.isArray(data.translations)) {
              setTranslationCache((prev) => {
                const next = { ...prev };
                batch.forEach((k, idx) => {
                  next[`${language}:${k}`] = data.translations[idx] || ENGLISH_STRINGS[k];
                });
                return next;
              });
            }
          }
        } catch {
          // continue with next batch
        }
      }
    };

    translateAll();
  }, [language]);

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
