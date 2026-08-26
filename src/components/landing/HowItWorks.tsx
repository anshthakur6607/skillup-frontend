"use client";
/**
 * HowItWorks — 4-step timeline: Survey → Recommend → Learn → Assess
 */
import { motion } from 'framer-motion';
import { ClayCard } from '../ui';

const steps = [
  { number: 1, title: 'Survey', description: 'Take a quick self-assessment to establish your current competency levels.', icon: '📋' },
  { number: 2, title: 'Recommend', description: 'AI analyses your gaps and suggests personalised learning paths.', icon: '💡' },
  { number: 3, title: 'Learn', description: 'Access curated courses from iGOT Karmayogi, NSSTA TPAC, and internal content.', icon: '📖' },
  { number: 4, title: 'Assess', description: 'Take adaptive assessments to validate your skills and earn certificates.', icon: '✅' },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6 }} className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">How It Works</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Four simple steps to transform your professional capabilities.</p>
        </motion.div>
        <div className="relative">
          <div className="hidden lg:block absolute top-1/2 left-0 right-0 h-0.5 bg-gradient-to-r from-primary-200 via-cyan-200 to-primary-200 -translate-y-1/2" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
            {steps.map((s, i) => (
              <motion.div key={s.number} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: i * 0.15 }}>
                <ClayCard className="p-6 text-center relative">
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-gradient-to-br from-primary-500 to-cyan-400 flex items-center justify-center shadow-[2px_2px_4px_#d1d9e6,-2px_-2px_4px_#ffffff]">
                    <span className="text-white font-bold text-sm">{s.number}</span>
                  </div>
                  <div className="text-4xl mb-4 mt-2">{s.icon}</div>
                  <h3 className="text-xl font-bold text-slate-800 mb-2">{s.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{s.description}</p>
                </ClayCard>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
