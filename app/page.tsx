"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Place } from "@/lib/types";
import PlaceCard from "@/components/PlaceCard";
import CategoryFilter from "@/components/CategoryFilter";
import MapViewLoader from "@/components/MapViewLoader";

export default function HomePage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("places").select("*").order("distance_km");
      if (error) setError(error.message);
      else setPlaces(data as Place[]);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = category === "All" ? places : places.filter((p) => p.category === category);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Explore places near Nugawela, Kandy</h1>
        <p className="text-slate-500 text-sm mt-1">Browse places of interest within a 25 km radius and build your one-day visit plan.</p>
      </div>

      <CategoryFilter active={category} onChange={setCategory} />

      <div className="h-72 mb-8 rounded-xl overflow-hidden border border-slate-200">
        <MapViewLoader places={filtered} height="100%" />
      </div>

      {loading && <p className="text-slate-400 text-sm">Loading places...</p>}
      {error && <p className="text-red-500 text-sm">Error: {error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((place) => (
          <PlaceCard key={place.id} place={place} />
        ))}
      </div>

      {!loading && filtered.length === 0 && (
        <p className="text-slate-400 text-sm text-center py-12">No places found in this category.</p>
      )}
    </div>
  );
}
