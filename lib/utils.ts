import type { Place, Category } from "./types";

export function filterPlacesByCategory(places: Place[], category: string): Place[] {
  if (category === "All") return places;
  return places.filter((p) => p.category === (category as Category));
}

export function calculateTotalDistance(places: Place[]): number {
  return places.reduce((sum, p) => sum + Number(p.distance_km), 0);
}

export function sortPlacesByDistance(places: Place[]): Place[] {
  return [...places].sort((a, b) => Number(a.distance_km) - Number(b.distance_km));
}

export const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};

export const hoursText = (p: Place) =>
  p.opening_time && p.closing_time ? `${fmtTime(p.opening_time)} – ${fmtTime(p.closing_time)}` : p.opening_hours;

export const toMin = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
};

export const minToStr = (m: number) => fmtTime(`${Math.floor(m / 60) % 24}:${m % 60}`);

export const haversine = (a: Place, b: Place) => {
  const r = (x: number) => (x * Math.PI) / 180,
    R = 6371;
  const dLat = r(b.latitude - a.latitude),
    dLon = r(b.longitude - a.longitude);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.latitude)) * Math.cos(r(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};

// Estimated travel time (minutes) from straight-line km.
// Road distance ~1.4x straight-line, average speed 30 km/h (hilly Kandy roads).
// Auto speed (km/h) by leg distance: short city legs are slower, longer legs faster.
// Speed grows smoothly with leg distance (20 km/h base, capped at 40 km/h).
export const autoSpeed = (km: number) => Math.min(40, 20 + 2 * km);
export const travelMin = (km: number, speed = 30, factor = 1.4) =>
  km <= 0 ? 0 : Math.max(5, Math.round(((km * factor) / speed) * 60 / 5) * 5);