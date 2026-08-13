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
    <div>
      <h1 className="text-2xl font-bold text-slate-800 mb-1">My One-Day Visit Plan</h1>
      <p className="text-slate-500 text-sm mb-6">
        {plan.length} place{plan.length !== 1 ? "s" : ""} selected · approx. {totalDistance.toFixed(1)} km total (from home)
      </p>

      {plan.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <p className="text-slate-400 mb-3">Your plan is empty.</p>
          <Link href="/" className="text-emerald-700 font-medium text-sm">
            Browse places to add →
          </Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          <div className="space-y-3">
            {plan.map((place, index) => (
              <div key={place.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3">
                <span className="w-7 h-7 rounded-full bg-emerald-600 text-white text-sm flex items-center justify-center font-semibold flex-shrink-0">
                  {index + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-slate-800 truncate">{place.name}</p>
                  <p className="text-xs text-slate-400">{place.category} · {place.distance_km} km · {place.opening_hours}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <button onClick={() => move(index, -1)} disabled={index === 0} className="text-xs px-1.5 disabled:opacity-30">▲</button>
                  <button onClick={() => move(index, 1)} disabled={index === plan.length - 1} className="text-xs px-1.5 disabled:opacity-30">▼</button>
                </div>
                <button onClick={() => removeFromPlan(place.id)} className="text-xs text-red-500 font-medium">Remove</button>
              </div>
            ))}
            <button onClick={clearPlan} className="text-xs text-slate-400 hover:text-red-500 mt-2">
              Clear entire plan
            </button>
          </div>

          <div className="h-80 md:h-auto rounded-xl overflow-hidden border border-slate-200">
            <MapViewLoader places={plan} height="100%" />
          </div>
        </div>
      )}
    </div>
  );
}
