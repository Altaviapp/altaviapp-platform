'use client';

import { Bus } from 'lucide-react';
import { useWeeklySchedule } from '@/hooks';
import { DayScheduleCard } from '@/components/calendar';
import { LoadingState, EmptyState } from '@/components/core';
import { PageHeader } from '@/components/shared';

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
      <div className="space-y-4 pb-20">
        <PageHeader
          title="Calendario Semanal"
          subtitle="Viajes programados de tus hijos para esta semana"
        />
        <LoadingState message="Cargando calendario..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <PageHeader
        title="Calendario Semanal"
        subtitle="Viajes programados de tus hijos para esta semana"
      />

      {!hasSchedule ? (
        <EmptyState
          icon={Bus}
          title="Sin rutas asignadas"
          description="Tus hijos no tienen rutas asignadas todavía. Contacta a tu institución para más información."
        />
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
