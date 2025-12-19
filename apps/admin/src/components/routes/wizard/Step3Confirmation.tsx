'use client';

/**
 * Step 3: Confirmation
 *
 * Final step to configure:
 * - Recurrence settings
 * - Review route summary
 * - Activate/deactivate toggle
 * - Save route
 */

import { useState, useEffect } from 'react';
import {
  CheckCircle, Clock, Users, Route, Bus, MapPin, Calendar,
  AlertCircle, Info,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { RecurrenceSelector, getRecurrenceDescription } from './RecurrenceSelector';
import type { RecurrenceConfig } from './RecurrenceSelector';
import type { Step1Data } from './Step1Planning';
import type { Step2Data } from './Step2StopAssignment';

export interface Step3Data {
  recurrence: RecurrenceConfig;
  isActive: boolean;
}

interface Step3ConfirmationProps {
  step1Data: Step1Data;
  step2Data: Step2Data;
  data: Step3Data;
  onChange: (data: Step3Data) => void;
  onValidChange: (isValid: boolean) => void;
}

export function Step3Confirmation({
  step1Data,
  step2Data,
  data,
  onChange,
  onValidChange,
}: Step3ConfirmationProps) {
  // Validate step
  useEffect(() => {
    let isValid = true;

    // Validate recurrence based on type
    if (data.recurrence.type === 'daily') {
      isValid = (data.recurrence.daysOfWeek?.length ?? 0) > 0;
    } else if (data.recurrence.type === 'weekly') {
      isValid = !!data.recurrence.dayOfWeek;
    } else if (data.recurrence.type === 'monthly') {
      isValid = !!data.recurrence.dayOfMonth;
    } else if (data.recurrence.type === 'one_time') {
      isValid = !!data.recurrence.specificDate;
    }

    onValidChange(isValid);
  }, [data, onValidChange]);

  const handleRecurrenceChange = (recurrence: RecurrenceConfig) => {
    onChange({ ...data, recurrence });
  };

  // Format duration
  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60);
    if (minutes >= 60) {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return `${hours}h ${mins}min`;
    }
    return `${minutes} min`;
  };

  // Format distance
  const formatDistance = (meters: number) => {
    if (meters >= 1000) {
      return `${(meters / 1000).toFixed(1)} km`;
    }
    return `${meters} m`;
  };

  return (
    <div className="space-y-6">
      {/* Route Summary Card */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Route className="w-5 h-5 text-primary" />
            Resumen de la Ruta
          </h3>
        </div>

        <div className="p-4 space-y-4">
          {/* Basic Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Nombre</p>
              <p className="font-medium text-gray-900">{step1Data.routeName}</p>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-gray-500 uppercase tracking-wide">Tipo</p>
              <p className="font-medium text-gray-900">
                {step1Data.routeType === 'pickup' ? 'Recogida (Pickup)' : 'Entrega (Dropoff)'}
              </p>
            </div>
          </div>

          {/* Time Info */}
          <div className="grid md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">
                  {step1Data.routeType === 'pickup' ? 'Inicio' : 'Salida'}
                </p>
                <p className="font-bold text-gray-900">
                  {step2Data.optimizationResult?.startTime || '--:--'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Clock className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">
                  {step1Data.routeType === 'pickup' ? 'Llegada' : 'Fin'}
                </p>
                <p className="font-bold text-gray-900">
                  {step2Data.optimizationResult?.endTime || '--:--'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
              <Route className="w-5 h-5 text-gray-400" />
              <div>
                <p className="text-xs text-gray-500">Duración</p>
                <p className="font-bold text-gray-900">
                  {step2Data.optimizationResult
                    ? formatDuration(step2Data.optimizationResult.totalDuration)
                    : '--'}
                </p>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-100">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {step2Data.selectedStudentIds.length}
              </p>
              <p className="text-xs text-gray-500">Estudiantes</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {step2Data.optimizationResult?.stops.length || 0}
              </p>
              <p className="text-xs text-gray-500">Paradas</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">
                {step2Data.optimizationResult
                  ? formatDistance(step2Data.optimizationResult.totalDistance)
                  : '--'}
              </p>
              <p className="text-xs text-gray-500">Distancia</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stops Preview */}
      {step2Data.optimizationResult && (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              Paradas ({step2Data.optimizationResult.stops.length})
            </h3>
          </div>
          <div className="divide-y divide-gray-100 max-h-48 overflow-y-auto">
            {step2Data.optimizationResult.stops.map((stop, index) => (
              <div key={stop.studentId} className="px-4 py-3 flex items-center gap-3">
                <div className="w-7 h-7 bg-primary text-white rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 text-sm truncate">
                    {stop.studentName}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {stop.address || 'Sin dirección'}
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-bold text-primary">
                    {stop.estimatedArrivalTime}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recurrence Configuration */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50">
          <h3 className="font-semibold text-gray-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Frecuencia de la Ruta
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            Configura cuándo se ejecutará esta ruta
          </p>
        </div>
        <div className="p-4">
          <RecurrenceSelector
            value={data.recurrence}
            onChange={handleRecurrenceChange}
          />
        </div>
      </div>

      {/* Active Toggle */}
      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle className={cn(
              'w-5 h-5',
              data.isActive ? 'text-success' : 'text-gray-400'
            )} />
            <div>
              <p className="font-medium text-gray-900">Activar Ruta</p>
              <p className="text-sm text-gray-500">
                {data.isActive
                  ? 'La ruta estará disponible para iniciar viajes'
                  : 'La ruta se creará pero no estará disponible'}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onChange({ ...data, isActive: !data.isActive })}
            className={cn(
              'w-14 h-7 rounded-full transition-colors relative',
              data.isActive ? 'bg-success' : 'bg-gray-300'
            )}
          >
            <div
              className={cn(
                'w-6 h-6 bg-white rounded-full absolute top-0.5 transition-transform shadow',
                data.isActive ? 'translate-x-7' : 'translate-x-0.5'
              )}
            />
          </button>
        </div>
      </div>

      {/* Final Info */}
      <div className="bg-info/10 border border-info/20 rounded-xl p-4">
        <div className="flex items-start gap-3">
          <Info className="w-5 h-5 text-info flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-info">Creación de viajes</p>
            <p className="text-sm text-gray-600 mt-1">
              Los viajes se crean automáticamente cuando el conductor presiona "Iniciar Viaje".
              La frecuencia configurada determina en qué días aparecerá esta ruta disponible.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
