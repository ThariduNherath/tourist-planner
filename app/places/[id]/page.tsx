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
  const toast = useToast();

  if (loading) return <p className="text-muted text-sm">Loading...</p>;
  if (error) return <p className="text-terracotta text-sm">Error: {error}</p>;
  const place = places.find((p) => p.id === id);
  if (!place) return <p className="text-muted text-sm">Place not found.</p>;
  const inPlan = has(place.id);

  return (
    <div className="animate-fade-in">
      <div className="relative left-1/2 -translate-x-1/2 w-screen overflow-hidden -mt-20 min-h-[300px] sm:min-h-[360px]">
        {place.image_url ? (
          <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${place.image_url})` }} />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-jade via-surface2 to-bg" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-black/25" />
        <div className="absolute inset-0 bg-gradient-to-br from-jade/15 via-transparent to-gold/10" />

        <button
          onClick={() => router.back()}
          className="absolute left-3 sm:left-6 top-[84px] z-20 text-sm text-white/90 bg-black/30 backdrop-blur px-3 py-1.5 rounded-full hover:bg-black/50 transition-colors"
        >
          ← Back
        </button>

        <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 min-h-[300px] sm:min-h-[360px] flex flex-col justify-end pt-32 pb-14">
          <span className="self-start inline-block text-xs px-3 py-1 rounded-full bg-bg/70 backdrop-blur border border-white/20 text-white font-medium">
            {place.category}
          </span>
          <h1 className="font-display text-3xl sm:text-5xl text-white mt-3 drop-shadow-lg max-w-3xl">{place.name}</h1>
          <p className="font-mono text-xs sm:text-sm text-white/80 mt-3">
            {place.distance_km} km from Nugawela · {hoursText(place)}
          </p>
        </div>
      </div>

      <div className="grid lg:grid-cols-5 gap-8 mt-8">
        <div className="lg:col-span-3 space-y-6">
          <p className="text-ink/90 leading-relaxed text-base sm:text-lg">{place.description}</p>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div className="bg-surface border border-border rounded-lg p-3">
              <p className="text-muted text-xs font-mono uppercase tracking-wide">Distance</p>
              <p className="font-mono text-gold mt-1">{place.distance_km} km</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-3">
              <p className="text-muted text-xs font-mono uppercase tracking-wide">Opening Hours</p>
              <p className="font-mono text-ink mt-1">{hoursText(place)}</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-3">
              <p className="text-muted text-xs font-mono uppercase tracking-wide">Entry Fee</p>
              <p className="font-mono text-ink mt-1">{place.entry_fee || "Free / not specified"}</p>
            </div>
            <div className="bg-surface border border-border rounded-lg p-3">
              <p className="text-muted text-xs font-mono uppercase tracking-wide">Best Time to Visit</p>
              <p className="font-mono text-ink mt-1">{place.best_time || "Not specified"}</p>
            </div>
          </div>

          <div className="bg-surface border border-border rounded-lg p-4">
            <p className="text-muted text-xs font-mono uppercase tracking-wide">Facilities</p>
            {place.facilities?.length ? (
              <div className="flex flex-wrap gap-2 mt-3">
                {place.facilities.map((f) => (
                  <span key={f} className="text-xs px-2.5 py-1 rounded-full bg-jade/20 text-jade-light border border-jade/40">{f}</span>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm mt-2">No facilities information.</p>
            )}
          </div>

          <div className="bg-surface border border-border rounded-lg p-4">
            <p className="text-muted text-xs font-mono uppercase tracking-wide">Travel Tips</p>
            <p className="text-ink mt-2 leading-relaxed">{place.travel_tips}</p>
          </div>
        </div>

        <aside className="lg:col-span-2">
          <div className="lg:sticky lg:top-24 space-y-4">
            <div className="h-72 rounded-xl overflow-hidden border border-border">
              <MapViewLoader places={[place]} height="100%" />
            </div>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${place.latitude},${place.longitude}`}
              target="_blank"
              rel="noreferrer"
              className="block text-center px-6 py-2.5 rounded-lg text-sm font-medium border border-border text-ink hover:border-gold transition-colors"
            >
              Get directions
            </a>
            <button
              onClick={() => { toggle(place.id); toast(inPlan ? "Removed from plan" : "Added to your plan"); }}
              className={`w-full px-6 py-2.5 rounded-lg font-medium text-sm transition-all ${
                inPlan
                  ? "bg-surface text-muted border border-border hover:text-terracotta hover:border-terracotta"
                  : "bg-gold text-bg hover:bg-gold-hover"
              }`}
            >
              {inPlan ? "Remove from day plan" : "+ Add to day plan"}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
}