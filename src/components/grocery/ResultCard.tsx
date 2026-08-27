import { Leaf, Plus, Sparkles, TriangleAlert } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScoreDial } from "@/components/grocery/ScoreDial";
import type { Analysis } from "@/lib/grocery.types";

export function ResultCard({
  result,
  onAdd,
  image,
}: {
  result: Analysis;
  onAdd: (text: string) => void;
  image?: string | undefined;
}) {
  return (
    <section className="surface animate-rise space-y-6 overflow-hidden p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          {image && (
            <img
              src={image}
              alt={result.productName}
              className="h-14 w-14 rounded-xl object-cover ring-1 ring-border"
            />
          )}
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">{result.category}</p>
            <h2 className="font-display text-2xl font-semibold">{result.productName}</h2>
          </div>
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
                <Button size="sm" variant="secondary" onClick={() => onAdd(s.name)}>
                  <Plus className="h-3.5 w-3.5" />
                  Add
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {result.listItems.length > 0 && (
        <Button className="w-full" onClick={() => result.listItems.forEach(onAdd)}>
          Add {result.listItems.length} recommended item{result.listItems.length > 1 ? "s" : ""} to basket
        </Button>
      )}
    </section>
  );
}
