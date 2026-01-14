"use client";

/**
 * TripCompletionModal Component
 *
 * Modal shown when a trip is completed with quick summary:
 * - Success animation
 * - Key statistics (duration, students, incidents)
 * - Navigation to full summary or dashboard
 */

import { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import {
  CheckCircle,
  Clock,
  Users,
  AlertTriangle,
  MapPin,
  FileText,
  Home,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface TripStats {
  duration: number; // in milliseconds
  plannedDuration: number; // in milliseconds
  studentsPickedUp: number;
  studentsAbsent: number;
  studentsNoShow: number;
  incidentsCount: number;
  stopsCompleted: number;
  stopsSkipped: number;
  totalStops: number;
}

interface TripCompletionModalProps {
  /** Whether the modal is open */
  isOpen: boolean;
  /** Handler to close the modal */
  onClose: () => void;
  /** Trip statistics */
  stats?: TripStats;
  /** Route name */
  routeName?: string;
  /** Route type */
  routeType?: "pickup" | "dropoff";
  /** Handler to view full summary */
  onViewSummary: () => void;
  /** Handler to go to dashboard */
  onGoToDashboard: () => void;
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

function getDurationComparison(actual: number, planned: number): { text: string; color: string } {
  const diffMinutes = Math.round((actual - planned) / 60000);
  if (diffMinutes <= 0) {
    return { text: "a tiempo", color: "text-success" };
  } else if (diffMinutes <= 5) {
    return { text: `+${diffMinutes} min`, color: "text-warning" };
  } else {
    return { text: `+${diffMinutes} min`, color: "text-error" };
  }
}

export function TripCompletionModal({
  isOpen,
  onClose,
  stats,
  routeName,
  routeType = "pickup",
  onViewSummary,
  onGoToDashboard,
}: TripCompletionModalProps) {
  const totalStudents = stats
    ? stats.studentsPickedUp + stats.studentsAbsent + stats.studentsNoShow
    : 0;

  const durationComparison = stats
    ? getDurationComparison(stats.duration, stats.plannedDuration)
    : null;

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Backdrop */}
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/60" />
        </Transition.Child>

        {/* Modal */}
        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-sm transform overflow-hidden rounded-2xl bg-white shadow-xl transition-all">
                {/* Success Header */}
                <div className="bg-success px-6 pt-8 pb-6 text-center">
                  <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4 animate-bounce-once">
                    <CheckCircle className="w-10 h-10 text-white" />
                  </div>
                  <Dialog.Title className="text-xl font-bold text-white">
                    {routeType === "pickup" ? "Recorrido Completado" : "Viaje Completado"}
                  </Dialog.Title>
                  {routeName && (
                    <p className="text-sm text-white/80 mt-1">{routeName}</p>
                  )}
                </div>

                {/* Stats Grid */}
                {stats && (
                  <div className="px-6 py-4 space-y-4">
                    {/* Duration */}
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-5 h-5" />
                        <span>Duración</span>
                      </div>
                      <div className="text-right">
                        <span className="font-bold text-gray-900">
                          {formatDuration(stats.duration)}
                        </span>
                        {durationComparison && (
                          <span className={cn("ml-2 text-sm", durationComparison.color)}>
                            ({durationComparison.text})
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Students */}
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-5 h-5" />
                        <span>Estudiantes</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm px-2 py-0.5 bg-success/10 text-success rounded-full">
                          {stats.studentsPickedUp} {routeType === "pickup" ? "recogidos" : "entregados"}
                        </span>
                        {stats.studentsAbsent > 0 && (
                          <span className="text-sm px-2 py-0.5 bg-warning/10 text-warning rounded-full">
                            {stats.studentsAbsent} ausentes
                          </span>
                        )}
                        {stats.studentsNoShow > 0 && (
                          <span className="text-sm px-2 py-0.5 bg-error/10 text-error rounded-full">
                            {stats.studentsNoShow} no show
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Stops */}
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-5 h-5" />
                        <span>Paradas</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900">
                          {stats.stopsCompleted}/{stats.totalStops}
                        </span>
                        {stats.stopsSkipped > 0 && (
                          <span className="text-sm text-gray-500">
                            ({stats.stopsSkipped} omitidas)
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Incidents */}
                    <div className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-2 text-gray-600">
                        <AlertTriangle className="w-5 h-5" />
                        <span>Incidentes</span>
                      </div>
                      <span
                        className={cn(
                          "font-bold",
                          stats.incidentsCount > 0 ? "text-error" : "text-success"
                        )}
                      >
                        {stats.incidentsCount}
                      </span>
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="px-6 pb-6 space-y-3">
                  <button
                    onClick={onViewSummary}
                    className="w-full py-3 px-4 bg-primary text-white font-semibold rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
                  >
                    <FileText className="w-5 h-5" />
                    Ver Resumen Completo
                  </button>
                  <button
                    onClick={onGoToDashboard}
                    className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
                  >
                    <Home className="w-5 h-5" />
                    Ir al Dashboard
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}
