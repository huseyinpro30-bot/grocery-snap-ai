import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import {
  analyzeGroceryImage,
  compareProducts,
  suggestRecipes,
  type GoalId,
} from "./grocery.server";

function requireKey() {
  const key = process.env["LOVABLE_API_KEY"];
  if (!key) throw new Error("AI is not configured yet.");
  return key;
}

const AnalyzeInput = z.object({
  image: z.string().min(32),
  goal: z.string().min(1),
  note: z.string().max(300).optional(),
  profile: z.string().max(400).optional(),
});

export const analyzeGrocery = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data }) =>
    analyzeGroceryImage({
      apiKey: requireKey(),
      image: data.image,
      goal: data.goal as GoalId,
      note: data.note,
      profile: data.profile,
    }),
  );

const CompareInput = z.object({
  imageA: z.string().min(32),
  imageB: z.string().min(32),
  goal: z.string().min(1),
  profile: z.string().max(400).optional(),
});

export const compareGroceries = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => CompareInput.parse(input))
  .handler(async ({ data }) =>
    compareProducts({
      apiKey: requireKey(),
      imageA: data.imageA,
      imageB: data.imageB,
      goal: data.goal as GoalId,
      profile: data.profile,
    }),
  );

const RecipeInput = z.object({
  items: z.array(z.string().min(1)).min(1).max(40),
  goal: z.string().min(1),
  profile: z.string().max(400).optional(),
});

export const recipesFromBasket = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => RecipeInput.parse(input))
  .handler(async ({ data }) =>
    suggestRecipes({
      apiKey: requireKey(),
      items: data.items,
      goal: data.goal as GoalId,
      profile: data.profile,
    }),
  );
