'use client';

import Link from 'next/link';
import {
  Bell,
  ArrowRight,
  CheckCircle2,
  User,
  Calendar,
  Clock,
  UserMinus,
  Car,
  MapPin,
  Stethoscope,
  FileText,
} from 'lucide-react';
import { Card, Badge, LoadingState, EmptyState } from '@/components/core';
import { cn } from '@/lib/utils';

interface PendingNovedad {
  _id: string;
  studentName: string;
  studentGrade?: string;
  type?: string;
  typeLabel?: string;
  reason?: string;
  createdByName?: string;
  startDate?: string;
  date?: string;
  createdAt: number;
  status: string;
}

interface PendingNovedadesCardProps {
  novedades: PendingNovedad[];
  count: number;
  isLoading: boolean;
}

// Icon mapping for common novedad types
const TYPE_ICONS: Record<string, React.ElementType> = {
  absence: UserMinus,
  parent_pickup: Car,
  stop_change: MapPin,
  stop_change_temp: MapPin,
  medical_leave: Stethoscope,
  early_pickup: Clock,
  late_arrival: Clock,
};

const TYPE_COLORS: Record<string, string> = {
  absence: 'text-red-600 bg-red-100',
  parent_pickup: 'text-blue-600 bg-blue-100',
  stop_change: 'text-purple-600 bg-purple-100',
  stop_change_temp: 'text-purple-600 bg-purple-100',
  medical_leave: 'text-red-600 bg-red-100',
  early_pickup: 'text-orange-600 bg-orange-100',
  late_arrival: 'text-yellow-600 bg-yellow-100',
};

export function PendingNovedadesCard({ novedades, count, isLoading }: PendingNovedadesCardProps) {
  const formatTimeAgo = (timestamp: number) => {
    const hours = Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
    if (hours < 1) return 'Hace momentos';
    if (hours < 24) return `Hace ${hours}h`;
    const days = Math.floor(hours / 24);
    return `Hace ${days} ${days === 1 ? 'día' : 'días'}`;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-EC', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  return (
    <Card padding="none" className="overflow-hidden">
      <div className="flex items-center justify-between p-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold text-gray-900">
            Novedades Pendientes
          </h2>
          {count > 0 && (
            <Badge variant="warning" dot>
              {count}
            </Badge>
          )}
        </div>
        <Link
          href="/requests"
          className="text-sm text-primary hover:text-primary/80 flex items-center gap-1 font-medium transition-colors"
        >
          Gestionar
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {isLoading ? (
        <LoadingState message="Cargando novedades..." size="sm" />
      ) : novedades.length === 0 ? (
        <EmptyState
          icon={CheckCircle2}
          title="Sin novedades pendientes"
          description="Todas las novedades han sido procesadas"
        />
      ) : (
        <div className="divide-y divide-gray-100">
          {novedades.slice(0, 3).map((novedad) => {
            const Icon = novedad.type ? (TYPE_ICONS[novedad.type] ?? FileText) : FileText;
            const colorClass = novedad.type ? (TYPE_COLORS[novedad.type] ?? 'text-gray-600 bg-gray-100') : 'text-gray-600 bg-gray-100';
            const effectiveDate = novedad.startDate || novedad.date;

            return (
              <Link
                key={novedad._id}
                href="/requests"
                className="p-4 flex items-start gap-3 hover:bg-gray-50 transition-colors block"
              >
                <div className={cn('p-2 rounded-full flex-shrink-0', colorClass)}>
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {novedad.studentName}
                    </p>
                    {novedad.studentGrade && (
                      <span className="text-xs text-gray-500">
                        {novedad.studentGrade}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 mt-0.5">
                    {novedad.typeLabel || novedad.type}
                  </p>
                  <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                    {effectiveDate && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDate(effectiveDate)}
                      </span>
                    )}
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTimeAgo(novedad.createdAt)}
                    </span>
                  </div>
                </div>
                <Badge variant="warning" className="flex-shrink-0">
                  Pendiente
                </Badge>
              </Link>
            );
          })}

          {/* View all button if more than 3 */}
          {count > 3 && (
            <div className="p-3 bg-amber-50">
              <Link
                href="/requests"
                className="w-full flex items-center justify-center gap-2 py-2 px-4 bg-amber-500 text-white rounded-lg hover:bg-amber-600 transition-colors font-medium text-sm"
              >
                <Bell className="w-4 h-4" />
                Ver {count - 3} novedades más
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
