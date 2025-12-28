'use client';

import { AlertCircle } from 'lucide-react';
import { LoadingState, EmptyState, ErrorState } from '@/components/core';
import { GreetingHeader, TodayStats, TodayRoutes, NovedadesCard } from '@/components/modules/dashboard';
import { WeeklyStats } from '@/components/dashboard/WeeklyStats';
import { NotificationList } from '@/components/dashboard/NotificationList';
import { useConvexDashboard, useConvexAuth, useNovedadesForDriverToday } from '@/hooks';

export default function DashboardPage() {
  const { user, isDriver, isMonitor, isLoading: authLoading } = useConvexAuth();
  const { data, routesForToday, loading, error } = useConvexDashboard();
  const { novedades, summary: novedadesSummary, isLoading: novedadesLoading } = useNovedadesForDriverToday();

  const userRole = isDriver ? 'driver' : isMonitor ? 'monitor' : 'driver';

  // Loading state
  if (loading || authLoading) {
    return <LoadingState message="Cargando dashboard..." size="lg" />;
  }

  // Error state
  if (error) {
    return (
      <ErrorState
        title="Error al cargar datos"
        message={error}
        onRetry={() => window.location.reload()}
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
    <div className="space-y-4 pb-20">
      {/* Greeting Header */}
      <GreetingHeader
        name={user?.name || 'Usuario'}
        role={userRole as 'driver' | 'monitor'}
      />

      {/* Today Stats */}
      <TodayStats
        completed={data.weeklyStats?.tripsCompleted ?? 0}
        scheduled={data.todayTrips?.length ?? 0}
        studentsTransported={data.weeklyStats?.studentsTransported ?? 0}
      />

      {/* Novedades */}
      <NovedadesCard
        novedades={novedades}
        summary={novedadesSummary}
        isLoading={novedadesLoading}
      />

      {/* Today's Routes */}
      <TodayRoutes
        routes={routesForToday || []}
        isLoading={loading}
      />

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
