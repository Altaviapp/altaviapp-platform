'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import {
  Plus,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Loader2,
  FileText,
  UserMinus,
  Car,
  MapPin,
  AlertCircle,
  Paperclip,
} from 'lucide-react';
import { useMyNovedades, useNovedadTypes } from '@/hooks';
import { LoadingState, EmptyState, Card, CardContent, Button, Badge } from '@/components/core';
import { PageHeader } from '@/components/shared';
import { cn } from '@/lib/utils';
import type { Id } from '../../../../../../convex/_generated/dataModel';

/**
 * Novedades List Page
 *
 * Shows all novedades created by the parent with status
 * and ability to create new ones.
 */

// Icon mapping for dynamic types
const ICON_MAP: Record<string, React.ElementType> = {
  UserMinus,
  Car,
  MapPin,
  Clock,
  AlertCircle,
  FileText,
  Calendar,
};

// Fallback icons for legacy types
const LEGACY_TYPE_CONFIG: Record<string, { label: string; icon: React.ElementType; color: string }> = {
  absence: { label: 'Ausencia', icon: UserMinus, color: 'text-red-600 bg-red-50' },
  parent_pickup: { label: 'Recoge Padre', icon: Car, color: 'text-blue-600 bg-blue-50' },
  stop_change: { label: 'Cambio Parada', icon: MapPin, color: 'text-purple-600 bg-purple-50' },
  early_pickup: { label: 'Salida Temprana', icon: Clock, color: 'text-orange-600 bg-orange-50' },
  late_arrival: { label: 'Llegada Tarde', icon: AlertCircle, color: 'text-amber-600 bg-amber-50' },
};

// Status badge configuration
const STATUS_CONFIG: Record<string, { label: string; variant: 'default' | 'success' | 'warning' | 'danger' }> = {
  pending: { label: 'Pendiente', variant: 'warning' },
  approved: { label: 'Aprobada', variant: 'success' },
  rejected: { label: 'Rechazada', variant: 'danger' },
  acknowledged: { label: 'Confirmada', variant: 'success' },
  applied: { label: 'Aplicada', variant: 'default' },
  cancelled: { label: 'Cancelada', variant: 'danger' },
  expired: { label: 'Expirada', variant: 'default' },
};

// Helper to get effective date
const getEffectiveDate = (novedad: { startDate?: string; date?: string }): string => {
  return novedad.startDate || novedad.date || '';
};

// Helper to format date in Spanish
const formatDate = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr + 'T12:00:00');
  return date.toLocaleDateString('es-EC', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  });
};

