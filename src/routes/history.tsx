import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { Trash2, Camera } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ResultCard } from "@/components/grocery/ResultCard";
import { GOALS, useBasket, useHistory, verdictTone } from "@/lib/cartwise";

export const Route = createFileRoute("/history")({
  head: () => ({
    meta: [
      { title: "Scan History — Cartwise" },
      {
        name: "description",
        content: "Every product you've scanned with Cartwise, with its score, verdict and swaps saved for later.",
      },
      { property: "og:title", content: "Scan History — Cartwise" },
      { property: "og:description", content: "Revisit past grocery scans, scores and swap suggestions." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: HistoryPage,
});

function HistoryPage() {
  const [history, setHistory] = useHistory();
  const [openId, setOpenId] = useState<string | null>(null);
  const [, setItems] = useBasket();
  const open = history.find((h) => h.id === openId);

  function addItem(text: string) {
    setItems((prev) =>
      prev.some((i) => i.text.toLowerCase() === text.toLowerCase())
        ? prev
        : [...prev, { id: crypto.randomUUID(), text, done: false }],
    );
    toast.success(`${text} added to basket`);
  }

  const avg = history.length
    ? Math.round(history.reduce((s, h) => s + h.score, 0) / history.length)
    : 0;

  return (
    <div className="mx-auto max-w-3xl space-y-5 px-5 py-8">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">History</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {history.length ? `${history.length} scans · average score ${avg}` : "No scans yet."}
          </p>
        </div>
        {history.length > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setHistory([]);
              setOpenId(null);
              toast.success("History cleared");
            }}
          >
            <Trash2 className="h-4 w-4" />
            Clear
          </Button>
        )}
      </div>

      {history.length === 0 && (
        <div className="surface flex flex-col items-center gap-3 p-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-2xl gradient-fresh text-primary-foreground">
            <Camera className="h-6 w-6" />
          </span>
          <p className="text-sm text-muted-foreground">Your scanned products will show up here.</p>
          <Link
            to="/"
            className="rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
          >
            Scan something
          </Link>
        </div>
      )}

      <div className="space-y-2">
        {history.map((h) => {
          const tone = verdictTone(h.verdict);
          const goal = GOALS.find((g) => g.id === h.goal);
          return (
            <button
              key={h.id}
              onClick={() => setOpenId(openId === h.id ? null : h.id)}
              className="surface flex w-full items-center gap-3 p-3 text-left transition-transform hover:-translate-y-0.5"
            >
              {h.image ? (
                <img src={h.image} alt={h.productName} className="h-12 w-12 rounded-xl object-cover" />
              ) : (
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-muted">🛒</span>
              )}
              <span className="min-w-0 flex-1">
                <span className="block truncate font-medium">{h.productName}</span>
                <span className="block text-xs text-muted-foreground">
                  {goal ? `${goal.icon} ${goal.label}` : h.goal} ·{" "}
                  {new Date(h.at).toLocaleDateString(undefined, { month: "short", day: "numeric" })}
                </span>
              </span>
              <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${tone.chip}`}>
                {h.score} · {tone.label}
              </span>
            </button>
          );
        })}
      </div>

      {open && <ResultCard result={open} onAdd={addItem} image={open.image} />}
    </div>
  );
}
