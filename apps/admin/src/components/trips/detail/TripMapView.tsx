'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { GoogleMap, Marker, Polyline, OverlayView } from '@react-google-maps/api';
import Image from 'next/image';
import {
  useGoogleMapsContext,
  MapsLoadingState,
  MapsErrorState,
  MAPS_CONFIG,
  decodePolyline,
} from '@altaviapp/maps';
import { cn } from '@/lib/utils';

interface Stop {
  _id: string;
  name: string;
  order: number;
  latitude: number;
  longitude: number;
  isCompleted?: boolean;
  isNext?: boolean;
}

interface TripMapViewProps {
  stops: Stop[];
  currentLocation?: {
    latitude: number;
    longitude: number;
    heading?: number;
    speed?: number;
  } | null;
  optimizedPolyline?: string | null;
  tripStatus: string;
  onStopClick?: (stopId: string) => void;
  selectedStopId?: string | null;
  className?: string;
  style?: React.CSSProperties;
  onMapLoad?: (map: google.maps.Map) => void;
}

// School bus marker component with rotation
function SchoolBusMarker({
  position,
  heading,
  onClick,
  title,
}: {
  position: { lat: number; lng: number };
  heading: number;
  onClick?: () => void;
  title: string;
}) {
  // SVG points right (90°), so subtract 90 to align with map heading (0° = north)
  const rotation = (heading || 0) - 90;
  const size = 48;

  return (
    <OverlayView
      position={position}
      mapPaneName={OverlayView.OVERLAY_MOUSE_TARGET}
      getPixelPositionOffset={() => ({ x: -size / 2, y: -size / 2 })}
    >
      <div
        onClick={onClick}
        title={title}
        className="cursor-pointer drop-shadow-lg"
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
      </div>
    </OverlayView>
  );
}

// Stop marker icon based on status
function getStopIcon(stop: Stop, isSelected: boolean): google.maps.Symbol {
  let fillColor = '#9CA3AF'; // pending - gray
  let strokeColor = '#6B7280';
  let scale = 10;

  if (stop.isCompleted) {
    fillColor = '#10B981'; // completed - green
    strokeColor = '#059669';
  } else if (stop.isNext) {
    fillColor = '#3B82F6'; // next - blue
    strokeColor = '#1D4ED8';
    scale = 12;
  }

  if (isSelected) {
    scale = 14;
    strokeColor = '#042940';
  }

  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor,
    fillOpacity: 1,
    strokeColor,
    strokeWeight: isSelected ? 3 : 2,
    scale,
  };
}

export function TripMapView({
  stops,
  currentLocation,
  optimizedPolyline,
  tripStatus,
  onStopClick,
  selectedStopId,
  className,
  style,
  onMapLoad,
}: TripMapViewProps) {
  const { isLoaded, loadError } = useGoogleMapsContext();
  const mapRef = useRef<google.maps.Map | null>(null);
  const [hasFitBounds, setHasFitBounds] = useState(false);

  // Decode optimized polyline or fallback to stops
  const polylineCoords = optimizedPolyline
    ? decodePolyline(optimizedPolyline)
    : stops.map((s) => ({ lat: s.latitude, lng: s.longitude }));

  // Fit bounds on initial load
  useEffect(() => {
    if (!mapRef.current || hasFitBounds) return;

    const bounds = new google.maps.LatLngBounds();

    // Include stops
    stops.forEach((stop) => {
      bounds.extend({ lat: stop.latitude, lng: stop.longitude });
    });

    // Include vehicle
    if (currentLocation) {
      bounds.extend({
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
      });
    }

    if (stops.length > 0 || currentLocation) {
      mapRef.current.fitBounds(bounds, 50);
      setHasFitBounds(true);
    }
  }, [stops, currentLocation, hasFitBounds]);

  const handleMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      onMapLoad?.(map);
    },
    [onMapLoad]
  );

  if (loadError) {
    return <MapsErrorState error={loadError} />;
  }

  if (!isLoaded) {
    return <MapsLoadingState />;
  }

  const mapCenter = currentLocation
    ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
    : stops[0]
      ? { lat: stops[0].latitude, lng: stops[0].longitude }
      : MAPS_CONFIG.defaultCenter;

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={{
          width: '100%',
          height: '100%',
          ...style,
        }}
        center={mapCenter}
        zoom={14}
        onLoad={handleMapLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
          gestureHandling: 'greedy',
        }}
      >
        {/* Route polyline */}
        {polylineCoords.length > 1 && (
          <Polyline
            path={polylineCoords}
            options={{
              strokeColor: '#042940',
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
          />
        )}

        {/* Stop markers */}
        {stops.map((stop) => (
          <Marker
            key={stop._id}
            position={{ lat: stop.latitude, lng: stop.longitude }}
            icon={getStopIcon(stop, selectedStopId === stop._id)}
            label={{
              text: stop.order.toString(),
              color: '#fff',
              fontWeight: 'bold',
              fontSize: '11px',
            }}
            title={`${stop.order}. ${stop.name}`}
            onClick={() => onStopClick?.(stop._id)}
            zIndex={stop.isNext ? 100 : 50}
          />
        ))}

        {/* Vehicle marker with school bus icon */}
        {currentLocation && tripStatus === 'in_progress' && (
          <SchoolBusMarker
            position={{
              lat: currentLocation.latitude,
              lng: currentLocation.longitude,
            }}
            heading={currentLocation.heading || 0}
            title="Vehículo"
          />
        )}
      </GoogleMap>
    </div>
  );
}
