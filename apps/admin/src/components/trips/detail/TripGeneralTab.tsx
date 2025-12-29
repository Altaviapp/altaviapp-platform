'use client';

import { DetailSection } from '@/components/shared';
import Link from 'next/link';
import {
  Bus, Users, Clock, MapPin, Phone, CheckCircle, XCircle, Loader2
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TripGeneralTabProps {
  trip: {
    _id: string;
    status: string;
    scheduledDate: string;
    startTime?: number;
    endTime?: number;
    routeId: string;
    route?: {
      name: string;
      type: 'pickup' | 'dropoff';
    };
    vehicleId?: string;
    vehicle?: {
      licensePlate: string;
      brand?: string;
      model?: string;
    };
    driverId?: string;
    driver?: {
      licenseNumber?: string;
      phone?: string;
    };
    monitorId?: string;
    monitor?: {
      idNumber?: string;
      phone?: string;
    };
    stops?: Array<{
      _id: string;
      name: string;
      order: number;
      address?: string;
      isCompleted?: boolean;
    }>;
    checkins?: Array<{
      _id: string;
      studentName: string;
      stopName?: string;
      timestamp: number;
    }>;
    stats?: {
      totalStudents: number;
      checkedIn: number;
      stopsCompleted: number;
      totalStops?: number;
    };
  };
  isLoading?: boolean;
  className?: string;
}

export function TripGeneralTab({ trip, isLoading, className }: TripGeneralTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-gray-500">Cargando...</span>
      </div>
    );
  }

  const stops = trip.stops || [];
  const checkins = trip.checkins || [];
  const stats = trip.stats || {
    totalStudents: 0,
    checkedIn: 0,
    stopsCompleted: 0,
    totalStops: stops.length,
  };

  return (
    <div className={cn('grid grid-cols-1 lg:grid-cols-3 gap-6', className)}>
      {/* Left Column - Students */}
      <div className="lg:col-span-2 space-y-6">
        {/* Stops with Students */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Paradas y Estudiantes</h3>
            <p className="text-sm text-gray-500">
              {stats.checkedIn}/{stats.totalStudents} estudiantes registrados
            </p>
          </div>

          {stops.length === 0 ? (
            <div className="p-8 text-center">
              <MapPin className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No hay paradas configuradas</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
              {stops.map((stop) => (
                <div key={stop._id} className="p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        'w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0',
                        stop.isCompleted
                          ? 'bg-green-500 text-white'
                          : 'bg-gray-200 text-gray-700'
                      )}
                    >
                      {stop.isCompleted ? (
                        <CheckCircle className="w-4 h-4" />
                      ) : (
                        stop.order
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'font-medium',
                        stop.isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'
                      )}>
                        {stop.name}
                      </p>
                      {stop.address && (
                        <p className="text-sm text-gray-500 truncate">{stop.address}</p>
                      )}
                    </div>
                    {stop.isCompleted && (
                      <span className="text-xs text-green-600 font-medium">
                        Completada
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Check-ins */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100">
          <div className="p-4 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900">Registros de Estudiantes</h3>
            <p className="text-sm text-gray-500">{checkins.length} check-ins realizados</p>
          </div>

          {checkins.length === 0 ? (
            <div className="p-8 text-center">
              <Users className="w-12 h-12 mx-auto text-gray-400 mb-3" />
              <p className="text-gray-500">No hay registros aún</p>
              <p className="text-sm text-gray-400">Los check-ins aparecerán aquí</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 max-h-80 overflow-y-auto">
              {checkins.map((checkin) => (
                <div key={checkin._id} className="p-4 flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
                    <CheckCircle className="w-4 h-4 text-success" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">{checkin.studentName}</p>
                    {checkin.stopName && (
                      <p className="text-sm text-gray-500">{checkin.stopName}</p>
                    )}
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(checkin.timestamp).toLocaleTimeString('es-EC', {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column - Info */}
      <div className="space-y-6">
        {/* Trip Info */}
        <DetailSection title="Informacion del Viaje">
          <div className="space-y-4">
            <div>
              <p className="text-xs text-gray-500 mb-1">Ruta</p>
              <Link
                href={`/routes/${trip.routeId}`}
                className="text-primary hover:underline font-medium"
              >
                {trip.route?.name || 'Sin nombre'}
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Fecha</p>
                <p className="font-medium text-gray-900">{trip.scheduledDate}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Tipo</p>
                <p className="font-medium text-gray-900">
                  {trip.route?.type === 'pickup' ? 'Recogida' : 'Entrega'}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 mb-1">Hora Inicio</p>
                <p className="font-medium text-gray-900">
                  {trip.startTime
                    ? new Date(trip.startTime).toLocaleTimeString('es-EC', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--:--'}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500 mb-1">Hora Fin</p>
                <p className="font-medium text-gray-900">
                  {trip.endTime
                    ? new Date(trip.endTime).toLocaleTimeString('es-EC', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--:--'}
                </p>
              </div>
            </div>
          </div>
        </DetailSection>

        {/* Crew Info */}
        <DetailSection title="Tripulacion">
          <div className="space-y-4">
            {/* Driver */}
            {trip.driver ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                  <Bus className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Conductor</p>
                  <Link
                    href={`/fleet/drivers/${trip.driverId}`}
                    className="font-medium text-gray-900 hover:text-primary"
                  >
                    {trip.driver.licenseNumber || 'Sin licencia'}
                  </Link>
                </div>
                {trip.driver.phone && (
                  <a
                    href={`tel:${trip.driver.phone}`}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-700">Conductor no asignado</p>
              </div>
            )}

            {/* Monitor */}
            {trip.monitor ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Monitor</p>
                  <Link
                    href={`/fleet/monitors/${trip.monitorId}`}
                    className="font-medium text-gray-900 hover:text-primary"
                  >
                    {trip.monitor.idNumber || 'Sin ID'}
                  </Link>
                </div>
                {trip.monitor.phone && (
                  <a
                    href={`tel:${trip.monitor.phone}`}
                    className="p-2 text-primary hover:bg-primary/10 rounded-lg"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            ) : (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-500">Sin monitor asignado</p>
              </div>
            )}

            {/* Vehicle */}
            {trip.vehicle ? (
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                  <Bus className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-gray-500">Vehiculo</p>
                  <Link
                    href={`/fleet/vehicles/${trip.vehicleId}`}
                    className="font-medium text-gray-900 hover:text-primary"
                  >
                    {trip.vehicle.licensePlate}
                  </Link>
                  {(trip.vehicle.brand || trip.vehicle.model) && (
                    <p className="text-xs text-gray-400">
                      {trip.vehicle.brand} {trip.vehicle.model}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-sm text-amber-700">Vehiculo no asignado</p>
              </div>
            )}
          </div>
        </DetailSection>
      </div>
    </div>
  );
}
