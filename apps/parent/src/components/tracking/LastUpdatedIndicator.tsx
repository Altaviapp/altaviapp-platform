"use client";

/**
 * LastUpdatedIndicator Component
 *
 * Shows time elapsed since last GPS update.
 * Updates every second to show real-time freshness.
 */

import { useState, useEffect } from "react";
import { Clock, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface LastUpdatedIndicatorProps {
  /** Timestamp of last update (ms) */
  timestamp: number | null;
  /** Additional CSS classes */
  className?: string;
  /** Show warning if data is stale (default: 60 seconds) */
  staleThresholdSeconds?: number;
}

function formatElapsed(ms: number): string {
  const seconds = Math.floor(ms / 1000);

  if (seconds < 60) {
    return `hace ${seconds} seg`;
  }

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) {
    return `hace ${minutes} min`;
  }

  const hours = Math.floor(minutes / 60);
  return `hace ${hours}h ${minutes % 60}min`;
}

export function LastUpdatedIndicator({
  timestamp,
  className,
  staleThresholdSeconds = 60,
}: LastUpdatedIndicatorProps) {
  const [elapsed, setElapsed] = useState<number>(0);

  useEffect(() => {
    if (!timestamp) return;

    // Calculate initial elapsed time
    const calculateElapsed = () => {
      const now = Date.now();
      setElapsed(now - timestamp);
    };

    calculateElapsed();

    // Update every second
    const interval = setInterval(calculateElapsed, 1000);

    return () => clearInterval(interval);
  }, [timestamp]);

  if (!timestamp) {
    return (
      <div className={cn("flex items-center gap-1 text-xs text-gray-400", className)}>
        <AlertCircle className="w-3 h-3" />
        <span>Sin datos GPS</span>
      </div>
    );
  }

  const isStale = elapsed > staleThresholdSeconds * 1000;

  return (
    <div
      className={cn(
        "flex items-center gap-1 text-xs",
        isStale ? "text-warning" : "text-gray-500",
        className
      )}
    >
      <Clock className={cn("w-3 h-3", isStale && "animate-pulse")} />
      <span>Actualizado {formatElapsed(elapsed)}</span>
    </div>
  );
}
