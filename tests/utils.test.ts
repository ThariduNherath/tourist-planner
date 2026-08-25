/// <reference types="jest" />
import { filterPlacesByCategory, calculateTotalDistance, sortPlacesByDistance } from "@/lib/utils";
import type { Place } from "@/lib/types";
const mockPlaces: Place[] = [
  { id: "1", name: "Temple A", category: "Religious", distance_km: 10, description: "", opening_hours: "", travel_tips: "", latitude: 7.29, longitude: 80.64 },
  { id: "2", name: "Waterfall B", category: "Nature", distance_km: 24, description: "", opening_hours: "", travel_tips: "", latitude: 7.16, longitude: 80.70 },
  { id: "3", name: "Museum C", category: "Heritage", distance_km: 9, description: "", opening_hours: "", travel_tips: "", latitude: 7.29, longitude: 80.64 },
];

describe("filterPlacesByCategory", () => {
  it("returns all places when category is 'All'", () => {
    expect(filterPlacesByCategory(mockPlaces, "All")).toHaveLength(3);
  });

  it("returns only places matching the given category", () => {
    const result = filterPlacesByCategory(mockPlaces, "Nature");
    expect(result).toHaveLength(1);
    expect(result[0].name).toBe("Waterfall B");
  });

  it("returns an empty array when no places match", () => {
    expect(filterPlacesByCategory(mockPlaces, "Cultural")).toHaveLength(0);
  });
});

describe("calculateTotalDistance", () => {
  it("sums the distance of all places", () => {
    expect(calculateTotalDistance(mockPlaces)).toBe(43);
  });

  it("returns 0 for an empty list", () => {
    expect(calculateTotalDistance([])).toBe(0);
  });
});

describe("sortPlacesByDistance", () => {
  it("sorts places from nearest to farthest", () => {
    const sorted = sortPlacesByDistance(mockPlaces);
    expect(sorted.map((p) => p.id)).toEqual(["3", "1", "2"]);
  });

  it("does not mutate the original array", () => {
    const original = [...mockPlaces];
    sortPlacesByDistance(mockPlaces);
    expect(mockPlaces).toEqual(original);
  });
});