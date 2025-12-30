'use client';

import { Calendar } from 'lucide-react';
import { TripScheduleItem } from './TripScheduleItem';
import { Id } from '../../../../../convex/_generated/dataModel';

interface Trip {
  studentId: Id<"students">;
  studentName: string;
  studentPhoto?: string | null;
  routeId: Id<"routes">;
  routeName: string;
  routeType: 'pickup' | 'dropoff';
  stopName: string;
  scheduledTime: string;
  stopId?: Id<"routeStops">;
  tripId?: Id<"trips">; // Only exists if trip has started
  hasNovedad?: boolean;
  novedadStatus?: 'pending' | 'approved' | 'rejected';
}

interface DayScheduleCardProps {
  dayLabel: string;
  dayName: string;
  trips: Trip[];
  isToday?: boolean;
  date?: string; // YYYY-MM-DD for the specific date
}

export function DayScheduleCard({
  dayLabel,
  dayName,
  trips,
  isToday = false,
  date,
}: DayScheduleCardProps) {
  const hasTrips = trips.length > 0;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      {/* Day header */}
      <div className={`px-4 py-3 border-b border-gray-100 ${isToday ? 'bg-accent/10' : 'bg-gray-50'}`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className={`w-4 h-4 ${isToday ? 'text-primary' : 'text-gray-400'}`} />
            <h3 className={`font-semibold ${isToday ? 'text-primary' : 'text-gray-900'}`}>
              {dayLabel}
            </h3>
            {isToday && (
              <span className="px-2 py-0.5 bg-primary text-white text-xs font-medium rounded-full">
                Hoy
              </span>
            )}
          </div>
          {hasTrips && (
            <span className="text-xs text-gray-500">
              {trips.length} {trips.length === 1 ? 'viaje' : 'viajes'}
            </span>
          )}
        </div>
      </div>

      {/* Trips list */}
      <div className="p-3">
        {hasTrips ? (
          <div className="space-y-2">
            {trips.map((trip, index) => (
              <TripScheduleItem
                key={`${trip.studentId}-${trip.routeId}-${trip.routeType}-${index}`}
                studentId={trip.studentId}
                studentName={trip.studentName}
                studentPhoto={trip.studentPhoto}
                routeId={trip.routeId}
                routeName={trip.routeName}
                routeType={trip.routeType}
                stopName={trip.stopName}
                scheduledTime={trip.scheduledTime}
                date={date!}
                tripId={trip.tripId}
                hasNovedad={trip.hasNovedad}
                novedadStatus={trip.novedadStatus}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-4">
            <p className="text-sm text-gray-500">Sin viajes programados</p>
          </div>
        )}
      </div>
    </div>
  );
}
