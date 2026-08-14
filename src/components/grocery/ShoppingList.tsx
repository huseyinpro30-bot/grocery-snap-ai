import { Check, Plus, Trash2, ShoppingBasket } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export type ListItem = { id: string; text: string; done: boolean };

export function ShoppingList({
  items,
  onAdd,
  onToggle,
  onRemove,
  onClear,
}: {
  items: ListItem[];
  onAdd: (text: string) => void;
  onToggle: (id: string) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
}) {
  const [draft, setDraft] = useState("");
  const remaining = items.filter((i) => !i.done).length;

  return (
    <section className="surface p-6">
      <header className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <ShoppingBasket className="h-5 w-5 text-primary" />
          <h2 className="font-display text-lg font-semibold">Basket</h2>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          {remaining} to grab
        </span>
      </header>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          if (!draft.trim()) return;
          onAdd(draft.trim());
          setDraft("");
        }}
      >
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Add an item…"
          aria-label="Add an item to your basket"
        />
        <Button type="submit" size="icon" aria-label="Add item">
          <Plus className="h-4 w-4" />
        </Button>
      </form>

      <ul className="mt-4 space-y-1">
        {items.length === 0 && (
          <li className="rounded-xl bg-muted/60 px-4 py-6 text-center text-sm text-muted-foreground">
            Scan a product and add the smart picks here.
          </li>
        )}
        {items.map((item) => (
          <li
            key={item.id}
            className="group flex items-center gap-3 rounded-xl px-2 py-2 transition-colors hover:bg-muted/60"
          >
            <button
              onClick={() => onToggle(item.id)}
              aria-label={item.done ? `Mark ${item.text} as not bought` : `Mark ${item.text} as bought`}
              className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-colors ${
                item.done ? "border-primary bg-primary text-primary-foreground" : "border-border"
              }`}
            >
              {item.done && <Check className="h-3.5 w-3.5" />}
            </button>
            <span className={`flex-1 text-sm ${item.done ? "text-muted-foreground line-through" : ""}`}>
              {item.text}
            </span>
            <button
              onClick={() => onRemove(item.id)}
              aria-label={`Remove ${item.text}`}
              className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </li>
        ))}
      </ul>

      {items.length > 0 && (
        <button
          onClick={onClear}
          className="mt-4 text-xs text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Clear basket
        </button>
      )}
    </section>
  );
}
