import { Check, Coins, Home, ShieldCheck, Users } from "lucide-react";
import type { ReactNode } from "react";
import { Reveal } from "@/components/ui/Reveal";
import { ListingArt } from "@/components/ui/ListingArt";
import { ScrollMotion3D } from "@/components/ui/ScrollMotion3D";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tilt3D } from "@/components/ui/Tilt3D";

interface Pillar {
  n: string;
  icon: typeof Users;
  title: string;
  text: string;
  points: string[];
  status: string;
  visual: ReactNode;
  accent: "royal" | "emerald";
}

const pillars: Pillar[] = [
  {
    n: "01",
    icon: Users,
    title: "Find People",
    text: "Roommate discovery built on daily habits and budget, with a clear explanation of every match.",
    points: ["Lifestyle & budget compatibility", "Deal-breaker filters", "See why you might click"],
    status: "Working in the pilot app",
    accent: "royal",
    visual: (
      <div className="preserve-3d flex items-center gap-3.5">
        <div className="z-pop-sm animate-float-3d-alt flex -space-x-3">
          {[
            ["AR", "from-[#3288f5] to-royal"],
            ["MK", "from-[#35c884] to-emerald"],
            ["SD", "from-[#2b5285] to-navy"],
          ].map(([i, grad]) => (
            <span
              key={i}
              className={`grid h-12 w-12 place-items-center rounded-full border-[3px] border-white bg-gradient-to-br text-xs font-extrabold text-white shadow-md ${grad}`}
            >
              {i}
            </span>
          ))}
        </div>
        <span className="z-pop slab-3d animate-float-3d rounded-full border border-emerald/25 bg-mint px-3.5 py-1.5 text-xs font-bold text-emerald-ink">
          Sample · 92%
        </span>
      </div>
    ),
  },
  {
    n: "02",
    icon: Home,
    title: "Find Places",
    text: "PGs, private rooms, shared rooms and flats, with rent and deposit shown separately.",
    points: ["PG · room · flat filters", "Approximate area, private address", "Owner enquiries & visit requests"],
    status: "Working in the pilot app",
    accent: "emerald",
    visual: (
      <div className="perspective-stage">
        <div className="animate-float-3d-alt">
          <div
            className="slab-3d h-24 w-44 overflow-hidden rounded-2xl border border-royal/20 bg-white"
            style={{ transform: "rotateX(8deg) rotateY(-12deg)" }}
          >
            <ListingArt kind="flat" className="h-full w-full" />
          </div>
        </div>
      </div>
    ),
  },
  {
    n: "03",
    icon: Coins,
    title: "Save Money",
    text: "See the real monthly cost before you commit, and (soon) split shared costs without awkward maths.",
    points: ["Rent vs. deposit clarity", "Real-cost calculator (try it below)", "Expense splitting — planned"],
    status: "Cost clarity in pilot · splitting planned",
    accent: "royal",
    visual: (
      <div className="preserve-3d w-48">
        <div className="z-pop-sm slab-3d relative flex h-4 overflow-hidden rounded-full border border-white">
          <i className="w-[55%] bg-gradient-to-b from-[#3387f2] to-royal" />
          <i className="w-[15%] bg-gradient-to-b from-[#35c884] to-emerald" />
          <i className="w-[12%] bg-[#4aa3ff]" />
          <i className="w-[18%] bg-navy" />
          <span
            aria-hidden="true"
            className="animate-shimmer-3d pointer-events-none absolute inset-y-0 left-0 w-10 bg-gradient-to-r from-transparent via-white/55 to-transparent"
          />
        </div>
        <p className="mt-2.5 text-xs font-semibold text-muted">Your share · estimate</p>
      </div>
    ),
  },
  {
    n: "04",
    icon: ShieldCheck,
    title: "Live Safely",
    text: "Privacy-first by design: your phone number stays private and you stay in control of who contacts you.",
    points: ["Report & block tools", "Listings reviewed before going live", "In-app chat, number stays private"],
    status: "Working in the pilot app",
    accent: "emerald",
    visual: (
      <div className="preserve-3d flex items-center gap-3.5">
        <div className="relative grid h-14 w-14 place-items-center">
          <span
            aria-hidden="true"
            className="animate-orbit-ring-3d pointer-events-none absolute inset-0 rounded-full border border-dashed border-emerald/45"
          />
          <span className="z-pop slab-3d animate-float-3d grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-[#1b4172] to-navy text-emerald">
            <ShieldCheck size={22} aria-hidden="true" />
          </span>
        </div>
        <div className="grid gap-1.5">
          {["Phone number hidden", "Block & report"].map((t) => (
            <span key={t} className="flex items-center gap-1.5 text-xs font-bold text-navy">
              <Check size={14} className="text-emerald-ink" aria-hidden="true" /> {t}
            </span>
          ))}
        </div>
      </div>
    ),
  },
];

