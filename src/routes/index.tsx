import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { Camera, ImagePlus, Leaf, RefreshCw, Sparkles, Lock, Zap } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ResultCard } from "@/components/grocery/ResultCard";
import { analyzeGrocery } from "@/lib/grocery.functions";
import { fileToCompressedDataUrl } from "@/lib/image";
import { GOALS, useBasket, useHistory, useScanQuota, FREE_SCANS_PER_DAY } from "@/lib/cartwise";
import { KEYS, useLocalStore } from "@/lib/local-store";
import heroImage from "@/assets/hero-groceries.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Cartwise — Scan Groceries, Shop Smarter with AI" },
      {
        name: "description",
        content:
          "Snap a photo of any product or shelf and Cartwise scores it against your goal, flags what's inside, and suggests better swaps.",
      },
      { property: "og:title", content: "Cartwise — Scan Groceries, Shop Smarter with AI" },
      {
        property: "og:description",
        content: "AI grocery scanner: photo in, verdict out. Match scores, label flags and smarter swaps.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ScanPage,
});

function ScanPage() {
  const [goal, setGoal] = useLocalStore<string>(KEYS.goal, "balanced");
  const [note, setNote] = useLocalStore<string>(KEYS.note, "");
  const [preview, setPreview] = useState<string | null>(null);
  const [, setItems] = useBasket();
  const [, setHistory] = useHistory();
  const quota = useScanQuota();

  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  const analyze = useServerFn(analyzeGrocery);
  const mutation = useMutation({
    mutationFn: (image: string) => analyze({ data: { image, goal, note: note.trim() || undefined } }),
    onError: (e: Error) => toast.error(e.message || "Couldn't read that photo. Try again."),
    onSuccess: (data, image) => {
      quota.consume();
      setHistory((prev) =>
        [{ ...data, id: crypto.randomUUID(), at: Date.now(), goal, image }, ...prev].slice(0, 30),
      );
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    },
  });

  const result = mutation.data;

  function addItem(text: string) {
    setItems((prev) =>
      prev.some((i) => i.text.toLowerCase() === text.toLowerCase())
        ? prev
        : [...prev, { id: crypto.randomUUID(), text, done: false }],
    );
    toast.success(`${text} added to basket`);
  }

  async function handleFile(file?: File | null) {
    if (!file) return;
    if (!quota.canScan) {
      toast.error("You've used today's free scans. Go Pro for unlimited.");
      return;
    }
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setPreview(dataUrl);
      mutation.mutate(dataUrl);
    } catch {
      toast.error("That image couldn't be loaded.");
    }
  }

  return (
    <>
      <input
        ref={cameraRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
      <input
        ref={uploadRef}
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />

      {/* Hero */}
      <header className="relative overflow-hidden">
        <img
          src={heroImage}
          alt="Fresh groceries arranged on a linen cloth"
          width={1600}
          height={1200}
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/85 to-background" />
        <div className="relative mx-auto max-w-5xl px-5 pb-8 pt-10 sm:pt-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-3 py-1 text-xs font-medium backdrop-blur">
            <Leaf className="h-3.5 w-3.5 text-leaf" />
            AI grocery scanner
          </div>
          <h1 className="mt-5 max-w-2xl font-display text-4xl font-semibold leading-[1.05] sm:text-6xl">
            Point your camera at the shelf.
            <span className="block text-primary">We'll tell you what to buy.</span>
          </h1>
          <p className="mt-4 max-w-xl text-base text-muted-foreground">
            Snap a label, a piece of produce or an entire aisle. Cartwise scores it against your goal,
            calls out what's really inside, and hands you smarter swaps.
          </p>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-5 pb-8">
        {/* Quota strip */}
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-border bg-card px-4 py-3">
          <div className="flex items-center gap-2 text-sm">
            {quota.pro ? (
              <>
                <Zap className="h-4 w-4 text-citrus" />
                <span className="font-medium">Cartwise Pro — unlimited scans</span>
              </>
            ) : (
              <>
                <Lock className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">
                  <strong className="text-foreground">{quota.left}</strong> of {FREE_SCANS_PER_DAY} free
                  scans left today
                </span>
              </>
            )}
          </div>
          {!quota.pro && (
            <Link
              to="/pro"
              className="rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground"
            >
              Go Pro · $5/mo
            </Link>
          )}
        </div>

        
       {/* Scanner */}
<section className="surface overflow-hidden">
  <button
  type="button"
  className="relative block aspect-[4/3] w-full cursor-pointer bg-muted text-left"
  onClick={() => {
    if (!mutation.isPending) {
      cameraRef.current?.click();
    }
  }}
  disabled={mutation.isPending}
>
    {preview ? (
      <img
        src={preview}
        alt="Your scanned grocery item"
        className="h-full w-full object-cover"
      />
    ) : (
      <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-fresh text-primary-foreground">
          <Camera className="h-7 w-7" />
        </div>

        <p className="max-w-xs px-6 text-sm text-muted-foreground">
          No photo yet — tap here to take one or upload from your gallery.
        </p>
      </div>
    )}

    {mutation.isPending && (
      <>
        <div className="absolute inset-0 bg-primary/10 backdrop-blur-[2px]" />
        <div className="animate-scan absolute inset-x-0 h-24 bg-gradient-to-b from-transparent via-citrus/50 to-transparent" />
        <div className="absolute inset-x-0 bottom-4 flex justify-center">
          <span className="rounded-full bg-card px-4 py-2 text-sm font-medium shadow-md">
            Reading the label…
          </span>
        </div>
      </>
    )}
  </div>

  <div className="space-y-5 p-6">
    <div>
      <p className="text-xs uppercase tracking-widest text-muted-foreground">
        Shopping goal
      </p>

      <div className="mt-2 flex flex-wrap gap-2">
        {GOALS.map((g) => (
          <button
            key={g.id}
            onClick={() => setGoal(g.id)}
            aria-pressed={goal === g.id}
            className={`rounded-full border px-3.5 py-2 text-sm transition-all ${
              goal === g.id
                ? "border-primary bg-primary text-primary-foreground shadow-sm"
                : "border-border bg-card hover:border-primary/40 hover:bg-secondary"
            }`}
          >
            <span className="mr-1.5">{g.icon}</span>
            {g.label}
          </button>
        ))}
      </div>
    </div>

    <Textarea
      value={note}
      onChange={(e) => setNote(e.target.value)}
      maxLength={300}
      rows={2}
      placeholder="Anything else? e.g. lactose intolerant, cooking for two kids…"
      aria-label="Extra context for the AI"
    />

    <div className="flex flex-col gap-2 sm:flex-row">
      <Button
        size="lg"
        className="flex-1"
        disabled={mutation.isPending}
        onClick={() => cameraRef.current?.click()}
      >
        <Camera className="h-4 w-4" />
        Take a photo
      </Button>

      <Button
        size="lg"
        variant="secondary"
        className="flex-1"
        disabled={mutation.isPending}
        onClick={() => uploadRef.current?.click()}
      >
        <ImagePlus className="h-4 w-4" />
        Upload image
      </Button>

      {preview && !mutation.isPending && (
        <Button
          size="lg"
          variant="ghost"
          aria-label="Re-run analysis"
          onClick={() => mutation.mutate(preview)}
        >
          <RefreshCw className="h-4 w-4" />
        </Button>
      )}
    </div>
  </div>
</section>
        {/* Result */}
        <div ref={resultRef}>
          {result && <ResultCard result={result} onAdd={addItem} image={preview ?? undefined} />}
        </div>

        {!result && (
          <section className="grid gap-3 sm:grid-cols-3">
            {[
              { icon: Camera, title: "Snap anything", body: "Labels, produce, a whole shelf — one photo is enough." },
              { icon: Sparkles, title: "Goal-aware score", body: "Every item is rated against the goal you picked." },
              { icon: Leaf, title: "Better swaps", body: "Get concrete alternatives, straight into your basket." },
            ].map((f) => (
              <div key={f.title} className="surface p-5">
                <f.icon className="h-5 w-5 text-primary" />
                <p className="mt-3 font-display text-base font-semibold">{f.title}</p>
                <p className="mt-1 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </section>
        )}
      </div>
    </>
  );
}
