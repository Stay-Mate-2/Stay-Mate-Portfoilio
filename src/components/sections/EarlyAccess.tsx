"use client";

import Link from "next/link";
import { useEffect, useId, useRef, useState, type FormEvent } from "react";
import { AlertTriangle, CheckCircle2, Loader2, LockKeyhole, MailCheck, Send } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Button } from "@/components/ui/Button";
import {
  CATEGORY_LABELS,
  CONSENT_TEXT,
  WAITLIST_CATEGORIES,
  toFieldErrors,
  waitlistFieldsSchema,
  type FieldErrors,
  type WaitlistCategory,
} from "@/lib/waitlist-schema";

type Status =
  | { kind: "idle" }
  | { kind: "submitting" }
  | { kind: "success"; name: string }
  | { kind: "error"; message: string }
  | { kind: "unavailable"; message: string };

const NOT_OPEN = "Early-access registration isn't open yet. Please check back soon — nothing is collected until it opens.";

interface Props {
  /** Build-time flag (NEXT_PUBLIC_WAITLIST_ENABLED). When false the form cannot be submitted. */
  enabled: boolean;
}

export function EarlyAccess({ enabled }: Props) {
  const uid = useId();
  const startedAt = useRef(0);
  const summaryRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<Status>(enabled ? { kind: "idle" } : { kind: "unavailable", message: NOT_OPEN });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [category, setCategory] = useState<WaitlistCategory | "">("");

  useEffect(() => {
    startedAt.current = Date.now();
  }, []);

  const blocked = status.kind === "unavailable";
  const busy = status.kind === "submitting";

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (blocked || busy) return;
    const form = new FormData(e.currentTarget);
    const candidate = {
      name: String(form.get("name") ?? ""),
      email: String(form.get("email") ?? ""),
      category: String(form.get("category") ?? ""),
      city: String(form.get("city") ?? ""),
      consent: form.get("consent") === "on",
    };

    const parsed = waitlistFieldsSchema.safeParse(candidate);
    if (!parsed.success) {
      setErrors(toFieldErrors(parsed.error));
      setStatus({ kind: "idle" });
      requestAnimationFrame(() => summaryRef.current?.focus());
      return;
    }
    setErrors({});
    setStatus({ kind: "submitting" });

    try {
      const res = await fetch("/api/waitlist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...parsed.data,
          company: String(form.get("company") ?? ""),
          startedAt: startedAt.current,
        }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; code?: string; message?: string; fieldErrors?: FieldErrors } | null;

      if (res.ok && data?.ok) {
        setStatus({ kind: "success", name: parsed.data.name.split(" ")[0] ?? "" });
        return;
      }
      if (data?.code === "NOT_CONFIGURED") {
        setStatus({ kind: "unavailable", message: data.message ?? NOT_OPEN });
        return;
      }
      if (data?.fieldErrors) setErrors(data.fieldErrors);
      setStatus({ kind: "error", message: data?.message ?? "Something went wrong. Nothing was saved — please try again." });
      requestAnimationFrame(() => summaryRef.current?.focus());
    } catch {
      setStatus({ kind: "error", message: "We couldn't connect. Check your internet connection — nothing was saved." });
      requestAnimationFrame(() => summaryRef.current?.focus());
    }
  }

  const errorList = Object.values(errors).filter(Boolean);
  const inputCls =
    "mt-1.5 h-12 w-full rounded-xl border bg-white px-4 text-base font-medium text-navy outline-none transition placeholder:text-muted/70 focus:border-royal focus:ring-4 focus:ring-royal/15 disabled:bg-sky/50";

  return (
    <section id="early-access" aria-labelledby="ea-title" className="relative isolate overflow-hidden bg-gradient-to-br from-sky via-white to-mint py-24 sm:py-32">
      <div aria-hidden="true" className="bg-dots absolute inset-0 -z-10 opacity-60" style={{ maskImage: "radial-gradient(ellipse at 20% 30%, #000, transparent 70%)", WebkitMaskImage: "radial-gradient(ellipse at 20% 30%, #000, transparent 70%)" }} />
      <div className="wrap grid items-start gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
        <Reveal className="lg:sticky lg:top-28">
          <p className="eyebrow">Early access</p>
          <h2 id="ea-title" className="mt-4 font-display text-[clamp(2rem,4.6vw,3.3rem)] font-extrabold leading-[1.08]">
            Be part of the next way to <span className="text-gradient">live together.</span>
          </h2>
          <p className="mt-5 max-w-lg text-lg leading-relaxed text-muted">
            StayMate is taking shape. Join the early-access list and be among the first to explore a smarter shared-living experience.
          </p>
          <ul className="mt-8 grid gap-4">
            {[
              [MailCheck, "Hear first", "Updates on progress and launch, sent only to people who opt in."],
              [LockKeyhole, "Minimal data", "Just your name, email and who you are. No phone number, no payment."],
              [CheckCircle2, "Leave any time", "Withdraw consent whenever you like on the unsubscribe page."],
            ].map(([Icon, t, d]) => {
              const I = Icon as typeof MailCheck;
              return (
                <li key={t as string} className="flex gap-4">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-white text-royal shadow-card"><I size={20} aria-hidden="true" /></span>
                  <span>
                    <b className="block font-display text-lg">{t as string}</b>
                    <span className="text-[0.97rem] text-muted">{d as string}</span>
                  </span>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={100} className="card p-6 shadow-lift sm:p-9">
          {status.kind === "success" ? (
            <div role="status" className="py-8 text-center">
              <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-mint text-emerald-ink"><CheckCircle2 size={34} aria-hidden="true" /></span>
              <h3 className="mt-5 font-display text-2xl font-extrabold">Thanks{status.name ? `, ${status.name}` : ""}!</h3>
              <p className="mx-auto mt-3 max-w-sm text-muted">
                If this email can be added, you&apos;ll hear from us as StayMate takes shape. You can withdraw your consent at any time on the{" "}
                <Link href="/unsubscribe" className="font-semibold text-royal underline underline-offset-4">unsubscribe page</Link>.
              </p>
            </div>
          ) : (
            <form onSubmit={onSubmit} noValidate aria-label="Early access registration" className="grid gap-5">
              <h3 className="font-display text-2xl font-extrabold">Join the Early Access List</h3>

              {status.kind === "unavailable" ? (
                <div role="status" className="flex gap-3 rounded-2xl border border-amber-300/60 bg-amber-50 p-4 text-sm font-medium text-amber-900">
                  <AlertTriangle size={20} className="mt-0.5 shrink-0" aria-hidden="true" />
                  <p><b>Registration isn&apos;t open yet.</b> {status.message}</p>
                </div>
              ) : null}

              <div ref={summaryRef} tabIndex={-1} aria-live="assertive" className="outline-none">
                {status.kind === "error" || errorList.length > 0 ? (
                  <div role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-900">
                    {status.kind === "error" ? <p>{status.message}</p> : <p>Please fix the highlighted fields:</p>}
                    {errorList.length > 0 && status.kind !== "error" ? (
                      <ul className="mt-1 list-disc pl-5">
                        {errorList.map((m) => (
                          <li key={m}>{m}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                ) : null}
              </div>

              <fieldset disabled={blocked || busy} className="group grid gap-5 border-0 p-0">
                {/* Honeypot — hidden from people and assistive tech; bots tend to fill it */}
                <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
                  <label htmlFor={`${uid}-company`}>Company (leave empty)</label>
                  <input id={`${uid}-company`} name="company" type="text" tabIndex={-1} autoComplete="off" />
                </div>

                <div>
                  <label htmlFor={`${uid}-name`} className="text-sm font-bold">Name</label>
                  <input id={`${uid}-name`} name="name" type="text" autoComplete="name" required maxLength={80} placeholder="Your name"
                    aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? `${uid}-name-err` : undefined}
                    className={`${inputCls} ${errors.name ? "border-red-400" : "border-line"}`} />
                  {errors.name ? <p id={`${uid}-name-err`} className="mt-1.5 text-sm font-medium text-red-700">{errors.name}</p> : null}
                </div>

                <div>
                  <label htmlFor={`${uid}-email`} className="text-sm font-bold">Email</label>
                  <input id={`${uid}-email`} name="email" type="email" autoComplete="email" inputMode="email" required maxLength={254} placeholder="you@example.com"
                    aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? `${uid}-email-err` : undefined}
                    className={`${inputCls} ${errors.email ? "border-red-400" : "border-line"}`} />
                  {errors.email ? <p id={`${uid}-email-err`} className="mt-1.5 text-sm font-medium text-red-700">{errors.email}</p> : null}
                </div>

                <fieldset aria-describedby={errors.category ? `${uid}-cat-err` : undefined}>
                  <legend className="text-sm font-bold">I am a…</legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {WAITLIST_CATEGORIES.map((c) => (
                      <label key={c} className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-3 py-3 text-center text-sm font-semibold transition-all group-disabled:cursor-not-allowed group-disabled:bg-sky/50 group-disabled:text-muted group-disabled:hover:border-line has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-royal ${
                        category === c ? "border-royal bg-royal text-white shadow-md" : "border-line bg-white text-navy/85 hover:border-royal/50 hover:bg-sky"
                      }`}>
                        <input type="radio" name="category" value={c} checked={category === c} onChange={() => setCategory(c)} className="sr-only" required />
                        {CATEGORY_LABELS[c]}
                      </label>
                    ))}
                  </div>
                  {errors.category ? <p id={`${uid}-cat-err`} className="mt-1.5 text-sm font-medium text-red-700">{errors.category}</p> : null}
                </fieldset>

                <div>
                  <label htmlFor={`${uid}-city`} className="text-sm font-bold">
                    Preferred city <span className="font-medium text-muted">(optional)</span>
                  </label>
                  <input id={`${uid}-city`} name="city" type="text" autoComplete="address-level2" maxLength={60} placeholder="e.g. Indore"
                    aria-invalid={Boolean(errors.city)} aria-describedby={errors.city ? `${uid}-city-err` : undefined}
                    className={`${inputCls} ${errors.city ? "border-red-400" : "border-line"}`} />
                  {errors.city ? <p id={`${uid}-city-err`} className="mt-1.5 text-sm font-medium text-red-700">{errors.city}</p> : null}
                </div>

                <div>
                  <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-line bg-sky/40 p-4 text-sm leading-relaxed text-navy/90 group-disabled:cursor-not-allowed group-disabled:opacity-70">
                    <input name="consent" type="checkbox" required aria-invalid={Boolean(errors.consent)} aria-describedby={errors.consent ? `${uid}-consent-err` : undefined}
                      className="mt-0.5 h-5 w-5 shrink-0 accent-[#1769d2]" />
                    <span>
                      {CONSENT_TEXT} See our{" "}
                      <Link href="/privacy" className="font-semibold text-royal underline underline-offset-4">Privacy Policy</Link>.
                    </span>
                  </label>
                  {errors.consent ? <p id={`${uid}-consent-err`} className="mt-1.5 text-sm font-medium text-red-700">{errors.consent}</p> : null}
                </div>
              </fieldset>

              <Button type="submit" size="lg" className="w-full" disabled={blocked || busy}>
                {busy ? (<><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Joining…</>) : blocked ? "Registration opens soon" : (<>Join the Early Access List <Send size={17} aria-hidden="true" /></>)}
              </Button>
              <p className="text-center text-xs text-muted">
                No spam. We never share your details. <Link href="/unsubscribe" className="font-semibold text-royal underline underline-offset-4">Unsubscribe</Link>
              </p>
            </form>
          )}
        </Reveal>
      </div>
    </section>
  );
}
