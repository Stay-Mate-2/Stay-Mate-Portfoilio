"use client";

import { useId, useMemo, useState } from "react";
import { Label, SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import {
  MAX_AMOUNT,
  MAX_PEOPLE,
  calculateCosts,
  formatINR,
  sanitizeAmount,
  type CostInputs,
  type CostKey,
} from "@/lib/calculator";

const EXAMPLE: CostInputs = { rent: 15000, deposit: 30000, electricity: 1200, internet: 800, groceries: 3000, other: 600, food: 3500, people: 3 };

const FIELDS: { key: keyof Omit<CostInputs, "people">; label: string; hint: string; max: number; step: number }[] = [
  { key: "rent", label: "Monthly rent (whole place)", hint: "Total rent for the room, PG bed or flat", max: 60000, step: 500 },
  { key: "deposit", label: "Security deposit (one-time)", hint: "Paid upfront", max: 120000, step: 1000 },
  { key: "electricity", label: "Electricity & water", hint: "Per month, whole place", max: 6000, step: 100 },
  { key: "internet", label: "Internet", hint: "Per month, whole place", max: 3000, step: 50 },
  { key: "groceries", label: "Shared groceries", hint: "Per month, whole place", max: 15000, step: 250 },
  { key: "other", label: "Other shared expenses", hint: "Cleaning, supplies, maid…", max: 8000, step: 100 },
  { key: "food", label: "Your own food", hint: "Mess / tiffin / cooking, per person", max: 12000, step: 250 },
];

const COLORS: Record<CostKey, string> = {
  rent: "#1769d2",
  electricity: "#16a765",
  internet: "#4aa3ff",
  groceries: "#102c50",
  other: "#8fb7ee",
  food: "#6bd89d",
};

export function Affordability() {
  const [values, setValues] = useState<CostInputs>(EXAMPLE);
  const uid = useId();
  const r = useMemo(() => calculateCosts(values), [values]);
  const setField = (k: keyof CostInputs, v: number) => setValues((s) => ({ ...s, [k]: v }));
  const total = r.breakdown.reduce((s, b) => s + b.perPerson, 0) || 1;
  const rentOnly = values.rent / r.people;

  return (
    <section id="affordability" aria-labelledby="afford-title" className="bg-mint/60 py-24 sm:py-32">
      <div className="wrap">
        <SectionHeading id="afford-title" eyebrow="Affordable living" title={<>Know the <span className="text-gradient">real cost</span> before you move in.</>}>
          Rent is only the start. Add the everyday costs, choose how many people are sharing, and see your estimated monthly share.
        </SectionHeading>

        <Reveal className="card mt-14 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-sky/60 px-6 py-4 sm:px-8">
            <p className="font-display text-lg font-bold">Shared-living cost calculator</p>
            <div className="flex flex-wrap gap-2">
              <Label tone="amber">Example values — change them</Label>
              <button
                type="button"
                onClick={() => setValues(EXAMPLE)}
                className="rounded-full border border-line bg-white px-3 py-1 text-xs font-bold text-navy transition-colors hover:border-royal/40 hover:bg-sky"
              >
                Reset
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-[1.2fr_1fr]">
            <form className="grid gap-5 p-6 sm:grid-cols-2 sm:p-8" onSubmit={(e) => e.preventDefault()} aria-label="Cost inputs">
              <div className="sm:col-span-2">
                <label htmlFor={`${uid}-people`} className="flex items-baseline justify-between text-sm font-bold">
                  <span>People sharing</span>
                  <output className="font-display text-lg text-royal">{r.people}</output>
                </label>
                <input
                  id={`${uid}-people`}
                  type="range"
                  className="range mt-3"
                  min={1}
                  max={MAX_PEOPLE}
                  step={1}
                  value={values.people}
                  style={{ ["--fill" as string]: `${((values.people - 1) / (MAX_PEOPLE - 1)) * 100}%` }}
                  onChange={(e) => setField("people", Number(e.target.value))}
                />
              </div>

              {FIELDS.map((f) => (
                <div key={f.key}>
                  <label htmlFor={`${uid}-${f.key}`} className="text-sm font-bold">
                    {f.label}
                  </label>
                  <div className="mt-1.5 flex h-12 items-center rounded-xl border border-line bg-white px-3 focus-within:border-royal focus-within:ring-4 focus-within:ring-royal/15">
                    <span aria-hidden="true" className="pr-1.5 font-semibold text-muted">₹</span>
                    <input
                      id={`${uid}-${f.key}`}
                      type="number"
                      inputMode="numeric"
                      min={0}
                      max={MAX_AMOUNT}
                      step={f.step}
                      value={values[f.key]}
                      aria-describedby={`${uid}-${f.key}-hint`}
                      onChange={(e) => setField(f.key, sanitizeAmount(e.target.value))}
                      className="h-full w-full bg-transparent text-base font-semibold text-navy outline-none"
                    />
                  </div>
                  <input
                    aria-label={`${f.label} slider`}
                    type="range"
                    className="range mt-3"
                    min={0}
                    max={f.max}
                    step={f.step}
                    value={Math.min(values[f.key], f.max)}
                    style={{ ["--fill" as string]: `${(Math.min(values[f.key], f.max) / f.max) * 100}%` }}
                    onChange={(e) => setField(f.key, Number(e.target.value))}
                  />
                  <p id={`${uid}-${f.key}-hint`} className="mt-1 text-xs text-muted">{f.hint}</p>
                </div>
              ))}
            </form>

            <div className="border-t border-line bg-gradient-to-b from-sky/50 to-mint/60 p-6 sm:p-8 lg:border-l lg:border-t-0" aria-live="polite">
              <p className="text-sm font-bold text-muted">Estimated monthly cost per person</p>
              <p className="mt-1 font-display text-5xl font-extrabold tabular-nums text-navy sm:text-6xl">{formatINR(r.perPersonMonthly)}</p>
              <p className="mt-2 text-sm text-muted">
                Rent alone would be <b className="text-navy">{formatINR(rentOnly)}</b> each — the true monthly cost is{" "}
                <b className="text-emerald-ink">{formatINR(Math.max(0, r.perPersonMonthly - rentOnly))} more</b>.
              </p>

              <div className="slab-3d mt-6 flex h-5 overflow-hidden rounded-full border border-white bg-white" role="img" aria-label="Share of each cost in your monthly total">
                {r.breakdown.map((b) => (
                  <span key={b.key} title={`${b.label}: ${formatINR(b.perPerson)}`} className="h-full transition-all duration-500" style={{ width: `${(b.perPerson / total) * 100}%`, background: COLORS[b.key] }} />
                ))}
              </div>

              <table className="mt-5 w-full text-sm">
                <caption className="sr-only">Your monthly share by category</caption>
                <tbody>
                  {r.breakdown.map((b) => (
                    <tr key={b.key} className="border-b border-line/70 last:border-0">
                      <th scope="row" className="flex items-center gap-2.5 py-2 text-left font-semibold text-navy/85">
                        <span aria-hidden="true" className="h-3 w-3 rounded" style={{ background: COLORS[b.key] }} />
                        {b.label}
                      </th>
                      <td className="py-2 text-right font-bold tabular-nums">{formatINR(b.perPerson)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <dl className="mt-6 grid grid-cols-2 gap-3">
                <div className="slab-3d rounded-2xl border border-white bg-white p-4">
                  <dt className="text-xs font-bold text-muted">Whole household / month</dt>
                  <dd className="mt-1 font-display text-xl font-extrabold tabular-nums">{formatINR(r.householdMonthly)}</dd>
                </div>
                <div className="slab-3d rounded-2xl border border-white bg-white p-4">
                  <dt className="text-xs font-bold text-muted">Deposit share (one-time)</dt>
                  <dd className="mt-1 font-display text-xl font-extrabold tabular-nums">{formatINR(r.depositPerPerson)}</dd>
                </div>
                <div className="slab-3d-royal col-span-2 rounded-2xl bg-gradient-to-r from-navy to-[#183f72] p-4 text-white">
                  <dt className="text-xs font-bold text-white/70">Cash needed in month one, per person</dt>
                  <dd className="mt-1 font-display text-2xl font-extrabold tabular-nums">{formatINR(r.firstMonthPerPerson)}</dd>
                </div>
              </dl>
            </div>
          </div>
          <p className="border-t border-line bg-white px-6 py-4 text-xs leading-relaxed text-muted sm:px-8">
            Estimates only — calculated in your browser from the values you enter. Sample amounts are not verified property prices, and nothing you type is sent or stored.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
