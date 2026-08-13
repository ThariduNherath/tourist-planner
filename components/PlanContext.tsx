"use client";

import { createContext, useContext, useEffect, useState } from "react";
import type { Place } from "@/lib/types";

interface PlanContextType {
  plan: Place[];
  addToPlan: (place: Place) => void;
  removeFromPlan: (id: string) => void;
  reorderPlan: (fromIndex: number, toIndex: number) => void;
  clearPlan: () => void;
  isInPlan: (id: string) => boolean;
}

const PlanContext = createContext<PlanContextType | undefined>(undefined);
const STORAGE_KEY = "day-visit-plan";

export function PlanProvider({ children }: { children: React.ReactNode }) {
  const [plan, setPlan] = useState<Place[]>([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) setPlan(JSON.parse(saved));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(plan));
  }, [plan, hydrated]);

  const addToPlan = (place: Place) => {
    setPlan((prev) => (prev.some((p) => p.id === place.id) ? prev : [...prev, place]));
  };

  const removeFromPlan = (id: string) => {
    setPlan((prev) => prev.filter((p) => p.id !== id));
  };

  const reorderPlan = (fromIndex: number, toIndex: number) => {
    setPlan((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, moved);
      return updated;
    });
  };

  const clearPlan = () => setPlan([]);
  const isInPlan = (id: string) => plan.some((p) => p.id === id);

  return (
    <PlanContext.Provider value={{ plan, addToPlan, removeFromPlan, reorderPlan, clearPlan, isInPlan }}>
      {children}
    </PlanContext.Provider>
  );
}

export function usePlan() {
  const ctx = useContext(PlanContext);
  if (!ctx) throw new Error("usePlan must be used within PlanProvider");
  return ctx;
}
