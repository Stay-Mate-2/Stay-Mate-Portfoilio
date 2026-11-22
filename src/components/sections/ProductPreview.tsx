"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, Pause, Play } from "lucide-react";
import { Label, SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollMotion3D } from "@/components/ui/ScrollMotion3D";
import { Tilt3D } from "@/components/ui/Tilt3D";
import {
  CompatibilityScreen,
  ExpensesScreen,
  ListingScreen,
  PeopleScreen,
  PhoneFrame,
  PlacesScreen,
  WelcomeScreen,
} from "@/components/mockups/Screens";

const screens = [
  { label: "Welcome", caption: "A simple, private sign-in with a one-time code.", status: "pilot", node: <WelcomeScreen /> },
  { label: "People discovery", caption: "Browse roommates with a clear compatibility score.", status: "pilot", node: <PeopleScreen /> },
  { label: "Compatibility details", caption: "See exactly where you align and what to discuss.", status: "pilot", node: <CompatibilityScreen /> },
  { label: "Places discovery", caption: "Filter PGs, rooms and flats by type and budget.", status: "pilot", node: <PlacesScreen /> },
  { label: "Listing details", caption: "Rent, deposit and estimated real cost, side by side.", status: "pilot", node: <ListingScreen /> },
  { label: "Shared expenses", caption: "Split bills and track who owes what — coming later.", status: "planned", node: <ExpensesScreen /> },
] as const;

