"use client";

import Link from "next/link";
import type { Place } from "@/lib/types";
import { usePlan } from "@/components/PlanContext";

const categoryColors: Record<string, string> = {
  Religious: "bg-amber-100 text-amber-800",
  Nature: "bg-green-100 text-green-800",
  Heritage: "bg-purple-100 text-purple-800",
  Cultural: "bg-blue-100 text-blue-800",
  Sightseeing: "bg-rose-100 text-rose-800",
};

export default function PlaceCard({ place }: { place: Place }) {
  const { addToPlan, removeFromPlan, isInPlan } = usePlan();
  const inPlan = isInPlan(place.id);

  return (
    <div className="bg-white rounded-xl border border-slate-200 p-4 flex flex-col gap-2 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <Link href={`/places/${place.id}`} className="font-semibold text-slate-800 hover:text-emerald-700">
          {place.name}
        </Link>
        <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${categoryColors[place.category] ?? "bg-slate-100 text-slate-700"}`}>
          {place.category}
        </span>
      </div>
      <p className="text-sm text-slate-500 line-clamp-2">{place.description}</p>
      <div className="flex items-center justify-between mt-1 text-xs text-slate-400">
        <span>📍 {place.distance_km} km away</span>
        <span>🕒 {place.opening_hours}</span>
      </div>
      <button
        onClick={() => (inPlan ? removeFromPlan(place.id) : addToPlan(place))}
        className={`mt-2 text-sm font-medium rounded-lg py-2 transition-colors ${
          inPlan
            ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
            : "bg-emerald-600 text-white hover:bg-emerald-700"
        }`}
      >
        {inPlan ? "Remove from plan" : "+ Add to day plan"}
      </button>
    </div>
  );
}
