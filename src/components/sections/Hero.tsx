import { ArrowRight, Compass } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { SpatialHeroStage } from "@/components/sections/SpatialHeroStage";

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

      <div className="wrap grid items-center gap-12 pb-20 lg:grid-cols-[1.02fr_1.05fr] lg:gap-8 lg:pb-28">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2.5 rounded-full border border-emerald/35 bg-mint px-4 py-2 text-sm font-semibold text-emerald-ink shadow-sm">
            <span aria-hidden="true" className="h-2.5 w-2.5 animate-pulse-dot rounded-full bg-emerald" />
            Building a better way to live together.
          </p>

          <h1 id="hero-title" className="mt-7 font-display text-[clamp(2.6rem,7vw,4.9rem)] font-extrabold leading-[1.02] text-navy">
            Your next home starts with the <span className="text-gradient">right people.</span>
          </h1>

          <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
            Find compatible roommates, discover affordable places and make shared living easier. One smarter way to find where you belong.
          </p>

          <div className="mt-9 flex flex-col gap-3.5 sm:flex-row">
            <ButtonLink href="#early-access" size="lg" className="slab-3d-royal">
              Get Early Access <ArrowRight size={18} aria-hidden="true" />
            </ButtonLink>
            <ButtonLink href="#features" variant="secondary" size="lg" className="slab-3d">
              <Compass size={18} aria-hidden="true" /> Explore StayMate
            </ButtonLink>
          </div>

          <ul className="mt-9 flex flex-wrap gap-2.5 text-sm font-semibold text-navy/85">
            {["Roommates", "PGs, rooms & flats", "Real monthly cost", "Android first"].map((t) => (
              <li key={t} className="inline-flex items-center gap-2 rounded-full border border-line bg-white/85 px-3.5 py-1.5 shadow-sm">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-emerald" />
                {t}
              </li>
            ))}
          </ul>
        </div>

        <SpatialHeroStage />
      </div>
    </section>
  );
}
