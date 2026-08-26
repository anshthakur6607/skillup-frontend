"use client";
/**
 * ClayButton — Claymorphism-styled button. Primary (blue gradient) or secondary (white).
 */
import { motion, type HTMLMotionProps } from 'framer-motion';

interface ClayButtonProps extends HTMLMotionProps<'button'> {
  variant?: 'primary' | 'secondary';
  size?: 'sm' | 'md' | 'lg';
}

export function ClayButton({ children, variant = 'primary', size = 'md', className = '', ...props }: ClayButtonProps) {
  const sizeClasses = { sm: 'px-4 py-2 text-sm', md: 'px-6 py-3 text-base', lg: 'px-8 py-4 text-lg' };
  const variantClasses = variant === 'primary'
    ? 'bg-gradient-to-r from-primary-500 to-cyan-400 text-white shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c1c9d6,-6px_-6px_12px_#ffffff]'
    : 'bg-white text-primary-600 shadow-[4px_4px_8px_#d1d9e6,-4px_-4px_8px_#ffffff] hover:shadow-[6px_6px_12px_#c1c9d6,-6px_-6px_12px_#ffffff]';

  return (
    <motion.button
      className={`${sizeClasses[size]} ${variantClasses} rounded-xl font-semibold transition-all duration-300 cursor-pointer border-none outline-none`}
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      {children}
    </motion.button>
  );
}
