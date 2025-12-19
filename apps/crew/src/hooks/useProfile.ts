"use client";

/**
 * Hook for managing crew member profiles (drivers/monitors)
 *
 * - Fetches the current user's professional profile
 * - Provides mutations to update profile data
 * - Tracks profile completion status
 */

import { useQuery, useMutation } from "@altaviapp/convex-client";
import { api } from "../../../../convex/_generated/api";
import { Id } from "../../../../convex/_generated/dataModel";
import { useConvexAuth } from "./useConvexAuth";

export type DriverProfile = {
  _id: Id<"drivers">;
  userId: Id<"users">;
  institutionId: Id<"institutions">;
  licenseNumber?: string;
  licenseType?: string;
  licenseExpiry?: number;
  phone?: string;
  emergencyContact?: string;
  profileCompleted?: boolean;
  isActive: boolean;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
};

export type MonitorProfile = {
  _id: Id<"monitors">;
  userId: Id<"users">;
  institutionId: Id<"institutions">;
  idNumber?: string;
  phone?: string;
  emergencyContact?: string;
  firstAidCertified?: boolean;
  firstAidCertExpiry?: number;
  childCareCertified?: boolean;
  profileCompleted?: boolean;
  isActive: boolean;
  user: {
    name: string;
    email: string;
    phone?: string;
  };
};

/**
 * Hook to get and update driver profile
 */
export function useDriverProfile() {
  const { userId, isDriver } = useConvexAuth();

  const profile = useQuery(
    api.drivers.getMyDriverProfile,
    userId && isDriver ? { userId } : "skip"
  ) as DriverProfile | null | undefined;

  const updateDriverMutation = useMutation(api.drivers.updateDriver);

  const updateProfile = async (data: {
    licenseNumber?: string;
    licenseType?: string;
    licenseExpiry?: number;
    phone?: string;
    emergencyContact?: string;
  }) => {
    if (!userId || !profile) throw new Error("No profile loaded");
    return updateDriverMutation({
      userId,
      driverId: profile._id,
      ...data,
    });
  };

  return {
    profile,
    isLoading: profile === undefined,
    notFound: profile === null,
    profileCompleted: profile?.profileCompleted ?? false,
    updateProfile,
  };
}

/**
 * Hook to get and update monitor profile
 */
export function useMonitorProfile() {
  const { userId, isMonitor } = useConvexAuth();

  const profile = useQuery(
    api.monitors.getMyMonitorProfile,
    userId && isMonitor ? { userId } : "skip"
  ) as MonitorProfile | null | undefined;

  const updateMonitorMutation = useMutation(api.monitors.updateMonitor);

  const updateProfile = async (data: {
    idNumber?: string;
    phone?: string;
    emergencyContact?: string;
    firstAidCertified?: boolean;
    firstAidCertExpiry?: number;
    childCareCertified?: boolean;
  }) => {
    if (!userId || !profile) throw new Error("No profile loaded");
    return updateMonitorMutation({
      userId,
      monitorId: profile._id,
      ...data,
    });
  };

  return {
    profile,
    isLoading: profile === undefined,
    notFound: profile === null,
    profileCompleted: profile?.profileCompleted ?? false,
    updateProfile,
  };
}

/**
 * Hook that returns the appropriate profile based on user role
 */
export function useMyProfile() {
  const { isDriver, isMonitor } = useConvexAuth();
  const driverProfile = useDriverProfile();
  const monitorProfile = useMonitorProfile();

  if (isDriver) {
    return {
      type: "driver" as const,
      ...driverProfile,
    };
  }

  if (isMonitor) {
    return {
      type: "monitor" as const,
      ...monitorProfile,
    };
  }

  return {
    type: null,
    profile: null,
    isLoading: false,
    notFound: true,
    profileCompleted: false,
    updateProfile: async () => {
      throw new Error("No role assigned");
    },
  };
}
