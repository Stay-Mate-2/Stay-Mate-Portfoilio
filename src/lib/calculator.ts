/**
 * Pure cost calculations for the "real cost of living" calculator.
 * Results are ESTIMATES derived only from the values a visitor types in.
 *
 * Model:
 *  - Shared monthly items (rent, electricity, internet, groceries, other) are
 *    split equally between everyone sharing.
 *  - Food is a personal monthly cost (mess / tiffin / own cooking per person).
 *  - Deposit is a one-time, refundable-or-not upfront amount, split equally.
 */

export interface CostInputs {
  rent: number;
  deposit: number;
  electricity: number;
  internet: number;
  groceries: number;
  other: number;
  /** Food cost per person per month. */
  food: number;
  /** Number of people sharing (whole number, minimum 1). */
  people: number;
}

export type CostKey = "rent" | "electricity" | "internet" | "groceries" | "other" | "food";

export interface CostBreakdownItem {
  key: CostKey;
  label: string;
  perPerson: number;
}

export interface CostResult {
  people: number;
  /** Everything the household pays together each month (food for all included). */
  householdMonthly: number;
  /** Shared items only (excludes personal food). */
  sharedMonthly: number;
  perPersonMonthly: number;
  depositPerPerson: number;
  /** Upfront cash needed per person in month one: deposit share + first month. */
  firstMonthPerPerson: number;
  breakdown: CostBreakdownItem[];
}

export const MAX_AMOUNT = 1_000_000;
export const MAX_PEOPLE = 8;

export function sanitizeAmount(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.min(Math.round(n), MAX_AMOUNT);
}

export function sanitizePeople(value: unknown): number {
  const n = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(n)) return 1;
  return Math.min(MAX_PEOPLE, Math.max(1, Math.floor(n)));
}

export function calculateCosts(input: CostInputs): CostResult {
  const people = sanitizePeople(input.people);
  const rent = sanitizeAmount(input.rent);
  const deposit = sanitizeAmount(input.deposit);
  const electricity = sanitizeAmount(input.electricity);
  const internet = sanitizeAmount(input.internet);
  const groceries = sanitizeAmount(input.groceries);
  const other = sanitizeAmount(input.other);
  const food = sanitizeAmount(input.food);

  const sharedMonthly = rent + electricity + internet + groceries + other;
  const sharedPerPerson = sharedMonthly / people;
  const perPersonMonthly = sharedPerPerson + food;
  const depositPerPerson = deposit / people;

  const breakdown: CostBreakdownItem[] = [
    { key: "rent", label: "Rent", perPerson: rent / people },
    { key: "electricity", label: "Electricity", perPerson: electricity / people },
    { key: "internet", label: "Internet", perPerson: internet / people },
    { key: "groceries", label: "Groceries", perPerson: groceries / people },
    { key: "other", label: "Other shared", perPerson: other / people },
    { key: "food", label: "Your food", perPerson: food },
  ];

  return {
    people,
    sharedMonthly,
    householdMonthly: sharedMonthly + food * people,
    perPersonMonthly,
    depositPerPerson,
    firstMonthPerPerson: perPersonMonthly + depositPerPerson,
    breakdown,
  };
}

/** ₹ formatting with Indian digit grouping, e.g. ₹1,25,000. */
export function formatINR(value: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(Math.round(value));
}
