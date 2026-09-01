import type { Analysis } from "./grocery.types";
import { DEFAULT_PROFILE, profileToPrompt, type DietProfile } from "./grocery.types";
import { KEYS, useLocalStore } from "./local-store";

export type ListItem = { id: string; text: string; done: boolean };
export type ScanRecord = Analysis & { id: string; at: number; goal: string; image?: string };
export type SavedRecipe = {
  id: string;
  title: string;
  minutes: number;
  description: string;
  uses: string[];
  missing: string[];
  steps: string[];
};

export const GOALS = [
  { id: "balanced", label: "Balanced", icon: "🥗" },
  { id: "lowsugar", label: "Low sugar", icon: "🍬" },
  { id: "protein", label: "High protein", icon: "💪" },
  { id: "budget", label: "Best value", icon: "🏷️" },
  { id: "clean", label: "Less processed", icon: "🌾" },
] as const;

export const DIETS = [
  "Vegetarian",
  "Vegan",
  "Pescatarian",
  "Gluten-free",
  "Dairy-free",
  "Halal",
  "Kosher",
  "Keto",
  "Low sodium",
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

export function useSavedRecipes() {
  return useLocalStore<SavedRecipe[]>(KEYS.saved, []);
}

export function useProfile() {
  return useLocalStore<DietProfile>(KEYS.profile, DEFAULT_PROFILE);
}

export { profileToPrompt };
export type { DietProfile };

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

/* ---------- Aisle grouping ---------- */

const AISLES: { name: string; icon: string; words: string[] }[] = [
  {
    name: "Produce",
    icon: "🥬",
    words: ["apple","banana","berry","berries","lettuce","spinach","kale","tomato","onion","garlic","potato","carrot","pepper","cucumber","avocado","lemon","lime","orange","broccoli","mushroom","herb","salad","fruit","vegetable","zucchini","cabbage"],
  },
  {
    name: "Protein",
    icon: "🍗",
    words: ["chicken","beef","pork","turkey","salmon","tuna","fish","shrimp","tofu","tempeh","egg","lentil","bean","chickpea","mince","steak","protein"],
  },
  {
    name: "Dairy",
    icon: "🥛",
    words: ["milk","yogurt","yoghurt","cheese","butter","cream","kefir","skyr"],
  },
  {
    name: "Bakery & grains",
    icon: "🍞",
    words: ["bread","rice","pasta","oat","cereal","flour","tortilla","bagel","quinoa","couscous","noodle","cracker"],
  },
  {
    name: "Pantry",
    icon: "🫙",
    words: ["oil","vinegar","sauce","spice","salt","sugar","honey","peanut","nut","seed","canned","tin","stock","broth","jam","coffee","tea"],
  },
  {
    name: "Frozen",
    icon: "🧊",
    words: ["frozen","ice cream","peas"],
  },
  {
    name: "Snacks & drinks",
    icon: "🥤",
    words: ["chip","crisp","chocolate","candy","soda","juice","water","bar","cookie","biscuit","snack"],
  },
];

export function aisleFor(text: string) {
  const t = text.toLowerCase();
  const hit = AISLES.find((a) => a.words.some((w) => t.includes(w)));
  return hit ? { name: hit.name, icon: hit.icon } : { name: "Other", icon: "🛒" };
}

export function groupByAisle(items: ListItem[]) {
  const map = new Map<string, { icon: string; items: ListItem[] }>();
  for (const item of items) {
    const a = aisleFor(item.text);
    const bucket = map.get(a.name) ?? { icon: a.icon, items: [] };
    bucket.items.push(item);
    map.set(a.name, bucket);
  }
  return [...map.entries()]
    .sort((a, b) => (a[0] === "Other" ? 1 : b[0] === "Other" ? -1 : a[0].localeCompare(b[0])))
    .map(([name, v]) => ({ name, icon: v.icon, items: v.items }));
}
