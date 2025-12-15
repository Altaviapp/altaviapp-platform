"use client";

/**
 * Incidents hooks for Convex
 *
 * Provides incident management functionality
 */

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

// Incident types
export type IncidentType = "accident" | "breakdown" | "behavior" | "emergency" | "other";
export type IncidentSeverity = "low" | "medium" | "high" | "critical";
export type IncidentStatus = "open" | "investigating" | "resolved" | "closed";

// ============================================
// LIST INCIDENTS
// ============================================

export function useIncidents(filters?: {
  type?: IncidentType;
  severity?: IncidentSeverity;
  status?: IncidentStatus;
  tripId?: Id<"trips">;
}) {
  const { userId, institutionId } = useConvexAuth();

  const incidents = useQuery(
    api.incidents.listIncidents,
    userId && institutionId
      ? { userId, institutionId, ...filters }
      : "skip"
  );

  return {
    incidents: incidents ?? [],
    isLoading: incidents === undefined,
    isEmpty: incidents !== undefined && incidents.length === 0,
  };
}

// ============================================
// SINGLE INCIDENT
// ============================================

export function useIncident(incidentId: Id<"incidents"> | null) {
  const { userId } = useConvexAuth();

  const incident = useQuery(
    api.incidents.getIncident,
    userId && incidentId
      ? { userId, incidentId }
      : "skip"
  );

  return {
    incident,
    isLoading: incident === undefined,
  };
}

// ============================================
// INCIDENT MUTATIONS
// ============================================

export function useIncidentMutations() {
  const { userId, institutionId } = useConvexAuth();

  const reportIncident = useMutation(api.incidents.reportIncident);
  const updateIncident = useMutation(api.incidents.updateIncident);
  const resolveIncident = useMutation(api.incidents.resolveIncident);

  return {
    reportIncident: async (data: {
      tripId?: Id<"trips">;
      type: IncidentType;
      severity: IncidentSeverity;
      title: string;
      description: string;
      location?: string;
      latitude?: number;
      longitude?: number;
    }) => {
      if (!userId || !institutionId) throw new Error("Not authenticated");
      return reportIncident({ userId, institutionId, ...data });
    },

    updateIncident: async (
      incidentId: Id<"incidents">,
      data: {
        status?: IncidentStatus;
        title?: string;
        description?: string;
      }
    ) => {
      if (!userId) throw new Error("Not authenticated");
      return updateIncident({ userId, incidentId, ...data });
    },

    resolveIncident: async (incidentId: Id<"incidents">, resolutionNotes?: string) => {
      if (!userId) throw new Error("Not authenticated");
      return resolveIncident({ userId, incidentId, resolutionNotes });
    },
  };
}

// ============================================
// OPEN INCIDENTS
// ============================================

export function useOpenIncidents() {
  return useIncidents({ status: "open" });
}

// ============================================
// CRITICAL INCIDENTS
// ============================================

export function useCriticalIncidents() {
  return useIncidents({ severity: "critical" });
}

// ============================================
// INCIDENT STATS
// ============================================

export function useIncidentStats() {
  const { incidents, isLoading } = useIncidents();

  const stats = {
    total: incidents.length,
    open: incidents.filter((i) => i.status === "open").length,
    investigating: incidents.filter((i) => i.status === "investigating").length,
    resolved: incidents.filter((i) => i.status === "resolved").length,
    critical: incidents.filter((i) => i.severity === "critical").length,
    high: incidents.filter((i) => i.severity === "high").length,
    byType: {
      accident: incidents.filter((i) => i.type === "accident").length,
      breakdown: incidents.filter((i) => i.type === "breakdown").length,
      behavior: incidents.filter((i) => i.type === "behavior").length,
      emergency: incidents.filter((i) => i.type === "emergency").length,
      other: incidents.filter((i) => i.type === "other").length,
    },
  };

  return {
    stats,
    isLoading,
  };
}
