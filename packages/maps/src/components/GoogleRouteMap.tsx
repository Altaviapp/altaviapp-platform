"use client";

import { GoogleMap, Marker, Polyline, Circle } from "@react-google-maps/api";
import { useCallback, useState, useMemo, useEffect } from "react";
import { MAPS_CONFIG } from "../config/maps-config";
import { useGoogleMapsContext, MapsLoadingState, MapsErrorState } from "./GoogleMapsProvider";
import { useAnimatedPosition } from "../hooks/useAnimatedPosition";
import type { LatLng } from "../types/maps";

// ============================================
// TYPES
// ============================================

export type StopStatus = "pending" | "current" | "completed" | "skipped";

export type RouteStopMarker = {
  id: string;
  name: string;
  address?: string;
  position: LatLng;
  order: number;
  status: StopStatus;
  scheduledTime?: string;
  actualTime?: string;
  studentCount?: number;
  eta?: string;
};

export type VehiclePosition = {
  position: LatLng;
  heading?: number; // Direction in degrees (0-360)
  speed?: number; // km/h
  accuracy?: number; // meters
  timestamp?: number;
};

export type GoogleRouteMapProps = {
  // Stops configuration
  stops: RouteStopMarker[];
  currentStopIndex?: number;

  // Route polyline (encoded or decoded)
  polyline?: LatLng[];
  encodedPolyline?: string;

  // Polyline differentiation (for parent app tracking)
  /** Index up to which stops are completed - enables split polyline */
  completedStopIndex?: number;
  /** Show differentiated polyline (gray for completed, color for remaining) */
  showDifferentiatedPolyline?: boolean;

  // Stop highlighting (for parent app - highlight student's stop)
  /** Index of stop to highlight (e.g., student's pickup/dropoff stop) */
  highlightedStopIndex?: number;

  // Vehicle tracking (optional - for live tracking)
  vehiclePosition?: VehiclePosition | null;
  showVehicle?: boolean;
  /** Enable smooth animation for vehicle marker between GPS updates */
  animateVehicle?: boolean;

  // School/destination marker
  schoolPosition?: LatLng;
  schoolName?: string;

  // Geofencing
  showGeofences?: boolean;
  geofenceRadius?: number; // meters, default 50

  // Map configuration
  center?: LatLng;
  zoom?: number;
  autoFitBounds?: boolean;

  // Native map controls
  showZoomControl?: boolean;
  showMyLocationButton?: boolean;

  // Callbacks
  onStopClick?: (stopId: string) => void;
  onVehicleClick?: () => void;
  onMapLoad?: (map: google.maps.Map) => void;

  // Styling
  className?: string;
  style?: React.CSSProperties;

  // Overlays (shown on map)
  overlays?: {
    topLeft?: React.ReactNode;
    topRight?: React.ReactNode;
    bottomLeft?: React.ReactNode;
    bottomRight?: React.ReactNode;
  };
};

// ============================================
// CONSTANTS
// ============================================

const defaultContainerStyle = {
  width: "100%",
  height: "400px",
};

// Stop colors by status
const stopColors: Record<StopStatus, { fill: string; stroke: string }> = {
  pending: { fill: "#9CA3AF", stroke: "#6B7280" }, // Gray
  current: { fill: "#3B82F6", stroke: "#1D4ED8" }, // Blue (active)
  completed: { fill: "#10B981", stroke: "#059669" }, // Green
  skipped: { fill: "#EF4444", stroke: "#DC2626" }, // Red
};

// ============================================
// COMPONENT
// ============================================

