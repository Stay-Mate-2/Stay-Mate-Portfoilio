import { normalizeGoogleFormEmbedUrl } from "@/lib/google-form";

/**
 * Central site configuration.
 * Public URLs/emails can be overridden via `NEXT_PUBLIC_*` environment variables.
 * Keep optional social links omitted until real handles exist.
 */

const DEFAULT_CONTACT_EMAIL = "staymate2@gmail.com";

/** Public StayMate Early Access Google Form responder URL (overridable via NEXT_PUBLIC_GOOGLE_FORM_URL). */
const DEFAULT_GOOGLE_FORM_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSfkgrHcY8p0UXaCohq47dpoEJJLA11xA_pbJpG1hqItoDZryw/viewform";

function clean(value: string | undefined): string | undefined {
  const v = value?.trim();
  return v ? v : undefined;
}

function cleanEmail(value: string | undefined): string | undefined {
  const v = clean(value);
  if (!v) return undefined;
  return /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(v) ? v : undefined;
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

export const contactEmail: string =
  cleanEmail(process.env.NEXT_PUBLIC_CONTACT_EMAIL) ?? DEFAULT_CONTACT_EMAIL;

export const googleFormEmbedUrl: string | undefined =
  normalizeGoogleFormEmbedUrl(process.env.NEXT_PUBLIC_GOOGLE_FORM_URL) ??
  normalizeGoogleFormEmbedUrl(DEFAULT_GOOGLE_FORM_URL);

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
  { href: "#why-staymate", label: "Why StayMate" },
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#who-its-for", label: "Who It's For" },
  { href: "#roadmap", label: "What We're Building" },
  { href: "#faq", label: "FAQ" },
] as const;
