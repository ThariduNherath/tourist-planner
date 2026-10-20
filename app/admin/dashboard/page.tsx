"use client";

import { useEffect, useMemo, useState } from "react";
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
const CAT_BAR: Record<string, string> = {
  Religious: "bg-gold",
  Nature: "bg-jade",
  Heritage: "bg-terracotta",
  Cultural: "bg-jade-light",
  Sightseeing: "bg-gold-hover",
};

const emptyForm = {
  id: "", name: "", category: "Nature" as Category, distance_km: "", description: "",
  opening_time: "", closing_time: "", opening_hours: "", facilities: "", travel_tips: "",
  entry_fee: "", best_time: "",
  image_url: "", latitude: "", longitude: "",
};
const inputCls = "w-full bg-bg border border-border rounded-lg px-3 py-2 text-sm text-ink placeholder:text-muted focus:outline-none focus:border-gold transition-colors";
const labelCls = "block text-xs text-muted mb-1";

function Modal({ title, body, yes, danger, onYes, onNo }: { title: string; body: React.ReactNode; yes: string; danger?: boolean; onYes: () => void; onNo: () => void }) {
  return (
    <div className="fixed inset-0 z-[1600] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4 animate-fade-in">
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

function StatCard({ label, value, hint, accent }: { label: string; value: React.ReactNode; hint?: string; accent?: string }) {
  return (
    <div className="bg-surface border border-border rounded-xl p-4 animate-fade-up">
      <p className="text-muted text-xs font-mono uppercase tracking-wide">{label}</p>
      <p className={`font-display text-3xl mt-2 ${accent ?? "text-ink"}`}>{value}</p>
      {hint && <p className="text-xs text-muted mt-1">{hint}</p>}
    </div>
  );
}

function SectionTitle({ n, children }: { n: number; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 mb-3">
      <span className="w-5 h-5 rounded-full bg-gold text-bg text-[11px] font-bold grid place-items-center">{n}</span>
      <h3 className="text-sm font-medium text-ink">{children}</h3>
    </div>
  );
}

export default function AdminDashboard() {
  const router = useRouter();
  const supabase = createClient();
  const toast = useToast();
  const { places, loading, reload } = usePlaces();
  const [ready, setReady] = useState(false);
  const [email, setEmail] = useState("");
  const [form, setForm] = useState(emptyForm);
  const [editing, setEditing] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [confirmTarget, setConfirmTarget] = useState<Place | null>(null);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [q, setQ] = useState("");
  const [catFilter, setCatFilter] = useState("All");
  const [refreshing, setRefreshing] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date>(new Date());

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
      setEmail(data.session.user.email ?? "");
      setReady(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => { setUpdatedAt(new Date()); }, [places]);

  const closeForm = () => { setFormOpen(false); setForm(emptyForm); setEditing(false); };

  useEffect(() => {
    if (!formOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") closeForm(); };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [formOpen]);

  const stats = useMemo(() => {
    const byCat = CATEGORIES.map((c) => ({ name: c, count: places.filter((p) => p.category === c).length }));
    const max = Math.max(1, ...byCat.map((c) => c.count));
    const avg = places.length ? places.reduce((s, p) => s + Number(p.distance_km), 0) / places.length : 0;
    const nearest = [...places].sort((a, b) => Number(a.distance_km) - Number(b.distance_km))[0];
    const withImages = places.filter((p) => p.image_url).length;
    const usedCats = byCat.filter((c) => c.count > 0).length;
    return { byCat, max, avg, nearest, withImages, usedCats };
  }, [places]);

  const filtered = useMemo(() => {
    const t = q.trim().toLowerCase();
    return places.filter((p) => (catFilter === "All" || p.category === catFilter) && (!t || p.name.toLowerCase().includes(t)));
  }, [places, q, catFilter]);

  const set = (k: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const openAdd = () => { setForm(emptyForm); setEditing(false); setFormOpen(true); };

  const startEdit = (p: Place) => {
    setForm({
      id: p.id, name: p.name, category: p.category, distance_km: String(p.distance_km), description: p.description,
      opening_time: p.opening_time?.slice(0, 5) ?? "", closing_time: p.closing_time?.slice(0, 5) ?? "",
      opening_hours: p.opening_hours, facilities: (p.facilities ?? []).join(", "), travel_tips: p.travel_tips,
      entry_fee: p.entry_fee ?? "", best_time: p.best_time ?? "",
      image_url: p.image_url ?? "", latitude: String(p.latitude), longitude: String(p.longitude),
    });
    setEditing(true);
    setFormOpen(true);
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
      travel_tips: form.travel_tips.trim(),
      entry_fee: form.entry_fee.trim() || null,
      best_time: form.best_time.trim() || null,
      image_url: form.image_url.trim() || null,
      latitude: lat, longitude: lng,
    };
    setBusy(true);
    const { error } = editing
      ? await supabase.from("places").update(payload).eq("id", form.id)
      : await supabase.from("places").insert(payload);
    setBusy(false);
    if (error) return toast(error.message, "err");
    toast(editing ? "Place updated" : "Place added");
    closeForm();
    reload();
  };

  const confirmDelete = async () => {
    if (!confirmTarget) return;
    const { error } = await supabase.from("places").delete().eq("id", confirmTarget.id);
    setConfirmTarget(null);
    if (error) toast(error.message, "err");
    else { toast("Place deleted"); reload(); }
  };

  const refresh = async () => {
    setRefreshing(true);
    await reload();
    setRefreshing(false);
    toast("Dashboard refreshed");
  };

  const logout = async () => { await supabase.auth.signOut(); router.push("/admin/login"); };

  if (!ready || loading) return <p className="text-muted text-sm">Loading...</p>;

  const pos: [number, number] | null =
    form.latitude !== "" && form.longitude !== "" && !isNaN(+form.latitude) && !isNaN(+form.longitude)
      ? [+form.latitude, +form.longitude]
      : null;

  return (
    <div className="animate-fade-in">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="font-display text-3xl text-ink">Admin Dashboard</h1>
          <p className="text-xs font-mono text-muted mt-1">
            {email} · updated {updatedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <div className="flex gap-3">
          <button onClick={refresh} disabled={refreshing} className="text-sm text-gold hover:text-gold-hover disabled:opacity-50">
            {refreshing ? "Refreshing..." : "↻ Refresh"}
          </button>
          <button onClick={() => setConfirmLogout(true)} className="text-sm text-terracotta font-medium hover:opacity-70">Log out</button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        <StatCard label="Total places" value={places.length} hint={places.length < 10 ? "Minimum 10 required" : "Requirement met ✓"} accent="text-gold" />
        <StatCard label="Categories in use" value={`${stats.usedCats} / ${CATEGORIES.length}`} hint="Categories with places" />
        <StatCard label="Avg. distance" value={`${stats.avg.toFixed(1)} km`} hint={stats.nearest ? `Nearest: ${stats.nearest.name}` : undefined} />
        <StatCard
          label="With images"
          value={`${stats.withImages} / ${places.length}`}
          hint={places.length - stats.withImages > 0 ? `${places.length - stats.withImages} missing an image` : "All places have images ✓"}
        />
      </div>

      <div className="bg-surface border border-border rounded-xl p-4 mb-8">
        <h2 className="font-display text-lg text-ink mb-3">Places by category</h2>
        <div className="space-y-2.5">
          {stats.byCat.map((c) => (
            <div key={c.name} className="flex items-center gap-3 text-sm">
              <span className="w-24 text-muted">{c.name}</span>
              <div className="flex-1 h-2.5 rounded-full bg-bg overflow-hidden">
                <div className={`h-full rounded-full transition-all duration-500 ${CAT_BAR[c.name]}`} style={{ width: `${(c.count / stats.max) * 100}%` }} />
              </div>
              <span className="w-6 text-right font-mono text-ink">{c.count}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-3">
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search places…" className={`${inputCls} !w-56 !rounded-full`} />
        <select value={catFilter} onChange={(e) => setCatFilter(e.target.value)} className={`${inputCls} !w-auto !rounded-full`}>
          <option value="All">All categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        <span className="text-xs font-mono text-muted">{filtered.length} of {places.length}</span>
        <button onClick={openAdd} className="ml-auto bg-gold text-bg rounded-full px-5 py-2 text-sm font-medium hover:bg-gold-hover transition-colors">
          + Add place
        </button>
      </div>

      <div className="bg-surface border border-border rounded-xl overflow-hidden">
        <div className="max-h-[560px] overflow-y-auto overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="sticky top-0 z-10 bg-surface2 text-muted text-xs font-mono uppercase tracking-wide">
              <tr>
                <th className="px-4 py-3 font-medium">Place</th>
                <th className="px-3 py-3 font-medium">Category</th>
                <th className="px-3 py-3 font-medium whitespace-nowrap">Distance</th>
                <th className="px-3 py-3 font-medium">Hours</th>
                <th className="px-3 py-3 font-medium">Entry fee</th>
                <th className="px-4 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="border-t border-border hover:bg-bg/40 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3 min-w-[180px]">
                      <div
                        className="w-10 h-10 rounded-lg bg-bg border border-border bg-cover bg-center flex-shrink-0"
                        style={p.image_url ? { backgroundImage: `url(${p.image_url})` } : undefined}
                      />
                      <span className="font-medium text-ink">{p.name}</span>
                    </div>
                  </td>
                  <td className="px-3 py-3 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1.5 text-xs px-2 py-1 rounded-full bg-bg border border-border text-muted">
                      <span className={`w-1.5 h-1.5 rounded-full ${CAT_BAR[p.category] ?? "bg-muted"}`} />
                      {p.category}
                    </span>
                  </td>
                  <td className="px-3 py-3 font-mono text-gold whitespace-nowrap">{p.distance_km} km</td>
                  <td className="px-3 py-3 font-mono text-xs text-muted whitespace-nowrap">{hoursText(p)}</td>
                  <td className="px-3 py-3 font-mono text-xs text-muted">{p.entry_fee || "—"}</td>
                  <td className="px-4 py-3 text-right whitespace-nowrap">
                    <button onClick={() => startEdit(p)} className="text-xs font-medium text-gold hover:text-gold-hover mr-4">Edit</button>
                    <button onClick={() => setConfirmTarget(p)} className="text-xs font-medium text-terracotta hover:opacity-70">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <p className="text-muted text-sm text-center py-10">No places match.</p>}
        </div>
      </div>

      {formOpen && (
        <div
          className="fixed inset-0 z-[1500] flex items-center justify-center bg-black/60 backdrop-blur-sm px-3 sm:px-6 pt-24 pb-6 animate-fade-in"
          onMouseDown={(e) => { if (e.target === e.currentTarget) closeForm(); }}
        >
          <form
            onSubmit={handleSubmit}
            className="bg-surface border border-border rounded-2xl shadow-2xl shadow-black/50 w-full max-w-4xl max-h-[calc(100vh-7.5rem)] flex flex-col animate-fade-up"
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="font-display text-xl text-ink">{editing ? "Edit place" : "Add new place"}</h2>
                <p className="text-xs text-muted mt-0.5">Fields marked * are required</p>
              </div>
              <button type="button" onClick={closeForm} aria-label="Close" className="text-muted hover:text-ink text-2xl leading-none px-2">×</button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-5 grid md:grid-cols-2 gap-x-8 gap-y-6">
              <div className="space-y-6">
                <section>
                  <SectionTitle n={1}>Basic info</SectionTitle>
                  <div className="space-y-3">
                    <div>
                      <label className={labelCls}>Name *</label>
                      <input required placeholder="e.g. Udawatta Kele Sanctuary" value={form.name} onChange={set("name")} className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Category *</label>
                        <select value={form.category} onChange={set("category")} className={inputCls}>
                          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                        </select>
                      </div>
                      <div>
                        <label className={labelCls}>Distance (km) *</label>
                        <input required type="number" step="0.1" min="0" placeholder="10.5" value={form.distance_km} onChange={set("distance_km")} className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Description *</label>
                      <textarea required placeholder="Short description of the place" value={form.description} onChange={set("description")} className={inputCls} rows={3} />
                    </div>
                  </div>
                </section>

                <section>
                  <SectionTitle n={2}>Hours &amp; facilities</SectionTitle>
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Opens</label>
                        <input type="time" value={form.opening_time} onChange={set("opening_time")} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Closes</label>
                        <input type="time" value={form.closing_time} onChange={set("closing_time")} className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Hours text (only if no times, e.g. Open 24 hours)</label>
                      <input placeholder="Open 24 hours" value={form.opening_hours} onChange={set("opening_hours")} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Facilities (comma separated)</label>
                      <input placeholder="Parking, Restrooms, Food court" value={form.facilities} onChange={set("facilities")} className={inputCls} />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className={labelCls}>Entry fee (optional)</label>
                        <input placeholder="Free / Rs. 1,000 (foreign)" value={form.entry_fee} onChange={set("entry_fee")} className={inputCls} />
                      </div>
                      <div>
                        <label className={labelCls}>Best time to visit (optional)</label>
                        <input placeholder="Early morning, 6–9 AM" value={form.best_time} onChange={set("best_time")} className={inputCls} />
                      </div>
                    </div>
                    <div>
                      <label className={labelCls}>Travel tips *</label>
                      <textarea required placeholder="Dress code, parking, etc." value={form.travel_tips} onChange={set("travel_tips")} className={inputCls} rows={2} />
                    </div>
                  </div>
                </section>
              </div>

              <div className="space-y-6">
                <section>
                  <SectionTitle n={3}>Image</SectionTitle>
                  <label className={labelCls}>Image URL (optional)</label>
                  <input type="url" placeholder="https://…" value={form.image_url} onChange={set("image_url")} className={inputCls} />
                  <div
                    className="mt-3 h-32 rounded-lg border border-border bg-bg bg-cover bg-center grid place-items-center text-xs text-muted"
                    style={form.image_url ? { backgroundImage: `url(${form.image_url})` } : undefined}
                  >
                    {!form.image_url && "Image preview"}
                  </div>
                </section>

                <section>
                  <SectionTitle n={4}>Location</SectionTitle>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div>
                      <label className={labelCls}>Latitude *</label>
                      <input required type="number" step="any" placeholder="7.2936" value={form.latitude} onChange={set("latitude")} className={inputCls} />
                    </div>
                    <div>
                      <label className={labelCls}>Longitude *</label>
                      <input required type="number" step="any" placeholder="80.6413" value={form.longitude} onChange={set("longitude")} className={inputCls} />
                    </div>
                  </div>
                  <p className="text-xs text-muted mb-2">Or click the map to set the location:</p>
                  <div className="h-56 rounded-lg overflow-hidden border border-border relative isolate">
                    <LocationPicker
                      key={form.id || "new"}
                      pos={pos}
                      onPick={(la, lo) => setForm((s) => ({ ...s, latitude: la.toFixed(5), longitude: lo.toFixed(5) }))}
                    />
                  </div>
                </section>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-border">
              <button type="button" onClick={closeForm} className="px-5 py-2 rounded-lg border border-border text-sm text-muted hover:text-ink transition-colors">
                Cancel
              </button>
              <button type="submit" disabled={busy} className="px-6 py-2 rounded-lg bg-gold text-bg text-sm font-medium hover:bg-gold-hover disabled:opacity-50 transition-colors">
                {busy ? "Saving..." : editing ? "Update place" : "Add place"}
              </button>
            </div>
          </form>
        </div>
      )}

      {confirmTarget && (
        <Modal
          danger
          title="Delete this place?"
          yes="Delete"
          onYes={confirmDelete}
          onNo={() => setConfirmTarget(null)}
          body={<><span className="text-ink font-medium">{confirmTarget.name}</span> will be permanently removed.</>}
        />
      )}
      {confirmLogout && (
        <Modal title="Log out?" yes="Log out" onYes={logout} onNo={() => setConfirmLogout(false)} body="You'll need to sign in again to manage places." />
      )}
    </div>
  );
}