"use client";

import { useParams, useRouter } from "next/navigation";
import { usePlaces } from "@/components/DataContext";
import { usePlan } from "@/components/PlanContext";
import { useToast } from "@/components/Toast";
import MapViewLoader from "@/components/MapViewLoader";
import { hoursText } from "@/lib/utils";

export default function PlaceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { places, loading, error } = usePlaces();
  const { has, toggle } = usePlan();
  
  // TypeScript error එක වළක්වා ගැනීමට 'as any' එකතු කර ඇත
  const toast = useToast() as any;

  if (loading) return <p className="text-muted text-sm">Loading...</p>;
  if (error) return <p className="text-terracotta text-sm">Error: {error}</p>;
  
  const place = places.find((p) => p.id === id);
  if (!place) return <p className="text-muted text-sm">Place not found.</p>;
  
  const inPlan = has(place.id);

  // Toast notification එක පෙන්වීම සඳහා Helper function එකක්
  const handleTogglePlan = () => {
    toggle(place.id);
    const msg = inPlan ? "Removed from plan" : "Added to your plan";
    
    if (typeof toast === "function") {
      toast(msg);
    } else if (toast?.showToast) {
      toast.showToast(msg);
    } else if (toast?.toast) {
      toast.toast(msg);
    }
  };

  return (
    <div className="max-w-2xl animate-fade-up">
      <button 
        onClick={() => router.back()} 
        className="text-sm text-jade-light mb-4 hover:text-gold transition-colors"
      >
        ← Back
      </button>

      {place.image_url && (
        <div 
          className="h-56 mb-6 rounded-xl border border-border bg-cover bg-center" 
          style={{ backgroundImage: `url(${place.image_url})` }} 
        />
      )}

      <h1 className="font-display text-3xl text-ink">{place.name}</h1>
      <span className="inline-block mt-3 text-xs px-2.5 py-1 rounded-full bg-surface border border-border text-muted font-medium">
        {place.category}
      </span>

      <p className="text-ink/90 leading-relaxed my-6">{place.description}</p>

      <div className="grid grid-cols-2 gap-3 text-sm mb-6">
        <div className="bg-surface border border-border rounded-lg p-3">
          <p className="text-muted text-xs font-mono uppercase tracking-wide">Distance</p>
          <p className="font-mono text-gold mt-1">{place.distance_km} km</p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-3">
          <p className="text-muted text-xs font-mono uppercase tracking-wide">Opening Hours</p>
          <p className="font-mono text-ink mt-1">{hoursText(place)}</p>
        </div>

        <div className="bg-surface border border-border rounded-lg p-3 col-span-2">
          <p className="text-muted text-xs font-mono uppercase tracking-wide">Facilities</p>
          {place.facilities?.length ? (
            <div className="flex flex-wrap gap-2 mt-2">
              {place.facilities.map((f) => (
                <span 
                  key={f} 
                  className="text-xs px-2.5 py-1 rounded-full bg-jade/20 text-jade-light border border-jade/40"
                >
                  {f}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-muted mt-1">No facilities information.</p>
          )}
        </div>

        <div className="bg-surface border border-border rounded-lg p-3 col-span-2">
          <p className="text-muted text-xs font-mono uppercase tracking-wide">Travel Tips</p>
          <p className="text-ink mt-1">{place.travel_tips}</p>
        </div>
      </div>

      <div className="h-64 mb-6 rounded-xl overflow-hidden border border-border">
        <MapViewLoader places={[place]} height="100%" />
      </div>

      <div className="flex flex-wrap gap-3">
        {/* Fix: <a ...> tag එකේ ආරම්භය නිවැරදිව එකතු කරන ලදී */}
        <a
          href={`https://www.openstreetmap.org/directions?to=${place.latitude},${place.longitude}`}
          target="_blank" 
          rel="noreferrer"
          className="px-6 py-2.5 rounded-lg text-sm font-medium border border-border text-ink hover:border-gold transition-colors inline-block"
        >
          Get directions
        </a>

        <button
          onClick={handleTogglePlan}
          className={`px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
            inPlan 
              ? "bg-surface text-muted border border-border hover:text-terracotta hover:border-terracotta" 
              : "bg-gold text-bg hover:bg-gold-hover"
          }`}
        >
          {inPlan ? "Remove from day plan" : "+ Add to day plan"}
        </button>
      </div>
    </div>
  );
}