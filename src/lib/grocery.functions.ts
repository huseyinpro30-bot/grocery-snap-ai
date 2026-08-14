import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { analyzeGroceryImage, type GoalId } from "./grocery.server";

const AnalyzeInput = z.object({
  image: z.string().min(32),
  goal: z.string().min(1),
  note: z.string().max(300).optional(),
});

export const analyzeGrocery = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => AnalyzeInput.parse(input))
  .handler(async ({ data }) => {
    const key = process.env["LOVABLE_API_KEY"];
    if (!key) throw new Error("AI is not configured yet.");
    return analyzeGroceryImage({
      apiKey: key,
      image: data.image,
      goal: data.goal as GoalId,
      note: data.note,
    });
  });
