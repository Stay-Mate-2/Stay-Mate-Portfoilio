import Image from "next/image";
import type { ReactNode } from "react";
import { ListingArt } from "@/components/ui/ListingArt";

/**
 * CSS/HTML recreations of StayMate app screens (the screen *structure* mirrors the
 * in-development Android app). All people, scores, prices and listings shown are
 * SAMPLE content. The "Shared expenses" screen depicts a PLANNED feature.
 */

export function PhoneFrame({ children, label, className = "" }: { children: ReactNode; label: string; className?: string }) {
  return (
    <div className={`phone-wrap ${className}`}>
      <div className="phone" role="img" aria-label={label}>
        <div className="screen" aria-hidden="true">
          <div className="m-status">
            <span>9:41</span>
            <span>5G ▮▮▮</span>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}

function TabBar({ active }: { active: number }) {
  const tabs = ["Home", "People", "Places", "Inbox", "Profile"];
  return (
    <div className="m-tabbar">
      {tabs.map((t, i) => (
        <div key={t} className={i === active ? "on" : ""}>
          <div className="m-dot" />
          {t}
        </div>
      ))}
    </div>
  );
}

export function WelcomeScreen() {
  return (
    <>
      <div className="m-body" style={{ alignItems: "center", textAlign: "center", justifyContent: "center", gap: "1.1em" }}>
        <Image src="/brand/mark-192.png" alt="" width={192} height={192} style={{ width: "8em", height: "8em" }} />
        <div className="m-brand" style={{ fontSize: "1.9em" }}>
          <span>
            Stay<span style={{ color: "var(--color-emerald-ink)" }}>Mate</span>
          </span>
        </div>
        <div className="m-title" style={{ fontSize: "1.25em" }}>
          Find your people.
          <br />
          Find your place.
          <br />
          <span className="text-gradient">Live better.</span>
        </div>
        <div className="m-sub" style={{ maxWidth: "20em" }}>
          Roommates and places that fit your budget and lifestyle.
        </div>
        <div style={{ width: "100%", display: "grid", gap: "0.6em", marginTop: "0.6em" }}>
          <div className="m-btn">Continue with phone number</div>
          <div className="m-btn alt">I&apos;m a property owner</div>
        </div>
      </div>
      <div className="m-sub" style={{ textAlign: "center", padding: "0 1.5em 1.8em", fontSize: "0.7em" }}>
        Sign in with a one-time code. Your number stays private.
      </div>
    </>
  );
}

function Person({ initials, name, meta, p, tags, tone = "" }: { initials: string; name: string; meta: string; p: number; tags: string[]; tone?: string }) {
  return (
    <div className="m-card" style={{ display: "grid", gap: "0.7em" }}>
      <div className="m-row">
        <div className={`m-avatar ${tone}`}>{initials}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div className="m-name">{name}</div>
          <div className="m-meta">{meta}</div>
        </div>
        <div className="m-ring" style={{ ["--p" as string]: p }}>
          <span>{p}%</span>
        </div>
      </div>
      <div style={{ display: "flex", gap: "0.4em", flexWrap: "wrap" }}>
        {tags.map((t, i) => (
          <span key={t} className={`m-chip ${i === 0 ? "green" : ""}`}>
            {t}
          </span>
        ))}
      </div>
    </div>
  );
}

export function PeopleScreen() {
  return (
    <>
      <div className="m-body">
        <div className="m-between">
          <div>
            <div className="m-title">People</div>
            <div className="m-sub">Matches by lifestyle fit</div>
          </div>
          <span className="m-chip ghost">Sample</span>
        </div>
        <div style={{ display: "flex", gap: "0.4em", overflow: "hidden" }}>
          <span className="m-chip navy">Budget</span>
          <span className="m-chip">Early bird</span>
          <span className="m-chip">Non-smoker</span>
          <span className="m-chip">Veg</span>
        </div>
        <Person initials="AR" name="Aarav, 21" meta="Student · Sample profile" p={92} tags={["Early bird", "Very clean", "Veg"]} />
        <Person initials="MK" name="Meera, 23" meta="Intern · Sample profile" p={84} tags={["Balanced", "Clean", "Quiet"]} tone="g" />
        <Person initials="SD" name="Sam, 24" meta="Working · Sample profile" p={71} tags={["Night owl", "Hybrid"]} tone="n" />
      </div>
      <TabBar active={1} />
    </>
  );
}

export function CompatibilityScreen() {
  const rows: [string, number][] = [
    ["Budget", 95],
    ["Cleanliness", 100],
    ["Sleep schedule", 80],
    ["Food habits", 90],
    ["Study routine", 75],
    ["Noise", 70],
  ];
  return (
    <>
      <div className="m-body">
        <div className="m-title">Compatibility</div>
        <div className="m-card m-row" style={{ gap: "0.9em" }}>
          <div className="m-ring lg" style={{ ["--p" as string]: 86 }}>
            <span>86%</span>
          </div>
          <div>
            <div className="m-name" style={{ fontSize: "1.1em" }}>
              Strong match
            </div>
            <div className="m-meta">You and Aarav (sample) line up on most daily habits.</div>
          </div>
        </div>
        <div className="m-card" style={{ display: "grid", gap: "0.65em" }}>
          {rows.map(([k, v]) => (
            <div key={k} style={{ display: "grid", gap: "0.25em" }}>
              <div className="m-between" style={{ fontSize: "0.82em", fontWeight: 700 }}>
                <span>{k}</span>
                <span style={{ color: "var(--color-muted)" }}>{v}%</span>
              </div>
              <div className="m-track">
                <div className="m-fill" style={{ ["--w" as string]: v }} />
              </div>
            </div>
          ))}
        </div>
        <div className="m-chip green" style={{ alignSelf: "flex-start" }}>
          ✓ Both prefer a tidy home
        </div>
        <div className="m-chip" style={{ alignSelf: "flex-start" }}>
          Talk about: late-night noise
        </div>
      </div>
      <TabBar active={1} />
    </>
  );
}

function PlaceCard({ kind, title, area, rent, deposit }: { kind: "pg" | "private" | "flat"; title: string; area: string; rent: string; deposit: string }) {
  return (
    <div className="m-card" style={{ padding: "0.6em", display: "grid", gap: "0.6em" }}>
      <div className="m-art m-hero-art">
        <ListingArt kind={kind} className="h-full w-full" />
        <span className="m-chip navy" style={{ position: "absolute", left: "0.6em", top: "0.6em" }}>
          Demo
        </span>
      </div>
      <div className="m-between" style={{ padding: "0 0.3em 0.3em" }}>
        <div style={{ minWidth: 0 }}>
          <div className="m-name" style={{ fontSize: "0.95em" }}>
            {title}
          </div>
          <div className="m-meta">{area}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="m-name" style={{ color: "var(--color-royal-700)" }}>
            {rent}
            <span className="m-meta">/mo</span>
          </div>
          <div className="m-meta">Deposit {deposit}</div>
        </div>
      </div>
    </div>
  );
}

export function PlacesScreen() {
  return (
    <>
      <div className="m-body">
        <div className="m-title">Places</div>
        <div className="m-seg">
          <span className="on">All</span>
          <span>PG</span>
          <span>Room</span>
          <span>Flat</span>
        </div>
        <PlaceCard kind="pg" title="Sample PG" area="Near campus · demo" rent="₹7,500" deposit="₹7,500" />
        <PlaceCard kind="flat" title="Sample 2BHK" area="City centre · demo" rent="₹18,000" deposit="₹36,000" />
      </div>
      <TabBar active={2} />
    </>
  );
}

export function ListingScreen() {
  return (
    <>
      <div className="m-body" style={{ gap: "0.65em" }}>
        <div className="m-art m-hero-art" style={{ marginInline: "-0.2em" }}>
          <ListingArt kind="private" className="h-full w-full" />
          <span className="m-chip navy" style={{ position: "absolute", left: "0.7em", top: "0.7em" }}>
            Demo listing
          </span>
        </div>
        <div>
          <div className="m-title" style={{ fontSize: "1.25em" }}>
            Private room, sample
          </div>
          <div className="m-sub">Approximate area shown · exact address shared on request</div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.6em" }}>
          <div className="m-card" style={{ padding: "0.7em" }}>
            <div className="m-meta">Monthly rent</div>
            <div className="m-name" style={{ fontSize: "1.2em" }}>₹9,000</div>
          </div>
          <div className="m-card" style={{ padding: "0.7em" }}>
            <div className="m-meta">Security deposit</div>
            <div className="m-name" style={{ fontSize: "1.2em" }}>₹18,000</div>
          </div>
        </div>
        <div className="m-card" style={{ display: "grid", gap: "0.4em", fontSize: "0.82em" }}>
          <div className="m-between"><span>Est. electricity</span><b>₹600</b></div>
          <div className="m-between"><span>Est. internet</span><b>₹400</b></div>
          <div className="m-between" style={{ borderTop: "1px solid var(--color-line)", paddingTop: "0.4em" }}>
            <span>Estimated real monthly cost</span>
            <b style={{ color: "var(--color-emerald-ink)" }}>₹10,000</b>
          </div>
        </div>
        <div className="m-btn">Request a visit</div>
      </div>
    </>
  );
}

export function CostScreen() {
  const items: [string, string, number, string][] = [
    ["Rent", "₹5,000", 62, "var(--color-royal)"],
    ["Electricity", "₹450", 14, "var(--color-emerald)"],
    ["Internet", "₹300", 9, "#4aa3ff"],
    ["Groceries", "₹800", 15, "var(--color-navy)"],
  ];
  return (
    <>
      <div className="m-body">
        <div className="m-between">
          <div className="m-title">Real cost</div>
          <span className="m-chip ghost">Estimate</span>
        </div>
        <div className="m-card" style={{ textAlign: "center", padding: "1.1em" }}>
          <div className="m-meta">Your share per month · 3 sharing</div>
          <div className="m-title" style={{ fontSize: "2.2em", margin: "0.15em 0" }}>₹6,550</div>
          <div className="m-chip green">vs ₹9,000 rent alone</div>
        </div>
        <div style={{ display: "flex", height: "0.9em", borderRadius: "999px", overflow: "hidden" }}>
          {items.map(([k, , w, c]) => (
            <div key={k} style={{ width: `${w}%`, background: c }} />
          ))}
        </div>
        <div className="m-card" style={{ display: "grid", gap: "0.65em" }}>
          {items.map(([k, v, , c]) => (
            <div key={k} className="m-between" style={{ fontSize: "0.88em" }}>
              <span className="m-row" style={{ gap: "0.5em" }}>
                <i style={{ width: "0.8em", height: "0.8em", borderRadius: "0.3em", background: c, display: "inline-block" }} />
                {k}
              </span>
              <b>{v}</b>
            </div>
          ))}
        </div>
      </div>
      <TabBar active={2} />
    </>
  );
}

export function ExpensesScreen() {
  const rows: [string, string, string][] = [
    ["Groceries", "Paid by Aarav", "₹1,260"],
    ["Wi-Fi bill", "Paid by you", "₹800"],
    ["Cleaning supplies", "Paid by Meera", "₹360"],
  ];
  return (
    <>
      <div className="m-body">
        <div className="m-between">
          <div className="m-title">Shared expenses</div>
          <span className="m-chip" style={{ background: "#fef3c7", color: "#92400e" }}>Planned</span>
        </div>
        <div className="m-card m-between">
          <div>
            <div className="m-meta">You are owed</div>
            <div className="m-title" style={{ fontSize: "1.8em", color: "var(--color-emerald-ink)" }}>₹210</div>
          </div>
          <div className="m-chip">Settle up</div>
        </div>
        <div className="m-card" style={{ display: "grid", gap: "0.8em" }}>
          {rows.map(([a, b, c]) => (
            <div key={a} className="m-between">
              <div>
                <div className="m-name" style={{ fontSize: "0.95em" }}>{a}</div>
                <div className="m-meta">{b} · split equally</div>
              </div>
              <b>{c}</b>
            </div>
          ))}
        </div>
        <div className="m-card" style={{ display: "grid", gap: "0.3em" }}>
          <div className="m-meta">Monthly summary (concept)</div>
          <div className="m-track"><div className="m-fill" style={{ ["--w" as string]: 68 }} /></div>
          <div className="m-meta">68% of the shared budget used</div>
        </div>
      </div>
      <TabBar active={0} />
    </>
  );
}
