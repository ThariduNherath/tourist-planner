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