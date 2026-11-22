import { BadgeCheck, EyeOff, Flag, MessageSquareLock, ScanSearch, ShieldCheck } from "lucide-react";
import { Cube3D } from "@/components/ui/Cube3D";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollMotion3D } from "@/components/ui/ScrollMotion3D";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Tilt3D } from "@/components/ui/Tilt3D";

const items = [
  { icon: EyeOff, title: "Privacy-conscious discovery", text: "Your phone number is never shown on your profile, and listings show an approximate area — exact addresses are shared only when an owner approves your enquiry." },
  { icon: ShieldCheck, title: "Secure connections", text: "Sign-in uses one-time codes, and your session is protected while you use the app." },
  { icon: Flag, title: "Reporting & blocking", text: "Report profiles, listings or messages in a couple of taps, and block anyone — they disappear from your feed and chat." },
  { icon: ScanSearch, title: "Listing moderation", text: "New listings are reviewed by a moderator before they appear to people searching." },
  { icon: BadgeCheck, title: "Transparent information", text: "Rent and deposit are always shown separately, and sample content is clearly labelled." },
  { icon: MessageSquareLock, title: "Safer communication", text: "Chat inside StayMate so you can get to know someone before sharing personal contact details." },
];

export function Safety() {
  return (
    <section id="safety" aria-labelledby="safety-title" className="relative isolate overflow-hidden bg-navy py-24 text-white sm:py-32">
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -right-24 -top-24 h-[30rem] w-[30rem] rounded-full bg-royal/35 blur-3xl" />
        <div className="absolute -bottom-24 -left-16 h-[28rem] w-[28rem] rounded-full bg-emerald/25 blur-3xl" />
        <div className="bg-dots absolute inset-0 opacity-[0.12] invert" />
        {/* Floating 3D geometric prism accent */}
        <div className="animate-float-3d absolute right-[7%] top-14 hidden opacity-75 lg:block">
          <Cube3D size={54} variant="dark" />
        </div>
        {/* 3D receding spatial grid horizon */}
        <div
          className="iso-floor-dark absolute inset-x-[-20%] bottom-0 h-[55%] opacity-45"
          style={{
            maskImage: "linear-gradient(to top, #000 10%, transparent 85%)",
            WebkitMaskImage: "linear-gradient(to top, #000 10%, transparent 85%)",
          }}
        />
      </div>
      <div className="wrap">
        <SectionHeading
          id="safety-title"
          tone="dark"
          eyebrow="Safety & trust"
          title={
            <>
              Feel confident about where and <span className="bg-gradient-to-r from-[#6bb4ff] to-emerald bg-clip-text text-transparent">with whom you live.</span>
            </>
          }
        >
          StayMate is designed around privacy and control, so you decide what to share and when.
        </SectionHeading>

        <ScrollMotion3D maxRotateX={3.2} maxShiftY={-10} maxPushZ={-14}>
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((it, i) => (
              <li key={it.title}>
                <Reveal delay={(i % 3) * 80} className="h-full">
                  <Tilt3D
                    tone="dark"
                    className="group h-full rounded-3xl border border-white/15 bg-gradient-to-b from-white/[0.09] to-white/[0.04] p-7 shadow-[0_24px_48px_-24px_rgba(0,0,0,0.65)] backdrop-blur-sm hover:border-emerald/55"
                  >
                    <div className="preserve-3d">
                      <span className="z-pop grid h-12 w-12 place-items-center rounded-2xl border border-emerald/30 bg-emerald/15 text-emerald shadow-[0_10px_24px_-8px_rgba(22,167,101,0.5)] transition-colors group-hover:bg-emerald group-hover:text-navy">
                        <it.icon size={22} aria-hidden="true" />
                      </span>
                      <h3 className="z-pop-sm mt-5 font-display text-xl font-bold">{it.title}</h3>
                      <p className="mt-2 text-[0.96rem] leading-relaxed text-white/75">{it.text}</p>
                    </div>
                  </Tilt3D>
                </Reveal>
              </li>
            ))}
          </ul>
        </ScrollMotion3D>

        <Reveal className="mt-10 rounded-3xl border border-amber-300/35 bg-amber-300/10 p-6 text-[0.95rem] leading-relaxed text-white/85 backdrop-blur-sm sm:p-8">
          <p>
            <b className="text-amber-200">Honest note:</b> StayMate does not currently verify government IDs or property ownership, and no platform can remove every risk. Please meet in
            public first, visit a place in person and avoid paying money before you&apos;ve seen it. Verification options may be explored in the future and will be announced only
            when they actually work.
          </p>
        </Reveal>
      </div>
    </section>
  );
}
