import { generateText } from "ai";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";
import {
  AnalysisSchema,
  CompareSchema,
  RecipeSchema,
  type Analysis,
  type Comparison,
  type RecipeResult,
} from "./grocery.types";

export type GoalId = string;

export { AnalysisSchema };
export type { Analysis };

const MODEL = "google/gemini-2.5-flash";

const GOAL_HINTS: Record<string, string> = {
  balanced: "an everyday balanced diet",
  lowsugar: "cutting added sugar and refined carbs",
  protein: "hitting a high protein target",
  budget: "getting the best value per serving on a tight budget",
  clean: "avoiding ultra-processed foods and additives",
};

function stripFences(text: string) {
  return text
    .trim()
    .replace(/^```(?:json)?/i, "")
    .replace(/```$/, "")
    .trim();
}

export async function analyzeGroceryImage(opts: {
  apiKey: string;
  image: string;
  goal: GoalId;
  note?: string | undefined;
  profile?: string | undefined;
}): Promise<Analysis> {
  const gateway = createLovableAiGatewayProvider(opts.apiKey);
  const goal = GOAL_HINTS[opts.goal] ?? GOAL_HINTS["balanced"];

  const { text } = await generateText({
    model: gateway(MODEL),
    instructions:
      "You are a sharp, friendly grocery shopping assistant. You look at photos of food products, labels, produce or a whole shelf and give a fast, concrete verdict. Be specific and honest, never preachy. Estimate confidently when a label is partly unreadable. Score 0-100 for how well the item fits the shopper's goal: 70+ = buy, 40-69 = okay, below 40 = skip. Respect allergies and diet restrictions strictly — anything the shopper must avoid is an automatic 'skip' with a watch flag. Keep every string short (summary max 2 sentences, flags max 10 words). listItems are shopping-list-ready item names for what you'd actually recommend buying. Reply with ONLY a JSON object (no markdown fences) matching: {productName: string, category: string, score: number 0-100, verdict: 'buy'|'okay'|'skip', summary: string, nutrition: [{label, value}] (up to 5), flags: [{kind: 'good'|'watch', text}] (up to 5), swaps: [{name, why}] (up to 3), listItems: string[] (up to 4)}.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Shopper goal: ${goal}.${opts.profile ?? ""}${opts.note ? ` Extra context: ${opts.note}` : ""} Analyze this grocery photo.`,
          },
          { type: "file", mediaType: "image/jpeg", data: opts.image },
        ],
      },
    ],
  });

  const parsed = AnalysisSchema.parse(JSON.parse(stripFences(text)));
  return {
    ...parsed,
    nutrition: parsed.nutrition.slice(0, 6),
    flags: parsed.flags.slice(0, 6),
    swaps: parsed.swaps.slice(0, 3),
    listItems: parsed.listItems.slice(0, 5),
  };
}

export async function compareProducts(opts: {
  apiKey: string;
  imageA: string;
  imageB: string;
  goal: GoalId;
  profile?: string | undefined;
}): Promise<Comparison> {
  const gateway = createLovableAiGatewayProvider(opts.apiKey);
  const goal = GOAL_HINTS[opts.goal] ?? GOAL_HINTS["balanced"];

  const { text } = await generateText({
    model: gateway(MODEL),
    instructions:
      "You compare two grocery products from photos and declare a winner for this shopper. Be decisive and concrete; cite ingredients, nutrition or value. Never break the shopper's allergy or diet rules. Reply with ONLY a JSON object (no fences): {winner: 'a'|'b'|'tie', headline: string (max 12 words), a: {name, score 0-100, note (max 15 words)}, b: {name, score 0-100, note (max 15 words)}, reasons: string[] (2-4 items, max 14 words each)}.",
    messages: [
      {
        role: "user",
        content: [
          { type: "text", text: `Shopper goal: ${goal}.${opts.profile ?? ""} Product A:` },
          { type: "file", mediaType: "image/jpeg", data: opts.imageA },
          { type: "text", text: "Product B:" },
          { type: "file", mediaType: "image/jpeg", data: opts.imageB },
        ],
      },
    ],
  });

  return CompareSchema.parse(JSON.parse(stripFences(text)));
}

export async function suggestRecipes(opts: {
  apiKey: string;
  items: string[];
  goal: GoalId;
  profile?: string | undefined;
}): Promise<RecipeResult> {
  const gateway = createLovableAiGatewayProvider(opts.apiKey);
  const goal = GOAL_HINTS[opts.goal] ?? GOAL_HINTS["balanced"];

  const { text } = await generateText({
    model: gateway(MODEL),
    instructions:
      "You turn a shopping basket into quick, realistic meals. Use mostly what's already in the basket; list at most 3 cheap missing extras per recipe. Respect allergies and diets strictly. Reply with ONLY a JSON object (no fences): {recipes: [{title, minutes: number, description (max 20 words), uses: string[], missing: string[], steps: string[] (3-5 short steps)}]} with exactly 3 recipes.",
    prompt: `Shopper goal: ${goal}.${opts.profile ?? ""} Basket: ${opts.items.join(", ")}.`,
  });

  const parsed = RecipeSchema.parse(JSON.parse(stripFences(text)));
  return { recipes: parsed.recipes.slice(0, 3) };
}
