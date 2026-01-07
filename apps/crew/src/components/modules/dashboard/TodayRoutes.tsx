'use client';

import { Route } from 'lucide-react';
import { Card, CardHeader, EmptyState } from '@/components/core';
import { RouteCard, type RouteForTodayDisplay } from './RouteCard';

interface TodayRoutesProps {
  routes: RouteForTodayDisplay[];
  isLoading?: boolean;
}

export function TodayRoutes({ routes, isLoading }: TodayRoutesProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-lg border border-gray-200 p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
            <div className="h-6 bg-gray-200 rounded w-2/3 mb-3" />
            <div className="space-y-2">
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-3">
        <Route className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-semibold text-gray-900">Viajes Para Hoy</h2>
      </div>

      {!routes || routes.length === 0 ? (
        <EmptyState
          icon={Route}
          title="No hay viajes programados"
          description="No tienes viajes asignados para hoy."
        />
      ) : (
        <div className="space-y-3">
          {routes.map((route, index) => (
            <RouteCard
              key={route._id}
              route={route}
              variant={index === 0 ? 'primary' : 'secondary'}
            />
          ))}
        </div>
      )}
    </section>
  );
}
