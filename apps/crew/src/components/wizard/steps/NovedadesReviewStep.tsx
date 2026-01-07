'use client';

import { useState, useMemo } from 'react';
import {
  UserX,
  UserCheck,
  MapPinned,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Check,
  ArrowRight,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface Novedad {
  _id: string;
  type: 'absence' | 'parent_pickup' | 'stop_change' | 'early_pickup' | 'late_arrival';
  studentId: string;
  studentName: string;
  studentGrade?: string;
  stopName?: string | null;
  reason?: string;
  newStopId?: string;
}

interface NovedadSummary {
  total: number;
  absences: number;
  parentPickups: number;
  stopChanges: number;
  other?: number;
}

interface NovedadesReviewStepProps {
  novedades: Novedad[];
  summary: NovedadSummary;
  confirmedIds: Set<string>;
  isConfirming: boolean;
  onConfirmSingle: (novedadId: string) => void;
  onConfirmAll: () => void;
  onNext: () => void;
  onBack: () => void;
}

const novedadTypeConfig = {
  absence: {
    label: 'No viajará',
    description: 'El estudiante no abordará hoy',
    color: 'text-error',
    bg: 'bg-error/10',
    border: 'border-error/30',
    icon: UserX,
  },
  parent_pickup: {
    label: 'Padre recoge',
    description: 'El padre recogerá al estudiante directamente',
    color: 'text-orange-600',
    bg: 'bg-orange-50',
    border: 'border-orange-200',
    icon: UserCheck,
  },
  stop_change: {
    label: 'Cambio de parada',
    description: 'El estudiante abordará en una parada diferente',
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    icon: MapPinned,
  },
  early_pickup: {
    label: 'Salida temprana',
    description: 'El estudiante debe ser recogido antes de la hora habitual',
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    border: 'border-purple-200',
    icon: Clock,
  },
  late_arrival: {
    label: 'Llegada tarde',
    description: 'El estudiante llegará más tarde de lo habitual',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    icon: Clock,
  },
};

export function NovedadesReviewStep({
  novedades,
  summary,
  confirmedIds,
  isConfirming,
  onConfirmSingle,
  onConfirmAll,
  onNext,
  onBack,
}: NovedadesReviewStepProps) {
  const confirmedCount = confirmedIds.size;
  const totalCount = novedades.length;
  const allConfirmed = confirmedCount === totalCount && totalCount > 0;
  const progressPercentage = totalCount > 0 ? (confirmedCount / totalCount) * 100 : 0;

  // Build summary text
  const summaryParts = useMemo(() => {
    const parts: string[] = [];
    if (summary.absences > 0) {
      parts.push(`${summary.absences} ausencia${summary.absences > 1 ? 's' : ''}`);
    }
    if (summary.stopChanges > 0) {
      parts.push(`${summary.stopChanges} cambio${summary.stopChanges > 1 ? 's' : ''} de parada`);
    }
    if (summary.parentPickups > 0) {
      parts.push(`${summary.parentPickups} recogida${summary.parentPickups > 1 ? 's' : ''} por padre`);
    }
    return parts.join(', ');
  }, [summary]);

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {/* Header with summary */}
        <div className="bg-warning/10 rounded-xl p-4 border border-warning/30">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h2 className="font-bold text-gray-900 text-lg">
                Revisión de Novedades
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                {summaryParts}
              </p>
            </div>
          </div>
        </div>

        {/* Progress bar */}
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Progreso de confirmación
            </span>
            <span className="text-sm font-bold text-primary">
              {confirmedCount} de {totalCount}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className={cn(
                'h-2.5 rounded-full transition-all duration-300',
                allConfirmed ? 'bg-success' : 'bg-primary'
              )}
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        {/* Confirm All Button */}
        {!allConfirmed && (
          <button
            onClick={onConfirmAll}
            disabled={isConfirming}
            className={cn(
              'w-full py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors',
              isConfirming
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                : 'bg-primary/10 text-primary hover:bg-primary/20 border border-primary/30'
            )}
          >
            {isConfirming ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Confirmando...
              </>
            ) : (
              <>
                <CheckCircle2 className="w-5 h-5" />
                Confirmar Todas las Novedades
              </>
            )}
          </button>
        )}

        {/* Novedades List */}
        <div className="space-y-3">
          {novedades.map((novedad) => {
            const config = novedadTypeConfig[novedad.type] || novedadTypeConfig.absence;
            const Icon = config.icon;
            const isConfirmed = confirmedIds.has(novedad._id);

            return (
              <div
                key={novedad._id}
                className={cn(
                  'rounded-xl border p-4 transition-all',
                  isConfirmed
                    ? 'bg-success/5 border-success/30'
                    : cn(config.bg, config.border)
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                    isConfirmed ? 'bg-success/20' : config.bg
                  )}>
                    {isConfirmed ? (
                      <CheckCircle2 className="w-5 h-5 text-success" />
                    ) : (
                      <Icon className={cn('w-5 h-5', config.color)} />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className={cn(
                        'font-semibold',
                        isConfirmed ? 'text-success' : config.color
                      )}>
                        {novedad.studentName}
                      </h3>
                      {novedad.studentGrade && (
                        <span className="text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full">
                          {novedad.studentGrade}
                        </span>
                      )}
                    </div>

                    <p className={cn(
                      'text-sm font-medium mb-1',
                      isConfirmed ? 'text-gray-600' : config.color
                    )}>
                      {config.label}
                    </p>

                    <p className="text-sm text-gray-500">
                      {config.description}
                    </p>

                    {/* Reason if provided */}
                    {novedad.reason && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        &ldquo;{novedad.reason}&rdquo;
                      </p>
                    )}

                    {/* Stop info for stop changes */}
                    {novedad.type === 'stop_change' && novedad.stopName && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-blue-600 bg-blue-50 rounded-lg p-2">
                        <MapPinned className="w-4 h-4" />
                        <span>Nueva parada: {novedad.stopName}</span>
                      </div>
                    )}
                  </div>

                  {/* Confirm button */}
                  {!isConfirmed && (
                    <button
                      onClick={() => onConfirmSingle(novedad._id)}
                      disabled={isConfirming}
                      className={cn(
                        'p-2 rounded-lg transition-colors flex-shrink-0',
                        isConfirming
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white hover:bg-gray-50 border border-gray-200 text-gray-600'
                      )}
                    >
                      <Check className="w-5 h-5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* All confirmed message */}
        {allConfirmed && (
          <div className="bg-success/10 rounded-xl p-4 border border-success/30 flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-success flex-shrink-0" />
            <div>
              <h3 className="font-semibold text-success">
                Todas las novedades confirmadas
              </h3>
              <p className="text-sm text-gray-600">
                Ya puedes continuar con el inicio del viaje
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 safe-area-pb">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            disabled={isConfirming}
            className="flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <button
            onClick={onNext}
            disabled={!allConfirmed || isConfirming}
            className={cn(
              'flex-[2] py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 transition-colors',
              allConfirmed && !isConfirming
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
