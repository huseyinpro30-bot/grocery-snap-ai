import { useCallback, useEffect, useState } from "react";

type Listener = () => void;
const listeners = new Map<string, Set<Listener>>();

function emit(key: string) {
  listeners.get(key)?.forEach((l) => l());
}

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/**
 * localStorage-backed state that stays in sync across every component/tab
 * that uses the same key. SSR-safe: starts from `fallback`, hydrates in effect.
 */
export function useLocalStore<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const sync = () => setValue(read<T>(key, fallback));
    sync();
    setHydrated(true);
    if (!listeners.has(key)) listeners.set(key, new Set());
    const set = listeners.get(key)!;
    set.add(sync);
    window.addEventListener("storage", sync);
    return () => {
      set.delete(sync);
      window.removeEventListener("storage", sync);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      const resolved =
        typeof next === "function" ? (next as (prev: T) => T)(read<T>(key, fallback)) : next;
      try {
        localStorage.setItem(key, JSON.stringify(resolved));
      } catch {
        /* ignore quota */
      }
      setValue(resolved);
      emit(key);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key],
  );

  return [value, update, hydrated] as const;
}

export const KEYS = {
  basket: "cartwise.basket",
  history: "cartwise.history",
  goal: "cartwise.goal",
  note: "cartwise.note",
  pro: "cartwise.pro",
  scans: "cartwise.scans",
} as const;
