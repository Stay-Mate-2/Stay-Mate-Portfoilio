import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

export function SectionHeading({
  eyebrow,
  title,
  children,
  align = "left",
  tone = "light",
  id,
}: {
  eyebrow: string;
  title: ReactNode;
  children?: ReactNode;
  align?: "left" | "center";
  tone?: "light" | "dark";
  id?: string;
}) {
  const center = align === "center";
  return (
    <Reveal className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}>
      <p className={`eyebrow ${tone === "dark" ? "!text-emerald" : ""}`}>{eyebrow}</p>
      <h2
        id={id}
        className={`mt-4 font-display text-[clamp(1.95rem,4.4vw,3.1rem)] font-extrabold leading-[1.08] ${
          tone === "dark" ? "text-white" : "text-navy"
        }`}
      >
        {title}
      </h2>
      {children ? (
        <p className={`mt-5 text-lg leading-relaxed ${tone === "dark" ? "text-white/75" : "text-muted"}`}>{children}</p>
      ) : null}
    </Reveal>
  );
}

/** Small honest-labelling pill used for demo / illustrative / planned content. */
export function Label({
  children,
  tone = "blue",
}: {
  children: ReactNode;
  tone?: "blue" | "green" | "navy" | "amber";
}) {
  const tones = {
    blue: "bg-sky text-royal-700 border-royal/20",
    green: "bg-mint text-emerald-ink border-emerald/30",
    navy: "bg-navy text-white border-navy",
    amber: "bg-amber-50 text-amber-800 border-amber-300/60",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold tracking-wide ${tones[tone]}`}
    >
      {children}
    </span>
  );
}
