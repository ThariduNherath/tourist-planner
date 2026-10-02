import type { Place } from "./types";

export const fmtTime = (t: string) => {
  const [h, m] = t.split(":").map(Number);
  return `${((h + 11) % 12) + 1}:${String(m).padStart(2, "0")} ${h >= 12 ? "PM" : "AM"}`;
};
export const hoursText = (p: Place) =>
  p.opening_time && p.closing_time ? `${fmtTime(p.opening_time)} – ${fmtTime(p.closing_time)}` : p.opening_hours;
export const toMin = (t: string) => { const [h, m] = t.split(":").map(Number); return h * 60 + m; };
export const minToStr = (m: number) => fmtTime(`${Math.floor(m / 60) % 24}:${m % 60}`);
export const haversine = (a: Place, b: Place) => {
  const r = (x: number) => (x * Math.PI) / 180, R = 6371;
  const dLat = r(b.latitude - a.latitude), dLon = r(b.longitude - a.longitude);
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(r(a.latitude)) * Math.cos(r(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(x));
};