'use client';

import { useQuery } from 'convex/react';
import { api } from '@workspace/backend/convex/_generated/api';
import { Id } from '@workspace/backend/convex/_generated/dataModel';
import {
  Bus,
  MapPin,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Flag,
  Clock,
  User,
  Navigation,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TripTimelineProps {
  tripId: string;
  className?: string;
}

// Map event types to icons and colors
const eventConfig: Record<string, { icon: typeof Bus; color: string; bgColor: string }> = {
  trip_started: { icon: Bus, color: 'text-primary', bgColor: 'bg-primary/10' },
  trip_completed: { icon: Flag, color: 'text-success', bgColor: 'bg-success/10' },
  trip_cancelled: { icon: AlertTriangle, color: 'text-error', bgColor: 'bg-error/10' },
  arrived_at_stop: { icon: MapPin, color: 'text-info', bgColor: 'bg-info/10' },
  departed_from_stop: { icon: Navigation, color: 'text-gray-500', bgColor: 'bg-gray-100' },
  student_checkin: { icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10' },
  student_checkout: { icon: CheckCircle, color: 'text-primary', bgColor: 'bg-primary/10' },
  student_absent: { icon: User, color: 'text-warning', bgColor: 'bg-warning/10' },
  checklist_completed: { icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10' },
  relay_mode_activated: { icon: RefreshCw, color: 'text-warning', bgColor: 'bg-warning/10' },
  relay_mode_deactivated: { icon: RefreshCw, color: 'text-gray-500', bgColor: 'bg-gray-100' },
  incident_reported: { icon: AlertTriangle, color: 'text-error', bgColor: 'bg-error/10' },
  incident_resolved: { icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10' },
  novedad_reported: { icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10' },
  novedad_approved: { icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10' },
  novedad_rejected: { icon: AlertTriangle, color: 'text-error', bgColor: 'bg-error/10' },
  gps_lost: { icon: AlertTriangle, color: 'text-warning', bgColor: 'bg-warning/10' },
  gps_restored: { icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10' },
  geofence_entered: { icon: MapPin, color: 'text-info', bgColor: 'bg-info/10' },
  geofence_exited: { icon: MapPin, color: 'text-gray-500', bgColor: 'bg-gray-100' },
};

const defaultConfig = { icon: Clock, color: 'text-gray-500', bgColor: 'bg-gray-100' };

function formatTime(timestamp: number): string {
  return new Date(timestamp).toLocaleTimeString('es-EC', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);

  if (minutes < 1) return 'Ahora';
  if (minutes < 60) return `Hace ${minutes} min`;
  if (hours < 24) return `Hace ${hours}h`;
  return formatTime(timestamp);
}

export function TripTimeline({ tripId, className }: TripTimelineProps) {
  const timeline = useQuery(api.tripEvents.getTripFullTimeline, {
    tripId: tripId as Id<'trips'>,
  });

  if (!timeline) {
    return (
      <div className={cn('space-y-3', className)}>
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex gap-3 animate-pulse">
            <div className="w-8 h-8 rounded-full bg-gray-200" />
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4" />
              <div className="h-3 bg-gray-200 rounded w-1/2" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (timeline.length === 0) {
    return (
      <div className={cn('text-center py-8', className)}>
        <Clock className="w-12 h-12 text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 text-sm">No hay eventos registrados</p>
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {timeline.map((event, index) => {
        const config = eventConfig[event.type] || defaultConfig;
        const Icon = config.icon;
        const isLast = index === timeline.length - 1;

        return (
          <div key={event.id} className="flex gap-3">
            {/* Timeline line and icon */}
            <div className="flex flex-col items-center">
              <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', config.bgColor)}>
                <Icon className={cn('w-4 h-4', config.color)} />
              </div>
              {!isLast && (
                <div className="w-0.5 flex-1 bg-gray-200 my-1" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 pb-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium text-gray-900">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                  )}
                  {event.studentName && !event.title.includes(event.studentName) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Estudiante: {event.studentName}
                    </p>
                  )}
                  {event.stopName && !event.title.includes(event.stopName) && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      Parada: {event.stopName}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <p className="text-xs text-gray-400">{formatTime(event.timestamp)}</p>
                  <p className="text-xs text-gray-300">{formatRelativeTime(event.timestamp)}</p>
                </div>
              </div>
              {event.actorRole && (
                <span className={cn(
                  'inline-block mt-1 text-xs px-2 py-0.5 rounded-full',
                  event.actorRole === 'driver' ? 'bg-primary/10 text-primary' :
                  event.actorRole === 'monitor' ? 'bg-info/10 text-info' :
                  event.actorRole === 'admin' ? 'bg-warning/10 text-warning' :
                  event.actorRole === 'system' ? 'bg-gray-100 text-gray-500' :
                  'bg-gray-100 text-gray-500'
                )}>
                  {event.actorRole === 'driver' ? 'Conductor' :
                   event.actorRole === 'monitor' ? 'Monitor' :
                   event.actorRole === 'admin' ? 'Admin' :
                   event.actorRole === 'parent' ? 'Padre' :
                   event.actorRole === 'system' ? 'Sistema' : event.actorRole}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
