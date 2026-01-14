"use client";

/**
 * ProgressBar Component
 *
 * Visual progress indicator showing completed stops out of total.
 * Displays as a segmented bar where each segment represents a stop.
 */

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  /** Number of completed stops */
  completedStops: number;
  /** Total number of stops */
  totalStops: number;
  /** Optional current stop index (0-based) for highlighting */
  currentStopIndex?: number;
  /** Additional CSS classes */
  className?: string;
}

export function ProgressBar({
  completedStops,
  totalStops,
  currentStopIndex,
  className,
}: ProgressBarProps) {
  if (totalStops === 0) return null;

  // Create array of stop segments
  const segments = Array.from({ length: totalStops }, (_, i) => {
    const isCompleted = i < completedStops;
    const isCurrent = currentStopIndex !== undefined && i === currentStopIndex;
    return { index: i, isCompleted, isCurrent };
  });

  return (
    <div className={cn("w-full", className)}>
      {/* Progress bar */}
      <div className="flex gap-1">
        {segments.map((segment) => (
          <div
            key={segment.index}
            className={cn(
              "h-1.5 flex-1 rounded-full transition-all duration-300",
              segment.isCompleted
                ? "bg-success"
                : segment.isCurrent
                ? "bg-primary animate-pulse"
                : "bg-gray-200"
            )}
          />
        ))}
      </div>

      {/* Label */}
      <p className="text-xs text-gray-500 mt-1">
        {completedStops}/{totalStops} paradas
      </p>
    </div>
  );
}
