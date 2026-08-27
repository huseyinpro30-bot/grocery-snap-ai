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
