'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, Polyline, OverlayView } from '@react-google-maps/api';
import { ArrowLeft, Bus, Crosshair } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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

// School bus marker component with rotation
interface SchoolBusMarkerProps {
  position: { lat: number; lng: number };
  heading: number;
  isSelected: boolean;
  onClick: () => void;
  title: string;
}

function SchoolBusMarker({ position, heading, isSelected, onClick, title }: SchoolBusMarkerProps) {
  // SVG points right (90°), so subtract 90 to align with map heading (0° = north)
  const rotation = (heading || 0) - 90;
  const size = isSelected ? 56 : 44;

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={() => ({ x: -size / 2, y: -size / 2 })}
    >
      <div
        onClick={onClick}
        title={title}
        className={cn(
          'cursor-pointer transition-transform duration-300',
          isSelected && 'drop-shadow-lg'
        )}
        style={{
          transform: `rotate(${rotation}deg)`,
          width: size,
          height: size,
        }}
      >
        <Image
          src="/icons/scholarbus.svg"
          alt="Bus"
          width={size}
          height={size}
          className="w-full h-full"
          priority
        />
        {isSelected && (
          <div className="absolute inset-0 rounded-full border-4 border-accent animate-pulse" />
        )}
      </div>
    </OverlayView>
  );
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
            <SchoolBusMarker
              key={trip.tripId}
              position={{ lat: trip.gps.latitude, lng: trip.gps.longitude }}
              heading={trip.gps.heading || 0}
              isSelected={isSelected}
              onClick={() => onSelectTrip(trip.tripId)}
              title={`${trip.routeName} - ${trip.vehiclePlate}`}
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
          // Mobile: always top-right with margin for FAB
          'right-4 md:right-auto',
          // Desktop: adjust based on sidebar
          sidebarCollapsed ? 'md:right-16' : 'md:right-[420px]'
        )}
      >
        <div className="flex items-center gap-2 px-3 py-2 md:px-4 bg-white rounded-lg shadow-md">
          <Bus className="w-4 h-4 text-primary" />
          <span className="font-medium text-sm">
            {trips.filter((t) => t.gps !== null).length} activos
          </span>
        </div>
      </div>

      {/* Overlay: Center on all button */}
      <div
        className={cn(
          'absolute z-10 transition-all',
          // Mobile: bottom-left (FAB is bottom-right)
          'bottom-6 left-4 md:left-auto',
          // Desktop: adjust based on sidebar
          sidebarCollapsed ? 'md:right-16' : 'md:right-[420px]'
        )}
      >
        <button
          onClick={handleCenterOnAll}
          className="flex items-center gap-2 px-3 py-2 md:px-4 bg-white rounded-lg shadow-md hover:bg-gray-50 transition-colors"
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
