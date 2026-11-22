import { Building2, Check, GraduationCap } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tilt3D } from "@/components/ui/Tilt3D";

const students = [
  "Find roommates who match your routine and budget",
  "See the real monthly cost, not just the rent",
  "Browse PGs, rooms and flats near where you study or work",
  "Keep your phone number private until you choose to share",
];

const owners = [
  "List rooms, PGs and flats with rent and deposit shown separately",
  "Listings are reviewed before going live, building trust with seekers",
  "Receive visit enquiries and decide when to share your exact address",
  "Manage vacancy and enquiries from one simple dashboard",
];

export function Audience() {
  return (
    <section aria-labelledby="audience-title" className="bg-white py-24 sm:py-32">
      <div className="wrap">
        <SectionHeading
          id="audience-title"
          eyebrow="Built for you"
          align="center"
          title={
            <>
              Whether you&apos;re looking, or <span className="text-gradient">offering a home.</span>
            </>
          }
        />

        <div className="mt-14 grid gap-6 lg:grid-cols-2">
          <Reveal id="students" className="h-full">
            <Tilt3D className="card relative h-full overflow-hidden p-8 hover:border-royal/30 hover:shadow-lift sm:p-10">
              <div className="preserve-3d">
                <span className="z-pop slab-3d-royal grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#2d82ef] to-royal text-white">
                  <GraduationCap size={26} aria-hidden="true" />
                </span>
                <h3 className="z-pop-sm mt-6 font-display text-2xl font-extrabold">For students &amp; young professionals</h3>
                <p className="mt-2 text-muted">Moving to a new city for college or your first job? Start with people and places that fit.</p>
                <ul className="mt-6 grid gap-3">
                  {students.map((t) => (
                    <li key={t} className="flex items-start gap-3 font-medium text-navy/90">
                      <Check size={20} className="mt-0.5 shrink-0 text-emerald-ink" aria-hidden="true" /> {t}
                    </li>
                  ))}
                </ul>
                <ButtonLink href="#early-access" className="z-pop-sm slab-3d-royal mt-8">
                  Join as a student or professional
                </ButtonLink>
              </div>
            </Tilt3D>
          </Reveal>

          <Reveal id="owners" delay={100} className="h-full">
            <Tilt3D className="card relative h-full overflow-hidden bg-gradient-to-br from-mint to-white p-8 hover:border-emerald/40 hover:shadow-lift sm:p-10">
              <div className="preserve-3d">
                <span className="z-pop slab-3d-emerald grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-[#26c47c] to-emerald text-navy">
                  <Building2 size={26} aria-hidden="true" />
                </span>
                <h3 className="z-pop-sm mt-6 font-display text-2xl font-extrabold">For property owners &amp; PG operators</h3>
                <p className="mt-2 text-muted">Reach seekers who are actively looking, with less back-and-forth and more clarity.</p>
                <ul className="mt-6 grid gap-3">
                  {owners.map((t) => (
                    <li key={t} className="flex items-start gap-3 font-medium text-navy/90">
                      <Check size={20} className="mt-0.5 shrink-0 text-emerald-ink" aria-hidden="true" /> {t}
                    </li>
                  ))}
                </ul>
                <ButtonLink href="#early-access" variant="secondary" className="z-pop-sm slab-3d mt-8">
                  Join as a property owner
                </ButtonLink>
              </div>
            </Tilt3D>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export function About() {
  return (
    <section id="about" aria-labelledby="about-title" className="bg-sky py-24 sm:py-32">
      <div className="wrap grid items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
        <div>
          <SectionHeading
            id="about-title"
            eyebrow="About StayMate"
            title={
              <>
                Shared living, <span className="text-gradient">made human.</span>
              </>
            }
          >
            StayMate is an India-first shared-living platform for students and working professionals. We believe a good home is as much about who you live with as where you live — and that
            nobody should be surprised by their bills.
          </SectionHeading>
          <Reveal className="mt-6 grid gap-4 text-[1.02rem] leading-relaxed text-muted">
            <p>
              We&apos;re building people-first matching, honest cost visibility and thoughtful safety tools in one Android app. It&apos;s still taking shape, and we&apos;re sharing our
              progress openly — which is why everything on this page labels what is working today, what&apos;s a concept and what&apos;s only sample data.
            </p>
          </Reveal>
        </div>

        <Reveal delay={100}>
          <ul className="grid gap-4 sm:grid-cols-2">
            {[
              ["India-first", "Designed around how Indian students and professionals actually find homes."],
              ["Compatibility before commitment", "Understand fit up front, not after the lease."],
              ["Transparent pricing", "Rent, deposit and everyday costs, never hidden."],
              ["Privacy by default", "Your data and contact details stay in your control."],
            ].map(([t, d]) => (
              <li key={t} className="h-full">
                <Tilt3D className="card h-full p-6 hover:border-royal/30 hover:shadow-lift">
                  <div className="preserve-3d">
                    <h3 className="z-pop-sm font-display text-lg font-bold">{t}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{d}</p>
                  </div>
                </Tilt3D>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}
