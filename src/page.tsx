"use client";
/**
 * Landing Page — Professional government-style design.
 * Modeled after official Indian government platforms.
 * Clean, flat, institutional look with navy blue + saffron palette.
 */
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  BookOpen,
  BarChart3,
  Target,
  Users,
  Award,
  Shield,
  CheckCircle2,
  ArrowRight,
  Globe,
  Menu,
  X,
  TrendingUp,
  ClipboardCheck,
  GraduationCap,
  Building2,
  ChevronRight,
  Brain,
  Zap,
  Lock,
} from "lucide-react";

const STATS = [
  { value: "2.4M+", label: "Officials Trained", icon: Users },
  { value: "850K+", label: "Skills Mapped", icon: Target },
  { value: "120+", label: "Skill Domains", icon: BarChart3 },
  { value: "20K+", label: "Partner Institutions", icon: Building2 },
  { value: "98.6%", label: "Trust & Accuracy", icon: Shield },
];

const FEATURES = [
  {
    icon: Brain,
    title: "AI Skill Gap Analysis",
    desc: "Personalized competency mapping across 4 domains using adaptive assessments and Bloom's taxonomy.",
  },
  {
    icon: BookOpen,
    title: "iGOT Karmayogi Integration",
    desc: "Direct access to government training courses with real-time progress tracking and recommendations.",
  },
  {
    icon: Target,
    title: "Adaptive Assessments",
    desc: "AI-generated MCQs that adjust difficulty based on your performance using IRT calibration.",
  },
  {
    icon: TrendingUp,
    title: "Career Growth Tracking",
    desc: "Competency radar charts, skill heatmaps, and progress visualization for career planning.",
  },
  {
    icon: Award,
    title: "Verified Certificates",
    desc: "Digital certificates with verification codes for completed courses and passed assessments.",
  },
  {
    icon: Zap,
    title: "Smart Recommendations",
    desc: "Hybrid recommender combining content-based, collaborative, and rule-based signals.",
  },
];

