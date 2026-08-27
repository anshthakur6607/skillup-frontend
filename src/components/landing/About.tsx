"use client";
/**
 * About — brief section about SkillUp's mission and government context.
 * Placed between HowItWorks and Footer on the landing page.
 */
import { motion } from "framer-motion";
import { Target, Globe, Lock } from "lucide-react";

export function About() {
  return (
    <section className="py-24 bg-surface">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              About SkillUp
            </h2>
            <p className="text-slate-500 text-lg leading-relaxed">
              SkillUp is an AI-enabled Skill Intelligence &amp; Learning Platform
              built for India&apos;s Official Statistical System. It provides
              department-level competency mapping, identifies skill gaps through
              AI-driven assessment, and delivers personalised learning paths
              integrated with the national iGOT Karmayogi platform.
            </p>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-center p-6 rounded-2xl bg-white border border-slate-100"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Target size={22} className="text-primary-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">
              Mission-Driven
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Strengthening India&apos;s statistical capacity through systematic
              competency development and data-driven training decisions.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-center p-6 rounded-2xl bg-white border border-slate-100"
          >
            <div className="w-12 h-12 rounded-xl bg-cyan-50 flex items-center justify-center mx-auto mb-4">
              <Globe size={22} className="text-cyan-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">
              National Scale
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Designed to serve ministries, departments, and statistical
              organisations across all states and union territories of India.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.3 }}
            className="text-center p-6 rounded-2xl bg-white border border-slate-100"
          >
            <div className="w-12 h-12 rounded-xl bg-primary-50 flex items-center justify-center mx-auto mb-4">
              <Lock size={22} className="text-primary-600" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-2">
              Secure by Design
            </h3>
            <p className="text-slate-500 text-sm leading-relaxed">
              Government-grade security with row-level data protection, encrypted
              transmissions, and strict access controls at every layer.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
