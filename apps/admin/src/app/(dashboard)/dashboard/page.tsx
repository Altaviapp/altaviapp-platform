'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Navigation,
  Bus,
  GraduationCap,
  Users,
  MapPin,
  AlertTriangle,
  MapPinned,
  ArrowRight,
  Clock,
  CheckCircle2,
  Info,
  Loader2,
} from 'lucide-react';
import { StatCard } from '@/components/shared';
import { StatusBadge } from '@/components/shared';
import { useConvexAuth, useActiveTrips, useVehicles, useStudents, useDrivers, useRoutes, useIncidents } from '@/hooks';

/**
 * Dashboard Page
 *
 * Shows real-time metrics from Convex filtered by institutionId
 */
export default function DashboardPage() {
  const router = useRouter();
  const { isLoading: authLoading } = useConvexAuth();

  // Real data from Convex - all filtered by institution
  const { trips: activeTrips, isLoading: tripsLoading } = useActiveTrips();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles({ status: 'active' });
  const { students, isLoading: studentsLoading } = useStudents();
  const { drivers, isLoading: driversLoading } = useDrivers({ isActive: true });
  const { routes, isLoading: routesLoading } = useRoutes();
  const { incidents, isLoading: incidentsLoading } = useIncidents();

  const isLoading = authLoading || tripsLoading || vehiclesLoading || studentsLoading || driversLoading || routesLoading || incidentsLoading;

  // Calculate stats from real data
  const stats = [
    {
      icon: Navigation,
      label: 'Viajes',
      value: activeTrips.length,
      subValue: 'En curso',
      color: 'primary' as const
    },
    {
      icon: Bus,
      label: 'Vehículos',
      value: vehicles.length,
      subValue: 'Activos',
      color: 'info' as const
    },
    {
      icon: GraduationCap,
      label: 'Estudiantes',
      value: students.length,
      subValue: 'Registrados',
      color: 'success' as const
    },
    {
      icon: Users,
      label: 'Conductores',
      value: drivers.length,
      subValue: 'Activos',
      color: 'warning' as const
    },
    {
      icon: MapPin,
      label: 'Rutas',
      value: routes.length,
      subValue: 'Activas',
      color: 'info' as const
    },
    {
      icon: AlertTriangle,
      label: 'Incidentes',
      value: incidents.filter(i => i.status === 'open').length,
      subValue: `Total: ${incidents.length}`,
      color: 'error' as const
    },
  ];

  // Get recent incidents as alerts
  const recentAlerts = incidents.slice(0, 3).map((incident) => ({
    id: incident._id,
    type: incident.severity === 'critical' || incident.severity === 'high'
      ? 'warning' as const
      : incident.severity === 'medium'
        ? 'info' as const
        : 'success' as const,
    icon: incident.severity === 'critical' || incident.severity === 'high'
      ? AlertTriangle
      : incident.severity === 'medium'
        ? Info
        : CheckCircle2,
    message: incident.description || `Incidente: ${incident.type}`,
    time: formatTimeAgo(incident._creationTime),
    unread: incident.status === 'open',
  }));

  return (
    <div className="space-y-6">
      {/* Stats Grid - 6 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={isLoading ? '...' : stat.value}
            subValue={stat.subValue}
            color={stat.color}
          />
        ))}
      </div>

      {/* Real-time Trips Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Viajes en Tiempo Real
          </h2>
          <Link
            href="/trips"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium"
          >
            Ver todos
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {tripsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-gray-500">Cargando viajes...</span>
            </div>
          ) : activeTrips.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <Bus className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-gray-500">No hay viajes activos en este momento</p>
            </div>
          ) : (
            activeTrips.slice(0, 3).map((trip) => (
              <div
                key={trip._id}
                onClick={() => router.push(`/trips/${trip._id}`)}
                className="block p-4 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Bus className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Ruta: {trip.routeName || 'Sin ruta'}
                      </p>
                      <p className="text-sm text-gray-500">
                        Vehículo: {trip.vehiclePlate || 'Sin asignar'}
                      </p>
                    </div>
                  </div>
                  <StatusBadge
                    status={trip.status === 'in_progress' ? 'active' : trip.status === 'completed' ? 'completed' : 'pending'}
                    label={getStatusLabel(trip.status)}
                  />
                </div>

                <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {trip.scheduledDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPinned className="w-4 h-4" />
                    {trip.routeType === 'pickup' ? 'Recogida' : 'Entrega'}
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    href={`/trips/${trip._id}#map`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                  >
                    <MapPin className="w-4 h-4" />
                    Ver en mapa
                  </Link>
                  <Link
                    href={`/trips/${trip._id}`}
                    onClick={(e) => e.stopPropagation()}
                    className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1"
                  >
                    <Navigation className="w-4 h-4" />
                    Detalles
                  </Link>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Recent Alerts Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center justify-between p-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">
            Alertas Recientes
          </h2>
          <Link
            href="/incidents"
            className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium"
          >
            Ver todas
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="divide-y divide-gray-100">
          {incidentsLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <span className="ml-2 text-gray-500">Cargando alertas...</span>
            </div>
          ) : recentAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-gray-300 mb-2" />
              <p className="text-gray-500">No hay alertas recientes</p>
            </div>
          ) : (
            recentAlerts.map((alert) => {
              const Icon = alert.icon;
              const iconColors = {
                warning: 'text-amber-600 bg-amber-100',
                info: 'text-blue-600 bg-blue-100',
                success: 'text-green-600 bg-green-100',
              };

              return (
                <div
                  key={alert.id}
                  className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors"
                >
                  <div className={`p-2 rounded-full ${iconColors[alert.type]}`}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900 truncate">
                      {alert.message}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 whitespace-nowrap">
                      {alert.time}
                    </span>
                    {alert.unread && (
                      <span className="w-2 h-2 bg-red-500 rounded-full" />
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours} hora${hours > 1 ? 's' : ''}`;
  return new Date(timestamp).toLocaleDateString('es-EC');
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    scheduled: 'PROGRAMADO',
    in_progress: 'EN RUTA',
    completed: 'COMPLETADO',
    cancelled: 'CANCELADO',
  };
  return labels[status] || status.toUpperCase();
}
