"use client";
/**
 * ClayCard — Reusable card with claymorphism styling.
 * Dual shadow technique: light top-left + dark bottom-right = soft raised clay look.
 */
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ClayCardProps extends HTMLMotionProps<'div'> {
  inset?: boolean;
  variant?: 'default' | 'lg' | 'sm';
}

export function ClayCard({ children, inset = false, variant = 'default', className = '', ...props }: ClayCardProps) {
  const shadowClass = inset
    ? 'shadow-[inset_3px_3px_6px_#d1d9e6,inset_-3px_-3px_6px_#ffffff]'
    : variant === 'lg'
      ? 'shadow-[10px_10px_20px_#d1d9e6,-10px_-10px_20px_#ffffff]'
      : variant === 'sm'
        ? 'shadow-[3px_3px_6px_#d1d9e6,-3px_-3px_6px_#ffffff]'
        : 'shadow-[6px_6px_12px_#d1d9e6,-6px_-6px_12px_#ffffff]';
  const hoverShadow = inset ? '' : 'hover:shadow-[8px_8px_16px_#c1c9d6,-8px_-8px_16px_#ffffff]';

  return (
    <motion.div
      className={`bg-white rounded-2xl ${shadowClass} ${hoverShadow} transition-all duration-300 ${className}`}
      whileHover={inset ? {} : { y: -4 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
