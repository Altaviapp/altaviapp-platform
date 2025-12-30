'use client';

import { History, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTripTimeline, getEventConfig, type TripEventType } from '@/hooks';
import { Card, CardContent } from '@/components/core';
import type { Id } from '../../../../../../convex/_generated/dataModel';

interface TripHistorialTabProps {
  tripId: Id<"trips">;
  className?: string;
}

export function TripHistorialTab({ tripId, className }: TripHistorialTabProps) {
  const { events, total, isLoading, isEmpty } = useTripTimeline(tripId);

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
      <Card className={className}>
        <CardContent className="py-12 text-center">
          <History className="w-12 h-12 mx-auto text-gray-300 mb-3" />
          <p className="text-gray-500 font-medium">Sin eventos</p>
          <p className="text-sm text-gray-400">
            El historial aparecera cuando el viaje comience
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      <CardContent className="p-0">
        <div className="p-4 border-b border-gray-100">
          <h3 className="font-semibold text-gray-900">Historial del Viaje</h3>
          <p className="text-sm text-gray-500">{total} eventos registrados</p>
        </div>

        <div className="divide-y divide-gray-100 max-h-[400px] overflow-y-auto">
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
                  'p-3 hover:bg-gray-50',
                  index === 0 && 'bg-primary/5'
                )}
              >
                <div className="flex items-start gap-3">
                  <div className={cn(
                    'w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0',
                    config.bgColor
                  )}>
                    {config.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{event.title}</p>
                    {event.description && (
                      <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">{time}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
