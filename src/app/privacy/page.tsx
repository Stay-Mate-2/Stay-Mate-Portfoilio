import type { Metadata } from "next";
import Link from "next/link";
import { LegalLayout } from "@/components/LegalLayout";
import { contactEmail, siteUrl } from "@/lib/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How the StayMate early-access website collects, uses and protects your information.",
  ...(siteUrl ? { alternates: { canonical: "/privacy" } } : {}),
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy" updated="November 2026 (draft)">
      <section>
        <h2>1. What this covers</h2>
        <p>
          This policy explains what happens to your information when you use the StayMate pre-launch website and join the early-access list. It does not yet cover the StayMate
          mobile app, which will have its own policy before launch.
        </p>
      </section>
      <section>
        <h2>2. What we collect</h2>
        <p>If you join the early-access list we collect only:</p>
        <ul>
          <li>Your name and email address.</li>
          <li>Whether you are a student, working professional or property owner.</li>
          <li>Your preferred city, if you choose to provide it.</li>
          <li>A record of your consent: when you gave it and which version of the consent wording you agreed to.</li>
          <li>A one-way hashed form of your IP address, used only to detect spam and abuse. Your raw IP address is not stored with your registration.</li>
        </ul>
        <p className="mt-3">
          The interactive demos on this site (compatibility, cost calculator, listings filter, shared-living tools) run entirely in your browser. What you type into them is not sent to
          us or stored.
        </p>
      </section>
      <section>
        <h2>3. Cookies and analytics</h2>
        <p>This website does not set advertising or analytics cookies and does not load third-party trackers.</p>
      </section>
      <section>
        <h2>4. Why we use it</h2>
        <p>
          We use your details to send product updates and early-access news about StayMate, and only if you ticked the consent box. We do not sell your information and we do not share it
          for advertising.
        </p>
      </section>
      <section>
        <h2>5. Withdrawing consent</h2>
        <p>
          You can withdraw your consent at any time on the <Link href="/unsubscribe">unsubscribe page</Link>. After you withdraw, we will not send you further product updates.
        </p>
      </section>
      <section>
        <h2>6. Storage and security</h2>
        <p>
          Registrations are sent over an encrypted connection to the StayMate server and stored in a database that is not publicly accessible. Access is limited to authorised StayMate
          administrators. No system is perfectly secure, but we limit what we collect so there is less to protect.
        </p>
      </section>
      <section>
        <h2>7. How long we keep it</h2>
        <p>The retention period will be confirmed before public launch. Until then, details are kept only for the purpose of early-access communication.</p>
      </section>
      <section>
        <h2>8. Your rights and contact</h2>
        <p>
          You may ask to access, correct or erase your information.{" "}
          {contactEmail ? (
            <>Contact us at <a href={`mailto:${contactEmail}`}>{contactEmail}</a>.</>
          ) : (
            <>A contact and grievance address will be published here before launch.</>
          )}
        </p>
      </section>
    </LegalLayout>
  );
}
