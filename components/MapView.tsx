"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import type { Place } from "@/lib/types";
import { usePlan } from "@/components/PlanContext";
import { hoursText } from "@/lib/utils";

const pin = (label: string | number) =>
  L.divIcon({
    className: "",
    iconSize: [26, 26],
    iconAnchor: [13, 13],
    popupAnchor: [0, -12],
    html: `<div style="width:26px;height:26px;border-radius:50%;background:#E3AF62;border:3px solid #12211C;box-shadow:0 0 0 3px #E3AF6255;display:flex;align-items:center;justify-content:center;font:700 11px sans-serif;color:#12211C">${label}</div>`,
  });

function Fit({ pts }: { pts: [number, number][] }) {
  const map = useMap();
  const key = pts.map((p) => p.join()).join("|");
  useEffect(() => {
    if (pts.length > 1) map.fitBounds(pts, { padding: [40, 40] });
    else if (pts.length === 1) map.setView(pts[0], 14);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, map]);
  return null;
}

interface Props {
  places: Place[];
  height?: string;
  route?: boolean;
  wheel?: boolean;
}

export default function MapView({
  places,
  height = "400px",
  route = false,
  wheel = false,
}: Props) {
  const { has, toggle } = usePlan();
  const pts = places.map((p) => [p.latitude, p.longitude] as [number, number]);
  return (
    <div style={{ height }}>
      <MapContainer
        center={[7.2936, 80.6413]}
        zoom={11}
        scrollWheelZoom={wheel}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Fit pts={pts} />
        {route && pts.length > 1 && (
          <Polyline
            positions={pts}
            pathOptions={{ color: "#E3AF62", weight: 4, dashArray: "8 8" }}
          />
        )}
        {places.map((p, i) => (
          <Marker
            key={p.id}
            position={[p.latitude, p.longitude]}
            icon={pin(route ? i + 1 : "")}
          >
            <Popup>
              <strong>{p.name}</strong>
              <br />
              {p.category} · {hoursText(p)}
              <div style={{ marginTop: 6, display: "flex", gap: 10 }}>
                <Link
                  href={`/places/${p.id}`}
                  style={{ color: "#E3AF62", textDecoration: "underline" }}
                >
                  Details
                </Link>
                <button
                  onClick={() => toggle(p.id)}
                  style={{ color: "#C98B5E", textDecoration: "underline" }}
                >
                  {has(p.id) ? "Remove from plan" : "Add to plan"}
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
