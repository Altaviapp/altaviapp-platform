"use client";

/**
 * FloatingStatusCard Component
 *
 * Displays driver and vehicle info with contact buttons.
 * Positioned as an overlay on the map when expanded.
 */

import { Phone, MessageCircle, Bus, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { LastUpdatedIndicator } from "./LastUpdatedIndicator";

interface FloatingStatusCardProps {
  /** Driver name */
  driverName: string;
  /** Driver phone number (optional) */
  driverPhone?: string | null;
  /** Vehicle license plate */
  vehiclePlate: string;
  /** Last GPS update timestamp */
  lastUpdated: number | null;
  /** Additional CSS classes */
  className?: string;
}

export function FloatingStatusCard({
  driverName,
  driverPhone,
  vehiclePlate,
  lastUpdated,
  className,
}: FloatingStatusCardProps) {
  const handleCall = () => {
    if (driverPhone) {
      window.open(`tel:${driverPhone}`, "_self");
    }
  };

  const handleWhatsApp = () => {
    if (driverPhone) {
      // Remove non-numeric characters and ensure country code
      const cleanNumber = driverPhone.replace(/\D/g, "");
      const numberWithCode = cleanNumber.startsWith("57") || cleanNumber.startsWith("593")
        ? cleanNumber
        : `57${cleanNumber}`; // Default to Colombia
      window.open(`https://wa.me/${numberWithCode}`, "_blank");
    }
  };

  return (
    <div
      className={cn(
        "bg-white rounded-xl shadow-lg border border-gray-100 p-3",
        className
      )}
    >
      {/* Driver and vehicle info */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          {/* Vehicle badge */}
          <div className="flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-lg">
            <Bus className="w-4 h-4" />
            <span className="font-semibold text-sm">{vehiclePlate}</span>
          </div>

          {/* Driver name */}
          <div className="flex items-center gap-1 text-gray-700">
            <User className="w-4 h-4 text-gray-400" />
            <span className="text-sm">{driverName}</span>
          </div>
        </div>
      </div>

      {/* Contact buttons */}
      <div className="flex items-center gap-2">
        {driverPhone ? (
          <>
            <button
              onClick={handleCall}
              className="flex-1 flex items-center justify-center gap-2 bg-primary text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all"
            >
              <Phone className="w-4 h-4" />
              Llamar
            </button>
            <button
              onClick={handleWhatsApp}
              className="flex-1 flex items-center justify-center gap-2 bg-success text-white py-2 px-3 rounded-lg text-sm font-medium hover:bg-success/90 active:scale-95 transition-all"
            >
              <MessageCircle className="w-4 h-4" />
              WhatsApp
            </button>
          </>
        ) : (
          <p className="text-xs text-gray-400 flex-1 text-center">
            Teléfono no disponible
          </p>
        )}

        {/* Last updated indicator */}
        <LastUpdatedIndicator timestamp={lastUpdated} className="ml-auto" />
      </div>
    </div>
  );
}
