"use client";
/**
 * Navbar — professional government-style floating navigation bar.
 * Square corners, clean flat design, sticky on scroll.
 * Auth-aware: shows Login or Dashboard/Logout based on session.
 * Language selector for site-wide translation.
 */
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, LANGUAGES } from "@/context/LanguageContext";
import { LogIn, LayoutDashboard, LogOut, Menu, X, Globe } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const { t, language, setLanguage } = useLanguage();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const langRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close language dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (langRef.current && !langRef.current.contains(e.target as Node)) {
        setLangOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const currentLang = LANGUAGES.find((l) => l.code === language);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.08)] border-b border-slate-200"
          : "bg-white border-b border-slate-100"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 no-underline shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpeg"
            alt="SkillUp"
            className="h-8 w-8"
            style={{ borderRadius: "4px" }}
          />
          <div className="hidden sm:block">
            <span className="text-base font-bold text-primary-500 tracking-tight leading-none">
              SkillUp
            </span>
            <span className="block text-[9px] text-slate-400 leading-none mt-0.5">
              Skill Intelligence Platform
            </span>
          </div>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-6">
          <NavLink href="/#features">{t("nav_features")}</NavLink>
          <NavLink href="/#how-it-works">{t("nav_how_it_works")}</NavLink>
          <NavLink href="/#about">{t("nav_about")}</NavLink>
          <NavLink href="/courses">{t("nav_courses")}</NavLink>
        </div>

        {/* Right side — language + auth */}
        <div className="hidden md:flex items-center gap-3">
          {/* Language selector */}
          <div className="relative" ref={langRef}>
            <button
              onClick={() => setLangOpen(!langOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 border border-slate-200 bg-white hover:bg-slate-50 transition-colors cursor-pointer"
              style={{ borderRadius: "4px" }}
            >
              <Globe size={14} />
              {currentLang?.nativeLabel || "EN"}
            </button>
            {langOpen && (
              <div
                className="absolute right-0 mt-1 w-44 bg-white border border-slate-200 shadow-lg py-1 z-50 max-h-60 overflow-y-auto"
                style={{ borderRadius: "4px" }}
              >
                {LANGUAGES.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      setLanguage(lang.code);
                      setLangOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-slate-50 cursor-pointer ${
                      language === lang.code
                        ? "bg-primary-50 text-primary-600 font-semibold"
                        : "text-slate-600"
                    }`}
                  >
                    <span className="font-medium">{lang.nativeLabel}</span>
                    <span className="text-slate-400">{lang.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {user ? (
            <div className="flex items-center gap-2">
              <Link
                href="/dashboard"
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-primary-500 text-white text-xs font-semibold hover:bg-primary-600 transition-colors no-underline"
                style={{ borderRadius: "4px" }}
              >
                <LayoutDashboard size={14} />
                {t("nav_dashboard")}
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white text-slate-500 text-xs font-medium border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
                style={{ borderRadius: "4px" }}
              >
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-primary-500 border border-primary-500 hover:bg-primary-50 transition-colors no-underline"
                style={{ borderRadius: "4px" }}
              >
                {t("nav_login")}
              </Link>
              <Link
                href="/register"
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors no-underline"
                style={{ borderRadius: "4px" }}
              >
                {t("nav_signup")}
              </Link>
            </div>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer bg-transparent border-none"
          style={{ borderRadius: "4px" }}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-slate-200 px-4 py-4 space-y-3">
          <MobileNavLink href="/#features" onClick={() => setMobileOpen(false)}>
            {t("nav_features")}
          </MobileNavLink>
          <MobileNavLink href="/#how-it-works" onClick={() => setMobileOpen(false)}>
            {t("nav_how_it_works")}
          </MobileNavLink>
          <MobileNavLink href="/#about" onClick={() => setMobileOpen(false)}>
            {t("nav_about")}
          </MobileNavLink>
          <MobileNavLink href="/courses" onClick={() => setMobileOpen(false)}>
            {t("nav_courses")}
          </MobileNavLink>

          {/* Mobile language selector */}
          <div className="pt-2 border-t border-slate-100">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider mb-2 px-1">Language</p>
            <div className="flex flex-wrap gap-1.5">
              {LANGUAGES.slice(0, 5).map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => {
                    setLanguage(lang.code);
                    setMobileOpen(false);
                  }}
                  className={`px-2.5 py-1 text-[10px] font-medium border cursor-pointer ${
                    language === lang.code
                      ? "bg-primary-500 text-white border-primary-500"
                      : "bg-white text-slate-600 border-slate-200"
                  }`}
                  style={{ borderRadius: "4px" }}
                >
                  {lang.nativeLabel}
                </button>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <div className="flex gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-3 py-2 text-xs font-semibold text-white bg-primary-500 no-underline"
                  style={{ borderRadius: "4px" }}
                >
                  {t("nav_dashboard")}
                </Link>
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="px-3 py-2 text-xs font-medium bg-white text-slate-600 border border-slate-200 cursor-pointer"
                  style={{ borderRadius: "4px" }}
                >
                  {t("nav_logout")}
                </button>
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-3 py-2 text-xs font-semibold text-primary-500 border border-primary-500 no-underline"
                  style={{ borderRadius: "4px" }}
                >
                  {t("nav_login")}
                </Link>
                <Link
                  href="/register"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-3 py-2 text-xs font-semibold text-white bg-primary-500 no-underline"
                  style={{ borderRadius: "4px" }}
                >
                  {t("nav_signup")}
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      className="text-xs font-medium text-slate-500 hover:text-primary-500 transition-colors no-underline uppercase tracking-wide"
    >
      {children}
    </a>
  );
}

function MobileNavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick: () => void }) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="block px-3 py-2 text-sm text-slate-600 hover:bg-slate-50 font-medium no-underline"
      style={{ borderRadius: "4px" }}
    >
      {children}
    </a>
  );
}
