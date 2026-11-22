"use client";

import { useEffect, useRef, type PointerEvent, type ReactNode } from "react";

interface Tilt3DProps {
  children: ReactNode;
  className?: string;
  maxTilt?: number;
  tone?: "light" | "dark";
}

/**
 * Hardware-accelerated CSS 3D interactive tilt card.
 * Updates CSS variables directly on the element (zero React re-renders during pointer move),
 * disables itself automatically on touch devices or when `prefers-reduced-motion` is active.
 */
export function Tilt3D({ children, className = "", maxTilt = 7, tone = "light" }: Tilt3DProps) {
  const ref = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const enabled = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    enabled.current = fine && !reduced;
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!enabled.current || !ref.current) return;
    const el = ref.current;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    const rx = ((0.5 - py) * 2 * maxTilt).toFixed(2);
    const ry = ((px - 0.5) * 2 * maxTilt).toFixed(2);

    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.setAttribute("data-active", "true");
      el.style.setProperty("--rx", `${rx}deg`);
      el.style.setProperty("--ry", `${ry}deg`);
      el.style.setProperty("--ty", "-4px");
      el.style.setProperty("--mx", `${(px * 100).toFixed(1)}%`);
      el.style.setProperty("--my", `${(py * 100).toFixed(1)}%`);
    });
  }

  function onPointerLeave() {
    if (!ref.current) return;
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    const el = ref.current;
    el.removeAttribute("data-active");
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.style.setProperty("--ty", "0px");
  }

  return (
    <div
      ref={ref}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
      className={`tilt-card ${tone === "dark" ? "tilt-card-dark" : ""} ${className}`}
    >
      <div aria-hidden="true" className="tilt-glare" />
      {children}
    </div>
  );
}
