"use client";
/**
 * FeatureGrid — 6 feature cards with icons, staggered entrance, hover lift.
 */
import { motion } from 'framer-motion';
import { ClayCard } from '../ui';

const features = [
  { icon: '🎯', title: 'AI Skill Gap Analysis', description: 'Identify exactly where your competencies fall short with intelligent gap analysis across statistical, technical, and governance skills.' },
  { icon: '📚', title: 'Personalised Recommendations', description: 'Get course suggestions tailored to your specific skill gaps, role, and department — powered by AI that understands your learning journey.' },
  { icon: '🤖', title: 'AI Tutor Chatbot', description: 'Ask questions, get explanations, and receive guided support from an AI tutor that understands your competency profile.' },
  { icon: '📝', title: 'Adaptive Assessments', description: 'Tests that adapt to your level, pinpointing exactly where you struggle — from beginner concepts to advanced applications.' },
  { icon: '🏆', title: 'Verified Certificates', description: 'Earn verifiable certificates upon course completion, with unique verification codes for authentic credential validation.' },
  { icon: '📊', title: 'Admin Analytics', description: 'Department-level insights into workforce capabilities, training progress, and competency distributions — without exposing individual data.' },
];

export function FeatureGrid() {
  return (
    <section id="features" className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.6 }} className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-800 mb-4">Platform Capabilities</h2>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto">Everything you need to assess, learn, and master the competencies that drive India&apos;s statistical excellence.</p>
        </motion.div>
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: '-50px' }} variants={{ hidden: {}, visible: { transition: { staggerChildren: 0.1 } } }} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <motion.div key={f.title} variants={{ hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0 } }}>
              <ClayCard className="p-6 sm:p-8 h-full">
                <div className="text-4xl mb-4">{f.icon}</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">{f.title}</h3>
                <p className="text-slate-500 leading-relaxed">{f.description}</p>
              </ClayCard>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
