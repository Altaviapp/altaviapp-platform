'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useMemo } from 'react';
import { ArrowLeft, Navigation } from 'lucide-react';
import { GoogleMapsProvider, GoogleRouteMap, type RouteStopMarker, type StopStatus } from '@altaviapp/maps';

import { useActiveTrip } from '@/hooks/useActiveTrip';
import { formatDistance } from '@/lib/utils/tripCalculations';

/**
 * Full-Screen Map View Page
 *
 * Shows the route map in full screen with minimal UI overlay
 */
export default function MapViewPage() {
  const params = useParams();
  const tripId = (params?.id as string) || '';

  const {
    trip,
    isLoading,
    currentStopIndex,
    currentLocation,
    nextStop,
    distanceToNextStop,
    etaToNextStop,
  } = useActiveTrip(tripId);

  // Convert stops to RouteStopMarker format - MUST be before early return
  const mapStops = useMemo((): RouteStopMarker[] => {
    const stops = trip?.stops || [];
    return stops.map((stop, index) => {
      const stopWithMeta = stop as typeof stop & { isCompleted?: boolean; isNext?: boolean };
      let status: StopStatus = 'pending';
      if (stopWithMeta.isCompleted) status = 'completed';
      else if (stopWithMeta.isNext) status = 'current';

      return {
        id: String(stop._id),
        name: stop.name,
        address: stop.address,
        position: { lat: stop.latitude, lng: stop.longitude },
        order: index + 1,
        status,
      };
    });
  }, [trip?.stops]);

  // Convert currentLocation to VehiclePosition format - MUST be before early return
  const vehiclePosition = useMemo(() => {
    if (!currentLocation) return null;
    return {
      position: { lat: currentLocation.latitude, lng: currentLocation.longitude },
      heading: currentLocation.heading ?? 0,
      speed: (currentLocation.speed ?? 0) * 3.6, // m/s to km/h
    };
  }, [currentLocation]);

  if (isLoading || !trip) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Cargando mapa...</p>
        </div>
      </div>
    );
  }

  const handleNavigate = () => {
    if (nextStop) {
      const mapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${nextStop.latitude},${nextStop.longitude}`;
      window.open(mapsUrl, '_blank');
    }
  };

  return (
    <GoogleMapsProvider>
      <div className="relative h-screen">
        {/* Full-Screen Map */}
        <GoogleRouteMap
          stops={mapStops}
          currentStopIndex={currentStopIndex}
          vehiclePosition={vehiclePosition}
          showVehicle={!!currentLocation}
          autoFitBounds={true}
          style={{ height: '100vh', width: '100%' }}
        />

      {/* Top Header */}
      <div className="absolute top-0 left-0 right-0 z-[1000] bg-gradient-to-b from-black/50 to-transparent p-4">
        <div className="flex items-center justify-between">
          <Link
            href={`/trips/${tripId}/active`}
            className="flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-lg text-sm font-medium text-gray-900 hover:bg-gray-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </Link>

          <div className="bg-white rounded-lg shadow-lg px-4 py-2">
            <p className="text-xs text-gray-600">Velocidad</p>
            <p className="text-lg font-bold text-gray-900">
              {currentLocation?.speed || 0} km/h
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Next Stop Overlay */}
      {nextStop && (
        <div className="absolute bottom-0 left-0 right-0 z-[1000] bg-white border-t border-gray-200 shadow-2xl">
          <div className="p-4 space-y-3">
            {/* Next Stop Info */}
            <div>
              <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">
                Próxima Parada
              </p>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {nextStop.name}
              </h3>
              <p className="text-sm text-gray-600 line-clamp-1">
                {nextStop.address}
              </p>
            </div>

            {/* Distance & ETA */}
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-600">Distancia</p>
                <p className="text-sm font-bold text-gray-900">
                  {formatDistance(distanceToNextStop)}
                </p>
              </div>

              <div className="flex-1 bg-gray-50 rounded-lg px-3 py-2">
                <p className="text-xs text-gray-600">Llegada en</p>
                <p className="text-sm font-bold text-gray-900">{etaToNextStop}</p>
              </div>

              {/* Navigate Button */}
              <button
                onClick={handleNavigate}
                className="flex-shrink-0 w-12 h-12 bg-primary hover:bg-primary/90 rounded-lg flex items-center justify-center shadow-md transition-colors"
                aria-label="Abrir en Google Maps"
              >
                <Navigation className="w-5 h-5 text-white" />
              </button>
            </div>
          </div>
        </div>
      )}
      </div>
    </GoogleMapsProvider>
  );
}
