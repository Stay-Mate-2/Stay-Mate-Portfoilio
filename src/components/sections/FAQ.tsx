import { AccordionItem } from "@/components/ui/Accordion";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { faqs } from "@/lib/faq";

export function FAQ() {
  return (
    <section id="faq" aria-labelledby="faq-title" className="bg-white py-24 sm:py-32">
      <div className="wrap grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
        <div className="lg:sticky lg:top-28 lg:self-start">
          <SectionHeading id="faq-title" eyebrow="FAQ" title={<>Questions, <span className="text-gradient">answered.</span></>}>
            Honest answers about what StayMate is today and where it&apos;s headed.
          </SectionHeading>
        </div>
        <Reveal>
          <div className="grid gap-3">
            {faqs.map((f) => (
              <AccordionItem key={f.q} question={f.q}>
                <p>{f.a}</p>
              </AccordionItem>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}
