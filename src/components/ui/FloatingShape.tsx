"use client";
/**
 * FloatingShape — Decorative animated blob for the background.
 */
interface FloatingShapeProps {
  animation: string;
  size: number;
  top?: string;
  left?: string;
  right?: string;
  bottom?: string;
  color: string;
  opacity?: number;
}

export function FloatingShape({ animation, size, top, left, right, bottom, color, opacity = 0.15 }: FloatingShapeProps) {
  return (
    <div
      className={`absolute rounded-full blur-3xl pointer-events-none ${animation}`}
      style={{ width: size, height: size, top, left, right, bottom, background: color, opacity }}
      aria-hidden="true"
    />
  );
}