export function ProductPreview() {
  const trackRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<(HTMLLIElement | null)[]>([]);
  const [active, setActive] = useState(1);
  const [tourPlaying, setTourPlaying] = useState(false);

  function focusCard(index: number, stopTour = true) {
    if (stopTour) setTourPlaying(false);
    const clamped = Math.max(0, Math.min(screens.length - 1, index));
    setActive(clamped);
    const el = itemRefs.current[clamped];
    const track = trackRef.current;
    if (!el || !track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const targetLeft = el.offsetLeft - (track.clientWidth - el.clientWidth) / 2;
    track.scrollTo({ left: Math.max(0, targetLeft), behavior: reduce ? "auto" : "smooth" });
  }

  useEffect(() => {
    if (!tourPlaying) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % screens.length;
        const el = itemRefs.current[next];
        const track = trackRef.current;
        if (el && track) {
          const targetLeft = el.offsetLeft - (track.clientWidth - el.clientWidth) / 2;
          track.scrollTo({ left: Math.max(0, targetLeft), behavior: "smooth" });
        }
        return next;
      });
    }, 3600);

    return () => window.clearInterval(timer);
  }, [tourPlaying]);

  return (
    <section id="preview" aria-labelledby="preview-title" className="relative overflow-hidden bg-gradient-to-b from-white via-sky to-white py-24 sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-16 h-64 overflow-hidden opacity-55">
        <div className="iso-floor-light mx-auto h-full max-w-6xl" />
      </div>

      <div className="wrap relative">
        <SectionHeading
          id="preview-title"
          eyebrow="Product preview"
          align="center"
          title={
            <>
              A first look at <span className="text-gradient">StayMate.</span>
            </>
          }
        >
          Screens recreated from the app we&apos;re building. Swipe or pick a screen to inspect it in 3D.
        </SectionHeading>

        {/* Quick-jump interactive screen selector */}
        <div role="group" aria-label="Select app screen preview" className="mt-8 flex flex-wrap justify-center gap-2">
          {screens.map((s, idx) => {
            const on = active === idx;
            return (
              <button
                key={s.label}
                type="button"
                aria-pressed={on}
                onClick={() => focusCard(idx)}
                className={`rounded-full border px-3.5 py-1.5 text-xs font-bold transition-all ${
                  on
                    ? "border-navy bg-navy text-white shadow-md"
                    : "border-line bg-white/90 text-navy/75 hover:border-royal/40 hover:bg-sky"
                }`}
              >
                {s.label}
              </button>
            );
          })}
        </div>

        <ScrollMotion3D maxRotateX={3} maxShiftY={-10} maxPushZ={-14} className="relative mt-6">
          <div
            ref={trackRef}
            role="region"
            aria-label="StayMate app screen previews"
            tabIndex={0}
            className="no-scrollbar -mx-5 snap-x snap-mandatory overflow-x-auto scroll-smooth px-5 pb-10 pt-6 sm:-mx-8 sm:px-8 lg:mx-0 lg:px-1"
          >
            <ul className="flex w-max gap-6 sm:gap-9 lg:mx-auto">
              {screens.map((s, idx) => {
                const offset = idx - active;
                const isActive = offset === 0;
                const coverflowTransform = isActive
                  ? "perspective(1050px) translateZ(24px) scale(1.04)"
                  : offset < 0
                    ? "perspective(1050px) rotateY(15deg) translateY(8px) scale(0.9)"
                    : "perspective(1050px) rotateY(-15deg) translateY(8px) scale(0.9)";
                return (
                  <li
                    key={s.label}
                    ref={(node) => {
                      itemRefs.current[idx] = node;
                    }}
                    style={{ transform: coverflowTransform }}
                    className={`w-[min(72vw,17rem)] shrink-0 snap-center transition-all duration-500 ease-[cubic-bezier(0.22,1,0.36,1)] sm:w-[17rem] ${
                      isActive ? "opacity-100" : "opacity-85 hover:opacity-100"
                    }`}
                  >
                    <Tilt3D maxTilt={8} className="perspective-stage">
                      <button
                        type="button"
                        onClick={() => focusCard(idx)}
                        aria-label={`Focus ${s.label} screen`}
                        className="block w-full cursor-pointer text-left"
                      >
                        <div className={isActive ? "animate-float-3d" : ""}>
                          <PhoneFrame label={`StayMate app preview — ${s.label}. Sample data.`}>{s.node}</PhoneFrame>
                        </div>
                      </button>
                    </Tilt3D>
                    <div className="mt-6 text-center">
                      <div className="mb-2">
                        {s.status === "planned" ? <Label tone="amber">Planned feature</Label> : <Label tone="green">In the pilot app</Label>}
                      </div>
                      <h3 className="font-display text-lg font-bold text-navy">{s.label}</h3>
                      <p className="mx-auto mt-1 max-w-[16rem] text-sm text-muted">{s.caption}</p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => focusCard(active - 1)}
              disabled={active === 0}
              aria-label="Previous screens"
              className="slab-3d grid h-12 w-12 place-items-center rounded-full border border-line bg-white text-navy transition-all hover:border-royal/40 hover:bg-sky disabled:opacity-40"
            >
              <ChevronLeft aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-pressed={tourPlaying}
              onClick={() => setTourPlaying((v) => !v)}
              className={`slab-3d inline-flex h-12 items-center gap-2 rounded-full border px-5 text-xs font-bold transition-all ${
                tourPlaying
                  ? "border-emerald/40 bg-mint text-[#0b7a47]"
                  : "border-line bg-white text-navy hover:border-royal/40 hover:bg-sky"
              }`}
            >
              {tourPlaying ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
              {tourPlaying ? "Pause 3D tour" : "Play 3D tour"}
            </button>
            <button
              type="button"
              onClick={() => focusCard(active + 1)}
              disabled={active === screens.length - 1}
              aria-label="Next screens"
              className="slab-3d grid h-12 w-12 place-items-center rounded-full border border-line bg-white text-navy transition-all hover:border-royal/40 hover:bg-sky disabled:opacity-40"
            >
              <ChevronRight aria-hidden="true" />
            </button>
          </div>
        </ScrollMotion3D>

        <p className="mx-auto mt-5 max-w-2xl text-center text-xs leading-relaxed text-muted">
          These are concept previews built with HTML/CSS using sample data — people, prices and listings are illustrative. Final design and features may differ at launch.
        </p>
      </div>
    </section>
  );
}
