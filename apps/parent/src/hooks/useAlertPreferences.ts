"use client";

/**
 * Alert Preferences Hook
 *
 * Manages user preferences for proximity alerts per student.
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";
import { useState } from "react";

export interface AlertPreferences {
  alertsEnabled: boolean;
  alertRadius: number; // 500, 1000, 2000 meters
  pushEnabled?: boolean;
  pushToken?: string | null;
}

export function useAlertPreferences(studentId: Id<"students"> | null) {
  const { userId } = useConvexAuth();
  const [isSaving, setIsSaving] = useState(false);

  // Query preferences
  const preferences = useQuery(
    api.userPreferences.getPreferences,
    userId && studentId ? { userId, studentId } : "skip"
  );

  // Mutations
  const setPreferencesMutation = useMutation(api.userPreferences.setPreferences);
  const toggleAlertsMutation = useMutation(api.userPreferences.toggleAlerts);

  // Save preferences
  const savePreferences = async (alertsEnabled: boolean, alertRadius: number) => {
    if (!userId || !studentId) {
      throw new Error("Usuario o estudiante no válido");
    }

    setIsSaving(true);
    try {
      await setPreferencesMutation({
        userId,
        studentId,
        alertsEnabled,
        alertRadius,
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Toggle alerts on/off
  const toggleAlerts = async () => {
    if (!userId || !studentId) {
      throw new Error("Usuario o estudiante no válido");
    }

    setIsSaving(true);
    try {
      const result = await toggleAlertsMutation({
        userId,
        studentId,
      });
      return result.alertsEnabled;
    } finally {
      setIsSaving(false);
    }
  };

  return {
    preferences: preferences as AlertPreferences | undefined,
    isLoading: preferences === undefined,
    isSaving,
    savePreferences,
    toggleAlerts,
  };
}
