import { ArrowRight, BriefcaseBusiness, Building2, Compass, GraduationCap, ShieldCheck, Sparkles, Wallet } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { SpatialHeroStage } from "@/components/sections/SpatialHeroStage";

const PERSONAS = [
  { href: "#students", icon: GraduationCap, label: "Students" },
  { href: "#professionals", icon: BriefcaseBusiness, label: "Working Professionals" },
  { href: "#owners", icon: Building2, label: "PG & Property Owners" },
] as const;

const HIGHLIGHTS = [
  {
    icon: Sparkles,
    title: "8-Factor Match",
    detail: "Explainable lifestyle & deal-breaker fit",
  },
  {
    icon: Wallet,
    title: "True Monthly Cost",
    detail: "Rent, deposit & utility share upfront",
  },
  {
    icon: ShieldCheck,
    title: "Private by Default",
    detail: "Hidden phone number & gated addresses",
  },
] as const;

export function Hero() {
  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate overflow-x-clip pt-28 sm:pt-32 lg:pt-36">
      {/* Atmosphere: soft brand glows + masked blueprint dot-grid */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 -top-24 h-[34rem] w-[34rem] rounded-full bg-royal/14 blur-3xl" />
        <div className="absolute -right-32 top-24 h-[30rem] w-[30rem] rounded-full bg-emerald/16 blur-3xl" />
        <div
          className="bg-dots absolute inset-0 opacity-75"
          style={{
            maskImage: "radial-gradient(ellipse 75% 65% at 55% 35%, #000 20%, transparent 78%)",
            WebkitMaskImage: "radial-gradient(ellipse 75% 65% at 55% 35%, #000 20%, transparent 78%)",
          }}
        />
      </div>

      <div className="wrap grid items-center gap-12 pb-20 lg:grid-cols-[1.06fr_1fr] lg:gap-10 lg:pb-28">
        <div className="max-w-2xl">
          <p className="inline-flex flex-wrap items-center gap-2.5 rounded-full border border-emerald/35 bg-mint px-4 py-2 text-xs font-bold text-emerald-ink shadow-sm sm:text-sm">
            <span aria-hidden="true" className="h-2.5 w-2.5 animate-pulse-dot rounded-full bg-emerald" />
            India-first Shared-Living Android App · Early Access Open
          </p>

          <h1 id="hero-title" className="mt-6 font-display text-[clamp(2.45rem,6.4vw,4.55rem)] font-extrabold leading-[1.03] text-navy">
            Your next home starts with the <span className="text-gradient">right people.</span>
          </h1>

          <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-muted sm:text-lg">
            Stop gambling on random WhatsApp flatmate groups and surprise broker fees. <strong className="font-semibold text-navy">StayMate</strong> helps you match with compatible roommates, browse moderated PGs, rooms &amp; flats with clear upfront pricing, and chat safely without exposing your phone number.
          </p>

          <div className="mt-8 flex flex-col gap-3.5 sm:flex-row">
            <ButtonLink href="#early-access" size="lg" className="slab-3d-royal">
              Join Free Early Access <ArrowRight size={18} aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="#why-staymate" variant="secondary" size="lg" className="slab-3d">
              <Compass size={18} aria-hidden="true" /> See What We&apos;re Building
            </ButtonLink>
          </div>

          {/* Direct role jump chips */}
          <div className="mt-7 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-muted">Built for:</span>
            {PERSONAS.map((p) => {
              const Icon = p.icon;
              return (
                <a
                  key={p.label}
                  href={p.href}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-white/90 px-3.5 py-1.5 text-xs font-bold text-navy shadow-sm transition-all hover:border-royal/40 hover:bg-sky hover:text-royal"
                >
                  <Icon size={14} className="text-royal" aria-hidden="true" />
                  {p.label}
                </a>
              );
            })}
          </div>

          {/* 3-Pillar Clarity Strip */}
          <dl className="mt-8 grid gap-3 sm:grid-cols-3">
            {HIGHLIGHTS.map((h) => {
              const Icon = h.icon;
              return (
                <div
                  key={h.title}
                  className="rounded-2xl border border-line/90 bg-white/90 p-3.5 shadow-sm backdrop-blur-sm"
                >
                  <dt className="flex items-center gap-2 font-display text-sm font-extrabold text-navy">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-sky text-royal">
                      <Icon size={15} aria-hidden="true" />
                    </span>
                    {h.title}
                  </dt>
                  <dd className="mt-1.5 text-xs leading-snug text-muted">{h.detail}</dd>
                </div>
              );
            })}
          </dl>
        </div>

        <SpatialHeroStage />
      </div>
    </section>
  );
}
