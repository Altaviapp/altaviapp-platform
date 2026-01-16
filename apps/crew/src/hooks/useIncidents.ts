"use client";

/**
 * Incidents hooks for Crew App
 *
 * Both drivers and monitors can report incidents.
 */

import { useMutation, useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

export type IncidentType = "accident" | "breakdown" | "behavior" | "emergency" | "other";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";

export interface ReportIncidentInput {
  tripId?: Id<"trips"> | string;
  type: IncidentType;
  severity: IncidentSeverity;
  title: string;
  description: string;
  location?: string;
  latitude?: number;
  longitude?: number;
}

export function useIncidentMutations() {
  const { userId, institutionId } = useConvexAuth();
  const reportIncidentMutation = useMutation(api.incidents.reportIncident);

  const reportIncident = async (input: ReportIncidentInput) => {
    if (!userId || !institutionId) {
      throw new Error("Usuario no autenticado");
    }

    return await reportIncidentMutation({
      userId,
      institutionId,
      tripId: input.tripId as Id<"trips"> | undefined,
      type: input.type,
      severity: input.severity,
      title: input.title,
      description: input.description,
      location: input.location,
      latitude: input.latitude,
      longitude: input.longitude,
    });
  };

  return {
    reportIncident,
    isReady: !!userId && !!institutionId,
  };
}

/**
 * Hook to fetch incidents for a specific trip
 */
export function useIncidentsByTrip(tripId: Id<"trips"> | string | null) {
  const { userId, institutionId } = useConvexAuth();

  const incidents = useQuery(
    api.incidents.listIncidents,
    userId && institutionId && tripId
      ? {
          userId,
          institutionId,
          tripId: tripId as Id<"trips">,
        }
      : "skip"
  );

  return {
    incidents: incidents ?? [],
    isLoading: incidents === undefined,
    hasIncidents: (incidents?.length ?? 0) > 0,
  };
}
