"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Place } from "@/lib/types";

// Fix default marker icons (Next.js/Webpack breaks Leaflet's default asset paths)
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface MapViewProps {
  places: Place[];
  height?: string;
  center?: [number, number];
}

export default function MapView({ places, height = "400px", center }: MapViewProps) {
  const mapCenter: [number, number] =
    center ?? (places.length > 0 ? [places[0].latitude, places[0].longitude] : [7.2936, 80.6413]);

  return (
    <div style={{ height }}>
      <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false}>
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {places.map((place) => (
          <Marker key={place.id} position={[place.latitude, place.longitude]} icon={icon}>
            <Popup>
              <strong>{place.name}</strong>
              <br />
              {place.category} · {place.distance_km} km
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