export function GoogleRouteMap({
  stops,
  currentStopIndex,
  polyline,
  encodedPolyline,
  completedStopIndex,
  showDifferentiatedPolyline = false,
  highlightedStopIndex,
  vehiclePosition,
  showVehicle = true,
  animateVehicle = true,
  schoolPosition,
  schoolName,
  showGeofences = false,
  geofenceRadius = 50,
  center,
  zoom = 14,
  autoFitBounds = true,
  showZoomControl = true,
  showMyLocationButton = false,
  onStopClick,
  onVehicleClick,
  onMapLoad,
  className,
  style,
  overlays,
}: GoogleRouteMapProps) {
  const { isLoaded, loadError } = useGoogleMapsContext();
  const [map, setMap] = useState<google.maps.Map | null>(null);

  // Animate vehicle position for smooth movement between GPS updates
  const animatedVehiclePosition = useAnimatedPosition(
    vehiclePosition?.position ?? null,
    {
      duration: 1000, // 1 second animation
      maxAnimateDistance: 500, // Snap if distance > 500m (GPS jump)
      enabled: animateVehicle,
    }
  );

  // Decode polyline if encoded version is provided
  const decodedPolyline = useMemo(() => {
    if (polyline) return polyline;
    if (encodedPolyline && isLoaded && window.google) {
      try {
        const decoded = google.maps.geometry.encoding.decodePath(encodedPolyline);
        return decoded.map((p) => ({ lat: p.lat(), lng: p.lng() }));
      } catch {
        return [];
      }
    }
    return [];
  }, [polyline, encodedPolyline, isLoaded]);

  // Split polyline into completed and remaining segments for differentiated display
  const { completedPath, remainingPath } = useMemo(() => {
    if (!showDifferentiatedPolyline || completedStopIndex === undefined || decodedPolyline.length < 2) {
      return { completedPath: [], remainingPath: decodedPolyline };
    }

    // Find the polyline point closest to the completed stop position
    const completedStopPosition = stops[completedStopIndex]?.position;
    if (!completedStopPosition) {
      return { completedPath: [], remainingPath: decodedPolyline };
    }

    // Find the index in polyline closest to the completed stop
    let closestIndex = 0;
    let minDistance = Infinity;

    decodedPolyline.forEach((point, index) => {
      const distance = Math.sqrt(
        Math.pow(point.lat - completedStopPosition.lat, 2) +
        Math.pow(point.lng - completedStopPosition.lng, 2)
      );
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = index;
      }
    });

    // Split at the closest point (include the point in both for continuity)
    const completed = decodedPolyline.slice(0, closestIndex + 1);
    const remaining = decodedPolyline.slice(closestIndex);

    return { completedPath: completed, remainingPath: remaining };
  }, [showDifferentiatedPolyline, completedStopIndex, decodedPolyline, stops]);

  // Calculate initial center from stops if not provided
  // NOTE: We intentionally exclude vehiclePosition to prevent auto-panning when GPS updates
  const mapCenter = useMemo(() => {
    if (center) return center;
    if (stops.length > 0) {
      const latSum = stops.reduce((sum, s) => sum + s.position.lat, 0);
      const lngSum = stops.reduce((sum, s) => sum + s.position.lng, 0);
      return { lat: latSum / stops.length, lng: lngSum / stops.length };
    }
    return MAPS_CONFIG.defaultCenter;
  }, [center, stops]);

  const containerStyle = useMemo(
    () => ({ ...defaultContainerStyle, ...style }),
    [style]
  );

  // Fit bounds to show all markers (runs once when autoFitBounds is true)
  // NOTE: We exclude vehiclePosition from deps to prevent re-fitting when GPS updates
  useEffect(() => {
    if (!map || !autoFitBounds || !isLoaded) return;

    const bounds = new google.maps.LatLngBounds();
    let hasPoints = false;

    stops.forEach((stop) => {
      bounds.extend(stop.position);
      hasPoints = true;
    });

    if (schoolPosition) {
      bounds.extend(schoolPosition);
      hasPoints = true;
    }

    if (hasPoints) {
      map.fitBounds(bounds, 50);
    }
  }, [map, stops, schoolPosition, autoFitBounds, isLoaded]);

  const onLoad = useCallback(
    (map: google.maps.Map) => {
      setMap(map);
      if (onMapLoad) {
        onMapLoad(map);
      }
    },
    [onMapLoad]
  );

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  // Handle stop click
  const handleStopClick = useCallback(
    (stopId: string) => {
      if (onStopClick) {
        onStopClick(stopId);
      }
    },
    [onStopClick]
  );

  // Create vehicle icon with rotation
  const vehicleIcon = useMemo(() => {
    if (!isLoaded || !window.google) return undefined;

    const heading = vehiclePosition?.heading || 0;

    return {
      path: "M12 2L4.5 20.29l.71.71L12 18l6.79 3 .71-.71z", // Arrow/bus icon
      fillColor: "#3B82F6",
      fillOpacity: 1,
      strokeColor: "#1D4ED8",
      strokeWeight: 2,
      scale: 1.5,
      rotation: heading,
      anchor: new google.maps.Point(12, 12),
    };
  }, [isLoaded, vehiclePosition?.heading]);

  // Create stop marker icon
  const createStopIcon = useCallback(
    (status: StopStatus, order: number, isHighlighted: boolean = false) => {
      if (!isLoaded || !window.google) return undefined;

      const colors = stopColors[status];

      // Highlighted stop (e.g., student's pickup/dropoff) gets special styling
      if (isHighlighted) {
        return {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 16, // Larger than other stops
          fillColor: "#DBF227", // Altaviapp accent color (lime/yellow)
          fillOpacity: 1,
          strokeColor: "#042940", // Primary color border
          strokeWeight: 3,
        };
      }

      return {
        path: google.maps.SymbolPath.CIRCLE,
        scale: status === "current" ? 14 : 10,
        fillColor: colors.fill,
        fillOpacity: 1,
        strokeColor: colors.stroke,
        strokeWeight: 2,
      };
    },
    [isLoaded]
  );

  if (loadError) {
    return <MapsErrorState error={loadError} />;
  }

  if (!isLoaded) {
    return <MapsLoadingState />;
  }

  return (
    <div className={`relative ${className || ""}`}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: MAPS_CONFIG.mapStyles,
          disableDefaultUI: true,
          zoomControl: showZoomControl,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: false,
          gestureHandling: "greedy",
        }}
      >
        {/* Route polyline - differentiated or single */}
        {showDifferentiatedPolyline ? (
          <>
            {/* Completed path (gray) */}
            {completedPath.length > 1 && (
              <Polyline
                path={completedPath}
                options={{
                  strokeColor: "#9CA3AF", // Gray for completed
                  strokeOpacity: 0.6,
                  strokeWeight: 4,
                  geodesic: true,
                }}
              />
            )}
            {/* Remaining path (primary color) */}
            {remainingPath.length > 1 && (
              <Polyline
                path={remainingPath}
                options={{
                  strokeColor: "#042940", // Primary for remaining
                  strokeOpacity: 0.8,
                  strokeWeight: 4,
                  geodesic: true,
                }}
              />
            )}
          </>
        ) : (
          /* Single polyline (default) */
          decodedPolyline.length > 1 && (
            <Polyline
              path={decodedPolyline}
              options={{
                strokeColor: "#042940",
                strokeOpacity: 0.8,
                strokeWeight: 4,
                geodesic: true,
              }}
            />
          )
        )}

        {/* Geofences for stops */}
        {showGeofences &&
          stops.map((stop) => (
            <Circle
              key={`geofence-${stop.id}`}
              center={stop.position}
              radius={geofenceRadius}
              options={{
                fillColor: stopColors[stop.status].fill,
                fillOpacity: 0.1,
                strokeColor: stopColors[stop.status].stroke,
                strokeOpacity: 0.3,
                strokeWeight: 1,
              }}
            />
          ))}

        {/* Stop markers */}
        {stops.map((stop, index) => {
          const isHighlighted = highlightedStopIndex !== undefined && index === highlightedStopIndex;
          return (
            <Marker
              key={stop.id}
              position={stop.position}
              icon={createStopIcon(stop.status, stop.order, isHighlighted)}
              label={{
                text: String(stop.order),
                color: isHighlighted ? "#042940" : "#FFFFFF",
                fontWeight: "bold",
                fontSize: isHighlighted ? "14px" : stop.status === "current" ? "12px" : "10px",
              }}
              title={`${stop.order}. ${stop.name}${stop.eta ? ` - ETA: ${stop.eta}` : ""}${isHighlighted ? " (Tu parada)" : ""}`}
              onClick={() => handleStopClick(stop.id)}
              zIndex={isHighlighted ? 150 : stop.status === "current" ? 100 : 50 - index}
            />
          );
        })}

        {/* School marker - uses a building/school icon */}
        {schoolPosition && (
          <Marker
            position={schoolPosition}
            icon={{
              // School/building icon path
              path: "M12 3L1 9l4 2.18v6L12 21l7-3.82v-6l2-1.09V17h2V9L12 3zm6.82 6L12 12.72 5.18 9 12 5.28 18.82 9zM17 15.99l-5 2.73-5-2.73v-3.72L12 15l5-2.73v3.72z",
              fillColor: "#042940", // Altaviapp primary color
              fillOpacity: 1,
              strokeColor: "#FFFFFF",
              strokeWeight: 1,
              scale: 1.5,
              anchor: new google.maps.Point(12, 12),
            }}
            label={{
              text: "🏫",
              fontSize: "0px", // Hidden - just for accessibility
            }}
            title={schoolName || "Colegio"}
            zIndex={10}
          />
        )}

        {/* Vehicle marker - uses animated position for smooth movement */}
        {showVehicle && animatedVehiclePosition && (
          <Marker
            position={animatedVehiclePosition}
            icon={vehicleIcon}
            title={`Vehículo${vehiclePosition?.speed ? ` - ${Math.round(vehiclePosition.speed)} km/h` : ""}`}
            onClick={onVehicleClick}
            zIndex={200}
          />
        )}
      </GoogleMap>

      {/* Overlays */}
      {overlays?.topLeft && (
        <div className="absolute top-2 left-2 z-10">{overlays.topLeft}</div>
      )}
      {overlays?.topRight && (
        <div className="absolute top-2 right-2 z-10">{overlays.topRight}</div>
      )}
      {overlays?.bottomLeft && (
        <div className="absolute bottom-20 left-2 z-10">{overlays.bottomLeft}</div>
      )}
      {overlays?.bottomRight && (
        <div className="absolute bottom-20 right-2 z-10">{overlays.bottomRight}</div>
      )}
    </div>
  );
}

// ============================================
// OVERLAY COMPONENTS
// ============================================

export function SpeedOverlay({ speed }: { speed: number }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
      <div className="flex items-center gap-1.5">
        <span className="text-lg font-bold text-gray-900">{Math.round(speed)}</span>
        <span className="text-xs text-gray-500">km/h</span>
      </div>
    </div>
  );
}

export function ProgressOverlay({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  return (
    <div className="bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
      <div className="flex items-center gap-1.5">
        <span className="text-lg font-bold text-primary">{current}</span>
        <span className="text-xs text-gray-400">/</span>
        <span className="text-sm text-gray-600">{total}</span>
        <span className="text-xs text-gray-500">paradas</span>
      </div>
    </div>
  );
}

export function ETAOverlay({ eta, stopName }: { eta: string; stopName: string }) {
  return (
    <div className="bg-white/90 backdrop-blur-sm px-3 py-2 rounded-lg shadow-md max-w-[200px]">
      <p className="text-xs text-gray-500 truncate">{stopName}</p>
      <p className="text-sm font-semibold text-gray-900">ETA: {eta}</p>
    </div>
  );
}
