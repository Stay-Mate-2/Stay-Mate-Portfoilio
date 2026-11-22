"use client";

import { useMemo, useState } from "react";
import { Bath, BedDouble, Fan, Utensils, Wifi, type LucideIcon } from "lucide-react";
import { ListingArt, type ListingKind } from "@/components/ui/ListingArt";
import { Label, SectionHeading } from "@/components/ui/SectionHeading";
import { Reveal } from "@/components/ui/Reveal";
import { Tilt3D } from "@/components/ui/Tilt3D";
import { formatINR } from "@/lib/calculator";

type Filter = "all" | ListingKind;

interface DemoListing {
  id: string;
  kind: ListingKind;
  title: string;
  area: string;
  rent: number;
  deposit: number;
  extras: number; // estimated electricity + internet etc per person
  perks: [LucideIcon, string][];
}

const KIND_LABEL: Record<ListingKind, string> = {
  pg: "PG",
  private: "Private room",
  shared: "Shared room",
  flat: "Flat",
  student: "Student accommodation",
};

const LISTINGS: DemoListing[] = [
  { id: "d1", kind: "pg", title: "Sample PG with meals", area: "Near campus (demo)", rent: 7500, deposit: 7500, extras: 300, perks: [[Utensils, "Meals"], [Wifi, "Wi-Fi"]] },
  { id: "d2", kind: "private", title: "Sample private room", area: "Residential area (demo)", rent: 9000, deposit: 18000, extras: 1000, perks: [[Bath, "Attached bath"], [Wifi, "Wi-Fi"]] },
  { id: "d3", kind: "shared", title: "Sample shared room", area: "Near metro (demo)", rent: 4800, deposit: 4800, extras: 400, perks: [[BedDouble, "2 sharing"], [Fan, "Cooling"]] },
  { id: "d4", kind: "flat", title: "Sample 2BHK flat", area: "City centre (demo)", rent: 18000, deposit: 36000, extras: 1500, perks: [[BedDouble, "2 bedrooms"], [Wifi, "Wi-Fi"]] },
  { id: "d5", kind: "student", title: "Sample student residence", area: "University belt (demo)", rent: 6500, deposit: 6500, extras: 250, perks: [[Utensils, "Mess"], [Wifi, "Wi-Fi"]] },
  { id: "d6", kind: "flat", title: "Sample 1BHK flat", area: "Quiet colony (demo)", rent: 12000, deposit: 24000, extras: 1200, perks: [[Bath, "Own kitchen"], [Fan, "Cooling"]] },
];

const FILTERS: { id: Filter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "pg", label: "PG" },
  { id: "private", label: "Private room" },
  { id: "shared", label: "Shared room" },
  { id: "flat", label: "Flat" },
  { id: "student", label: "Student" },
];

export function Discovery() {
  const [filter, setFilter] = useState<Filter>("all");
  const [budget, setBudget] = useState(20000);

  const shown = useMemo(
    () => LISTINGS.filter((l) => (filter === "all" || l.kind === filter) && l.rent <= budget),
    [filter, budget],
  );

  return (
    <section id="places" aria-labelledby="places-title" className="bg-white py-24 sm:py-32">
      <div className="wrap">
        <SectionHeading id="places-title" eyebrow="Accommodation discovery" title={<>Your next place could be <span className="text-gradient">closer than you think.</span></>}>
          PGs, private rooms, shared rooms, flats and student accommodation — with rent and deposit clearly separated and an estimate of what it really costs each month.
        </SectionHeading>

        <Reveal className="mt-12">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div role="group" aria-label="Accommodation type" className="flex flex-wrap gap-2">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  type="button"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                  className={`rounded-full border px-4 py-2 text-sm font-semibold transition-all ${
                    filter === f.id ? "border-navy bg-navy text-white shadow-md" : "border-line bg-white text-navy/80 hover:border-royal/50 hover:bg-sky"
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
            <div className="w-full lg:w-72">
              <label htmlFor="budget-range" className="flex items-baseline justify-between text-sm font-bold">
                <span>Max monthly rent</span>
                <output className="font-display text-royal">{formatINR(budget)}</output>
              </label>
              <input
                id="budget-range"
                type="range"
                className="range mt-3"
                min={4000}
                max={20000}
                step={500}
                value={budget}
                style={{ ["--fill" as string]: `${((budget - 4000) / 16000) * 100}%` }}
                onChange={(e) => setBudget(Number(e.target.value))}
              />
            </div>
          </div>

          <p className="mt-4"><Label tone="amber">Demo content — these are not real or available properties</Label></p>
        </Reveal>

        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3" aria-live="polite">
          {shown.map((l) => {
            const real = l.rent + l.extras;
            return (
              <li key={l.id}>
                <Tilt3D className="card group h-full overflow-hidden hover:border-royal/30 hover:shadow-lift">
                  <article className="preserve-3d flex h-full flex-col">
                    <div className="relative aspect-[16/9] overflow-hidden">
                      <ListingArt kind={l.kind} className="h-full w-full transition-transform duration-500 group-hover:scale-105" />
                      <span className="z-pop-sm absolute left-3 top-3 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-navy shadow-md">{KIND_LABEL[l.kind]}</span>
                      <span className="z-pop-sm absolute right-3 top-3 rounded-full bg-navy px-3 py-1 text-xs font-bold text-white shadow-md">Demo</span>
                    </div>
                    <div className="flex flex-1 flex-col p-5 sm:p-6">
                      <h3 className="font-display text-lg font-bold">{l.title}</h3>
                      <p className="text-sm text-muted">{l.area}</p>
                      <ul className="mt-3 flex flex-wrap gap-2">
                        {l.perks.map(([Icon, text]) => (
                          <li key={text} className="inline-flex items-center gap-1.5 rounded-full bg-sky px-2.5 py-1 text-xs font-semibold text-royal-700">
                            <Icon size={13} aria-hidden="true" /> {text}
                          </li>
                        ))}
                      </ul>
                      <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <dt className="text-xs font-bold text-muted">Rent / month</dt>
                          <dd className="font-display text-xl font-extrabold tabular-nums">{formatINR(l.rent)}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-bold text-muted">Deposit</dt>
                          <dd className="font-display text-xl font-extrabold tabular-nums">{formatINR(l.deposit)}</dd>
                        </div>
                      </dl>
                      <p className="z-pop-sm mt-auto pt-4">
                        <span className="flex items-center justify-between rounded-xl bg-mint px-3.5 py-2.5 text-sm font-semibold text-emerald-ink">
                          <span>Est. real monthly cost</span>
                          <span className="tabular-nums">≈ {formatINR(real)}</span>
                        </span>
                      </p>
                    </div>
                  </article>
                </Tilt3D>
              </li>
            );
          })}
        </ul>

        {shown.length === 0 ? (
          <p className="card mt-8 p-8 text-center text-muted">No demo cards match those filters — try a higher budget or another type.</p>
        ) : null}
      </div>
    </section>
  );
}
