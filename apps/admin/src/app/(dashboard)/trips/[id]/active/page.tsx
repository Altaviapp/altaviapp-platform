'use client';

import { useState, useMemo, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bus, MapPin, Users, Clock, AlertTriangle, X, Loader2,
  Navigation, ArrowLeft, ChevronRight, CheckCircle, History
} from 'lucide-react';
import { GoogleMapsProvider, InteractiveMap } from '@altaviapp/maps';
import type { MarkerInfo } from '@altaviapp/maps';
import { cn } from '@/lib/utils';
import { useTrip, useLatestTripEvents, getEventConfig, type TripEventType } from '@/hooks';

type SidePanel = 'students' | 'log';

/**
 * Active Trip Page - Admin
 *
 * Live tracking view for in-progress trips
 * Shows real-time vehicle position and event stream
 */
export default function ActiveTripPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [sidePanel, setSidePanel] = useState<SidePanel>('students');
  const [selectedStopId, setSelectedStopId] = useState<string | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  // Real data from Convex - auto-updates in real-time
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { trip, isLoading } = useTrip(tripId as any);

  // Latest trip events for log
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { events } = useLatestTripEvents(tripId as any, { limit: 20 });

  const handleMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
  }, []);

  const handleStopClick = useCallback((stop: { _id: string; latitude: number; longitude: number }) => {
    setSelectedStopId(stop._id);
    if (mapRef.current) {
      mapRef.current.panTo({ lat: stop.latitude, lng: stop.longitude });
      mapRef.current.setZoom(16);
    }
  }, []);

  // Redirect if trip is not in progress
  if (!isLoading && trip && trip.status !== 'in_progress') {
    router.replace(`/trips/${tripId}`);
    return null;
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando viaje...</span>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">Viaje no encontrado</p>
        <Link href="/trips" className="text-primary hover:underline mt-2 inline-block">
          Volver a viajes
        </Link>
      </div>
    );
  }

  const stops = trip.stops || [];
  const currentLocation = trip.currentLocation;
  const stats = trip.stats || {
    totalStudents: 0,
    checkedIn: 0,
    stopsCompleted: 0,
    totalStops: stops.length,
  };

  // Prepare map markers
  const mapMarkers: MarkerInfo[] = [
    ...(currentLocation ? [{
      id: 'vehicle',
      position: { lat: currentLocation.latitude, lng: currentLocation.longitude },
      type: 'vehicle' as const,
      title: `${trip.vehicle?.licensePlate || 'Vehiculo'}`,
      label: '',
    }] : []),
    ...stops.map((stop) => ({
      id: `stop-${stop._id}`,
      position: { lat: stop.latitude, lng: stop.longitude },
      type: 'stop' as const,
      title: `${stop.order}. ${stop.name}`,
      label: stop.order.toString(),
    })),
  ];

  const routePolyline = stops.map((stop) => ({ lat: stop.latitude, lng: stop.longitude }));

  const mapCenter = currentLocation
    ? { lat: currentLocation.latitude, lng: currentLocation.longitude }
    : stops[0]
      ? { lat: stops[0].latitude, lng: stops[0].longitude }
      : { lat: -0.1807, lng: -78.4678 };

  const nextStop = trip.nextStop;

  return (
    <GoogleMapsProvider>
      <div className="flex flex-col h-[calc(100vh-80px)]">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => router.push(`/trips/${tripId}`)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">
                {trip.route?.name || 'Viaje Activo'}
              </h1>
              <p className="text-sm text-gray-500">
                {trip.vehicle?.licensePlate} - {trip.route?.type === 'pickup' ? 'Recogida' : 'Entrega'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-600">En Vivo</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex overflow-hidden">
          {/* Map Section */}
          <div className="flex-1 relative h-full">
            <InteractiveMap
              center={mapCenter}
              zoom={14}
              markers={mapMarkers}
              polyline={routePolyline}
              className="h-full"
              style={{ height: '100%', width: '100%' }}
              onMapLoad={handleMapLoad}
            />

            {/* Overlay: Speed */}
            {currentLocation?.speed !== undefined && (
              <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold text-gray-900">{Math.round(currentLocation.speed)}</span>
                  <span className="text-xs text-gray-500">km/h</span>
                </div>
              </div>
            )}

            {/* Overlay: Progress */}
            <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-bold text-primary">{stats.stopsCompleted}</span>
                <span className="text-xs text-gray-400">/</span>
                <span className="text-sm text-gray-600">{stops.length}</span>
                <span className="text-xs text-gray-500">paradas</span>
              </div>
            </div>

            {/* Overlay: Next Stop */}
            {nextStop && (
              <div className="absolute bottom-4 left-4 right-4 max-w-md bg-white/95 backdrop-blur-sm rounded-xl shadow-lg p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    'w-12 h-12 rounded-full flex items-center justify-center',
                    nextStop.delayStatus?.isDelayed ? 'bg-orange-100' : 'bg-blue-100'
                  )}>
                    <Navigation className={cn(
                      'w-6 h-6',
                      nextStop.delayStatus?.isDelayed ? 'text-orange-600' : 'text-blue-600'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-500">Proxima parada</p>
                    <p className="font-semibold text-gray-900 truncate">{nextStop.name}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-gray-900">~{nextStop.etaMinutes} min</p>
                    {nextStop.etaTime && (
                      <p className="text-xs text-gray-500">Llegada: {nextStop.etaTime}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Side Panel */}
          <div className="w-96 bg-white border-l border-gray-200 flex flex-col">
            {/* Panel Tabs */}
            <div className="flex border-b border-gray-200">
              <button
                onClick={() => setSidePanel('students')}
                className={cn(
                  'flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
                  sidePanel === 'students'
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <Users className="w-4 h-4" />
                Estudiantes
              </button>
              <button
                onClick={() => setSidePanel('log')}
                className={cn(
                  'flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
                  sidePanel === 'log'
                    ? 'text-primary border-b-2 border-primary bg-primary/5'
                    : 'text-gray-600 hover:bg-gray-50'
                )}
              >
                <History className="w-4 h-4" />
                Log
              </button>
            </div>

            {/* Quick Stats */}
            <div className="p-4 border-b border-gray-200 bg-gray-50">
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-bold text-green-600">{stats.checkedIn}</p>
                  <p className="text-xs text-gray-500">Abordados</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-gray-600">
                    {stats.totalStudents - stats.checkedIn}
                  </p>
                  <p className="text-xs text-gray-500">Pendientes</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-primary">{stats.totalStudents}</p>
                  <p className="text-xs text-gray-500">Total</p>
                </div>
              </div>
            </div>

            {/* Panel Content */}
            <div className="flex-1 overflow-y-auto">
              {sidePanel === 'students' && (
                <div className="divide-y divide-gray-100">
                  {stops.map((stop) => {
                    const stopWithMeta = stop as typeof stop & {
                      isCompleted?: boolean;
                      isNext?: boolean;
                    };

                    return (
                      <button
                        key={stop._id}
                        onClick={() => handleStopClick(stop)}
                        className={cn(
                          'w-full text-left p-4 hover:bg-gray-50 transition-colors',
                          selectedStopId === stop._id && 'bg-primary/5',
                          stopWithMeta.isNext && 'bg-blue-50/50',
                          stopWithMeta.isCompleted && 'opacity-60'
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <div className={cn(
                            'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                            stopWithMeta.isCompleted
                              ? 'bg-green-500 text-white'
                              : stopWithMeta.isNext
                                ? 'bg-blue-500 text-white animate-pulse'
                                : 'bg-gray-200 text-gray-700'
                          )}>
                            {stopWithMeta.isCompleted ? (
                              <CheckCircle className="w-4 h-4" />
                            ) : (
                              stop.order
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn(
                              'font-medium text-gray-900',
                              stopWithMeta.isCompleted && 'line-through text-gray-500'
                            )}>
                              {stop.name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{stop.address}</p>
                          </div>
                          {stopWithMeta.isNext && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                              Siguiente
                            </span>
                          )}
                          <ChevronRight className="w-4 h-4 text-gray-300" />
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {sidePanel === 'log' && (
                <div className="divide-y divide-gray-100">
                  {events.length === 0 ? (
                    <div className="p-8 text-center">
                      <History className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500 text-sm">Sin eventos recientes</p>
                    </div>
                  ) : (
                    events.map((event, index) => {
                      const config = getEventConfig(event.type as TripEventType);
                      const time = new Date(event.timestamp).toLocaleTimeString('es-EC', {
                        hour: '2-digit',
                        minute: '2-digit',
                      });

                      return (
                        <div
                          key={event._id}
                          className={cn(
                            'p-3 hover:bg-gray-50',
                            index === 0 && 'bg-blue-50/50'
                          )}
                        >
                          <div className="flex items-start gap-3">
                            <div className={cn(
                              'w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0',
                              config.bgColor
                            )}>
                              {config.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900">{event.title}</p>
                              <p className="text-xs text-gray-500">{time}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </GoogleMapsProvider>
  );
}
