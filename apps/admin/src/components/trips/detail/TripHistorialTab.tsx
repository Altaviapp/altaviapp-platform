'use client';

import { useTripTimeline, getEventConfig, type TripEventType } from '@/hooks';
import { Loader2, History, MapPin, User, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Id } from '../../../../../../convex/_generated/dataModel';

interface TripHistorialTabProps {
  tripId: Id<'trips'> | null;
  className?: string;
}

export function TripHistorialTab({ tripId, className }: TripHistorialTabProps) {
  const { events, isLoading, isEmpty, total } = useTripTimeline(tripId);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
        <span className="ml-2 text-gray-500">Cargando historial...</span>
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="p-12 text-center">
        <History className="w-12 h-12 mx-auto text-gray-300 mb-3" />
        <p className="text-gray-500 font-medium">Sin eventos</p>
        <p className="text-sm text-gray-400">
          El historial de eventos aparecerá aquí cuando inicie el viaje
        </p>
      </div>
    );
  }

  return (
    <div className={cn('bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden', className)}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900">Historial del Viaje</h3>
            <p className="text-sm text-gray-500">{total} eventos registrados</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            En tiempo real
          </div>
        </div>
      </div>

      <div className="divide-y divide-gray-100 max-h-[600px] overflow-y-auto">
        {events.map((event, index) => {
          const config = getEventConfig(event.type as TripEventType);
          const time = new Date(event.timestamp).toLocaleTimeString('es-EC', {
            hour: '2-digit',
            minute: '2-digit',
          });

          return (
            <div
              key={event._id}
              className={cn(
                'p-4 hover:bg-gray-50 transition-colors',
                index === 0 && 'bg-blue-50/50'
              )}
            >
              <div className="flex items-start gap-3">
                {/* Icon */}
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 text-lg',
                    config.bgColor
                  )}
                >
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-gray-900">{event.title}</p>
                    {index === 0 && (
                      <span className="px-1.5 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded">
                        Último
                      </span>
                    )}
                  </div>

                  {event.description && (
                    <p className="text-sm text-gray-600 mt-0.5">{event.description}</p>
                  )}

                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    {/* Time */}
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {time}
                    </div>

                    {/* Stop name if available */}
                    {event.stopName && (
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {event.stopName}
                      </div>
                    )}

                    {/* Student name if available */}
                    {event.studentName && (
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        {event.studentName}
                      </div>
                    )}

                    {/* Actor role if available */}
                    {event.actorRole && (
                      <span className="capitalize">
                        por {event.actorRole === 'driver' ? 'Conductor' :
                             event.actorRole === 'monitor' ? 'Monitor' :
                             event.actorRole === 'admin' ? 'Admin' :
                             event.actorRole === 'parent' ? 'Padre' :
                             'Sistema'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Time badge on right */}
                <div className="text-right text-xs text-gray-400 flex-shrink-0">
                  {time}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
