"use client";

/**
 * StudentTrackingCard Component
 *
 * Student card showing trip status and navigation to monitoring page.
 * Replaces the old expandable map with a "Monitorear viaje" button.
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Bus,
  MapPin,
  Clock,
  Bell,
  AlertTriangle,
  Navigation,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useStudentTracking } from "@/hooks/useMyStudents";
import { NovedadContextButton } from "./NovedadContextButton";
import { ProgressBar } from "../tracking/ProgressBar";
import { AlertPreferencesSheet } from "../settings/AlertPreferencesSheet";
import { Id } from "../../../../../convex/_generated/dataModel";

interface StudentTrackingCardProps {
  student: {
    _id: Id<"students">;
    firstName: string;
    lastName: string;
    grade?: string;
    section?: string;
    photoUrl?: string | null;
  };
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

export function StudentTrackingCard({
  student,
}: StudentTrackingCardProps) {
  const router = useRouter();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    tracking,
    hasActiveTrip,
    isLoading,
    studentStop,
    completedStops,
    totalStops,
    currentStopIndex,
    etaMinutes,
    etaTime,
    delayStatus,
  } = useStudentTracking(student._id);

  // Navigate to monitoring page
  const handleMonitorTrip = () => {
    router.push(`/monitoreo/${student._id}`);
  };

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

                {/* Monitor trip button */}
                <button
                  onClick={handleMonitorTrip}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg text-sm font-medium transition-all bg-primary text-white hover:bg-primary/90 active:scale-[0.98]"
                >
                  <Navigation className="w-4 h-4" />
                  Monitorear viaje
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

// Backwards-compatible alias export
export { StudentTrackingCard as ExpandableTrackingCard };
