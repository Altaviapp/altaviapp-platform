'use client';

/**
 * Step 1: Basic Information for Bulk Route Creation
 *
 * Collects basic route parameters:
 * - Route type (pickup/dropoff)
 * - Target time (arrival for pickup, departure for dropoff)
 * - Operation days (daily or specific days of week)
 * - Fleet and student summary display
 *
 * PRD References:
 * - US-002 - Step 1 - Route type and schedule selection
 * - US-003 - Step 1 - Fleet and student summary display
 */

import { useEffect } from 'react';
import { useQuery } from 'convex/react';
import { Bus, Clock, Calendar, Repeat, AlertCircle } from 'lucide-react';
import { api } from '../../../../../../convex/_generated/api';
import { cn } from '@/lib/utils';
import { useConvexAuth, useInstitution } from '@/hooks';
import type { BulkWizardStep1Data } from './BulkRouteWizard';
import { FleetSummary } from './FleetSummary';

interface Step1BasicInfoProps {
  data: BulkWizardStep1Data;
  onChange: (data: Partial<BulkWizardStep1Data>) => void;
  onValidChange: (isValid: boolean) => void;
}

const DAYS_OF_WEEK = [
  { value: 'monday', label: 'Lun', fullLabel: 'Lunes' },
  { value: 'tuesday', label: 'Mar', fullLabel: 'Martes' },
  { value: 'wednesday', label: 'Mié', fullLabel: 'Miércoles' },
  { value: 'thursday', label: 'Jue', fullLabel: 'Jueves' },
  { value: 'friday', label: 'Vie', fullLabel: 'Viernes' },
  { value: 'saturday', label: 'Sáb', fullLabel: 'Sábado' },
  { value: 'sunday', label: 'Dom', fullLabel: 'Domingo' },
];

