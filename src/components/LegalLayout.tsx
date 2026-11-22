import type { ReactNode } from "react";
import { AlertTriangle } from "lucide-react";
import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/sections/Navbar";

export function LegalLayout({ title, updated, children }: { title: string; updated: string; children: ReactNode }) {
  return (
    <>
      <Navbar home={false} />
      <main id="main" className="bg-gradient-to-b from-sky/60 to-white pb-24 pt-32 sm:pt-40">
        <article className="wrap max-w-3xl">
          <p className="eyebrow">Legal</p>
          <h1 className="mt-3 font-display text-4xl font-extrabold sm:text-5xl">{title}</h1>
          <p className="mt-3 text-sm text-muted">Last updated: {updated}</p>
          <div role="note" className="mt-8 flex gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm font-medium text-amber-900">
            <AlertTriangle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
            <p>
              <b>Draft — pending legal review.</b> This document describes how the StayMate pre-launch website works today. It has not yet been reviewed by a lawyer
              and will be updated before public launch (including compliance with India&apos;s Digital Personal Data Protection Act, 2023).
            </p>
          </div>
          <div className="mt-10 grid gap-8 text-[1.02rem] leading-relaxed text-navy/90 [&_h2]:mb-3 [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-extrabold [&_li]:mt-1.5 [&_ul]:list-disc [&_ul]:pl-6 [&_a]:font-semibold [&_a]:text-royal [&_a]:underline [&_a]:underline-offset-4">
            {children}
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
