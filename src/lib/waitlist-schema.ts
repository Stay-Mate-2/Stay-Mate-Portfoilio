import { z } from "zod";

/** Mirrors backend WAITLIST_CONSENT_TEXT_VERSION. Bump when the consent copy changes. */
export const CONSENT_TEXT_VERSION = "2026-11-v1";

export const CONSENT_TEXT =
  "I agree to receive StayMate product updates and early-access news by email. I can withdraw this consent at any time.";

export const WAITLIST_CATEGORIES = ["student", "working_professional", "property_owner"] as const;
export type WaitlistCategory = (typeof WAITLIST_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<WaitlistCategory, string> = {
  student: "Student",
  working_professional: "Working Professional",
  property_owner: "Property Owner",
};

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s'.-]{1,79}$/u;
const CITY_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s'.,-]{0,59}$/u;

const emailField = z
  .string({ error: "Please enter your email address." })
  .trim()
  .min(3, "Please enter your email address.")
  .max(254, "That email address is too long.")
  .pipe(z.email({ error: "Please enter a valid email address." }))
  .transform((v) => v.toLowerCase());

/** Fields collected from the visitor — nothing else is ever requested. */
export const waitlistFieldsSchema = z
  .object({
    name: z
      .string({ error: "Please enter your name." })
      .trim()
      .min(2, "Please enter your name (at least 2 characters).")
      .max(80, "Name must be 80 characters or fewer.")
      .regex(NAME_RE, "Name can only contain letters, spaces, apostrophes, dots and hyphens."),
    email: emailField,
    category: z.enum(WAITLIST_CATEGORIES, { error: "Please choose the option that describes you." }),
    city: z
      .string()
      .trim()
      .max(60, "City must be 60 characters or fewer.")
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine((v) => v === undefined || CITY_RE.test(v), "City can only contain letters, spaces and basic punctuation."),
    consent: z.literal(true, { error: "Please tick the box to agree to receive updates." }),
  })
  .strict();

/** Full request accepted by the website API route (adds anti-spam fields). */
export const waitlistRequestSchema = waitlistFieldsSchema.extend({
  /** Honeypot: real visitors never see or fill this. */
  company: z.string().max(0).optional(),
  /** Client timestamp (ms) of when the form first rendered, for min-fill-time checks. */
  startedAt: z.number().int().positive().optional(),
});

export const unsubscribeRequestSchema = z
  .object({
    email: emailField,
    company: z.string().max(0).optional(),
  })
  .strict();

export type WaitlistFields = z.input<typeof waitlistFieldsSchema>;
export type FieldErrors = Partial<Record<"name" | "email" | "category" | "city" | "consent" | "form", string>>;

/** Flatten a ZodError into `{ field: firstMessage }`. */
export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = (issue.path[0] ?? "form") as keyof FieldErrors;
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
