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
} from 'lucide-react';
import { StatCard } from '@/components/shared';
import { StatusBadge } from '@/components/shared';

/**
 * Dashboard mock data
 * Based on ADMIN_WIREFRAMES.md Section 1.1
 */
const stats = [
  { icon: Navigation, label: 'Viajes', value: 12, subValue: 'Total: 24', color: 'primary' as const },
  { icon: Bus, label: 'Vehículos', value: 8, subValue: 'En ruta', color: 'info' as const },
  { icon: GraduationCap, label: 'Estudiantes', value: 342, subValue: 'A bordo', color: 'success' as const },
  { icon: Users, label: 'Conductores', value: 10, subValue: 'En servicio', color: 'warning' as const },
  { icon: MapPin, label: 'Rutas', value: 18, subValue: 'Activas', color: 'info' as const },
  { icon: AlertTriangle, label: 'Alertas', value: 3, subValue: 'Sin leer: 1', color: 'error' as const },
];

const activeTrips = [
  {
    id: '1',
    routeName: 'Centro - Escuela A',
    driverName: 'Juan Pérez',
    status: 'active' as const,
    statusLabel: 'EN RUTA',
    students: { current: 28, total: 30 },
    stops: { current: 3, total: 8 },
    eta: '15 min',
  },
  {
    id: '2',
    routeName: 'Norte - Escuela B',
    driverName: 'María González',
    status: 'pending' as const,
    statusLabel: 'RECOGIDA',
    students: { current: 12, total: 25 },
    stops: { current: 5, total: 12 },
    eta: '25 min',
  },
  {
    id: '3',
    routeName: 'Sur - Escuela A',
    driverName: 'Carlos Ruiz',
    status: 'completed' as const,
    statusLabel: 'COMPLETADO',
    students: { current: 22, total: 22 },
    stops: { current: 10, total: 10 },
    eta: 'Finalizado: 08:45',
  },
];

const recentAlerts = [
  {
    id: '1',
    type: 'warning' as const,
    icon: AlertTriangle,
    message: 'Conductor reportó retraso - Ruta Centro',
    time: 'Hace 5 min',
    unread: true,
  },
  {
    id: '2',
    type: 'info' as const,
    icon: Info,
    message: 'Vehículo requiere mantenimiento - Bus 12',
    time: 'Hace 1 hora',
    unread: false,
  },
  {
    id: '3',
    type: 'success' as const,
    icon: CheckCircle2,
    message: 'Viaje completado exitosamente - Ruta Norte',
    time: 'Hace 2 horas',
    unread: false,
  },
];

/**
 * Dashboard Page
 *
 * Based on ADMIN_WIREFRAMES.md Section 1.1:
 * - 6 stat cards with key metrics
 * - Real-time trips list with status
 * - Recent alerts panel
 */
export default function DashboardPage() {
  const router = useRouter();

  return (
    <div className="space-y-6">
      {/* Stats Grid - 6 cards */}
      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        {stats.map((stat) => (
          <StatCard
            key={stat.label}
            icon={stat.icon}
            label={stat.label}
            value={stat.value}
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
          {activeTrips.map((trip) => (
            <div
              key={trip.id}
              onClick={() => router.push(`/trips/${trip.id}`)}
              className="block p-4 hover:bg-gray-50 transition-colors cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                    <Bus className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">
                      Ruta: {trip.routeName}
                    </p>
                    <p className="text-sm text-gray-500">
                      Conductor: {trip.driverName}
                    </p>
                  </div>
                </div>
                <StatusBadge status={trip.status} label={trip.statusLabel} />
              </div>

              <div className="flex items-center gap-6 text-sm text-gray-600 mb-3">
                <span className="flex items-center gap-1">
                  <GraduationCap className="w-4 h-4" />
                  Estudiantes: {trip.students.current}/{trip.students.total}
                </span>
                <span className="flex items-center gap-1">
                  <MapPinned className="w-4 h-4" />
                  Paradas: {trip.stops.current}/{trip.stops.total}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {trip.status === 'completed' ? trip.eta : `ETA: ${trip.eta}`}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/trips/${trip.id}#map`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                >
                  <MapPin className="w-4 h-4" />
                  Ver en mapa
                </Link>
                <Link
                  href={`/trips/${trip.id}`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-sm text-gray-600 hover:text-gray-800 font-medium flex items-center gap-1"
                >
                  <Navigation className="w-4 h-4" />
                  Detalles
                </Link>
              </div>
            </div>
          ))}
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
          {recentAlerts.map((alert) => {
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
          })}
        </div>
      </div>
    </div>
  );
}
