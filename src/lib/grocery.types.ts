import { z } from "zod";

export const AnalysisSchema = z.object({
  productName: z.string(),
  category: z.string(),
  score: z.number().min(0).max(100),
  verdict: z.enum(["buy", "okay", "skip"]),
  summary: z.string(),
  nutrition: z.array(z.object({ label: z.string(), value: z.string() })),
  flags: z.array(z.object({ kind: z.enum(["good", "watch"]), text: z.string() })),
  swaps: z.array(z.object({ name: z.string(), why: z.string() })),
  listItems: z.array(z.string()),
});

export type Analysis = z.infer<typeof AnalysisSchema>;

export const CompareSchema = z.object({
  winner: z.enum(["a", "b", "tie"]),
  headline: z.string(),
  a: z.object({ name: z.string(), score: z.number().min(0).max(100), note: z.string() }),
  b: z.object({ name: z.string(), score: z.number().min(0).max(100), note: z.string() }),
  reasons: z.array(z.string()),
});

export type Comparison = z.infer<typeof CompareSchema>;

export const RecipeSchema = z.object({
  recipes: z.array(
    z.object({
      title: z.string(),
      minutes: z.number(),
      description: z.string(),
      uses: z.array(z.string()),
      missing: z.array(z.string()),
      steps: z.array(z.string()),
    }),
  ),
});

export type RecipeResult = z.infer<typeof RecipeSchema>;

export type DietProfile = {
  diets: string[];
  allergies: string;
  household: number;
  budget: "tight" | "normal" | "premium";
};

export const DEFAULT_PROFILE: DietProfile = {
  diets: [],
  allergies: "",
  household: 2,
  budget: "normal",
};

export function profileToPrompt(p?: DietProfile | null): string {
  if (!p) return "";
  const bits: string[] = [];
  if (p.diets.length) bits.push(`diet: ${p.diets.join(", ")}`);
  if (p.allergies.trim()) bits.push(`must avoid: ${p.allergies.trim()}`);
  if (p.household) bits.push(`cooking for ${p.household} people`);
  if (p.budget !== "normal")
    bits.push(p.budget === "tight" ? "very tight budget" : "happy to pay for quality");
  return bits.length ? ` Shopper profile — ${bits.join("; ")}.` : "";
}
