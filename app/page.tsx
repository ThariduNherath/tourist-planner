"use client";

import Link from "next/link";
import { usePlaces } from "@/components/DataContext";
import PlaceCard from "@/components/PlaceCard";
import HeroBanner from "@/components/HeroBanner";

const steps = [
  ["Discover", "Scroll through temples, trails and viewpoints around Nugawela."],
  ["Check details", "Open a place for opening hours, travel tips and photos."],
  ["Save it", "Tap once to drop a place into your day plan."],
  ["Build your route", "Reorder stops and get timings for the whole day."],
];

export default function HomePage() {
  const { places, loading, error } = usePlaces();
  const featured = [...places].sort((a, b) => Number(a.distance_km) - Number(b.distance_km)).slice(0, 3);

  return (
    <div>
      <HeroBanner>
        <p className="font-mono text-xs text-jade-light tracking-widest uppercase mb-2">25 km radius · Nugawela, Kandy</p>
        <h1 className="font-display text-4xl sm:text-5xl text-white mb-3 drop-shadow-lg">Explore places, build your day</h1>
        <p className="text-white/80 text-sm sm:text-base max-w-lg drop-shadow mb-5">Browse temples, waterfalls and viewpoints near Nugawela, then string together a one-day trail.</p>
        <div className="flex gap-3">
          <Link href="/places" className="bg-gold text-bg font-medium text-sm rounded-full px-6 py-2.5 hover:bg-gold-hover transition-colors">Explore places</Link>
          <Link href="/map" className="border border-white/30 bg-white/10 backdrop-blur text-white text-sm rounded-full px-6 py-2.5 hover:bg-white/20 transition-colors">Open map</Link>
        </div>
      </HeroBanner>

      <section className="mt-10">
        <h2 className="font-display text-2xl text-ink mb-4">How it works</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map(([t, d], i) => (
            <div key={t} className="relative bg-surface border border-border rounded-xl p-5">
              <span className="absolute right-4 top-2 font-display text-4xl text-border">{i + 1}</span>
              <h3 className="font-medium text-ink">{t}</h3>
              <p className="text-sm text-muted mt-1">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-12">
        <div className="flex items-end justify-between mb-4">
          <h2 className="font-display text-2xl text-ink">Nearby favourites</h2>
          <Link href="/places" className="text-sm text-gold hover:text-gold-hover">View all →</Link>
        </div>
        {loading && <p className="text-muted text-sm">Loading places...</p>}
        {error && <p className="text-terracotta text-sm">Error: {error}</p>}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {featured.map((p, i) => <PlaceCard key={p.id} place={p} index={i} />)}
        </div>
      </section>
    </div>
  );
}