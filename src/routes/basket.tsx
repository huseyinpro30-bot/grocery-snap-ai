import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { ShoppingList } from "@/components/grocery/ShoppingList";
import { useBasket } from "@/lib/cartwise";

export const Route = createFileRoute("/basket")({
  head: () => ({
    meta: [
      { title: "Your Basket — Cartwise" },
      {
        name: "description",
        content: "Everything Cartwise recommended, in one tickable shopping list you can take to the store.",
      },
      { property: "og:title", content: "Your Basket — Cartwise" },
      {
        property: "og:description",
        content: "A tickable grocery list built from your AI scans.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: BasketPage,
});

function BasketPage() {
  const [items, setItems] = useBasket();
  const done = items.filter((i) => i.done).length;
  const pct = items.length ? Math.round((done / items.length) * 100) : 0;

  return (
    <div className="mx-auto max-w-2xl space-y-5 px-5 py-8">
      <div>
        <h1 className="font-display text-3xl font-semibold">Basket</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {items.length === 0
            ? "Nothing here yet — scan a product to fill it up."
            : `${done} of ${items.length} picked up`}
        </p>
      </div>

      {items.length > 0 && (
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full gradient-fresh transition-[width] duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
      )}

      <ShoppingList
        items={items}
        onAdd={(text) => {
          setItems((prev) =>
            prev.some((i) => i.text.toLowerCase() === text.toLowerCase())
              ? prev
              : [...prev, { id: crypto.randomUUID(), text, done: false }],
          );
        }}
        onToggle={(id) => setItems((prev) => prev.map((i) => (i.id === id ? { ...i, done: !i.done } : i)))}
        onRemove={(id) => setItems((prev) => prev.filter((i) => i.id !== id))}
        onClear={() => {
          setItems([]);
          toast.success("Basket cleared");
        }}
      />
    </div>
  );
}
