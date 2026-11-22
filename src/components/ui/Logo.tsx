import Image from "next/image";

/** StayMate logo: the approved mark + a typeset wordmark in the brand colours. */
export function Logo({ className = "", tone = "light", priority = false }: { className?: string; tone?: "light" | "dark"; priority?: boolean }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <Image
        src="/brand/mark-192.png"
        alt=""
        width={192}
        height={192}
        priority={priority}
        className="h-10 w-10 shrink-0"
      />
      <span className="font-display text-[1.45rem] font-extrabold leading-none tracking-tight">
        <span className={tone === "dark" ? "text-white" : "text-navy"}>Stay</span>
        <span className={tone === "dark" ? "text-emerald" : "text-emerald-ink"}>Mate</span>
      </span>
    </span>
  );
}
