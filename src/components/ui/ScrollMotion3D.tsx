"use client";

import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";

type ScrollMotion3DProps = {
  children: ReactNode;
  className?: string;
  maxRotateX?: number;
  maxRotateY?: number;
  maxShiftY?: number;
  maxPushZ?: number;
};

const trackedElements = new Set<HTMLElement>();
let rafId = 0;
let listenersAttached = false;

function updateAll() {
  rafId = 0;
  const vh = window.innerHeight || 1;
  for (const el of trackedElements) {
    const rect = el.getBoundingClientRect();
    if (rect.bottom < -120 || rect.top > vh + 120) continue;
    const center = rect.top + rect.height * 0.5;
    const raw = (center - vh * 0.5) / (vh * 0.72);
    const clamped = Math.max(-1, Math.min(1, raw));
    el.style.setProperty("--sp", clamped.toFixed(3));
    el.style.setProperty("--sp-abs", Math.abs(clamped).toFixed(3));
  }
}

function scheduleUpdate() {
  if (rafId) return;
  rafId = window.requestAnimationFrame(updateAll);
}

function attachGlobalListeners() {
  if (listenersAttached) return;
  listenersAttached = true;
  window.addEventListener("scroll", scheduleUpdate, { passive: true });
  window.addEventListener("resize", scheduleUpdate, { passive: true });
}

function detachGlobalListenersIfEmpty() {
  if (!listenersAttached || trackedElements.size > 0) return;
  listenersAttached = false;
  window.removeEventListener("scroll", scheduleUpdate);
  window.removeEventListener("resize", scheduleUpdate);
  if (rafId) {
    window.cancelAnimationFrame(rafId);
    rafId = 0;
  }
}

/**
 * Scroll-linked 3D depth choreography wrapper using a single shared passive scroll + rAF loop.
 * Writes CSS custom properties (--sp, --sp-abs) directly on the DOM node with zero React re-renders.
 */
export function ScrollMotion3D({
  children,
  className = "",
  maxRotateX = 4.5,
  maxRotateY = 0,
  maxShiftY = -14,
  maxPushZ = -18,
}: ScrollMotion3DProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    trackedElements.add(el);
    attachGlobalListeners();
    scheduleUpdate();

    return () => {
      trackedElements.delete(el);
      detachGlobalListenersIfEmpty();
    };
  }, []);

  const vars = {
    "--s-rx": `${maxRotateX}deg`,
    "--s-ry": `${maxRotateY}deg`,
    "--s-y": `${maxShiftY}px`,
    "--s-z": `${maxPushZ}px`,
  } as CSSProperties;

  return (
    <div ref={ref} className={`scroll-3d ${className}`} style={vars}>
      {children}
    </div>
  );
}
