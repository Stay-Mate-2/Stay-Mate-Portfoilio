import { faqs } from "@/lib/faq";
import { brand, siteUrl } from "@/lib/site";

/** Structured data limited to verifiable facts: no ratings, reviews, addresses, phone numbers or social profiles. */
export function JsonLd() {
  const graph = [
    {
      "@type": "Organization",
      name: brand.name,
      description: brand.description,
      ...(siteUrl ? { url: siteUrl, logo: `${siteUrl}/brand/mark-512.png` } : {}),
    },
    {
      "@type": "WebSite",
      name: brand.name,
      description: brand.description,
      inLanguage: "en-IN",
      ...(siteUrl ? { url: siteUrl } : {}),
    },
    {
      "@type": "FAQPage",
      mainEntity: faqs.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    },
  ];
  const json = JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: json }} />;
}
