"use client";

import { useState } from "react";
import { HeartCrack, Layers, Receipt, Search, UsersRound, Wallet } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { Label, SectionHeading } from "@/components/ui/SectionHeading";
import { ScrollMotion3D } from "@/components/ui/ScrollMotion3D";
import { Tilt3D } from "@/components/ui/Tilt3D";

const problems = [
  { icon: UsersRound, title: "Compatibility is guesswork", text: "Sleep schedules, cleanliness, food habits — most people only find out after moving in." },
  { icon: Wallet, title: "Rent isn't the only expense", text: "Electricity, internet, food and groceries quietly double what you thought you'd pay." },
  { icon: Receipt, title: "Hidden costs create surprises", text: "Deposits and extra charges show up late, when it's hardest to say no." },
  { icon: HeartCrack, title: "Shared money gets stressful", text: "Who paid for what? Chasing friends for small amounts strains good friendships." },
  { icon: Search, title: "Trustworthy places take time", text: "Endless group chats and unclear listings make safe options hard to spot." },
];

const hiddenLayers = [
  { label: "Security deposit", width: "w-[86%]", tone: "from-[#d8e8ff] to-[#edf5ff] border-b-[#b8d3f7]" },
  { label: "Electricity & water", width: "w-[74%]", tone: "from-[#dff5e9] to-[#eefaf3] border-b-[#b2e5c9]" },
  { label: "Internet", width: "w-[60%]", tone: "from-[#e2eeff] to-[#f4f9ff] border-b-[#c0d7f5]" },
  { label: "Food & groceries", width: "w-[94%]", tone: "from-[#d5f2e3] to-[#ebf9f1] border-b-[#a8dfc1]" },
  { label: "Shared supplies", width: "w-[66%]", tone: "from-[#e6effb] to-[#f5f9ff] border-b-[#c6d9f2]" },
];

export function Problem() {
  const [showFull, setShowFull] = useState(true);

  return (
    <section id="problem" aria-labelledby="problem-title" className="relative overflow-x-clip bg-white py-24 sm:py-32">
      <div className="wrap">
        <SectionHeading
          id="problem-title"
          eyebrow="The real problem"
          title={
            <>
              Finding a place is easy. Finding the right place <span className="text-gradient">and people</span> isn&apos;t.
            </>
          }
        >
          Moving to a new city shouldn&apos;t mean gambling on strangers and surprise bills.
        </SectionHeading>

        <div className="mt-14 grid items-start gap-10 lg:grid-cols-[1.15fr_1fr] lg:gap-14">
          <ul className="grid gap-4 sm:grid-cols-2">
            {problems.map((p, i) => (
              <li key={p.title} className={i === 4 ? "sm:col-span-2" : ""}>
                <Reveal delay={i * 70} className="h-full">
                  <Tilt3D className="card h-full p-6 hover:border-royal/30 hover:shadow-lift">
                    <div className="preserve-3d flex items-start gap-4">
                      <span className="z-pop-sm slab-3d grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sky to-mint text-royal">
                        <p.icon size={22} aria-hidden="true" />
                      </span>
                      <div>
                        <h3 className="font-display text-lg font-bold text-navy">{p.title}</h3>
                        <p className="mt-1.5 text-[0.95rem] leading-relaxed text-muted">{p.text}</p>
                      </div>
                    </div>
                  </Tilt3D>
                </Reveal>
              </li>
            ))}
          </ul>

          {/* 3D Isometric Cost Stack / Waterline Cutaway */}
          <Reveal delay={120}>
            <ScrollMotion3D maxRotateX={5} maxRotateY={-2.5} maxShiftY={-14} maxPushZ={-28}>
              <Tilt3D maxTilt={5} className="card relative overflow-hidden p-6 sm:p-8">
                <div className="preserve-3d">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <h3 className="font-display text-lg font-bold">What the ad shows vs. what you pay</h3>
                    <Label tone="blue">Illustrative — not real prices</Label>
                  </div>

                  {/* Interactive layer reveal toggle */}
                  <div role="group" aria-label="Toggle hidden cost layers" className="mt-4 inline-flex rounded-full border border-line bg-sky/70 p-1">
                    <button
                      type="button"
                      aria-pressed={!showFull}
                      onClick={() => setShowFull(false)}
                      className={`rounded-full px-3 py-1 text-xs font-bold transition-all ${
                        !showFull ? "bg-navy text-white shadow-sm" : "text-navy/75 hover:text-royal"
                      }`}
                    >
                      Ad price only
                    </button>
                    <button
                      type="button"
                      aria-pressed={showFull}
                      onClick={() => setShowFull(true)}
                      className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold transition-all ${
                        showFull ? "bg-royal text-white shadow-sm" : "text-navy/75 hover:text-royal"
                      }`}
                    >
                      <Layers size={12} aria-hidden="true" /> Full 3D stack
                    </button>
                  </div>

                  {/* 3D Perspective Stack */}
                  <div className="perspective-stage mt-6 rounded-2xl border border-royal/10 bg-gradient-to-b from-sky/50 via-white to-mint/40 p-5 sm:p-6">
                    <div
                      className="preserve-3d transition-transform duration-500"
                      style={{ transform: "rotateX(9deg) rotateY(-7deg)" }}
                    >
                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Above the waterline</p>
                      <div className="animate-float-3d z-pop slab-3d-royal mt-2 flex h-14 w-3/5 items-center justify-between rounded-2xl bg-gradient-to-r from-royal to-[#2a81ec] px-5 font-display text-lg font-extrabold text-white">
                        <span>Rent</span>
                        <span className="text-xs font-semibold text-white/80">Headline</span>
                      </div>

                      <div aria-hidden="true" className="relative my-5 h-5 overflow-hidden">
                        <svg viewBox="0 0 400 20" preserveAspectRatio="none" className="animate-water-wave h-5 w-[116%]">
                          <path
                            d="M0 10 Q25 0 50 10 T100 10 T150 10 T200 10 T250 10 T300 10 T350 10 T400 10"
                            fill="none"
                            stroke="#1769d2"
                            strokeOpacity=".5"
                            strokeWidth="2.5"
                          />
                        </svg>
                      </div>

                      <p className="text-[11px] font-bold uppercase tracking-widest text-muted">Below the waterline</p>
                      <ul
                        aria-live="polite"
                        className={`mt-3 grid gap-2.5 transition-all duration-500 ${
                          showFull ? "animate-float-3d-alt opacity-100 translate-y-0" : "opacity-25 translate-y-2 blur-[1.5px]"
                        }`}
                      >
                        {hiddenLayers.map((layer, idx) => (
                          <li
                            key={layer.label}
                            style={{ transitionDelay: `${idx * 45}ms` }}
                            className={`flex h-11 items-center rounded-xl border border-white/80 border-b-[4px] bg-gradient-to-r px-4 text-sm font-semibold text-navy shadow-sm transition-all ${layer.tone} ${layer.width}`}
                          >
                            {layer.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </Tilt3D>
            </ScrollMotion3D>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
