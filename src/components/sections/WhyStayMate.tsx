import { ArrowRight, CheckCircle2, Filter, ShieldAlert, Sparkles, UsersRound, XCircle } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollMotion3D } from "@/components/ui/ScrollMotion3D";
import { Label, SectionHeading } from "@/components/ui/SectionHeading";
import { Tilt3D } from "@/components/ui/Tilt3D";

const OLD_WAY = [
  {
    title: "Guessing compatibility with strangers",
    detail: "You only find out about late-night noise, smoking, or food clashes after paying a heavy deposit.",
  },
  {
    title: "Headline rent hides the real monthly bill",
    detail: "Deposits, electricity, Wi-Fi, groceries, and broker charges quietly push costs far past your budget.",
  },
  {
    title: "Public group chats expose your phone number",
    detail: "Posting in Facebook, Telegram, or WhatsApp groups invites spam calls and unverified middlemen.",
  },
  {
    title: "Property owners waste hours on mismatched leads",
    detail: "Answering repetitive calls and giving out exact street addresses before knowing if a seeker fits.",
  },
] as const;

const STAYMATE_WAY = [
  {
    title: "Hard deal-breakers & 8-factor fit checked first",
    detail: "See why you click—and what to talk about—across budget, cleanliness, sleep, food, and routine before moving in.",
  },
  {
    title: "Upfront rent, deposit & real monthly share",
    detail: "Every listing separates monthly rent from security deposit, paired with an interactive real-cost estimator.",
  },
  {
    title: "Private in-app chat & moderated spaces",
    detail: "Connect inside StayMate with 1-tap block/report tools while your phone number stays completely hidden.",
  },
  {
    title: "Owner-controlled enquiries & address privacy",
    detail: "Listings are reviewed before going live, and exact street addresses unlock only when an owner approves an enquiry.",
  },
] as const;

const ENGINE_WEIGHTS = [
  { label: "Budget Overlap", weight: 20, color: "bg-royal" },
  { label: "Cleanliness", weight: 15, color: "bg-emerald" },
  { label: "Sleep Schedule", weight: 15, color: "bg-[#2d82ef]" },
  { label: "Lifestyle Rhythm", weight: 15, color: "bg-[#1ec278]" },
  { label: "Food Habits", weight: 10, color: "bg-navy" },
  { label: "Guest Policy", weight: 10, color: "bg-[#4aa3ff]" },
  { label: "Study / Work Mode", weight: 10, color: "bg-[#0b7a47]" },
  { label: "Noise & Privacy", weight: 5, color: "bg-[#64748b]" },
] as const;

