import { Link } from "@tanstack/react-router";
import {
  Camera,
  ShoppingBasket,
  History,
  Sparkles,
  Leaf,
  Scale,
  ChefHat,
  UserRound,
} from "lucide-react";
import type { ComponentType } from "react";

type Tab = { to: string; label: string; icon: ComponentType<{ className?: string }> };

const TABS: Tab[] = [
  { to: "/", label: "Scan", icon: Camera },
  { to: "/compare", label: "Compare", icon: Scale },
  { to: "/basket", label: "Basket", icon: ShoppingBasket },
  { to: "/kitchen", label: "Kitchen", icon: ChefHat },
  { to: "/history", label: "History", icon: History },
];

const EXTRA: Tab[] = [
  { to: "/profile", label: "Profile", icon: UserRound },
  { to: "/pro", label: "Pro", icon: Sparkles },
];

export function TopBar() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-5 py-3">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-xl gradient-fresh text-primary-foreground">
            <Leaf className="h-4 w-4" />
          </span>
          <span className="font-display text-lg font-semibold tracking-tight">Cartwise</span>
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          {[...TABS, ...EXTRA].map((t) => (
            <Link
              key={t.to}
              to={t.to}
              activeOptions={{ exact: t.to === "/" }}
              className="rounded-full px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
              activeProps={{ className: "bg-secondary text-foreground" }}
            >
              {t.label}
            </Link>
          ))}
        </nav>

        <Link
          to="/profile"
          className="grid h-9 w-9 place-items-center rounded-full border border-border sm:hidden"
          aria-label="Your profile"
        >
          <UserRound className="h-4 w-4" />
        </Link>
      </div>
    </header>
  );
}

export function TabBar() {
  return (
    <nav
      aria-label="Main"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl sm:hidden"
    >
      <ul className="mx-auto grid max-w-md grid-cols-5">
        {TABS.map((t) => (
          <li key={t.to}>
            <Link
              to={t.to}
              activeOptions={{ exact: t.to === "/" }}
              className="flex flex-col items-center gap-1 px-1 py-2.5 text-[10px] font-medium text-muted-foreground transition-colors"
              activeProps={{ className: "text-primary" }}
            >
              {({ isActive }) => (
                <>
                  <span
                    className={`grid h-8 w-12 place-items-center rounded-full transition-colors ${
                      isActive ? "bg-primary/12" : ""
                    }`}
                  >
                    <t.icon className="h-[18px] w-[18px]" />
                  </span>
                  {t.label}
                </>
              )}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
