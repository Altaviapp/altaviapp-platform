'use client';

import {
  Navigation,
  Bus,
  GraduationCap,
  Users,
  MapPin,
  AlertTriangle,
} from 'lucide-react';
import { StatsGrid, type StatItem } from '@/components/shared';
import { UpcomingTripsCard, RecentAlertsCard } from '@/components/modules/dashboard';
import {
  useConvexAuth,
  useActiveAndUpcomingTrips,
  useVehicles,
  useStudents,
  useDrivers,
  useRoutes,
  useIncidents,
} from '@/hooks';

/**
 * Dashboard Page
 *
 * Main landing page showing real-time metrics and activity.
 * All data is filtered by institutionId from Convex.
 *
 * PRD Reference: Dashboard Module
 * - 6 key metrics grid
 * - Active trips section (top 3)
 * - Recent alerts section (last 3 incidents)
 */
export default function DashboardPage() {
  const { isLoading: authLoading } = useConvexAuth();

  // Real data from Convex - all filtered by institution
  const { trips: upcomingTrips, isLoading: tripsLoading } = useActiveAndUpcomingTrips();
  const { vehicles, isLoading: vehiclesLoading } = useVehicles({ status: 'active' });
  const { students, isLoading: studentsLoading } = useStudents();
  const { drivers, isLoading: driversLoading } = useDrivers({ isActive: true });
  const { routes, isLoading: routesLoading } = useRoutes();
  const { incidents, isLoading: incidentsLoading } = useIncidents();

  const isLoading =
    authLoading ||
    tripsLoading ||
    vehiclesLoading ||
    studentsLoading ||
    driversLoading ||
    routesLoading ||
    incidentsLoading;

  // Calculate open incidents count
  const openIncidentsCount = incidents.filter((i) => i.status === 'open').length;

  // Count active trips from upcoming trips
  const activeTripsCount = upcomingTrips.filter((t) => t.type === 'active').length;

  // Build stats array for StatsGrid
  const stats: StatItem[] = [
    {
      label: 'Viajes Activos',
      value: activeTripsCount,
      icon: Navigation,
      color: 'info',
    },
    {
      label: 'Vehículos Activos',
      value: vehicles.length,
      icon: Bus,
      color: 'default',
    },
    {
      label: 'Estudiantes',
      value: students.length,
      icon: GraduationCap,
      color: 'success',
    },
    {
      label: 'Conductores Activos',
      value: drivers.length,
      icon: Users,
      color: 'warning',
    },
    {
      label: 'Rutas Activas',
      value: routes.length,
      icon: MapPin,
      color: 'info',
    },
    {
      label: 'Incidentes Abiertos',
      value: openIncidentsCount,
      icon: AlertTriangle,
      color: openIncidentsCount > 0 ? 'danger' : 'success',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid - 6 key metrics */}
      <StatsGrid stats={stats} isLoading={isLoading} columns={6} />

      {/* Two column layout for cards */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Active and Upcoming Trips Section */}
        <UpcomingTripsCard trips={upcomingTrips} isLoading={tripsLoading} />

        {/* Recent Alerts Section */}
        <RecentAlertsCard incidents={incidents} isLoading={incidentsLoading} />
      </div>
    </div>
  );
}
