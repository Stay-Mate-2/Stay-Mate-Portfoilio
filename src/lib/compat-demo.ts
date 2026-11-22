/**
 * ILLUSTRATIVE compatibility model for the marketing site.
 * This is a simple demo of the *idea* (weighted lifestyle similarity). It is not
 * the production matching engine and the scores are never real user data.
 */

export type FactorKey = "budget" | "cleanliness" | "sleep" | "lifestyle" | "food" | "study" | "noise";

export interface Factor {
  key: FactorKey;
  label: string;
  /** Relative importance (normalised at scoring time). */
  weight: number;
  options: readonly string[];
  /** Optional custom similarity between two option indexes → 0..1 */
  similarity?: (a: number, b: number) => number;
}

// Food options: vegetarian · eggetarian · non-veg · no preference
const foodSimilarity = (a: number, b: number): number => {
  if (a === b) return 1;
  if (a === 3 || b === 3) return 0.9; // "no preference" is flexible with anyone
  const pair = [a, b].sort().join("-");
  if (pair === "0-1") return 0.6;
  if (pair === "1-2") return 0.7;
  return 0.25; // vegetarian vs non-veg: worth discussing kitchen rules
};

export const FACTORS: readonly Factor[] = [
  { key: "budget", label: "Budget", weight: 20, options: ["₹5–8k", "₹8–12k", "₹12–18k", "₹18k+"] },
  { key: "cleanliness", label: "Cleanliness", weight: 15, options: ["Relaxed", "Clean", "Very clean"] },
  { key: "sleep", label: "Sleep schedule", weight: 15, options: ["Early bird", "Moderate", "Night owl"] },
  { key: "lifestyle", label: "Lifestyle", weight: 15, options: ["Structured", "Balanced", "Flexible"] },
  { key: "food", label: "Food habits", weight: 10, options: ["Vegetarian", "Eggetarian", "Non-veg", "No preference"], similarity: foodSimilarity },
  { key: "study", label: "Study / work routine", weight: 10, options: ["On campus", "Hybrid", "Work from home"] },
  { key: "noise", label: "Noise preference", weight: 5, options: ["Quiet", "Moderate", "Lively"] },
] as const;

export type Selection = Record<FactorKey, number>;

export const SAMPLE_PROFILE: Selection = {
  budget: 1,
  cleanliness: 1,
  sleep: 1,
  lifestyle: 1,
  food: 3,
  study: 1,
  noise: 1,
};

export interface FactorResult {
  key: FactorKey;
  label: string;
  weight: number;
  similarity: number; // 0..1
  yours: string;
  theirs: string;
}

export interface CompatResult {
  score: number; // 0..100 integer
  verdict: "Strong match" | "Good match" | "Worth a conversation";
  factors: FactorResult[];
  alignments: FactorResult[]; // best matches
  differences: FactorResult[]; // things to talk about
}

export function scoreCompatibility(you: Selection, other: Selection): CompatResult {
  const totalWeight = FACTORS.reduce((s, f) => s + f.weight, 0);

  const factors: FactorResult[] = FACTORS.map((f) => {
    const max = f.options.length - 1;
    const a = clampIndex(you[f.key], max);
    const b = clampIndex(other[f.key], max);
    const similarity = f.similarity ? f.similarity(a, b) : max === 0 ? 1 : 1 - Math.abs(a - b) / max;
    return {
      key: f.key,
      label: f.label,
      weight: f.weight,
      similarity,
      yours: f.options[a] ?? "",
      theirs: f.options[b] ?? "",
    };
  });

  const raw = factors.reduce((s, f) => s + f.similarity * f.weight, 0) / totalWeight;
  const score = Math.round(raw * 100);
  const verdict = score >= 80 ? "Strong match" : score >= 60 ? "Good match" : "Worth a conversation";

  const byFit = [...factors].sort((x, y) => y.similarity - x.similarity || y.weight - x.weight);
  const alignments = byFit.filter((f) => f.similarity >= 0.75).slice(0, 3);
  const differences = [...byFit].reverse().filter((f) => f.similarity <= 0.5).slice(0, 3);

  return { score, verdict, factors, alignments, differences };
}

function clampIndex(i: number, max: number): number {
  if (!Number.isFinite(i)) return 0;
  return Math.min(max, Math.max(0, Math.round(i)));
}
