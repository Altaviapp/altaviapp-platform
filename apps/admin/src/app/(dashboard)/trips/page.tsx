'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Bus, MapPin, Clock, Eye, RefreshCw, AlertTriangle, CheckCircle, Play, FileText } from 'lucide-react';
import { Badge, Card, CardHeader, CardContent } from '@/components/core';
import { PageHeader, StatsGrid, DataTable, type Column, type StatItem } from '@/components/shared';
import { LoadingState, EmptyState } from '@/components/core/states';
import { useTodaysTrips, useTrips, useTripMutations, usePendingNovedades, useNovedades } from '@/hooks';
import { cn } from '@/lib/utils';

/**
 * Trips Page
 *
 * Real-time monitoring of all trips.
 * Features: active trips, scheduled trips, auto-refresh toggle.
 *
 * PRD Reference: Trips Module
 */

const STATUS_CONFIG: Record<string, { label: string; variant: 'success' | 'warning' | 'danger' | 'default' | 'info'; icon: typeof Bus }> = {
  in_progress: { label: 'En Ruta', variant: 'success', icon: Bus },
  scheduled: { label: 'Programado', variant: 'warning', icon: Clock },
  completed: { label: 'Completado', variant: 'default', icon: CheckCircle },
  cancelled: { label: 'Cancelado', variant: 'danger', icon: AlertTriangle },
};

// Helper to get effective date from novedad
const getNovedadDate = (novedad: { startDate?: string; date?: string }): string => {
  return novedad.startDate || novedad.date || '';
};

