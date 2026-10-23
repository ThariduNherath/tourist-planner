"use client";

import { useState } from "react";
import Link from "next/link";
import { usePlaces } from "@/components/DataContext";
import { usePlan } from "@/components/PlanContext";
import { useToast } from "@/components/Toast";
import MapViewLoader from "@/components/MapViewLoader";
import {
  haversine,
  hoursText,
  minToStr,
  toMin,
  travelMin,
  autoSpeed,
} from "@/lib/utils";

const DISCLAIMER =
  "Travel times are rough estimates (straight-line distance × 1.4, with an average speed that adjusts to each leg unless you override it). Please verify opening hours before visiting.";
export default function PlanPage() {
  const { places, loading } = usePlaces();
  const { items, move, remove, setMins, clear } = usePlan();
  const toast = useToast();
  const [start, setStart] = useState("09:00");
  const [speed, setSpeed] = useState(0);

  if (loading) return <p className="text-muted text-sm">Loading...</p>;

  const stops = items.flatMap((i) => {
    const p = places.find((x) => x.id === i.id);
    return p ? [{ ...i, p }] : [];
  });
  let t = toMin(start);
  const rows = stops.map((s, i) => {
    const km = i ? haversine(stops[i - 1].p, s.p) : 0;
    const travel = i ? travelMin(km, speed || autoSpeed(km)) : 0;
    const arrive = t + travel,
      leave = arrive + s.mins;
    t = leave;
    const { opening_time: o, closing_time: c } = s.p;
    const warn = !!(o && c && (arrive < toMin(o) || leave > toMin(c)));
    return { ...s, arrive, leave, km, travel, warn };
  });
  const totalKm = rows.reduce((a, r) => a + r.km, 0);
  const totalTravel = rows.reduce((a, r) => a + r.travel, 0);

  const copy = () => {
    const txt =
      "My day plan\n" +
      rows
        .map(
          (r, i) =>
            `${i + 1}. ${minToStr(r.arrive)} – ${minToStr(r.leave)}  ${r.p.name}`,
        )
        .join("\n");
    navigator.clipboard?.writeText(txt).then(() => toast("Plan copied"));
  };

  const downloadPDF = () => window.print();

  if (rows.length === 0)
    return (
      <div className="text-center py-16 bg-surface rounded-xl border border-border animate-fade-in">
        <p className="text-muted mb-3">Your trail is empty.</p>
        <Link
          href="/places"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full border border-gold/40 text-sm font-medium text-gold hover:bg-gold hover:text-bg transition-all duration-300 shadow-sm group"
        >
          Browse places to add
          <span className="transform transition-transform group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    );

  const inp =
    "bg-bg border border-border rounded-lg px-2 py-1 text-ink focus:outline-none focus:border-gold";
  const today = new Date().toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="animate-fade-in">
      <div className="print-only">
        <div className="print-header">
          <p className="print-kicker">25 KM RADIUS · NUGAWELA, KANDY</p>
          <h1 className="print-title">Kandy Day Visit Planner</h1>
          <p className="print-subtitle">Your personalised one-day itinerary</p>
          <div className="print-meta">
            <span>
              {rows.length} stop{rows.length !== 1 ? "s" : ""}
            </span>
            <span>·</span>
            <span>≈{totalKm.toFixed(1)} km total</span>
            <span>·</span>
            <span>
              {minToStr(toMin(start))} – {minToStr(rows[rows.length - 1].leave)}
            </span>
            <span>·</span>
            <span>Prepared {today}</span>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap items-end justify-between gap-3 mb-6 no-print">
        <div>
          <h1 className="font-display text-3xl text-ink mb-1">
            My One-Day Trail
          </h1>
          <p className="text-muted text-sm font-mono">
            {rows.length} stop{rows.length !== 1 ? "s" : ""} · ≈
            {totalKm.toFixed(1)} km · ≈{totalTravel} min travel · ends ~
            {minToStr(rows[rows.length - 1].leave)}
          </p>
        </div>
        <div className="flex gap-4 text-sm">
          <div className="flex items-center gap-2 font-medium text-xs sm:text-sm">
            {/* Copy Plan Button */}
            <button
              onClick={copy}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-gold/40 bg-gold/10 text-gold hover:bg-gold hover:text-bg transition-all duration-300 shadow-sm active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
              </svg>
              Copy plan
            </button>

            {/* Download PDF Button */}
            <button
              onClick={downloadPDF}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-border bg-surface text-ink hover:border-gold hover:text-gold transition-all duration-300 shadow-sm active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              Download PDF
            </button>

            {/* Clear Button */}
            <button
              onClick={clear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-transparent text-muted hover:text-terracotta hover:bg-terracotta/10 transition-all duration-300 active:scale-95"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
              Clear
            </button>
          </div>
        </div>
      </div>

      <div className="no-print flex flex-wrap gap-4 bg-surface border border-border rounded-xl p-4 text-sm text-muted mb-2">
        <label className="flex items-center gap-2">
          Start time
          <input
            type="time"
            value={start}
            onChange={(e) => setStart(e.target.value || "09:00")}
            className={inp}
          />
        </label>
        <label className="flex items-center gap-2">
          Speed override
          <input
            type="number"
            min={10}
            max={80}
            step={5}
            placeholder="Auto"
            value={speed || ""}
            onChange={(e) => setSpeed(Math.max(0, Number(e.target.value) || 0))}
            className={`${inp} w-20`}
          />{" "}
          km/h
        </label>
      </div>
      <p className="no-print text-xs text-muted mb-6">ⓘ {DISCLAIMER}</p>

      <div className="grid md:grid-cols-2 gap-6 print-grid">
        <div className="print-list">
          {rows.map((r, i) => (
            <div key={r.id} className="relative print-item">
              {i < rows.length - 1 && <div className="trail-line no-print" />}
              {i > 0 && (
                <p className="text-[11px] text-muted font-mono ml-10 mb-1 no-print">
                  ≈ {r.km.toFixed(1)} km · ≈ {r.travel} min travel
                </p>
              )}
              {i > 0 && (
                <p className="print-only print-between">
                  ↓ ≈ {r.km.toFixed(1)} km · ≈ {r.travel} min travel
                </p>
              )}
              <div
                className="relative bg-surface border border-border rounded-xl p-4 flex gap-3 mb-3 animate-fade-up print-card"
                style={{ animationDelay: `${i * 60}ms` }}
              >
                <span className="w-7 h-7 rounded-full bg-gold text-bg text-sm flex items-center justify-center font-bold flex-shrink-0 z-10 print-num">
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-mono text-gold print-time">
                    {minToStr(r.arrive)} – {minToStr(r.leave)}
                  </p>
                  <Link
                    href={`/places/${r.p.id}`}
                    className="font-medium text-ink hover:text-gold block truncate print-name"
                  >
                    {r.p.name}
                  </Link>
                  <p className="text-xs text-muted font-mono mt-0.5 print-hours">
                    Open: {hoursText(r.p)}
                  </p>
                  {r.p.entry_fee && (
                    <p className="text-xs text-muted font-mono mt-0.5 print-hours">
                      Entry: {r.p.entry_fee}
                    </p>
                  )}
                  {r.p.best_time && (
                    <p className="text-xs text-muted font-mono mt-0.5 print-hours">
                      Best time: {r.p.best_time}
                    </p>
                  )}
                  <p className="print-only print-desc">{r.p.description}</p>
                  {r.p.travel_tips && (
                    <p className="print-only print-tips">
                      💡 {r.p.travel_tips}
                    </p>
                  )}
                  <label className="no-print mt-2 flex items-center gap-2 text-xs text-muted">
                    Time here
                    <select
                      value={r.mins}
                      onChange={(e) => setMins(r.id, Number(e.target.value))}
                      className={inp}
                    >
                      {[30, 45, 60, 90, 120, 180, 240].map((m) => (
                        <option key={m} value={m}>
                          {m >= 60 ? `${m / 60} h` : `${m} min`}
                        </option>
                      ))}
                    </select>
                  </label>
                  {r.warn && (
                    <p className="mt-2 text-xs text-terracotta bg-terracotta/10 rounded-lg px-3 py-2 no-print">
                      ⚠ Visit falls outside opening hours. Adjust start time or
                      order.
                    </p>
                  )}
                </div>
                <div className="no-print flex flex-col gap-1 text-muted">
                  <button
                    onClick={() => move(i, -1)}
                    disabled={i === 0}
                    className="text-xs px-1.5 disabled:opacity-20 hover:text-gold"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => move(i, 1)}
                    disabled={i === rows.length - 1}
                    className="text-xs px-1.5 disabled:opacity-20 hover:text-gold"
                  >
                    ▼
                  </button>
                </div>
                <button
                  onClick={() => remove(r.id)}
                  className="no-print text-xs text-terracotta font-medium hover:opacity-70 self-start"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <p className="print-only print-disclaimer">{DISCLAIMER}</p>
          <p className="print-only print-footer">
            Generated by Kandy Day Visit Planner · Have a wonderful trip!
          </p>
        </div>
        <div className="no-print h-80 md:h-[480px] md:sticky md:top-24 rounded-xl overflow-hidden border border-border">
          <MapViewLoader places={rows.map((r) => r.p)} height="100%" route />
        </div>
      </div>
    </div>
  );
}
