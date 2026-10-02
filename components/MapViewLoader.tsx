"use client";

import dynamic from "next/dynamic";
import type { Place } from "@/lib/types";

const MapView = dynamic(() => import("@/components/MapView"), {
  ssr: false,
  loading: () => <div className="h-full w-full flex items-center justify-center bg-surface rounded-xl text-muted text-sm">Loading map...</div>,
});

interface Props { places: Place[]; height?: string; route?: boolean; wheel?: boolean; }

export default function MapViewLoader(props: Props) {
  return <MapView {...props} />;
}