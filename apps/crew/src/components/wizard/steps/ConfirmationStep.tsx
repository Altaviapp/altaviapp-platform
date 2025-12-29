'use client';

import {
  Play,
  ArrowLeft,
  Loader2,
  CheckCircle,
  ClipboardCheck,
  Users,
  AlertTriangle,
  MapPin,
  Bus,
  Sunrise,
  Sunset,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChecklistData } from '@/types';

interface ConfirmationStepProps {
  routeName: string;
  routeType: 'pickup' | 'dropoff';
  vehiclePlate?: string;
  expectedStudents: number;
  totalNovedades: number;
  checklistCompleted: boolean;
  checklistData?: ChecklistData | null;
  isSubmitting: boolean;
  error: string | null;
  onConfirm: () => void;
  onBack: () => void;
}

export function ConfirmationStep({
  routeName,
  routeType,
  vehiclePlate,
  expectedStudents,
  totalNovedades,
  checklistCompleted,
  checklistData,
  isSubmitting,
  error,
  onConfirm,
  onBack,
}: ConfirmationStepProps) {
  const isPickup = routeType === 'pickup';
  const TypeIcon = isPickup ? Sunrise : Sunset;

  return (
    <div className="flex flex-col min-h-[calc(100vh-120px)]">
      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-8">
        <div className="w-20 h-20 rounded-full bg-success/10 flex items-center justify-center mb-6">
          <Play className="w-10 h-10 text-success" />
        </div>

        <h2 className="text-xl font-bold text-gray-900 text-center mb-2">
          ¿Listo para iniciar?
        </h2>

        <p className="text-gray-600 text-center mb-8 max-w-sm">
          Revisa el resumen y confirma para iniciar el viaje
        </p>

        {/* Summary Card */}
        <div className="w-full max-w-sm bg-white rounded-xl border border-gray-200 p-4 space-y-4">
          {/* Route info */}
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-10 h-10 rounded-full flex items-center justify-center',
              isPickup ? 'bg-warning/10' : 'bg-info/10'
            )}>
              <TypeIcon className={cn('w-5 h-5', isPickup ? 'text-warning' : 'text-info')} />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{routeName}</p>
              <p className="text-sm text-gray-500">
                {isPickup ? 'Recogida' : 'Entrega'}
              </p>
            </div>
          </div>

          <div className="h-px bg-gray-100" />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            {vehiclePlate && (
              <div className="flex items-center gap-2 text-sm">
                <Bus className="w-4 h-4 text-gray-400" />
                <span className="text-gray-600">{vehiclePlate}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-sm">
              <Users className="w-4 h-4 text-gray-400" />
              <span className="text-gray-600">{expectedStudents} estudiantes</span>
            </div>

            <div className="flex items-center gap-2 text-sm">
              {checklistCompleted ? (
                <>
                  <CheckCircle className="w-4 h-4 text-success" />
                  <span className="text-success">Inspección completada</span>
                </>
              ) : (
                <>
                  <ClipboardCheck className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500">Sin inspección</span>
                </>
              )}
            </div>

            {totalNovedades > 0 && (
              <div className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-warning" />
                <span className="text-warning">{totalNovedades} novedades</span>
              </div>
            )}
          </div>

          {/* Checklist issues warning */}
          {checklistData?.hasIssues && (
            <>
              <div className="h-px bg-gray-100" />
              <div className="bg-warning/10 rounded-lg p-3 text-sm text-warning flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                <span>
                  La inspección reportó {checklistData.issues?.length || 0} problema(s).
                  Proceder con precaución.
                </span>
              </div>
            </>
          )}
        </div>

        {/* GPS confirmation */}
        <div className="flex items-center gap-2 mt-4 text-sm text-success">
          <MapPin className="w-4 h-4" />
          <span>Ubicación GPS confirmada</span>
        </div>

        {/* Error message */}
        {error && (
          <div className="w-full max-w-sm mt-4 bg-error/10 border border-error/20 rounded-lg p-3 text-error text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Fixed bottom actions */}
      <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 safe-area-pb">
        <div className="flex gap-3">
          <button
            onClick={onBack}
            disabled={isSubmitting}
            className="flex-1 py-3 px-4 rounded-xl font-medium flex items-center justify-center gap-2 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver
          </button>

          <button
            onClick={onConfirm}
            disabled={isSubmitting}
            className={cn(
              'flex-[2] py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors',
              isSubmitting
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                : 'bg-success hover:bg-success/90 text-white'
            )}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Iniciando...
              </>
            ) : (
              <>
                <Play className="w-5 h-5" />
                Iniciar Viaje
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
