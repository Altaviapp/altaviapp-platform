"use client";

import { GoogleMap, Marker, Polyline } from "@react-google-maps/api";
import { useCallback, useState, useMemo } from "react";
import { MAPS_CONFIG } from "../config/maps-config";
import { useGoogleMapsContext, MapsLoadingState, MapsErrorState } from "./GoogleMapsProvider";
import type { LatLng, MarkerInfo } from "../types/maps";

export type InteractiveMapProps = {
  center?: LatLng;
  zoom?: number;
  markers?: MarkerInfo[];
  polyline?: LatLng[];
  onMapClick?: (position: LatLng) => void;
  onMarkerClick?: (markerId: string) => void;
  onMarkerDragEnd?: (markerId: string, position: LatLng) => void;
  onMapLoad?: (map: google.maps.Map) => void;
  className?: string;
  style?: React.CSSProperties;
};

const defaultContainerStyle = {
  width: "100%",
  height: "400px",
};

// Marker colors by type
const markerColors: Record<string, string> = {
  stop: "#042940", // Primary blue
  student: "#DBF227", // Accent lime
  vehicle: "#3B82F6", // Info blue
  school: "#10B981", // Success green
};

export function InteractiveMap({
  center = MAPS_CONFIG.defaultCenter,
  zoom = MAPS_CONFIG.defaultZoom,
  markers = [],
  polyline,
  onMapClick,
  onMarkerClick,
  onMarkerDragEnd,
  onMapLoad,
  className,
  style,
}: InteractiveMapProps) {
  const { isLoaded, loadError } = useGoogleMapsContext();
  const [map, setMap] = useState<google.maps.Map | null>(null);

  const containerStyle = useMemo(
    () => ({ ...defaultContainerStyle, ...style }),
    [style]
  );

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
    if (onMapLoad) {
      onMapLoad(map);
    }
  }, [onMapLoad]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const handleMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (onMapClick && e.latLng) {
        onMapClick({
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        });
      }
    },
    [onMapClick]
  );

  const handleMarkerClick = useCallback(
    (markerId: string) => {
      if (onMarkerClick) {
        onMarkerClick(markerId);
      }
    },
    [onMarkerClick]
  );

  const handleMarkerDragEnd = useCallback(
    (markerId: string, e: google.maps.MapMouseEvent) => {
      if (onMarkerDragEnd && e.latLng) {
        onMarkerDragEnd(markerId, {
          lat: e.latLng.lat(),
          lng: e.latLng.lng(),
        });
      }
    },
    [onMarkerDragEnd]
  );

  if (loadError) {
    return <MapsErrorState error={loadError} />;
  }

  if (!isLoaded) {
    return <MapsLoadingState />;
  }

  return (
    <div className={className}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        onClick={handleMapClick}
        options={{
          styles: MAPS_CONFIG.mapStyles,
          disableDefaultUI: false,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Render markers */}
        {markers.map((marker) => (
          <Marker
            key={marker.id}
            position={marker.position}
            label={marker.label ? {
              text: marker.label,
              color: "#fff",
              fontWeight: "bold",
              fontSize: "12px",
            } : undefined}
            title={marker.title}
            draggable={marker.draggable}
            onClick={() => handleMarkerClick(marker.id)}
            onDragEnd={(e) => handleMarkerDragEnd(marker.id, e)}
            icon={marker.type ? {
              path: google.maps.SymbolPath.CIRCLE,
              scale: 12,
              fillColor: markerColors[marker.type] || markerColors.stop,
              fillOpacity: 1,
              strokeColor: "#fff",
              strokeWeight: 2,
            } : undefined}
          />
        ))}

        {/* Render polyline for route */}
        {polyline && polyline.length > 1 && (
          <Polyline
            path={polyline}
            options={{
              strokeColor: "#042940",
              strokeOpacity: 0.8,
              strokeWeight: 4,
            }}
          />
        )}
      </GoogleMap>
    </div>
  );
}
