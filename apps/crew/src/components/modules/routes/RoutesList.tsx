'use client';

import { Route } from 'lucide-react';
import { EmptyState, LoadingState } from '@/components/core';
import { RouteCard, type RouteForTodayDisplay } from '../dashboard/RouteCard';

interface RoutesListProps {
  routes: RouteForTodayDisplay[];
  isLoading?: boolean;
  filter?: 'all' | 'pickup' | 'dropoff';
}

export function RoutesList({ routes, isLoading, filter = 'all' }: RoutesListProps) {
  if (isLoading) {
    return <LoadingState message="Cargando rutas..." />;
  }

  const filteredRoutes = filter === 'all'
    ? routes
    : routes.filter(r => r.type === filter);

  if (filteredRoutes.length === 0) {
    return (
      <EmptyState
        icon={Route}
        title="No hay rutas"
        description={filter === 'all'
          ? "No tienes rutas asignadas."
          : `No hay rutas de ${filter === 'pickup' ? 'recogida' : 'entrega'}.`
        }
      />
    );
  }

  return (
    <div className="space-y-3">
      {filteredRoutes.map((route, index) => (
        <RouteCard
          key={route._id}
          route={route}
          variant={index === 0 ? 'primary' : 'secondary'}
        />
      ))}
    </div>
  );
}
