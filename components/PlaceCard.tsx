"use client";

import Link from "next/link";
import type { Place } from "@/lib/types";
import { usePlan } from "@/components/PlanContext";

const categoryDot: Record<string, string> = {
  Religious: "bg-gold",
  Nature: "bg-jade",
  Heritage: "bg-terracotta",
  Cultural: "bg-jade-light",
  Sightseeing: "bg-gold-hover",
};

export default function PlaceCard({ place, index = 0 }: { place: Place; index?: number }) {
  const { addToPlan, removeFromPlan, isInPlan } = usePlan();
  const inPlan = isInPlan(place.id);

  return (
    <div
      className="group bg-surface rounded-xl border border-border p-4 flex flex-col gap-2 hover:border-gold/40 hover:-translate-y-0.5 transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <div className="flex items-start justify-between gap-2">
        <Link href={`/places/${place.id}`} className="font-display text-lg text-ink group-hover:text-gold transition-colors">
          {place.name}
        </Link>
        <span className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-bg border border-border text-muted whitespace-nowrap">
          <span className={`w-1.5 h-1.5 rounded-full ${categoryDot[place.category] ?? "bg-muted"}`} />
          {place.category}
        </span>
      </div>
      <p className="text-sm text-muted line-clamp-2">{place.description}</p>
      <div className="flex items-center justify-between mt-1 text-xs font-mono text-muted">
        <span>{place.distance_km} km</span>
        <span>{place.opening_hours}</span>
      </div>
      <button
        onClick={() => (inPlan ? removeFromPlan(place.id) : addToPlan(place))}
        className={`mt-2 text-sm font-medium rounded-lg py-2 transition-all duration-200 ${
          inPlan
            ? "bg-bg text-muted border border-border hover:border-terracotta hover:text-terracotta"
            : "bg-gold text-bg hover:bg-gold-hover"
        }`}
      >
        {inPlan ? "Remove from plan" : "+ Add to day plan"}
      </button>
    </div>
  );
}