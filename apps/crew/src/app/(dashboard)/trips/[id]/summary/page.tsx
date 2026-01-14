"use client";

/**
 * Trip Summary Page
 *
 * Detailed summary of a completed trip showing:
 * - Trip statistics (duration, students, stops)
 * - Timeline of events
 * - Student check-in details
 * - Stop arrival times
 * - Incidents (if any)
 */

import { use } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "convex/react";
import { api } from "../../../../../../../../convex/_generated/api";
import { Id } from "../../../../../../../../convex/_generated/dataModel";
import { useConvexAuth } from "@/hooks";
import {
  ArrowLeft,
  Clock,
  Users,
  MapPin,
  AlertTriangle,
  CheckCircle,
  XCircle,
  User,
  Calendar,
  Route,
  Timer,
  CircleDot,
  SkipForward,
  MessageSquare,
  Bus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { StaticRouteMap, type StopMarkerStatus } from "@altaviapp/maps";

interface PageProps {
  params: Promise<{ id: string }>;
}

function formatDuration(ms: number): string {
  const minutes = Math.round(ms / 60000);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}min` : `${hours}h`;
}

function formatTime(timestamp: number): string {
  return format(new Date(timestamp), "HH:mm", { locale: es });
}

function formatDate(timestamp: number): string {
  return format(new Date(timestamp), "EEEE d 'de' MMMM", { locale: es });
}

// Event type icons and colors
const eventConfig: Record<string, { icon: React.ElementType; color: string; bgColor: string }> = {
  trip_started: { icon: Bus, color: "text-success", bgColor: "bg-success/10" },
  trip_completed: { icon: CheckCircle, color: "text-success", bgColor: "bg-success/10" },
  arrived_at_stop: { icon: MapPin, color: "text-primary", bgColor: "bg-primary/10" },
  stop_skipped: { icon: SkipForward, color: "text-warning", bgColor: "bg-warning/10" },
  student_checked_in: { icon: User, color: "text-primary", bgColor: "bg-primary/10" },
  student_checked_out: { icon: CheckCircle, color: "text-success", bgColor: "bg-success/10" },
  student_no_show: { icon: XCircle, color: "text-error", bgColor: "bg-error/10" },
  incident_reported: { icon: AlertTriangle, color: "text-error", bgColor: "bg-error/10" },
  stop_note_added: { icon: MessageSquare, color: "text-gray-600", bgColor: "bg-gray-100" },
  relay_requested: { icon: Bus, color: "text-warning", bgColor: "bg-warning/10" },
};

export default function TripSummaryPage({ params }: PageProps) {
  const { id: tripId } = use(params);
  const router = useRouter();
  const { userId } = useConvexAuth();

  // Fetch trip summary
  const summary = useQuery(
    api.trips.getTripSummary,
    userId ? { userId, tripId: tripId as Id<"trips"> } : "skip"
  );

  if (!userId || summary === undefined) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Viaje no encontrado</p>
      </div>
    );
  }

  const { trip, timeline, checkins, stops, incidents, vehicle, driver, schoolPosition, schoolName, routePolyline } = summary;

  // Use saved stats from trip if available, otherwise calculate from data
  const stats = trip.stats ?? {
    duration: trip.endTime && trip.startTime ? trip.endTime - trip.startTime : 0,
    plannedDuration: 40 * 60000, // Default 40 minutes
    studentsPickedUp: checkins?.filter((c: any) => c.checkInTime).length ?? 0,
    studentsAbsent: 0,
    studentsNoShow: checkins?.filter((c: any) => !c.checkInTime).length ?? 0,
    stopsCompleted: stops?.filter((s: any) => s.status === "arrived").length ?? 0,
    stopsSkipped: stops?.filter((s: any) => s.status === "skipped").length ?? 0,
    totalStops: stops?.length ?? 0,
    incidentsCount: incidents?.length ?? 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="flex items-center gap-3 px-4 py-3">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-600" />
          </button>
          <div className="flex-1">
            <h1 className="text-lg font-bold text-gray-900">Resumen del Viaje</h1>
            <p className="text-sm text-gray-500">{trip.routeName || "Ruta"}</p>
          </div>
        </div>
      </header>

      <div className="p-4 space-y-4">
        {/* Trip Info Card */}
        <div className="bg-white rounded-xl p-4 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center",
              trip.status === "completed" ? "bg-success/10" : "bg-warning/10"
            )}>
              {trip.status === "completed" ? (
                <CheckCircle className="w-6 h-6 text-success" />
              ) : (
                <Clock className="w-6 h-6 text-warning" />
              )}
            </div>
            <div className="flex-1">
              <h2 className="font-bold text-gray-900">
                {trip.routeType === "pickup" ? "Recogida" : "Entrega"} - {trip.routeName}
              </h2>
              <p className="text-sm text-gray-500">
                {trip.startTime ? formatDate(trip.startTime) : "Sin fecha"}
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-2 gap-3">
              {/* Duration */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Timer className="w-4 h-4" />
                  <span className="text-xs">Duración</span>
                </div>
                <p className="font-bold text-gray-900">{formatDuration(stats.duration)}</p>
                {stats.plannedDuration > 0 && (
                  <p className="text-xs text-gray-500">
                    Planificado: {formatDuration(stats.plannedDuration)}
                  </p>
                )}
              </div>

              {/* Students */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <Users className="w-4 h-4" />
                  <span className="text-xs">Estudiantes</span>
                </div>
                <p className="font-bold text-gray-900">
                  {stats.studentsPickedUp} {trip.routeType === "pickup" ? "recogidos" : "entregados"}
                </p>
                {(stats.studentsAbsent > 0 || stats.studentsNoShow > 0) && (
                  <p className="text-xs text-gray-500">
                    {stats.studentsAbsent > 0 && `${stats.studentsAbsent} ausentes`}
                    {stats.studentsAbsent > 0 && stats.studentsNoShow > 0 && ", "}
                    {stats.studentsNoShow > 0 && `${stats.studentsNoShow} no show`}
                  </p>
                )}
              </div>

              {/* Stops */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <MapPin className="w-4 h-4" />
                  <span className="text-xs">Paradas</span>
                </div>
                <p className="font-bold text-gray-900">
                  {stats.stopsCompleted}/{stats.totalStops}
                </p>
                {stats.stopsSkipped > 0 && (
                  <p className="text-xs text-gray-500">{stats.stopsSkipped} omitidas</p>
                )}
              </div>

              {/* Incidents */}
              <div className="bg-gray-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-gray-500 mb-1">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-xs">Incidentes</span>
                </div>
                <p className={cn(
                  "font-bold",
                  stats.incidentsCount > 0 ? "text-error" : "text-success"
                )}>
                  {stats.incidentsCount}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Route Map */}
        {stops && stops.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-gray-600" />
              Recorrido
            </h3>
            <StaticRouteMap
              stops={stops.map((stop: any, index: number) => ({
                position: { lat: stop.latitude, lng: stop.longitude },
                status: (stop.arrivedAt ? "arrived" : stop.skippedAt ? "skipped" : "pending") as StopMarkerStatus,
                order: index + 1,
              }))}
              schoolPosition={schoolPosition}
              encodedPolyline={routePolyline}
              className="w-full h-48 rounded-lg object-cover"
            />
          </div>
        )}

        {/* Timeline */}
        {timeline && timeline.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-gray-600" />
              Cronología
            </h3>
            <div className="space-y-0">
              {timeline.map((event: any, index: number) => {
                const defaultConfig = { icon: MessageSquare, color: "text-gray-600", bgColor: "bg-gray-100" };
                const config = eventConfig[event.type] ?? defaultConfig;
                const Icon = config.icon;
                const isLast = index === timeline.length - 1;

                return (
                  <div key={event._id} className="flex gap-3">
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div className={cn("w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0", config.bgColor)}>
                        <Icon className={cn("w-4 h-4", config.color)} />
                      </div>
                      {!isLast && (
                        <div className="w-0.5 h-full min-h-[24px] bg-gray-200" />
                      )}
                    </div>

                    {/* Event Content */}
                    <div className={cn("flex-1 pb-4", isLast && "pb-0")}>
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{event.title}</p>
                          {event.description && (
                            <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400 flex-shrink-0">
                          {formatTime(event.timestamp)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Students Check-ins */}
        {checkins && checkins.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-600" />
              Estudiantes ({checkins.length})
            </h3>
            <div className="space-y-2">
              {checkins.map((checkin: any) => (
                <div
                  key={checkin._id}
                  className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0"
                >
                  <div className="flex items-center gap-2">
                    <div className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center",
                      checkin.checkInTime ? "bg-success/10" : "bg-error/10"
                    )}>
                      {checkin.checkInTime ? (
                        <CheckCircle className="w-3 h-3 text-success" />
                      ) : (
                        <XCircle className="w-3 h-3 text-error" />
                      )}
                    </div>
                    <span className="text-sm text-gray-900">{checkin.studentName}</span>
                  </div>
                  <div className="text-right">
                    {checkin.checkInTime ? (
                      <span className="text-xs text-gray-500">
                        {formatTime(checkin.checkInTime)}
                      </span>
                    ) : (
                      <span className="text-xs text-error">No recogido</span>
                    )}
                    <p className="text-xs text-gray-400">{checkin.stopName}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Stops List */}
        {stops && stops.length > 0 && (
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
              <Route className="w-5 h-5 text-gray-600" />
              Paradas ({stops.length})
            </h3>
            <div className="space-y-2">
              {stops.map((stop: any, index: number) => (
                <div
                  key={stop._id}
                  className="flex items-center gap-3 py-2 border-b border-gray-100 last:border-0"
                >
                  <div className={cn(
                    "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold",
                    stop.arrivedAt
                      ? "bg-success/10 text-success"
                      : stop.skipped
                      ? "bg-warning/10 text-warning"
                      : "bg-gray-100 text-gray-400"
                  )}>
                    {stop.skipped ? (
                      <SkipForward className="w-4 h-4" />
                    ) : (
                      index + 1
                    )}
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{stop.name}</p>
                    <p className="text-xs text-gray-500">{stop.address}</p>
                  </div>
                  <div className="text-right">
                    {stop.arrivedAt ? (
                      <span className="text-xs text-success">
                        {formatTime(stop.arrivedAt)}
                      </span>
                    ) : stop.skipped ? (
                      <span className="text-xs text-warning">Omitida</span>
                    ) : (
                      <span className="text-xs text-gray-400">-</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
