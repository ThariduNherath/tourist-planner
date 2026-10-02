"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";

const icon = L.divIcon({
  className: "", iconSize: [18, 18], iconAnchor: [9, 9],
  html: `<div style="width:18px;height:18px;border-radius:50%;background:#E3AF62;border:3px solid #12211C;box-shadow:0 0 0 3px #E3AF6255"></div>`,
});

function Click({ onPick }: { onPick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: (e) => onPick(e.latlng.lat, e.latlng.lng) });
  return null;
}

interface Props { pos: [number, number] | null; onPick: (lat: number, lng: number) => void; }

export default function LocationPicker({ pos, onPick }: Props) {
  return (
    <MapContainer center={pos ?? [7.2936, 80.6413]} zoom={11}>
      <TileLayer attribution="&copy; OpenStreetMap contributors" url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <Click onPick={onPick} />
      {pos && <Marker position={pos} icon={icon} />}
    </MapContainer>
  );
}