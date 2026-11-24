"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { AlertTriangle, Building2, CheckCircle2, ExternalLink, LockKeyhole, MailCheck, Rocket } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { normalizeGoogleFormEmbedUrl, toGoogleFormDirectUrl } from "@/lib/google-form";
import { contactEmail } from "@/lib/site";

interface Props {
  /** Public Google Form responder link (`docs.google.com/forms/.../viewform`). */
  embedUrl?: string;
}

const BENEFITS = [
  [
    Rocket,
    "First-wave city launch invite",
    "Be the first to get pilot app access when StayMate opens in your campus hub or city—and help decide which cities roll out first.",
  ],
  [
    Building2,
    "Priority onboarding for property owners",
    "PG operators and flat owners get early listing onboarding to connect directly with compatible seekers at launch.",
  ],
  [
    MailCheck,
    "Instant email receipt & full control",
    "Google Forms automatically emails your registration copy right away. No phone number required, and you can opt out any time.",
  ],
] as const;

const NEXT_STEPS = [
  ["1", "Fill in 30 seconds", "Answer 4 quick fields right inside this card."],
  ["2", "Get email confirmation", "Receive an automatic copy of your entry immediately."],
  ["3", "Receive launch access", "Get invited as your city cohort opens up."],
] as const;

export function EarlyAccess({ embedUrl }: Props) {
  const safeEmbedUrl = normalizeGoogleFormEmbedUrl(embedUrl);
  const directUrl = safeEmbedUrl ? toGoogleFormDirectUrl(safeEmbedUrl) : undefined;
  const [frameLoaded, setFrameLoaded] = useState(false);

  useEffect(() => {
    if (!safeEmbedUrl) return;
    const t = window.setTimeout(() => setFrameLoaded(true), 2200);
    return () => window.clearTimeout(t);
  }, [safeEmbedUrl]);

  return (
    <section id="early-access" aria-labelledby="ea-title" className="relative isolate overflow-hidden bg-gradient-to-br from-sky via-white to-mint py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="bg-dots absolute inset-0 -z-10 opacity-60"
        style={{
          maskImage: "radial-gradient(ellipse at 20% 30%, #000, transparent 70%)",
          WebkitMaskImage: "radial-gradient(ellipse at 20% 30%, #000, transparent 70%)",
        }}
      />
      <div className="wrap grid items-start gap-12 lg:grid-cols-[0.78fr_1.22fr] lg:gap-12">
        <Reveal className="lg:sticky lg:top-28">
          <p className="eyebrow">Early access · Free to join</p>
          <h2 id="ea-title" className="mt-4 font-display text-[clamp(2rem,4.5vw,3.2rem)] font-extrabold leading-[1.08] text-navy">
            Reserve your spot for a smarter way to <span className="text-gradient">live together.</span>
          </h2>
          <p className="mt-4 max-w-lg text-[1.03rem] leading-relaxed text-muted">
            Join Students, Working Professionals, and Property Owners shaping StayMate&apos;s launch cohorts. Register right here on this page in under a minute.
          </p>

          <ul className="mt-7 grid gap-4">
            {BENEFITS.map(([Icon, t, d]) => {
              const I = Icon;
              return (
                <li key={t} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-royal shadow-card">
                    <I size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <b className="block font-display text-base font-extrabold text-navy sm:text-lg">{t}</b>
                    <span className="text-sm leading-relaxed text-muted">{d}</span>
                  </span>
                </li>
              );
            })}
          </ul>

          {/* 3-step What Happens Next mini card */}
          <div className="mt-8 rounded-2xl border border-line bg-white/90 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-widest text-royal-700">What happens after you submit</p>
            <ol className="mt-3.5 grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
              {NEXT_STEPS.map(([num, title, desc]) => (
                <li key={num} className="flex items-start gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-mint font-display text-xs font-extrabold text-emerald-ink">
                    {num}
                  </span>
                  <div className="text-xs leading-snug">
                    <b className="block font-bold text-navy">{title}</b>
                    <span className="text-muted">{desc}</span>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </Reveal>

        <Reveal delay={100} className="card overflow-hidden p-0 shadow-lift">
          {/* Branded StayMate Portal Window Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-gradient-to-r from-navy via-[#153a69] to-royal px-5 py-4 text-white sm:px-6">
            <div className="flex items-center gap-3">
              <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white p-1 shadow-sm">
                <Image src="/brand/mark-192.png" alt="" width={64} height={64} className="h-full w-full object-contain" />
              </span>
              <div>
                <h3 className="font-display text-base font-extrabold leading-tight sm:text-lg">
                  Join the StayMate Early-Access List
                </h3>
                <p className="text-xs text-white/80">Official registration · Students, Professionals &amp; Owners</p>
              </div>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald/45 bg-emerald/20 px-3 py-1 text-xs font-bold text-[#6ee7b7]">
              <CheckCircle2 size={13} aria-hidden="true" /> Instant Email Copy
            </span>
          </div>

          <div className="p-4 sm:p-6">
            {safeEmbedUrl && directUrl ? (
              <>
                <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-royal/15 bg-sky/65 px-4 py-2.5 text-xs text-navy/90 sm:text-sm">
                  <span>Complete the form below without leaving this page.</span>
                  <span className="inline-flex items-center gap-1 font-semibold text-royal-700">
                    <LockKeyhole size={14} aria-hidden="true" /> HTTPS Protected
                  </span>
                </div>

                <div className="relative overflow-hidden rounded-2xl border border-line bg-white">
                  {!frameLoaded ? (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-0 z-0 flex flex-col gap-4 bg-white p-6"
                    >
                      <div className="h-5 w-44 animate-pulse rounded-lg bg-sky" />
                      <div className="h-3 w-72 max-w-full animate-pulse rounded bg-sky/70" />
                      <div className="mt-4 h-12 w-full animate-pulse rounded-xl bg-sky/60" />
                      <div className="h-12 w-full animate-pulse rounded-xl bg-sky/60" />
                      <div className="h-24 w-full animate-pulse rounded-xl bg-sky/50" />
                      <div className="h-12 w-40 animate-pulse rounded-full bg-mint" />
                    </div>
                  ) : null}

                  <iframe
                    src={safeEmbedUrl}
                    title="StayMate Early Access registration form"
                    onLoad={() => setFrameLoaded(true)}
                    referrerPolicy="strict-origin-when-cross-origin"
                    className="relative z-10 block h-[920px] w-full border-0 bg-white sm:h-[980px]"
                  >
                    Loading StayMate early-access registration form…
                  </iframe>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-xs text-muted">
                  <span>Hosted securely on Google Forms over HTTPS.</span>
                  <a
                    href={directUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 font-semibold text-royal hover:underline"
                  >
                    Open form in a new tab <ExternalLink size={13} aria-hidden="true" />
                  </a>
                </div>

                <p className="mt-3 text-center text-xs text-muted">
                  No spam. See our{" "}
                  <Link href="/privacy" className="font-semibold text-royal underline underline-offset-4">
                    Privacy Policy
                  </Link>{" "}
                  or{" "}
                  <Link href="/unsubscribe" className="font-semibold text-royal underline underline-offset-4">
                    unsubscribe / manage data
                  </Link>
                  .
                </p>
              </>
            ) : (
              <div className="grid gap-4">
                <div role="status" className="flex gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm font-medium text-amber-900">
                  <AlertTriangle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <p>
                    <b>Registration form isn&apos;t linked yet.</b> Nothing is collected until the embedded registration form is connected. Please check back soon.
                  </p>
                </div>
                <p className="rounded-2xl border border-line bg-sky/45 p-4 text-sm leading-relaxed text-navy/90">
                  Questions about early access or partnership? Write to us at{" "}
                  <a href={`mailto:${contactEmail}`} className="font-semibold text-royal underline underline-offset-4">
                    {contactEmail}
                  </a>
                  . See also our{" "}
                  <Link href="/privacy" className="font-semibold text-royal underline underline-offset-4">
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link href="/terms" className="font-semibold text-royal underline underline-offset-4">
                    Terms
                  </Link>
                  .
                </p>
              </div>
            )}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
