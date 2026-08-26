"use client";
/**
 * Navbar — Sticky nav with logo, links, Login button, mobile hamburger.
 * Blurs and adds shadow on scroll.
 */
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { ClayButton } from '../ui';

const navLinks = [
  { label: 'Home', href: '#' },
  { label: 'About', href: '#features' },
  { label: 'Courses', href: '#how-it-works' },
  { label: 'Contact', href: '#footer' },
];

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { session, user, loading, signOut } = useAuth();

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', h);
    return () => window.removeEventListener('scroll', h);
  }, []);

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/80 backdrop-blur-md shadow-[0_4px_12px_#d1d9e6]' : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 sm:h-20">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-400 flex items-center justify-center shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]">
              <span className="text-white font-bold text-lg">S</span>
            </div>
            <span className="text-xl font-bold text-primary-700 hidden sm:block">SkillUp</span>
          </Link>
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="text-slate-600 hover:text-primary-600 transition-colors font-medium no-underline">{l.label}</a>
            ))}
          </div>
          <div className="hidden md:block">
            <Link href="/login" className="px-4 py-2 text-sm font-medium text-primary-600 bg-white rounded-xl shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] hover:shadow-[4px_4px_8px_#c1c9d6,-4px_-4px_8px_#ffffff] transition-all no-underline">Login</Link>
          </div>
          <button className="md:hidden p-2 rounded-xl bg-white shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] border-none cursor-pointer" onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            <svg className="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileOpen ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
            </svg>
          </button>
        </div>
        {mobileOpen && (
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="md:hidden pb-4 space-y-2">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className="block px-4 py-2 text-slate-600 hover:text-primary-600 rounded-xl hover:bg-white/50 transition-colors no-underline" onClick={() => setMobileOpen(false)}>{l.label}</a>
            ))}
            <div className="px-4 pt-2"><ClayButton variant="secondary" size="sm" className="w-full">Login</ClayButton></div>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
