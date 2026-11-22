import { About, Audience } from "@/components/sections/Audience";
import { Affordability } from "@/components/sections/Affordability";
import { Compatibility } from "@/components/sections/Compatibility";
import { Discovery } from "@/components/sections/Discovery";
import { EarlyAccess } from "@/components/sections/EarlyAccess";
import { FAQ } from "@/components/sections/FAQ";
import { FinalCTA } from "@/components/sections/FinalCTA";
import { Footer } from "@/components/sections/Footer";
import { Hero } from "@/components/sections/Hero";
import { HowItWorks } from "@/components/sections/HowItWorks";
import { Navbar } from "@/components/sections/Navbar";
import { Problem } from "@/components/sections/Problem";
import { ProductPreview } from "@/components/sections/ProductPreview";
import { Safety } from "@/components/sections/Safety";
import { SharedLiving } from "@/components/sections/SharedLiving";
import { Solution } from "@/components/sections/Solution";
import { JsonLd } from "@/components/JsonLd";
import { waitlistEnabled } from "@/lib/site";

export default function HomePage() {
  return (
    <>
      <JsonLd />
      <Navbar />
      <main id="main">
        <Hero />
        <Problem />
        <Solution />
        <Compatibility />
        <Affordability />
        <Discovery />
        <SharedLiving />
        <Safety />
        <HowItWorks />
        <ProductPreview />
        <Audience />
        <About />
        <EarlyAccess enabled={waitlistEnabled} />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </>
  );
}
