"use client";

import Link from "next/link";
import type { Place } from "@/lib/types";
import { usePlan } from "@/components/PlanContext";
import { useToast } from "@/components/Toast";
import { hoursText } from "@/lib/utils";

const categoryDot: Record<string, string> = {
  Religious: "bg-gold", Nature: "bg-jade", Heritage: "bg-terracotta", Cultural: "bg-jade-light", Sightseeing: "bg-gold-hover",
};

export default function PlaceCard({ place, index = 0 }: { place: Place; index?: number }) {
  const { toggle, has } = usePlan();
  const toast = useToast();
  const inPlan = has(place.id);

  return (
    <div
      className="group bg-surface rounded-xl border border-border overflow-hidden flex flex-col hover:border-gold/40 hover:-translate-y-0.5 transition-all duration-300 animate-fade-up"
      style={{ animationDelay: `${Math.min(index, 8) * 60}ms` }}
    >
      <Link
        href={`/places/${place.id}`}
        className="relative h-40 bg-surface2 bg-cover bg-center"
        style={place.image_url ? { backgroundImage: `url(${place.image_url})` } : undefined}
      >
        {!place.image_url && <span className="absolute inset-0 grid place-items-center text-4xl opacity-40">📍</span>}
        <span className="absolute left-3 top-3 flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-bg/85 border border-border text-ink">
          <span className={`w-1.5 h-1.5 rounded-full ${categoryDot[place.category] ?? "bg-muted"}`} />
          {place.category}
        </span>
      </Link>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <Link href={`/places/${place.id}`} className="font-display text-lg text-ink group-hover:text-gold transition-colors">{place.name}</Link>
        <p className="text-sm text-muted line-clamp-2">{place.description}</p>
        <div className="flex items-center justify-between mt-1 text-xs font-mono text-muted">
          <span>{place.distance_km} km</span>
          <span>{hoursText(place)}</span>
        </div>
        <button
          onClick={() => { toggle(place.id); toast(inPlan ? "Removed from plan" : "Added to your plan"); }}
          className={`mt-auto text-sm font-medium rounded-lg py-2 transition-all duration-200 ${
            inPlan ? "bg-bg text-muted border border-border hover:border-terracotta hover:text-terracotta" : "bg-gold text-bg hover:bg-gold-hover"
          }`}
        >
          {inPlan ? "Remove from plan" : "+ Add to day plan"}
        </button>
      </div>
    </div>
  );
}