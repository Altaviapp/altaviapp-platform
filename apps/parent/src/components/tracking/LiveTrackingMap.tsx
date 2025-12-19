'use client';

/**
 * LiveTrackingMap Component
 *
 * Real-time bus tracking map for parents.
 * Shows vehicle location, route stops, and school destination.
 */

import { useEffect, useState, useCallback, useMemo } from 'react';
import { GoogleMap, Marker, Polyline, InfoWindow } from '@react-google-maps/api';
import { useGoogleMapsContext, MapsLoadingState, MapsErrorState, MAPS_CONFIG, decodePolyline } from '@altaviapp/maps';
import { Bus, School, MapPin, Navigation } from 'lucide-react';

export interface TrackingLocation {
  lat: number;
  lng: number;
  speed?: number | null;
  heading?: number | null;
  timestamp?: number;
}

export interface RouteStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  scheduledTime?: string;
  isSchool?: boolean;
  completed?: boolean;
}

export interface LiveTrackingMapProps {
  /** Current vehicle location */
  vehicleLocation: TrackingLocation | null;
  /** Route stops to display */
  stops?: RouteStop[];
  /** School/destination location */
  schoolLocation?: { lat: number; lng: number; name: string };
  /** Student's pickup/dropoff stop (highlighted) */
  studentStopId?: string;
  /** Map height */
  height?: string;
  /** Auto-center on vehicle */
  autoCenter?: boolean;
  /** Refresh interval indicator */
  lastUpdate?: string;
  /** Vehicle info */
  vehicleInfo?: {
    plate: string;
    driverName: string;
  };
  /** Encoded polyline from Google Directions API */
  encodedPolyline?: string;
  className?: string;
}

const containerStyle = {
  width: '100%',
  height: '100%',
};

// Note: Icon functions are defined inside the component to avoid
// referencing google.maps before it's loaded

