"use client";

import { useMemo } from "react";
import type { LatLng } from "../types/maps";

export type StopMarkerStatus = "arrived" | "skipped" | "pending";

export interface StaticRouteMapStop {
  position: LatLng;
  status: StopMarkerStatus;
  order: number;
}

export interface StaticRouteMapProps {
  /** Array of stops with position and status */
  stops: StaticRouteMapStop[];
  /** School/destination position */
  schoolPosition?: LatLng | null;
  /** Encoded polyline string from Google Directions API */
  encodedPolyline?: string | null;
  /** Map size (default: 600x300) */
  size?: { width: number; height: number };
  /** Additional CSS classes */
  className?: string;
  /** Map zoom level (default: auto-fit to markers) */
  zoom?: number;
  /** Alt text for accessibility */
  alt?: string;
}

// Marker colors for Google Static Maps API
const statusColors: Record<StopMarkerStatus, string> = {
  arrived: "green",
  skipped: "orange",
  pending: "gray",
};

/**
 * Static Route Map Component
 *
 * Renders a static image of a route using Google Static Maps API.
 * Shows stops with color-coded markers based on status (arrived/skipped/pending)
 * and optionally the school position and route polyline.
 *
 * @example
 * ```tsx
 * <StaticRouteMap
 *   stops={stops.map((s, i) => ({
 *     position: { lat: s.latitude, lng: s.longitude },
 *     status: s.arrivedAt ? 'arrived' : s.skipped ? 'skipped' : 'pending',
 *     order: i + 1,
 *   }))}
 *   schoolPosition={{ lat: -0.18, lng: -78.48 }}
 *   encodedPolyline={route.optimizedPolyline}
 *   className="w-full h-48 rounded-lg"
 * />
 * ```
 */
export function StaticRouteMap({
  stops,
  schoolPosition,
  encodedPolyline,
  size = { width: 600, height: 300 },
  className,
  zoom,
  alt = "Mapa del recorrido",
}: StaticRouteMapProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  const mapUrl = useMemo(() => {
    if (!apiKey || stops.length === 0) return null;

    const params: string[] = [];

    // Map size
    params.push(`size=${size.width}x${size.height}`);

    // Map type
    params.push("maptype=roadmap");

    // Scale for retina displays
    params.push("scale=2");

    // Zoom (optional - if not set, Google will auto-fit)
    if (zoom) {
      params.push(`zoom=${zoom}`);
    }

    // Stop markers
    stops.forEach((stop) => {
      const color = statusColors[stop.status];
      params.push(`markers=color:${color}|label:${stop.order}|${stop.position.lat},${stop.position.lng}`);
    });

    // School marker (custom icon or blue marker)
    if (schoolPosition) {
      params.push(`markers=color:blue|label:C|${schoolPosition.lat},${schoolPosition.lng}`);
    }

    // Route polyline path
    if (encodedPolyline) {
      // Encode the polyline for URL (replace special chars)
      const encodedPath = encodeURIComponent(encodedPolyline);
      params.push(`path=enc:${encodedPath}`);
    } else if (stops.length >= 2) {
      // Fallback: draw path through stops
      const pathPoints = stops
        .sort((a, b) => a.order - b.order)
        .map((s) => `${s.position.lat},${s.position.lng}`)
        .join("|");
      params.push(`path=color:0x042940CC|weight:4|${pathPoints}`);
    }

    // API key
    params.push(`key=${apiKey}`);

    return `https://maps.googleapis.com/maps/api/staticmap?${params.join("&")}`;
  }, [apiKey, stops, schoolPosition, encodedPolyline, size, zoom]);

  if (!mapUrl) {
    return (
      <div
        className={`bg-gray-100 flex items-center justify-center text-gray-400 ${className || ""}`}
        style={{ width: size.width, height: size.height }}
      >
        No se puede cargar el mapa
      </div>
    );
  }

  return (
    <img
      src={mapUrl}
      alt={alt}
      className={className}
      style={{ maxWidth: "100%", height: "auto" }}
      loading="lazy"
    />
  );
}

export default StaticRouteMap;
