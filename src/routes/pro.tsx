import { createFileRoute, Link } from "@tanstack/react-router";
import { Check, Leaf, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/pro")({
  component: ProPage,
});

function ProPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Cartwise
        </Link>

        <div className="mt-10 text-center">
          <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl gradient-fresh text-primary-foreground">
            <Leaf className="h-7 w-7" />
          </div>

          <h1 className="mt-6 font-display text-4xl font-semibold">Cartwise Pro</h1>

          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            Get unlimited grocery scans and make smarter shopping decisions without the daily scan limit.
          </p>
        </div>

        <section className="surface mx-auto mt-8 max-w-md p-6">
          <div className="text-center">
            <p className="text-sm font-medium text-muted-foreground">Monthly plan</p>

            <div className="mt-2">
              <span className="font-display text-5xl font-semibold">$5</span>
              <span className="text-muted-foreground">/month</span>
            </div>
          </div>

          <div className="mt-6 space-y-3">
            {[
              "Unlimited grocery scans",
              "Goal-aware product scores",
              "Ingredient and label flags",
              "Smarter product swaps",
              "Personal shopping basket",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-3 text-sm">
                <div className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-primary/10">
                  <Check className="h-3.5 w-3.5 text-primary" />
                </div>

                <span>{feature}</span>
              </div>
            ))}
          </div>

          <Button
            type="button"
            size="lg"
            className="mt-7 w-full"
            onClick={() => {
              // Payment can be connected here later.
            }}
          >
            Upgrade to Pro
          </Button>

          <p className="mt-3 text-center text-xs text-muted-foreground">Payments aren't connected yet.</p>
        </section>
      </div>
    </main>
  );
}
