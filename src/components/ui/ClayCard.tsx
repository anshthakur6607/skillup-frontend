"use client";
/**
 * GovCard — Clean, flat card component for government-style UI.
 * Square corners, subtle border, no shadows or claymorphism.
 */
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ClayCardProps extends HTMLMotionProps<'div'> {
  inset?: boolean;
  variant?: 'default' | 'lg' | 'sm';
}

export function ClayCard({ children, inset = false, variant = 'default', className = '', ...props }: ClayCardProps) {
  return (
    <motion.div
      className={`bg-white border border-slate-200 transition-all duration-200 ${className}`}
      style={{ borderRadius: '6px' }}
      whileHover={inset ? {} : { y: -2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
