import Link from "next/link";
import { Footer } from "@/components/sections/Footer";
import { Navbar } from "@/components/sections/Navbar";
import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <>
      <Navbar home={false} />
      <main id="main" className="grid min-h-[80vh] place-items-center px-6 pt-28 pb-20 text-center">
        <div>
          <p className="eyebrow justify-center">Error 404</p>
          <h1 className="mt-4 font-display text-5xl font-extrabold">This page moved out.</h1>
          <p className="mx-auto mt-4 max-w-md text-muted">We couldn&apos;t find what you were looking for. Let&apos;s get you back home.</p>
          <div className="mt-8 flex justify-center gap-3">
            <ButtonLink href="/">Back to StayMate</ButtonLink>
            <Link href="/#faq" className="inline-flex h-11 items-center rounded-full px-5 font-semibold text-royal hover:bg-sky">Read the FAQ</Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
