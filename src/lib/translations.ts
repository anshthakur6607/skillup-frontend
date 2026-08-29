/**
 * Local translations — instant language switching without API calls.
 * Contains English + Hindi translations for all UI strings.
 * Used by LanguageContext for the t() function.
 *
 * To add a new language: add a new key to TranslationDict type,
 * add the translations object, and add it to ALL_TRANSLATIONS.
 */

export type LanguageCode = "en" | "hi" | "bn" | "ta" | "te" | "mr" | "gu" | "kn" | "ml" | "pa";

type TranslationDict = Record<string, string>;

const EN: TranslationDict = {
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

  // Landing
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
  dash_ongoing: "Ongoing Courses",
  dash_trending: "Trending Courses",
  dash_trending_cert: "Trending Certifications",
  dash_suggested: "Suggested for You",
  dash_view_all: "View All",
  dash_no_courses: "No courses available.",
  dash_days_row: "days in a row",
  dash_of: "of",

  // Tooltips
  tip_xp: "Experience Points earned from completing courses, passing assessments, and daily logins",
  tip_streak: "Consecutive days of learning activity. Maintain your streak to earn bonus XP!",
  tip_badges: "Achievement badges earned. Complete milestones to unlock more!",
  tip_courses: "Total courses enrolled. Start learning to grow this number!",
  tip_certificates: "Verified certificates earned after completing courses and passing assessments",

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

  // AI Chat
  ai_chat_title: "AI Assistant",
  ai_chat_placeholder: "Ask about this course...",
  ai_voice_title: "AI Voice Chat",
  ai_voice_start: "Start Voice Chat",
  ai_voice_stop: "Stop Voice Chat",
  ai_voiceListening: "Listening...",
  ai_voiceThinking: "Thinking...",
};