export function Solution() {
  return (
    <section id="features" aria-labelledby="solution-title" className="relative overflow-hidden bg-sky py-24 sm:py-32">
      <div
        aria-hidden="true"
        className="bg-dots absolute inset-0 opacity-50"
        style={{ maskImage: "linear-gradient(#000, transparent 70%)", WebkitMaskImage: "linear-gradient(#000, transparent 70%)" }}
      />
      <div className="wrap relative">
        <SectionHeading
          id="solution-title"
          eyebrow="The StayMate way"
          align="center"
          title={
            <>
              Meet your smarter way to <span className="text-gradient">shared living.</span>
            </>
          }
        >
          One place to find the people, the place, the numbers and the peace of mind.
        </SectionHeading>

        <ScrollMotion3D maxRotateX={3.2} maxShiftY={-10} maxPushZ={-14}>
          <ul className="mt-16 grid gap-6 md:grid-cols-2">
            {pillars.map((p, i) => (
              <li key={p.title}>
                <Reveal delay={(i % 2) * 90} className="h-full">
                  <Tilt3D className="card group relative h-full overflow-hidden p-7 hover:border-royal/30 hover:shadow-lift sm:p-9">
                    <span
                      aria-hidden="true"
                      className="z-pop-sm absolute right-6 top-4 font-display text-6xl font-extrabold text-navy/[0.06] transition-colors group-hover:text-royal/15"
                    >
                      {p.n}
                    </span>
                    <div className="preserve-3d relative">
                      <div className="flex items-center gap-4">
                        <span
                          className={`z-pop grid h-14 w-14 place-items-center rounded-2xl text-white transition-transform duration-300 group-hover:-rotate-6 group-hover:scale-110 ${
                            p.accent === "royal"
                              ? "slab-3d-royal bg-gradient-to-br from-[#2d82ef] to-royal"
                              : "slab-3d-emerald bg-gradient-to-br from-[#26c47c] to-emerald"
                          }`}
                        >
                          <p.icon size={26} aria-hidden="true" />
                        </span>
                        <h3 className="z-pop-sm font-display text-2xl font-extrabold text-navy">{p.title}</h3>
                      </div>
                      <p className="mt-5 max-w-md text-[1.02rem] leading-relaxed text-muted">{p.text}</p>
                      <div className="mt-6">{p.visual}</div>
                      <ul className="mt-6 grid gap-2 text-[0.95rem] font-medium text-navy/85">
                        {p.points.map((pt) => (
                          <li key={pt} className="flex items-start gap-2.5">
                            <Check size={18} className="mt-0.5 shrink-0 text-emerald-ink" aria-hidden="true" />
                            {pt}
                          </li>
                        ))}
                      </ul>
                      <p className="z-pop-sm mt-6 inline-flex rounded-full bg-sky px-3.5 py-1 text-xs font-bold text-royal-700">{p.status}</p>
                    </div>
                  </Tilt3D>
                </Reveal>
              </li>
            ))}
          </ul>
        </ScrollMotion3D>
      </div>
    </section>
  );
}
