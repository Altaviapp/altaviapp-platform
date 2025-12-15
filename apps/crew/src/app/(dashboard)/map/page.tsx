'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { MapPin, Navigation, Bus, Loader2 } from 'lucide-react';
import { useActiveConvexTrip, useCurrentPosition } from '@/hooks';
import Link from 'next/link';

/**
 * Map Page - Redirects to active trip map or shows empty state
 */
export default function MapPage() {
  const router = useRouter();
  const { activeTrip, isLoading, hasActiveTrip } = useActiveConvexTrip();

  // GPS for current position when no active trip
  const { position, loading: positionLoading, getPosition } = useCurrentPosition();

  useEffect(() => {
    // Get current position on load
    getPosition();
  }, [getPosition]);

  // Redirect to active trip map if there's an active trip
  useEffect(() => {
    if (!isLoading && hasActiveTrip && activeTrip) {
      router.push(`/trips/${activeTrip._id}/map`);
    }
  }, [isLoading, hasActiveTrip, activeTrip, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // If redirecting to active trip map
  if (hasActiveTrip && activeTrip) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-600">Cargando mapa del viaje...</p>
        </div>
      </div>
    );
  }

  // No active trip - show empty state
  return (
    <div className="space-y-4">
      <h1 className="text-xl font-semibold text-gray-900">Mapa</h1>

      <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
        <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <MapPin className="w-8 h-8 text-gray-400" />
        </div>
        <h2 className="text-lg font-semibold text-gray-900 mb-2">
          No hay viaje activo
        </h2>
        <p className="text-gray-600 mb-6">
          Inicia un viaje para ver el mapa con la ruta y las paradas en tiempo real.
        </p>
        <Link
          href="/trips"
          className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors font-medium"
        >
          <Bus className="w-5 h-5" />
          Ver Mis Viajes
        </Link>
      </div>

      {/* Current Location Card */}
      {position && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
              <Navigation className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">Tu ubicación actual</p>
              <p className="font-mono text-sm text-gray-900">
                {position.latitude.toFixed(6)}, {position.longitude.toFixed(6)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Get Location Button */}
      {!position && !positionLoading && (
        <button
          onClick={getPosition}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
        >
          <Navigation className="w-5 h-5 text-gray-600" />
          <span className="text-gray-700 font-medium">Obtener mi ubicación</span>
        </button>
      )}

      {positionLoading && (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
          <span className="text-gray-600 text-sm">Obteniendo ubicación...</span>
        </div>
      )}
    </div>
  );
}