export default function TripsPage() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Real data from Convex
  const { trips: todaysTrips, isLoading } = useTodaysTrips();
  const { trips: scheduledTrips, isLoading: scheduledLoading } = useTrips({ status: 'scheduled' });
  const { startTrip } = useTripMutations();

  // Get novedades for badge indicators
  const { novedades: pendingNovedades } = usePendingNovedades();
  const { novedades: approvedNovedades } = useNovedades({ status: 'approved' });

  // Create a map of date -> novedades counts
  const novedadesByDate = useMemo(() => {
    const dateMap: Record<string, { pending: number; approved: number }> = {};

    // Count pending novedades by date
    pendingNovedades.forEach((n) => {
      const date = getNovedadDate(n);
      if (date) {
        if (!dateMap[date]) {
          dateMap[date] = { pending: 0, approved: 0 };
        }
        dateMap[date]!.pending++;
      }
    });

    // Count approved novedades by date
    approvedNovedades.forEach((n) => {
      const date = getNovedadDate(n);
      if (date) {
        if (!dateMap[date]) {
          dateMap[date] = { pending: 0, approved: 0 };
        }
        dateMap[date]!.approved++;
      }
    });

    return dateMap;
  }, [pendingNovedades, approvedNovedades]);

  // Helper to get novedades count for a trip
  const getNovedadesForTrip = (tripDate: string | undefined): { pending: number; approved: number; total: number } => {
    if (!tripDate) return { pending: 0, approved: 0, total: 0 };
    const counts = novedadesByDate[tripDate];
    if (!counts) return { pending: 0, approved: 0, total: 0 };
    return { ...counts, total: counts.pending + counts.approved };
  };

  // Calculate stats
  const stats: StatItem[] = useMemo(() => {
    const active = todaysTrips.filter((t) => t.status === 'in_progress').length;
    const completed = todaysTrips.filter((t) => t.status === 'completed').length;
    const cancelled = todaysTrips.filter((t) => t.status === 'cancelled').length;
    const scheduled = scheduledTrips.length;

    return [
      { label: 'Viajes Activos', value: active, icon: Bus, color: 'success' },
      { label: 'Completados Hoy', value: completed, icon: CheckCircle, color: 'default' },
      { label: 'Cancelados', value: cancelled, icon: AlertTriangle, color: 'danger' },
      { label: 'Programados', value: scheduled, icon: Clock, color: 'warning' },
    ];
  }, [todaysTrips, scheduledTrips]);

  // Active trips (in_progress or scheduled for today)
  const activeTrips = useMemo(
    () => todaysTrips.filter((t) => t.status === 'in_progress' || t.status === 'scheduled'),
    [todaysTrips]
  );

  // Scheduled trips table columns
  const scheduledColumns: Column<(typeof scheduledTrips)[0]>[] = [
    {
      key: 'route',
      header: 'Ruta',
      render: (trip) => (
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-warning/10 flex items-center justify-center">
            <Clock className="w-5 h-5 text-warning" />
          </div>
          <div>
            <p className="font-medium text-gray-900">{trip.routeName || 'Sin ruta'}</p>
            <p className="text-sm text-gray-500">{trip.vehiclePlate || 'Sin vehículo'}</p>
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Tipo',
      render: (trip) => (
        <Badge variant={trip.routeType === 'pickup' ? 'info' : 'purple'}>
          {trip.routeType === 'pickup' ? 'Recogida' : 'Entrega'}
        </Badge>
      ),
    },
    {
      key: 'date',
      header: 'Fecha',
      render: (trip) => (
        <div className="flex items-center gap-1 text-gray-600">
          <Clock className="w-4 h-4 text-gray-400" />
          <span>{trip.scheduledDate}</span>
        </div>
      ),
    },
    {
      key: 'novedades',
      header: 'Novedades',
      render: (trip) => {
        const novedades = getNovedadesForTrip(trip.scheduledDate);
        if (novedades.total === 0) {
          return <span className="text-gray-400 text-sm">—</span>;
        }
        return (
          <Badge
            variant={novedades.pending > 0 ? 'warning' : 'info'}
            className="flex items-center gap-1"
          >
            <FileText className="w-3 h-3" />
            {novedades.total}
            {novedades.pending > 0 && (
              <span className="text-xs opacity-80">
                ({novedades.pending} pend.)
              </span>
            )}
          </Badge>
        );
      },
    },
    {
      key: 'actions',
      header: 'Acciones',
      align: 'right',
      render: (trip) => (
        <button
          onClick={(e) => {
            e.stopPropagation();
            // Would need location from browser - simplified here
            startTrip(trip._id, 0, 0);
          }}
          className="px-3 py-1.5 bg-success text-white rounded-lg hover:bg-success/90 transition-colors inline-flex items-center gap-1"
        >
          <Play className="w-4 h-4" />
          Iniciar
        </button>
      ),
    },
  ];

  const handleStartTrip = async (tripId: string) => {
    try {
      // In a real app, we'd get browser location
      await startTrip(tripId as any, 0, 0);
    } catch (error) {
      console.error('Error starting trip:', error);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <PageHeader
        title="Monitoreo de Viajes"
        subtitle="Seguimiento en tiempo real de todos los viajes"
        actions={[
          {
            label: autoRefresh ? 'Auto-actualización ON' : 'Auto-actualización OFF',
            icon: RefreshCw,
            variant: 'secondary',
            onClick: () => setAutoRefresh(!autoRefresh),
          },
        ]}
      />

      {/* Stats */}
      <StatsGrid stats={stats} isLoading={isLoading || scheduledLoading} columns={4} />

      {/* Active Trips */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Viajes en Curso</h2>
            <span className="text-sm text-gray-500">Datos en tiempo real</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <LoadingState message="Cargando viajes..." />
          ) : activeTrips.length === 0 ? (
            <EmptyState
              icon={Bus}
              title="No hay viajes activos"
              description="Los viajes programados aparecerán aquí cuando inicien"
            />
          ) : (
            <div className="divide-y divide-gray-200">
              {activeTrips.map((trip) => {
                const statusInfo = STATUS_CONFIG[trip.status ?? 'scheduled'] ?? STATUS_CONFIG.scheduled!;
                const StatusIcon = statusInfo.icon;

                return (
                  <div key={trip._id} className="p-4 hover:bg-gray-50">
                    <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                      {/* Trip Info */}
                      <div className="flex-1">
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-lg flex items-center justify-center',
                              statusInfo!.variant === 'success' && 'bg-success',
                              statusInfo!.variant === 'warning' && 'bg-warning',
                              statusInfo!.variant === 'danger' && 'bg-error',
                              statusInfo!.variant === 'default' && 'bg-gray-400'
                            )}
                          >
                            <StatusIcon className="w-5 h-5 text-white" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 flex-wrap">
                              <h3 className="font-medium text-gray-900">{trip.routeName || 'Sin ruta'}</h3>
                              <Badge variant={statusInfo!.variant}>{statusInfo!.label}</Badge>
                              {(() => {
                                const novedades = getNovedadesForTrip(trip.scheduledDate);
                                if (novedades.total === 0) return null;
                                return (
                                  <Badge
                                    variant={novedades.pending > 0 ? 'warning' : 'info'}
                                    className="flex items-center gap-1"
                                  >
                                    <FileText className="w-3 h-3" />
                                    {novedades.total} {novedades.total === 1 ? 'novedad' : 'novedades'}
                                    {novedades.pending > 0 && (
                                      <span className="text-xs opacity-80">
                                        ({novedades.pending} pendiente{novedades.pending > 1 ? 's' : ''})
                                      </span>
                                    )}
                                  </Badge>
                                );
                              })()}
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {trip.vehiclePlate || 'Sin vehículo'} •{' '}
                              {trip.routeType === 'pickup' ? 'Recogida' : 'Entrega'}
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
                        <Link
                          href={`/trips/${trip._id}`}
                          className="px-3 py-2 bg-primary/10 text-primary rounded-lg hover:bg-primary/20 transition-colors flex items-center gap-1"
                        >
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
        </CardContent>
      </Card>

      {/* Scheduled Trips */}
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-gray-900">Viajes Programados</h2>
        </CardHeader>
        <CardContent className="p-0">
          <DataTable
            columns={scheduledColumns}
            data={scheduledTrips}
            isLoading={scheduledLoading}
            keyExtractor={(t) => t._id}
            rowHref={(t) => `/trips/${t._id}`}
            emptyState={{
              icon: Clock,
              title: 'No hay viajes programados',
              description: 'Los viajes futuros aparecerán aquí',
            }}
          />
        </CardContent>
      </Card>
    </div>
  );
}
