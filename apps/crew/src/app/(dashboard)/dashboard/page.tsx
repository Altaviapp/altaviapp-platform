'use client';

import { VehicleCard } from '@/components/dashboard/VehicleCard';
import { TripCard } from '@/components/dashboard/TripCard';
import { WeeklyStats } from '@/components/dashboard/WeeklyStats';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { LoadingState } from '@/components/shared/LoadingState';
import { EmptyState } from '@/components/shared/EmptyState';
import { AlertCircle, Calendar, Users, QrCode } from 'lucide-react';
import { useConvexDashboard, useConvexAuth } from '@/hooks';
import { useDashboardData } from '@/hooks/useDashboardData';
import { getGreeting } from '@/lib/utils/dates';
import { formatDate } from '@/lib/utils/dates';
import Link from 'next/link';

export default function DashboardPage() {
  // Try to use Convex auth first
  const { user: authUser, isAuthenticated, isDriver: authIsDriver, isMonitor: authIsMonitor, isLoading: authLoading } = useConvexAuth();

  // Use Convex data when authenticated, mock data otherwise
  const convexDashboard = useConvexDashboard();
  const mockDashboard = useDashboardData();

  // Use Convex data if authenticated, fallback to mock for UI testing
  const { data, loading, error } = isAuthenticated ? convexDashboard : mockDashboard;

  // Auth state - prefer real auth, fallback to data for UI testing
  const user = authUser ?? data?.driver ?? { name: 'Usuario', email: '', role: 'driver' as const };
  const isDriver = isAuthenticated ? authIsDriver : (data?.driver?.role === 'driver');
  const isMonitor = isAuthenticated ? authIsMonitor : (data?.driver?.role === 'monitor');
  const roleDisplayName = isDriver ? 'Conductor' : isMonitor ? 'Monitor' : 'Admin';

  // Loading state
  if (loading) {
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
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Greeting Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">
          {getGreeting()}, {user?.name || data.driver.name}
        </h1>
        <p className="text-sm text-gray-600 flex items-center gap-2 mt-1">
          <Calendar className="w-4 h-4" />
          Hoy: {formatDate(new Date().toISOString())}
          <span className="mx-2">|</span>
          <span className="text-primary font-medium">{roleDisplayName}</span>
        </p>
      </div>

      {/* Role-specific Card */}
      {isDriver && (
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
              <p className="text-2xl font-bold text-green-600">0</p>
              <p className="text-xs text-gray-600">Abordados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">28</p>
              <p className="text-xs text-gray-600">Esperados</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-400">0</p>
              <p className="text-xs text-gray-600">Ausentes</p>
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

        {data.todayTrips.length === 0 ? (
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
      <WeeklyStats stats={data.weeklyStats} />

      {/* Recent Notifications */}
      <NotificationList
        notifications={data.recentNotifications}
        limit={3}
      />
    </div>
  );
}
