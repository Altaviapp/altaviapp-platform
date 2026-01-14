"use client";

/**
 * ExpandableTrackingCard Component
 *
 * Enhanced student card with inline map expansion for live tracking.
 * Shows student info, trip progress, ETA, and expandable map view.
 */

import { useState, lazy, Suspense } from "react";
import {
  Bus,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  Bell,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudentTracking } from "@/hooks/useMyStudents";
import { NovedadContextButton } from "./NovedadContextButton";
import { ProgressBar } from "../tracking/ProgressBar";
import { FloatingStatusCard } from "../tracking/FloatingStatusCard";
import { AlertPreferencesSheet } from "../settings/AlertPreferencesSheet";
import { Id } from "../../../../../convex/_generated/dataModel";

// Lazy load the map component for performance
const LiveTrackingMap = lazy(() =>
  import("../tracking/LiveTrackingMap").then((mod) => ({
    default: mod.LiveTrackingMap,
  }))
);

interface ExpandableTrackingCardProps {
  student: {
    _id: Id<"students">;
    firstName: string;
    lastName: string;
    grade?: string;
    section?: string;
    photoUrl?: string | null;
  };
  isExpanded: boolean;
  onToggleExpand: () => void;
}

type TripStatus = "active" | "scheduled" | "at_home" | "at_school" | "completed";

interface StatusConfig {
  label: string;
  bgColor: string;
  textColor: string;
  icon: typeof Bus;
}

const statusConfigs: Record<TripStatus, StatusConfig> = {
  active: {
    label: "En Viaje",
    bgColor: "bg-green-50",
    textColor: "text-green-700",
    icon: Bus,
  },
  scheduled: {
    label: "Programado",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    icon: Clock,
  },
  at_home: {
    label: "En Casa",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    icon: MapPin,
  },
  at_school: {
    label: "En el Colegio",
    bgColor: "bg-purple-50",
    textColor: "text-purple-700",
    icon: MapPin,
  },
  completed: {
    label: "Viaje Completado",
    bgColor: "bg-green-50",
    textColor: "text-green-600",
    icon: Bus,
  },
};

