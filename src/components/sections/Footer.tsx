import Link from "next/link";
import { Logo } from "@/components/ui/Logo";
import { brand, contactEmail, navLinks, socialLinks } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="bg-white pt-16 pb-10" aria-labelledby="footer-title">
      <h2 id="footer-title" className="sr-only">StayMate footer</h2>
      <div className="wrap">
        <div className="grid gap-12 border-b border-line pb-12 md:grid-cols-[1.4fr_1fr_1fr]">
          <div className="max-w-sm">
            <Link href="/" aria-label="StayMate home" className="inline-block rounded-full"><Logo /></Link>
            <p className="mt-5 leading-relaxed text-muted">
              {brand.tagline} An India-first, student-focused shared-living platform — in development.
            </p>
          </div>

          <nav aria-label="Footer">
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-navy">Explore</h3>
            <ul className="mt-4 grid gap-2.5">
              {navLinks.map((l) => (
                <li key={l.href}>
                  <Link href={`/${l.href}`} className="text-muted transition-colors hover:text-royal">{l.label}</Link>
                </li>
              ))}
              <li><Link href="/#early-access" className="font-semibold text-royal hover:underline">Join the waitlist</Link></li>
            </ul>
          </nav>

          <div>
            <h3 className="font-display text-sm font-bold uppercase tracking-widest text-navy">Legal &amp; contact</h3>
            <ul className="mt-4 grid gap-2.5">
              <li><Link href="/privacy" className="text-muted transition-colors hover:text-royal">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-muted transition-colors hover:text-royal">Terms &amp; Conditions</Link></li>
              <li><Link href="/unsubscribe" className="text-muted transition-colors hover:text-royal">Unsubscribe</Link></li>
              {contactEmail ? (
                <li><a href={`mailto:${contactEmail}`} className="text-muted transition-colors hover:text-royal">{contactEmail}</a></li>
              ) : null}
              {socialLinks.map((s) => (
                <li key={s.label}>
                  <a href={s.href} target="_blank" rel="noopener noreferrer" className="text-muted transition-colors hover:text-royal">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-2 pt-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p>© {year} StayMate. All rights reserved.</p>
          <p>Previews and sample data on this site are illustrative. StayMate is still in development.</p>
        </div>
      </div>
    </footer>
  );
}
