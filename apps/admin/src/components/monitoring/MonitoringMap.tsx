'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, Polyline } from '@react-google-maps/api';
import { ArrowLeft, Bus, Crosshair } from 'lucide-react';
import Link from 'next/link';
import {
  GoogleMapsProvider,
  useGoogleMapsContext,
  MapsLoadingState,
  MapsErrorState,
  MAPS_CONFIG,
  decodePolyline,
} from '@altaviapp/maps';
import type { ActiveTripWithPosition, MonitoringStop } from '@/hooks';
import { cn } from '@/lib/utils';

interface MonitoringMapProps {
  trips: ActiveTripWithPosition[];
  selectedTripId: string | null;
  selectedTripStops: MonitoringStop[];
  selectedTripPolyline: { lat: number; lng: number }[] | null;
  selectedTripEncodedPolyline: string | null;
  onSelectTrip: (tripId: string | null) => void;
  sidebarCollapsed: boolean;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Vehicle icon SVG path (bus-like arrow pointing up, rotates based on heading)
const vehicleIconPath = 'M12 2l4 6h-2v8h-4v-8h-2l4-6z';

// Generate a vehicle marker icon with heading rotation
function getVehicleIcon(heading: number = 0, isSelected: boolean = false): google.maps.Symbol {
  return {
    path: vehicleIconPath,
    fillColor: isSelected ? '#DBF227' : '#042940', // accent or primary
    fillOpacity: 1,
    strokeColor: isSelected ? '#042940' : '#FFFFFF',
    strokeWeight: 2,
    rotation: heading,
    scale: isSelected ? 2 : 1.5,
    anchor: new google.maps.Point(12, 12),
  };
}

// Stop icon for selected trip route
function getStopIcon(status: string): google.maps.Symbol {
  const colors: Record<string, { fill: string; stroke: string }> = {
    pending: { fill: '#9CA3AF', stroke: '#6B7280' },
    current: { fill: '#3B82F6', stroke: '#1D4ED8' },
    completed: { fill: '#10B981', stroke: '#059669' },
  };
  const colorSet = colors[status] || colors.pending!;
  const { fill, stroke } = colorSet;

  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: fill,
    fillOpacity: 1,
    strokeColor: stroke,
    strokeWeight: 2,
    scale: status === 'current' ? 10 : 7,
  };
}

function MonitoringMapContent({
  trips,
  selectedTripId,
  selectedTripStops,
  selectedTripPolyline,
  selectedTripEncodedPolyline,
  onSelectTrip,
  sidebarCollapsed,
}: MonitoringMapProps) {
  const { isLoaded, loadError } = useGoogleMapsContext();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [hasFitBounds, setHasFitBounds] = useState(false);
  const hasZoomedToSelected = useRef<string | null>(null);

  // Decode polyline if needed
  const polylineCoords = selectedTripPolyline
    ? selectedTripPolyline
    : selectedTripEncodedPolyline
    ? decodePolyline(selectedTripEncodedPolyline)
    : [];

  // Fit bounds to all vehicles on initial load
  useEffect(() => {
    if (!mapRef.current || trips.length === 0 || hasFitBounds) return;

    const tripsWithGps = trips.filter((t) => t.gps !== null);
    if (tripsWithGps.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    tripsWithGps.forEach((trip) => {
      if (trip.gps) {
        bounds.extend({ lat: trip.gps.latitude, lng: trip.gps.longitude });
      }
    });

    mapRef.current.fitBounds(bounds, 50);
    setHasFitBounds(true);
  }, [trips, hasFitBounds]);

  // Zoom to selected vehicle (only once per selection)
  useEffect(() => {
    if (!mapRef.current || !selectedTripId) return;
    if (hasZoomedToSelected.current === selectedTripId) return;

    const selectedTrip = trips.find((t) => t.tripId === selectedTripId);
    if (selectedTrip?.gps) {
      mapRef.current.panTo({
        lat: selectedTrip.gps.latitude,
        lng: selectedTrip.gps.longitude,
      });
      mapRef.current.setZoom(15);
      hasZoomedToSelected.current = selectedTripId;
    }
  }, [selectedTripId, trips]);

  // Reset zoom tracker when trip is deselected
  useEffect(() => {
    if (!selectedTripId) {
      hasZoomedToSelected.current = null;
    }
  }, [selectedTripId]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleCenterOnAll = useCallback(() => {
    if (!mapRef.current) return;

    const tripsWithGps = trips.filter((t) => t.gps !== null);
    if (tripsWithGps.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    tripsWithGps.forEach((trip) => {
      if (trip.gps) {
        bounds.extend({ lat: trip.gps.latitude, lng: trip.gps.longitude });
      }
    });

    mapRef.current.fitBounds(bounds, 50);
    onSelectTrip(null);
  }, [trips, onSelectTrip]);

  if (loadError) {
    return <MapsErrorState error={loadError} />;
  }

  if (!isLoaded) {
    return <MapsLoadingState />;
  }

  return (
    <div className="relative w-full h-full">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={MAPS_CONFIG.defaultCenter}
        zoom={MAPS_CONFIG.defaultZoom}
        onLoad={onMapLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: 'greedy',
        }}
      >
        {/* Vehicle markers for all trips */}
        {trips.map((trip) => {
          if (!trip.gps) return null;

          const isSelected = trip.tripId === selectedTripId;

          return (
            <Marker
              key={trip.tripId}
              position={{ lat: trip.gps.latitude, lng: trip.gps.longitude }}
              icon={getVehicleIcon(trip.gps.heading || 0, isSelected)}
              onClick={() => onSelectTrip(trip.tripId)}
              title={`${trip.routeName} - ${trip.vehiclePlate}`}
              zIndex={isSelected ? 200 : 100}
            />
          );
        })}

        {/* Route polyline for selected trip */}
        {selectedTripId && polylineCoords.length > 0 && (
          <Polyline
            path={polylineCoords}
            options={{
              strokeColor: '#042940',
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
          />
        )}

        {/* Stop markers for selected trip */}
        {selectedTripId &&
          selectedTripStops.map((stop) => (
            <Marker
              key={stop.id}
              position={{ lat: stop.latitude, lng: stop.longitude }}
              icon={getStopIcon(stop.status)}
              title={`${stop.name} - ${stop.scheduledTime}`}
              zIndex={50}
            />
          ))}
      </GoogleMap>

      {/* Overlay: Back button */}
      <div className="absolute top-4 left-4 z-10">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium text-sm">Volver</span>
        </Link>
      </div>

      {/* Overlay: Trip count */}
      <div
        className={cn(
          'absolute top-4 z-10 transition-all',
          sidebarCollapsed ? 'right-16' : 'right-[420px]'
        )}
      >
        <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md">
          <Bus className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">
            {trips.filter((t) => t.gps !== null).length} viajes activos
          </span>
        </div>
      </div>

      {/* Overlay: Center on all button */}
      <div
        className={cn(
          'absolute bottom-6 z-10 transition-all',
          sidebarCollapsed ? 'right-16' : 'right-[420px]'
        )}
      >
        <button
          onClick={handleCenterOnAll}
          className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
          title="Ver todos los vehículos"
        >
          <Crosshair className="w-4 h-4" />
          <span className="font-medium text-sm">Ver todos</span>
        </button>
      </div>
    </div>
  );
}

// Wrapper component with provider
export function MonitoringMap(props: MonitoringMapProps) {
  return (
    <GoogleMapsProvider>
      <MonitoringMapContent {...props} />
    </GoogleMapsProvider>
  );
}