export function LiveTrackingMap({
  vehicleLocation,
  stops = [],
  schoolLocation,
  studentStopId,
  height = '300px',
  autoCenter = true,
  lastUpdate,
  vehicleInfo,
  encodedPolyline,
  className,
}: LiveTrackingMapProps) {
  const { isLoaded, loadError } = useGoogleMapsContext();
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedStop, setSelectedStop] = useState<RouteStop | null>(null);
  const [showVehicleInfo, setShowVehicleInfo] = useState(false);

  // Calculate map center
  const center = useMemo(() => {
    if (vehicleLocation) {
      return { lat: vehicleLocation.lat, lng: vehicleLocation.lng };
    }
    if (schoolLocation) {
      return { lat: schoolLocation.lat, lng: schoolLocation.lng };
    }
    return MAPS_CONFIG.defaultCenter;
  }, [vehicleLocation, schoolLocation]);

  // Create polyline path from encoded polyline or stops
  const routePath = useMemo(() => {
    // Prefer encoded polyline (real route from Google Directions API)
    if (encodedPolyline) {
      return decodePolyline(encodedPolyline);
    }
    // Fallback to simple path from stops
    if (stops.length < 2) return [];
    return stops.map(stop => ({ lat: stop.lat, lng: stop.lng }));
  }, [encodedPolyline, stops]);

  // Auto-center on vehicle when location updates
  useEffect(() => {
    if (autoCenter && map && vehicleLocation) {
      map.panTo({ lat: vehicleLocation.lat, lng: vehicleLocation.lng });
    }
  }, [autoCenter, map, vehicleLocation]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);

    // Fit bounds to show all markers
    if (stops.length > 0 || vehicleLocation) {
      const bounds = new google.maps.LatLngBounds();

      stops.forEach(stop => {
        bounds.extend({ lat: stop.lat, lng: stop.lng });
      });

      if (vehicleLocation) {
        bounds.extend({ lat: vehicleLocation.lat, lng: vehicleLocation.lng });
      }

      if (schoolLocation) {
        bounds.extend({ lat: schoolLocation.lat, lng: schoolLocation.lng });
      }

      map.fitBounds(bounds, { top: 50, bottom: 50, left: 50, right: 50 });
    }
  }, [stops, vehicleLocation, schoolLocation]);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  if (loadError) {
    return <MapsErrorState error={loadError} />;
  }

  if (!isLoaded) {
    return <MapsLoadingState />;
  }

  // Custom marker icons (defined here after isLoaded check to avoid referencing google before load)
  const createBusIcon = (heading?: number | null) => ({
    path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z',
    fillColor: '#042940',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
    scale: 1.5,
    rotation: heading ?? 0,
    anchor: new google.maps.Point(12, 22),
  });

  const schoolIcon = {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: '#10B981',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
    scale: 14,
  };

  const stopIcon = (completed: boolean, isStudentStop: boolean) => ({
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: isStudentStop ? '#DBF227' : completed ? '#9CA3AF' : '#042940',
    fillOpacity: 1,
    strokeColor: '#fff',
    strokeWeight: 2,
    scale: isStudentStop ? 12 : 8,
  });

  // Show placeholder if no vehicle location
  if (!vehicleLocation) {
    return (
      <div
        className={`flex items-center justify-center bg-gray-100 rounded-lg ${className}`}
        style={{ height }}
      >
        <div className="text-center p-4">
          <MapPin className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-gray-500">Esperando ubicación del vehículo...</p>
          <p className="text-sm text-gray-400 mt-1">El mapa se mostrará cuando inicie el viaje</p>
        </div>
      </div>
    );
  }

  return (
    <div className={className} style={{ height }}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={15}
        onLoad={onLoad}
        onUnmount={onUnmount}
        options={{
          styles: MAPS_CONFIG.mapStyles,
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: false,
          streetViewControl: false,
          fullscreenControl: true,
        }}
      >
        {/* Route polyline */}
        {routePath.length > 1 && (
          <Polyline
            path={routePath}
            options={{
              strokeColor: '#042940',
              strokeOpacity: 0.6,
              strokeWeight: 4,
            }}
          />
        )}

        {/* Route stops */}
        {stops.map((stop) => (
          <Marker
            key={stop.id}
            position={{ lat: stop.lat, lng: stop.lng }}
            icon={stopIcon(!!stop.completed, stop.id === studentStopId)}
            title={stop.name}
            onClick={() => setSelectedStop(stop)}
          />
        ))}

        {/* School marker */}
        {schoolLocation && (
          <Marker
            position={{ lat: schoolLocation.lat, lng: schoolLocation.lng }}
            icon={schoolIcon}
            title={schoolLocation.name}
          />
        )}

        {/* Vehicle marker */}
        <Marker
          position={{ lat: vehicleLocation.lat, lng: vehicleLocation.lng }}
          icon={createBusIcon(vehicleLocation.heading)}
          title={vehicleInfo?.plate || 'Vehículo'}
          onClick={() => setShowVehicleInfo(true)}
          zIndex={1000}
        />

        {/* Vehicle info window */}
        {showVehicleInfo && vehicleInfo && (
          <InfoWindow
            position={{ lat: vehicleLocation.lat, lng: vehicleLocation.lng }}
            onCloseClick={() => setShowVehicleInfo(false)}
          >
            <div className="p-2 min-w-[150px]">
              <div className="flex items-center gap-2 mb-2">
                <Bus className="w-4 h-4 text-primary" />
                <span className="font-semibold">{vehicleInfo.plate}</span>
              </div>
              <p className="text-sm text-gray-600">{vehicleInfo.driverName}</p>
              {vehicleLocation.speed !== null && vehicleLocation.speed !== undefined && (
                <p className="text-sm text-gray-500 mt-1">
                  <Navigation className="w-3 h-3 inline mr-1" />
                  {Math.round(vehicleLocation.speed * 3.6)} km/h
                </p>
              )}
              {lastUpdate && (
                <p className="text-xs text-gray-400 mt-1">
                  Actualizado: {lastUpdate}
                </p>
              )}
            </div>
          </InfoWindow>
        )}

        {/* Stop info window */}
        {selectedStop && (
          <InfoWindow
            position={{ lat: selectedStop.lat, lng: selectedStop.lng }}
            onCloseClick={() => setSelectedStop(null)}
          >
            <div className="p-2 min-w-[150px]">
              <div className="flex items-center gap-2 mb-1">
                {selectedStop.isSchool ? (
                  <School className="w-4 h-4 text-success" />
                ) : (
                  <MapPin className="w-4 h-4 text-primary" />
                )}
                <span className="font-semibold text-sm">{selectedStop.name}</span>
              </div>
              {selectedStop.scheduledTime && (
                <p className="text-xs text-gray-500">
                  Hora programada: {selectedStop.scheduledTime}
                </p>
              )}
              {selectedStop.completed && (
                <span className="inline-block px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded mt-1">
                  Completada
                </span>
              )}
              {selectedStop.id === studentStopId && (
                <span className="inline-block px-2 py-0.5 bg-accent text-primary text-xs rounded mt-1 font-medium">
                  Tu parada
                </span>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </div>
  );
}
