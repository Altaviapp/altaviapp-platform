'use client';

import { useState, useMemo } from 'react';
import { Bus, ChevronLeft, ChevronRight } from 'lucide-react';
import { useCrewProjectedTrips } from '@/hooks';
import { DayScheduleCard } from '@/components/schedule';
import { LoadingState, EmptyState } from '@/components/core';
import { PageHeader } from '@/components/shared';

const WEEK_DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
] as const;

export default function CalendarPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const MAX_WEEKS_AHEAD = 4;

  // Calculate week range based on offset
  const { startDate, endDate, weekDates } = useMemo(() => {
    const today = new Date();
    // Adjust to start of week (Monday)
    const dayOfWeek = today.getDay();
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek; // Monday is 1

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() + diff + (weekOffset * 7));
    startOfWeek.setHours(0, 0, 0, 0);

    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);

    // Generate dates for each day of the week
    const dates: Record<string, string> = {};
    const daysOrder = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    daysOrder.forEach((day, index) => {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + index);
      dates[day] = date.toISOString().split('T')[0]!;
    });

    return {
      startDate: startOfWeek.toISOString().split('T')[0]!,
      endDate: endOfWeek.toISOString().split('T')[0]!,
      weekDates: dates,
    };
  }, [weekOffset]);

  const { groupedByDate, isLoading, isEmpty } = useCrewProjectedTrips(startDate, endDate);

  // Get current day for highlighting
  const today = new Date();
  const todayString = today.toISOString().split('T')[0];

  // Format week range for display
  const weekLabel = useMemo(() => {
    const start = new Date(startDate);
    const end = new Date(endDate);

    const startDay = start.getDate();
    const endDay = end.getDate();
    const startMonth = start.toLocaleDateString('es', { month: 'short' });
    const endMonth = end.toLocaleDateString('es', { month: 'short' });

    if (startMonth === endMonth) {
      return `${startDay} - ${endDay} ${startMonth}`;
    }
    return `${startDay} ${startMonth} - ${endDay} ${endMonth}`;
  }, [startDate, endDate]);

  // Navigation handlers
  const canGoBack = weekOffset > 0;
  const canGoForward = weekOffset < MAX_WEEKS_AHEAD;

  const goToPreviousWeek = () => {
    if (canGoBack) setWeekOffset((prev) => prev - 1);
  };

  const goToNextWeek = () => {
    if (canGoForward) setWeekOffset((prev) => prev + 1);
  };

  const goToToday = () => {
    setWeekOffset(0);
  };

  // Format day label with date
  const formatDayLabel = (dayLabel: string, dateStr: string) => {
    const date = new Date(dateStr + 'T12:00:00');
    const dayNum = date.getDate();
    return `${dayLabel} ${dayNum}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-4 pb-20">
        <PageHeader
          title="Calendario de Viajes"
          subtitle="Tus rutas programadas"
        />
        <LoadingState message="Cargando calendario..." />
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-20">
      <PageHeader
        title="Calendario de Viajes"
        subtitle="Tus rutas programadas"
      />

      {/* Week navigation */}
      <div className="bg-white rounded-xl border border-gray-200 p-3">
        <div className="flex items-center justify-between">
          <button
            onClick={goToPreviousWeek}
            disabled={!canGoBack}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Semana anterior"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>

          <div className="flex items-center gap-3">
            <span className="font-semibold text-gray-900 capitalize">{weekLabel}</span>
            {weekOffset !== 0 && (
              <button
                onClick={goToToday}
                className="px-3 py-1 text-xs font-medium text-primary bg-primary/10 rounded-full hover:bg-primary/20 transition-colors"
              >
                Hoy
              </button>
            )}
          </div>

          <button
            onClick={goToNextWeek}
            disabled={!canGoForward}
            className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Semana siguiente"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>
      </div>

      {/* Calendar days */}
      {isEmpty ? (
        <EmptyState
          icon={Bus}
          title="Sin rutas asignadas"
          description="No tienes rutas asignadas todavía. Contacta a tu coordinador para más información."
        />
      ) : (
        <div className="space-y-4">
          {WEEK_DAYS.map(({ key, label }) => {
            const dateStr = weekDates[key];
            const dayTrips = dateStr ? groupedByDate[dateStr] ?? [] : [];
            const isToday = dateStr === todayString;

            return (
              <DayScheduleCard
                key={`${key}-${dateStr}`}
                dayLabel={formatDayLabel(label, dateStr ?? '')}
                dayName={key}
                trips={dayTrips.map((trip) => ({
                  routeId: trip.routeId,
                  routeName: trip.routeName,
                  routeType: trip.routeType,
                  vehiclePlate: trip.vehiclePlate,
                  scheduledTime: trip.scheduledTime,
                  status: trip.status,
                  tripId: trip.tripId,
                  studentCount: trip.studentCount,
                  novedadCount: trip.novedadCount,
                  role: trip.role,
                }))}
                isToday={isToday}
                date={dateStr}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
