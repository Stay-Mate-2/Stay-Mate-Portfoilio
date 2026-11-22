import type { ReactNode } from "react";

/**
 * Accessible accordion built on native <details>/<summary> — works without JS,
 * is keyboard accessible by default, and exposes expanded state to assistive tech.
 * Items sharing the same `name` open exclusively (supported browsers).
 */
export function AccordionItem({ question, children, name = "faq" }: { question: string; children: ReactNode; name?: string }) {
  return (
    <details name={name} className="group card overflow-hidden transition-colors open:border-royal/30 open:bg-sky/40">
      <summary className="flex cursor-pointer items-center justify-between gap-4 px-5 py-5 text-left font-display text-[1.05rem] font-bold text-navy sm:px-7 sm:text-lg">
        <span>{question}</span>
        <span
          aria-hidden="true"
          className="acc-chevron grid h-8 w-8 shrink-0 place-items-center rounded-full bg-sky text-royal transition-transform duration-300 group-open:bg-royal group-open:text-white"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
            <path d="m6 9 6 6 6-6" />
          </svg>
        </span>
      </summary>
      <div className="acc-body px-5 pb-6 text-[0.98rem] leading-relaxed text-muted sm:px-7">{children}</div>
    </details>
  );
}