const PARTNERS = [
  "Digital India",
  "iGOT Karmayogi",
  "Skill India",
  "NITI Aayog",
  "MoSPI",
];

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export default function LandingPage() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-white">
      {/* ========== HEADER ========== */}
      <header
        className={`sticky top-0 z-50 transition-all duration-200 ${
          scrolled ? "bg-white shadow-md border-b border-slate-200" : "bg-white"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 no-underline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/logo.jpeg" alt="SkillUp" className="h-9 w-9 rounded" />
              <div>
                <span className="text-lg font-bold text-primary-500 tracking-tight">SkillUp</span>
                <span className="block text-[10px] text-slate-500 -mt-0.5">Skill Intelligence Platform</span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm text-slate-600 hover:text-primary-500 font-medium transition-colors">Features</a>
              <a href="#how-it-works" className="text-sm text-slate-600 hover:text-primary-500 font-medium transition-colors">How It Works</a>
              <a href="#partners" className="text-sm text-slate-600 hover:text-primary-500 font-medium transition-colors">Partners</a>
              <a href="#about" className="text-sm text-slate-600 hover:text-primary-500 font-medium transition-colors">About</a>
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-3">
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-semibold text-primary-500 border-2 border-primary-500 hover:bg-primary-50 transition-colors no-underline"
                style={{ borderRadius: "4px" }}
              >
                Login
              </Link>
              <Link
                href="/register"
                className="px-4 py-2 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors no-underline"
                style={{ borderRadius: "4px" }}
              >
                Sign Up
              </Link>
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-600"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>

          {/* Mobile menu */}
          {mobileOpen && (
            <div className="md:hidden border-t border-slate-200 py-4 space-y-3">
              <a href="#features" className="block text-sm text-slate-600 font-medium px-2 py-2">Features</a>
              <a href="#how-it-works" className="block text-sm text-slate-600 font-medium px-2 py-2">How It Works</a>
              <a href="#partners" className="block text-sm text-slate-600 font-medium px-2 py-2">Partners</a>
              <div className="flex gap-3 pt-2">
                <Link href="/login" className="flex-1 text-center px-4 py-2 text-sm font-semibold text-primary-500 border-2 border-primary-500 no-underline" style={{ borderRadius: "4px" }}>Login</Link>
                <Link href="/register" className="flex-1 text-center px-4 py-2 text-sm font-semibold text-white bg-primary-500 no-underline" style={{ borderRadius: "4px" }}>Sign Up</Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* ========== HERO SECTION ========== */}
      <section className="relative bg-gradient-to-br from-slate-50 via-white to-primary-50/30 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left — Text */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp}>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-50 border border-primary-100 text-primary-600 text-xs font-semibold uppercase tracking-wider mb-6" style={{ borderRadius: "4px" }}>
                <Globe size={14} />
                Built for Bharat. Trusted by Skills.
              </div>
              <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 leading-tight mb-4">
                Assess. <span className="text-primary-500">Recognize.</span><br />
                <span className="text-saffron-500">Advance.</span>
              </h1>
              <p className="text-lg text-slate-600 mb-8 max-w-lg leading-relaxed">
                A unified AI-powered platform for skill assessment, competency mapping, and career growth for India&apos;s Official Statistical System.
              </p>
              <div className="flex flex-wrap gap-4 mb-8">
                <Link
                  href="/register"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-primary-500 hover:bg-primary-600 transition-colors no-underline"
                  style={{ borderRadius: "4px" }}
                >
                  Get Assessed <ArrowRight size={16} />
                </Link>
                <Link
                  href="/courses"
                  className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-primary-500 border-2 border-primary-500 hover:bg-primary-50 transition-colors no-underline"
                  style={{ borderRadius: "4px" }}
                >
                  Explore Courses
                </Link>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-500">
                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500" /> Secure</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500" /> Transparent</span>
                <span className="flex items-center gap-1"><CheckCircle2 size={14} className="text-green-500" /> Government Aligned</span>
              </div>
            </motion.div>

            {/* Right — Skill Card Preview */}
            <motion.div initial="hidden" animate="visible" variants={fadeUp} transition={{ delay: 0.2 }} className="hidden lg:block">
              <div className="bg-white border border-slate-200 p-6 max-w-sm ml-auto" style={{ borderRadius: "8px" }}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-xs text-slate-400 uppercase tracking-wider">Skill Competency Card</p>
                    <p className="text-sm font-semibold text-slate-800 mt-1">Official Recognition</p>
                  </div>
                  <Shield size={24} className="text-primary-500" />
                </div>
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Candidate</span>
                    <span className="font-medium text-slate-800">SkillUp User</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Skill Domain</span>
                    <span className="font-medium text-slate-800">Data Science & AI</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Proficiency</span>
                    <span className="font-medium text-primary-500">Advanced ★★★</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Date of Issue</span>
                    <span className="font-medium text-slate-800">28 Aug 2026</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Valid Till</span>
                    <span className="font-medium text-slate-800">28 Aug 2028</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-xs text-slate-400">Verify at <span className="text-primary-500">skillup.gov.in/verify</span></p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========== STATS BAR ========== */}
      <section className="bg-white border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {STATS.map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="text-center"
              >
                <stat.icon size={24} className="mx-auto text-primary-500 mb-2" />
                <p className="text-2xl lg:text-3xl font-bold text-slate-900">{stat.value}</p>
                <p className="text-xs text-slate-500 mt-1">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== PARTNERS ========== */}
      <section id="partners" className="bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-slate-600">Aligned with National Initiatives</p>
            <div className="flex items-center gap-8 overflow-x-auto">
              {PARTNERS.map((p) => (
                <div key={p} className="flex items-center gap-2 shrink-0">
                  <div className="w-8 h-8 rounded bg-primary-100 flex items-center justify-center">
                    <Globe size={16} className="text-primary-600" />
                  </div>
                  <span className="text-sm font-medium text-slate-600 whitespace-nowrap">{p}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========== FEATURES ========== */}
      <section id="features" className="bg-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-slate-900 mb-3">For Every Learner, A Path Forward</h2>
            <p className="text-slate-600 max-w-2xl mx-auto">
              Whether you&apos;re a field officer or a senior administrator, SkillUp helps you discover, assess, and grow.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08 }}
                className="bg-white border border-slate-200 p-6 hover:border-primary-200 hover:shadow-sm transition-all"
                style={{ borderRadius: "6px" }}
              >
                <div className="w-10 h-10 rounded bg-primary-50 flex items-center justify-center mb-4">
                  <f.icon size={20} className="text-primary-600" />
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-600 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== HOW IT WORKS ========== */}
      <section id="how-it-works" className="bg-slate-50 border-y border-slate-200">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16">
          <h2 className="text-3xl font-bold text-slate-900 text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: "01", title: "Create Profile", desc: "Register and complete your professional profile with designation, department, and qualifications.", icon: ClipboardCheck },
              { step: "02", title: "Take Assessment", desc: "AI generates adaptive questions tagged with Bloom's taxonomy across 4 competency domains.", icon: Brain },
              { step: "03", title: "Get Recommendations", desc: "Personalized course recommendations based on your skill gaps, role, and department needs.", icon: Target },
              { step: "04", title: "Learn & Certify", desc: "Complete courses on iGOT Karmayogi, pass assessments, and earn verified certificates.", icon: Award },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-white border border-slate-200 p-6 text-center"
                style={{ borderRadius: "6px" }}
              >
                <div className="text-3xl font-bold text-primary-200 mb-3">{item.step}</div>
                <item.icon size={28} className="mx-auto text-primary-500 mb-3" />
                <h3 className="text-sm font-semibold text-slate-900 mb-2">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="bg-primary-500 text-white">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Advance Your Career?</h2>
          <p className="text-primary-100 mb-8 max-w-xl mx-auto">
            Join thousands of government officials who are building their skills with AI-powered assessments and personalized learning paths.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold text-primary-500 bg-white hover:bg-slate-50 transition-colors no-underline"
              style={{ borderRadius: "4px" }}
            >
              Get Started <ArrowRight size={16} />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-3 text-sm font-semibold text-white border-2 border-white/40 hover:border-white hover:bg-white/10 transition-colors no-underline"
              style={{ borderRadius: "4px" }}
            >
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ========== FOOTER ========== */}
      <footer className="bg-slate-900 text-slate-400">
        <div className="max-w-7xl mx-auto px-4 lg:px-8 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/logo.jpeg" alt="SkillUp" className="h-8 w-8 rounded" />
                <span className="text-white font-bold">SkillUp</span>
              </div>
              <p className="text-sm leading-relaxed">
                AI-powered Skill Intelligence & Learning Platform for India&apos;s Official Statistical System.
              </p>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Quick Links</h4>
              <div className="space-y-2 text-sm">
                <a href="#features" className="block hover:text-white transition-colors no-underline text-slate-400">Features</a>
                <a href="#how-it-works" className="block hover:text-white transition-colors no-underline text-slate-400">How It Works</a>
                <Link href="/courses" className="block hover:text-white transition-colors no-underline text-slate-400">Browse Courses</Link>
                <Link href="/status" className="block hover:text-white transition-colors no-underline text-slate-400">System Status</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Account</h4>
              <div className="space-y-2 text-sm">
                <Link href="/login" className="block hover:text-white transition-colors no-underline text-slate-400">Login</Link>
                <Link href="/register" className="block hover:text-white transition-colors no-underline text-slate-400">Sign Up</Link>
                <Link href="/setup-profile" className="block hover:text-white transition-colors no-underline text-slate-400">Complete Profile</Link>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold text-sm mb-3">Compliance</h4>
              <div className="space-y-2 text-sm">
                <span className="block">Privacy Policy</span>
                <span className="block">Terms of Use</span>
                <span className="block">Accessibility</span>
                <span className="block">GIGW 3.0 Aligned</span>
              </div>
            </div>
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-xs text-slate-500">
              Government Aligned. People Focused. Empowering Bharat through verified skills and transparency.
            </p>
            <p className="text-xs text-slate-500">
              &copy; 2026 SkillUp. All rights reserved. A MoSPI Initiative.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