export function ExpandableTrackingCard({
  student,
  isExpanded,
  onToggleExpand,
}: ExpandableTrackingCardProps) {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    tracking,
    hasActiveTrip,
    isLoading,
    currentLocation,
    route,
    stops,
    studentStop,
    vehicle,
    driver,
    school,
    completedStops,
    totalStops,
    currentStopIndex,
    etaMinutes,
    etaTime,
    delayStatus,
    lastGPSUpdate,
  } = useStudentTracking(student._id);

  // Determine status based on tracking data
  const getStatus = (): TripStatus => {
    if (isLoading) return "at_home";
    if (hasActiveTrip && tracking) {
      const tripStatus = tracking.trip?.status;
      if (tripStatus === "in_progress") return "active";
      if (tripStatus === "completed") return "completed";
    }
    return "at_home";
  };

  const status = getStatus();
  const config = statusConfigs[status];
  const StatusIcon = config.icon;

  // Get initials for avatar fallback
  const initials = `${student.firstName[0] ?? ""}${student.lastName[0] ?? ""}`.toUpperCase();

  // Prepare map data
  const vehicleLocation = currentLocation
    ? {
        lat: currentLocation.latitude,
        lng: currentLocation.longitude,
        speed: currentLocation.speed,
        heading: currentLocation.heading,
        timestamp: currentLocation.timestamp,
      }
    : null;

  const mapStops = stops.map((stop) => ({
    id: stop.id.toString(),
    name: stop.name,
    lat: stop.lat,
    lng: stop.lng,
    scheduledTime: stop.scheduledTime ?? undefined,
    completed: stop.completed,
  }));

  const schoolLocation = school
    ? { lat: school.lat, lng: school.lng, name: school.name }
    : undefined;

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
      {/* Main card header - always visible */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="flex-shrink-0">
            {student.photoUrl ? (
              <img
                src={student.photoUrl}
                alt={`${student.firstName} ${student.lastName}`}
                className="w-14 h-14 rounded-full object-cover"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="text-primary font-semibold text-lg">{initials}</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-semibold text-gray-900">
                  {student.firstName} {student.lastName}
                </h3>
                {student.grade && (
                  <p className="text-sm text-gray-500">
                    {student.grade}
                    {student.section ? ` - ${student.section}` : ""}
                  </p>
                )}
              </div>

              {/* Actions: Settings + Status badge */}
              <div className="flex items-center gap-2">
                {hasActiveTrip && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsSettingsOpen(true);
                    }}
                    className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
                    title="Configurar alertas"
                  >
                    <Bell className="w-4 h-4 text-gray-400" />
                  </button>
                )}
                <div
                  className={cn(
                    "px-2.5 py-1 rounded-full flex items-center gap-1.5",
                    config.bgColor
                  )}
                >
                  <StatusIcon className={cn("w-3.5 h-3.5", config.textColor)} />
                  <span className={cn("text-xs font-medium", config.textColor)}>
                    {config.label}
                  </span>
                </div>
              </div>
            </div>

            {/* Active trip info */}
            {hasActiveTrip && tracking && (
              <div className="mt-3 space-y-3">
                {/* Next stop / destination */}
                {studentStop && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-primary" />
                    <span className="text-gray-600">
                      En camino a:{" "}
                      <span className="font-medium text-gray-900">{studentStop.name}</span>
                    </span>
                  </div>
                )}

                {/* ETA with delay indicator */}
                <div className="flex items-center gap-3">
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg",
                      !delayStatus || delayStatus.status === "on_time"
                        ? "bg-green-50 text-green-700"
                        : delayStatus.status === "slight_delay"
                        ? "bg-yellow-50 text-yellow-700"
                        : delayStatus.status === "delayed"
                        ? "bg-orange-50 text-orange-700"
                        : "bg-red-50 text-red-700"
                    )}
                  >
                    <Clock className="w-4 h-4" />
                    {etaMinutes !== null ? (
                      <span className="font-medium">
                        ~{etaMinutes} min
                        {etaTime && (
                          <span className="opacity-75 ml-1 text-xs">({etaTime})</span>
                        )}
                      </span>
                    ) : (
                      <span className="text-sm">Calculando...</span>
                    )}
                  </div>
                  {delayStatus?.isDelayed && (
                    <div className="flex items-center gap-1 text-xs text-orange-600">
                      <AlertTriangle className="w-3 h-3" />
                      <span>+{delayStatus.delayMinutes} min</span>
                    </div>
                  )}
                </div>

                {/* Progress bar (segmented) */}
                <ProgressBar
                  completedStops={completedStops}
                  totalStops={totalStops}
                  currentStopIndex={currentStopIndex}
                />

                {/* Expand/collapse button */}
                <button
                  onClick={onToggleExpand}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-medium transition-all",
                    isExpanded
                      ? "bg-gray-100 text-gray-700"
                      : "bg-primary/10 text-primary hover:bg-primary/20"
                  )}
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      Ocultar mapa
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      Ver mapa en vivo
                    </>
                  )}
                </button>
              </div>
            )}

            {/* No active trip - show novedad option */}
            {!hasActiveTrip && !isLoading && (
              <div className="mt-3 flex items-center justify-between">
                <p className="text-sm text-gray-500">Sin viaje activo</p>
                <NovedadContextButton studentId={student._id} variant="small" />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Expandable map section */}
      {isExpanded && hasActiveTrip && (
        <div className="border-t border-gray-100">
          {/* Map */}
          <Suspense
            fallback={
              <div className="h-64 flex items-center justify-center bg-gray-50">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            }
          >
            <LiveTrackingMap
              vehicleLocation={vehicleLocation}
              stops={mapStops}
              schoolLocation={schoolLocation}
              studentStopId={studentStop?.id.toString()}
              completedStopIndex={completedStops > 0 ? completedStops - 1 : undefined}
              encodedPolyline={route?.optimizedPolyline ?? undefined}
              height="280px"
              autoCenter={true}
              vehicleInfo={
                vehicle && driver
                  ? {
                      plate: vehicle.licensePlate,
                      driverName: driver.name,
                    }
                  : undefined
              }
            />
          </Suspense>

          {/* Floating status card */}
          {driver && vehicle && (
            <div className="p-3">
              <FloatingStatusCard
                driverName={driver.name}
                driverPhone={driver.phone}
                vehiclePlate={vehicle.licensePlate}
                lastUpdated={lastGPSUpdate}
              />
            </div>
          )}
        </div>
      )}

      {/* Alert Preferences Sheet */}
      <AlertPreferencesSheet
        studentId={student._id}
        studentName={`${student.firstName} ${student.lastName}`}
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
