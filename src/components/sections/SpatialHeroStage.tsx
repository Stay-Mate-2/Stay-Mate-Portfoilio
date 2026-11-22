"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { ShieldCheck, Sparkles, Users, Wallet, Home, Pause, Play } from "lucide-react";
import { CostScreen, PeopleScreen, PhoneFrame, PlacesScreen } from "@/components/mockups/Screens";
import { Cube3D } from "@/components/ui/Cube3D";

type Mode = "people" | "cost" | "places";

const MODES: { id: Mode; label: string; icon: typeof Users }[] = [
  { id: "people", label: "People Match", icon: Users },
  { id: "cost", label: "Real Cost", icon: Wallet },
  { id: "places", label: "Places", icon: Home },
];

/**
 * Interactive kinetic 3D perspective hero stage with pointer-driven depth parallax,
 * auto-orbiting showcase mode, tilted orbital rings, rotating 3D glass prisms,
 * a gliding isometric floor grid, and an interactive 3-phone switcher.
 */
export function SpatialHeroStage() {
  const [active, setActive] = useState<Mode>("people");
  const [autoOrbit, setAutoOrbit] = useState(true);
  const [pausedByHover, setPausedByHover] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);
  const raf = useRef<number | null>(null);
  const canTilt = useRef(false);

  useEffect(() => {
    const fine = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    canTilt.current = fine && !reduced;
    return () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    };
  }, []);

  // Auto-orbit through the 3 app previews every 4.5s unless paused, hovered, or reduced-motion
  useEffect(() => {
    if (!autoOrbit || pausedByHover) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setActive((prev) => {
        const idx = MODES.findIndex((m) => m.id === prev);
        return MODES[(idx + 1) % MODES.length]?.id ?? "people";
      });
    }, 4500);

    return () => window.clearInterval(timer);
  }, [autoOrbit, pausedByHover]);

  function selectMode(mode: Mode) {
    setActive(mode);
    setAutoOrbit(false);
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    if (!canTilt.current || !stageRef.current) return;
    const el = stageRef.current;
    const rect = el.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    const px = (e.clientX - rect.left) / rect.width - 0.5;
    const py = (e.clientY - rect.top) / rect.height - 0.5;
    const rx = (-py * 9).toFixed(2);
    const ry = (px * 11).toFixed(2);

    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = requestAnimationFrame(() => {
      el.style.setProperty("--stage-rx", `${rx}deg`);
      el.style.setProperty("--stage-ry", `${ry}deg`);
      el.style.setProperty("--hud-x", `${(px * 18).toFixed(1)}px`);
      el.style.setProperty("--hud-y", `${(py * 14).toFixed(1)}px`);
    });
  }

  function onPointerLeave() {
    setPausedByHover(false);
    if (!stageRef.current) return;
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    const el = stageRef.current;
    el.style.setProperty("--stage-rx", "0deg");
    el.style.setProperty("--stage-ry", "0deg");
    el.style.setProperty("--hud-x", "0px");
    el.style.setProperty("--hud-y", "0px");
  }

  // Determine slot ('left' | 'center' | 'right') for each device in 3D space
  function slotFor(id: Mode): "left" | "center" | "right" {
    if (id === active) return "center";
    if (active === "people") return id === "cost" ? "left" : "right";
    if (active === "cost") return id === "places" ? "left" : "right";
    return id === "people" ? "left" : "right";
  }

  const slotClasses: Record<"left" | "center" | "right", string> = {
    center:
      "left-[24%] top-0 w-[52%] z-30 opacity-100 [transform:translateZ(64px)_rotateY(0deg)_scale(1)]",
    left:
      "left-[1%] top-[16%] w-[39%] z-10 opacity-95 cursor-pointer hover:opacity-100 [transform:translateZ(-18px)_rotateY(18deg)_rotateX(5deg)_rotateZ(-5deg)_scale(0.92)]",
    right:
      "left-[60%] top-[18%] w-[39%] z-10 opacity-95 cursor-pointer hover:opacity-100 [transform:translateZ(-18px)_rotateY(-18deg)_rotateX(5deg)_rotateZ(5deg)_scale(0.92)]",
  };

  const devices: { id: Mode; label: string; screen: React.ReactNode }[] = [
    { id: "people", label: "StayMate app preview: roommate discovery with sample compatibility scores", screen: <PeopleScreen /> },
    { id: "cost", label: "StayMate app preview: estimated monthly cost breakdown", screen: <CostScreen /> },
    { id: "places", label: "StayMate app preview: places discovery with demo listings", screen: <PlacesScreen /> },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[36rem] lg:max-w-none">
      <div
        ref={stageRef}
        onMouseEnter={() => setPausedByHover(true)}
        onMouseLeave={() => setPausedByHover(false)}
        onFocus={() => setPausedByHover(true)}
        onBlur={() => setPausedByHover(false)}
        onPointerMove={onPointerMove}
        onPointerLeave={onPointerLeave}
        className="perspective-stage relative mx-auto aspect-[1/1.05] w-full max-w-[33rem] select-none"
      >
        {/* Gliding 3D Isometric Architectural Floor Plane & Halo */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-4 bottom-2 top-10 overflow-hidden rounded-[2.5rem] border border-royal/10 bg-gradient-to-br from-sky/80 via-white/40 to-mint/80"
        >
          <div className="iso-floor-light absolute -inset-16 opacity-80" />
          <div className="absolute inset-x-10 bottom-0 h-28 rounded-full bg-gradient-to-r from-royal/20 via-emerald/25 to-royal/15 blur-2xl" />
        </div>

        {/* S-Ribbon echo behind devices */}
        <svg aria-hidden="true" viewBox="0 0 400 400" className="pointer-events-none absolute inset-0 h-full w-full" fill="none">
          <defs>
            <linearGradient id="hero-ribbon-3d" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#1769d2" stopOpacity=".24" />
              <stop offset="1" stopColor="#16a765" stopOpacity=".34" />
            </linearGradient>
          </defs>
          <path
            d="M30 330C90 360 250 380 330 300C410 220 250 200 190 160C130 120 190 40 300 50"
            stroke="url(#hero-ribbon-3d)"
            strokeWidth="36"
            strokeLinecap="round"
          />
        </svg>

        {/* Pointer-tilted 3D Layer Container */}
        <div
          className="preserve-3d relative h-full w-full transition-transform duration-200 ease-out"
          style={{ transform: "rotateX(var(--stage-rx, 0deg)) rotateY(var(--stage-ry, 0deg))" }}
        >
          {/* Tilted 3D Orbital Rings revolving around the showcase */}
          <div
            aria-hidden="true"
            className="preserve-3d pointer-events-none absolute inset-8 sm:inset-4"
            style={{ transform: "translateZ(-28px) rotateX(74deg) rotateY(-12deg)" }}
          >
            <div className="animate-orbit-ring-3d relative h-full w-full rounded-full border-[1.5px] border-dashed border-royal/30">
              <span className="absolute -top-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-royal shadow-[0_0_12px_#1769d2]" />
              <span className="absolute -bottom-1.5 left-1/2 h-3 w-3 -translate-x-1/2 rounded-full bg-emerald shadow-[0_0_12px_#16a765]" />
            </div>
          </div>

          <div
            aria-hidden="true"
            className="preserve-3d pointer-events-none absolute inset-12 sm:inset-8"
            style={{ transform: "translateZ(-12px) rotateX(68deg) rotateY(16deg)" }}
          >
            <div className="animate-orbit-ring-3d-slow relative h-full w-full rounded-full border border-emerald/25">
              <span className="absolute left-0 top-1/2 h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-sky-400 shadow-[0_0_10px_#6bb4ff]" />
            </div>
          </div>

          {/* Translucent Rotating 3D Glass Prism Cubes at staggered Z-depths */}
          <div
            className="preserve-3d pointer-events-none absolute left-[4%] top-[7%] hidden sm:block"
            style={{ transform: "translateZ(-26px)" }}
          >
            <div className="animate-float-3d-alt">
              <Cube3D size={46} variant="light" />
            </div>
          </div>

          <div
            className="preserve-3d pointer-events-none absolute bottom-[6%] right-[5%] hidden sm:block"
            style={{ transform: "translateZ(78px)" }}
          >
            <div className="animate-float-3d">
              <Cube3D size={36} variant="light" reverse />
            </div>
          </div>

          {devices.map((d) => {
            const slot = slotFor(d.id);
            const isCenter = slot === "center";
            return (
              <div
                key={d.id}
                onClick={!isCenter ? () => selectMode(d.id) : undefined}
                role={!isCenter ? "button" : undefined}
                tabIndex={!isCenter ? 0 : undefined}
                aria-label={!isCenter ? `Focus ${d.id} preview in 3D view` : undefined}
                onKeyDown={
                  !isCenter
                    ? (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          selectMode(d.id);
                        }
                      }
                    : undefined
                }
                className={`preserve-3d absolute transition-all duration-700 ease-[cubic-bezier(0.22,1,0.36,1)] ${slotClasses[slot]}`}
              >
                <div className={isCenter ? "animate-float-3d" : "animate-float-3d-alt"}>
                  <PhoneFrame label={d.label}>{d.screen}</PhoneFrame>
                </div>
              </div>
            );
          })}

          {/* Foreground 3D HUD Badges floating at higher Z-depth */}
          <div
            className="pointer-events-none absolute right-[0%] top-[6%] z-50 hidden sm:block transition-transform duration-200 ease-out"
            style={{
              transform: "translate3d(var(--hud-x, 0px), var(--hud-y, 0px), 138px)",
            }}
          >
            <div className="card slab-3d animate-float-3d flex items-center gap-3 rounded-2xl border-royal/20 bg-white/95 px-4 py-3 backdrop-blur-sm">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-emerald to-[#0b7a47] font-display text-sm font-extrabold text-white shadow-md">
                92%
              </span>
              <span className="text-xs leading-tight">
                <b className="flex items-center gap-1 text-navy">
                  Lifestyle match <Sparkles size={12} className="text-emerald" aria-hidden="true" />
                </b>
                <span className="text-muted">Illustrative example</span>
              </span>
            </div>
          </div>

          <div
            className="pointer-events-none absolute bottom-[8%] left-[1%] z-50 hidden sm:block transition-transform duration-200 ease-out"
            style={{
              transform: "translate3d(calc(var(--hud-x, 0px) * -0.7), calc(var(--hud-y, 0px) * -0.7), 134px)",
            }}
          >
            <div className="card slab-3d animate-float-3d-alt flex items-center gap-3 rounded-2xl border-emerald/25 bg-white/95 px-4 py-3 backdrop-blur-sm">
              <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-royal to-[#102c50] font-display text-sm font-extrabold text-white shadow-md">
                ₹
              </span>
              <span className="text-xs leading-tight">
                <b className="block text-navy">Know the real cost</b>
                <span className="text-muted">Estimates you control</span>
              </span>
            </div>
          </div>

          <div
            className="pointer-events-none absolute bottom-[18%] right-[0%] z-50 hidden md:block transition-transform duration-200 ease-out"
            style={{
              transform: "translate3d(calc(var(--hud-x, 0px) * 0.5), calc(var(--hud-y, 0px) * -0.5), 142px)",
            }}
          >
            <div className="slab-3d animate-float-3d flex items-center gap-2 rounded-full border border-white/15 bg-navy px-3.5 py-2 text-xs font-bold text-white shadow-lift">
              <ShieldCheck size={15} className="text-emerald" aria-hidden="true" />
              <span>Phone number hidden</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive 3D Orbit Switcher + Auto-Orbit Control */}
      <div className="mt-4 flex flex-col items-center gap-2.5">
        <div role="group" aria-label="Switch 3D phone preview" className="inline-flex flex-wrap items-center justify-center gap-1.5 rounded-full border border-line bg-white/90 p-1.5 shadow-card backdrop-blur-sm">
          {MODES.map((m) => {
            const on = active === m.id;
            const Icon = m.icon;
            return (
              <button
                key={m.id}
                type="button"
                aria-pressed={on}
                onClick={() => selectMode(m.id)}
                className={`inline-flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                  on
                    ? "bg-navy text-white shadow-md"
                    : "text-navy/75 hover:bg-sky hover:text-royal"
                }`}
              >
                <Icon size={13} aria-hidden="true" />
                {m.label}
              </button>
            );
          })}
          <span className="mx-0.5 hidden h-4 w-px bg-line sm:inline-block" aria-hidden="true" />
          <button
            type="button"
            aria-pressed={autoOrbit}
            aria-label={autoOrbit ? "Pause 3D auto-orbit" : "Play 3D auto-orbit"}
            onClick={() => setAutoOrbit((v) => !v)}
            className={`inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-bold transition-all ${
              autoOrbit
                ? "bg-emerald/15 text-[#0b7a47] hover:bg-emerald/25"
                : "text-muted hover:bg-sky hover:text-royal"
            }`}
          >
            {autoOrbit ? <Pause size={12} aria-hidden="true" /> : <Play size={12} aria-hidden="true" />}
            {autoOrbit ? "Orbiting" : "Orbit"}
          </button>
        </div>
        <p className="text-center text-xs text-muted">
          Interactive 3D concept previews with sample data. Features are in development.
        </p>
      </div>
    </div>
  );
}

