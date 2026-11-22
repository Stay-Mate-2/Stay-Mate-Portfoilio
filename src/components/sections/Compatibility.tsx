"use client";

import { useMemo, useState } from "react";
import { CheckCircle2, MessageCircleQuestion } from "lucide-react";
import { Label, SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { FACTORS, SAMPLE_PROFILE, scoreCompatibility, type FactorKey, type Selection } from "@/lib/compat-demo";

const YOU_START: Selection = { budget: 1, cleanliness: 2, sleep: 0, lifestyle: 0, food: 0, study: 0, noise: 0 };

export function Compatibility() {
  const [you, setYou] = useState<Selection>(YOU_START);
  const result = useMemo(() => scoreCompatibility(you, SAMPLE_PROFILE), [you]);
  const set = (k: FactorKey, v: number) => setYou((s) => ({ ...s, [k]: v }));

  const tone = result.score >= 80 ? "var(--color-emerald)" : result.score >= 60 ? "var(--color-royal)" : "#f59e0b";

  return (
    <section id="compatibility" aria-labelledby="compat-title" className="bg-white py-24 sm:py-32">
      <div className="wrap">
        <SectionHeading id="compat-title" eyebrow="Roommate compatibility" title={<>More than a roommate. <span className="text-gradient">A lifestyle match.</span></>}>
          StayMate looks at how you actually live — budget, cleanliness, sleep, food, study routine and noise — and shows <em>why</em> two people might live well together. No random recommendations.
        </SectionHeading>

        <Reveal className="card mt-14 overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line bg-sky/60 px-6 py-4 sm:px-8">
            <p className="font-display text-lg font-bold">Try it: set your preferences</p>
            <Label tone="amber">Illustrative demo — sample profile &amp; score</Label>
          </div>

          <div className="grid gap-0 lg:grid-cols-[1.25fr_1fr]">
            {/* Inputs */}
            <form className="grid gap-6 p-6 sm:p-8" onSubmit={(e) => e.preventDefault()} aria-label="Your lifestyle preferences">
              {FACTORS.map((f) => (
                <fieldset key={f.key}>
                  <legend className="mb-2.5 flex w-full items-baseline justify-between text-sm font-bold text-navy">
                    <span>{f.label}</span>
                    <span className="text-xs font-semibold text-muted">
                      Sample match: <span className="text-royal-700">{f.options[SAMPLE_PROFILE[f.key]]}</span>
                    </span>
                  </legend>
                  <div className="flex flex-wrap gap-2">
                    {f.options.map((opt, i) => {
                      const on = you[f.key] === i;
                      return (
                        <label
                          key={opt}
                          className={`cursor-pointer rounded-full border px-4 py-2 text-sm font-semibold transition-all has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-royal ${
                            on ? "border-royal bg-royal text-white shadow-md" : "border-line bg-white text-navy/80 hover:border-royal/50 hover:bg-sky"
                          }`}
                        >
                          <input type="radio" name={f.key} value={i} checked={on} onChange={() => set(f.key, i)} className="sr-only" />
                          {opt}
                        </label>
                      );
                    })}
                  </div>
                </fieldset>
              ))}
            </form>

            {/* Result */}
            <div className="border-t border-line bg-gradient-to-b from-sky/50 to-mint/50 p-6 sm:p-8 lg:border-l lg:border-t-0" aria-live="polite">
              <div className="flex items-center gap-5">
                <div
                  className="relative grid h-28 w-28 shrink-0 place-items-center rounded-full shadow-[0_18px_36px_-14px_rgba(23,105,210,0.45)] ring-4 ring-white"
                  style={{ background: `conic-gradient(${tone} ${result.score}%, #dbe4f0 0)` }}
                  role="img"
                  aria-label={`Illustrative compatibility score ${result.score} percent`}
                >
                  <span className="absolute inset-2.5 rounded-full bg-white shadow-inner" />
                  <span className="relative font-display text-3xl font-extrabold text-navy">{result.score}%</span>
                </div>
                <div>
                  <p className="font-display text-xl font-extrabold text-navy">{result.verdict}</p>
                  <p className="mt-1 text-sm text-muted">You &amp; “Aarav” (sample profile)</p>
                </div>
              </div>

              <ul className="mt-7 grid gap-2.5" aria-label="Score by factor">
                {result.factors.map((f) => (
                  <li key={f.key} className="grid grid-cols-[7.5rem_1fr_2.5rem] items-center gap-3 text-xs font-semibold text-navy/80 sm:grid-cols-[9rem_1fr_2.5rem]">
                    <span className="truncate">{f.label}</span>
                    <span className="h-2 overflow-hidden rounded-full bg-white">
                      <span className="block h-full rounded-full bg-gradient-to-r from-royal to-emerald transition-all duration-500" style={{ width: `${Math.round(f.similarity * 100)}%` }} />
                    </span>
                    <span className="text-right tabular-nums text-muted">{Math.round(f.similarity * 100)}%</span>
                  </li>
                ))}
              </ul>

              <div className="mt-7 grid gap-5 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-emerald-ink">
                    <CheckCircle2 size={17} aria-hidden="true" /> Why you might click
                  </h3>
                  <ul className="mt-2 grid gap-1 text-sm text-navy/85">
                    {result.alignments.length ? result.alignments.map((f) => <li key={f.key}>{f.label}: {f.yours === f.theirs ? `both ${f.yours.toLowerCase()}` : `${f.yours} ↔ ${f.theirs}`}</li>) : <li>No strong overlaps yet.</li>}
                  </ul>
                </div>
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-bold text-royal-700">
                    <MessageCircleQuestion size={17} aria-hidden="true" /> Worth talking about
                  </h3>
                  <ul className="mt-2 grid gap-1 text-sm text-navy/85">
                    {result.differences.length ? result.differences.map((f) => <li key={f.key}>{f.label}: {f.yours} ↔ {f.theirs}</li>) : <li>Nothing major — nice!</li>}
                  </ul>
                </div>
              </div>
            </div>
          </div>
          <p className="border-t border-line bg-white px-6 py-4 text-xs leading-relaxed text-muted sm:px-8">
            This is a simplified demonstration of the idea. The sample profile and every score here are illustrative — they are not real people or real matches, and
            this demo isn&apos;t the app&apos;s matching engine. Your selections stay in your browser.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
