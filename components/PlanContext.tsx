"use client";

import { createContext, useContext, useEffect, useState } from "react";

interface Item { id: string; mins: number; }
interface PlanContextType {
  items: Item[];
  has: (id: string) => boolean;
  toggle: (id: string) => void;
  remove: (id: string) => void;
  move: (index: number, dir: -1 | 1) => void;
  setMins: (id: string, mins: number) => void;
  clear: () => void;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);
const KEY = "day-visit-plan-v2";

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Item[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try { const s = localStorage.getItem(KEY); if (s) setItems(JSON.parse(s)); } catch {}
    setHydrated(true);
  }, []);
  useEffect(() => {
    if (hydrated) try { localStorage.setItem(KEY, JSON.stringify(items)); } catch {}
  }, [items, hydrated]);

  const has = (id: string) => items.some((i) => i.id === id);
  const remove = (id: string) => setItems((s) => s.filter((i) => i.id !== id));
  const toggle = (id: string) =>
    has(id) ? remove(id) : setItems((s) => [...s, { id, mins: 60 }]);
  const move = (i: number, d: -1 | 1) =>
    setItems((s) => {
      const j = i + d;
      if (j < 0 || j >= s.length) return s;
      const n = [...s]; [n[i], n[j]] = [n[j], n[i]]; return n;
    });
  const setMins = (id: string, mins: number) => setItems((s) => s.map((i) => (i.id === id ? { ...i, mins } : i)));
  const clear = () => setItems([]);

  return <PlanContext.Provider value={{ items, has, toggle, remove, move, setMins, clear }}>{children}</PlanContext.Provider>;
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used within PlanProvider");
  return ctx;
}