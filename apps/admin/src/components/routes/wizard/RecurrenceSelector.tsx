'use client';

/**
 * RecurrenceSelector Component
 *
 * Allows selection of route recurrence pattern:
 * - Daily (with day selection)
 * - Weekly (specific day of week)
 * - Monthly (specific day of month)
 * - One-time (specific date)
 */

import { useState, useEffect } from 'react';
import { Calendar, Repeat, CalendarDays, CalendarCheck } from 'lucide-react';
import { cn } from '@/lib/utils';

export type RecurrenceType = 'daily' | 'weekly' | 'monthly' | 'one_time';

export interface RecurrenceConfig {
  type: RecurrenceType;
  daysOfWeek?: string[]; // For daily
  dayOfWeek?: string; // For weekly
  dayOfMonth?: number; // For monthly
  specificDate?: string; // For one_time (YYYY-MM-DD)
}

interface RecurrenceSelectorProps {
  value: RecurrenceConfig;
  onChange: (config: RecurrenceConfig) => void;
}

const recurrenceTypes = [
  { value: 'daily', label: 'Diaria', icon: Repeat, description: 'Se repite todos los días seleccionados' },
  { value: 'weekly', label: 'Semanal', icon: CalendarDays, description: 'Se repite cada semana el mismo día' },
  { value: 'monthly', label: 'Mensual', icon: CalendarCheck, description: 'Se repite cada mes el mismo día' },
  { value: 'one_time', label: 'Una vez', icon: Calendar, description: 'Solo se ejecuta una vez' },
] as const;

const daysOfWeek = [
  { value: 'monday', label: 'Lun', fullLabel: 'Lunes' },
  { value: 'tuesday', label: 'Mar', fullLabel: 'Martes' },
  { value: 'wednesday', label: 'Mié', fullLabel: 'Miércoles' },
  { value: 'thursday', label: 'Jue', fullLabel: 'Jueves' },
  { value: 'friday', label: 'Vie', fullLabel: 'Viernes' },
  { value: 'saturday', label: 'Sáb', fullLabel: 'Sábado' },
  { value: 'sunday', label: 'Dom', fullLabel: 'Domingo' },
];

export function RecurrenceSelector({ value, onChange }: RecurrenceSelectorProps) {
  const handleTypeChange = (type: RecurrenceType) => {
    const newConfig: RecurrenceConfig = { type };

    // Set defaults based on type
    if (type === 'daily') {
      newConfig.daysOfWeek = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
    } else if (type === 'weekly') {
      newConfig.dayOfWeek = 'monday';
    } else if (type === 'monthly') {
      newConfig.dayOfMonth = 1;
    } else if (type === 'one_time') {
      // Set to tomorrow
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      newConfig.specificDate = tomorrow.toISOString().split('T')[0];
    }

    onChange(newConfig);
  };

  const handleDayToggle = (day: string) => {
    const currentDays = value.daysOfWeek || [];
    const newDays = currentDays.includes(day)
      ? currentDays.filter(d => d !== day)
      : [...currentDays, day];

    // Ensure at least one day is selected
    if (newDays.length === 0) return;

    onChange({ ...value, daysOfWeek: newDays });
  };

  return (
    <div className="space-y-4">
      {/* Type Selection */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {recurrenceTypes.map(({ value: typeValue, label, icon: Icon, description }) => (
          <button
            key={typeValue}
            type="button"
            onClick={() => handleTypeChange(typeValue)}
            className={cn(
              'p-4 rounded-lg border-2 text-left transition-all',
              value.type === typeValue
                ? 'border-primary bg-primary/5'
                : 'border-gray-200 hover:border-gray-300'
            )}
          >
            <Icon className={cn(
              'w-5 h-5 mb-2',
              value.type === typeValue ? 'text-primary' : 'text-gray-400'
            )} />
            <p className={cn(
              'font-medium text-sm',
              value.type === typeValue ? 'text-primary' : 'text-gray-900'
            )}>
              {label}
            </p>
            <p className="text-xs text-gray-500 mt-1">{description}</p>
          </button>
        ))}
      </div>

      {/* Daily - Day Selection */}
      {value.type === 'daily' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Días de operación
          </label>
          <div className="flex flex-wrap gap-2">
            {daysOfWeek.map(({ value: dayValue, label, fullLabel }) => (
              <button
                key={dayValue}
                type="button"
                onClick={() => handleDayToggle(dayValue)}
                title={fullLabel}
                className={cn(
                  'w-10 h-10 rounded-full text-sm font-medium transition-colors',
                  value.daysOfWeek?.includes(dayValue)
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                )}
              >
                {label}
              </button>
            ))}
          </div>
          <p className="text-xs text-gray-500">
            {value.daysOfWeek?.length || 0} día(s) seleccionado(s)
          </p>
        </div>
      )}

      {/* Weekly - Day Selection */}
      {value.type === 'weekly' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Día de la semana
          </label>
          <select
            value={value.dayOfWeek || 'monday'}
            onChange={(e) => onChange({ ...value, dayOfWeek: e.target.value })}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {daysOfWeek.map(({ value: dayValue, fullLabel }) => (
              <option key={dayValue} value={dayValue}>{fullLabel}</option>
            ))}
          </select>
        </div>
      )}

      {/* Monthly - Day of Month */}
      {value.type === 'monthly' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Día del mes
          </label>
          <select
            value={value.dayOfMonth || 1}
            onChange={(e) => onChange({ ...value, dayOfMonth: parseInt(e.target.value) })}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          >
            {Array.from({ length: 28 }, (_, i) => i + 1).map((day) => (
              <option key={day} value={day}>Día {day}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500">
            Se recomienda usar días 1-28 para evitar problemas con meses cortos
          </p>
        </div>
      )}

      {/* One-time - Date Picker */}
      {value.type === 'one_time' && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Fecha específica
          </label>
          <input
            type="date"
            value={value.specificDate || ''}
            onChange={(e) => onChange({ ...value, specificDate: e.target.value })}
            min={new Date().toISOString().split('T')[0]}
            className="w-full md:w-64 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      )}
    </div>
  );
}

/**
 * Get human-readable description of recurrence
 */
export function getRecurrenceDescription(config: RecurrenceConfig): string {
  switch (config.type) {
    case 'daily':
      const days = config.daysOfWeek || [];
      if (days.length === 7) return 'Todos los días';
      if (days.length === 5 && !days.includes('saturday') && !days.includes('sunday')) {
        return 'Lunes a Viernes';
      }
      const dayLabels = days.map(d => daysOfWeek.find(dw => dw.value === d)?.label || d);
      return `${dayLabels.join(', ')}`;
    case 'weekly':
      const weekDay = daysOfWeek.find(d => d.value === config.dayOfWeek)?.fullLabel || config.dayOfWeek;
      return `Cada ${weekDay}`;
    case 'monthly':
      return `Día ${config.dayOfMonth} de cada mes`;
    case 'one_time':
      if (!config.specificDate) return 'Fecha no seleccionada';
      const date = new Date(config.specificDate + 'T00:00:00');
      return date.toLocaleDateString('es-EC', { dateStyle: 'long' });
    default:
      return 'Sin configurar';
  }
}
