export interface Faq {
  q: string;
  a: string;
}

/** Single source of truth for the FAQ section and its FAQPage structured data. Answers must stay accurate. */
export const faqs: Faq[] = [
  {
    q: "What is StayMate?",
    a: "StayMate is an India-first shared-living Android app in development. It brings together explainable 8-factor roommate matching, moderated PGs, rooms and flats with transparent rent and deposit, a real monthly cost calculator, private in-app chat, and planned shared-expense tools.",
  },
  {
    q: "How is StayMate different from WhatsApp groups or broker sites?",
    a: "Instead of public group chats that expose your phone number or listings that hide deposits and extra bills, StayMate checks hard deal-breakers and lifestyle fit upfront, separates monthly rent from security deposit, reviews listings before they go live, and keeps your phone number and exact street address private until you choose to share.",
  },
  {
    q: "What is already built vs. still being developed?",
    a: "Our pilot Android and backend build already includes phone OTP sign-in, the 8-factor compatibility engine with deal-breaker filters, roommate and property discovery, real-time in-app chat, block/report safety tools, and listing moderation. Right now we are onboarding our early-access cohort and preparing production cloud infrastructure; shared bill-splitting and grocery tools are planned for a later release.",
  },
  {
    q: "Who can use StayMate?",
    a: "StayMate is built for three groups: college and university students, working professionals relocating or flat-sharing, and property owners or PG operators who want to connect with genuine seekers.",
  },
  {
    q: "Is StayMate designed for students?",
    a: "Students are our primary audience, so budgets, shared rooms, PGs and student accommodation are central to the experience. Working professionals and owners are welcome too.",
  },
  {
    q: "Can I find both roommates and accommodation?",
    a: "Yes. StayMate brings both together: you can discover people whose lifestyle fits yours and browse places that fit your budget, in one app.",
  },
  {
    q: "How does compatibility work?",
    a: "You share lifestyle and budget preferences such as cleanliness, sleep schedule, food habits, study or work routine and noise. StayMate compares them, applies any deal-breakers you set, and shows a score with the reasons behind it — where you align and what you may want to talk about. The scores on this website are illustrative examples.",
  },
  {
    q: "Can I compare living costs?",
    a: "Yes. Listings show rent and deposit separately, and the cost calculator on this page lets you add everyday expenses to estimate your monthly share. Results are estimates based on the values you enter.",
  },
  {
    q: "Is StayMate free?",
    a: "We haven't finalised pricing. Joining the early-access list is free and doesn't commit you to anything. We'll be clear about what's free before launch.",
  },
  {
    q: "Will there be premium features?",
    a: "We haven't decided yet. If paid features are ever introduced, we'll explain exactly what they include before you're asked to pay for anything.",
  },
  {
    q: "When will the app launch?",
    a: "We haven't announced a launch date. StayMate is still being built, and the best way to hear about progress is to join the early-access list.",
  },
  {
    q: "How can property owners join?",
    a: "Choose “Property Owner” on the early-access form. Owners will be able to list rooms, PGs and flats, receive visit enquiries and manage availability. Listings are reviewed before they go live.",
  },
];