export function Step1BasicInfo({
  data,
  onChange,
  onValidChange,
}: Step1BasicInfoProps) {
  const { userId, institutionId } = useConvexAuth();
  const { institution } = useInstitution();

  // Check if school location is configured
  const hasSchoolLocation =
    institution?.schoolLatitude && institution?.schoolLongitude;

  // Query fleet summary when route type is selected
  const fleetSummary = useQuery(
    api.routes.getBulkWizardFleetSummary,
    userId && institutionId && data.routeType
      ? {
          userId,
          institutionId,
          routeType: data.routeType,
        }
      : 'skip'
  );

  // Check if there are students available for the selected route type
  const hasStudentsAvailable =
    fleetSummary?.students.totalWithoutRoute !== undefined &&
    fleetSummary.students.totalWithoutRoute > 0;

  // Validate step data
  // Disable "Next" if no students are available for the selected route type
  useEffect(() => {
    const isValid = !!(
      hasSchoolLocation &&
      data.routeType &&
      data.targetTime &&
      (data.operationType === 'daily' || data.selectedDays.length > 0) &&
      hasStudentsAvailable
    );
    onValidChange(isValid);
  }, [data, hasSchoolLocation, hasStudentsAvailable, onValidChange]);

  const handleRouteTypeChange = (routeType: 'pickup' | 'dropoff') => {
    onChange({ routeType });
  };

  const handleTargetTimeChange = (targetTime: string) => {
    onChange({ targetTime });
  };

  const handleOperationTypeChange = (operationType: 'daily' | 'specific') => {
    if (operationType === 'daily') {
      // Set default weekdays when switching to daily
      onChange({
        operationType,
        selectedDays: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'],
      });
    } else {
      onChange({ operationType });
    }
  };

  const handleDayToggle = (day: string) => {
    const currentDays = data.selectedDays;
    const newDays = currentDays.includes(day)
      ? currentDays.filter((d) => d !== day)
      : [...currentDays, day];

    // Ensure at least one day is selected when in specific mode
    if (newDays.length === 0 && data.operationType === 'specific') return;

    onChange({ selectedDays: newDays });
  };

  // Warning if school location not configured
  if (!hasSchoolLocation) {
    return (
      <div className="space-y-6">
        <div className="bg-warning/10 border border-warning/20 rounded-xl p-6">
          <div className="flex items-start gap-4">
            <AlertCircle className="w-6 h-6 text-warning flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold text-warning">
                Ubicación del colegio no configurada
              </h3>
              <p className="text-sm text-gray-600 mt-1">
                Para crear rutas optimizadas, primero debes configurar la
                ubicación del colegio. Esta ubicación se usará como punto de
                origen o destino para todas las rutas.
              </p>
              <a
                href="/settings/school"
                className="inline-block mt-4 px-4 py-2 bg-warning text-white rounded-lg hover:bg-warning/90 transition-colors text-sm font-medium"
              >
                Configurar Ubicación del Colegio
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Route Type Selection */}
      <div className="space-y-3">
        <label className="block text-sm font-medium text-gray-700">
          Tipo de Ruta *
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleRouteTypeChange('pickup')}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all',
              data.routeType === 'pickup'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center',
                  data.routeType === 'pickup'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                <Bus className="w-6 h-6" />
              </div>
              <div>
                <p
                  className={cn(
                    'font-semibold text-lg',
                    data.routeType === 'pickup' ? 'text-primary' : 'text-gray-900'
                  )}
                >
                  Recogida (casa→colegio)
                </p>
                <p className="text-sm text-gray-500">
                  Bus recoge estudiantes y los lleva al colegio
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleRouteTypeChange('dropoff')}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all',
              data.routeType === 'dropoff'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-12 h-12 rounded-lg flex items-center justify-center',
                  data.routeType === 'dropoff'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                <Bus className="w-6 h-6 rotate-180" />
              </div>
              <div>
                <p
                  className={cn(
                    'font-semibold text-lg',
                    data.routeType === 'dropoff'
                      ? 'text-primary'
                      : 'text-gray-900'
                  )}
                >
                  Entrega (colegio→casa)
                </p>
                <p className="text-sm text-gray-500">
                  Bus lleva estudiantes del colegio a sus casas
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Target Time */}
      <div className="space-y-2">
        <label className="block text-sm font-medium text-gray-700">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            {data.routeType === 'pickup'
              ? 'Hora de llegada al colegio *'
              : data.routeType === 'dropoff'
                ? 'Hora de salida del colegio *'
                : 'Hora objetivo *'}
          </div>
        </label>
        <input
          type="time"
          value={data.targetTime}
          onChange={(e) => handleTargetTimeChange(e.target.value)}
          className="w-full md:w-48 px-3 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
        />
        <p className="text-xs text-gray-500">
          {data.routeType === 'pickup'
            ? 'Los horarios de recogida se calcularán hacia atrás desde esta hora'
            : data.routeType === 'dropoff'
              ? 'Los horarios de entrega se calcularán hacia adelante desde esta hora'
              : 'Selecciona primero el tipo de ruta'}
        </p>
      </div>

      {/* Operation Days */}
      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            Días de operación *
          </div>
        </label>

        {/* Operation Type Selection */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => handleOperationTypeChange('daily')}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all',
              data.operationType === 'daily'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  data.operationType === 'daily'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                <Repeat className="w-5 h-5" />
              </div>
              <div>
                <p
                  className={cn(
                    'font-semibold',
                    data.operationType === 'daily'
                      ? 'text-primary'
                      : 'text-gray-900'
                  )}
                >
                  Diario
                </p>
                <p className="text-sm text-gray-500">
                  Lunes a Viernes (días hábiles)
                </p>
              </div>
            </div>
          </button>

          <button
            type="button"
            onClick={() => handleOperationTypeChange('specific')}
            className={cn(
              'p-4 rounded-xl border-2 text-left transition-all',
              data.operationType === 'specific'
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  'w-10 h-10 rounded-lg flex items-center justify-center',
                  data.operationType === 'specific'
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-500'
                )}
              >
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <p
                  className={cn(
                    'font-semibold',
                    data.operationType === 'specific'
                      ? 'text-primary'
                      : 'text-gray-900'
                  )}
                >
                  Días específicos
                </p>
                <p className="text-sm text-gray-500">
                  Selecciona los días manualmente
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Day of Week Checkboxes (shown for specific mode, or to show current selection for daily) */}
        <div className="space-y-2">
          <div className="flex flex-wrap gap-2">
            {DAYS_OF_WEEK.map(({ value, label, fullLabel }) => (
              <button
                key={value}
                type="button"
                onClick={() => handleDayToggle(value)}
                title={fullLabel}
                disabled={data.operationType === 'daily'}
                className={cn(
                  'w-12 h-12 rounded-full text-sm font-medium transition-colors',
                  data.selectedDays.includes(value)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200',
                  data.operationType === 'daily' &&
                    'cursor-not-allowed opacity-60'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {data.selectedDays.length} día(s) seleccionado(s)
            {data.operationType === 'daily' && ' (Lunes a Viernes por defecto)'}
          </p>
        </div>
      </div>

      {/* Fleet Summary - US-003 */}
      <FleetSummary
        data={fleetSummary}
        isLoading={fleetSummary === undefined && !!data.routeType}
        routeType={data.routeType}
      />
    </div>
  );
}
