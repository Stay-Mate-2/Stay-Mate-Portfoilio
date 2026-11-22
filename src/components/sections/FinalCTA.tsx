import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { ButtonLink } from "@/components/ui/Button";
import { Cube3D } from "@/components/ui/Cube3D";
import { Reveal } from "@/components/ui/Reveal";
import { ScrollMotion3D } from "@/components/ui/ScrollMotion3D";

export function FinalCTA() {
  return (
    <section aria-labelledby="final-title" className="px-3 pb-3 sm:px-5 sm:pb-5">
      <div className="relative isolate mx-auto max-w-[88rem] overflow-hidden rounded-[2rem] bg-gradient-to-br from-royal via-[#124f9e] to-navy px-6 py-20 text-center text-white shadow-[0_36px_80px_-28px_rgba(16,44,80,0.55)] sm:rounded-[2.5rem] sm:py-28">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute -left-20 top-0 h-96 w-96 rounded-full bg-emerald/35 blur-3xl" />
          <div className="absolute -right-10 bottom-0 h-96 w-96 rounded-full bg-[#4aa3ff]/35 blur-3xl" />
          <div className="bg-dots absolute inset-0 opacity-[0.14] invert" />
          {/* Floating rotating 3D glass prism accents */}
          <div className="animate-float-3d absolute left-[7%] top-12 hidden opacity-80 sm:block">
            <Cube3D size={52} variant="dark" />
          </div>
          <div className="animate-float-3d-alt absolute bottom-12 right-[8%] hidden opacity-80 sm:block">
            <Cube3D size={40} variant="dark" reverse />
          </div>
          {/* 3D receding architectural floor plane */}
          <div
            className="iso-floor-dark absolute inset-x-[-20%] bottom-0 h-[62%] opacity-45"
            style={{
              maskImage: "linear-gradient(to top, #000 10%, transparent 88%)",
              WebkitMaskImage: "linear-gradient(to top, #000 10%, transparent 88%)",
            }}
          />
          <Image src="/brand/mark-512.png" alt="" width={512} height={512} className="animate-float-slow absolute -bottom-24 -right-16 w-[26rem] opacity-[0.1] brightness-0 invert" />
        </div>
        <ScrollMotion3D maxRotateX={4} maxShiftY={-10} maxPushZ={-16}>
          <Reveal className="mx-auto max-w-3xl">
            <h2 id="final-title" className="font-display text-[clamp(2.1rem,5.4vw,4rem)] font-extrabold leading-[1.06]">
              Find your people. Find your place.{" "}
              <span className="bg-gradient-to-r from-[#6ee7b7] to-[#34d399] bg-clip-text text-transparent">
                Start your next chapter.
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-xl text-lg text-white/80">Join the early-access list and be among the first to hear when StayMate is ready.</p>
            <div className="mt-10 flex justify-center">
              <ButtonLink href="#early-access" variant="light" size="lg" className="slab-3d">
                Get Early Access <ArrowRight size={18} aria-hidden="true" />
              </ButtonLink>
            </div>
          </Reveal>
        </ScrollMotion3D>
      </div>
    </section>
  );
}
