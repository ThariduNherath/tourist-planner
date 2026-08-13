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

  if (loading) return <p className="text-slate-400 text-sm">Loading...</p>;
  if (!place) return <p className="text-slate-400 text-sm">Place not found.</p>;

  const inPlan = isInPlan(place.id);

  return (
    <div className="max-w-2xl">
      <button onClick={() => router.back()} className="text-sm text-emerald-700 mb-4">
        ← Back
      </button>
      <h1 className="text-2xl font-bold text-slate-800">{place.name}</h1>
      <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-emerald-100 text-emerald-800 font-medium">
        {place.category}
      </span>

      <div className="h-64 my-5 rounded-xl overflow-hidden border border-slate-200">
        <MapViewLoader places={[place]} height="100%" center={[place.latitude, place.longitude]} />
      </div>

      <p className="text-slate-600 mb-4">{place.description}</p>

      <div className="grid grid-cols-2 gap-4 text-sm mb-6">
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Distance</p>
          <p className="font-medium">{place.distance_km} km</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3">
          <p className="text-slate-400 text-xs">Opening Hours</p>
          <p className="font-medium">{place.opening_hours}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-lg p-3 col-span-2">
          <p className="text-slate-400 text-xs">Travel Tips</p>
          <p className="font-medium">{place.travel_tips}</p>
        </div>
      </div>

      <button
        onClick={() => (inPlan ? removeFromPlan(place.id) : addToPlan(place))}
        className={`w-full sm:w-auto px-6 py-2.5 rounded-lg font-medium text-sm ${
          inPlan ? "bg-slate-100 text-slate-600" : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        {inPlan ? "Remove from day plan" : "+ Add to day plan"}
      </button>
    </div>
  );
}
