"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import type { Place } from "@/lib/types";

const goldIcon = L.divIcon({
  className: "",
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#E3AF62;border:3px solid #12211C;box-shadow:0 0 0 3px #E3AF6255;"></div>`,
  iconSize: [18, 18], iconAnchor: [9, 9],
});

interface MapViewProps { places: Place[]; height?: string; center?: [number, number]; }

export default function MapView({ places, height = "400px", center }: MapViewProps) {
  const mapCenter: [number, number] = center ?? (places.length > 0 ? [places[0].latitude, places[0].longitude] : [7.2936, 80.6413]);
  return (
    <div style={{ height }}>
      <MapContainer center={mapCenter} zoom={12} scrollWheelZoom={false}>
        <TileLayer attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; OpenStreetMap contributors' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
        {places.map((place) => (
          <Marker key={place.id} position={[place.latitude, place.longitude]} icon={goldIcon}>
            <Popup><strong>{place.name}</strong><br />{place.category} · {place.distance_km} km</Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}