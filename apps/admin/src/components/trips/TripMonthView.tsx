'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { LoadingState } from '@/components/core/states';
import { isToday } from '@/hooks/useProjectedTrips';
import { cn } from '@/lib/utils';

interface TripMonthViewProps {
  year: number;
  month: number; // 1-12
  countByDay: Record<string, { total: number; active: number; completed: number }>;
  isLoading: boolean;
  onMonthChange: (year: number, month: number) => void;
  onDayClick: (date: Date) => void;
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];
const MONTH_NAMES = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export function TripMonthView({
  year,
  month,
  countByDay,
  isLoading,
  onMonthChange,
  onDayClick,
}: TripMonthViewProps) {
  // Generate calendar days
  const firstDayOfMonth = new Date(year, month - 1, 1);
  const lastDayOfMonth = new Date(year, month, 0);
  const startingDayOfWeek = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  // Create calendar grid (6 weeks x 7 days)
  const calendarDays: (Date | null)[] = [];

  // Add empty days before first day
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Add days of month
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(new Date(year, month - 1, day));
  }

  // Add empty days to complete last week
  while (calendarDays.length % 7 !== 0) {
    calendarDays.push(null);
  }

  const goToPrevMonth = () => {
    if (month === 1) {
      onMonthChange(year - 1, 12);
    } else {
      onMonthChange(year, month - 1);
    }
  };

  const goToNextMonth = () => {
    if (month === 12) {
      onMonthChange(year + 1, 1);
    } else {
      onMonthChange(year, month + 1);
    }
  };

  if (isLoading) {
    return <LoadingState message="Cargando calendario..." />;
  }

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="text-lg font-medium text-gray-900">
          {MONTH_NAMES[month - 1]} {year}
        </span>
        <button
          onClick={goToNextMonth}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Calendar grid */}
      <div className="border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <div className="grid grid-cols-7 bg-gray-50 border-b border-gray-200">
          {DAY_NAMES.map((day) => (
            <div
              key={day}
              className="px-2 py-3 text-center text-sm font-medium text-gray-500"
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {calendarDays.map((date, index) => {
            if (!date) {
              return (
                <div
                  key={`empty-${index}`}
                  className="min-h-[80px] p-2 bg-gray-50 border-b border-r border-gray-100"
                />
              );
            }

            const dateStr = date.toISOString().split('T')[0]!;
            const dayData = countByDay[dateStr];
            const tripCount = dayData?.total || 0;
            const activeCount = dayData?.active || 0;
            const completedCount = dayData?.completed || 0;
            const isTodayDate = isToday(dateStr);
            const isWeekend = date.getDay() === 0 || date.getDay() === 6;

            return (
              <button
                key={dateStr}
                onClick={() => onDayClick(date)}
                className={cn(
                  'min-h-[80px] p-2 text-left border-b border-r border-gray-100 transition-colors',
                  'hover:bg-gray-50',
                  isTodayDate && 'bg-primary/5 border-primary/20',
                  isWeekend && !tripCount && 'bg-gray-50/50'
                )}
              >
                {/* Day number */}
                <div className={cn(
                  'text-sm font-medium mb-1',
                  isTodayDate ? 'text-primary' : 'text-gray-900'
                )}>
                  {isTodayDate ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 bg-primary text-white rounded-full text-xs">
                      {date.getDate()}
                    </span>
                  ) : (
                    date.getDate()
                  )}
                </div>

                {/* Trip count badge */}
                {tripCount > 0 && (
                  <div className="flex flex-wrap gap-1">
                    <span className={cn(
                      'inline-flex items-center justify-center min-w-[20px] px-1.5 py-0.5 text-xs font-medium rounded-full',
                      activeCount > 0
                        ? 'bg-green-100 text-green-700'
                        : completedCount === tripCount
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-blue-100 text-blue-700'
                    )}>
                      {tripCount}
                    </span>
                    {activeCount > 0 && (
                      <span className="inline-flex items-center justify-center w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    )}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center gap-4 text-xs text-gray-500">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-blue-100 rounded-full" />
          <span>Proyectado</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-green-100 rounded-full" />
          <span>En curso</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 bg-gray-100 rounded-full" />
          <span>Completado</span>
        </div>
      </div>
    </div>
  );
}
