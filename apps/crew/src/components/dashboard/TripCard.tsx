import Link from 'next/link';
import { Sunrise, Sunset, Clock, MapPin, Users } from 'lucide-react';
import type { TripWithDetails } from '@/types';
import { StatusBadge } from '@/components/shared/StatusBadge';
import { formatTime } from '@/lib/utils/dates';
import { formatCapacity } from '@/lib/utils/formatters';

interface TripCardProps {
  trip: TripWithDetails;
  variant?: 'primary' | 'secondary';
  showChecklist?: boolean; // If true, show checklist button (for drivers). If false, show "Ver viaje" (for monitors)
}

export function TripCard({ trip, variant = 'secondary', showChecklist = true }: TripCardProps) {
  const isInbound = trip.type === 'inbound';
  const Icon = isInbound ? Sunrise : Sunset;
  const typeBadge = isInbound ? 'VIAJE DE IDA' : 'VIAJE DE VUELTA';

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Icon className={isInbound ? 'w-5 h-5 text-warning' : 'w-5 h-5 text-info'} />
          <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">
            {typeBadge}
          </span>
        </div>
        <StatusBadge status={trip.status} />
      </div>

      {/* Route Name */}
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        {trip.route.name}
      </h3>

      {/* Trip Details */}
      <div className="space-y-2 mb-4">
        {/* Schedule */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Clock className="w-4 h-4" />
          <span>
            {formatTime(trip.scheduledStartTime)} - {formatTime(trip.scheduledEndTime)}
          </span>
        </div>

        {/* Stops */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <MapPin className="w-4 h-4" />
          <span>{trip.stops.length} paradas</span>
        </div>

        {/* Students */}
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <Users className="w-4 h-4" />
          <span>
            {formatCapacity(trip.studentsAssigned.length, trip.vehicle.capacity)} estudiantes
          </span>
        </div>
      </div>

      {/* Action Button */}
      {variant === 'primary' && trip.status === 'scheduled' ? (
        showChecklist ? (
          // Driver: go to checklist first
          <Link
            href={`/trips/${trip._id}/checklist`}
            className="block w-full bg-accent hover:bg-accent/90 text-primary font-bold py-3 px-4 rounded-lg text-center transition-colors"
          >
            INICIAR VIAJE
          </Link>
        ) : (
          // Monitor: go directly to active trip (they don't do checklist)
          <Link
            href={`/trips/${trip._id}/active`}
            className="block w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors"
          >
            VER VIAJE
          </Link>
        )
      ) : trip.status === 'in_progress' ? (
        // Trip in progress - both roles can see active trip
        <Link
          href={`/trips/${trip._id}/active`}
          className="block w-full bg-primary hover:bg-primary/90 text-white font-bold py-3 px-4 rounded-lg text-center transition-colors"
        >
          VER VIAJE ACTIVO
        </Link>
      ) : (
        <Link
          href={`/trips/${trip._id}`}
          className="block w-full text-center px-4 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
        >
          Ver detalles →
        </Link>
      )}
    </div>
  );
}
