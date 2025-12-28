'use client';

import { AlertTriangle, UserX, Users, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Card, Badge } from '@/components/core';
import { NOVEDAD_TYPE_CONFIG } from '@/lib/constants';
import { cn } from '@/lib/utils';

interface NovedadSummary {
  total: number;
  absences: number;
  parentPickups: number;
  stopChanges: number;
  other: number;
}

interface NovedadForDashboard {
  _id: string;
  type: string;
  studentName: string;
  routeName: string;
}

interface NovedadesCardProps {
  novedades: NovedadForDashboard[];
  summary: NovedadSummary;
  isLoading?: boolean;
}

export function NovedadesCard({ novedades, summary, isLoading }: NovedadesCardProps) {
  if (isLoading) {
    return (
      <Card padding="md" className="animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-1/3 mb-4" />
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
        </div>
      </Card>
    );
  }

  // No novedades - success state
  if (summary.total === 0) {
    return (
      <div className="bg-green-50 rounded-lg border border-green-200 p-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5 text-green-600" />
          </div>
          <div>
            <p className="font-medium text-green-800">Sin novedades para hoy</p>
            <p className="text-sm text-green-600">Todos los estudiantes viajan normalmente</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Card padding="md">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-yellow-500" />
          <h3 className="font-semibold text-gray-900">Novedades de Hoy</h3>
        </div>
        <Badge variant="warning" size="sm">
          {summary.total} {summary.total === 1 ? 'novedad' : 'novedades'}
        </Badge>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-2 mb-4">
        {summary.absences > 0 && (
          <Badge variant="danger" size="sm" icon={UserX}>
            {summary.absences} ausencia{summary.absences !== 1 ? 's' : ''}
          </Badge>
        )}
        {summary.parentPickups > 0 && (
          <Badge variant="warning" size="sm" icon={Users}>
            {summary.parentPickups} recoge padre
          </Badge>
        )}
        {summary.stopChanges > 0 && (
          <Badge variant="info" size="sm" icon={MapPin}>
            {summary.stopChanges} cambio{summary.stopChanges !== 1 ? 's' : ''} parada
          </Badge>
        )}
        {summary.other > 0 && (
          <Badge variant="default" size="sm" icon={Clock}>
            {summary.other} otra{summary.other !== 1 ? 's' : ''}
          </Badge>
        )}
      </div>

      {/* List of novedades (max 3) */}
      <div className="space-y-2">
        {novedades.slice(0, 3).map((novedad) => {
          const config = NOVEDAD_TYPE_CONFIG[novedad.type as keyof typeof NOVEDAD_TYPE_CONFIG];
          if (!config) return null;

          return (
            <div
              key={novedad._id}
              className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 min-h-[56px]"
            >
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0', config.color)}>
                <UserX className="w-4 h-4" />
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

      {/* Show more link */}
      {novedades.length > 3 && (
        <button className="w-full mt-3 text-sm text-primary hover:text-primary/80 font-medium text-center py-2 min-h-[44px]">
          Ver todas ({novedades.length})
        </button>
      )}
    </Card>
  );
}
