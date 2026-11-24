"use client";

import Link from "next/link";
import { useState } from "react";
import { AlertTriangle, CheckCircle2, ExternalLink, LockKeyhole, MailCheck } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { normalizeGoogleFormEmbedUrl, toGoogleFormDirectUrl } from "@/lib/google-form";
import { contactEmail } from "@/lib/site";

interface Props {
  /** Public Google Form responder link (`docs.google.com/forms/.../viewform`). */
  embedUrl?: string;
}

export function EarlyAccess({ embedUrl }: Props) {
  const safeEmbedUrl = normalizeGoogleFormEmbedUrl(embedUrl);
  const directUrl = safeEmbedUrl ? toGoogleFormDirectUrl(safeEmbedUrl) : undefined;
  const [frameLoaded, setFrameLoaded] = useState(false);

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
          <p className="eyebrow">Early access</p>
          <h2 id="ea-title" className="mt-4 font-display text-[clamp(2rem,4.6vw,3.3rem)] font-extrabold leading-[1.08]">
            Be part of the next way to <span className="text-gradient">live together.</span>
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            StayMate is taking shape. Join the early-access list right here and get automatic email confirmation of your registration.
          </p>
          <ul className="mt-8 grid gap-4">
            {[
              [MailCheck, "Instant email copy", "Google Forms automatically emails a confirmation copy to the address you enter, and updates are only sent if you opt in."],
              [LockKeyhole, "Minimal data", "Just your email, name, and who you are. No phone number, no government ID, no payment."],
              [CheckCircle2, "Leave any time", "Opt out of updates or ask us to delete your entry whenever you like on the unsubscribe page."],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof MailCheck;
              return (
                <li key={t as string} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-royal shadow-card">
                    <I size={20} aria-hidden="true" />
                  </span>
                  <span>
                    <b className="block font-display text-lg">{t as string}</b>
                    <span className="text-[0.97rem] text-muted">{d as string}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={100} className="card p-4 shadow-lift sm:p-6">
          <h3 className="font-display text-2xl font-extrabold">Join the Early Access List</h3>

          {safeEmbedUrl && directUrl ? (
            <>
              <p className="mt-2 text-sm text-muted">
                Fill in the form below without leaving this page. A confirmation copy will be sent to your email once you submit.
              </p>

              <div className="relative mt-5 overflow-hidden rounded-2xl border border-line bg-white">
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
                  className="relative z-10 block h-[920px] w-full border-0 bg-transparent sm:h-[980px]"
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
            <div className="mt-5 grid gap-4">
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
        </Reveal>
      </div>
    </section>
  );
}
