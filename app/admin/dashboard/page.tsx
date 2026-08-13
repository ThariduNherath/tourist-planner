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

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const [places, setPlaces] = useState<Place[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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

  const handleLogout = async () => {
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

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this place?")) return;
    const { error } = await supabase.from("places").delete().eq("id", id);
    if (error) setMessage(`Error: ${error.message}`);
    else loadPlaces();
  };

  if (loading) return <p className="text-slate-400 text-sm">Loading...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">Admin Dashboard</h1>
        <button onClick={handleLogout} className="text-sm text-red-500 font-medium">Log out</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-1 bg-white border border-slate-200 rounded-xl p-4 space-y-2 h-fit">
          <h2 className="font-semibold text-slate-700 mb-1">{editing ? "Edit Place" : "Add New Place"}</h2>
          <input required placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value as Category })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input required type="number" step="0.1" placeholder="Distance (km)" value={form.distance_km} onChange={(e) => setForm({ ...form, distance_km: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          <textarea required placeholder="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" rows={2} />
          <input required placeholder="Opening Hours" value={form.opening_hours} onChange={(e) => setForm({ ...form, opening_hours: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          <textarea required placeholder="Travel Tips" value={form.travel_tips} onChange={(e) => setForm({ ...form, travel_tips: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" rows={2} />
          <div className="flex gap-2">
            <input required type="number" step="0.0001" placeholder="Latitude" value={form.latitude} onChange={(e) => setForm({ ...form, latitude: e.target.value })} className="w-1/2 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
            <input required type="number" step="0.0001" placeholder="Longitude" value={form.longitude} onChange={(e) => setForm({ ...form, longitude: e.target.value })} className="w-1/2 border border-slate-200 rounded-lg px-3 py-2 text-sm" />
          </div>
          {message && <p className="text-xs text-emerald-700">{message}</p>}
          <div className="flex gap-2 pt-1">
            <button type="submit" className="flex-1 bg-emerald-600 text-white rounded-lg py-2 text-sm font-medium hover:bg-emerald-700">
              {editing ? "Update" : "Add Place"}
            </button>
            {editing && (
              <button type="button" onClick={resetForm} className="px-3 rounded-lg border border-slate-200 text-sm">
                Cancel
              </button>
            )}
          </div>
        </form>

        <div className="lg:col-span-2 space-y-3">
          {places.map((p) => (
            <div key={p.id} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-medium text-slate-800 truncate">{p.name}</p>
                <p className="text-xs text-slate-400">{p.category} · {p.distance_km} km · {p.opening_hours}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button onClick={() => startEdit(p)} className="text-xs font-medium text-emerald-700">Edit</button>
                <button onClick={() => handleDelete(p.id)} className="text-xs font-medium text-red-500">Delete</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
