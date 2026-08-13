"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Place } from "@/lib/types";
import { usePlan } from "@/components/PlanContext";
import MapViewLoader from "@/components/MapViewLoader";

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [place, setPlace] = useState<Place | null>(null);
  const [loading, setLoading] = useState(true);
  const { addToPlan, removeFromPlan, isInPlan } = usePlan();

  useEffect(() => {
    const load = async () => {
      const supabase = createClient();
      const { data } = await supabase.from("places").select("*").eq("id", id).single();
      setPlace(data as Place);
      setLoading(false);
    };
    load();
  }, [id]);

  if (loading) return <p className="text-muted text-sm">Loading...</p>;
  if (!place) return <p className="text-muted text-sm">Place not found.</p>;

  const inPlan = isInPlan(place.id);

  return (
    <div className="max-w-2xl animate-fade-up">
      <button onClick={() => router.back()} className="text-sm text-jade-light mb-4 hover:text-gold transition-colors">
        ← Back
      </button>
      <h1 className="font-display text-3xl text-ink">{place.name}</h1>
      <span className="inline-block mt-3 text-xs px-2.5 py-1 rounded-full bg-surface border border-border text-muted font-medium">
        {place.category}
      </span>

      <div className="h-64 my-6 rounded-xl overflow-hidden border border-border">
        <MapViewLoader places={[place]} height="100%" center={[place.latitude, place.longitude]} />
      </div>

      <p className="text-ink/90 leading-relaxed mb-6">{place.description}</p>

      <div className="grid grid-cols-2 gap-3 text-sm mb-8">
        <div className="bg-surface border border-border rounded-lg p-3">
          <p className="text-muted text-xs font-mono uppercase tracking-wide">Distance</p>
          <p className="font-mono text-gold mt-1">{place.distance_km} km</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-3">
          <p className="text-muted text-xs font-mono uppercase tracking-wide">Opening Hours</p>
          <p className="font-mono text-ink mt-1">{place.opening_hours}</p>
        </div>
        <div className="bg-surface border border-border rounded-lg p-3 col-span-2">
          <p className="text-muted text-xs font-mono uppercase tracking-wide">Travel Tips</p>
          <p className="text-ink mt-1">{place.travel_tips}</p>
        </div>
      </div>

      <button
        onClick={() => (inPlan ? removeFromPlan(place.id) : addToPlan(place))}
        className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
          inPlan ? "bg-surface text-muted border border-border hover:text-terracotta hover:border-terracotta" : "bg-gold text-bg hover:bg-gold-hover"
        }`}
      >
        {inPlan ? "Remove from day plan" : "+ Add to day plan"}
      </button>
    </div>
  );
}