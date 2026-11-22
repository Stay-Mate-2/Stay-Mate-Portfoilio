"use client";

import { useEffect, useRef, type ElementType, type ReactNode } from "react";

/**
 * Lightweight scroll-reveal. Content is fully visible without JS; on mount, elements
 * that start below the fold are hidden and then revealed once via IntersectionObserver.
 * Only opacity/transform animate (no layout shift). Reduced motion is handled in CSS.
 */
export function Reveal({
  children,
  delay = 0,
  className = "",
  as: Tag = "div",
  id,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  as?: ElementType;
  id?: string;
}) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.92) return; // already on screen

    el.style.setProperty("--reveal-delay", `${delay}ms`);
    el.classList.add("reveal-init");
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          // next frame so the hidden state is painted before transitioning
          requestAnimationFrame(() => el.classList.add("is-visible"));
          io.disconnect();
        }
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [delay]);

  return (
    <Tag ref={ref} id={id} className={className}>
      {children}
    </Tag>
  );
}
