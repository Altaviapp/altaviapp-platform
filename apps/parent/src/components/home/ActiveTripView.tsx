'use client';

import { Phone, MessageCircle, MapPin, Clock, User, Car, AlertTriangle } from 'lucide-react';
import { LiveTrackingMap, RouteStop } from '@/components/tracking/LiveTrackingMap';
import { NovedadContextButton } from './NovedadContextButton';
import { Id } from '../../../../../convex/_generated/dataModel';
import { formatTime } from '@/lib/utils';

interface ActiveTripViewProps {
  tracking: {
    trip?: {
      id: Id<"trips">;
      status: string;
      scheduledDate?: string;
    } | null;
    route?: {
      id: Id<"routes">;
      name: string;
      type?: string;
      optimizedPolyline?: string | null;
    } | null;
    currentLocation?: {
      latitude: number;
      longitude: number;
      speed?: number | null;
      heading?: number | null;
      timestamp?: number;
    } | null;
    stops?: Array<{
      id: Id<"routeStops">;
      name: string;
      lat: number;
      lng: number;
      scheduledTime?: string;
      completed?: boolean;
      order: number;
    }>;
    studentStop?: {
      id: Id<"routeStops">;
      name: string;
      lat: number;
      lng: number;
      scheduledTime?: string;
    } | null;
    vehicle?: {
      id: Id<"vehicles">;
      licensePlate: string;
      brand?: string;
      model?: string;
      capacity?: number;
    } | null;
    driver?: {
      name: string;
      phone?: string;
    } | null;
    school?: {
      name: string;
      latitude?: number;
      longitude?: number;
    } | null;
    etaMinutes?: number | null;
  };
  studentId: Id<"students">;
  studentName: string;
}

export function ActiveTripView({ tracking, studentId, studentName }: ActiveTripViewProps) {
  // Transform stops for map component
  const mapStops: RouteStop[] = (tracking.stops ?? []).map(stop => ({
    id: stop.id,
    name: stop.name,
    lat: stop.lat,
    lng: stop.lng,
    scheduledTime: stop.scheduledTime,
    completed: stop.completed,
    isSchool: false,
  }));

  // Vehicle location for map
  const vehicleLocation = tracking.currentLocation ? {
    lat: tracking.currentLocation.latitude,
    lng: tracking.currentLocation.longitude,
    speed: tracking.currentLocation.speed,
    heading: tracking.currentLocation.heading,
    timestamp: tracking.currentLocation.timestamp,
  } : null;

  // School location for map
  const schoolLocation = tracking.school?.latitude && tracking.school?.longitude ? {
    lat: tracking.school.latitude,
    lng: tracking.school.longitude,
    name: tracking.school.name,
  } : undefined;

  // Format phone for WhatsApp link
  const formatWhatsAppLink = (phone?: string) => {
    if (!phone) return null;
    const cleanPhone = phone.replace(/\D/g, '');
    return `https://wa.me/${cleanPhone}`;
  };

  return (
    <div className="border-t border-gray-100">
      {/* Map */}
      <div className="h-[280px]">
        <LiveTrackingMap
          vehicleLocation={vehicleLocation}
          stops={mapStops}
          schoolLocation={schoolLocation}
          studentStopId={tracking.studentStop?.id}
          height="280px"
          autoCenter={true}
          encodedPolyline={tracking.route?.optimizedPolyline ?? undefined}
          vehicleInfo={tracking.vehicle && tracking.driver ? {
            plate: tracking.vehicle.licensePlate,
            driverName: tracking.driver.name,
          } : undefined}
        />
      </div>

      {/* Trip info panel */}
      <div className="p-4 space-y-4">
        {/* Student's stop info */}
        {tracking.studentStop && (
          <div className="bg-accent/10 rounded-lg p-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center flex-shrink-0">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-900">
                  Tu parada: {tracking.studentStop.name}
                </p>
                {tracking.etaMinutes !== null && tracking.etaMinutes !== undefined && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                    Llegada estimada: ~{tracking.etaMinutes} min
                  </p>
                )}
                {tracking.studentStop.scheduledTime && !tracking.etaMinutes && (
                  <p className="text-sm text-gray-600 mt-0.5">
                    <Clock className="w-3.5 h-3.5 inline mr-1" />
                    Hora programada: {tracking.studentStop.scheduledTime}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Driver & Vehicle info */}
        {(tracking.driver || tracking.vehicle) && (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Driver */}
              {tracking.driver && (
                <div className="flex items-center gap-2">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tracking.driver.name}</p>
                    <p className="text-xs text-gray-500">Conductor</p>
                  </div>
                </div>
              )}

              {/* Vehicle */}
              {tracking.vehicle && (
                <div className="flex items-center gap-2 ml-4">
                  <div className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center">
                    <Car className="w-4 h-4 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">{tracking.vehicle.licensePlate}</p>
                    <p className="text-xs text-gray-500">
                      {tracking.vehicle.brand} {tracking.vehicle.model}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Contact buttons */}
            {tracking.driver?.phone && (
              <div className="flex items-center gap-2">
                <a
                  href={`tel:${tracking.driver.phone}`}
                  className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
                  title="Llamar"
                >
                  <Phone className="w-4 h-4 text-primary" />
                </a>
                {formatWhatsAppLink(tracking.driver.phone) && (
                  <a
                    href={formatWhatsAppLink(tracking.driver.phone)!}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition-colors"
                    title="WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4 text-green-600" />
                  </a>
                )}
              </div>
            )}
          </div>
        )}

        {/* Report novedad button */}
        <NovedadContextButton
          studentId={studentId}
          tripId={tracking.trip?.id}
          variant="full"
          label="Reportar novedad de este viaje"
        />
      </div>
    </div>
  );
}
