import { Handshake, MapPinned, SlidersHorizontal, UserRoundPlus } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tilt3D } from "@/components/ui/Tilt3D";

const steps = [
  { icon: UserRoundPlus, title: "Create your profile", text: "Sign in with your phone number and tell us who you are — student, professional or owner." },
  { icon: SlidersHorizontal, title: "Set your lifestyle & budget", text: "Share your habits, preferences and deal-breakers so results actually fit you." },
  { icon: MapPinned, title: "Discover people & places", text: "Browse roommates and accommodation, each with a clear reason it's relevant." },
  { icon: Handshake, title: "Connect & plan together", text: "Chat in-app, request visits and plan how you'll share your home." },
];

export function HowItWorks() {
  return (
    <section id="how-it-works" aria-labelledby="how-title" className="relative overflow-hidden bg-white py-24 sm:py-32">
      <div className="wrap">
        <SectionHeading
          id="how-title"
          eyebrow="How it works"
          align="center"
          title={
            <>
              Four simple steps to <span className="text-gradient">feeling at home.</span>
            </>
          }
        />

        <ol className="relative mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <div
            aria-hidden="true"
            className="absolute left-[12.5%] right-[12.5%] top-12 hidden h-1 rounded-full bg-gradient-to-r from-royal/25 via-emerald/45 to-royal/25 lg:block"
          />
          {steps.map((s, i) => (
            <li key={s.title} className="relative">
              <Reveal delay={i * 100} className="h-full">
                <Tilt3D className="card group flex h-full flex-col p-6 hover:border-royal/30 hover:shadow-lift sm:items-center sm:text-center">
                  <div className="preserve-3d flex items-start gap-5 sm:flex-col sm:items-center">
                    <div className="z-pop relative z-10 shrink-0">
                      <span className="slab-3d-royal grid h-16 w-16 place-items-center rounded-2xl bg-gradient-to-br from-[#2a81ef] via-royal to-emerald text-white transition-transform duration-300 group-hover:scale-105">
                        <s.icon size={26} aria-hidden="true" />
                      </span>
                      <span className="absolute -right-2 -top-2 grid h-7 w-7 place-items-center rounded-full border-2 border-white bg-navy font-display text-xs font-extrabold text-white shadow">
                        {i + 1}
                      </span>
                    </div>
                    <div className="sm:mt-6">
                      <h3 className="font-display text-xl font-bold text-navy">{s.title}</h3>
                      <p className="mt-2 text-[0.95rem] leading-relaxed text-muted">{s.text}</p>
                    </div>
                  </div>
                </Tilt3D>
              </Reveal>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
