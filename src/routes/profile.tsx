import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { UserRound } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { DIETS, useProfile } from "@/lib/cartwise";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Your Food Profile — Cartwise" },
      {
        name: "description",
        content:
          "Set your diet, allergies, household size and budget so every Cartwise scan is judged against your real life.",
      },
      { property: "og:title", content: "Your Food Profile — Cartwise" },
      {
        property: "og:description",
        content: "Diet, allergies and budget preferences that personalise every AI grocery scan.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ProfilePage,
});

const BUDGETS = [
  { id: "tight", label: "Tight" },
  { id: "normal", label: "Normal" },
  { id: "premium", label: "Quality first" },
] as const;

function ProfilePage() {
  const [profile, setProfile] = useProfile();

  return (
    <div className="mx-auto max-w-2xl space-y-6 px-5 py-8">
      <div className="flex items-center gap-3">
        <span className="grid h-11 w-11 place-items-center rounded-2xl gradient-fresh text-primary-foreground">
          <UserRound className="h-5 w-5" />
        </span>
        <div>
          <h1 className="font-display text-3xl font-semibold">Food profile</h1>
          <p className="text-sm text-muted-foreground">
            Used on every scan, comparison and recipe.
          </p>
        </div>
      </div>

      <section className="surface space-y-5 p-6">
        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">Diet</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {DIETS.map((d) => {
              const on = profile.diets.includes(d);
              return (
                <button
                  key={d}
                  type="button"
                  aria-pressed={on}
                  onClick={() =>
                    setProfile((p) => ({
                      ...p,
                      diets: on ? p.diets.filter((x) => x !== d) : [...p.diets, d],
                    }))
                  }
                  className={`rounded-full border px-3.5 py-2 text-sm transition-all ${
                    on
                      ? "border-primary bg-primary text-primary-foreground shadow-sm"
                      : "border-border bg-card hover:border-primary/40 hover:bg-secondary"
                  }`}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-widest text-muted-foreground">
            Allergies & things to avoid
          </p>
          <Textarea
            className="mt-2"
            rows={2}
            maxLength={200}
            value={profile.allergies}
            onChange={(e) => setProfile((p) => ({ ...p, allergies: e.target.value }))}
            placeholder="e.g. peanuts, shellfish, aspartame"
            aria-label="Allergies and ingredients to avoid"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Household</p>
            <div className="mt-2 flex items-center gap-2">
              {[1, 2, 3, 4, 5, 6].map((n) => (
                <button
                  key={n}
                  type="button"
                  aria-pressed={profile.household === n}
                  onClick={() => setProfile((p) => ({ ...p, household: n }))}
                  className={`h-9 w-9 rounded-full border text-sm transition-all ${
                    profile.household === n
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-secondary"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-xs uppercase tracking-widest text-muted-foreground">Budget</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {BUDGETS.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  aria-pressed={profile.budget === b.id}
                  onClick={() => setProfile((p) => ({ ...p, budget: b.id }))}
                  className={`rounded-full border px-3.5 py-2 text-sm transition-all ${
                    profile.budget === b.id
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-card hover:bg-secondary"
                  }`}
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <Button type="button" className="w-full" onClick={() => toast.success("Profile saved")}>
          Save profile
        </Button>
        <p className="text-center text-xs text-muted-foreground">
          Stored privately on this device.
        </p>
      </section>
    </div>
  );
}
