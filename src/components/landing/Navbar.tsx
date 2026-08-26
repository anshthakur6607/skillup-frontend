"use client";
/**
 * Navbar — Floating glassmorphism nav with auth state awareness.
 *
 * DESIGN: The navbar has two visual states:
 * 1. Top of page: transparent background, content floats over the hero
 * 2. Scrolled: frosted glass effect (semi-transparent white + backdrop-blur + soft shadow)
 *
 * The "floating" feel comes from:
 * - Always having a subtle claymorphism shadow (even when transparent)
 * - The frosted glass backdrop-blur when scrolled
 * - A slight scale transform on the logo on hover
 * - Smooth transitions on all state changes
 *
 * AUTH: Shows Login button when logged out, Dashboard + user email + Logout when logged in.
 */
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { motion } from "framer-motion";
import Link from "next/link";

const navLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "#features" },
  { label: "Courses", href: "#how-it-works" },
  { label: "Contact", href: "#footer" },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { session, user, loading, signOut } = useAuth();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Floating glass classes: transparent at top, frosted glass when scrolled
  const navClass = scrolled
    ? "fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-white/70 backdrop-blur-xl shadow-[0_8px_32px_rgba(59,130,246,0.08),0_2px_8px_rgba(0,0,0,0.04)] border-b border-white/20"
    : "fixed top-0 left-0 right-0 z-50 transition-all duration-500 bg-transparent";

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className={navClass}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 no-underline group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-400 flex items-center justify-center shadow-[3px_3px_8px_rgba(59,130,246,0.25),-2px_-2px_6px_rgba(255,255,255,0.8)] group-hover:shadow-[4px_4px_12px_rgba(59,130,246,0.35),-3px_-3px_8px_rgba(255,255,255,0.9)] transition-all duration-300 group-hover:scale-105">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-primary-700 hidden sm:block">SkillUp</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-primary-600 rounded-xl hover:bg-primary-50/60 transition-all duration-200 no-underline">
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop auth section */}
          <div className="hidden md:flex items-center gap-3">
            {!loading && session ? (
              <>
                <Link href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-primary-600 hover:bg-primary-50/60 rounded-xl transition-all no-underline">
                  Dashboard
                </Link>
                <span className="text-xs text-slate-400 max-w-[100px] truncate" title={user?.email}>
                  {user?.email}
                </span>
                <button onClick={signOut}
                  className="px-4 py-2 text-sm font-medium text-slate-600 bg-white/80 backdrop-blur-sm rounded-xl shadow-[2px_2px_6px_rgba(209,217,230,0.6),-2px_-2px_6px_rgba(255,255,255,0.8)] hover:shadow-[3px_3px_8px_rgba(209,217,230,0.8),-3px_-3px_8px_rgba(255,255,255,0.9)] hover:bg-white transition-all duration-200 cursor-pointer border-none">
                  Logout
                </button>
              </>
            ) : (
              <Link href="/login"
                className="px-5 py-2.5 text-sm font-semibold text-primary-600 bg-white/80 backdrop-blur-sm rounded-xl shadow-[3px_3px_8px_rgba(209,217,230,0.6),-3px_-3px_8px_rgba(255,255,255,0.8)] hover:shadow-[4px_4px_12px_rgba(209,217,230,0.8),-4px_-4px_12px_rgba(255,255,255,0.9)] hover:bg-white transition-all duration-200 no-underline">
                Login
              </Link>
            )}
          </div>

          {/* Mobile hamburger */}
          <button className="md:hidden p-2.5 rounded-xl bg-white/80 backdrop-blur-sm shadow-[2px_2px_6px_rgba(209,217,230,0.6),-2px_-2px_6px_rgba(255,255,255,0.8)] border-none cursor-pointer transition-all duration-200"
            onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen
                ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="md:hidden pb-4 space-y-1 bg-white/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_32px_rgba(59,130,246,0.08)] border border-white/20 p-3 mb-3">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href}
                className="block px-4 py-2.5 text-sm font-medium text-slate-600 hover:text-primary-600 rounded-xl hover:bg-primary-50/60 transition-all no-underline"
                onClick={() => setMobileOpen(false)}>
                {l.label}
              </a>
            ))}
            <div className="pt-2 border-t border-slate-100">
              {!loading && session ? (
                <div className="space-y-2 px-1">
                  <Link href="/dashboard" className="block px-4 py-2.5 text-sm font-medium text-primary-600 rounded-xl hover:bg-primary-50/60 no-underline"
                    onClick={() => setMobileOpen(false)}>Dashboard</Link>
                  <button onClick={() => { signOut(); setMobileOpen(false); }}
                    className="w-full px-4 py-2.5 text-sm font-medium text-slate-600 bg-white rounded-xl shadow-[2px_2px_6px_rgba(209,217,230,0.6),-2px_-2px_6px_rgba(255,255,255,0.8)] border-none cursor-pointer">
                    Logout
                  </button>
                </div>
              ) : (
                <Link href="/login"
                  className="block px-4 py-2.5 text-sm font-semibold text-primary-600 bg-white rounded-xl shadow-[3px_3px_8px_rgba(209,217,230,0.6),-3px_-3px_8px_rgba(255,255,255,0.8)] text-center no-underline"
                  onClick={() => setMobileOpen(false)}>
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}