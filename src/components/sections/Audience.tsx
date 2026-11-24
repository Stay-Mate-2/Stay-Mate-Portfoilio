import { BriefcaseBusiness, Building2, Check, CheckCircle2, Clock3, GraduationCap, Rocket } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { Label, SectionHeading } from "@/components/ui/SectionHeading";
import { Tilt3D } from "@/components/ui/Tilt3D";

const PERSONA_CARDS = [
  {
    id: "students",
    icon: GraduationCap,
    badge: "Students & Freshers",
    title: "For college & university students",
    subtitle: "Moving for your degree, coaching, or internship? Start with roommates and budgets that respect your routine.",
    accentClass: "slab-3d-royal bg-gradient-to-br from-[#2d82ef] to-royal text-white",
    cardClass: "bg-white hover:border-royal/30",
    ctaLabel: "Join as a Student",
    ctaVariant: "primary" as const,
    points: [
      "Match on study hours, sleep schedule, food habits & student budget",
      "Explore PGs, shared rooms & student residences near campus",
      "See rent, deposit & estimated monthly share before calling home",
      "Chat safely inside the app without posting your phone number publicly",
    ],
  },
  {
    id: "professionals",
    icon: BriefcaseBusiness,
    badge: "Working Professionals",
    title: "For relocating & hybrid professionals",
    subtitle: "Starting a new role in a new city? Skip chaotic flatmate threads and awkward end-of-month bill reminders.",
    accentClass: "slab-3d bg-gradient-to-br from-[#1d4375] to-navy text-white",
    cardClass: "bg-gradient-to-b from-sky/55 to-white hover:border-royal/35",
    ctaLabel: "Join as a Professional",
    ctaVariant: "primary" as const,
    points: [
      "Align on WFH/hybrid schedules, cleanliness, guests & quiet hours",
      "Discover private rooms and 1BHK/2BHK shared flats with clear deposits",
      "Check pairwise compatibility across multi-roommate households",
      "Get early access to planned shared-expense & bill-reminder tools",
    ],
  },
  {
    id: "owners",
    icon: Building2,
    badge: "Owners & PG Operators",
    title: "For property owners & PG operators",
    subtitle: "Fill rooms, PG beds, and flats with genuine, well-informed seekers—without broker noise or endless repeat calls.",
    accentClass: "slab-3d-emerald bg-gradient-to-br from-[#26c47c] to-emerald text-navy",
    cardClass: "bg-gradient-to-br from-mint/85 to-white hover:border-emerald/40",
    ctaLabel: "Join as a Property Owner",
    ctaVariant: "secondary" as const,
    points: [
      "Publish PGs, rooms & flats with monthly rent and deposit shown clearly",
      "Moderation review builds trust so serious seekers enquire with confidence",
      "Manage availability and visit enquiries from one clean owner workflow",
      "Unlock your exact street address only when you approve an enquiry",
    ],
  },
] as const;

const ROADMAP = [
  {
    stage: "Phase 1 · Built in Pilot App",
    tone: "green" as const,
    statusLabel: "Working in pilot build",
    icon: CheckCircle2,
    items: [
      "Android-first mobile app (Expo / React Native) & Express + Socket.IO backend",
      "Phone OTP sign-in with role onboarding for Seekers and Property Owners",
      "Explainable 8-factor compatibility engine + hard deal-breaker filters",
      "Moderated PG, room & flat discovery with owner-approved address sharing",
      "Real-time in-app chat plus 1-tap block, report & moderation web console",
    ],
  },
  {
    stage: "Phase 2 · Happening Right Now",
    tone: "blue" as const,
    statusLabel: "Active milestone",
    icon: Rocket,
    items: [
      "Onboarding founding Students, Working Professionals & Property Owners",
      "Prioritizing first rollout cities based on early-access demand",
      "Setting up production cloud database, SMS OTP gateway & media storage",
      "Physical Android device QA, security testing & Play Store release prep",
    ],
  },
  {
    stage: "Phase 3 · Next After Launch",
    tone: "amber" as const,
    statusLabel: "Planned next",
    icon: Clock3,
    items: [
      "1-tap household rent, electricity & Wi-Fi expense splitting",
      "Shared kitchen grocery lists and household supply tracking",
      "Automated monthly bill reminders so flatmates never chase each other",
      "Expanded city cohorts and deeper owner portfolio tools",
    ],
  },
] as const;

