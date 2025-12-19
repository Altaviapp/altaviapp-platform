"use client";

/**
 * Hook for fleet management (vehicles, drivers, monitors)
 *
 * Provides CRUD operations with loading/error states
 */

import { useQuery, useMutation } from "@altaviapp/convex-client";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

// ============================================
// VEHICLES
// ============================================

export function useVehicles(filters?: { status?: "active" | "maintenance" | "out_of_service" }) {
  const { userId, institutionId } = useConvexAuth();

  const vehicles = useQuery(
    api.vehicles.listVehicles,
    userId && institutionId
      ? { userId, institutionId, ...filters }
      : "skip"
  );

  return {
    vehicles: vehicles ?? [],
    isLoading: vehicles === undefined,
    isEmpty: vehicles !== undefined && vehicles.length === 0,
  };
}

export function useVehicle(vehicleId: Id<"vehicles"> | null) {
  const { userId } = useConvexAuth();

  const vehicle = useQuery(
    api.vehicles.getVehicle,
    userId && vehicleId
      ? { userId, vehicleId }
      : "skip"
  );

  return {
    vehicle,
    isLoading: vehicle === undefined,
    notFound: vehicle === null,
  };
}

export function useVehicleMutations() {
  const { userId, institutionId } = useConvexAuth();

  const createVehicle = useMutation(api.vehicles.createVehicle);
  const updateVehicle = useMutation(api.vehicles.updateVehicle);
  const deactivateVehicle = useMutation(api.vehicles.deactivateVehicle);

  return {
    createVehicle: async (data: {
      licensePlate: string;
      brand: string;
      model: string;
      year: number;
      color: string;
      capacity: number;
    }) => {
      if (!userId || !institutionId) throw new Error("Not authenticated");
      return createVehicle({ userId, institutionId, ...data });
    },

    updateVehicle: async (
      vehicleId: Id<"vehicles">,
      data: Partial<{
        licensePlate: string;
        brand: string;
        model: string;
        year: number;
        color: string;
        capacity: number;
        status: "active" | "maintenance" | "out_of_service";
      }>
    ) => {
      if (!userId) throw new Error("Not authenticated");
      return updateVehicle({ userId, vehicleId, ...data });
    },

    deactivateVehicle: async (vehicleId: Id<"vehicles">) => {
      if (!userId) throw new Error("Not authenticated");
      return deactivateVehicle({ userId, vehicleId });
    },
  };
}

// ============================================
// DRIVERS
// ============================================

export function useDrivers(filters?: { isActive?: boolean }) {
  const { userId, institutionId } = useConvexAuth();

  const drivers = useQuery(
    api.drivers.listDriversByInstitution,
    userId && institutionId
      ? { userId, institutionId, ...filters }
      : "skip"
  );

  return {
    drivers: drivers ?? [],
    isLoading: drivers === undefined,
    isEmpty: drivers !== undefined && drivers.length === 0,
  };
}

export function useDriver(driverId: Id<"drivers"> | null) {
  const { userId } = useConvexAuth();

  const driver = useQuery(
    api.drivers.getDriverById,
    userId && driverId
      ? { userId, driverId }
      : "skip"
  );

  return {
    driver,
    isLoading: driver === undefined,
    notFound: driver === null,
  };
}

export function useDriverMutations() {
  const { userId } = useConvexAuth();

  // Driver profiles are auto-created when user accepts invitation with role="driver"
  // Admin can only update existing drivers
  const updateDriver = useMutation(api.drivers.updateDriver);
  const deactivateDriver = useMutation(api.drivers.deactivateDriver);

  return {
    updateDriver: async (
      driverId: Id<"drivers">,
      data: Partial<{
        licenseNumber: string;
        licenseType: string;
        licenseExpiry: number;
        phone: string;
        emergencyContact: string;
        isActive: boolean;
      }>
    ) => {
      if (!userId) throw new Error("Not authenticated");
      return updateDriver({ userId, driverId, ...data });
    },

    deactivateDriver: async (driverId: Id<"drivers">) => {
      if (!userId) throw new Error("Not authenticated");
      return deactivateDriver({ userId, driverId });
    },
  };
}

// ============================================
// MONITORS
// ============================================

export function useMonitors(filters?: { isActive?: boolean }) {
  const { userId, institutionId } = useConvexAuth();

  const monitors = useQuery(
    api.monitors.listMonitorsByInstitution,
    userId && institutionId
      ? { userId, institutionId, ...filters }
      : "skip"
  );

  return {
    monitors: monitors ?? [],
    isLoading: monitors === undefined,
    isEmpty: monitors !== undefined && monitors.length === 0,
  };
}

export function useMonitor(monitorId: Id<"monitors"> | null) {
  const { userId } = useConvexAuth();

  const monitor = useQuery(
    api.monitors.getMonitorById,
    userId && monitorId
      ? { userId, monitorId }
      : "skip"
  );

  return {
    monitor,
    isLoading: monitor === undefined,
    notFound: monitor === null,
  };
}

export function useMonitorMutations() {
  const { userId } = useConvexAuth();

  // Monitor profiles are auto-created when user accepts invitation with role="monitor"
  // Admin can only update existing monitors
  const updateMonitor = useMutation(api.monitors.updateMonitor);
  const deactivateMonitor = useMutation(api.monitors.deactivateMonitor);

  return {
    updateMonitor: async (
      monitorId: Id<"monitors">,
      data: Partial<{
        idNumber: string;
        phone: string;
        emergencyContact: string;
        firstAidCertified: boolean;
        firstAidCertExpiry: number;
        childCareCertified: boolean;
        isActive: boolean;
      }>
    ) => {
      if (!userId) throw new Error("Not authenticated");
      return updateMonitor({ userId, monitorId, ...data });
    },

    deactivateMonitor: async (monitorId: Id<"monitors">) => {
      if (!userId) throw new Error("Not authenticated");
      return deactivateMonitor({ userId, monitorId });
    },
  };
}
