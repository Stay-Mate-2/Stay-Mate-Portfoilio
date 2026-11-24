"use client";

import { useId, useState } from "react";
import { Check, Copy, Mail } from "lucide-react";
import { contactEmail } from "@/lib/site";

type RequestType = "marketing" | "delete";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function UnsubscribeForm() {
  const id = useId();
  const [email, setEmail] = useState("");
  const [requestType, setRequestType] = useState<RequestType>("marketing");
  const [touchedError, setTouchedError] = useState<string>();
  const [copied, setCopied] = useState(false);

  const trimmedEmail = email.trim();
  const validEmail = EMAIL_RE.test(trimmedEmail);

  const subject =
    requestType === "delete"
      ? "StayMate Early Access — Delete My Registration Data"
      : "StayMate Early Access — Withdraw Marketing Updates";

  const bodyLines = [
    "Hello StayMate team,",
    "",
    requestType === "delete"
      ? "Please permanently remove my early-access registration record from your Google Sheet."
      : "Please stop sending me optional product updates and set my marketing permission to withdrawn.",
    ...(validEmail ? [`Registered email: ${trimmedEmail}`] : ["Registered email: [enter the email you registered with]"]),
    "",
    "Thank you.",
  ];

  const mailtoHref = `mailto:${contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(bodyLines.join("\n"))}`;

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(contactEmail);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopied(false);
    }
  }

  return (
    <div className="grid gap-5">
      <fieldset>
        <legend className="text-sm font-bold text-navy">What would you like to do?</legend>
        <div className="mt-2 grid gap-2 sm:grid-cols-2">
          {[
            { value: "marketing" as const, label: "Stop marketing updates" },
            { value: "delete" as const, label: "Delete my registration" },
          ].map((opt) => (
            <label
              key={opt.value}
              className={`flex min-h-12 cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-center text-sm font-semibold transition-all has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-royal ${
                requestType === opt.value
                  ? "border-royal bg-royal text-white shadow-md"
                  : "border-line bg-white text-navy/85 hover:border-royal/50 hover:bg-sky"
              }`}
            >
              <input
                type="radio"
                name="requestType"
                value={opt.value}
                checked={requestType === opt.value}
                onChange={() => setRequestType(opt.value)}
                className="sr-only"
              />
              {opt.label}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${id}-email`} className="text-sm font-bold text-navy">
          Registered email address <span className="font-medium text-muted">(helps pre-fill your message)</span>
        </label>
        <input
          id={`${id}-email`}
          type="email"
          autoComplete="email"
          maxLength={254}
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            if (touchedError) setTouchedError(undefined);
          }}
          onBlur={() => {
            if (trimmedEmail && !validEmail) {
              setTouchedError("Please enter a valid email address.");
            }
          }}
          placeholder="you@example.com"
          aria-invalid={Boolean(touchedError)}
          aria-describedby={touchedError ? `${id}-err` : undefined}
          className={`mt-1.5 h-12 w-full rounded-xl border bg-white px-4 font-medium outline-none transition focus:border-royal focus:ring-4 focus:ring-royal/15 ${
            touchedError ? "border-red-400" : "border-line"
          }`}
        />
        {touchedError ? (
          <p id={`${id}-err`} className="mt-1.5 text-sm font-medium text-red-700">
            {touchedError}
          </p>
        ) : null}
      </div>

      <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
        <a
          href={mailtoHref}
          className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full bg-royal px-6 font-display text-base font-semibold text-white shadow-[0_6px_18px_-4px_rgb(23_105_210_/_0.5)] transition hover:bg-royal-700 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-royal"
        >
          <Mail size={18} aria-hidden="true" />
          Email StayMate
        </a>

        <button
          type="button"
          onClick={copyAddress}
          className="inline-flex h-12 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-line bg-white px-5 text-sm font-semibold text-navy transition hover:border-royal/40 hover:bg-sky focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-[3px] focus-visible:outline-royal"
        >
          {copied ? <Check size={16} className="text-emerald-ink" aria-hidden="true" /> : <Copy size={16} aria-hidden="true" />}
          {copied ? "Copied email" : "Copy address"}
        </button>
      </div>

      <div className="rounded-2xl border border-line bg-sky/45 p-4 text-sm leading-relaxed text-navy/90">
        <p>
          <strong>Send from your registered email:</strong> Write to{" "}
          <a href={`mailto:${contactEmail}`} className="font-semibold text-royal underline underline-offset-4">
            {contactEmail}
          </a>{" "}
          from the address you used in the form so we can verify ownership and update or permanently delete your row within{" "}
          <strong>7 days</strong>.
        </p>
      </div>
    </div>
  );
}
