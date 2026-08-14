import { generateText } from "ai";
import { z } from "zod";
import { createLovableAiGatewayProvider } from "./ai-gateway.server";

export type GoalId = string;

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

const GOAL_HINTS: Record<string, string> = {
  balanced: "an everyday balanced diet",
  lowsugar: "cutting added sugar and refined carbs",
  protein: "hitting a high protein target",
  budget: "getting the best value per serving on a tight budget",
  clean: "avoiding ultra-processed foods and additives",
};

export async function analyzeGroceryImage(opts: {
  apiKey: string;
  image: string;
  goal: GoalId;
  note?: string | undefined;
}): Promise<Analysis> {
  const gateway = createLovableAiGatewayProvider(opts.apiKey);
  const goal = GOAL_HINTS[opts.goal] ?? GOAL_HINTS["balanced"];

  const { text } = await generateText({
    model: gateway("google/gemini-2.5-flash"),
    instructions:
      "You are a sharp, friendly grocery shopping assistant. You look at photos of food products, labels, produce or a whole shelf and give a fast, concrete verdict. Be specific and honest, never preachy. Estimate confidently when a label is partly unreadable. Score 0-100 for how well the item fits the shopper's goal: 70+ = buy, 40-69 = okay, below 40 = skip. Keep every string short (summary max 2 sentences, flags max 10 words). listItems are shopping-list-ready item names for what you'd actually recommend buying. Reply with ONLY a JSON object (no markdown fences) matching: {productName: string, category: string, score: number 0-100, verdict: 'buy'|'okay'|'skip', summary: string, nutrition: [{label, value}] (up to 5), flags: [{kind: 'good'|'watch', text}] (up to 5), swaps: [{name, why}] (up to 3), listItems: string[] (up to 4)}.",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `Shopper goal: ${goal}.${opts.note ? ` Extra context: ${opts.note}` : ""} Analyze this grocery photo.`,
          },
          { type: "file", mediaType: "image/jpeg", data: opts.image },
        ],
      },
    ],
  });

  const cleaned = text.trim().replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
  const parsed = AnalysisSchema.parse(JSON.parse(cleaned));
  return {
    ...parsed,
    nutrition: parsed.nutrition.slice(0, 6),
    flags: parsed.flags.slice(0, 6),
    swaps: parsed.swaps.slice(0, 3),
    listItems: parsed.listItems.slice(0, 5),
  };
}
