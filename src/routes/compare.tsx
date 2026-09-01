import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Scale, ImagePlus, Trophy } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { compareGroceries } from "@/lib/grocery.functions";
import { fileToCompressedDataUrl } from "@/lib/image";
import { GOALS, profileToPrompt, useProfile, useScanQuota } from "@/lib/cartwise";
import { KEYS, useLocalStore } from "@/lib/local-store";

export const Route = createFileRoute("/compare")({
  head: () => ({
    meta: [
      { title: "Compare Two Products — Cartwise" },
      {
        name: "description",
        content:
          "Photograph two grocery products and let Cartwise AI pick the better buy for your goal, diet and budget.",
      },
      { property: "og:title", content: "Compare Two Products — Cartwise" },
      {
        property: "og:description",
        content: "Head-to-head AI grocery comparison: scores, reasons and a clear winner.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ComparePage,
});

function Slot({
  label,
  image,
  onPick,
  disabled,
}: {
  label: string;
  image: string | null;
  onPick: (f: File) => void;
  disabled: boolean;
}) {
  const ref = useRef<HTMLInputElement>(null);
  return (
    <div className="surface overflow-hidden">
      <input
        ref={ref}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => {
          const f = e.target.files?.[0];
          e.target.value = "";
          if (f) onPick(f);
        }}
      />
      <button
        type="button"
        disabled={disabled}
        onClick={() => ref.current?.click()}
        className="relative block aspect-square w-full cursor-pointer bg-muted disabled:cursor-wait"
        aria-label={`Choose photo for ${label}`}
      >
        {image ? (
          <img src={image} alt={label} className="h-full w-full object-cover" />
        ) : (
          <span className="flex h-full flex-col items-center justify-center gap-2 text-muted-foreground">
            <ImagePlus className="h-7 w-7" />
            <span className="text-sm font-medium">{label}</span>
          </span>
        )}
      </button>
    </div>
  );
}

function ComparePage() {
  const [goal, setGoal] = useLocalStore<string>(KEYS.goal, "balanced");
  const [profile] = useProfile();
  const quota = useScanQuota();

  const [a, setA] = useState<string | null>(null);
  const [b, setB] = useState<string | null>(null);

  const run = useServerFn(compareGroceries);
  const mutation = useMutation({
    mutationFn: () =>
      run({ data: { imageA: a!, imageB: b!, goal, profile: profileToPrompt(profile) } }),
    onError: (e: Error) => toast.error(e.message || "Couldn't compare those photos."),
    onSuccess: () => quota.consume(),
  });

  async function pick(which: "a" | "b", file: File) {
    try {
      const url = await fileToCompressedDataUrl(file);
      if (which === "a") setA(url);
      else setB(url);
    } catch {
      toast.error("That image couldn't be loaded.");
    }
  }

  const result = mutation.data;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-5 py-8">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl gradient-fresh text-primary-foreground">
          <Scale className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold">Shelf showdown</h1>
          <p className="text-sm text-muted-foreground">
            Two photos in, one clear winner out.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Slot label="Product A" image={a} disabled={mutation.isPending} onPick={(f) => void pick("a", f)} />
        <Slot label="Product B" image={b} disabled={mutation.isPending} onPick={(f) => void pick("b", f)} />
      </div>

      <div className="flex flex-wrap gap-2">
        {GOALS.map((g) => (
          <button
            key={g.id}
            type="button"
            aria-pressed={goal === g.id}
            onClick={() => setGoal(g.id)}
            className={`rounded-full border px-3.5 py-2 text-sm transition-all ${
              goal === g.id
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border bg-card hover:bg-secondary"
            }`}
          >
            <span className="mr-1.5">{g.icon}</span>
            {g.label}
          </button>
        ))}
      </div>

      <Button
        size="lg"
        className="w-full"
        disabled={!a || !b || mutation.isPending}
        onClick={() => {
          if (!quota.canScan) {
            toast.error("You've used today's free scans. Go Pro for unlimited.");
            return;
          }
          mutation.mutate();
        }}
      >
        {mutation.isPending ? "Weighing them up…" : "Compare"}
      </Button>

      {result && (
        <section className="surface animate-rise space-y-5 p-6">
          <div className="flex items-center gap-2 text-sm font-semibold text-primary">
            <Trophy className="h-4 w-4" />
            {result.headline}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {(["a", "b"] as const).map((side) => {
              const data = result[side];
              const win = result.winner === side;
              return (
                <div
                  key={side}
                  className={`rounded-2xl border p-4 ${
                    win ? "border-primary bg-primary/5" : "border-border"
                  }`}
                >
                  <p className="text-xs uppercase tracking-widest text-muted-foreground">
                    Product {side.toUpperCase()} {win && "· winner"}
                  </p>
                  <p className="mt-1 font-display text-lg font-semibold">{data.name}</p>
                  <p className="font-display text-3xl font-semibold text-primary">{data.score}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{data.note}</p>
                </div>
              );
            })}
          </div>

          <ul className="space-y-2 text-sm">
            {result.reasons.map((r, i) => (
              <li key={i} className="flex gap-2">
                <span className="text-primary">•</span>
                {r}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
