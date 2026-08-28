```tsx
 import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/pro")({
  component: ProPage,
});

function ProPage() {
  return (
    <main className="min-h-screen bg-background px-5 py-10">
      <div className="mx-auto max-w-2xl">
        <Link
          to="/"
          className="text-sm text-muted-foreground hover:text-foreground"
        >
          ← Back to home
        </Link>

        <div className="mt-10 rounded-2xl border border-border bg-card p-8 text-center">
          <h1 className="text-4xl font-semibold">
            Cartwise Pro
          </h1>

          <p className="mt-3 text-muted-foreground">
            Unlimited grocery scans for $5/month.
          </p>

          <button
            type="button"
            className="mt-6 rounded-full bg-primary px-6 py-3 font-semibold text-primary-foreground"
          >
            Upgrade to Pro
          </button>

          <p className="mt-3 text-xs text-muted-foreground">
            Payments aren't connected yet.
          </p>
        </div>
      </div>
    </main>
  );
}
```

         