export function WhyStayMate() {
  return (
    <section id="why-staymate" aria-labelledby="why-title" className="relative overflow-hidden bg-gradient-to-b from-white via-sky/45 to-white py-24 sm:py-32">
      <div className="wrap">
        <SectionHeading
          id="why-title"
          eyebrow="Why StayMate exists"
          align="center"
          title={
            <>
              Stop settling for chaotic house-hunting. <span className="text-gradient">Upgrade how you share a home.</span>
            </>
          }
        >
          Here is what changes when one platform connects the right people, transparent places, and honest monthly numbers.
        </SectionHeading>

        {/* Old Way vs StayMate Way Comparison */}
        <ScrollMotion3D maxRotateX={2.8} maxShiftY={-8} maxPushZ={-12}>
          <div className="mt-14 grid gap-6 lg:grid-cols-2 lg:gap-8">
            {/* Old Way */}
            <Reveal className="h-full">
              <div className="card h-full border-line bg-white/90 p-7 sm:p-9">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-5">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-muted">Today&apos;s broken search</p>
                    <h3 className="mt-1 font-display text-2xl font-extrabold text-navy">Random Groups &amp; Brokers</h3>
                  </div>
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-red-200 bg-red-50 px-3 py-1 text-xs font-bold text-red-800">
                    <ShieldAlert size={14} aria-hidden="true" /> High friction
                  </span>
                </div>

                <ul className="mt-6 grid gap-5">
                  {OLD_WAY.map((item) => (
                    <li key={item.title} className="flex items-start gap-3.5">
                      <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-red-50 text-red-600">
                        <XCircle size={18} aria-hidden="true" />
                      </span>
                      <div>
                        <b className="block font-display text-base font-bold text-navy">{item.title}</b>
                        <p className="mt-1 text-sm leading-relaxed text-muted">{item.detail}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>

            {/* StayMate Way */}
            <Reveal delay={100} className="h-full">
              <Tilt3D
                tone="dark"
                maxTilt={5}
                className="relative h-full overflow-hidden rounded-3xl border border-royal/30 bg-gradient-to-br from-navy via-[#133968] to-[#0d2544] p-7 text-white shadow-lift sm:p-9"
              >
                <div aria-hidden="true" className="pointer-events-none absolute -right-20 -top-20 h-64 w-64 rounded-full bg-emerald/25 blur-3xl" />
                <div className="preserve-3d relative flex h-full flex-col">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/15 pb-5">
                    <div>
                      <p className="text-xs font-bold uppercase tracking-widest text-[#6ee7b7]">What we&apos;re building</p>
                      <h3 className="mt-1 font-display text-2xl font-extrabold text-white">The StayMate Experience</h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald/40 bg-emerald/20 px-3 py-1 text-xs font-bold text-[#6ee7b7]">
                      <Sparkles size={14} aria-hidden="true" /> Built for clarity
                    </span>
                  </div>

                  <ul className="mt-6 grid gap-5">
                    {STAYMATE_WAY.map((item) => (
                      <li key={item.title} className="flex items-start gap-3.5">
                        <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-full bg-emerald/20 text-[#6ee7b7]">
                          <CheckCircle2 size={18} aria-hidden="true" />
                        </span>
                        <div>
                          <b className="block font-display text-base font-bold text-white">{item.title}</b>
                          <p className="mt-1 text-sm leading-relaxed text-white/80">{item.detail}</p>
                        </div>
                      </li>
                    ))}
                  </ul>

                  <div className="mt-8 pt-2">
                    <ButtonLink href="#early-access" variant="light" className="slab-3d w-full sm:w-auto">
                      Join the Early-Access List <ArrowRight size={17} aria-hidden="true" />
                    </ButtonLink>
                  </div>
                </div>
              </Tilt3D>
            </Reveal>
          </div>
        </ScrollMotion3D>

        {/* Real 8-Factor Compatibility Engine Blueprint */}
        <Reveal delay={140} className="card mt-10 overflow-hidden p-6 sm:p-9">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Under the hood</p>
              <h3 className="mt-2 font-display text-2xl font-extrabold text-navy">
                Powered by an explainable 8-factor compatibility engine
              </h3>
              <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted">
                No black-box swiping. StayMate scores compatibility using transparent weights and shows you both where you align and what to discuss before committing.
              </p>
            </div>
            <Label tone="green">Engineered in the pilot build</Label>
          </div>

          {/* Segmented proportional bar */}
          <div
            role="img"
            aria-label="Compatibility engine weights totaling 100 percent across 8 lifestyle factors"
            className="slab-3d mt-6 flex h-4 w-full overflow-hidden rounded-full border border-white bg-sky"
          >
            {ENGINE_WEIGHTS.map((w) => (
              <span
                key={w.label}
                title={`${w.label}: ${w.weight}%`}
                style={{ width: `${w.weight}%` }}
                className={`${w.color} h-full border-r border-white/40 last:border-r-0`}
              />
            ))}
          </div>

          {/* Factor chips */}
          <ul className="mt-5 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
            {ENGINE_WEIGHTS.map((w) => (
              <li
                key={w.label}
                className="flex items-center justify-between rounded-xl border border-line bg-sky/35 px-3.5 py-2.5 text-sm"
              >
                <span className="flex items-center gap-2 font-semibold text-navy">
                  <span aria-hidden="true" className={`h-2.5 w-2.5 shrink-0 rounded-full ${w.color}`} />
                  {w.label}
                </span>
                <span className="font-display font-extrabold tabular-nums text-royal-700">{w.weight}%</span>
              </li>
            ))}
          </ul>

          {/* 3 Engine Guardrails */}
          <div className="mt-6 grid gap-3 border-t border-line pt-6 sm:grid-cols-3">
            {[
              [
                Filter,
                "Hard deal-breakers first",
                "Strict budget cap, non-smoker, veg-only, and move-in overlap filters run before any score is shown.",
              ],
              [
                Sparkles,
                "50% minimum profile guard",
                "Never guesses from empty profiles—at least half of total factor weight must be answered first.",
              ],
              [
                UsersRound,
                "Multi-roommate group check",
                "Pairwise compatibility flags household conflicts when 3 or more flatmates plan to share together.",
              ],
            ].map(([Icon, title, desc]) => {
              const I = Icon as typeof Filter;
              return (
                <div key={title as string} className="flex items-start gap-3 rounded-2xl bg-mint/45 p-4">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-white text-emerald-ink shadow-sm">
                    <I size={18} aria-hidden="true" />
                  </span>
                  <div>
                    <b className="block text-sm font-bold text-navy">{title as string}</b>
                    <p className="mt-0.5 text-xs leading-relaxed text-muted">{desc as string}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
