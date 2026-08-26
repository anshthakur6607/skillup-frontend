"use client";
/**
 * Footer — Government-site-style footer with standard sections.
 */
import { motion } from 'framer-motion';

const sections = [
  { title: 'About', links: ['Platform Overview', 'Mission & Vision', 'Government Initiative', 'Annual Reports'] },
  { title: 'Quick Links', links: ['Course Catalogue', 'Competency Framework', 'Certificate Verification', 'Help & Support'] },
  { title: 'Contact', links: ['Email: support@skillup.gov.in', 'Helpline: 1800-XXX-XXXX', 'Feedback Portal', 'Report an Issue'] },
];

export function Footer() {
  return (
    <footer id="footer" className="bg-slate-800 text-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5 }}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-400 to-cyan-300 flex items-center justify-center">
                <span className="text-white font-bold text-lg">S</span>
              </div>
              <span className="text-xl font-bold">SkillUp</span>
            </div>
            <p className="text-slate-400 text-sm leading-relaxed">An AI-enabled Skill Intelligence & Learning Platform for India&apos;s Official Statistical System. A Government of India initiative.</p>
          </motion.div>
          {sections.map((s, i) => (
            <motion.div key={s.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: (i + 1) * 0.1 }}>
              <h3 className="font-bold text-lg mb-4">{s.title}</h3>
              <ul className="space-y-2 list-none p-0 m-0">
                {s.links.map((l) => <li key={l}><a href="#" className="text-slate-400 hover:text-white transition-colors text-sm no-underline">{l}</a></li>)}
              </ul>
            </motion.div>
          ))}
        </div>
        <div className="mt-12 pt-8 border-t border-slate-700 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-slate-500 text-sm">© 2026 SkillUp Platform. Government of India. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-slate-500 hover:text-white text-sm no-underline transition-colors">Privacy Policy</a>
            <a href="#" className="text-slate-500 hover:text-white text-sm no-underline transition-colors">Terms of Use</a>
            <a href="#" className="text-slate-500 hover:text-white text-sm no-underline transition-colors">Accessibility</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
