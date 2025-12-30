'use client';

import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ChevronLeft, Loader2, AlertTriangle, MapPin, Clock, User,
  Phone, MessageCircle, Car, History
} from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { LiveTrackingMap, RouteStop } from '@/components/tracking/LiveTrackingMap';
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
 * Active Trip Page - Parent
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
    school,
    etaMinutes,
    etaTime,
    delayStatus,
    currentSpeed,
  } = useStudentTracking(studentId ? studentId as Id<"students"> : null);

  // Latest trip events
  const { events } = useLatestTripEvents(
    trip?.id ? trip.id as Id<"trips"> : null,
    { limit: 10 }
  );

  const isLoading = studentLoading || trackingLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando...</span>
      </div>
    );
  }

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

  // Transform stops for map
  const mapStops: RouteStop[] = (stops ?? []).map((stop) => ({
    id: stop.id,
    name: stop.name,
    lat: stop.lat,
    lng: stop.lng,
    scheduledTime: stop.scheduledTime,
    completed: stop.completed,
    isSchool: false,
  }));

  // Vehicle location for map
  const vehicleLocation = currentLocation ? {
    lat: currentLocation.latitude,
    lng: currentLocation.longitude,
    speed: currentLocation.speed ?? null,
    heading: currentLocation.heading ?? null,
    timestamp: currentLocation.timestamp,
  } : null;

  // School location
  const schoolLocation = school?.lat && school?.lng ? {
    lat: school.lat,
    lng: school.lng,
    name: school.name,
  } : undefined;

  // Format phone for WhatsApp
  const formatWhatsAppLink = (phone?: string) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold text-gray-900">
                Viaje de {student?.firstName || 'Estudiante'}
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              {route?.name} - {route?.type === 'pickup' ? 'Recogida' : 'Entrega'}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium text-green-600">En Vivo</span>
        </div>
      </div>

      {/* Map - Full width, takes most of the screen */}
      <div className="flex-1 relative min-h-[300px]">
        <LiveTrackingMap
          vehicleLocation={vehicleLocation}
          stops={mapStops}
          schoolLocation={schoolLocation}
          studentStopId={studentStop?.id}
          height="100%"
          autoCenter={true}
          encodedPolyline={route?.optimizedPolyline ?? undefined}
          vehicleInfo={vehicle && driver ? {
            plate: vehicle.licensePlate,
            driverName: driver.name,
          } : undefined}
        />

        {/* Speed overlay */}
        {currentSpeed !== null && currentSpeed !== undefined && currentSpeed > 0 && (
          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg shadow-md">
            <div className="flex items-center gap-1.5">
              <span className="text-lg font-bold text-gray-900">{Math.round(currentSpeed)}</span>
              <span className="text-xs text-gray-500">km/h</span>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Panel */}
      <div className="bg-white border-t border-gray-200 rounded-t-2xl shadow-lg">
        {/* Student's Stop ETA */}
        {studentStop && (
          <div className={cn(
            'p-4 border-b',
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
                  Proxima parada: {studentStop.name}
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
          <div className="p-4 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {driver && (
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
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
          <div className="p-4 border-b border-gray-100">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium text-gray-900">Ultimos eventos</p>
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
        <div className="p-4 pb-safe">
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
