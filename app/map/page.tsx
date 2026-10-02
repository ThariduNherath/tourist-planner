"use client";

import { useState } from "react";
import { usePlaces } from "@/components/DataContext";
import CategoryFilter from "@/components/CategoryFilter";
import MapViewLoader from "@/components/MapViewLoader";

export default function MapPage() {
  const { places, loading, error } = usePlaces();
  const [category, setCategory] = useState("All");
  const list = category === "All" ? places : places.filter((p) => p.category === category);

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl text-ink mb-1">Explore the map</h1>
      <p className="text-muted text-sm mb-6">Tap a marker to see details or add it to your plan.</p>
      <CategoryFilter active={category} onChange={setCategory} />
      {loading && <p className="text-muted text-sm">Loading...</p>}
      {error && <p className="text-terracotta text-sm">Error: {error}</p>}
      <div className="h-[70vh] rounded-xl overflow-hidden border border-border">
        <MapViewLoader places={list} height="100%" wheel />
      </div>
    </div>
  );
}