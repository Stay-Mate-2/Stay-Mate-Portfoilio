/**
 * Central, env-driven site configuration.
 * Nothing here is invented: optional contact details/social links are rendered
 * ONLY when the corresponding environment variable is set.
 */

function clean(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

function cleanUrl(value: string | undefined): string | undefined {
  const v = clean(value);
  if (!v) return undefined;
  try {
    const u = new URL(v);
    if (u.protocol !== "https:" && u.protocol !== "http:") return undefined;
    return u.toString().replace(/\/$/, "");
  } catch {
    return undefined;
  }
}

/** Production origin, e.g. https://staymate.example. `undefined` until configured. */
export const siteUrl: string | undefined =
  cleanUrl(process.env.NEXT_PUBLIC_SITE_URL) ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL
    ? cleanUrl(`https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`)
    : undefined);

/** Early-access form is only submittable when explicitly enabled at build time. */
export const waitlistEnabled = process.env.NEXT_PUBLIC_WAITLIST_ENABLED === "true";

export const contactEmail = clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL);

export const socialLinks = [
  { label: "Instagram", href: cleanUrl(process.env.NEXT_PUBLIC_INSTAGRAM_URL) },
  { label: "LinkedIn", href: cleanUrl(process.env.NEXT_PUBLIC_LINKEDIN_URL) },
  { label: "X", href: cleanUrl(process.env.NEXT_PUBLIC_X_URL) },
  { label: "YouTube", href: cleanUrl(process.env.NEXT_PUBLIC_YOUTUBE_URL) },
].filter((s): s is { label: string; href: string } => Boolean(s.href));

export const brand = {
  name: "StayMate",
  tagline: "Find your people. Find your place. Live better.",
  title: "StayMate — Find Roommates. Discover Affordable Places. Live Better.",
  description:
    "Discover compatible roommates, affordable PGs, rooms and shared accommodation. StayMate makes shared living smarter, safer and more affordable.",
} as const;

export const navLinks = [
  { href: "#top", label: "Home" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#features", label: "Features" },
  { href: "#students", label: "For Students" },
  { href: "#owners", label: "For Property Owners" },
  { href: "#about", label: "About" },
  { href: "#faq", label: "FAQ" },
] as const;
