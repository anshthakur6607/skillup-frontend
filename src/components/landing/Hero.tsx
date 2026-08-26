"use client";
/**
 * Hero — Main hero section with headline, subheading, CTAs, floating blobs.
 */
import { motion } from 'framer-motion';
import { ClayButton, FloatingShape } from '../ui';

export function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20">
      <FloatingShape animation="animate-float-1" size={300} top="10%" left="5%" color="linear-gradient(135deg, #3b82f6, #22d3ee)" opacity={0.12} />
      <FloatingShape animation="animate-float-2" size={250} top="20%" right="10%" color="linear-gradient(135deg, #22d3ee, #3b82f6)" opacity={0.1} />
      <FloatingShape animation="animate-float-3" size={200} bottom="15%" left="15%" color="linear-gradient(135deg, #60a5fa, #06b6d4)" opacity={0.08} />
      <FloatingShape animation="animate-float-4" size={180} bottom="25%" right="20%" color="linear-gradient(135deg, #3b82f6, #22d3ee)" opacity={0.1} />

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, ease: 'easeOut' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-sm shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff] mb-8">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            <span className="text-sm font-medium text-primary-600">AI-Powered Capacity Building</span>
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-slate-800 leading-tight mb-6">
            Building India&apos;s{' '}
            <span className="bg-gradient-to-r from-primary-500 to-cyan-400 bg-clip-text text-transparent">Statistical Workforce</span>{' '}
            for the Future
          </h1>
          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            Personalised, AI-driven skill development for government officials. Identify gaps, discover the right courses, and master the competencies that matter most for India&apos;s Official Statistical System.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <ClayButton size="lg">Get Started</ClayButton>
            <ClayButton variant="secondary" size="lg">Learn More</ClayButton>
          </div>
        </motion.div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-surface to-transparent" />
    </section>
  );
}
