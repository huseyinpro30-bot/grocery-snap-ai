import type { Analysis } from "./grocery.server";
import { KEYS, useLocalStore } from "./local-store";

export type ListItem = { id: string; text: string; done: boolean };
export type ScanRecord = Analysis & { id: string; at: number; goal: string; image?: string };

export const GOALS = [
  { id: "balanced", label: "Balanced", icon: "🥗" },
  { id: "lowsugar", label: "Low sugar", icon: "🍬" },
  { id: "protein", label: "High protein", icon: "💪" },
  { id: "budget", label: "Best value", icon: "🏷️" },
  { id: "clean", label: "Less processed", icon: "🌾" },
] as const;

export const FREE_SCANS_PER_DAY = 3;

export function useBasket() {
  return useLocalStore<ListItem[]>(KEYS.basket, []);
}

export function useHistory() {
  return useLocalStore<ScanRecord[]>(KEYS.history, []);
}

export function usePro() {
  return useLocalStore<boolean>(KEYS.pro, false);
}

export function useScanQuota() {
  const [pro] = usePro();
  const [scans, setScans] = useLocalStore<{ day: string; count: number }>(KEYS.scans, {
    day: "",
    count: 0,
  });
  const today = new Date().toISOString().slice(0, 10);
  const used = scans.day === today ? scans.count : 0;
  const left = pro ? Infinity : Math.max(0, FREE_SCANS_PER_DAY - used);
  return {
    pro,
    used,
    left,
    canScan: pro || left > 0,
    consume: () => setScans({ day: today, count: used + 1 }),
  };
}

export function verdictTone(verdict: "buy" | "okay" | "skip") {
  return verdict === "buy"
    ? { text: "text-leaf", chip: "bg-leaf/12 text-leaf", label: "Buy it" }
    : verdict === "okay"
      ? { text: "text-citrus-foreground", chip: "bg-citrus/25 text-citrus-foreground", label: "Okay" }
      : { text: "text-berry", chip: "bg-berry/12 text-berry", label: "Skip" };
}
