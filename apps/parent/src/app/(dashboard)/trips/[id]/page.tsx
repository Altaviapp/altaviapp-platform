'use client';

import { useState, useMemo } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Bus, MapPin, Users, Clock, AlertTriangle, ChevronLeft, Loader2,
  Info, Map, History, User, Phone, MessageCircle, Car, CheckCircle
} from 'lucide-react';
import { cn, formatTime } from '@/lib/utils';
import { Card } from '@/components/core';
import { LiveTrackingMap, RouteStop } from '@/components/tracking/LiveTrackingMap';
import { NovedadContextButton } from '@/components/home/NovedadContextButton';
import {
  useTrip,
  useStudent,
  useStudentTripTimeline,
  getEventConfig,
  type TripEventType,
} from '@/hooks';
import { Id } from '../../../../../../../convex/_generated/dataModel';

type TabType = 'general' | 'mapa' | 'historial';

const statusConfig: Record<string, { label: string; color: string; bgColor: string }> = {
  scheduled: { label: 'Programado', color: 'text-yellow-700', bgColor: 'bg-yellow-100' },
  in_progress: { label: 'En Ruta', color: 'text-green-700', bgColor: 'bg-green-100' },
  completed: { label: 'Completado', color: 'text-gray-700', bgColor: 'bg-gray-100' },
  cancelled: { label: 'Cancelado', color: 'text-red-700', bgColor: 'bg-red-100' },
};

/**
 * Trip Detail Page - Parent
 *
 * Shows trip details focused on parent's child
 * Includes map, timeline, and novedad reporting
 */
