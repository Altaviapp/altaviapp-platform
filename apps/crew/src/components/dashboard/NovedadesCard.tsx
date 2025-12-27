'use client';

import { AlertTriangle, UserX, Users, MapPin, Clock, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { NovedadSummary, NovedadForDashboard } from '@/hooks';

interface NovedadesCardProps {
  novedades: NovedadForDashboard[];
  summary: NovedadSummary;
  isLoading?: boolean;
}

const typeConfig: Record<string, { icon: typeof AlertTriangle; label: string; color: string }> = {
  absence: { icon: UserX, label: 'Ausencia', color: 'text-red-600 bg-red-50' },
  parent_pickup: { icon: Users, label: 'Recoge padre', color: 'text-orange-600 bg-orange-50' },
  stop_change: { icon: MapPin, label: 'Cambio parada', color: 'text-blue-600 bg-blue-50' },
  early_pickup: { icon: Clock, label: 'Recogida temprana', color: 'text-purple-600 bg-purple-50' },
  late_arrival: { icon: Clock, label: 'Llegada tarde', color: 'text-yellow-600 bg-yellow-50' },
};

export function NovedadesCard({ novedades, summary, isLoading }: NovedadesCardProps) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </div>
    );
  }

  // No novedades
  if (summary.total === 0) {
    return (
      <div className="bg-green-50 rounded-xl border border-green-200 p-4">
        <div className="flex items-center gap-2 text-green-700">
          <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <p className="font-medium">Sin novedades para hoy</p>
            <p className="text-sm text-green-600">Todos los estudiantes viajan normalmente</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4">
      {/* Header with summary */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-warning" />
          Novedades de Hoy
        </h3>
        <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
          {summary.total} {summary.total === 1 ? 'novedad' : 'novedades'}
        </span>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {summary.absences > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700">
            <UserX className="w-3 h-3" />
            {summary.absences} ausencia{summary.absences !== 1 ? 's' : ''}
          </span>
        )}
        {summary.parentPickups > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700">
            <Users className="w-3 h-3" />
            {summary.parentPickups} recoge padre
          </span>
        )}
        {summary.stopChanges > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
            <MapPin className="w-3 h-3" />
            {summary.stopChanges} cambio{summary.stopChanges !== 1 ? 's' : ''} de parada
          </span>
        )}
        {summary.other > 0 && (
          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-gray-50 text-gray-700">
            <Clock className="w-3 h-3" />
            {summary.other} otra{summary.other !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* List of novedades (max 3) */}
      <div className="space-y-2">
        {novedades.slice(0, 3).map((novedad) => {
          const config = typeConfig[novedad.type] ?? typeConfig.absence!;
          const Icon = config.icon;

          return (
            <div
              key={novedad._id}
              className="flex items-center gap-3 p-2 rounded-lg bg-gray-50"
            >
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', config.color)}>
                <Icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {novedad.studentName}
                </p>
                <p className="text-xs text-gray-500 truncate">
                  {config.label} - {novedad.routeName}
                </p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 flex-shrink-0" />
            </div>
          );
        })}
      </div>

      {/* Show more link if more than 3 */}
      {novedades.length > 3 && (
        <button className="w-full mt-3 text-sm text-primary hover:text-primary/80 font-medium text-center py-2">
          Ver todas las novedades ({novedades.length})
        </button>
      )}
    </div>
  );
}
