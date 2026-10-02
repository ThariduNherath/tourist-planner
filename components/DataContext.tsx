"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Place } from "@/lib/types";

interface Ctx { places: Place[]; loading: boolean; error: string | null; reload: () => Promise<void>; }
const C = createContext<Ctx | undefined>(undefined);

export function PlacesProvider({ children }: { children: React.ReactNode }) {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    const { data, error } = await createClient().from("places").select("*").order("name");
    if (error) setError(error.message);
    else { setError(null); setPlaces(data as Place[]); }
    setLoading(false);
  }, []);

  useEffect(() => { reload(); }, [reload]);
  return <C.Provider value={{ places, loading, error, reload }}>{children}</C.Provider>;
}

export function usePlaces() {
  const ctx = useContext(C);
  if (!ctx) throw new Error("usePlaces must be used within PlacesProvider");
  return ctx;
}