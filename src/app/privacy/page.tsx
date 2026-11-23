import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/LegalLayout";
import { contactEmail, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How the StayMate early-access website collects, processes, stores, and protects your registration information.",
  ...(siteUrl ? { alternates: { canonical: "/privacy" } } : {}),
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="November 2026">
      <section>
        <h2>1. What this covers</h2>
        <p>
          This policy explains how StayMate collects, processes, stores, and protects information submitted on our pre-launch website and early-access registration forms. The future
          StayMate mobile application will publish its own dedicated privacy notice before launch.
        </p>
      </section>

      <section>
        <h2>2. Information we collect</h2>
        <p>When early-access registration is enabled and you register, we collect only:</p>
        <ul>
          <li>Your full name and normalized email address.</li>
          <li>Your selected category (Student, Working Professional, or Property Owner).</li>
          <li>Your preferred city, only if you choose to enter one.</li>
          <li>
            Consent &amp; record metadata: whether you opted in to optional marketing emails, marketing consent timestamp (when opted in), generated Registration ID, submission
            timestamp, and registration status.
          </li>
        </ul>
        <p className="mt-3">
          We do not collect passwords, Aadhaar/government identity documents, payment details, or unnecessary personal fields on this website. Interactive tools on the landing page
          (compatibility demo, monthly cost calculator, listing filters, and planned shared-living previews) run locally in your browser without transmitting entries.
        </p>
      </section>

      <section>
        <h2>3. Purpose &amp; separation of transactional vs. marketing emails</h2>
        <ul>
          <li>
            <strong>Transactional registration emails:</strong> Used strictly to send your registration confirmation (with your reference ID) and to manage your early-access entry.
          </li>
          <li>
            <strong>Optional marketing &amp; product updates:</strong> Sent only if you explicitly tick the separate optional marketing consent checkbox. Your registration confirmation does
            not count as marketing consent.
          </li>
          <li>
            <strong>Abuse &amp; spam prevention:</strong> Our Vercel server computes a keyed one-way HMAC hash of your connection IP and normalized email address for short-lived rate
            limiting in Upstash Redis. Plaintext IP addresses are never written into the registration spreadsheet.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Infrastructure, storage &amp; third-party processors</h2>
        <p>StayMate uses the following infrastructure solely to operate registration, abuse prevention, storage, and email delivery—we never sell your data or share it for advertising:</p>
        <ul>
          <li><strong>Vercel:</strong> Hosts the website and executes server-side input validation, Origin checks, and HMAC-SHA256 signing before forwarding data.</li>
          <li><strong>Upstash Redis:</strong> Stores short-lived, HMAC-hashed rate-limit counters to protect against automated spam and brute force.</li>
          <li>
            <strong>Google Apps Script &amp; Google Sheets (`StayMate_Early_Access_Database`):</strong> Processes signed requests and stores registration records in a private, restricted
            spreadsheet accessible only to authorized StayMate administrators.
          </li>
          <li><strong>Google MailApp:</strong> Sends registration confirmation emails and internal administrator notifications.</li>
        </ul>
      </section>

      <section>
        <h2>5. Withdrawing marketing consent</h2>
        <p>
          You can withdraw your consent to optional marketing updates at any time using the{" "}
          <Link href="/unsubscribe">unsubscribe page</Link>. Submitting your email there sends an authenticated withdrawal request directly to the registration database and sets your
          marketing consent flag to false.
        </p>
      </section>

      <section>
        <h2>6. Data retention &amp; deletion procedure</h2>
        <p>
          Early-access records are retained only during the pre-launch period (and up to 12 months after initial cohort rollout unless withdrawn earlier or converted into an active user
          account with separate in-app consent). Inactive or withdrawn records are purged during periodic database reviews.
        </p>
        <p className="mt-3">
          <strong>How to request access, correction, or complete deletion:</strong>{" "}
          {contactEmail ? (
            <>
              Email us at <a href={`mailto:${contactEmail}`}>{contactEmail}</a> from your registered email address with &ldquo;Early Access Data Deletion&rdquo; in the subject line. An
              authorized StayMate administrator will verify ownership and permanently remove your row from the private registration spreadsheet within 15 days.
            </>
          ) : (
            <>
              You can immediately withdraw marketing updates via the <Link href="/unsubscribe">unsubscribe page</Link>. Once StayMate publishes its support/grievance email before
              public cohort launch, you will also be able to request complete row erasure directly via that address.
            </>
          )}
        </p>
      </section>

      <section>
        <h2>7. Security &amp; cookies</h2>
        <p>
          All traffic uses HTTPS, server secrets remain strictly isolated from browser JavaScript, and server-to-Apps-Script payloads are signed with HMAC-SHA256. No system can
          guarantee absolute security, so we minimize the personal data we request. This site sets no advertising or analytics cookies.
        </p>
      </section>
    </LegalLayout>
  );
}
