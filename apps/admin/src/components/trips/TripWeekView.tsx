'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { ProjectedTripRow, ProjectedTripData } from './ProjectedTripCard';
import { LoadingState } from '@/components/core/states';
import { isToday } from '@/hooks/useProjectedTrips';
import { cn } from '@/lib/utils';

interface TripWeekViewProps {
  weekStart: Date;
  tripsByDate: { date: string; trips: ProjectedTripData[] }[];
  isLoading: boolean;
  onWeekChange: (weekStart: Date) => void;
  onDayClick: (date: Date) => void;
  onTripClick?: (trip: ProjectedTripData) => void;
}

const DAY_NAMES = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'];

export function TripWeekView({
  weekStart,
  tripsByDate,
  isLoading,
  onWeekChange,
  onDayClick,
  onTripClick,
}: TripWeekViewProps) {
  // Generate week dates
  const weekDates: Date[] = [];
  for (let i = 0; i < 7; i++) {
    const date = new Date(weekStart);
    date.setDate(weekStart.getDate() + i);
    weekDates.push(date);
  }

  const weekEnd = weekDates[6]!;

  // Create a map of date -> trips
  const tripsMap = new Map<string, ProjectedTripData[]>();
  for (const group of tripsByDate) {
    tripsMap.set(group.date, group.trips);
  }

  const goToPrevWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() - 7);
    onWeekChange(newStart);
  };

  const goToNextWeek = () => {
    const newStart = new Date(weekStart);
    newStart.setDate(weekStart.getDate() + 7);
    onWeekChange(newStart);
  };

  const formatWeekRange = () => {
    const startMonth = weekStart.toLocaleDateString('es-EC', { month: 'short' });
    const endMonth = weekEnd.toLocaleDateString('es-EC', { month: 'short' });
    const startDay = weekStart.getDate();
    const endDay = weekEnd.getDate();

    if (startMonth === endMonth) {
      return `${startDay} - ${endDay} ${startMonth} ${weekStart.getFullYear()}`;
    }
    return `${startDay} ${startMonth} - ${endDay} ${endMonth} ${weekStart.getFullYear()}`;
  };

  if (isLoading) {
    return <LoadingState message="Cargando viajes..." />;
  }

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={goToPrevWeek}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>
        <span className="text-lg font-medium text-gray-900 capitalize">
          Semana del {formatWeekRange()}
        </span>
        <button
          onClick={goToNextWeek}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Week grid */}
      <div className="grid grid-cols-7 gap-2">
        {weekDates.map((date) => {
          const dateStr = date.toISOString().split('T')[0]!;
          const dayTrips = tripsMap.get(dateStr) || [];
          const isTodayDate = isToday(dateStr);

          return (
            <div
              key={dateStr}
              className={cn(
                'min-h-[200px] border rounded-lg overflow-hidden',
                isTodayDate ? 'border-primary bg-primary/5' : 'border-gray-200'
              )}
            >
              {/* Day header */}
              <button
                onClick={() => onDayClick(date)}
                className={cn(
                  'w-full px-2 py-2 text-center border-b transition-colors',
                  isTodayDate
                    ? 'bg-primary text-white'
                    : 'bg-gray-50 hover:bg-gray-100'
                )}
              >
                <div className="text-xs font-medium">
                  {DAY_NAMES[date.getDay()]}
                </div>
                <div className={cn(
                  'text-lg font-bold',
                  isTodayDate ? 'text-white' : 'text-gray-900'
                )}>
                  {date.getDate()}
                </div>
              </button>

              {/* Trips list */}
              <div className="p-1 space-y-1 max-h-[160px] overflow-y-auto">
                {dayTrips.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-400">
                    Sin viajes
                  </div>
                ) : (
                  dayTrips.slice(0, 6).map((trip) => (
                    <ProjectedTripRow
                      key={`${trip.routeId}-${trip.date}`}
                      trip={trip}
                      onClick={onTripClick ? () => onTripClick(trip) : undefined}
                    />
                  ))
                )}
                {dayTrips.length > 6 && (
                  <button
                    onClick={() => onDayClick(date)}
                    className="w-full text-xs text-primary hover:underline py-1"
                  >
                    +{dayTrips.length - 6} mas
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
