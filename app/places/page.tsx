"use client";

import { useMemo, useState } from "react";
import { usePlaces } from "@/components/DataContext";
import PlaceCard from "@/components/PlaceCard";
import CategoryFilter from "@/components/CategoryFilter";

export default function PlacesPage() {
  const { places, loading, error } = usePlaces();
  const [category, setCategory] = useState("All");
  const [q, setQ] = useState("");
  const [sort, setSort] = useState("distance");

  const list = useMemo(() => {
    const t = q.trim().toLowerCase();
    return places
      .filter(
        (p) =>
          (category === "All" || p.category === category) &&
          (!t || `${p.name} ${p.description}`.toLowerCase().includes(t)),
      )
      .sort((a, b) =>
        sort === "name"
          ? a.name.localeCompare(b.name)
          : Number(a.distance_km) - Number(b.distance_km),
      );
  }, [places, category, q, sort]);

  const ctl =
    "bg-surface border border-border rounded-full px-4 py-2 text-sm text-ink focus:outline-none focus:border-gold";

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl text-ink mb-1">Places to visit</h1>
      <p className="text-muted text-sm mb-6">
        Filter by category, then add favourites to your day plan.
      </p>
      <CategoryFilter active={category} onChange={setCategory} />
      <div className="flex flex-wrap gap-3 mb-6">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search places…"
          className={`${ctl} w-56 placeholder:text-muted`}
        />
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          className={ctl}
        >
          <option value="distance">Closest to Nugawela</option>
          <option value="name">Sort by name</option>
        </select>
      </div>
      {loading && <p className="text-muted text-sm">Loading places...</p>}
      {error && <p className="text-terracotta text-sm">Error: {error}</p>}
      {!loading && !error && (
        <p className="text-xs font-mono text-muted mb-3">
          {list.length} place{list.length !== 1 ? "s" : ""}
        </p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {list.map((p, i) => (
          <PlaceCard key={p.id} place={p} index={i} />
        ))}
      </div>
      {!loading && !error && list.length === 0 && (
        <p className="text-muted text-sm text-center py-12">
          No places match your filters.
        </p>
      )}
    </div>
  );
}