export function Audience() {
  return (
    <section id="who-its-for" aria-labelledby="audience-title" className="bg-white py-24 sm:py-32">
      <div className="wrap">
        <SectionHeading
          id="audience-title"
          eyebrow="Built for every side of shared living"
          align="center"
          title={
            <>
              Designed for the people <span className="text-gradient">living in a home</span>—and the people offering one.
            </>
          }
        >
          Whether you are moving for college, relocating for work, or managing a PG or flat, StayMate gives you clarity upfront.
        </SectionHeading>

        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {PERSONA_CARDS.map((card, idx) => {
            const Icon = card.icon;
            return (
              <Reveal key={card.id} id={card.id} delay={idx * 80} className="h-full">
                <Tilt3D className={`card relative h-full overflow-hidden p-7 hover:shadow-lift sm:p-8 ${card.cardClass}`}>
                  <div className="preserve-3d flex h-full flex-col">
                    <div className="flex items-center justify-between gap-3">
                      <span className={`z-pop grid h-13 w-13 place-items-center rounded-2xl ${card.accentClass}`}>
                        <Icon size={25} aria-hidden="true" />
                      </span>
                      <span className="rounded-full border border-line bg-white/90 px-3 py-1 text-xs font-bold text-navy">
                        {card.badge}
                      </span>
                    </div>

                    <h3 className="z-pop-sm mt-6 font-display text-2xl font-extrabold text-navy">{card.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{card.subtitle}</p>

                    <ul className="mt-6 grid gap-3 text-sm">
                      {card.points.map((t) => (
                        <li key={t} className="flex items-start gap-2.5 font-medium text-navy/90">
                          <Check size={18} className="mt-0.5 shrink-0 text-emerald-ink" aria-hidden="true" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-auto pt-8">
                      <ButtonLink
                        href="#early-access"
                        variant={card.ctaVariant}
                        className={`z-pop-sm w-full ${card.ctaVariant === "primary" ? "slab-3d-royal" : "slab-3d"}`}
                      >
                        {card.ctaLabel}
                      </ButtonLink>
                    </div>
                  </div>
                </Tilt3D>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="roadmap" aria-labelledby="about-title" className="bg-sky py-24 sm:py-32">
      <div id="about" className="wrap">
        <div className="grid items-start gap-10 lg:grid-cols-[1.05fr_1fr] lg:gap-14">
          <div>
            <SectionHeading
              id="about-title"
              eyebrow="What we're building & doing now"
              title={
                <>
                  Real software in motion—<span className="text-gradient">shared openly with you.</span>
                </>
              }
            >
              StayMate is an India-first shared-living platform built around a simple belief: a good home is as much about who you live with as where you live, and nobody should get blindsided by hidden bills.
            </SectionHeading>
            <Reveal className="mt-5 text-[1rem] leading-relaxed text-muted">
              <p>
                Instead of making vague hype promises, we label every single capability honestly—showing you what already runs in our pilot Android &amp; backend build today, what we are preparing right now during early access, and what comes next.
              </p>
            </Reveal>
          </div>

          <Reveal delay={100}>
            <ul className="grid gap-4 sm:grid-cols-2">
              {[
                ["India-first reality", "Built around Indian PGs, shared flats, campus belts, deposits, and tiffin/utility realities."],
                ["Compatibility before commitment", "Know daily lifestyle alignment and deal-breakers before signing or paying."],
                ["Zero-surprise cost clarity", "Rent, security deposit, and everyday household expenses separated clearly."],
                ["Privacy & control by default", "Hidden phone numbers, moderated listings, and owner-gated exact addresses."],
              ].map(([t, d]) => (
                <li key={t} className="h-full">
                  <Tilt3D className="card h-full p-5 hover:border-royal/30 hover:shadow-lift sm:p-6">
                    <div className="preserve-3d">
                      <h3 className="z-pop-sm font-display text-base font-extrabold text-navy">{t}</h3>
                      <p className="mt-1.5 text-sm leading-relaxed text-muted">{d}</p>
                    </div>
                  </Tilt3D>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        {/* 3-Stage Transparent Product Roadmap */}
        <div className="mt-14 grid gap-6 lg:grid-cols-3">
          {ROADMAP.map((phase, idx) => {
            const Icon = phase.icon;
            return (
              <Reveal key={phase.stage} delay={idx * 90} className="h-full">
                <div className="card flex h-full flex-col p-6 sm:p-8">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-sky text-royal">
                      <Icon size={20} aria-hidden="true" />
                    </span>
                    <Label tone={phase.tone}>{phase.statusLabel}</Label>
                  </div>
                  <h3 className="mt-5 font-display text-xl font-extrabold text-navy">{phase.stage}</h3>
                  <ul className="mt-4 grid gap-2.5 text-sm text-navy/85">
                    {phase.items.map((item) => (
                      <li key={item} className="flex items-start gap-2.5">
                        <span aria-hidden="true" className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-royal" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
