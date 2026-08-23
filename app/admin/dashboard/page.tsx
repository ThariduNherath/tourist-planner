"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Place, Category } from "@/lib/types";

const CATEGORIES: Category[] = ["Religious", "Nature", "Heritage", "Cultural", "Sightseeing"];

const emptyForm = {
  id: "",
  name: "",
  category: "Nature" as Category,
  distance_km: "",
  description: "",
  opening_hours: "",
  travel_tips: "",
  latitude: "",
  longitude: "",
};

const inputCls = "w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-gold transition-colors";

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [confirmTarget, setConfirmTarget] = useState<Place | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const loadPlaces = async () => {
    const { data } = await supabase.from("places").select("*").order("name");
    setPlaces((data as Place[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    const check = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) {
        router.push("/admin/login");
        return;
      }
      loadPlaces();
    };
    check();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const confirmLogoutAction = async () => {
    await supabase.auth.signOut();
    router.push("/admin/login");
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditing(false);
  };

  const startEdit = (p: Place) => {
    setForm({
      id: p.id,
      name: p.name,
      category: p.category,
      distance_km: String(p.distance_km),
      description: p.description,
      opening_hours: p.opening_hours,
      travel_tips: p.travel_tips,
      latitude: String(p.latitude),
      longitude: String(p.longitude),
    });
    setEditing(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    const payload = {
      name: form.name,
      category: form.category,
      distance_km: Number(form.distance_km),
      description: form.description,
      opening_hours: form.opening_hours,
      travel_tips: form.travel_tips,
      latitude: Number(form.latitude),
      longitude: Number(form.longitude),
    };

    const { error } = editing
      ? await supabase.from("places").update(payload).eq("id", form.id)
      : await supabase.from("places").insert(payload);

    if (error) {
      setMessage(`Error: ${error.message}`);
    } else {
      setMessage(editing ? "Place updated." : "Place added.");
      resetForm();
      loadPlaces();
    }
  };

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    const { error } = await supabase.from("places").delete().eq("id", confirmTarget.id);
    if (error) setMessage(`Error: ${error.message}`);
    else loadPlaces();
    setConfirmTarget(null);
  };

  if (loading) return <p className="text-muted text-sm">Loading...</p>;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-3xl text-ink">Admin Dashboard</h1>
        <button onClick={() => setConfirmLogout(true)} className="text-sm text-terracotta font-medium hover:opacity-70">Log out</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-1 bg-surface border border-border rounded-xl p-4 space-y-2 h-fit">
          <h2 className="font-display text-lg text-ink mb-1">{editing ? "Edit Place" : "Add New Place"}</h2>
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })} className={inputCls}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input required type="number" step="0.1" placeholder="Distance (km)" value={form.distance_km} onChange={(e) => setForm({ ...form, distance_km: e.target.value })} className={inputCls} />
          <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} rows={2} />
          <input required placeholder="Opening Hours" value={form.opening_hours} onChange={(e) => setForm({ ...form, opening_hours: e.target.value })} className={inputCls} />
          <textarea required placeholder="Travel Tips" value={form.travel_tips} onChange={(e) => setForm({ ...form, travel_tips: e.target.value })} className={inputCls} rows={2} />
          <div className="flex gap-2">
            <input required type="number" step="0.0001" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className={`w-1/2 ${inputCls}`} />
            <input required type="number" step="0.0001" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className={`w-1/2 ${inputCls}`} />
          </div>
          {message && <p className="text-xs text-jade-light">{message}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" className="flex-1 bg-gold text-bg rounded-lg py-2 text-sm font-medium hover:bg-gold-hover transition-colors">
              {editing ? "Update" : "Add Place"}
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className="px-3 rounded-lg border border-border text-sm text-muted hover:text-ink">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="lg:col-span-2 space-y-3">
          {places.map((p, i) => (
            <div key={p.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between gap-3 animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
              <div className="min-w-0">
                <p className="font-medium text-ink truncate">{p.name}</p>
                <p className="text-xs text-muted font-mono">{p.category} · {p.distance_km} km · {p.opening_hours}</p>
              </div>
              <div className="flex gap-3 flex-shrink-0">
                <button onClick={() => startEdit(p)} className="text-xs font-medium text-gold hover:text-gold-hover">Edit</button>
                <button onClick={() => setConfirmTarget(p)} className="text-xs font-medium text-terracotta hover:opacity-70">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {confirmTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in">
          <div className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/50 max-w-sm w-full p-6 text-center animate-fade-up">
            <div className="w-14 h-14 mx-auto rounded-full bg-terracotta/15 border border-terracotta/40 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-terracotta" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m3 0-1 14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2L4 6h16Z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-display text-lg text-ink mb-1">Delete this place?</h3>
            <p className="text-sm text-muted mb-6">
              <span className="text-ink font-medium">{confirmTarget.name}</span> will be permanently removed. This can't be undone.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmTarget(null)} className="flex-1 rounded-lg border border-border text-sm text-muted py-2.5 hover:text-ink transition-colors">
                Cancel
              </button>
              <button onClick={confirmDelete} className="flex-1 rounded-lg bg-terracotta text-white text-sm font-medium py-2.5 hover:opacity-90 transition-opacity">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in">
          <div className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/50 max-w-sm w-full p-6 text-center animate-fade-up">
            <div className="w-14 h-14 mx-auto rounded-full bg-gold/15 border border-gold/40 flex items-center justify-center mb-4">
              <svg viewBox="0 0 24 24" className="w-7 h-7 text-gold" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <h3 className="font-display text-lg text-ink mb-1">Log out?</h3>
            <p className="text-sm text-muted mb-6">You'll need to sign in again to manage places.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmLogout(false)} className="flex-1 rounded-lg border border-border text-sm text-muted py-2.5 hover:text-ink transition-colors">
                Cancel
              </button>
              <button onClick={confirmLogoutAction} className="flex-1 rounded-lg bg-gold text-bg text-sm font-medium py-2.5 hover:bg-gold-hover transition-colors">
                Log out
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}