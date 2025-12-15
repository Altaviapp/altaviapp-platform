"use client";

/**
 * Hook for route management
 *
 * Provides CRUD operations for routes with loading/error states
 */

import { useQuery, useMutation } from "@altaviapp/convex-client";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

export function useRoutes() {
  const { userId, institutionId } = useConvexAuth();

  // List all routes for the institution
  const routes = useQuery(
    api.routes.listRoutes,
    userId && institutionId
      ? { userId, institutionId }
      : "skip"
  );

  return {
    routes: routes ?? [],
    isLoading: routes === undefined,
    isEmpty: routes !== undefined && routes.length === 0,
  };
}

export function useRoute(routeId: Id<"routes"> | null) {
  const { userId } = useConvexAuth();

  const route = useQuery(
    api.routes.getRoute,
    userId && routeId
      ? { userId, routeId }
      : "skip"
  );

  return {
    route,
    isLoading: route === undefined,
    notFound: route === null,
  };
}

export function useRouteStops(routeId: Id<"routes"> | null) {
  const { userId } = useConvexAuth();

  const stops = useQuery(
    api.routeStops.listStops,
    userId && routeId
      ? { userId, routeId }
      : "skip"
  );

  return {
    stops: stops ?? [],
    isLoading: stops === undefined,
  };
}

export function useRouteMutations() {
  const { userId, institutionId } = useConvexAuth();

  const createRoute = useMutation(api.routes.createRoute);
  const updateRoute = useMutation(api.routes.updateRoute);
  const deactivateRoute = useMutation(api.routes.deactivateRoute);

  const createStop = useMutation(api.routeStops.createStop);
  const updateStop = useMutation(api.routeStops.updateStop);
  const deleteStop = useMutation(api.routeStops.deleteStop);
  const reorderStops = useMutation(api.routeStops.reorderStops);

  return {
    // Route mutations
    createRoute: async (data: {
      name: string;
      type: "pickup" | "dropoff";
      vehicleId: Id<"vehicles">;
      driverId: Id<"drivers">;
      monitorId?: Id<"monitors">;
      scheduledStartTime: string;
      scheduledEndTime: string;
    }) => {
      if (!userId || !institutionId) throw new Error("Not authenticated");
      return createRoute({ userId, institutionId, ...data });
    },

    updateRoute: async (
      routeId: Id<"routes">,
      data: Partial<{
        name: string;
        type: "pickup" | "dropoff";
        vehicleId: Id<"vehicles">;
        driverId: Id<"drivers">;
        monitorId: Id<"monitors">;
        scheduledStartTime: string;
        scheduledEndTime: string;
        isActive: boolean;
      }>
    ) => {
      if (!userId) throw new Error("Not authenticated");
      return updateRoute({ userId, routeId, ...data });
    },

    deactivateRoute: async (routeId: Id<"routes">) => {
      if (!userId) throw new Error("Not authenticated");
      return deactivateRoute({ userId, routeId });
    },

    // Stop mutations
    createStop: async (
      routeId: Id<"routes">,
      data: {
        name: string;
        address: string;
        latitude: number;
        longitude: number;
        scheduledTime: string;
        order: number;
        geofenceRadius?: number;
      }
    ) => {
      if (!userId) throw new Error("Not authenticated");
      return createStop({ userId, routeId, ...data });
    },

    updateStop: async (
      stopId: Id<"routeStops">,
      data: Partial<{
        name: string;
        address: string;
        latitude: number;
        longitude: number;
        scheduledTime: string;
        order: number;
        geofenceRadius: number;
      }>
    ) => {
      if (!userId) throw new Error("Not authenticated");
      return updateStop({ userId, stopId, ...data });
    },

    deleteStop: async (stopId: Id<"routeStops">) => {
      if (!userId) throw new Error("Not authenticated");
      return deleteStop({ userId, stopId });
    },

    reorderStops: async (
      routeId: Id<"routes">,
      stops: { id: Id<"routeStops">; order: number }[]
    ) => {
      if (!userId) throw new Error("Not authenticated");
      return reorderStops({ userId, routeId, stops });
    },
  };
}
