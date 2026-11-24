import type { Metadata } from "next";
import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/sections/Navbar";
import { UnsubscribeForm } from "@/components/UnsubscribeForm";

export const metadata: Metadata = {
  title: "Unsubscribe & Data Deletion",
  description: "Withdraw your consent to receive StayMate updates or request deletion of your early-access registration.",
  robots: { index: false, follow: false },
};

export default function UnsubscribePage() {
  return (
    <>
      <Navbar home={false} />
      <main id="main" className="min-h-[80vh] bg-gradient-to-b from-sky/60 to-white px-5 pb-20 pt-32 sm:pt-40">
        <div className="card mx-auto max-w-lg p-7 shadow-lift sm:p-10">
          <p className="eyebrow">Early-access list</p>
          <h1 className="mt-3 font-display text-3xl font-extrabold">Unsubscribe or remove your data</h1>
          <p className="mb-6 mt-3 text-muted">
            Early-access entries are stored privately in our StayMate Google Sheet. Choose an option below to email our team directly from your registered address.
          </p>
          <UnsubscribeForm />
        </div>
      </main>
      <Footer />
    </>
  );
}
