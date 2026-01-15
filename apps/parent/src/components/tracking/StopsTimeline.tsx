"use client";

/**
 * StopsTimeline Component
 *
 * Collapsible timeline showing all route stops with their status.
 * Highlights the student's specific stop.
 */

import { useState } from "react";
import { ChevronDown, ChevronUp, Check, Circle, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";

interface Stop {
  id: string;
  name: string;
  scheduledTime?: string;
  completedTime?: string;
  completed: boolean;
}

interface StopsTimelineProps {
  /** List of all stops */
  stops: Stop[];
  /** Index of current stop (0-based) */
  currentStopIndex: number;
  /** ID of the student's stop to highlight */
  studentStopId?: string;
  /** Initially expanded state */
  defaultExpanded?: boolean;
  /** Additional CSS classes */
  className?: string;
}

export function StopsTimeline({
  stops,
  currentStopIndex,
  studentStopId,
  defaultExpanded = false,
  className,
}: StopsTimelineProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  const completedCount = stops.filter((s) => s.completed).length;

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden",
        className
      )}
    >
      {/* Header - always visible */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-primary" />
          <span className="font-medium text-gray-900">Ver todas las paradas</span>
          <span className="text-sm text-gray-500">
            ({completedCount}/{stops.length})
          </span>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-gray-400" />
        ) : (
          <ChevronDown className="w-5 h-5 text-gray-400" />
        )}
      </button>

      {/* Expandable content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          <div className="border-t border-gray-100 pt-3">
            {stops.map((stop, index) => {
              const isCompleted = stop.completed;
              const isCurrent = index === currentStopIndex && !isCompleted;
              const isStudentStop = stop.id === studentStopId;

              return (
                <div key={stop.id} className="flex items-start gap-3 py-2">
                  {/* Timeline indicator */}
                  <div className="flex flex-col items-center">
                    {/* Circle/Check icon */}
                    <div
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0",
                        isCompleted
                          ? "bg-success text-white"
                          : isCurrent
                            ? "bg-primary text-white"
                            : "bg-gray-100 text-gray-400"
                      )}
                    >
                      {isCompleted ? (
                        <Check className="w-3.5 h-3.5" />
                      ) : (
                        <Circle className="w-3 h-3" />
                      )}
                    </div>
                    {/* Connecting line */}
                    {index < stops.length - 1 && (
                      <div
                        className={cn(
                          "w-0.5 h-6 mt-1",
                          isCompleted ? "bg-success" : "bg-gray-200"
                        )}
                      />
                    )}
                  </div>

                  {/* Stop info */}
                  <div className="flex-1 min-w-0 pb-1">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "font-medium truncate",
                          isCompleted
                            ? "text-gray-500"
                            : isCurrent
                              ? "text-primary"
                              : "text-gray-700"
                        )}
                      >
                        {stop.name}
                      </span>
                      {isStudentStop && (
                        <span className="px-1.5 py-0.5 bg-accent/20 text-accent text-[10px] font-semibold rounded uppercase flex-shrink-0">
                          Tu parada
                        </span>
                      )}
                      {isCurrent && !isStudentStop && (
                        <span className="px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-semibold rounded uppercase flex-shrink-0">
                          Próxima
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {stop.completedTime ? (
                        <span className="text-xs text-gray-400">
                          Completada {stop.completedTime}
                        </span>
                      ) : stop.scheduledTime ? (
                        <span className="text-xs text-gray-400">
                          Est. {stop.scheduledTime}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
