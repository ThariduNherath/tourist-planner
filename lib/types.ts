export type Category = "Religious" | "Nature" | "Heritage" | "Cultural" | "Sightseeing";

export interface Place {
  id: string;
  name: string;
  category: Category;
  distance_km: number;
  description: string;
  opening_hours: string;
  travel_tips: string;
  latitude: number;
  longitude: number;
  image_url?: string | null;
  opening_time?: string | null;
  closing_time?: string | null;
  facilities?: string[] | null;
  created_at?: string;
}