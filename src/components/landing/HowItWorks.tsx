"use client";
/**
 * HowItWorks — four-step flow showing the platform journey.
 * Clean horizontal layout with connecting lines. No emoji.
 */
import { motion } from "framer-motion";
import { ClipboardList, Sparkles, GraduationCap, BadgeCheck } from "lucide-react";
import { useLanguage } from "@/context/LanguageContext";

export function HowItWorks() {
  const { t } = useLanguage();
  const steps = [
    {
      icon: ClipboardList,
      number: "01",
      title: t("how_step1_title"),
      description: t("how_step1_desc"),
    },
    {
      icon: Sparkles,
      number: "02",
      title: t("how_step2_title"),
      description: t("how_step2_desc"),
    },
    {
      icon: GraduationCap,
      number: "03",
      title: t("how_step3_title"),
      description: t("how_step3_desc"),
    },
    {
      icon: BadgeCheck,
      number: "04",
      title: t("how_step4_title"),
      description: t("how_step4_desc"),
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            {t("how_title")}
          </h2>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto">
            {t("how_step1_desc")}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connector line — desktop only */}
          <div className="hidden lg:block absolute top-14 left-[12.5%] right-[12.5%] h-px bg-gradient-to-r from-primary-200 via-cyan-200 to-primary-200" />

          {steps.map((step, i) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.5 }}
              className="relative text-center"
            >
              {/* Icon circle */}
              <div className="relative z-10 w-14 h-14 rounded-full bg-white border-2 border-primary-200 flex items-center justify-center mx-auto mb-5 shadow-sm">
                <step.icon size={24} className="text-primary-600" />
              </div>

              {/* Step number */}
              <div className="text-xs font-semibold text-primary-400 tracking-widest uppercase mb-2">
                Step {step.number}
              </div>

              <h3 className="text-lg font-bold text-slate-800 mb-2">
                {step.title}
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
