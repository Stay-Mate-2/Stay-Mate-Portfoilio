"use client";

import { useId, useRef, useState, type FormEvent } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { unsubscribeRequestSchema } from "@/lib/waitlist-schema";

type State = { kind: "idle" } | { kind: "busy" } | { kind: "done" } | { kind: "error"; message: string };

export function UnsubscribeForm() {
  const id = useId();
  const [state, setState] = useState<State>({ kind: "idle" });
  const [fieldError, setFieldError] = useState<string>();
  const errRef = useRef<HTMLParagraphElement>(null);

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const parsed = unsubscribeRequestSchema.safeParse({ email: String(fd.get("email") ?? "") });
    if (!parsed.success) {
      setFieldError(parsed.error.issues[0]?.message ?? "Please enter a valid email address.");
      return;
    }
    setFieldError(undefined);
    setState({ kind: "busy" });
    try {
      const res = await fetch("/api/waitlist/unsubscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: parsed.data.email, company: String(fd.get("company") ?? "") }),
      });
      const data = (await res.json().catch(() => null)) as { ok?: boolean; message?: string } | null;
      if (res.ok && data?.ok) setState({ kind: "done" });
      else setState({ kind: "error", message: data?.message ?? "Something went wrong. Please try again." });
    } catch {
      setState({ kind: "error", message: "We couldn't connect. Please check your connection and try again." });
    }
  }

  if (state.kind === "done") {
    return (
      <div role="status" className="py-6 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-mint text-emerald-ink"><CheckCircle2 size={30} aria-hidden="true" /></span>
        <p className="mt-4 font-display text-xl font-extrabold">Request received</p>
        <p className="mt-2 text-muted">If that email was on the early-access list, it has been removed from future communication.</p>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} noValidate className="grid gap-4">
      <div aria-hidden="true" className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label htmlFor={`${id}-co`}>Company</label>
        <input id={`${id}-co`} name="company" tabIndex={-1} autoComplete="off" />
      </div>
      <div>
        <label htmlFor={`${id}-email`} className="text-sm font-bold">Email address</label>
        <input
          id={`${id}-email`}
          name="email"
          type="email"
          autoComplete="email"
          required
          maxLength={254}
          aria-invalid={Boolean(fieldError)}
          aria-describedby={fieldError ? `${id}-err` : undefined}
          placeholder="you@example.com"
          className={`mt-1.5 h-12 w-full rounded-xl border bg-white px-4 font-medium outline-none transition focus:border-royal focus:ring-4 focus:ring-royal/15 ${fieldError ? "border-red-400" : "border-line"}`}
        />
        {fieldError ? <p id={`${id}-err`} ref={errRef} className="mt-1.5 text-sm font-medium text-red-700">{fieldError}</p> : null}
      </div>
      {state.kind === "error" ? <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-medium text-red-900">{state.message}</p> : null}
      <Button type="submit" size="lg" disabled={state.kind === "busy"}>
        {state.kind === "busy" ? (<><Loader2 size={18} className="animate-spin" aria-hidden="true" /> Working…</>) : "Withdraw my consent"}
      </Button>
    </form>
  );
}
