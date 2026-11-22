import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/LegalLayout";
import { siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms for using the StayMate pre-launch website.",
  ...(siteUrl ? { alternates: { canonical: "/terms" } } : {}),
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms & Conditions" updated="November 2026 (draft)">
      <section>
        <h2>1. About this website</h2>
        <p>
          This is the pre-launch website for StayMate, a shared-living platform that is still in development. By using it you agree to these terms. They do not yet cover the StayMate
          mobile app, which will have its own terms.
        </p>
      </section>
      <section>
        <h2>2. Previews and sample content</h2>
        <p>
          App screens, profiles, compatibility scores, listings, prices and shared-expense tools shown on this site are illustrative or conceptual. Nothing shown is a real person, a real
          property available to rent, a guarantee of any feature, or a launch commitment.
        </p>
      </section>
      <section>
        <h2>3. Estimates</h2>
        <p>
          The cost calculator produces estimates based only on the numbers you enter. Results are not financial advice and are not verified property prices.
        </p>
      </section>
      <section>
        <h2>4. Early-access list</h2>
        <p>
          Joining the list is free and optional. It does not guarantee access to the app, any benefits, or any launch date. You can leave the list at any time on the{" "}
          <Link href="/unsubscribe">unsubscribe page</Link>. How we handle your information is described in our <Link href="/privacy">Privacy Policy</Link>.
        </p>
      </section>
      <section>
        <h2>5. Acceptable use</h2>
        <p>
          Please do not submit false or other people&apos;s information, attempt to disrupt the website, or use automated tools to submit forms. We may block abusive traffic.
        </p>
      </section>
      <section>
        <h2>6. Safety</h2>
        <p>
          StayMate does not currently verify identity documents or property ownership. Always take sensible precautions when meeting people or paying for accommodation.
        </p>
      </section>
      <section>
        <h2>7. Changes</h2>
        <p>These terms may change as StayMate develops. The latest version will always be on this page.</p>
      </section>
    </LegalLayout>
  );
}
