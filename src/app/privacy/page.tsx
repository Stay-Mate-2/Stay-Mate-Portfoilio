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
          This policy explains how StayMate collects, processes, stores, and protects information submitted through our pre-launch website and its embedded early-access registration form.
          The future StayMate mobile application will publish its own dedicated privacy notice before launch.
        </p>
      </section>

      <section>
        <h2>2. Information we collect</h2>
        <p>When our early-access Google Form is open and you choose to submit it, we collect only:</p>
        <ul>
          <li>Your email address (collected by Google Forms to email a confirmation copy of your entry).</li>
          <li>Your full name.</li>
          <li>Your selected category (Student, Working Professional, or Property Owner).</li>
          <li>Your preferred city, only if you choose to fill in that optional field.</li>
          <li>Your optional email updates preference and the submission timestamp recorded by Google Forms.</li>
        </ul>
        <p className="mt-3">
          We do not request passwords, Aadhaar/government identity documents, phone numbers, or payment details on this website. Interactive tools on the landing page (compatibility
          demo, monthly cost calculator, listing filters, and planned shared-living previews) run locally in your browser without transmitting entries.
        </p>
      </section>

      <section>
        <h2>3. How your information is used</h2>
        <ul>
          <li>
            <strong>Automatic registration confirmation:</strong> Google Forms automatically sends a copy of your submitted responses to your email address so you have confirmation that your
            entry was received.
          </li>
          <li>
            <strong>Optional product updates:</strong> Launch announcements or progress emails are sent only if you explicitly select the optional email updates permission checkbox on the form.
          </li>
          <li>
            <strong>Abuse &amp; spam protection:</strong> Submission validation and automated abuse checks are handled by Google Forms over HTTPS.
          </li>
        </ul>
      </section>

      <section>
        <h2>4. Infrastructure, storage &amp; third-party processors</h2>
        <p>StayMate uses the following infrastructure solely to serve this website, collect registrations, and manage records—we never sell your data or share it for advertising:</p>
        <ul>
          <li>
            <strong>Vercel:</strong> Hosts the static pre-launch website pages and assets over HTTPS, with a strict Content Security Policy permitting embedded registration frames solely from{" "}
            <code>https://docs.google.com</code>.
          </li>
          <li>
            <strong>Google Forms (<code>docs.google.com</code>):</strong> Displays the embedded early-access form inside the page, receives your submitted answers, and emails your
            confirmation receipt.
          </li>
          <li>
            <strong>Google Sheets (<code>StayMate_Early_Access_Database</code>) &amp; Gmail (<code>{contactEmail}</code>):</strong> Stores submitted responses in a private, restricted
            spreadsheet accessible only to authorized StayMate administrators.
          </li>
        </ul>
      </section>

      <section>
        <h2>5. Withdrawing marketing consent &amp; deleting your record</h2>
        <p>
          You can opt out of optional updates or request full deletion of your registration row at any time via the <Link href="/unsubscribe">unsubscribe page</Link> or by emailing{" "}
          <a href={`mailto:${contactEmail}`}>{contactEmail}</a> directly from your registered email address with &ldquo;Delete My Registration Data&rdquo; or &ldquo;Withdraw Marketing Updates&rdquo;
          in the subject line. An administrator will verify address ownership and update or permanently erase your spreadsheet entry within 7 days.
        </p>
      </section>

      <section>
        <h2>6. Data retention</h2>
        <p>
          Early-access records are retained only during the pre-launch period (and up to 12 months after initial cohort rollout unless deleted earlier on request or converted into an active
          user account with separate in-app consent).
        </p>
      </section>

      <section>
        <h2>7. Security &amp; cookies</h2>
        <p>
          All website pages and embedded form traffic are served over HTTPS, and third-party frame origins are restricted via Content Security Policy headers. StayMate itself sets no
          advertising or analytics cookies on this website; when you interact with the embedded Google Form, Google&apos;s Privacy Policy applies within the <code>docs.google.com</code> frame.
        </p>
      </section>
    </LegalLayout>
  );
}
