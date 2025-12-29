'use client';

import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { ProjectedTripCard, ProjectedTripData } from './ProjectedTripCard';
import { EmptyState, LoadingState } from '@/components/core/states';
import { formatDateDisplay, isToday } from '@/hooks/useProjectedTrips';
import { cn } from '@/lib/utils';

interface TripDayViewProps {
  date: Date;
  trips: ProjectedTripData[];
  isLoading: boolean;
  onDateChange: (date: Date) => void;
  onTripClick?: (trip: ProjectedTripData) => void;
}

export function TripDayView({
  date,
  trips,
  isLoading,
  onDateChange,
  onTripClick,
}: TripDayViewProps) {
  const dateStr = date.toISOString().split('T')[0]!;
  const isTodayDate = isToday(dateStr);

  const goToPrevDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() - 1);
    onDateChange(newDate);
  };

  const goToNextDay = () => {
    const newDate = new Date(date);
    newDate.setDate(date.getDate() + 1);
    onDateChange(newDate);
  };

  const goToToday = () => {
    onDateChange(new Date());
  };

  // Group trips by time slot (morning/afternoon)
  const morningTrips = trips.filter((t) => t.scheduledTime < '12:00');
  const afternoonTrips = trips.filter((t) => t.scheduledTime >= '12:00');

  return (
    <div className="space-y-4">
      {/* Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevDay}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-gray-400" />
            <span className="text-lg font-medium text-gray-900 capitalize">
              {formatDateDisplay(dateStr)}
            </span>
            {isTodayDate && (
              <span className="px-2 py-0.5 text-xs font-medium bg-primary text-white rounded-full">
                Hoy
              </span>
            )}
          </div>
          <button
            onClick={goToNextDay}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <ChevronRight className="w-5 h-5 text-gray-600" />
          </button>
        </div>

        {!isTodayDate && (
          <button
            onClick={goToToday}
            className="px-4 py-2 text-sm font-medium text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
          >
            Ir a Hoy
          </button>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingState message="Cargando viajes..." />
      ) : trips.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title="No hay viajes programados"
          description="No hay rutas programadas para este dia"
        />
      ) : (
        <div className="space-y-6">
          {/* Morning trips */}
          {morningTrips.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Manana ({morningTrips.length})
              </h3>
              <div className="space-y-2">
                {morningTrips.map((trip) => (
                  <ProjectedTripCard
                    key={`${trip.routeId}-${trip.date}`}
                    trip={trip}
                    onClick={onTripClick ? () => onTripClick(trip) : undefined}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Afternoon trips */}
          {afternoonTrips.length > 0 && (
            <div>
              <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
                Tarde ({afternoonTrips.length})
              </h3>
              <div className="space-y-2">
                {afternoonTrips.map((trip) => (
                  <ProjectedTripCard
                    key={`${trip.routeId}-${trip.date}`}
                    trip={trip}
                    onClick={onTripClick ? () => onTripClick(trip) : undefined}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
