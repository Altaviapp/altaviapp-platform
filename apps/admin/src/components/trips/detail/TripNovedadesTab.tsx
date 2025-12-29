'use client';

import { CalendarX, Loader2, CheckCircle, XCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Novedad {
  _id: string;
  type: string;
  typeLabel?: string;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled' | 'expired' | 'acknowledged' | 'applied';
  reason?: string;
  studentName?: string;
  createdAt?: number;
}

interface TripNovedadesTabProps {
  novedades: Novedad[];
  isLoading?: boolean;
  onApprove?: (novedadId: string) => void;
  onReject?: (novedadId: string) => void;
  className?: string;
}

const novedadTypeConfig: Record<string, {
  label: string;
  bgColor: string;
  iconColor: string;
}> = {
  absence: { label: 'Ausencia', bgColor: 'bg-red-100', iconColor: 'text-red-600' },
  stop_change: { label: 'Cambio de parada', bgColor: 'bg-blue-100', iconColor: 'text-blue-600' },
  parent_pickup: { label: 'Recoge padre', bgColor: 'bg-orange-100', iconColor: 'text-orange-600' },
  early_pickup: { label: 'Recogida anticipada', bgColor: 'bg-yellow-100', iconColor: 'text-yellow-600' },
  delay: { label: 'Retraso', bgColor: 'bg-purple-100', iconColor: 'text-purple-600' },
  other: { label: 'Otro', bgColor: 'bg-gray-100', iconColor: 'text-gray-600' },
};

const statusConfig: Record<string, {
  label: string;
  bgColor: string;
  textColor: string;
}> = {
  pending: { label: 'Pendiente', bgColor: 'bg-yellow-100', textColor: 'text-yellow-700' },
  approved: { label: 'Aprobada', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  rejected: { label: 'Rechazada', bgColor: 'bg-red-100', textColor: 'text-red-700' },
  cancelled: { label: 'Cancelada', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  expired: { label: 'Expirada', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
  acknowledged: { label: 'Recibida', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  applied: { label: 'Aplicada', bgColor: 'bg-green-100', textColor: 'text-green-700' },
};

export function TripNovedadesTab({
  novedades,
  isLoading,
  onApprove,
  onReject,
  className,
}: TripNovedadesTabProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-gray-500">Cargando novedades...</span>
      </div>
    );
  }

  if (novedades.length === 0) {
    return (
      <div className={cn('bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden', className)}>
        <div className="p-4 border-b border-gray-200">
          <h3 className="font-semibold text-gray-900">Novedades del Viaje</h3>
          <p className="text-sm text-gray-500">Cambios y excepciones reportados para este viaje</p>
        </div>
        <div className="p-12 text-center">
          <CalendarX className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Sin novedades</p>
          <p className="text-sm text-gray-400">No hay cambios reportados para este viaje</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden', className)}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Novedades del Viaje</h3>
            <p className="text-sm text-gray-500">
              {novedades.filter(n => n.status === 'pending').length} pendientes de {novedades.length} total
            </p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100 max-h-[500px] overflow-y-auto">
        {novedades.map((novedad) => {
          const typeConfig = novedadTypeConfig[novedad.type] ?? novedadTypeConfig.other;
          const status = statusConfig[novedad.status] ?? statusConfig.pending;

          return (
            <div key={novedad._id} className="p-4 hover:bg-gray-50">
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                  typeConfig?.bgColor ?? 'bg-gray-100'
                )}>
                  <CalendarX className={cn('w-5 h-5', typeConfig?.iconColor ?? 'text-gray-600')} />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-gray-900">
                      {novedad.studentName || 'Estudiante'}
                    </p>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-xs font-medium',
                      status?.bgColor ?? 'bg-gray-100',
                      status?.textColor ?? 'text-gray-700'
                    )}>
                      {status?.label ?? novedad.status}
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 mt-1">
                    {novedad.typeLabel || typeConfig?.label || novedad.type}
                  </p>

                  {novedad.reason && (
                    <p className="text-sm text-gray-500 mt-1">{novedad.reason}</p>
                  )}

                  {/* Actions for pending novedades */}
                  {novedad.status === 'pending' && (onApprove || onReject) && (
                    <div className="flex items-center gap-2 mt-3">
                      {onApprove && (
                        <button
                          onClick={() => onApprove(novedad._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-sm font-medium"
                        >
                          <CheckCircle className="w-4 h-4" />
                          Aprobar
                        </button>
                      )}
                      {onReject && (
                        <button
                          onClick={() => onReject(novedad._id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-sm font-medium"
                        >
                          <XCircle className="w-4 h-4" />
                          Rechazar
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="text-right text-xs text-gray-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {novedad.createdAt
                    ? new Date(novedad.createdAt).toLocaleTimeString('es-EC', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--:--'}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