export default function TripDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();

  const tripId = params.id as string;
  const studentId = searchParams.get('studentId');

  const [activeTab, setActiveTab] = useState<TabType>('general');

  // Fetch trip data
  const { trip, isLoading: tripLoading } = useTrip(tripId as Id<"trips">);

  // Fetch student data
  const { student, isLoading: studentLoading } = useStudent(
    studentId ? studentId as Id<"students"> : null
  );

  // Fetch timeline events for the student
  const { events, isLoading: eventsLoading } = useStudentTripTimeline(
    tripId as Id<"trips">,
    studentId ? studentId as Id<"students"> : null
  );

  const isLoading = tripLoading || studentLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando...</span>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">Viaje no encontrado</p>
        <Link href="/inicio" className="text-primary hover:underline mt-2 inline-block">
          Volver al inicio
        </Link>
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

  const status = statusConfig[trip.status] ?? { label: 'Programado', color: 'text-yellow-700', bgColor: 'bg-yellow-100' };
  const stops = trip.stops || [];
  const isActive = trip.status === 'in_progress';

  // Transform stops for map
  const mapStops: RouteStop[] = stops.map((stop) => ({
    id: stop._id,
    name: stop.name,
    lat: stop.latitude,
    lng: stop.longitude,
    scheduledTime: stop.scheduledTime || stop.estimatedArrivalTime,
    completed: (stop as any).isCompleted,
    isSchool: false,
  }));

  // Find student's stop
  const studentStop = stops.find((s: any) => s.isStudentStop);

  // Vehicle location
  const vehicleLocation = trip.currentLocation ? {
    lat: trip.currentLocation.latitude,
    lng: trip.currentLocation.longitude,
    speed: trip.currentLocation.speed ?? null,
    heading: trip.currentLocation.heading ?? null,
    timestamp: trip.currentLocation.timestamp,
  } : null;

  // Format phone for WhatsApp
  const formatWhatsAppLink = (phone?: string) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  const tabs = [
    { id: 'general' as const, label: 'General', icon: Info },
    { id: 'mapa' as const, label: 'Mapa', icon: Map },
    { id: 'historial' as const, label: 'Historial', icon: History, count: events.length },
  ];

  return (
    <div className="pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-semibold text-gray-900 truncate">
              {trip.route?.name || 'Viaje'}
            </h1>
            <p className="text-sm text-gray-500">
              {trip.scheduledDate} - {trip.route?.type === 'pickup' ? 'Recogida' : 'Entrega'}
            </p>
          </div>
          <span className={cn(
            'px-2.5 py-1 rounded-full text-xs font-medium',
            status.bgColor,
            status.color
          )}>
            {status.label}
          </span>
        </div>
      </div>

      {/* Active Trip Banner */}
      {isActive && (
        <Link
          href={`/trips/${tripId}/active?studentId=${studentId}`}
          className="block bg-green-50 border-b border-green-200 px-4 py-3"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-sm font-medium text-green-700">
                Viaje en curso - Ver en vivo
              </span>
            </div>
            <ChevronLeft className="w-4 h-4 text-green-600 rotate-180" />
          </div>
        </Link>
      )}

      {/* Child Info */}
      {student && (
        <div className="px-4 py-3 bg-primary/5 border-b border-primary/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-5 h-5 text-primary" />
            </div>
            <div>
              <p className="font-medium text-gray-900">
                {student.firstName} {student.lastName}
              </p>
              <p className="text-sm text-gray-500">{student.grade}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="px-4 py-3 bg-white border-b border-gray-100">
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActiveTab = activeTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActiveTab
                    ? 'bg-white text-primary shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className={cn(
                    'px-1.5 py-0.5 rounded-full text-xs',
                    isActiveTab ? 'bg-primary/10 text-primary' : 'bg-gray-200 text-gray-600'
                  )}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="px-4 py-4 space-y-4">
        {activeTab === 'general' && (
          <>
            {/* Trip Info */}
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900">Informacion del Viaje</h3>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Fecha</p>
                  <p className="font-medium text-gray-900">{trip.scheduledDate}</p>
                </div>
                <div>
                  <p className="text-gray-500">Tipo</p>
                  <p className="font-medium text-gray-900">
                    {trip.route?.type === 'pickup' ? 'Recogida' : 'Entrega'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Hora Inicio</p>
                  <p className="font-medium text-gray-900">
                    {trip.startTime
                      ? formatTime(new Date(trip.startTime))
                      : '--:--'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Hora Fin</p>
                  <p className="font-medium text-gray-900">
                    {trip.endTime
                      ? formatTime(new Date(trip.endTime))
                      : '--:--'}
                  </p>
                </div>
              </div>
            </Card>

            {/* Driver & Vehicle */}
            <Card className="p-4 space-y-4">
              <h3 className="font-semibold text-gray-900">Tripulacion</h3>

              {trip.driver && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{trip.driver.licenseNumber || 'Conductor'}</p>
                      <p className="text-sm text-gray-500">Conductor</p>
                    </div>
                  </div>
                  {trip.driver.phone && (
                    <div className="flex items-center gap-2">
                      <a
                        href={`tel:${trip.driver.phone}`}
                        className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center"
                      >
                        <Phone className="w-4 h-4 text-primary" />
                      </a>
                      {formatWhatsAppLink(trip.driver.phone) && (
                        <a
                          href={formatWhatsAppLink(trip.driver.phone)!}
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

              {trip.vehicle && (
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                  <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                    <Car className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{trip.vehicle.licensePlate}</p>
                    <p className="text-sm text-gray-500">Vehiculo asignado</p>
                  </div>
                </div>
              )}
            </Card>

            {/* Student's Stop */}
            {studentStop && (
              <Card className="p-4 space-y-3">
                <h3 className="font-semibold text-gray-900">Tu Parada</h3>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{studentStop.name}</p>
                    {studentStop.address && (
                      <p className="text-sm text-gray-500">{studentStop.address}</p>
                    )}
                    {(studentStop.scheduledTime || studentStop.estimatedArrivalTime) && (
                      <p className="text-sm text-gray-500">
                        <Clock className="w-3.5 h-3.5 inline mr-1" />
                        {studentStop.scheduledTime || studentStop.estimatedArrivalTime}
                      </p>
                    )}
                  </div>
                </div>
              </Card>
            )}
          </>
        )}

        {activeTab === 'mapa' && (
          <Card className="overflow-hidden">
            <div className="h-[400px]">
              <LiveTrackingMap
                vehicleLocation={vehicleLocation}
                stops={mapStops}
                studentStopId={studentStop?._id}
                height="400px"
                autoCenter={true}
                encodedPolyline={(trip.route as any)?.optimizedPolyline ?? undefined}
              />
            </div>
            <div className="p-3 bg-gray-50 border-t border-gray-100 flex flex-wrap gap-4 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-blue-500" />
                <span className="text-gray-600">Vehiculo</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-primary" />
                <span className="text-gray-600">Tu parada</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-400" />
                <span className="text-gray-600">Otras paradas</span>
              </div>
            </div>
          </Card>
        )}

        {activeTab === 'historial' && (
          <Card className="overflow-hidden">
            <div className="p-4 border-b border-gray-100">
              <h3 className="font-semibold text-gray-900">Historial del Viaje</h3>
              <p className="text-sm text-gray-500">{events.length} eventos</p>
            </div>

            {eventsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : events.length === 0 ? (
              <div className="p-8 text-center">
                <History className="w-10 h-10 mx-auto text-gray-300 mb-2" />
                <p className="text-gray-500 text-sm">Sin eventos aun</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
                {events.map((event, index) => {
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
                })}
              </div>
            )}
          </Card>
        )}
      </div>

      {/* Fixed Bottom Action */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 pb-safe">
        <NovedadContextButton
          studentId={studentId as Id<"students">}
          studentName={student ? `${student.firstName} ${student.lastName}` : undefined}
          tripId={tripId as Id<"trips">}
          date={trip.scheduledDate}
          routeType={trip.route?.type as 'pickup' | 'dropoff' | undefined}
          variant="full"
          label="Reportar novedad de este viaje"
        />
      </div>
    </div>
  );
}
