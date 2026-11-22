"use client";

import { useId, useMemo, useState } from "react";
import { BellRing, Calculator, ShoppingBasket, Split, TrendingUp } from "lucide-react";
import { Label, SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { formatINR } from "@/lib/calculator";

const GROCERIES = ["Rice & atta", "Milk", "Vegetables", "Cooking oil", "Detergent"];

export function SharedLiving() {
  const uid = useId();
  const [amount, setAmount] = useState(1800);
  const [people, setPeople] = useState(3);
  const [checked, setChecked] = useState<Record<string, boolean>>({ Milk: true });
  const share = useMemo(() => Math.round(Math.max(0, amount) / people), [amount, people]);
  const pending = GROCERIES.filter((g) => !checked[g]).length;

  return (
    <section id="shared-living" aria-labelledby="shared-title" className="bg-sky py-24 sm:py-32">
      <div className="wrap">
        <SectionHeading id="shared-title" eyebrow="Shared living" title={<>Sharing a home should make life <span className="text-gradient">easier, not more complicated.</span></>}>
          Splitting costs, keeping the kitchen stocked and remembering bills — all the small things that cause big arguments, made simple.
        </SectionHeading>

        <p className="mt-6">
          <Label tone="amber">Planned — expense tools are still in design. These are interactive concepts, not live features.</Label>
        </p>

        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {/* Expense splitting */}
          <Reveal className="card hover-lift p-6 sm:p-8">
            <h3 className="flex items-center gap-3 font-display text-xl font-bold">
              <span className="slab-3d-royal grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#2d82ef] to-royal text-white"><Split size={20} aria-hidden="true" /></span>
              Split an expense
            </h3>
            <div className="mt-6 grid grid-cols-2 gap-4">
              <div>
                <label htmlFor={`${uid}-amt`} className="text-sm font-bold">Amount paid</label>
                <div className="mt-1.5 flex h-12 items-center rounded-xl border border-line bg-white px-3 focus-within:border-royal focus-within:ring-4 focus-within:ring-royal/15">
                  <span aria-hidden="true" className="pr-1.5 font-semibold text-muted">₹</span>
                  <input
                    id={`${uid}-amt`}
                    type="number"
                    inputMode="numeric"
                    min={0}
                    max={1000000}
                    value={amount}
                    onChange={(e) => setAmount(Math.min(1000000, Math.max(0, Math.floor(Number(e.target.value) || 0))))}
                    className="h-full w-full bg-transparent font-semibold outline-none"
                  />
                </div>
              </div>
              <div>
                <label htmlFor={`${uid}-ppl`} className="text-sm font-bold">Split between</label>
                <select
                  id={`${uid}-ppl`}
                  value={people}
                  onChange={(e) => setPeople(Number(e.target.value))}
                  className="mt-1.5 h-12 w-full rounded-xl border border-line bg-white px-3 font-semibold outline-none focus:border-royal focus:ring-4 focus:ring-royal/15"
                >
                  {[2, 3, 4, 5, 6].map((n) => (
                    <option key={n} value={n}>{n} people</option>
                  ))}
                </select>
              </div>
            </div>
            <p className="slab-3d mt-6 rounded-2xl border border-emerald/20 bg-mint p-5 text-emerald-ink" aria-live="polite">
              <span className="block text-sm font-bold">Everyone else owes you</span>
              <span className="font-display text-4xl font-extrabold tabular-nums">{formatINR(share)}</span>
              <span className="ml-2 text-sm font-semibold">each</span>
            </p>
          </Reveal>

          {/* Grocery list */}
          <Reveal delay={90} className="card hover-lift p-6 sm:p-8">
            <h3 className="flex items-center gap-3 font-display text-xl font-bold">
              <span className="slab-3d-emerald grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#26c47c] to-emerald text-navy"><ShoppingBasket size={20} aria-hidden="true" /></span>
              Shared grocery list
            </h3>
            <ul className="mt-5 grid gap-2">
              {GROCERIES.map((g) => (
                <li key={g}>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-line px-4 py-3 text-[0.97rem] font-semibold transition-colors hover:bg-sky has-[:checked]:bg-mint has-[:checked]:text-emerald-ink has-[:focus-visible]:outline has-[:focus-visible]:outline-[3px] has-[:focus-visible]:outline-royal">
                    <input type="checkbox" checked={!!checked[g]} onChange={() => setChecked((c) => ({ ...c, [g]: !c[g] }))} className="h-5 w-5 accent-[#16a765]" />
                    <span className={checked[g] ? "line-through opacity-70" : ""}>{g}</span>
                  </label>
                </li>
              ))}
            </ul>
            <p className="mt-4 text-sm font-semibold text-muted" aria-live="polite">{pending === 0 ? "All picked up 🎉" : `${pending} item${pending === 1 ? "" : "s"} still to buy`}</p>
          </Reveal>

          {/* Bill reminders */}
          <Reveal className="card hover-lift p-6 sm:p-8">
            <h3 className="flex items-center gap-3 font-display text-xl font-bold">
              <span className="slab-3d grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#264b7a] to-navy text-white"><BellRing size={20} aria-hidden="true" /></span>
              Bill reminders
            </h3>
            <ul className="mt-5 grid gap-3">
              {[
                ["Rent", "Due on the 1st", "bg-royal"],
                ["Electricity", "Due on the 12th", "bg-emerald"],
                ["Wi-Fi", "Due on the 20th", "bg-[#4aa3ff]"],
              ].map(([n, d, c]) => (
                <li key={n} className="flex items-center gap-4 rounded-xl border border-line px-4 py-3 shadow-sm">
                  <span aria-hidden="true" className={`h-10 w-1.5 rounded-full ${c}`} />
                  <span className="flex-1">
                    <b className="block">{n}</b>
                    <span className="text-sm text-muted">{d}</span>
                  </span>
                  <span className="rounded-full bg-sky px-3 py-1 text-xs font-bold text-royal-700">Reminder</span>
                </li>
              ))}
            </ul>
          </Reveal>

          {/* Monthly summary + budget */}
          <Reveal delay={90} className="card hover-lift p-6 sm:p-8">
            <h3 className="flex items-center gap-3 font-display text-xl font-bold">
              <span className="slab-3d-royal grid h-11 w-11 place-items-center rounded-xl bg-gradient-to-br from-[#2d82ef] to-royal text-white"><TrendingUp size={20} aria-hidden="true" /></span>
              Monthly summary &amp; budget plan
            </h3>
            <div className="mt-6 flex h-36 items-end gap-3 rounded-2xl border border-line bg-sky/40 p-4" role="img" aria-label="Example bar chart of monthly shared spending, rising and falling across five months">
              {[52, 74, 48, 86, 62].map((h, i) => (
                <div key={i} className="flex h-full flex-1 flex-col items-center justify-end gap-2">
                  <span className="slab-3d w-full rounded-t-xl border-t-2 border-white/60 bg-gradient-to-t from-royal to-emerald transition-all" style={{ height: `${h}%` }} />
                  <span className="text-xs font-semibold text-muted">{["Jan", "Feb", "Mar", "Apr", "May"][i]}</span>
                </div>
              ))}
            </div>
            <p className="mt-5 flex items-start gap-2.5 rounded-xl bg-sky p-4 text-sm text-navy/85">
              <Calculator size={18} className="mt-0.5 shrink-0 text-royal" aria-hidden="true" />
              Set a monthly shared budget and see how much is left — before it turns into an argument.
            </p>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
