'use client';

import { useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  Bus, MapPin, Users, Clock, AlertTriangle, CheckCircle, X, Loader2
} from 'lucide-react';
import Link from 'next/link';
import { PageHeader, StatusBadge } from '@/components/shared';
import {
  TripDetailTabs,
  TripGeneralTab,
  TripMapTab,
  TripNovedadesTab,
  TripHistorialTab,
  type TripDetailTab,
} from '@/components/trips';
import { useTrip, useTripMutations, useNovedades, useTripTimeline } from '@/hooks';

const statusConfig: Record<string, { label: string; status: 'active' | 'inactive' | 'warning' | 'error' }> = {
  scheduled: { label: 'Programado', status: 'warning' },
  in_progress: { label: 'En Ruta', status: 'active' },
  completed: { label: 'Completado', status: 'inactive' },
  cancelled: { label: 'Cancelado', status: 'error' },
};

/**
 * Trip Detail Page - Refactored with Tabs
 *
 * Shows trip details across 4 tabs: General, Mapa, Novedades, Historial
 * For in_progress trips, there's an option to view the active trip page
 */
export default function TripDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tripId = params.id as string;

  const [activeTab, setActiveTab] = useState<TripDetailTab>('general');

  // Real data from Convex
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { trip, isLoading } = useTrip(tripId as any);
  const { cancelTrip, completeTrip } = useTripMutations();

  // Novedades for this trip's date
  const { novedades, isLoading: novedadesLoading } = useNovedades({
    fromDate: trip?.scheduledDate,
    toDate: trip?.scheduledDate,
  });

  // Trip timeline events
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { events, total: eventCount, isLoading: eventsLoading } = useTripTimeline(tripId as any);

  // Filter novedades to only show those for students in this trip
  const tripNovedades = useMemo(() => {
    if (!trip || !novedades) return [];
    return novedades;
  }, [trip, novedades]);

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

  const defaultStatusInfo = { label: 'En Progreso', status: 'active' as const };
  const statusInfo = statusConfig[trip.status] ?? defaultStatusInfo;

  const stops = trip.stops || [];
  const stats = trip.stats || {
    totalStudents: 0,
    checkedIn: 0,
    stopsCompleted: 0,
    totalStops: stops.length,
  };

  const handleCompleteTrip = async () => {
    if (!trip.currentLocation) return;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await completeTrip(tripId as any, trip.currentLocation.latitude, trip.currentLocation.longitude);
    } catch (error) {
      console.error('Error completing trip:', error);
    }
  };

  const handleCancelTrip = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await cancelTrip(tripId as any, 'Cancelado por administrador');
    } catch (error) {
      console.error('Error cancelling trip:', error);
    }
  };

  const handleViewActiveTrip = () => {
    router.push(`/trips/${tripId}/active`);
  };

  return (
    <div>
      <PageHeader
        title={trip.route?.name || 'Viaje'}
        subtitle={`${trip.scheduledDate} - ${trip.route?.type === 'pickup' ? 'Recogida' : 'Entrega'}`}
        breadcrumbs={[
          { label: 'Dashboard', href: '/dashboard' },
          { label: 'Viajes', href: '/trips' },
          { label: trip.route?.name || 'Viaje' },
        ]}
        backHref="/trips"
        badge={
          <StatusBadge
            status={statusInfo.status}
            label={statusInfo.label}
          />
        }
        actions={[
          ...(trip.status === 'in_progress' ? [{
            label: 'Ver en Vivo',
            onClick: handleViewActiveTrip,
            icon: Bus,
            variant: 'primary' as const,
          }] : []),
          ...(trip.status === 'in_progress' && trip.currentLocation ? [{
            label: 'Completar Viaje',
            onClick: handleCompleteTrip,
            icon: CheckCircle,
            variant: 'secondary' as const,
          }] : []),
          ...(trip.status !== 'completed' && trip.status !== 'cancelled' ? [{
            label: 'Cancelar',
            onClick: handleCancelTrip,
            icon: X,
            variant: 'danger' as const,
          }] : []),
        ]}
      />

      <div className="space-y-6">
        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.checkedIn}/{stats.totalStudents}</p>
                <p className="text-sm text-gray-500">Estudiantes</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-green-100 flex items-center justify-center">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stats.stopsCompleted}/{stops.length}</p>
                <p className="text-sm text-gray-500">Paradas</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {trip.startTime
                    ? new Date(trip.startTime).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
                    : '--:--'}
                </p>
                <p className="text-sm text-gray-500">Hora Inicio</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center">
                <CheckCircle className="w-6 h-6 text-gray-400" />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">
                  {trip.endTime
                    ? new Date(trip.endTime).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })
                    : '--:--'}
                </p>
                <p className="text-sm text-gray-500">Hora Fin</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <TripDetailTabs
          activeTab={activeTab}
          onTabChange={setActiveTab}
          novedadesCount={tripNovedades.length}
          eventCount={eventCount}
        />

        {/* Tab Content */}
        {activeTab === 'general' && (
          <TripGeneralTab
            trip={{
              _id: trip._id,
              status: trip.status,
              scheduledDate: trip.scheduledDate,
              startTime: trip.startTime,
              endTime: trip.endTime,
              routeId: trip.routeId,
              route: trip.route,
              vehicleId: trip.vehicleId ?? undefined,
              vehicle: trip.vehicle ?? undefined,
              driverId: trip.driverId ?? undefined,
              driver: trip.driver ?? undefined,
              monitorId: trip.monitorId ?? undefined,
              monitor: trip.monitor ?? undefined,
              stops: stops,
              checkins: trip.checkins,
              stats: stats,
            }}
          />
        )}

        {activeTab === 'mapa' && (
          <TripMapTab
            stops={stops}
            currentLocation={trip.currentLocation}
            optimizedPolyline={trip.route?.optimizedPolyline}
            vehiclePlate={trip.vehicle?.licensePlate}
            tripStatus={trip.status}
          />
        )}

        {activeTab === 'novedades' && (
          <TripNovedadesTab
            novedades={tripNovedades.map(n => ({
              _id: n._id,
              type: n.type || 'other',
              typeLabel: n.typeLabel,
              status: n.status,
              reason: n.reason,
              studentName: n.studentName,
              createdAt: n.createdAt,
            }))}
            isLoading={novedadesLoading}
          />
        )}

        {activeTab === 'historial' && (
          <TripHistorialTab
            tripId={tripId as any}
          />
        )}
      </div>
    </div>
  );
}
