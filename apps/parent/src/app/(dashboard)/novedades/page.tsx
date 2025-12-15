'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle,
  XCircle,
  UserMinus,
  Car,
  MapPin,
  Loader2,
  ChevronRight,
} from 'lucide-react';
import { useMyNovedades, useNovedadesMutations } from '@/hooks';
import { cn } from '@/lib/utils';

// Type icons mapping
const typeIcons: Record<string, React.ElementType> = {
  absence: UserMinus,
  parent_pickup: Car,
  stop_change: MapPin,
  early_pickup: Clock,
  late_arrival: Clock,
};

// Status colors
const statusColors: Record<string, { bg: string; text: string; label: string }> = {
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pendiente' },
  acknowledged: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Recibida' },
  applied: { bg: 'bg-green-100', text: 'text-green-700', label: 'Aplicada' },
  cancelled: { bg: 'bg-gray-100', text: 'text-gray-500', label: 'Cancelada' },
  expired: { bg: 'bg-red-100', text: 'text-red-700', label: 'Expirada' },
};

// Type labels
const typeLabels: Record<string, string> = {
  absence: 'Ausencia',
  parent_pickup: 'Recoge padre',
  stop_change: 'Cambio de parada',
  early_pickup: 'Salida temprana',
  late_arrival: 'Llegada tarde',
};

export default function NovedadesPage() {
  const { novedades, isLoading, isEmpty } = useMyNovedades({ limit: 50 });
  const { cancelNovedad } = useNovedadesMutations();
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const handleCancel = async (novedadId: string) => {
    if (!confirm('¿Estás seguro de cancelar esta novedad?')) return;

    setCancellingId(novedadId);
    try {
      await cancelNovedad(novedadId as any);
    } catch (error: any) {
      alert(error.message || 'Error al cancelar la novedad');
    } finally {
      setCancellingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-gray-500">Cargando novedades...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Novedades</h1>
          <p className="text-sm text-gray-600 mt-1">
            Reporta ausencias, cambios de parada y otras novedades
          </p>
        </div>
        <Link
          href="/novedades/create"
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva Novedad
        </Link>
      </div>

      {/* Empty State */}
      {isEmpty ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Sin novedades registradas
          </h3>
          <p className="text-gray-500 mb-6">
            Puedes reportar ausencias, cambios de parada y otras novedades para tus hijos.
          </p>
          <Link
            href="/novedades/create"
            className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Crear primera novedad
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {novedades.map((novedad: any) => {
            const TypeIcon = typeIcons[novedad.type] || AlertCircle;
            const statusStyle = statusColors[novedad.status as keyof typeof statusColors] ?? { bg: 'bg-gray-100', text: 'text-gray-500', label: novedad.status };
            const canCancel = novedad.status === 'pending' || novedad.status === 'acknowledged';

            return (
              <div
                key={novedad._id}
                className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* Type Icon */}
                  <div className={cn(
                    'p-3 rounded-lg',
                    novedad.status === 'cancelled' ? 'bg-gray-100' : 'bg-primary/10'
                  )}>
                    <TypeIcon className={cn(
                      'w-5 h-5',
                      novedad.status === 'cancelled' ? 'text-gray-400' : 'text-primary'
                    )} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className={cn(
                        'font-semibold',
                        novedad.status === 'cancelled' ? 'text-gray-400' : 'text-gray-900'
                      )}>
                        {typeLabels[novedad.type] || novedad.type}
                      </h3>
                      <span className={cn(
                        'px-2 py-0.5 text-xs font-medium rounded-full',
                        statusStyle.bg,
                        statusStyle.text
                      )}>
                        {statusStyle.label}
                      </span>
                    </div>

                    <p className="text-sm text-gray-600 mt-1">
                      <span className="font-medium">{novedad.studentName}</span>
                      {' - '}
                      {novedad.reason}
                    </p>

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(novedad.date + 'T12:00:00').toLocaleDateString('es-EC', {
                          weekday: 'short',
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="flex items-center gap-1">
                        {novedad.affectedRouteType === 'both' ? 'Ida y vuelta' :
                         novedad.affectedRouteType === 'pickup' ? 'Solo ida' : 'Solo vuelta'}
                      </span>
                      {novedad.acknowledgedAt && (
                        <span className="flex items-center gap-1 text-green-600">
                          <CheckCircle className="w-3.5 h-3.5" />
                          Recibida por crew
                        </span>
                      )}
                    </div>

                    {/* Stop change info */}
                    {novedad.type === 'stop_change' && novedad.newStopName && (
                      <div className="mt-2 p-2 bg-blue-50 rounded-lg text-sm text-blue-700">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Parada temporal: {novedad.newStopName}
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {canCancel && (
                      <button
                        onClick={() => handleCancel(novedad._id)}
                        disabled={cancellingId === novedad._id}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        title="Cancelar novedad"
                      >
                        {cancellingId === novedad._id ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
        <h4 className="font-medium text-blue-900 flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          Importante
        </h4>
        <ul className="mt-2 text-sm text-blue-700 space-y-1">
          <li>- Las ausencias pueden reportarse hasta el dia anterior</li>
          <li>- Los cambios de parada requieren minimo 48 horas de anticipacion</li>
          <li>- El crew recibira una notificacion y confirmara la novedad</li>
        </ul>
      </div>
    </div>
  );
}
