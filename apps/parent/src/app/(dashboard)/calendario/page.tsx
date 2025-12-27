'use client';

import { Calendar, Bus } from 'lucide-react';
import { useWeeklySchedule } from '@/hooks';
import { DayScheduleCard } from '@/components/calendar';
import { LoadingState } from '@/components/shared/LoadingState';

export default function CalendarioPage() {
  const { weekdaySchedule, isLoading, hasSchedule } = useWeeklySchedule();

  // Get current day name
  const today = new Date();
  const currentDayName = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][today.getDay()];

  // Get date string for a given day of the week (for this week)
  const getDateForDay = (dayName: string): string => {
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const todayIndex = today.getDay();
    const targetIndex = days.indexOf(dayName);
    const diff = targetIndex - todayIndex;

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + diff);

    return targetDate.toISOString().split('T')[0] ?? '';
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        {/* Header skeleton */}
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-48 mb-2" />
          <div className="h-4 bg-gray-100 rounded w-64" />
        </div>

        {/* Cards skeleton */}
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <LoadingState key={i} variant="card" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calendar className="w-6 h-6 text-primary" />
          Calendario Semanal
        </h1>
        <p className="text-gray-500 mt-1">
          Viajes programados de tus hijos para esta semana
        </p>
      </div>

      {/* Weekly schedule */}
      {!hasSchedule ? (
        <div className="bg-white rounded-xl border border-gray-200 p-8 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bus className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-1">Sin rutas asignadas</h3>
          <p className="text-sm text-gray-500">
            Tus hijos no tienen rutas asignadas todavía. Contacta a tu institución para más información.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {weekdaySchedule.map((day) => (
            <DayScheduleCard
              key={day.dayName}
              dayLabel={day.dayLabel}
              dayName={day.dayName}
              trips={day.trips}
              isToday={day.dayName === currentDayName}
              date={getDateForDay(day.dayName)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
