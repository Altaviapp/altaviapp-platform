'use client';

import { useState, useMemo } from 'react';
import { useParams } from 'next/navigation';
import { ArrowLeft, Bus, Clock, MapPin, Users, History, Info } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { useTrip, useTripStudents, useConvexAuth } from '@/hooks';
import { LoadingState } from '@/components/core';
import { TripTimeline } from '@/components/trip/TripTimeline';
import { StopStudentsList } from '@/components/trip/StopStudentsList';

type Tab = 'info' | 'timeline';

export default function TripDetailsPage() {
  const params = useParams();
  const tripId = params?.id as string;
  const [activeTab, setActiveTab] = useState<Tab>('info');

  const { isLoading: authLoading } = useConvexAuth();
  const { trip, isLoading: tripLoading } = useTrip(tripId as any);
  const { students: tripStudents, isLoading: studentsLoading } = useTripStudents(tripId);

  const isLoading = authLoading || tripLoading;

  // Calculate current stop index based on completed stops
  const currentStopIndex = useMemo(() => {
    if (!trip?.stops) return -1;
    const firstPendingIndex = trip.stops.findIndex((s: any) => !s.isCompleted);
    return firstPendingIndex === -1 ? trip.stops.length : firstPendingIndex;
  }, [trip?.stops]);

  // Format duration
  const formatDuration = (startTime?: number) => {
    if (!startTime) return '-';
    const diff = Date.now() - startTime;
    const hours = Math.floor(diff / 3600000);
    const minutes = Math.floor((diff % 3600000) / 60000);
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={`/trips/${tripId}/active`} className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-lg font-semibold text-gray-900">Detalles del Viaje</h1>
          </div>
        </div>
        <div className="p-4">
          <LoadingState message="Cargando detalles..." />
        </div>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500">Viaje no encontrado</p>
          <Link href="/dashboard" className="text-primary mt-2 inline-block">
            Volver al inicio
          </Link>
        </div>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: typeof Info }[] = [
    { id: 'info', label: 'Info General', icon: Info },
    { id: 'timeline', label: 'Cronologia', icon: History },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center gap-3">
            <Link href={`/trips/${tripId}/active`} className="p-2 -ml-2 rounded-lg hover:bg-gray-100">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <div className="flex-1">
              <h1 className="text-lg font-semibold text-gray-900">Detalles del Viaje</h1>
              <p className="text-sm text-gray-500">{trip.route?.name || 'Ruta'}</p>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-t border-gray-100">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-2 py-3 text-sm font-medium transition-colors border-b-2',
                  isActive
                    ? 'text-primary border-primary'
                    : 'text-gray-500 border-transparent hover:text-gray-700'
                )}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {activeTab === 'info' && (
          <div className="space-y-4">
            {/* Trip Info Card */}
            <div className="bg-white rounded-xl border border-gray-200 p-4">
              <h2 className="font-medium text-gray-900 mb-3">Informacion del Viaje</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-start gap-2">
                  <Bus className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Ruta</p>
                    <p className="text-sm text-gray-900">{trip.route?.name || '-'}</p>
                    <span className={cn(
                      'inline-block mt-1 text-xs px-2 py-0.5 rounded-full',
                      trip.route?.type === 'pickup' ? 'bg-info/10 text-info' : 'bg-success/10 text-success'
                    )}>
                      {trip.route?.type === 'pickup' ? 'Recogida' : 'Entrega'}
                    </span>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Clock className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Duracion</p>
                    <p className="text-sm text-gray-900">{formatDuration(trip.startTime)}</p>
                    {trip.startTime && (
                      <p className="text-xs text-gray-400">
                        Inicio: {new Date(trip.startTime).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Vehiculo</p>
                    <p className="text-sm text-gray-900">{trip.vehicle?.licensePlate || '-'}</p>
                  </div>
                </div>

                <div className="flex items-start gap-2">
                  <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs text-gray-500">Estudiantes</p>
                    <p className="text-sm text-gray-900">{tripStudents.length} asignados</p>
                    <p className="text-xs text-gray-400">
                      {trip.stops?.length || 0} paradas
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Crew Info */}
            {(trip.driver || trip.monitor) && (
              <div className="bg-white rounded-xl border border-gray-200 p-4">
                <h2 className="font-medium text-gray-900 mb-3">Tripulacion</h2>
                <div className="space-y-2">
                  {trip.driver && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-primary font-medium text-sm">C</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">Conductor</p>
                        <p className="text-xs text-gray-500">Asignado</p>
                      </div>
                    </div>
                  )}
                  {trip.monitor && (
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-info/10 flex items-center justify-center">
                        <span className="text-info font-medium text-sm">M</span>
                      </div>
                      <div>
                        <p className="text-sm text-gray-900">Monitor</p>
                        <p className="text-xs text-gray-500">Asignado</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Stops and Students */}
            <div>
              <h2 className="font-medium text-gray-900 mb-3 px-1">Paradas y Estudiantes</h2>
              {studentsLoading ? (
                <LoadingState message="Cargando estudiantes..." />
              ) : (
                <StopStudentsList
                  tripStudents={tripStudents.map((ts: any) => ({
                    student: ts.student,
                    stop: ts.stop,
                    status: ts.status,
                    checkinStatus: ts.checkinStatus,
                    novedad: ts.novedad,
                  }))}
                  currentStopIndex={currentStopIndex}
                  routeType={trip.route?.type}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === 'timeline' && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="font-medium text-gray-900 mb-4">Cronologia del Viaje</h2>
            <TripTimeline tripId={tripId} />
          </div>
        )}
      </div>
    </div>
  );
}
