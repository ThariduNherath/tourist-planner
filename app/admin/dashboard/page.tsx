"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase";
import type { Place, Category } from "@/lib/types";
import { usePlaces } from "@/components/DataContext";
import { useToast } from "@/components/Toast";
import { fmtTime, hoursText } from "@/lib/utils";

const LocationPicker = dynamic(() => import("@/components/LocationPicker"), {
  ssr: false,
  loading: () => <div className="h-full grid place-items-center text-muted text-sm">Loading map...</div>,
});

const CATEGORIES: Category[] = ["Religious", "Nature", "Heritage", "Cultural", "Sightseeing"];
const emptyForm = {
  id: "", name: "", category: "Nature" as Category, distance_km: "", description: "",
  opening_time: "", closing_time: "", opening_hours: "", facilities: "", travel_tips: "",
  image_url: "", latitude: "", longitude: "",
};
const inputCls = "w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-gold transition-colors";

function Modal({ title, body, yes, danger, onYes, onNo }: { title: string; body: React.ReactNode; yes: string; danger?: boolean; onYes: () => void; onNo: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in">
      <div className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/50 max-w-sm w-full p-6 text-center animate-fade-up">
        <h3 className="font-display text-lg text-ink mb-1">{title}</h3>
        <p className="text-sm text-muted mb-6">{body}</p>
        <div className="flex gap-3">
          <button onClick={onNo} className="flex-1 rounded-lg border border-border text-sm text-muted py-2.5 hover:text-ink transition-colors">Cancel</button>
          <button onClick={onYes} className={`flex-1 rounded-lg text-sm font-medium py-2.5 hover:opacity-90 ${danger ? "bg-terracotta text-white" : "bg-gold text-bg"}`}>{yes}</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();
  const { places, loading, reload } = usePlaces();
  const [ready, setReady] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Place | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return router.push("/admin/login");
      const { data: adm } = await supabase.from("admins").select("user_id").eq("user_id", data.session.user.id).maybeSingle();
      if (!adm) {
        await supabase.auth.signOut();
        toast("This account is not an administrator", "err");
        return router.push("/admin/login");
      }
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const resetForm = () => { setForm(emptyForm); setEditing(false); };

  const startEdit = (p: Place) => {
    setForm({
      id: p.id, name: p.name, category: p.category, distance_km: String(p.distance_km), description: p.description,
      opening_time: p.opening_time?.slice(0, 5) ?? "", closing_time: p.closing_time?.slice(0, 5) ?? "",
      opening_hours: p.opening_hours, facilities: (p.facilities ?? []).join(", "), travel_tips: p.travel_tips,
      image_url: p.image_url ?? "", latitude: String(p.latitude), longitude: String(p.longitude),
    });
    setEditing(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const lat = Number(form.latitude), lng = Number(form.longitude);
    if (isNaN(lat) || lat < -90 || lat > 90 || isNaN(lng) || lng < -180 || lng > 180)
      return toast("Enter a valid latitude / longitude", "err");
    const o = form.opening_time, c = form.closing_time;
    if (!!o !== !!c) return toast("Provide both opening and closing time", "err");
    const hours = o && c ? `${fmtTime(o)} – ${fmtTime(c)}` : form.opening_hours.trim();
    if (!hours) return toast("Set opening/closing times or an opening hours text", "err");

    const payload = {
      name: form.name.trim(), category: form.category, distance_km: Number(form.distance_km),
      description: form.description.trim(), opening_hours: hours,
      opening_time: o || null, closing_time: c || null,
      facilities: form.facilities.split(",").map((s) => s.trim()).filter(Boolean),
      travel_tips: form.travel_tips.trim(), image_url: form.image_url.trim() || null,
      latitude: lat, longitude: lng,
    };
    setBusy(true);
    const { error } = editing
      ? await supabase.from("places").update(payload).eq("id", form.id)
      : await supabase.from("places").insert(payload);
    setBusy(false);
    if (error) return toast(error.message, "err");
    toast(editing ? "Place updated" : "Place added");
    resetForm();
    reload();
  };

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    const { error } = await supabase.from("places").delete().eq("id", confirmTarget.id);
    setConfirmTarget(null);
    if (error) toast(error.message, "err");
    else { toast("Place deleted"); reload(); }
  };

  const logout = async () => { await supabase.auth.signOut(); router.push("/admin/login"); };

  if (!ready || loading) return <p className="text-muted text-sm">Loading...</p>;

  const pos: [number, number] | null =
    form.latitude !== "" && form.longitude !== "" && !isNaN(+form.latitude) && !isNaN(+form.longitude) ? [+form.latitude, +form.longitude] : null;

  return (
    <div className="animate-fade-in">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-display text-3xl text-ink">Admin Dashboard</h1>
          <p className="text-xs font-mono text-muted mt-1">{places.length} places</p>
        </div>
        <button onClick={() => setConfirmLogout(true)} className="text-sm text-terracotta font-medium hover:opacity-70">Log out</button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={handleSubmit} className="lg:col-span-1 bg-surface border border-border rounded-xl p-4 space-y-2 h-fit">
          <h2 className="font-display text-lg text-ink mb-1">{editing ? "Edit Place" : "Add New Place"}</h2>
          <input required placeholder="Name" value={form.name} onChange={set("name")} className={inputCls} />
          <select value={form.category} onChange={set("category")} className={inputCls}>
            {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <input required type="number" step="0.1" min="0" placeholder="Distance (km)" value={form.distance_km} onChange={set("distance_km")} className={inputCls} />
          <textarea required placeholder="Description" value={form.description} onChange={set("description")} className={inputCls} rows={2} />
          <div className="flex gap-2">
            <label className="w-1/2 text-xs text-muted">Opens<input type="time" value={form.opening_time} onChange={set("opening_time")} className={inputCls} /></label>
            <label className="w-1/2 text-xs text-muted">Closes<input type="time" value={form.closing_time} onChange={set("closing_time")} className={inputCls} /></label>
          </div>
          <input placeholder="Hours text if no times (e.g. Open 24 hours)" value={form.opening_hours} onChange={set("opening_hours")} className={inputCls} />
          <input placeholder="Facilities (comma separated)" value={form.facilities} onChange={set("facilities")} className={inputCls} />
          <textarea required placeholder="Travel Tips" value={form.travel_tips} onChange={set("travel_tips")} className={inputCls} rows={2} />
          <input type="url" placeholder="Image URL (optional) https://…" value={form.image_url} onChange={set("image_url")} className={inputCls} />
          {form.image_url && <div className="h-24 rounded-lg border border-border bg-cover bg-center" style={{ backgroundImage: `url(${form.image_url})` }} />}
          <div className="flex gap-2">
            <input required type="number" step="any" placeholder="Latitude" value={form.latitude} onChange={set("latitude")} className={`w-1/2 ${inputCls}`} />
            <input required type="number" step="any" placeholder="Longitude" value={form.longitude} onChange={set("longitude")} className={`w-1/2 ${inputCls}`} />
          </div>
          <p className="text-xs text-muted">Or click the map to set location:</p>
          <div className="h-56 rounded-lg overflow-hidden border border-border">
            <LocationPicker key={form.id || "new"} pos={pos} onPick={(la, lo) => setForm((s) => ({ ...s, latitude: la.toFixed(5), longitude: lo.toFixed(5) }))} />
          </div>
          <div className="flex gap-2 pt-1">
            <button type="submit" disabled={busy} className="flex-1 bg-gold text-bg rounded-lg py-2 text-sm font-medium hover:bg-gold-hover disabled:opacity-50 transition-colors">
              {busy ? "Saving..." : editing ? "Update" : "Add Place"}
            </button>
            {editing && <button type="button" onClick={resetForm} className="px-3 rounded-lg border border-border text-sm text-muted hover:text-ink">Cancel</button>}
          </div>
        </form>

        <div className="lg:col-span-2 space-y-3">
          {places.map((p, i) => (
            <div key={p.id} className="bg-surface border border-border rounded-xl p-4 flex items-center justify-between gap-3 animate-fade-up" style={{ animationDelay: `${Math.min(i, 8) * 40}ms` }}>
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-12 h-12 rounded-lg bg-surface2 bg-cover bg-center flex-shrink-0" style={p.image_url ? { backgroundImage: `url(${p.image_url})` } : undefined} />
                <div className="min-w-0">
                  <p className="font-medium text-ink truncate">{p.name}</p>
                  <p className="text-xs text-muted font-mono">{p.category} · {p.distance_km} km · {hoursText(p)}</p>
                </div>
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
        <Modal danger title="Delete this place?" yes="Delete" onYes={confirmDelete} onNo={() => setConfirmTarget(null)}
          body={<><span className="text-ink font-medium">{confirmTarget.name}</span> will be permanently removed.</>} />
      )}
      {confirmLogout && (
        <Modal title="Log out?" yes="Log out" onYes={logout} onNo={() => setConfirmLogout(false)} body="You'll need to sign in again to manage places." />
      )}
    </div>
  );
}