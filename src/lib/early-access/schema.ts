import { z } from "zod";

export const USER_TYPES = ["Student", "Working Professional", "Property Owner"] as const;
export type UserType = (typeof USER_TYPES)[number];

export const REGISTRATION_CONSENT_TEXT =
  "I agree to StayMate collecting and storing these details to process my early-access registration and send my registration confirmation, as described in our Privacy Policy.";

export const MARKETING_CONSENT_TEXT =
  "Send me optional StayMate product updates and launch announcements by email (optional — I can withdraw this marketing consent at any time).";

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s'.-]{1,79}$/u;
const CITY_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s'.,-]{0,59}$/u;
const CONTROL_CHAR_RE = /[\x00-\x1F\x7F]/;

const emailField = z
  .string({ error: "Please enter your email address." })
  .trim()
  .min(3, "Please enter your email address.")
  .max(254, "That email address is too long.")
  .refine((v) => !CONTROL_CHAR_RE.test(v), "Invalid characters in email address.")
  .pipe(z.email({ error: "Please enter a valid email address." }))
  .transform((v) => v.toLowerCase());

/**
 * Shared client + server validation schema for registration form inputs.
 */
export const earlyAccessFieldsSchema = z
  .object({
    name: z
      .string({ error: "Please enter your full name." })
      .trim()
      .min(2, "Please enter your name (at least 2 characters).")
      .max(80, "Name must be 80 characters or fewer.")
      .refine((v) => !CONTROL_CHAR_RE.test(v), "Name contains invalid control characters.")
      .regex(NAME_RE, "Name can only contain letters, spaces, apostrophes, dots and hyphens."),
    email: emailField,
    userType: z.enum(USER_TYPES, { error: "Please choose the option that describes you." }),
    city: z
      .string({ error: "Preferred city must be text." })
      .trim()
      .max(60, "City must be 60 characters or fewer.")
      .optional()
      .transform((v) => (v ? v : undefined))
      .refine(
        (v) => v === undefined || (!CONTROL_CHAR_RE.test(v) && CITY_RE.test(v)),
        "City can only contain letters, spaces and basic punctuation.",
      ),
    consent: z.literal(true, { error: "Please tick the box to confirm your registration consent." }),
    marketingConsent: z
      .boolean({ error: "Marketing preference must be true or false." })
      .optional()
      .default(false),
  })
  .strict();

/**
 * Server endpoint schema for POST /api/early-access (includes anti-abuse fields).
 */
export const earlyAccessRequestSchema = earlyAccessFieldsSchema
  .extend({
    honeypot: z.string({ error: "Invalid request." }).max(256).optional(),
    startedAt: z.number().int().positive().optional(),
  })
  .strict();

export const consentWithdrawSchema = z
  .object({
    email: emailField,
    honeypot: z.string({ error: "Invalid request." }).max(256).optional(),
  })
  .strict();

export type EarlyAccessFields = z.input<typeof earlyAccessFieldsSchema>;
export type EarlyAccessPayload = z.infer<typeof earlyAccessRequestSchema>;
export type FieldErrors = Partial<
  Record<"name" | "email" | "userType" | "city" | "consent" | "marketingConsent" | "form", string>
>;

export function toFieldErrors(error: z.ZodError): FieldErrors {
  const out: FieldErrors = {};
  for (const issue of error.issues) {
    const key = (issue.path[0] ?? "form") as keyof FieldErrors;
    if (!(key in out)) out[key] = issue.message;
  }
  return out;
}
