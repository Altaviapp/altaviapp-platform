'use client';

import { useState, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, Loader2, AlertTriangle, MapPin, Clock, User,
  Phone, MessageCircle, Car, Crosshair, Sunrise, Sunset, Bell
} from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  GoogleMapsProvider,
  GoogleRouteMap,
  type RouteStopMarker,
  type VehiclePosition,
  type StopStatus,
  decodePolyline,
} from '@altaviapp/maps';
import { NovedadContextButton } from '@/components/home/NovedadContextButton';
import {
  useStudentTracking,
  useStudent,
  useLatestTripEvents,
  getEventConfig,
  type TripEventType,
} from '@/hooks';
import { Id } from '../../../../../../../../convex/_generated/dataModel';

/**
 * Active Trip Page - Parent (Crew-style layout)
 *
 * Live tracking view focused on parent's child
 * Shows real-time vehicle position and child's stop ETA
 */
export default function ActiveTripPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tripId = params.id as string;
  const studentId = searchParams.get('studentId');

  // Map reference for centering
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);

  // Fetch student data and tracking info
  const { student, isLoading: studentLoading } = useStudent(
    studentId ? studentId as Id<"students"> : null
  );

  const {
    tracking,
    isLoading: trackingLoading,
    hasActiveTrip,
    currentLocation,
    route,
    trip,
    stops,
    studentStop,
    vehicle,
    driver,
    etaMinutes,
    etaTime,
    delayStatus,
    currentSpeed,
    progress,
  } = useStudentTracking(studentId ? studentId as Id<"students"> : null);

  // Latest trip events
  const { events } = useLatestTripEvents(
    trip?.id ? trip.id as Id<"trips"> : null,
    { limit: 10 }
  );

  const isLoading = studentLoading || trackingLoading;
  const isPickup = route?.type === 'pickup';

  // Check if vehicle arrived at student's stop (geofence event)
  const hasArrived = useMemo(() => {
    if (!studentStop?.id) return false;
    return events.some(
      (e) => e.type === 'geofence_entered' && e.stopId === studentStop.id
    );
  }, [events, studentStop?.id]);

  // Transform stops for GoogleRouteMap
  const mapStops: RouteStopMarker[] = useMemo(() => {
    return (stops ?? []).map((stop, index) => {
      let status: StopStatus = 'pending';
      if (stop.completed) {
        status = 'completed';
      } else if (stop.id === studentStop?.id) {
        status = 'current'; // Highlight child's stop
      }

      return {
        id: String(stop.id),
        name: stop.name,
        address: stop.address ?? '',
        position: { lat: stop.lat, lng: stop.lng },
        order: index + 1,
        status,
        scheduledTime: stop.scheduledTime ?? undefined,
        eta: stop.etaTime ?? undefined,
      };
    });
  }, [stops, studentStop?.id]);

  // Current stop index for map
  const currentStopIndex = useMemo(() => {
    if (!studentStop?.id) return 0;
    return mapStops.findIndex((s) => s.id === String(studentStop.id));
  }, [mapStops, studentStop?.id]);

  // Vehicle position for map
  const vehiclePosition: VehiclePosition | null = useMemo(() => {
    if (!currentLocation) return null;
    return {
      position: { lat: currentLocation.latitude, lng: currentLocation.longitude },
      heading: currentLocation.heading ?? 0,
      speed: (currentLocation.speed ?? 0) * 3.6, // m/s to km/h
      accuracy: 10,
      timestamp: currentLocation.timestamp,
    };
  }, [currentLocation]);

  // Route polyline
  const routePolyline = useMemo(() => {
    if (route?.optimizedPolyline) {
      return decodePolyline(route.optimizedPolyline);
    }
    // Fallback: simple line through stops
    return mapStops.map((s) => s.position);
  }, [route?.optimizedPolyline, mapStops]);

  // Center map on vehicle
  const handleCenterOnVehicle = () => {
    if (mapRef && vehiclePosition) {
      mapRef.panTo(vehiclePosition.position);
      mapRef.setZoom(16);
    }
  };

  // Format phone for WhatsApp
  const formatWhatsAppLink = (phone?: string) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando...</span>
      </div>
    );
  }

  // No student specified
  if (!studentId) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">Estudiante no especificado</p>
        <Link href="/inicio" className="text-primary hover:underline mt-2 inline-block">
          Volver al inicio
        </Link>
      </div>
    );
  }

  // No active trip
  if (!hasActiveTrip) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No hay viaje activo</p>
        <Link href="/inicio" className="text-primary hover:underline mt-2 inline-block">
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Sticky Header - colored based on route type */}
      <div className={cn(
        'px-4 py-3 flex items-center justify-between flex-shrink-0 z-30 sticky top-0',
        isPickup ? 'bg-warning' : 'bg-info'
      )}>
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            {isPickup ? (
              <Sunrise className="w-5 h-5 text-white" />
            ) : (
              <Sunset className="w-5 h-5 text-white" />
            )}
            <div>
              <h1 className="text-base font-semibold text-white">
                {student?.firstName || 'Estudiante'}
              </h1>
              <p className="text-xs text-white/80">
                {route?.name} - {isPickup ? 'Recogida' : 'Entrega'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/20 px-2 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-medium text-white">En Vivo</span>
        </div>
      </div>

      {/* Map Container - 60vh */}
      <div className="relative flex-shrink-0" style={{ height: '60vh' }}>
        <GoogleMapsProvider>
          <GoogleRouteMap
            stops={mapStops}
            currentStopIndex={currentStopIndex}
            polyline={routePolyline}
            vehiclePosition={vehiclePosition}
            showVehicle={!!vehiclePosition}
            autoFitBounds={true}
            showGeofences={false}
            onMapLoad={setMapRef}
            style={{ width: '100%', height: '60vh' }}
            overlays={{
              topLeft: currentSpeed !== null && currentSpeed !== undefined && currentSpeed > 0 ? (
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                    <span className="font-bold text-lg">{Math.round(currentSpeed)}</span>
                    <span className="text-gray-600 text-sm">km/h</span>
                  </div>
                </div>
              ) : undefined,
              topRight: (
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">{Math.round(progress ?? 0)}%</span>
                    <span className="text-gray-500">completado</span>
                  </div>
                </div>
              ),
            }}
          />

          {/* Center on vehicle button - LEFT side */}
          <button
            onClick={handleCenterOnVehicle}
            className="absolute bottom-4 left-3 z-20 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
            aria-label="Centrar en vehículo"
          >
            <Crosshair className="w-5 h-5 text-primary" />
          </button>
        </GoogleMapsProvider>
      </div>

      {/* Content Section - normal page flow */}
      <div className="bg-white px-4 py-4 space-y-4">
        {/* Arrival Alert Banner */}
        {hasArrived && (
          <div className="p-3 bg-success text-white rounded-lg flex items-center gap-3 animate-pulse">
            <Bell className="w-5 h-5 flex-shrink-0" />
            <div>
              <p className="font-semibold">¡El vehículo ha llegado!</p>
              <p className="text-sm text-white/90">{studentStop?.name}</p>
            </div>
          </div>
        )}

        {/* Student's Stop ETA Card */}
        {studentStop && !hasArrived && (
          <div className={cn(
            'p-4 rounded-lg border',
            !delayStatus || delayStatus.status === 'on_time'
              ? 'bg-green-50 border-green-200'
              : delayStatus.status === 'slight_delay'
                ? 'bg-yellow-50 border-yellow-200'
                : delayStatus.status === 'delayed'
                  ? 'bg-orange-50 border-orange-200'
                  : 'bg-red-50 border-red-200'
          )}>
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                !delayStatus || delayStatus.status === 'on_time'
                  ? 'bg-green-500'
                  : delayStatus.status === 'slight_delay'
                    ? 'bg-yellow-500'
                    : delayStatus.status === 'delayed'
                      ? 'bg-orange-500'
                      : 'bg-red-500'
              )}>
                <MapPin className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900">
                  Próxima parada: {studentStop.name}
                </p>
                {etaMinutes !== null && etaMinutes !== undefined && (
                  <div className="mt-1 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-500" />
                    <span className="text-lg font-bold text-gray-900">~{etaMinutes} min</span>
                    {etaTime && (
                      <span className="text-sm text-gray-500">(llegada {etaTime})</span>
                    )}
                  </div>
                )}
                {delayStatus?.isDelayed ? (
                  <p className="text-xs text-orange-700 mt-1">
                    <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
                    Retraso de +{delayStatus.delayMinutes} min vs horario programado
                  </p>
                ) : (
                  <p className="text-xs text-green-700 mt-1">A tiempo</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Driver & Vehicle */}
        {(driver || vehicle) && (
          <div className="p-4 bg-gray-50 rounded-lg flex items-center justify-between">
            <div className="flex items-center gap-3">
              {driver && (
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{driver.name}</p>
                    <p className="text-xs text-gray-500">Conductor</p>
                  </div>
                </div>
              )}
              {vehicle && (
                <div className="flex items-center gap-2 ml-3">
                  <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center">
                    <Car className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{vehicle.licensePlate}</p>
                  </div>
                </div>
              )}
            </div>
            {driver?.phone && (
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${driver.phone}`}
                  className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"
                >
                  <Phone className="w-4 h-4 text-primary" />
                </a>
                {formatWhatsAppLink(driver.phone) && (
                  <a
                    href={formatWhatsAppLink(driver.phone)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center"
                  >
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Recent Events */}
        {events.length > 0 && (
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900">Últimos eventos</p>
              <Link
                href={`/trips/${tripId}?studentId=${studentId}`}
                className="text-xs text-primary hover:underline"
              >
                Ver todos
              </Link>
            </div>
            <div className="space-y-2">
              {events.slice(0, 3).map((event) => {
                const config = getEventConfig(event.type as TripEventType);
                const time = new Date(event.timestamp).toLocaleTimeString('es-EC', {
                  hour: '2-digit',
                  minute: '2-digit',
                });

                return (
                  <div key={event._id} className="flex items-center gap-2 text-sm">
                    <span className={cn('w-6 h-6 rounded-full flex items-center justify-center text-xs', config.bgColor)}>
                      {config.icon}
                    </span>
                    <span className="text-gray-700 flex-1">{event.title}</span>
                    <span className="text-gray-400">{time}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Report Novedad Button */}
        <div className="pb-safe">
          <NovedadContextButton
            studentId={studentId as Id<"students">}
            tripId={trip?.id}
            variant="full"
            label="Reportar novedad"
          />
        </div>
      </div>
    </div>
  );
}
