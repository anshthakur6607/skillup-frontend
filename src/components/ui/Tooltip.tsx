"use client";
/**
 * Tooltip — shows info text on hover above the element.
 * Uses CSS for positioning, no external library needed.
 */
import { useState, type ReactNode } from "react";

interface TooltipProps {
  children: ReactNode;
  content: string;
}

export function Tooltip({ children, content }: TooltipProps) {
  const [show, setShow] = useState(false);

  return (
    <div
      className="relative inline-block"
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && content && (
        <div
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-3 py-2 bg-slate-800 text-white text-[11px] leading-tight whitespace-normal z-50 pointer-events-none"
          style={{ borderRadius: "4px", width: "max-content", maxWidth: "220px" }}
        >
          {content}
          <div
            className="absolute top-full left-1/2 -translate-x-1/2 -mt-px w-0 h-0 border-l-[5px] border-r-[5px] border-t-[5px] border-l-transparent border-r-transparent border-t-slate-800"
          />
        </div>
      )}
    </div>
  );
}