const HI: TranslationDict = {
  // Navigation
  nav_home: "होम",
  nav_features: "विशेषताएं",
  nav_how_it_works: "यह कैसे काम करता है",
  nav_about: "हमारे बारे में",
  nav_courses: "पाठ्यक्रम",
  nav_login: "लॉगिन",
  nav_signup: "साइन अप",
  nav_dashboard: "डैशबोर्ड",
  nav_logout: "लॉगआउट",

  // Landing
  hero_badge: "भारत के लिए बना। कौशल से विश्वसनीय।",
  hero_title_1: "मूल्यांकन।",
  hero_title_2: "मान्यता।",
  hero_title_3: "आगे बढ़ें।",
  hero_desc: "भारत के आधिकारिक सांख्यिकी प्रणाली के लिए कौशल मूल्यांकन, दक्षता मानचित्रण और करियर विकास के लिए एक एकीकृत AI-संचालित मंच।",
  hero_cta_1: "मूल्यांकन कराएं",
  hero_cta_2: "पाठ्यक्रम देखें",
  hero_secure: "सुरक्षित",
  hero_transparent: "पारदर्शी",
  hero_govt: "सरकार संरेखित",

  // Stats
  stat_officials: "प्रशिक्षित अधिकारी",
  stat_skills: "कौशल मैप किए गए",
  stat_domains: "कौशल क्षेत्र",
  stat_institutions: "साझेदार संस्थान",
  stat_trust: "विश्वास और सटीकता",

  // Features
  features_title: "हर शिक्षार्थी के लिए, आगे बढ़ने का रास्ता",
  features_desc: "चाहे आप फील्ड अधिकारी हों या वरिष्ठ प्रशासक, SkillUp आपकी खोज, मूल्यांकन और विकास में मदद करता है।",
  feature_1_title: "AI कौशल अंतर विश्लेषण",
  feature_1_desc: "अनुकूली मूल्यांकन और Bloom's taxonomy का उपयोग करके 4 क्षेत्रों में व्यक्तिगत दक्षता मानचित्रण।",
  feature_2_title: "iGOT कर्मयोगी एकीकरण",
  feature_2_desc: "वास्तविक समय प्रगति ट्रैकिंग और सिफारिशों के साथ सरकारी प्रशिक्षण पाठ्यक्रमों तक सीधी पहुंच।",
  feature_3_title: "अनुकूली मूल्यांकन",
  feature_3_desc: "AI-जनित MCQ जो IRT कैलिब्रेशन का उपयोग करके आपके प्रदर्शन के आधार पर कठिनाई समायोजित करते हैं।",
  feature_4_title: "करियर विकास ट्रैकिंग",
  feature_4_desc: "करियर योजना के लिए दक्षता रडार चार्ट, कौशल हीटमैप और प्रगति दृश्य।",
  feature_5_title: "सत्यापित प्रमाणपत्र",
  feature_5_desc: "पूर्ण पाठ्यक्रमों और उत्तीर्ण मूल्यांकन के लिए सत्यापन कोड वाले डिजिटल प्रमाणपत्र।",
  feature_6_title: "स्मार्ट सिफारिशें",
  feature_6_desc: "सामग्री-आधारित, सहयोगी और नियम-आधारित संकेतों को जोड़ने वाला हाइब्रिड रीकमेंडर।",

  // How it works
  how_title: "यह कैसे काम करता है",
  how_step1_title: "प्रोफ़ाइल बनाएं",
  how_step1_desc: "पदनाम, विभाग और योग्यताओं के साथ अपनी पेशेवर प्रोफ़ाइल पूरी करें।",
  how_step2_title: "मूल्यांकन दें",
  how_step2_desc: "AI 4 दक्षता क्षेत्रों में Bloom's taxonomy के साथ अनुकूली प्रश्न बनाता है।",
  how_step3_title: "सिफारिशें पाएं",
  how_step3_desc: "आपके कौशल अंतर, भूमिका और विभाग की आवश्यकताओं के आधार पर व्यक्तिगत सिफारिशें।",
  how_step4_title: "सीखें और प्रमाणित हों",
  how_step4_desc: "iGOT कर्मयोगी पर पाठ्यक्रम पूरे करें, मूल्यांकन पास करें और सत्यापित प्रमाणपत्र अर्जित करें।",

  // CTA
  cta_title: "अपने करियर को आगे बढ़ाने के लिए तैयार?",
  cta_desc: "हजारों सरकारी अधिकारियों से जुड़ें जो AI-संचालित मूल्यांकन और व्यक्तिगत सीखने के रास्तों के साथ अपने कौशल बना रहे हैं।",
  cta_btn1: "शुरू करें",
  cta_btn2: "साइन इन करें",

  // Partners
  partners_label: "राष्ट्रीय पहलों के साथ संरेखित",

  // Footer
  footer_desc: "भारत के आधिकारिक सांख्यिकी प्रणाली के लिए AI-संचालित कौशल बुद्धिमत्ता और शिक्षण मंच।",
  footer_links: "त्वरित लिंक",
  footer_account: "खाता",
  footer_compliance: "अनुपालन",
  footer_policy: "गोपनीयता नीति",
  footer_terms: "उपयोग की शर्तें",
  footer_accessibility: "सुगम्यता",
  footer_gigw: "GIGW 3.0 संरेखित",
  footer_copyright: "सर्वाधिकार सुरक्षित। एक MoSPI पहल।",
  footer_tagline: "सरकार संरेखित। लोग केंद्रित।",

  // Dashboard
  dash_welcome: "स्वागत है",
  dash_xp: "अंक",
  dash_streak: "स्ट्रीक",
  dash_badges: "बैज",
  dash_courses: "पाठ्यक्रम",
  dash_certificates: "प्रमाणपत्र",
  dash_competency_radar: "दक्षता रडार",
  dash_overall: "समग्र",
  dash_earned_badges: "अर्जित बैज",
  dash_quick_actions: "त्वरित कार्य",
  dash_take_assessment: "मूल्यांकन दें",
  dash_browse_courses: "पाठ्यक्रम देखें",
  dash_skill_heatmap: "कौशल हीटमैप",
  dash_competencies: "दक्षताएं",
  dash_recommended: "आपके लिए सिफारिशें",
  dash_igot_courses: "iGOT कर्मयोगी पाठ्यक्रम",
  dash_ongoing: "चल रहे पाठ्यक्रम",
  dash_trending: "लोकप्रिय पाठ्यक्रम",
  dash_trending_cert: "लोकप्रिय प्रमाणपत्र",
  dash_suggested: "आपके लिए सुझाए गए",
  dash_view_all: "सभी देखें",
  dash_no_courses: "कोई पाठ्यक्रम उपलब्ध नहीं।",
  dash_days_row: "दिनों की स्ट्रीक",
  dash_of: "/",

  // Tooltips
  tip_xp: "पाठ्यक्रम पूरे करने, मूल्यांकन पास करने और दैनिक लॉगिन से अर्जित अनुभव अंक",
  tip_streak: "लगातार सीखने की गतिविधि के दिन। बोनस XP अर्जित करने के लिए अपनी स्ट्रीक बनाए रखें!",
  tip_badges: "अर्जित उपलब्धि बैज। अधिक अनलॉक करने के लिए मील का पत्थर पूरे करें!",
  tip_courses: "नामांकित कुल पाठ्यक्रम। सीखना शुरू करें!",
  tip_certificates: "पाठ्यक्रम पूरे करने और मूल्यांकन पास करने के बाद अर्जित सत्यापित प्रमाणपत्र",

  // Learn
  learn_title: "सीखना केंद्र",
  learn_desc: "अपनी दक्षताओं को बनाने के लिए iGOT कर्मयोगी से पाठ्यक्रम देखें",
  learn_search: "पाठ्यक्रम खोजें...",
  learn_loading: "iGOT कर्मयोगी से पाठ्यक्रम लोड हो रहे हैं...",
  learn_found: "पाठ्यक्रम मिले",
  learn_no_courses: "कोई पाठ्यक्रम नहीं मिला",
  learn_view: "देखें",

  // Courses
  courses_title: "पाठ्यक्रम सूची",
  courses_desc: "iGOT कर्मयोगी और SkillUp आंतरिक पुस्तकालय से पाठ्यक्रम देखें",
  courses_all: "सभी पाठ्यक्रम",
  courses_igot: "iGOT कर्मयोगी",
  courses_internal: "SkillUp आंतरिक",
  courses_view_details: "विवरण देखें",

  // Assessment
  assessment_title: "दक्षता मूल्यांकन",
  assessment_start: "मूल्यांकन शुरू करें",
  assessment_next: "अगला प्रश्न",
  assessment_submit: "मूल्यांकन जमा करें",
  assessment_score: "आपका स्कोर",
  assessment_passed: "उत्तीर्ण",
  assessment_failed: "अनुत्तीर्ण",

  // Auth
  login_title: "साइन इन",
  login_email: "ईमेल पता",
  login_password: "पासवर्ड",
  login_btn: "साइन इन",
  login_forgot: "पासवर्ड भूल गए?",
  login_no_account: "खाता नहीं है?",
  login_signup_link: "साइन अप",
  login_or: "या",
  login_google: "Google से जारी रखें",
  login_sso: "सरकारी SSO",

  register_title: "खाता बनाएं",
  register_name: "पूरा नाम",
  register_email: "ईमेल पता",
  register_password: "पासवर्ड",
  register_confirm: "पासवर्ड की पुष्टि करें",
  register_btn: "खाता बनाएं",
  register_has_account: "पहले से खाता है?",
  register_login_link: "साइन इन",

  // Profile setup
  setup_title: "अपनी प्रोफ़ाइल पूरी करें",
  setup_step: "चरण",
  setup_of: "/",
  setup_next: "अगला",
  setup_back: "पीछे",
  setup_save: "सहेजें और जारी रखें",
  setup_finish: "सेटअप पूरा करें",

  // Admin
  admin_title: "एडमिन डैशबोर्ड",
  admin_users: "उपयोगकर्ता प्रबंधन",
  admin_system: "सिस्टम सेटिंग्स",
  admin_analytics: "विश्लेषण",

  // Common
  common_loading: "लोड हो रहा है...",
  common_error: "कुछ गलत हो गया",
  common_retry: "पुनः प्रयास करें",
  common_save: "सहेजें",
  common_cancel: "रद्द करें",
  common_delete: "हटाएं",
  common_edit: "संपादित करें",
  common_search: "खोजें",
  common_filter: "फ़िल्टर",
  common_back: "पीछे",
  common_more: "और",
  common_less: "कम",

  // AI Chat
  ai_chat_title: "AI सहायक",
  ai_chat_placeholder: "इस पाठ्यक्रम के बारे में पूछें...",
  ai_voice_title: "AI वॉयस चैट",
  ai_voice_start: "वॉयस चैट शुरू करें",
  ai_voice_stop: "वॉयस चैट बंद करें",
  ai_voiceListening: "सुन रहा है...",
  ai_voiceThinking: "सोच रहा है...",
};

export const ALL_TRANSLATIONS: Record<LanguageCode, TranslationDict> = {
  en: EN,
  hi: HI,
  bn: {}, // Bengali — will show English fallback
  ta: {}, // Tamil
  te: {}, // Telugu
  mr: {}, // Marathi
  gu: {}, // Gujarati
  kn: {}, // Kannada
  ml: {}, // Malayalam
  pa: {}, // Punjabi
};

/**
 * Get a translated string.
 * Returns the translation for the given language, or English fallback,
 * or the key itself if nothing found.
 */
export function getTranslation(key: string, lang: LanguageCode): string {
  if (lang === "en") return EN[key] || key;
  const dict = ALL_TRANSLATIONS[lang];
  if (dict && dict[key]) return dict[key];
  return EN[key] || key;
}
