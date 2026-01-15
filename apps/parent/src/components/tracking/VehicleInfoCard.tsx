"use client";

/**
 * VehicleInfoCard Component
 *
 * Displays vehicle and driver info with last updated indicator.
 * Read-only card without contact actions.
 */

import { Bus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { LastUpdatedIndicator } from "./LastUpdatedIndicator";

interface VehicleInfoCardProps {
  /** Vehicle license plate */
  vehiclePlate: string;
  /** Driver name */
  driverName: string;
  /** Last GPS update timestamp */
  lastUpdated: number | null;
  /** Additional CSS classes */
  className?: string;
}

export function VehicleInfoCard({
  vehiclePlate,
  driverName,
  lastUpdated,
  className,
}: VehicleInfoCardProps) {
  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-sm border border-gray-100 p-4",
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {/* Vehicle badge */}
          <div className="flex items-center gap-1.5 bg-primary/10 text-primary px-2.5 py-1.5 rounded-lg">
            <Bus className="w-4 h-4" />
            <span className="font-semibold text-sm">{vehiclePlate}</span>
          </div>

          {/* Driver name */}
          <div className="flex items-center gap-1.5 text-gray-700">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm font-medium">{driverName}</span>
          </div>
        </div>

        {/* Last updated indicator */}
        <LastUpdatedIndicator timestamp={lastUpdated} />
      </div>
    </div>
  );
}
