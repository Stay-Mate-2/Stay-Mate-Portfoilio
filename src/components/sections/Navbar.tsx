"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Menu, X } from "lucide-react";
import { Logo } from "@/components/ui/Logo";
import { ButtonLink } from "@/components/ui/Button";
import { navLinks } from "@/lib/site";

export function Navbar({ home = true }: { home?: boolean }) {
  const prefix = home ? "" : "/";
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const close = useCallback((returnFocus = false) => {
    setOpen(false);
    if (returnFocus) toggleRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close(true);
      if (e.key === "Tab" && menuRef.current) {
        // light focus trap inside the open menu + toggle button
        const focusables = [toggleRef.current, ...Array.from(menuRef.current.querySelectorAll<HTMLElement>("a,button"))].filter(
          (el): el is HTMLElement => Boolean(el),
        );
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    menuRef.current?.querySelector<HTMLElement>("a")?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <header className="fixed inset-x-0 top-0 z-50 px-3 pt-3 sm:px-5 sm:pt-4">
      <nav
        aria-label="Primary"
        className={`mx-auto flex h-16 max-w-6xl items-center justify-between rounded-full border bg-white/85 pl-4 pr-2.5 backdrop-blur-md transition-all duration-300 sm:pl-6 ${
          scrolled ? "border-line shadow-card" : "border-transparent"
        }`}
      >
        <a href={`${prefix}#top`} aria-label="StayMate — back to top" className="rounded-full" onClick={() => close()}>
          <Logo priority />
        </a>

        <ul className="hidden items-center gap-1 xl:flex">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={`${prefix}${l.href}`}
                className="rounded-full px-3.5 py-2 text-[0.92rem] font-semibold text-navy/80 transition-colors hover:bg-sky hover:text-royal"
              >
                {l.label}
              </a>
            </li>
          ))}
        </ul>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <ButtonLink href={`${prefix}#early-access`} className="!h-10 !px-4 sm:!h-11 sm:!px-5">
            <span className="sm:hidden">Join</span>
            <span className="hidden sm:inline">Join Waitlist</span>
          </ButtonLink>
          <button
            ref={toggleRef}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Close menu" : "Open menu"}
            onClick={() => setOpen((v) => !v)}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full text-navy transition-colors hover:bg-sky xl:hidden"
          >
            {open ? <X size={22} aria-hidden="true" /> : <Menu size={22} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open ? (
        <>
          <button type="button" aria-label="Close menu" tabIndex={-1} className="fixed inset-0 -z-10 bg-navy/30 backdrop-blur-[2px] xl:hidden" onClick={() => close()} />
          <div
            id="mobile-menu"
            ref={menuRef}
            className="card mx-auto mt-2 max-w-6xl p-3 xl:hidden"
            style={{ animation: "acc-in 0.25s ease-out" }}
          >
            <ul className="grid gap-1">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <a
                    href={`${prefix}${l.href}`}
                    onClick={() => close()}
                    className="flex min-h-12 items-center rounded-2xl px-4 font-display text-lg font-bold text-navy transition-colors hover:bg-sky hover:text-royal"
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
            <div className="p-2 pt-3">
              <ButtonLink href={`${prefix}#early-access`} size="lg" className="w-full" onClick={() => close()}>
                Join the Early Access List
              </ButtonLink>
            </div>
          </div>
        </>
      ) : null}
    </header>
  );
}
