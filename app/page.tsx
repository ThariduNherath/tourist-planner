"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import type { Place } from "@/lib/types";
import PlaceCard from "@/components/PlaceCard";
import CategoryFilter from "@/components/CategoryFilter";
import MapViewLoader from "@/components/MapViewLoader";
import HeroBanner from "@/components/HeroBanner";

export default function HomePage() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [category, setCategory] = useState("All");

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data, error } = await supabase.from("places").select("*").order("distance_km");
      if (error) setError(error.message); else setPlaces(data as Place[]);
      setLoading(false);
    };
    load();
  }, []);

  const filtered = category === "All" ? places : places.filter((p) => p.category === category);

  return (
    <div>
      <HeroBanner>
        <p className="font-mono text-xs text-jade-light tracking-widest uppercase mb-2">25 km radius · Nugawela, Kandy</p>
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-3 drop-shadow-lg">Explore places, build your day</h1>
        <p className="text-white/80 text-sm sm:text-base max-w-lg drop-shadow">Browse temples, waterfalls and viewpoints near Nugawela, then string together a one-day trail.</p>
      </HeroBanner>

      {/* Categories උඩින් සහ යටින් gap එකක් තැබීම සඳහා my-8 (margin top & bottom) යොදා ඇත */}
      <div className="mt-8 mb-6">
        <CategoryFilter active={category} onChange={setCategory} />
      </div>

      <div className="h-64 sm:h-80 mb-8 rounded-xl overflow-hidden border border-border animate-fade-in">
        <MapViewLoader places={filtered} height="100%" />
      </div>

      {loading && <p className="text-muted text-sm">Loading places...</p>}
      {error && <p className="text-terracotta text-sm">Error: {error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((place, i) => <PlaceCard key={place.id} place={place} index={i} />)}
      </div>

      {!loading && filtered.length === 0 && !error && <p className="text-muted text-sm text-center py-12">No places found in this category.</p>}
    </div>
  );
}