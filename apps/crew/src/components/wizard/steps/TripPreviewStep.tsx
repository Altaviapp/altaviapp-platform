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
  CheckCircle,
  ArrowRight,
  ArrowLeft,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface RouteData {
  name: string;
  type: 'pickup' | 'dropoff';
  scheduledStartTime: string;
  scheduledEndTime: string;
  vehicle?: {
    licensePlate: string;
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
}

interface Novedad {
  _id: string;
  type: 'absence' | 'parent_pickup' | 'stop_change' | 'early_pickup' | 'late_arrival';
  studentId: string;
  studentName: string;
  stopName?: string | null;
  reason?: string;
}

interface TripPreviewStepProps {
  route: RouteData;
  novedades: Novedad[];
  summary: NovedadSummary;
  novedadesLoading?: boolean;
  gpsReady: boolean;
  onNext: () => void;
  onBack: () => void;
}

const novedadTypeConfig = {
  absence: {
    label: 'No viajará',
    color: 'text-error',
    bg: 'bg-error/10',
    icon: UserX,
  },
  parent_pickup: {
    label: 'Padre recoge',
    color: 'text-warning',
    bg: 'bg-warning/10',
    icon: UserCheck,
  },
  stop_change: {
    label: 'Cambio de parada',
    color: 'text-info',
    bg: 'bg-info/10',
    icon: MapPinned,
  },
  early_pickup: {
    label: 'Salida temprana',
    color: 'text-purple-600',
    bg: 'bg-purple-100',
    icon: Clock,
  },
  late_arrival: {
    label: 'Llegada tarde',
    color: 'text-orange-600',
    bg: 'bg-orange-100',
    icon: Clock,
  },
};

export function TripPreviewStep({
  route,
  novedades,
  summary,
  novedadesLoading,
  gpsReady,
  onNext,
  onBack,
}: TripPreviewStepProps) {
  const isPickup = route.type === 'pickup';
  const TypeIcon = isPickup ? Sunrise : Sunset;

  // Calculate expected students (total - absences - parent_pickups)
  const expectedStudents = (route.students?.length || 0) - summary.absences - summary.parentPickups;

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Route Info Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              isPickup ? 'bg-warning/10' : 'bg-info/10'
            )}>
              <TypeIcon className={cn('w-5 h-5', isPickup ? 'text-warning' : 'text-info')} />
            </div>
            <div>
              <h2 className="font-semibold text-gray-900">
                Ruta de {isPickup ? 'Recogida' : 'Entrega'}
              </h2>
              <p className="text-sm text-gray-500">{route.name}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{route.scheduledStartTime} - {route.scheduledEndTime}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Users className="w-4 h-4 text-gray-400" />
              <span>{expectedStudents} estudiantes esperados</span>
            </div>
            {route.vehicle && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Bus className="w-4 h-4 text-gray-400" />
                <span>{route.vehicle.licensePlate}</span>
              </div>
            )}
            {route.stops && (
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{route.stops.length} paradas</span>
              </div>
            )}
          </div>
        </div>

        {/* Novedades Section */}
        {summary.total > 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-warning" />
              Novedades del Día ({summary.total})
            </h3>

            {/* Summary badges */}
            <div className="flex flex-wrap gap-2 mb-4">
              {summary.absences > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-error/10 text-error">
                  {summary.absences} ausencia{summary.absences > 1 ? 's' : ''}
                </span>
              )}
              {summary.parentPickups > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-warning/10 text-warning">
                  {summary.parentPickups} padre recoge
                </span>
              )}
              {summary.stopChanges > 0 && (
                <span className="px-2 py-1 rounded-full text-xs font-medium bg-info/10 text-info">
                  {summary.stopChanges} cambio{summary.stopChanges > 1 ? 's' : ''} de parada
                </span>
              )}
            </div>

            {/* Novedades list */}
            {!novedadesLoading && (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {novedades.map((novedad) => {
                  const config = novedadTypeConfig[novedad.type] || novedadTypeConfig.absence;
                  const Icon = config.icon;

                  return (
                    <div
                      key={novedad._id}
                      className={cn(
                        'flex items-start gap-3 p-3 rounded-lg',
                        config.bg
                      )}
                    >
                      <Icon className={cn('w-5 h-5 mt-0.5', config.color)} />
                      <div className="flex-1 min-w-0">
                        <p className={cn('font-medium text-sm', config.color)}>
                          {novedad.studentName}
                        </p>
                        <p className="text-xs text-gray-600">
                          {config.label}
                          {novedad.stopName && ` - ${novedad.stopName}`}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Students List */}
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Estudiantes Asignados ({route.students?.length || 0})
          </h3>

          {route.students && route.students.length > 0 ? (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {route.students.filter(Boolean).map((student) => {
                if (!student) return null;

                // Check if student has a novedad
                const studentNovedad = novedades.find(
                  (n) => n.studentId === student.id
                );
                const hasNovedad = !!studentNovedad;
                const novedadConfig = studentNovedad
                  ? novedadTypeConfig[studentNovedad.type]
                  : null;

                return (
                  <div
                    key={student.id}
                    className={cn(
                      'flex items-center gap-3 p-2 rounded-lg',
                      hasNovedad ? novedadConfig?.bg : 'bg-gray-50'
                    )}
                  >
                    <div className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                      hasNovedad ? novedadConfig?.bg : 'bg-primary/10 text-primary'
                    )}>
                      {student.firstName?.[0] || ''}{student.lastName?.[0] || ''}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        'text-sm font-medium',
                        hasNovedad ? novedadConfig?.color : 'text-gray-900'
                      )}>
                        {student.firstName} {student.lastName}
                      </p>
                      <p className="text-xs text-gray-500">
                        {student.grade}
                        {hasNovedad && ` - ${novedadConfig?.label}`}
                      </p>
                    </div>
                    {hasNovedad && novedadConfig && (
                      <novedadConfig.icon className={cn('w-4 h-4', novedadConfig.color)} />
                    )}
                    {!hasNovedad && (
                      <CheckCircle className="w-4 h-4 text-success" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay estudiantes asignados a esta ruta
            </p>
          )}
        </div>

        {/* GPS Status */}
        <div className={cn(
          'rounded-lg p-3 text-sm flex items-center gap-2',
          gpsReady ? 'bg-success/10 text-success' : 'bg-warning/10 text-warning'
        )}>
          <MapPin className="w-4 h-4" />
          {gpsReady
            ? 'GPS listo'
            : 'Obteniendo ubicación GPS...'
          }
        </div>
      </div>

      {/* Fixed bottom actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 safe-area-pb">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            className="flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <button
            onClick={onNext}
            disabled={!gpsReady}
            className={cn(
              'flex-[2] py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors',
              gpsReady
                ? 'bg-success text-white hover:bg-success/90'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            )}
          >
            Continuar
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
