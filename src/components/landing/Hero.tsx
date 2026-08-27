"use client";
/**
 * Hero — main landing section.
 * Describes SkillUp's mission: AI-powered skill intelligence for India's
 * statistical workforce. Clean, professional, no fake stats.
 */
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { FloatingShape } from "@/components/ui";

export function Hero() {
  return (
    <section className="relative min-h-[90vh] flex items-center overflow-hidden pt-16">
      {/* Background blobs */}
      <FloatingShape
        animation="animate-float-1"
        size={400}
        top="10%"
        left="-5%"
        color="linear-gradient(135deg, #3b82f6, #22d3ee)"
        opacity={0.08}
      />
      <FloatingShape
        animation="animate-float-2"
        size={300}
        bottom="15%"
        right="-3%"
        color="linear-gradient(135deg, #22d3ee, #3b82f6)"
        opacity={0.06}
      />
      <FloatingShape
        animation="animate-float-3"
        size={200}
        top="30%"
        right="20%"
        color="linear-gradient(135deg, #60a5fa, #22d3ee)"
        opacity={0.05}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary-50 border border-primary-100 text-primary-700 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-primary-500 animate-pulse" />
            Building India&apos;s Statistical Workforce
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 leading-[1.1] tracking-tight mb-6">
            Skill intelligence for a{" "}
            <span className="bg-gradient-to-r from-primary-600 to-cyan-500 bg-clip-text text-transparent">
              data-driven India
            </span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-slate-500 leading-relaxed mb-8 max-w-2xl">
            SkillUp maps competencies across India&apos;s Official Statistical
            System, identifies skill gaps with AI, and delivers personalised
            learning paths — integrating with iGOT Karmayogi to build
            world-class capacity in government institutions.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/register"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-slate-900 text-white font-semibold text-base hover:bg-slate-800 transition-all no-underline shadow-lg shadow-slate-900/20"
            >
              Get Started
              <ArrowRight size={18} />
            </Link>
            <a
              href="#how-it-works"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-white text-slate-700 font-semibold text-base border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all no-underline"
            >
              See How It Works
            </a>
          </div>
        </div>

        {/* Right-side visual — abstract competency graph */}
        <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 w-[420px]">
          <div className="relative">
            {/* Stacked cards representing the platform */}
            <div className="absolute -top-8 -left-4 w-64 h-40 rounded-2xl bg-white/60 backdrop-blur border border-white/80 shadow-xl rotate-[-4deg]" />
            <div className="absolute -top-2 left-8 w-64 h-40 rounded-2xl bg-white/70 backdrop-blur border border-white/80 shadow-xl rotate-[-1deg]" />
            <div className="relative w-72 h-48 rounded-2xl bg-white border border-slate-100 shadow-2xl p-6 flex flex-col justify-between">
              <div>
                <div className="text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Skill Assessment
                </div>
                <div className="space-y-2">
                  <Bar label="Survey Design" value={85} />
                  <Bar label="Data Analysis" value={72} />
                  <Bar label="Python" value={58} />
                  <Bar label="Data Privacy" value={91} />
                </div>
              </div>
              <div className="text-[11px] text-slate-400">
                AI-powered gap analysis
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function Bar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-0.5">
        <span className="text-slate-600">{label}</span>
        <span className="text-slate-400">{value}%</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-primary-500 to-cyan-400"
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
