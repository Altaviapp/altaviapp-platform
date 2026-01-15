'use client';

/**
 * Trip Monitoring Page - Parent App
 *
 * Full-page live tracking view for a student's active trip.
 * Similar to crew active trip page but read-only (no actions).
 */

import { useState, useMemo, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ChevronLeft,
  Loader2,
  AlertTriangle,
  MapPin,
  Sunrise,
  Sunset,
  Crosshair,
} from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  GoogleMapsProvider,
  GoogleRouteMap,
  type RouteStopMarker,
  type VehiclePosition,
  type StopStatus,
  decodePolyline,
} from '@altaviapp/maps';
import { useStudentTracking, useStudentWithPhoto } from '@/hooks';
import { NextStopInfoCard } from '@/components/tracking/NextStopInfoCard';
import { VehicleInfoCard } from '@/components/tracking/VehicleInfoCard';
import { StopsTimeline } from '@/components/tracking/StopsTimeline';
import { ProgressBar } from '@/components/tracking/ProgressBar';
import { Id } from '../../../../../../../convex/_generated/dataModel';

export default function TripMonitoringPage() {
  const params = useParams();
  const router = useRouter();
  const studentId = params.studentId as string;

  // Map reference for centering
  const [mapRef, setMapRef] = useState<google.maps.Map | null>(null);

  // Fetch student data
  const { student, isLoading: studentLoading } = useStudentWithPhoto(
    studentId ? (studentId as Id<'students'>) : null
  );

  // Fetch tracking data
  const {
    isLoading: trackingLoading,
    hasActiveTrip,
    currentLocation,
    route,
    stops,
    studentStop,
    vehicle,
    driver,
    school,
    etaMinutes,
    etaTime,
    distanceKm,
    delayStatus,
    currentSpeed,
    completedStops,
    totalStops,
    currentStopIndex,
    lastGPSUpdate,
  } = useStudentTracking(studentId ? (studentId as Id<'students'>) : null);

  const isLoading = studentLoading || trackingLoading;
  const isPickup = route?.type === 'pickup';

  // Transform stops for GoogleRouteMap
  const mapStops: RouteStopMarker[] = useMemo(() => {
    return (stops ?? []).map((stop, index) => {
      let status: StopStatus = 'pending';
      if (stop.completed) {
        status = 'completed';
      } else if (stop.id === studentStop?.id) {
        status = 'current';
      }

      return {
        id: String(stop.id),
        name: stop.name,
        address: stop.address ?? '',
        position: { lat: stop.lat, lng: stop.lng },
        order: index + 1,
        status,
        scheduledTime: stop.scheduledTime ?? undefined,
        eta: stop.etaTime ?? undefined,
      };
    });
  }, [stops, studentStop?.id]);

  // School position for map
  const schoolPosition = school
    ? { lat: school.lat, lng: school.lng }
    : undefined;

  // Vehicle position for map
  const vehiclePosition: VehiclePosition | null = useMemo(() => {
    if (!currentLocation) return null;
    return {
      position: {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
      },
      heading: currentLocation.heading ?? 0,
      speed: (currentLocation.speed ?? 0) * 3.6, // m/s to km/h
      accuracy: 10,
      timestamp: currentLocation.timestamp,
    };
  }, [currentLocation]);

  // Route polyline
  const routePolyline = useMemo(() => {
    if (route?.optimizedPolyline) {
      return decodePolyline(route.optimizedPolyline);
    }
    // Fallback: simple line through stops
    return mapStops.map((s) => s.position);
  }, [route?.optimizedPolyline, mapStops]);

  // Completed stop index for differentiated polyline
  const completedStopIdx = completedStops > 0 ? completedStops - 1 : undefined;

  // Stops for timeline
  const timelineStops = useMemo(() => {
    return (stops ?? []).map((stop) => ({
      id: String(stop.id),
      name: stop.name,
      scheduledTime: stop.scheduledTime ?? undefined,
      completed: !!stop.completed,
    }));
  }, [stops]);

  // Handle map load
  const handleMapLoad = useCallback((map: google.maps.Map) => {
    setMapRef(map);
  }, []);

  // Center map on vehicle
  const handleCenterOnVehicle = useCallback(() => {
    if (mapRef && vehiclePosition) {
      mapRef.panTo(vehiclePosition.position);
      mapRef.setZoom(16);
    }
  }, [mapRef, vehiclePosition]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <span className="ml-3 text-gray-500">Cargando...</span>
      </div>
    );
  }

  // No student specified
  if (!studentId) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">Estudiante no especificado</p>
        <Link
          href="/inicio"
          className="text-primary hover:underline mt-2 inline-block"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  // No active trip
  if (!hasActiveTrip) {
    return (
      <div className="text-center py-12">
        <AlertTriangle className="w-12 h-12 mx-auto text-gray-400 mb-4" />
        <p className="text-gray-500 text-lg">No hay viaje activo</p>
        <p className="text-gray-400 text-sm mt-1">
          {student?.firstName} no tiene un viaje en curso
        </p>
        <Link
          href="/inicio"
          className="text-primary hover:underline mt-4 inline-block"
        >
          Volver al inicio
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      {/* Sticky Header - colored based on route type */}
      <div
        className={cn(
          'px-4 py-3 flex items-center justify-between flex-shrink-0 z-30 sticky top-0',
          isPickup ? 'bg-warning' : 'bg-info'
        )}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.back()}
            className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-white" />
          </button>
          <div className="flex items-center gap-2">
            {isPickup ? (
              <Sunrise className="w-5 h-5 text-white" />
            ) : (
              <Sunset className="w-5 h-5 text-white" />
            )}
            <div>
              <h1 className="text-base font-semibold text-white">
                {student?.firstName} {student?.lastName}
              </h1>
              <p className="text-xs text-white/80">
                {route?.name} - {isPickup ? 'Recogida' : 'Entrega'}
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-white/20 px-2 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse" />
          <span className="text-xs font-medium text-white">En Vivo</span>
        </div>
      </div>

      {/* Map Container - 60vh */}
      <div className="relative flex-shrink-0" style={{ height: '60vh' }}>
        <GoogleMapsProvider>
          <GoogleRouteMap
            stops={mapStops}
            currentStopIndex={currentStopIndex}
            polyline={routePolyline}
            completedStopIndex={completedStopIdx}
            showDifferentiatedPolyline={completedStops > 0}
            vehiclePosition={vehiclePosition}
            showVehicle={!!vehiclePosition}
            schoolPosition={schoolPosition}
            schoolName={school?.name}
            autoFitBounds={true}
            showGeofences={false}
            onMapLoad={handleMapLoad}
            style={{ width: '100%', height: '60vh' }}
            overlays={{
              topLeft:
                currentSpeed !== null &&
                currentSpeed !== undefined &&
                currentSpeed > 0 ? (
                  <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success animate-pulse" />
                      <span className="font-bold text-lg">
                        {Math.round(currentSpeed)}
                      </span>
                      <span className="text-gray-600 text-sm">km/h</span>
                    </div>
                  </div>
                ) : undefined,
              topRight: (
                <div className="bg-white/90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-lg">
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="font-medium">
                      {completedStops}/{totalStops}
                    </span>
                    <span className="text-gray-500">paradas</span>
                  </div>
                </div>
              ),
            }}
          />

          {/* Center on vehicle button */}
          <button
            onClick={handleCenterOnVehicle}
            className="absolute bottom-4 left-3 z-20 bg-white rounded-full p-3 shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
            aria-label="Centrar en vehículo"
          >
            <Crosshair className="w-5 h-5 text-primary" />
          </button>
        </GoogleMapsProvider>
      </div>

      {/* Content Section */}
      <div className="bg-white px-4 py-4 space-y-4">
        {/* Progress Bar */}
        <ProgressBar
          completedStops={completedStops}
          totalStops={totalStops}
          currentStopIndex={currentStopIndex}
        />

        {/* Next Stop Card */}
        {studentStop && (
          <NextStopInfoCard
            stopName={studentStop.name}
            stopAddress={studentStop.address}
            stopNumber={currentStopIndex + 1}
            totalStops={totalStops}
            etaMinutes={etaMinutes}
            etaTime={etaTime}
            distanceKm={distanceKm}
            delayStatus={delayStatus as {
              isDelayed: boolean;
              delayMinutes: number;
              status: 'on_time' | 'slight_delay' | 'delayed' | 'very_delayed';
            } | null}
            latitude={studentStop.lat}
            longitude={studentStop.lng}
          />
        )}

        {/* Vehicle Info Card */}
        {vehicle && driver && (
          <VehicleInfoCard
            vehiclePlate={vehicle.licensePlate}
            driverName={driver.name}
            lastUpdated={lastGPSUpdate}
          />
        )}

        {/* Stops Timeline */}
        {timelineStops.length > 0 && (
          <StopsTimeline
            stops={timelineStops}
            currentStopIndex={currentStopIndex}
            studentStopId={studentStop?.id?.toString()}
          />
        )}
      </div>
    </div>
  );
}
