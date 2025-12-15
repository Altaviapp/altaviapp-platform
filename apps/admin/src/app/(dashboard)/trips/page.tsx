'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bus, MapPin, Users, Clock, Eye, RefreshCw, AlertTriangle, CheckCircle, Play } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock active trips data
const activeTrips = [
  {
    id: 1,
    route: 'Ruta Centro - Escuela A',
    driver: 'Juan Pérez',
    vehicle: 'ABC-1234',
    status: 'in_progress',
    progress: 75,
    students: { onBoard: 23, total: 28 },
    stops: { completed: 6, total: 8 },
    startTime: '07:00',
    eta: '08:15',
    currentLocation: 'Av. 10 de Agosto',
  },
  {
    id: 2,
    route: 'Ruta Norte - Escuela B',
    driver: 'María González',
    vehicle: 'DEF-9012',
    status: 'picking_up',
    progress: 45,
    students: { onBoard: 12, total: 22 },
    stops: { completed: 5, total: 12 },
    startTime: '06:30',
    eta: '07:45',
    currentLocation: 'Parque Central',
  },
  {
    id: 3,
    route: 'Ruta Sur - Escuela A',
    driver: 'Carlos Ruiz',
    vehicle: 'JKL-7890',
    status: 'completed',
    progress: 100,
    students: { onBoard: 0, total: 18 },
    stops: { completed: 9, total: 9 },
    startTime: '06:45',
    eta: '08:00',
    currentLocation: 'Escuela A',
  },
  {
    id: 4,
    route: 'Ruta Oeste - Escuela D',
    driver: 'Pedro Gómez',
    vehicle: 'GHI-3456',
    status: 'delayed',
    progress: 20,
    students: { onBoard: 5, total: 25 },
    stops: { completed: 2, total: 10 },
    startTime: '07:15',
    eta: '08:45',
    currentLocation: 'Av. América',
    delayMinutes: 15,
  },
];

// Mock scheduled trips
const scheduledTrips = [
  { id: 5, route: 'Ruta Centro - Retorno', driver: 'Juan Pérez', vehicle: 'ABC-1234', scheduledTime: '13:00', students: 28 },
  { id: 6, route: 'Ruta Norte - Retorno', driver: 'María González', vehicle: 'DEF-9012', scheduledTime: '13:30', students: 22 },
  { id: 7, route: 'Ruta Sur - Retorno', driver: 'Carlos Ruiz', vehicle: 'JKL-7890', scheduledTime: '14:00', students: 18 },
];

const statusConfig: Record<string, { label: string; color: string; bg: string; icon: typeof Bus }> = {
  in_progress: { label: 'En Ruta', color: 'text-success', bg: 'bg-success', icon: Bus },
  picking_up: { label: 'Recogiendo', color: 'text-info', bg: 'bg-info', icon: Users },
  completed: { label: 'Completado', color: 'text-gray-500', bg: 'bg-gray-400', icon: CheckCircle },
  delayed: { label: 'Retrasado', color: 'text-error', bg: 'bg-error', icon: AlertTriangle },
  scheduled: { label: 'Programado', color: 'text-warning', bg: 'bg-warning', icon: Clock },
};

export default function TripsPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  const stats = {
    active: activeTrips.filter(t => t.status !== 'completed').length,
    completed: activeTrips.filter(t => t.status === 'completed').length,
    delayed: activeTrips.filter(t => t.status === 'delayed').length,
    scheduled: scheduledTrips.length,
  };

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
              <p className="text-2xl font-bold text-gray-900">{stats.active}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
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
              <p className="text-2xl font-bold text-gray-900">{stats.delayed}</p>
              <p className="text-sm text-gray-500">Retrasados</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-lg bg-warning flex items-center justify-center">
              <Clock className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{stats.scheduled}</p>
              <p className="text-sm text-gray-500">Programados</p>
            </div>
          </div>
        </div>
      </div>

      {/* Active Trips */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Viajes en Curso</h2>
          <span className="text-sm text-gray-500">Última actualización: hace 15 seg</span>
        </div>
        <div className="divide-y divide-gray-200">
          {activeTrips.map((trip) => {
            const status = statusConfig[trip.status] ?? statusConfig.in_progress!;
            const StatusIcon = status.icon;
            return (
              <div key={trip.id} className="p-4 hover:bg-gray-50">
                <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                  {/* Trip Info */}
                  <div className="flex-1">
                    <div className="flex items-start gap-3">
                      <div className={cn('w-10 h-10 rounded-lg flex items-center justify-center', status.bg)}>
                        <StatusIcon className="w-5 h-5 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-medium text-gray-900">{trip.route}</h3>
                          <span className={cn('px-2 py-0.5 text-xs rounded-full', status.bg, 'text-white')}>
                            {status.label}
                          </span>
                          {trip.status === 'delayed' && (
                            <span className="text-xs text-error">+{trip.delayMinutes} min</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-500 mt-1">
                          {trip.driver} • {trip.vehicle}
                        </p>
                        <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                          <MapPin className="w-4 h-4" />
                          <span>{trip.currentLocation}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Progress */}
                  <div className="lg:w-64">
                    <div className="flex items-center justify-between text-sm mb-1">
                      <span className="text-gray-600">Progreso</span>
                      <span className="font-medium">{trip.progress}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all', status.bg)}
                        style={{ width: `${trip.progress}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>{trip.stops.completed}/{trip.stops.total} paradas</span>
                      <span>ETA: {trip.eta}</span>
                    </div>
                  </div>

                  {/* Students */}
                  <div className="lg:w-32 text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="w-5 h-5 text-gray-400" />
                      <span className="text-lg font-bold text-gray-900">{trip.students.onBoard}</span>
                      <span className="text-gray-500">/{trip.students.total}</span>
                    </div>
                    <p className="text-xs text-gray-500">estudiantes</p>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Link href={`/trips/${trip.id}`} className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1">
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
      </div>

      {/* Scheduled Trips */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Viajes Programados</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Ruta</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Conductor</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Vehículo</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Horario</th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase">Estudiantes</th>
                <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {scheduledTrips.map((trip) => (
                <tr key={trip.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 font-medium text-gray-900">{trip.route}</td>
                  <td className="px-4 py-3 text-gray-600">{trip.driver}</td>
                  <td className="px-4 py-3 text-gray-600">{trip.vehicle}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">{trip.scheduledTime}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{trip.students}</td>
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
      </div>
    </div>
  );
}
