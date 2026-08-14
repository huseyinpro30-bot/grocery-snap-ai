import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { useEffect, useRef, useState } from "react";
import { Camera, ImagePlus, Leaf, Sparkles, TriangleAlert, RefreshCw, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScoreDial } from "@/components/grocery/ScoreDial";
import { ShoppingList, type ListItem } from "@/components/grocery/ShoppingList";
import { analyzeGrocery } from "@/lib/grocery.functions";
import { fileToCompressedDataUrl } from "@/lib/image";
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
  component: Index,
});

const GOALS = [
  { id: "balanced", label: "Balanced", icon: "🥗" },
  { id: "lowsugar", label: "Low sugar", icon: "🍬" },
  { id: "protein", label: "High protein", icon: "💪" },
  { id: "budget", label: "Best value", icon: "🏷️" },
  { id: "clean", label: "Less processed", icon: "🌾" },
];

const STORAGE_KEY = "cartwise.basket";

function Index() {
  const [goal, setGoal] = useState("balanced");
  const [note, setNote] = useState("");
  const [preview, setPreview] = useState<string | null>(null);
  const [items, setItems] = useState<ListItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const cameraRef = useRef<HTMLInputElement>(null);
  const uploadRef = useRef<HTMLInputElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {
      /* ignore */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const analyze = useServerFn(analyzeGrocery);
  const mutation = useMutation({
    mutationFn: (image: string) => analyze({ data: { image, goal, note: note.trim() || undefined } }),
    onError: (e: Error) => toast.error(e.message || "Couldn't read that photo. Try again."),
    onSuccess: () => {
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }), 80);
    },
  });

  const result = mutation.data;

  async function handleFile(file?: File | null) {
    if (!file) return;
    try {
      const dataUrl = await fileToCompressedDataUrl(file);
      setPreview(dataUrl);
      mutation.mutate(dataUrl);
    } catch {
      toast.error("That image couldn't be loaded.");
    }
  }

  function addItem(text: string) {
    setItems((prev) =>
      prev.some((i) => i.text.toLowerCase() === text.toLowerCase())
        ? prev
        : [...prev, { id: crypto.randomUUID(), text, done: false }],
    );
    toast.success(`${text} added to basket`);
  }

  return (
    <main className="min-h-screen bg-background">
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
        <div className="relative mx-auto max-w-5xl px-5 pb-10 pt-14 sm:pt-20">
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

      <div className="mx-auto grid max-w-5xl gap-6 px-5 pb-20 lg:grid-cols-[1.35fr_1fr]">
        <div className="space-y-6">
          {/* Scanner */}
          <section className="surface overflow-hidden">
            <div className="relative aspect-[4/3] w-full bg-muted">
              {preview ? (
                <img src={preview} alt="Your scanned grocery item" className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-2xl gradient-fresh text-primary-foreground">
                    <Camera className="h-7 w-7" />
                  </div>
                  <p className="max-w-xs px-6 text-sm text-muted-foreground">
                    No photo yet — take one in the store or upload from your gallery.
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
                <p className="text-xs uppercase tracking-widest text-muted-foreground">Shopping goal</p>
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
            {result && (
              <section className="surface animate-rise space-y-6 p-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-widest text-muted-foreground">
                      {result.category}
                    </p>
                    <h2 className="font-display text-2xl font-semibold">{result.productName}</h2>
                  </div>
                  <ScoreDial score={result.score} verdict={result.verdict} />
                </div>

                <p className="text-[15px] leading-relaxed text-foreground/90">{result.summary}</p>

                {result.nutrition.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                    {result.nutrition.map((n) => (
                      <div key={n.label} className="rounded-xl bg-muted/70 px-3 py-2.5">
                        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{n.label}</p>
                        <p className="font-display text-base font-semibold">{n.value}</p>
                      </div>
                    ))}
                  </div>
                )}

                {result.flags.length > 0 && (
                  <ul className="space-y-2">
                    {result.flags.map((f, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-sm">
                        {f.kind === "good" ? (
                          <Leaf className="mt-0.5 h-4 w-4 shrink-0 text-leaf" />
                        ) : (
                          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0 text-berry" />
                        )}
                        <span>{f.text}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {result.swaps.length > 0 && (
                  <div>
                    <p className="flex items-center gap-2 text-xs uppercase tracking-widest text-muted-foreground">
                      <Sparkles className="h-3.5 w-3.5 text-citrus" /> Smarter swaps
                    </p>
                    <div className="mt-3 space-y-2">
                      {result.swaps.map((s) => (
                        <div
                          key={s.name}
                          className="flex items-center justify-between gap-3 rounded-xl border border-border p-3"
                        >
                          <div>
                            <p className="text-sm font-medium">{s.name}</p>
                            <p className="text-xs text-muted-foreground">{s.why}</p>
                          </div>
                          <Button size="sm" variant="secondary" onClick={() => addItem(s.name)}>
                            <Plus className="h-3.5 w-3.5" />
                            Add
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {result.listItems.length > 0 && (
                  <Button
                    className="w-full"
                    onClick={() => {
                      result.listItems.forEach(addItem);
                    }}
                  >
                    Add {result.listItems.length} recommended item
                    {result.listItems.length > 1 ? "s" : ""} to basket
                  </Button>
                )}
              </section>
            )}
          </div>
        </div>

        <div className="lg:sticky lg:top-6 lg:self-start">
          <ShoppingList
            items={items}
            onAdd={addItem}
            onToggle={(id) =>
              setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))
            }
            onRemove={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
            onClear={() => setItems([])}
          />
        </div>
      </div>
    </main>
  );
}
