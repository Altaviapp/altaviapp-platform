'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Bus, MapPin, Users, Clock, Eye, RefreshCw, AlertTriangle, CheckCircle, Play, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTodaysTrips, useTrips } from '@/hooks';

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Bus }> = {
  in_progress: { label: 'En Ruta', color: 'text-success', bg: 'bg-success', icon: Bus },
  scheduled: { label: 'Programado', color: 'text-warning', bg: 'bg-warning', icon: Clock },
  completed: { label: 'Completado', color: 'text-gray-500', bg: 'bg-gray-400', icon: CheckCircle },
  cancelled: { label: 'Cancelado', color: 'text-error', bg: 'bg-error', icon: AlertTriangle },
};

export default function TripsPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Real data from Convex
  const { trips, isLoading } = useTodaysTrips();
  const { trips: scheduledTrips, isLoading: scheduledLoading } = useTrips({ status: 'scheduled' });

  // Calculate stats from real data
  const stats = useMemo(() => ({
    active: trips.filter(t => t.status === 'in_progress').length,
    completed: trips.filter(t => t.status === 'completed').length,
    cancelled: trips.filter(t => t.status === 'cancelled').length,
    scheduled: scheduledTrips.length,
  }), [trips, scheduledTrips]);

  // Separate active and completed trips
  const activeTrips = useMemo(() =>
    trips.filter(t => t.status === 'in_progress' || t.status === 'scheduled'),
    [trips]
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Monitoreo de Viajes</h1>
          <p className="text-gray-500">Seguimiento en tiempo real de todos los viajes</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              'inline-flex items-center gap-2 px-4 py-2 rounded-lg transition-colors',
              autoRefresh ? 'bg-success/10 text-success' : 'bg-gray-100 text-gray-600'
            )}
          >
            <RefreshCw className={cn('w-5 h-5', autoRefresh && 'animate-spin')} />
            {autoRefresh ? 'Auto-actualización ON' : 'Auto-actualización OFF'}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-success flex items-center justify-center">
              <Bus className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : stats.active}</p>
              <p className="text-sm text-gray-500">Viajes Activos</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-gray-400 flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : stats.completed}</p>
              <p className="text-sm text-gray-500">Completados Hoy</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-error flex items-center justify-center">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{isLoading ? '...' : stats.cancelled}</p>
              <p className="text-sm text-gray-500">Cancelados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-warning flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{scheduledLoading ? '...' : stats.scheduled}</p>
              <p className="text-sm text-gray-500">Programados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Trips */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Viajes en Curso</h2>
          <span className="text-sm text-gray-500">Datos en tiempo real</span>
        </div>

        {isLoading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-500">Cargando viajes...</span>
          </div>
        ) : activeTrips.length === 0 ? (
          <div className="p-12 text-center">
            <Bus className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay viajes activos</h3>
            <p className="text-gray-500">Los viajes programados aparecerán aquí cuando inicien</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {activeTrips.map((trip) => {
              const status = statusConfig[trip.status ?? 'scheduled'] ?? statusConfig.scheduled;
              const StatusIcon = status?.icon ?? Clock;
              return (
                <div key={trip._id} className="p-4 hover:bg-gray-50">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                    {/* Trip Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', status?.bg ?? 'bg-gray-400')}>
                          <StatusIcon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="font-medium text-gray-900">{trip.routeName || 'Sin ruta'}</h3>
                            <span className={cn('px-2 py-0.5 text-xs rounded-full', status?.bg ?? 'bg-gray-400', 'text-white')}>
                              {status?.label ?? 'Desconocido'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {trip.vehiclePlate || 'Sin vehículo'} • {trip.routeType === 'pickup' ? 'Recogida' : 'Entrega'}
                          </p>
                          <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                            <Clock className="w-4 h-4" />
                            <span>Fecha: {trip.scheduledDate}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Link href={`/trips/${trip._id}`} className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        <span className="hidden sm:inline">Ver</span>
                      </Link>
                      <button className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition-colors flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        <span className="hidden sm:inline">Mapa</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Scheduled Trips */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Viajes Programados</h2>
        </div>
        {scheduledLoading ? (
          <div className="p-12 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <span className="ml-3 text-gray-500">Cargando...</span>
          </div>
        ) : scheduledTrips.length === 0 ? (
          <div className="p-12 text-center">
            <Clock className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No hay viajes programados</h3>
            <p className="text-gray-500">Los viajes futuros aparecerán aquí</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ruta</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Tipo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vehículo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Fecha</th>
                  <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {scheduledTrips.map((trip) => (
                  <tr key={trip._id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">{trip.routeName || 'Sin ruta'}</td>
                    <td className="px-4 py-3 text-gray-600">{trip.routeType === 'pickup' ? 'Recogida' : 'Entrega'}</td>
                    <td className="px-4 py-3 text-gray-600">{trip.vehiclePlate || '-'}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">{trip.scheduledDate}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="px-3 py-1.5 bg-success text-white rounded-lg hover:bg-success/90 transition-colors inline-flex items-center gap-1">
                        <Play className="w-4 h-4" />
                        Iniciar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