export default function NovedadesPage() {
  const { novedades, isLoading } = useMyNovedades({ limit: 50 });
  const { types: novedadTypes, isLoading: typesLoading } = useNovedadTypes();

  // Create a map of typeId to type config
  const typesMap = useMemo(() => {
    const map: Record<string, { name: string; icon: string; color: string }> = {};
    novedadTypes.forEach((t) => {
      map[t._id] = { name: t.name, icon: t.icon, color: t.color };
    });
    return map;
  }, [novedadTypes]);

  // Get type display info for a novedad
  const getTypeInfo = (novedad: {
    typeId?: Id<'novedadTypes'>;
    type?: string;
  }): { label: string; Icon: React.ElementType; colorClass: string } => {
    // Check if there's a dynamic type
    if (novedad.typeId && typesMap[novedad.typeId]) {
      const typeConfig = typesMap[novedad.typeId]!;
      const Icon = ICON_MAP[typeConfig.icon] ?? FileText;
      return {
        label: typeConfig.name,
        Icon,
        colorClass: `text-${typeConfig.color}-600 bg-${typeConfig.color}-50`,
      };
    }

    // Fallback to legacy type
    if (novedad.type && LEGACY_TYPE_CONFIG[novedad.type]) {
      const legacy = LEGACY_TYPE_CONFIG[novedad.type]!;
      return {
        label: legacy.label,
        Icon: legacy.icon,
        colorClass: legacy.color,
      };
    }

    // Default
    return {
      label: 'Novedad',
      Icon: FileText,
      colorClass: 'text-gray-600 bg-gray-50',
    };
  };

  // Group novedades by status
  const grouped = useMemo(() => {
    const pending = novedades.filter((n) => n.status === 'pending');
    const upcoming = novedades.filter((n) =>
      ['approved', 'acknowledged'].includes(n.status) && getEffectiveDate(n) >= new Date().toISOString().split('T')[0]!
    );
    const past = novedades.filter((n) =>
      !['pending'].includes(n.status) && getEffectiveDate(n) < new Date().toISOString().split('T')[0]!
    );
    const other = novedades.filter((n) =>
      ['rejected', 'cancelled', 'expired', 'applied'].includes(n.status)
    );

    return { pending, upcoming, past, other };
  }, [novedades]);

  if (isLoading || typesLoading) {
    return (
      <div className="space-y-4 pb-20">
        <PageHeader
          title="Novedades"
          subtitle="Gestiona las novedades de tus hijos"
          backHref="/inicio"
        />
        <LoadingState message="Cargando novedades..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <PageHeader
        title="Novedades"
        subtitle="Gestiona las novedades de tus hijos"
        backHref="/inicio"
      />

      {/* Create Button */}
      <Link href="/novedades/create">
        <Button variant="primary" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Nueva Novedad
        </Button>
      </Link>

      {novedades.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="Sin novedades"
          description="No tienes novedades registradas. Crea una para reportar ausencias o cambios."
          action={{
            label: 'Crear Novedad',
            href: '/novedades/create',
          }}
        />
      ) : (
        <>
          {/* Pending Section */}
          {grouped.pending.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Pendientes de Aprobación ({grouped.pending.length})
              </h2>
              <div className="space-y-3">
                {grouped.pending.map((novedad) => {
                  const typeInfo = getTypeInfo(novedad);
                  const status = STATUS_CONFIG[novedad.status] ?? STATUS_CONFIG.pending!;
                  const hasAttachments = novedad.attachments && novedad.attachments.length > 0;

                  return (
                    <Card key={novedad._id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn('p-2 rounded-lg', typeInfo.colorClass.split(' ')[1])}>
                            <typeInfo.Icon className={cn('w-5 h-5', typeInfo.colorClass.split(' ')[0])} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-gray-900">{typeInfo.label}</span>
                              <Badge variant={status.variant}>{status.label}</Badge>
                              {hasAttachments && (
                                <span className="flex items-center gap-1 text-xs text-gray-500">
                                  <Paperclip className="w-3 h-3" />
                                  {novedad.attachments!.length}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {novedad.studentName}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(getEffectiveDate(novedad))}</span>
                            </div>
                            <p className="text-sm text-gray-500 mt-1 truncate">
                              {novedad.reason}
                            </p>
                          </div>
                          <Loader2 className="w-5 h-5 text-warning animate-spin flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Upcoming Section */}
          {grouped.upcoming.length > 0 && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Próximas ({grouped.upcoming.length})
              </h2>
              <div className="space-y-3">
                {grouped.upcoming.map((novedad) => {
                  const typeInfo = getTypeInfo(novedad);
                  const status = STATUS_CONFIG[novedad.status] ?? STATUS_CONFIG.approved!;

                  return (
                    <Card key={novedad._id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn('p-2 rounded-lg', typeInfo.colorClass.split(' ')[1])}>
                            <typeInfo.Icon className={cn('w-5 h-5', typeInfo.colorClass.split(' ')[0])} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-gray-900">{typeInfo.label}</span>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </div>
                            <p className="text-sm text-gray-600 mt-1">
                              {novedad.studentName}
                            </p>
                            <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                              <Calendar className="w-4 h-4" />
                              <span>{formatDate(getEffectiveDate(novedad))}</span>
                            </div>
                          </div>
                          <CheckCircle className="w-5 h-5 text-success flex-shrink-0" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {/* Past/Other Section */}
          {(grouped.past.length > 0 || grouped.other.length > 0) && (
            <section>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Historial
              </h2>
              <div className="space-y-3">
                {[...grouped.past, ...grouped.other].slice(0, 10).map((novedad) => {
                  const typeInfo = getTypeInfo(novedad);
                  const status = STATUS_CONFIG[novedad.status] ?? STATUS_CONFIG.applied!;

                  return (
                    <Card key={novedad._id} className="opacity-75">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={cn('p-2 rounded-lg bg-gray-100')}>
                            <typeInfo.Icon className="w-5 h-5 text-gray-400" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="font-medium text-gray-600">{typeInfo.label}</span>
                              <Badge variant={status.variant}>{status.label}</Badge>
                            </div>
                            <p className="text-sm text-gray-500 mt-1">
                              {novedad.studentName} • {formatDate(getEffectiveDate(novedad))}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}
