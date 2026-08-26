"use client";
/**
 * StatsSection — 4 animated stat cards that count up on scroll.
 */
import { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ClayCard } from '../ui';

const stats = [
  { label: 'Courses Available', value: 500, suffix: '+' },
  { label: 'Competencies Mapped', value: 120, suffix: '+' },
  { label: 'Officials Trained', value: 50000, suffix: '+' },
  { label: 'Departments Connected', value: 25, suffix: '+' },
];

function AnimatedCounter({ target, suffix }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const increment = target / 125;
    const timer = setInterval(() => {
      start += increment;
      if (start >= target) { setCount(target); clearInterval(timer); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref} className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-primary-500 to-cyan-400 bg-clip-text text-transparent">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export function StatsSection() {
  return (
    <section className="py-16 sm:py-24 px-4 sm:px-6">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {stats.map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: '-50px' }} transition={{ duration: 0.5, delay: i * 0.1 }}>
            <ClayCard className="p-6 sm:p-8 text-center">
              <AnimatedCounter target={s.value} suffix={s.suffix} />
              <p className="mt-2 text-sm sm:text-base text-slate-500 font-medium">{s.label}</p>
            </ClayCard>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
