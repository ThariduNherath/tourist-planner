/// <reference types="jest" />
import {
  filterPlacesByCategory,
  calculateTotalDistance,
  sortPlacesByDistance,
  fmtTime,
  hoursText,
  toMin,
  minToStr,
  haversine,
} from "@/lib/utils";
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
    expect(sorted.map((p: Place) => p.id)).toEqual(["3", "1", "2"]);
  });

  it("does not mutate the original array", () => {
    const original = [...mockPlaces];
    sortPlacesByDistance(mockPlaces);
    expect(mockPlaces).toEqual(original);
  });
});

describe("fmtTime", () => {
  it("formats a morning time correctly", () => {
    expect(fmtTime("09:05")).toBe("9:05 AM");
  });

  it("formats an afternoon time correctly", () => {
    expect(fmtTime("14:30")).toBe("2:30 PM");
  });

  it("formats midnight as 12 AM", () => {
    expect(fmtTime("00:00")).toBe("12:00 AM");
  });

  it("formats noon as 12 PM", () => {
    expect(fmtTime("12:00")).toBe("12:00 PM");
  });
});

describe("hoursText", () => {
  it("uses opening_time/closing_time when both are set", () => {
    const place: Place = { ...mockPlaces[0], opening_time: "05:30", closing_time: "20:00", opening_hours: "fallback text" };
    expect(hoursText(place)).toBe("5:30 AM – 8:00 PM");
  });

  it("falls back to opening_hours text when times are missing", () => {
    const place: Place = { ...mockPlaces[0], opening_time: undefined, closing_time: undefined, opening_hours: "Open 24 hours" };
    expect(hoursText(place)).toBe("Open 24 hours");
  });
});

describe("toMin", () => {
  it("converts a time string to minutes since midnight", () => {
    expect(toMin("09:00")).toBe(540);
  });

  it("converts midnight correctly", () => {
    expect(toMin("00:00")).toBe(0);
  });

  it("converts an end-of-day time correctly", () => {
    expect(toMin("23:59")).toBe(1439);
  });
});

describe("minToStr", () => {
  it("converts minutes back to a readable time", () => {
    expect(minToStr(540)).toBe("9:00 AM");
  });

  it("round-trips with toMin for a given time", () => {
    expect(minToStr(toMin("14:30"))).toBe("2:30 PM");
  });
});

describe("haversine", () => {
  it("returns 0 for the same point", () => {
    expect(haversine(mockPlaces[0], mockPlaces[0])).toBeCloseTo(0, 5);
  });

  it("returns a positive distance between two different points", () => {
    const dist = haversine(mockPlaces[0], mockPlaces[1]);
    expect(dist).toBeGreaterThan(0);
  });

  it("is symmetric (a to b equals b to a)", () => {
    const ab = haversine(mockPlaces[0], mockPlaces[1]);
    const ba = haversine(mockPlaces[1], mockPlaces[0]);
    expect(ab).toBeCloseTo(ba, 5);
  });
});