'use client';

import { VehicleCard } from '@/components/dashboard/VehicleCard';
import { TripCard } from '@/components/dashboard/TripCard';
import { WeeklyStats } from '@/components/dashboard/WeeklyStats';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { AlertCircle, Calendar, Users, QrCode } from 'lucide-react';
import { useConvexDashboard, useConvexAuth } from '@/hooks';
import { getGreeting } from '@/lib/utils/dates';
import { formatDate } from '@/lib/utils/dates';
import Link from 'next/link';

export default function DashboardPage() {
  // Use real Convex auth - no more mock fallback
  const { user, isDriver, isMonitor, isLoading: authLoading } = useConvexAuth();

  // Use real Convex data - no more mock fallback
  const { data, loading, error } = useConvexDashboard();

  // Auth state
  const userRole = (user as { role?: string })?.role ?? 'driver';
  const isAdmin = userRole === 'admin' || userRole === 'super_admin';
  const roleDisplayName = isDriver ? 'Conductor' : isMonitor ? 'Monitor' : 'Admin';

  // Loading state
  if (loading || authLoading) {
    return <LoadingState variant="page" />;
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Error al cargar datos"
        description={error}
        action={
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            Reintentar
          </button>
        }
      />
    );
  }

  // No data state
  if (!data) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="No hay datos disponibles"
        description="No se encontraron datos del dashboard. Por favor contacta al administrador."
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {getGreeting()}, {user?.name || 'Usuario'}
        </h1>
        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
          <Calendar className="w-4 h-4" />
          Hoy: {formatDate(new Date().toISOString())}
          <span className="mx-2">|</span>
          <span className="text-primary font-medium">{roleDisplayName}</span>
        </p>
      </div>

      {/* Role-specific Card */}
      {isDriver && data.vehicle && (
        <VehicleCard vehicle={data.vehicle} />
      )}

      {isMonitor && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-green-600" />
              Check-ins de Hoy
            </h3>
            <Link
              href="/checkin"
              className="flex items-center gap-1 text-sm text-primary hover:text-primary/80"
            >
              <QrCode className="w-4 h-4" />
              Escanear
            </Link>
          </div>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-green-600">{data.weeklyStats?.tripsCompleted ?? 0}</p>
              <p className="text-xs text-gray-600">Completados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">{data.todayTrips?.length ?? 0}</p>
              <p className="text-xs text-gray-600">Programados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-400">{data.weeklyStats?.studentsTransported ?? 0}</p>
              <p className="text-xs text-gray-600">Transportados</p>
            </div>
          </div>
        </div>
      )}

      {/* Today's Trips Section */}
      <section>
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Viajes de Hoy
        </h2>

        {!data.todayTrips || data.todayTrips.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="No hay viajes programados hoy"
            description="No tienes viajes asignados para el día de hoy."
          />
        ) : (
          <div className="space-y-4">
            {data.todayTrips.map((trip, index) => (
              <TripCard
                key={trip._id}
                trip={trip}
                variant={index === 0 ? 'primary' : 'secondary'}
                showChecklist={isDriver} // Only show checklist link for drivers
              />
            ))}
          </div>
        )}
      </section>

      {/* Weekly Stats */}
      {data.weeklyStats && (
        <WeeklyStats stats={data.weeklyStats} />
      )}

      {/* Recent Notifications */}
      {data.recentNotifications && (
        <NotificationList
          notifications={data.recentNotifications}
          limit={3}
        />
      )}
    </div>
  );
}
