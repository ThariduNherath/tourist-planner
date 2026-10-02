"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlaces } from "@/components/DataContext";
import { usePlan } from "@/components/PlanContext";
import { useToast } from "@/components/Toast";
import MapViewLoader from "@/components/MapViewLoader";
import { haversine, hoursText, minToStr, toMin } from "@/lib/utils";

export default function PlanPage() {
  const { places, loading } = usePlaces();
  const { items, move, remove, setMins, clear } = usePlan();
  const toast = useToast();
  const [start, setStart] = useState("09:00");
  const [buffer, setBuffer] = useState(20);

  if (loading) return <p className="text-muted text-sm">Loading...</p>;

  const stops = items.flatMap((i) => {
    const p = places.find((x) => x.id === i.id);
    return p ? [{ ...i, p }] : [];
  });
  let t = toMin(start);
  const rows = stops.map((s, i) => {
    const arrive = t, leave = arrive + s.mins;
    const km = i ? haversine(stops[i - 1].p, s.p) : 0;
    t = leave + buffer;
    const { opening_time: o, closing_time: c } = s.p;
    const warn = !!(o && c && (arrive < toMin(o) || leave > toMin(c)));
    return { ...s, arrive, leave, km, warn };
  });
  const totalKm = rows.reduce((a, r) => a + r.km, 0);

  const copy = () => {
    const txt = "My day plan\n" + rows.map((r, i) => `${i + 1}. ${minToStr(r.arrive)} – ${minToStr(r.leave)}  ${r.p.name}`).join("\n");
    navigator.clipboard?.writeText(txt).then(() => toast("Plan copied"));
  };

  if (rows.length === 0)
    return (
      <div className="text-center py-16 bg-surface rounded-xl border border-border animate-fade-in">
        <p className="text-muted mb-3">Your trail is empty.</p>
        <Link href="/places" className="text-gold font-medium text-sm hover:text-gold-hover">Browse places to add →</Link>
      </div>
    );

  const inp = "bg-bg border border-border rounded-lg px-2 py-1 text-ink focus:outline-none focus:border-gold";

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl text-ink mb-1">My One-Day Trail</h1>
          <p className="text-muted text-sm font-mono">
            {rows.length} stop{rows.length !== 1 ? "s" : ""} · ≈{totalKm.toFixed(1)} km straight-line · ends ~{minToStr(rows[rows.length - 1].leave)}
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <button onClick={copy} className="text-gold hover:text-gold-hover">Copy plan</button>
          <button onClick={clear} className="text-muted hover:text-terracotta">Clear</button>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 bg-surface border border-border rounded-xl p-4 text-sm text-muted mb-6">
        <label className="flex items-center gap-2">Start time
          <input type="time" value={start} onChange={(e) => setStart(e.target.value || "09:00")} className={inp} /></label>
        <label className="flex items-center gap-2">Travel buffer
          <input type="number" min={0} step={5} value={buffer} onChange={(e) => setBuffer(Math.max(0, Number(e.target.value)))} className={`${inp} w-20`} /> min</label>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          {rows.map((r, i) => (
            <div key={r.id} className="relative">
              {i < rows.length - 1 && <div className="trail-line" />}
              {i > 0 && <p className="text-[11px] text-muted font-mono ml-10 mb-1">≈ {r.km.toFixed(1)} km from previous · {buffer} min buffer</p>}
              <div className="relative bg-surface border border-border rounded-xl p-4 flex gap-3 mb-3 animate-fade-up" style={{ animationDelay: `${i * 60}ms` }}>
                <span className="w-7 h-7 rounded-full bg-gold text-bg text-sm flex items-center justify-center font-bold flex-shrink-0 z-10">{i + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-gold">{minToStr(r.arrive)} – {minToStr(r.leave)}</p>
                  <Link href={`/places/${r.p.id}`} className="font-medium text-ink hover:text-gold block truncate">{r.p.name}</Link>
                  <p className="text-xs text-muted font-mono mt-0.5">Open: {hoursText(r.p)}</p>
                  <label className="mt-2 flex items-center gap-2 text-xs text-muted">Time here
                    <select value={r.mins} onChange={(e) => setMins(r.id, Number(e.target.value))} className={inp}>
                      {[30, 45, 60, 90, 120, 180, 240].map((m) => <option key={m} value={m}>{m >= 60 ? `${m / 60} h` : `${m} min`}</option>)}
                    </select>
                  </label>
                  {r.warn && <p className="mt-2 text-xs text-terracotta bg-terracotta/10 rounded-lg px-3 py-2">⚠ Visit falls outside opening hours. Adjust start time or order.</p>}
                </div>
                <div className="flex flex-col gap-1 text-muted">
                  <button onClick={() => move(i, -1)} disabled={i === 0} className="text-xs px-1.5 disabled:opacity-20 hover:text-gold">▲</button>
                  <button onClick={() => move(i, 1)} disabled={i === rows.length - 1} className="text-xs px-1.5 disabled:opacity-20 hover:text-gold">▼</button>
                </div>
                <button onClick={() => remove(r.id)} className="text-xs text-terracotta font-medium hover:opacity-70 self-start">Remove</button>
              </div>
            </div>
          ))}
        </div>
        <div className="h-80 md:h-[480px] md:sticky md:top-24 rounded-xl overflow-hidden border border-border">
          <MapViewLoader places={rows.map((r) => r.p)} height="100%" route />
        </div>
      </div>
    </div>
  );
}