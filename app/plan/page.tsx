"use client";

import { usePlan } from "@/components/PlanContext";
import MapViewLoader from "@/components/MapViewLoader";
import Link from "next/link";

export default function PlanPage() {
  const { plan, removeFromPlan, reorderPlan, clearPlan } = usePlan();

  const totalDistance = plan.reduce((sum, p) => sum + Number(p.distance_km), 0);

  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= plan.length) return;
    reorderPlan(index, target);
  };

  return (
    <div className="animate-fade-in">
      <h1 className="font-display text-3xl text-ink mb-1">My One-Day Trail</h1>
      <p className="text-muted text-sm mb-8 font-mono">
        {plan.length} stop{plan.length !== 1 ? "s" : ""} · ~{totalDistance.toFixed(1)} km from home
      </p>

      {plan.length === 0 ? (
        <div className="text-center py-16 bg-surface rounded-xl border border-border">
          <p className="text-muted mb-3">Your trail is empty.</p>
          <Link href="/" className="text-gold font-medium text-sm hover:text-gold-hover">
            Browse places to add →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            {plan.map((place, index) => (
              <div key={place.id} className="relative pl-0">
                {index < plan.length - 1 && <div className="trail-line" />}
                <div className="relative bg-surface border border-border rounded-xl p-4 flex items-center gap-3 mb-3 animate-fade-up" style={{ animationDelay: `${index * 60}ms` }}>
                  <span className="w-7 h-7 rounded-full bg-gold text-bg text-sm flex items-center justify-center font-bold flex-shrink-0 z-10">
                    {index + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-ink truncate">{place.name}</p>
                    <p className="text-xs text-muted font-mono mt-0.5">{place.category} · {place.distance_km} km · {place.opening_hours}</p>
                  </div>
                  <div className="flex flex-col gap-1 text-muted">
                    <button onClick={() => move(index, -1)} disabled={index === 0} className="text-xs px-1.5 disabled:opacity-20 hover:text-gold">▲</button>
                    <button onClick={() => move(index, 1)} disabled={index === plan.length - 1} className="text-xs px-1.5 disabled:opacity-20 hover:text-gold">▼</button>
                  </div>
                  <button onClick={() => removeFromPlan(place.id)} className="text-xs text-terracotta font-medium hover:opacity-70">Remove</button>
                </div>
              </div>
            ))}
            <button onClick={clearPlan} className="text-xs text-muted hover:text-terracotta mt-1 transition-colors">
              Clear entire trail
            </button>
          </div>

          <div className="h-80 md:h-auto rounded-xl overflow-hidden border border-border">
            <MapViewLoader places={plan} height="100%" />
          </div>
        </div>
      )}
    </div>
  );
}