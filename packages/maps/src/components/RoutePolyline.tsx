"use client";

/**
 * RoutePolyline Component
 *
 * Renders the actual route line on Google Maps from either:
 * 1. An encoded polyline string (from Directions API)
 * 2. An array of LatLng points
 *
 * Uses Google Maps Polyline to display the route like Uber does.
 */

import { useEffect, useRef, useCallback } from "react";
import { useGoogleMapsContext } from "./GoogleMapsProvider";
import { decodePolyline } from "../services/optimization";
import type { LatLng } from "../config";

export interface RoutePolylineProps {
  /**
   * The map instance to render the polyline on
   */
  map: google.maps.Map | null;

  /**
   * Encoded polyline string from Google Directions API
   * If provided, this will be decoded and rendered
   */
  encodedPolyline?: string;

  /**
   * Array of LatLng points to render
   * Used if encodedPolyline is not provided
   */
  path?: LatLng[];

  /**
   * Color of the route line
   * @default "#042940" (primary blue)
   */
  strokeColor?: string;

  /**
   * Opacity of the route line (0-1)
   * @default 0.8
   */
  strokeOpacity?: number;

  /**
   * Width of the route line in pixels
   * @default 4
   */
  strokeWeight?: number;

  /**
   * Whether the polyline is visible
   * @default true
   */
  visible?: boolean;

  /**
   * Z-index of the polyline
   * @default 1
   */
  zIndex?: number;

  /**
   * Whether to show a dashed line (for planned routes)
   * @default false
   */
  dashed?: boolean;

  /**
   * Callback when the polyline is clicked
   */
  onClick?: () => void;
}

export function RoutePolyline({
  map,
  encodedPolyline,
  path,
  strokeColor = "#042940",
  strokeOpacity = 0.8,
  strokeWeight = 4,
  visible = true,
  zIndex = 1,
  dashed = false,
  onClick,
}: RoutePolylineProps) {
  const { isLoaded } = useGoogleMapsContext();
  const polylineRef = useRef<google.maps.Polyline | null>(null);

  // Get the path from encoded polyline or direct path
  const getPath = useCallback((): google.maps.LatLng[] => {
    if (encodedPolyline) {
      const decoded = decodePolyline(encodedPolyline);
      return decoded.map((point) => new google.maps.LatLng(point.lat, point.lng));
    }
    if (path) {
      return path.map((point) => new google.maps.LatLng(point.lat, point.lng));
    }
    return [];
  }, [encodedPolyline, path]);

  // Create or update the polyline
  useEffect(() => {
    if (!isLoaded || !map) return;

    const pathPoints = getPath();
    if (pathPoints.length === 0) {
      // Remove existing polyline if no path
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
      return;
    }

    // Create polyline options
    const polylineOptions: google.maps.PolylineOptions = {
      path: pathPoints,
      strokeColor,
      strokeOpacity: dashed ? 0 : strokeOpacity,
      strokeWeight,
      visible,
      zIndex,
      map,
    };

    // For dashed lines, use icons
    if (dashed) {
      polylineOptions.icons = [
        {
          icon: {
            path: "M 0,-1 0,1",
            strokeOpacity,
            strokeWeight,
            scale: 3,
          },
          offset: "0",
          repeat: "15px",
        },
      ];
    }

    if (polylineRef.current) {
      // Update existing polyline
      polylineRef.current.setOptions(polylineOptions);
    } else {
      // Create new polyline
      polylineRef.current = new google.maps.Polyline(polylineOptions);

      if (onClick) {
        polylineRef.current.addListener("click", onClick);
      }
    }

    return () => {
      // Cleanup on unmount
      if (polylineRef.current) {
        polylineRef.current.setMap(null);
        polylineRef.current = null;
      }
    };
  }, [
    isLoaded,
    map,
    getPath,
    strokeColor,
    strokeOpacity,
    strokeWeight,
    visible,
    zIndex,
    dashed,
    onClick,
  ]);

  // Update visibility
  useEffect(() => {
    if (polylineRef.current) {
      polylineRef.current.setVisible(visible);
    }
  }, [visible]);

  return null; // This component renders directly on the map
}

/**
 * Helper to fit map bounds to polyline
 */
export function fitMapToPolyline(
  map: google.maps.Map,
  encodedPolyline?: string,
  path?: LatLng[],
  padding: number = 50
) {
  const bounds = new google.maps.LatLngBounds();

  let points: LatLng[];
  if (encodedPolyline) {
    points = decodePolyline(encodedPolyline);
  } else if (path) {
    points = path;
  } else {
    return;
  }

  for (const point of points) {
    bounds.extend(new google.maps.LatLng(point.lat, point.lng));
  }

  map.fitBounds(bounds, padding);
}
