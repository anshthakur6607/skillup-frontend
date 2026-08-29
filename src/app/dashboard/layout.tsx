"use client";

/**
 * DashboardLayout — wraps all /dashboard/* pages.
 * Provides a persistent sidebar navigation and top bar.
 * Square corners, professional government style.
 * Includes admin link for admin-role users.
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { useLanguage, LANGUAGES } from "@/context/LanguageContext";
import { supabase } from "@/lib/supabaseClient";
import { motion, AnimatePresence } from "framer-motion";
import {
  Home,
  BookOpen,
  GraduationCap,
  Target,
  Award,
  User,
  Menu,
  X,
  LogOut,
  ChevronRight,
  Search,
  Bell,
  BarChart3,
  Shield,
  Globe,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/dashboard/learn", label: "Learn Hub", icon: BookOpen },
  { href: "/dashboard/my-learning", label: "My Learning", icon: GraduationCap },
  { href: "/dashboard/competencies", label: "Competencies", icon: Target },
  { href: "/dashboard/certificates", label: "Certificates", icon: Award },
  { href: "/dashboard/heatmap", label: "Skill Heatmap", icon: BarChart3 },
  { href: "/dashboard/profile", label: "My Profile", icon: User },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const { language, setLanguage } = useLanguage();

  useEffect(() => {
    if (!user) return;
    const check = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();
      if (data?.role === "admin") setIsAdmin(true);
    };
    check();
  }, [user]);

  const isActive = (href: string) => {
    if (!pathname) return false;
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  };

  const currentLang = LANGUAGES.find((l) => l.code === language);

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="p-5 border-b border-slate-100">
        <Link href="/dashboard" className="flex items-center gap-3 no-underline">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpeg"
            alt="SkillUp"
            className="h-8 w-8"
            style={{ borderRadius: "4px" }}
          />
          {sidebarOpen && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="text-lg font-bold text-slate-800"
            >
              SkillUp
            </motion.span>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold transition-all duration-200 no-underline ${
                active
                  ? "bg-primary-500 text-white"
                  : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
              }`}
              style={{ borderRadius: "4px" }}
            >
              <Icon size={16} />
              {sidebarOpen && <span>{item.label}</span>}
              {active && sidebarOpen && (
                <ChevronRight size={12} className="ml-auto" />
              )}
            </Link>
          );
        })}

        {/* Admin link — only visible to admins */}
        {isAdmin && (
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            className={`flex items-center gap-3 px-3 py-2.5 text-xs font-semibold transition-all duration-200 no-underline ${
              isActive("/admin")
                ? "bg-red-500 text-white"
                : "text-slate-500 hover:bg-red-50 hover:text-red-600"
            }`}
            style={{ borderRadius: "4px" }}
          >
            <Shield size={16} />
            {sidebarOpen && <span>Admin Panel</span>}
          </Link>
        )}
      </nav>

      {/* User info at bottom */}
      <div className="p-4 border-t border-slate-100">
        <div className={`flex items-center ${sidebarOpen ? "gap-3" : "justify-center"}`}>
          <div
            className="w-8 h-8 bg-primary-500 flex items-center justify-center text-white font-semibold text-xs shrink-0"
            style={{ borderRadius: "4px" }}
          >
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
          {sidebarOpen && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-slate-800 truncate">
                {user?.email?.split("@")[0] || "User"}
              </p>
              <p className="text-[10px] text-slate-400 truncate">{user?.email}</p>
            </div>
          )}
          {sidebarOpen && (
            <button
              onClick={() => signOut()}
              className="p-1.5 hover:bg-slate-100 text-slate-400 hover:text-red-500 transition-colors cursor-pointer border-none bg-transparent"
              style={{ borderRadius: "4px" }}
              title="Sign out"
            >
              <LogOut size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-surface flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden lg:flex flex-col bg-white border-r border-slate-200 transition-all duration-300 ${
          sidebarOpen ? "w-56" : "w-14"
        }`}
      >
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/30 z-40 lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="fixed left-0 top-0 bottom-0 w-64 bg-white z-50 lg:hidden shadow-xl"
            >
              <button
                onClick={() => setMobileOpen(false)}
                className="absolute top-4 right-4 p-1.5 hover:bg-slate-100 text-slate-400 cursor-pointer border-none bg-transparent"
                style={{ borderRadius: "4px" }}
              >
                <X size={18} />
              </button>
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen overflow-hidden">
        {/* Top Bar */}
        <header className="bg-white border-b border-slate-200 px-4 lg:px-6 h-14 flex items-center gap-4 shrink-0">
          <button
            onClick={() => {
              if (window.innerWidth < 1024) setMobileOpen(true);
              else setSidebarOpen(!sidebarOpen);
            }}
            className="p-2 hover:bg-slate-100 text-slate-500 cursor-pointer border-none bg-transparent"
            style={{ borderRadius: "4px" }}
          >
            <Menu size={18} />
          </button>

          <div className="flex-1 max-w-md">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses, competencies..."
                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-primary-200 focus:border-primary-300 transition-all"
                style={{ borderRadius: "4px" }}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Language selector */}
            <div className="relative">
              <button
                onClick={() => setLangOpen(!langOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-medium text-slate-500 border border-slate-200 bg-white hover:bg-slate-50 cursor-pointer"
                style={{ borderRadius: "4px" }}
              >
                <Globe size={12} />
                {currentLang?.nativeLabel || "EN"}
              </button>
              {langOpen && (
                <div
                  className="absolute right-0 mt-1 w-40 bg-white border border-slate-200 shadow-lg py-1 z-50 max-h-60 overflow-y-auto"
                  style={{ borderRadius: "4px" }}
                >
                  {LANGUAGES.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setLangOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 text-[11px] flex items-center gap-2 hover:bg-slate-50 cursor-pointer ${
                        language === lang.code
                          ? "bg-primary-50 text-primary-600 font-semibold"
                          : "text-slate-600"
                      }`}
                    >
                      <span className="font-medium">{lang.nativeLabel}</span>
                      <span className="text-slate-400 text-[10px]">{lang.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            <button
              className="p-2 hover:bg-slate-100 text-slate-500 cursor-pointer border-none bg-transparent relative"
              style={{ borderRadius: "4px" }}
            >
              <Bell size={16} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500" style={{ borderRadius: "50%" }} />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
