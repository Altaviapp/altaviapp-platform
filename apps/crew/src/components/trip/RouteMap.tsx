/**
 * RouteMap Component
 *
 * Main Leaflet map with route polyline, stop markers, and bus marker
 * Supports both encoded polylines (from Google Directions API) and simple stop paths
 */

'use client';

import { useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { decodePolyline } from '@altaviapp/maps';

import type { Stop } from '@/types';
import type { GPSLocation } from '@/lib/mockData/gpsLocations';
import { StopMarker } from './StopMarker';
import { MapControls } from './MapControls';

export interface RouteMapProps {
  /** Array of stops in the route */
  stops: Stop[];
  /** Current stop index */
  currentStopIndex: number;
  /** Current GPS location */
  currentLocation: GPSLocation | null;
  /** Height of map container */
  height?: string;
  /** Whether to show controls */
  showControls?: boolean;
  /** Trip ID for unique map instance */
  tripId?: string;
  /** Encoded polyline from Google Directions API (optional) */
  encodedPolyline?: string;
}

/**
 * Component to handle map centering and zoom
 */
function MapController({ stops, currentLocation }: { stops: Stop[]; currentLocation: GPSLocation | null }) {
  const map = useMap();

  useEffect(() => {
    if (stops.length === 0) return;

    // Create bounds from all stops
    const bounds = L.latLngBounds(
      stops.map(stop => [stop.latitude, stop.longitude])
    );

    // Fit map to show all stops
    map.fitBounds(bounds, { padding: [50, 50] });
  }, [stops, map]);

  // Center on current location when it updates
  useEffect(() => {
    if (currentLocation) {
      map.setView([currentLocation.latitude, currentLocation.longitude], 15);
    }
  }, [currentLocation, map]);

  return null;
}

/**
 * Create custom bus icon
 */
function createBusIcon(heading: number = 0) {
  const svgIcon = `
    <svg width="40" height="40" viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
      <g transform="rotate(${heading} 20 20)">
        <circle cx="20" cy="20" r="18" fill="#DBF227" stroke="#042940" stroke-width="2"/>
        <path
          d="M20 8 L28 20 L20 15 L12 20 Z"
          fill="#042940"
        />
        <circle cx="20" cy="20" r="3" fill="#042940"/>
      </g>
    </svg>
  `;

  return L.divIcon({
    html: svgIcon,
    className: 'custom-bus-marker',
    iconSize: [40, 40],
    iconAnchor: [20, 20],
  });
}

/**
 * Route map with stops and current location
 */
export function RouteMap({
  stops,
  currentStopIndex,
  currentLocation,
  height = '400px',
  showControls = true,
  tripId,
  encodedPolyline,
}: RouteMapProps) {
  const [map, setMap] = useState<L.Map | null>(null);
  const [isClient, setIsClient] = useState(false);

  // Only render map on client (Leaflet requires window)
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Route polyline coordinates - MUST be before early returns to maintain hook order
  const routeCoordinates: [number, number][] = useMemo(() => {
    if (encodedPolyline) {
      // Decode the polyline and convert to Leaflet format [lat, lng]
      const decoded = decodePolyline(encodedPolyline);
      return decoded.map(point => [point.lat, point.lng] as [number, number]);
    }
    // Fallback to simple path from stops
    return stops.map(stop => [stop.latitude, stop.longitude] as [number, number]);
  }, [encodedPolyline, stops]);

  if (!isClient) {
    return (
      <div
        className="bg-gray-100 flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-600">Cargando mapa...</p>
      </div>
    );
  }

  if (stops.length === 0) {
    return (
      <div
        className="bg-gray-100 flex items-center justify-center"
        style={{ height }}
      >
        <p className="text-gray-600">No hay paradas para mostrar</p>
      </div>
    );
  }

  // Default center (first stop or current location)
  const firstStop = stops[0];
  const center: [number, number] = currentLocation
    ? [currentLocation.latitude, currentLocation.longitude]
    : firstStop
      ? [firstStop.latitude, firstStop.longitude]
      : [-2.1894, -79.8891]; // Default: Guayaquil, Ecuador

  // Map control handlers
  const handleZoomIn = () => {
    if (map) {
      map.zoomIn();
    }
  };

  const handleZoomOut = () => {
    if (map) {
      map.zoomOut();
    }
  };

  const handleCenterLocation = () => {
    if (map && currentLocation) {
      map.setView(
        [currentLocation.latitude, currentLocation.longitude],
        15
      );
    }
  };

  return (
    <div className="relative" style={{ height }}>
      <MapContainer
        key={tripId || 'map'}
        center={center}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        ref={setMap}
        zoomControl={false}
      >
        {/* Map Tiles (OpenStreetMap) */}
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Route Polyline */}
        <Polyline
          positions={routeCoordinates}
          pathOptions={{
            color: '#042940',
            weight: 4,
            opacity: 0.7,
          }}
        />

        {/* Stop Markers */}
        {stops.map((stop, index) => {
          let status: 'completed' | 'current' | 'upcoming';

          if (index < currentStopIndex) {
            status = 'completed';
          } else if (index === currentStopIndex) {
            status = 'current';
          } else {
            status = 'upcoming';
          }

          return (
            <StopMarker
              key={stop._id}
              stop={stop}
              status={status}
              stopNumber={index + 1}
            />
          );
        })}

        {/* Current Bus Location */}
        {currentLocation && (
          <Marker
            position={[currentLocation.latitude, currentLocation.longitude]}
            icon={createBusIcon(currentLocation.heading)}
          />
        )}

        {/* Map Controller (auto-center and fit bounds) */}
        <MapController stops={stops} currentLocation={currentLocation} />
      </MapContainer>

      {/* Custom Controls */}
      {showControls && (
        <MapControls
          onZoomIn={handleZoomIn}
          onZoomOut={handleZoomOut}
          onCenterLocation={currentLocation ? handleCenterLocation : undefined}
        />
      )}
    </div>
  );
}
