"use client";

/**
 * AlertPreferencesSheet Component
 *
 * Bottom sheet for configuring proximity alert preferences per student.
 * - Toggle alerts on/off
 * - Select alert radius (500m, 1km, 2km)
 */

import { useState, useEffect } from "react";
import { Bell, BellOff, MapPin, X, Check, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAlertPreferences } from "@/hooks/useAlertPreferences";
import { Id } from "../../../../../convex/_generated/dataModel";

interface AlertPreferencesSheetProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: Id<"students">;
  studentName: string;
}

const RADIUS_OPTIONS = [
  { value: 500, label: "500 m", description: "Muy cerca" },
  { value: 1000, label: "1 km", description: "Recomendado" },
  { value: 2000, label: "2 km", description: "Con anticipación" },
];

export function AlertPreferencesSheet({
  isOpen,
  onClose,
  studentId,
  studentName,
}: AlertPreferencesSheetProps) {
  const { preferences, isLoading, isSaving, savePreferences } = useAlertPreferences(studentId);

  // Local state for form
  const [alertsEnabled, setAlertsEnabled] = useState(true);
  const [alertRadius, setAlertRadius] = useState(1000);
  const [hasChanges, setHasChanges] = useState(false);

  // Sync local state with fetched preferences
  useEffect(() => {
    if (preferences) {
      setAlertsEnabled(preferences.alertsEnabled);
      setAlertRadius(preferences.alertRadius);
      setHasChanges(false);
    }
  }, [preferences]);

  // Track changes
  useEffect(() => {
    if (preferences) {
      const changed =
        alertsEnabled !== preferences.alertsEnabled ||
        alertRadius !== preferences.alertRadius;
      setHasChanges(changed);
    }
  }, [alertsEnabled, alertRadius, preferences]);

  const handleSave = async () => {
    try {
      await savePreferences(alertsEnabled, alertRadius);
      onClose();
    } catch (error) {
      console.error("Error saving preferences:", error);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-xl animate-in slide-in-from-bottom duration-300">
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-2">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 pb-4 border-b border-gray-100">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Alertas de Proximidad</h2>
            <p className="text-sm text-gray-500">{studentName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : (
            <>
              {/* Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  {alertsEnabled ? (
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <Bell className="w-5 h-5 text-primary" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <BellOff className="w-5 h-5 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-gray-900">
                      {alertsEnabled ? "Alertas activadas" : "Alertas desactivadas"}
                    </p>
                    <p className="text-xs text-gray-500">
                      {alertsEnabled
                        ? "Recibirás notificaciones cuando el vehículo esté cerca"
                        : "No recibirás notificaciones de proximidad"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setAlertsEnabled(!alertsEnabled)}
                  className={cn(
                    "relative w-12 h-7 rounded-full transition-colors",
                    alertsEnabled ? "bg-primary" : "bg-gray-300"
                  )}
                >
                  <div
                    className={cn(
                      "absolute top-1 w-5 h-5 bg-white rounded-full shadow transition-transform",
                      alertsEnabled ? "translate-x-6" : "translate-x-1"
                    )}
                  />
                </button>
              </div>

              {/* Radius selector - only show when alerts enabled */}
              {alertsEnabled && (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <p className="text-sm font-medium text-gray-700">
                      Radio de alerta
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 -mt-1">
                    Te avisaremos cuando el vehículo esté a esta distancia de la parada
                  </p>

                  <div className="grid grid-cols-3 gap-3">
                    {RADIUS_OPTIONS.map((option) => (
                      <button
                        key={option.value}
                        onClick={() => setAlertRadius(option.value)}
                        className={cn(
                          "p-3 rounded-xl border-2 transition-all text-center",
                          alertRadius === option.value
                            ? "border-primary bg-primary/5"
                            : "border-gray-200 hover:border-gray-300"
                        )}
                      >
                        <p
                          className={cn(
                            "font-bold",
                            alertRadius === option.value
                              ? "text-primary"
                              : "text-gray-900"
                          )}
                        >
                          {option.label}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {option.description}
                        </p>
                        {alertRadius === option.value && (
                          <Check className="w-4 h-4 text-primary mx-auto mt-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 pb-8">
          <button
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
            className={cn(
              "w-full py-3 rounded-xl font-semibold transition-all",
              hasChanges && !isSaving
                ? "bg-primary text-white active:scale-[0.98]"
                : "bg-gray-100 text-gray-400 cursor-not-allowed"
            )}
          >
            {isSaving ? (
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Guardando...</span>
              </div>
            ) : (
              "Guardar cambios"
            )}
          </button>
        </div>
      </div>
    </>
  );
}
