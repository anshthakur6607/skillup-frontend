"use client";
/**
 * Navbar — floating frosted glass navigation bar.
 * Uses backdrop-blur for the frosted glass effect.
 * Transitions from fully transparent to frosted on scroll.
 * Auth-aware: shows Login or Dashboard/Logout based on session.
 */
import { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { LogIn, LayoutDashboard, LogOut, Menu, X } from "lucide-react";

export function Navbar() {
  const { user, signOut } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-white/80 backdrop-blur-xl shadow-[0_1px_3px_rgba(0,0,0,0.08)]"
          : "bg-transparent"
      }`}
    >
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline shrink-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.jpeg"
            alt="SkillUp"
            className="h-9 w-9 rounded-full object-cover"
          />
          <span className="text-lg font-bold text-slate-800 tracking-tight hidden sm:block">
            SkillUp
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-8">
          <NavLink href="/#features">Features</NavLink>
          <NavLink href="/#how-it-works">How It Works</NavLink>
          <NavLink href="/#about">About</NavLink>

          {user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium no-underline hover:bg-slate-800 transition-colors"
              >
                <LayoutDashboard size={16} />
                Dashboard
              </Link>
              <button
                onClick={() => signOut()}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white text-slate-600 text-sm font-medium border border-slate-200 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <LogOut size={16} />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium no-underline hover:bg-slate-800 transition-colors"
            >
              <LogIn size={16} />
              Sign In
            </Link>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer bg-transparent border-none"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-xl border-t border-slate-100 px-4 py-4 space-y-3">
          <MobileNavLink href="/#features" onClick={() => setMobileOpen(false)}>
            Features
          </MobileNavLink>
          <MobileNavLink href="/#how-it-works" onClick={() => setMobileOpen(false)}>
            How It Works
          </MobileNavLink>
          <MobileNavLink href="/#about" onClick={() => setMobileOpen(false)}>
            About
          </MobileNavLink>
          <div className="pt-2 border-t border-slate-100">
            {user ? (
              <div className="flex gap-2">
                <Link
                  href="/dashboard"
                  onClick={() => setMobileOpen(false)}
                  className="flex-1 text-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium no-underline"
                >
                  Dashboard
                </Link>
                <button
                  onClick={() => { signOut(); setMobileOpen(false); }}
                  className="px-4 py-2 rounded-xl bg-white text-slate-600 text-sm font-medium border border-slate-200 cursor-pointer"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setMobileOpen(false)}
                className="block text-center px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-medium no-underline"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      className="text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors no-underline"
    >
      {children}
    </a>
  );
}

function MobileNavLink({
  href,
  children,
  onClick,
}: {
  href: string;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <a
      href={href}
      onClick={onClick}
      className="block px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-50 text-sm font-medium no-underline"
    >
      {children}
    </a>
  );
}
