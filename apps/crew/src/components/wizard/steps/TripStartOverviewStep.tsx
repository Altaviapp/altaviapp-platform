'use client';

import {
  Users,
  Bus,
  Clock,
  MapPin,
  AlertTriangle,
  UserX,
  UserCheck,
  MapPinned,
  Sunrise,
  Sunset,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RouteData {
  name: string;
  type: 'pickup' | 'dropoff';
  scheduledStartTime: string;
  scheduledEndTime: string;
  vehicle?: {
    licensePlate: string;
    brand?: string;
    model?: string;
  } | null;
  stops?: Array<{
    _id: string;
    name: string;
  }>;
  students?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    grade: string;
  } | null> | null;
}

interface NovedadSummary {
  total: number;
  absences: number;
  parentPickups: number;
  stopChanges: number;
  other?: number;
}

interface TripStartOverviewStepProps {
  route: RouteData;
  summary: NovedadSummary;
  novedadesLoading?: boolean;
  gpsReady: boolean;
  onNext: () => void;
  onViewStudents?: () => void;
}

export function TripStartOverviewStep({
  route,
  summary,
  novedadesLoading,
  gpsReady,
  onNext,
  onViewStudents,
}: TripStartOverviewStepProps) {
  const isPickup = route.type === 'pickup';
  const TypeIcon = isPickup ? Sunrise : Sunset;
  const hasNovedades = summary.total > 0;

  // Calculate expected students (total - absences - parent_pickups)
  const totalStudents = route.students?.length || 0;
  const expectedStudents = totalStudents - summary.absences - summary.parentPickups;

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Header */}
        <div className="text-center py-2">
          <h2 className="text-xl font-bold text-gray-900">Confirmar Inicio de Viaje</h2>
          <p className="text-sm text-gray-500 mt-1">Revisa la información antes de continuar</p>
        </div>

        {/* Route Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              'w-12 h-12 rounded-full flex items-center justify-center',
              isPickup ? 'bg-warning/10' : 'bg-info/10'
            )}>
              <TypeIcon className={cn('w-6 h-6', isPickup ? 'text-warning' : 'text-info')} />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900 text-lg">{route.name}</h3>
              <p className={cn(
                'text-sm font-medium',
                isPickup ? 'text-warning' : 'text-info'
              )}>
                {isPickup ? 'Recogida' : 'Entrega'}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{route.scheduledStartTime} - {route.scheduledEndTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
              <Users className="w-4 h-4 text-gray-400" />
              <span>{expectedStudents} estudiantes</span>
            </div>
            {route.vehicle && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                <Bus className="w-4 h-4 text-gray-400" />
                <span>{route.vehicle.licensePlate}</span>
              </div>
            )}
            {route.stops && (
              <div className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-lg p-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{route.stops.length} paradas</span>
              </div>
            )}
          </div>
        </div>

        {/* Novedades Banner */}
        {hasNovedades ? (
          <div className="bg-gradient-to-r from-warning/10 to-warning/5 rounded-xl border border-warning/30 p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-warning/20 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {summary.total} Novedad{summary.total > 1 ? 'es' : ''} para Hoy
                </h3>
                <p className="text-sm text-gray-600">
                  Debes revisar y confirmar antes de iniciar
                </p>
              </div>
            </div>

            {/* Category breakdown */}
            <div className="flex flex-wrap gap-2">
              {summary.absences > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-error/10 text-error">
                  <UserX className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {summary.absences} ausencia{summary.absences > 1 ? 's' : ''}
                  </span>
                </div>
              )}
              {summary.parentPickups > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-100 text-orange-600">
                  <UserCheck className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {summary.parentPickups} padre{summary.parentPickups > 1 ? 's' : ''} recoge{summary.parentPickups > 1 ? 'n' : ''}
                  </span>
                </div>
              )}
              {summary.stopChanges > 0 && (
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-100 text-blue-600">
                  <MapPinned className="w-4 h-4" />
                  <span className="text-sm font-medium">
                    {summary.stopChanges} cambio{summary.stopChanges > 1 ? 's' : ''} de parada
                  </span>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-gradient-to-r from-success/10 to-success/5 rounded-xl border border-success/30 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-success/20 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-success" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Sin Novedades</h3>
                <p className="text-sm text-gray-600">
                  Todos los estudiantes viajan normalmente hoy
                </p>
              </div>
            </div>
          </div>
        )}

        {/* View Students Button */}
        {onViewStudents && (
          <button
            onClick={onViewStudents}
            className="w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <Users className="w-5 h-5" />
            Ver Lista de Estudiantes ({totalStudents})
          </button>
        )}

        {/* GPS Status */}
        <div className={cn(
          'rounded-xl p-4 flex items-center gap-3',
          gpsReady ? 'bg-success/10 border border-success/30' : 'bg-warning/10 border border-warning/30'
        )}>
          <MapPin className={cn('w-5 h-5', gpsReady ? 'text-success' : 'text-warning')} />
          <div>
            <p className={cn('font-medium text-sm', gpsReady ? 'text-success' : 'text-warning')}>
              {gpsReady ? 'GPS Listo' : 'Obteniendo ubicación...'}
            </p>
            <p className="text-xs text-gray-500">
              {gpsReady
                ? 'Tu ubicación será registrada al iniciar el viaje'
                : 'Por favor espera mientras obtenemos tu ubicación'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Fixed bottom actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 safe-area-pb">
        <button
          onClick={onNext}
          disabled={!gpsReady || novedadesLoading}
          className={cn(
            'w-full py-4 px-4 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors text-lg',
            gpsReady && !novedadesLoading
              ? 'bg-primary text-white hover:bg-primary/90'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'
          )}
        >
          {hasNovedades ? 'Revisar Novedades' : 'Continuar'}
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
}
