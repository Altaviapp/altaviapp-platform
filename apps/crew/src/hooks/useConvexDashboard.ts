"use client";

/**
 * Convex Dashboard hook for Crew App
 *
 * Provides real-time dashboard data from Convex
 * Uses route-centric approach for lazy trip creation
 */

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useConvexAuth } from "./useConvexAuth";
import type { DashboardData, TripWithDetails, Notification, Vehicle, User, Route, Trip } from "@/types";

// ============================================
// TYPE FOR API RESPONSE
// ============================================

type TripFromAPI = {
  _id: string;
  _creationTime: number;
  routeId: string;
  driverId: string;
  monitorId?: string;
  vehicleId: string;
  status: "scheduled" | "in_progress" | "completed" | "cancelled";
  scheduledDate: string;
  createdAt: number;
  updatedAt: number;
  route: { id: string; name: string; type: "pickup" | "dropoff" } | null;
  vehicle: { licensePlate: string } | null;
};

// Route available for today (from listRoutesForDriverToday)
type RouteForTodayFromAPI = {
  _id: string;
  name: string;
  type: "pickup" | "dropoff";
  scheduledStartTime: string;
  scheduledEndTime: string;
  schoolArrivalTime?: string;
  schoolDepartureTime?: string;
  optimizedPolyline?: string;
  estimatedDuration?: number;
  estimatedDistance?: number;
  vehicle: { licensePlate: string; brand: string; model: string } | null;
  studentCount: number;
  tripStatus: "scheduled" | "in_progress" | "completed" | "cancelled" | null;
  tripId: string | null;
  canStart: boolean;
};

// ============================================
// DASHBOARD DATA HOOK
// ============================================

export function useConvexDashboard() {
  const { userId, institutionId, user, isDriver, isMonitor, isLoading: authLoading } = useConvexAuth();

  // Get driver's today trips (legacy fallback)
  const today = new Date().toISOString().split("T")[0];
  const tripsData = useQuery(
    api.trips.listTripsForDriver,
    userId ? { userId, date: today } : "skip"
  ) as TripFromAPI[] | undefined;

  // Get routes available for today (new lazy trip creation approach)
  const routesForTodayData = useQuery(
    api.trips.listRoutesForDriverToday,
    userId ? { userId } : "skip"
  ) as RouteForTodayFromAPI[] | undefined;

  // Get notifications
  const notificationsData = useQuery(
    api.notifications.getNotifications,
    userId ? { userId, limit: 5 } : "skip"
  );

  // Map API route type to UI type
  const mapRouteType = (apiType: "pickup" | "dropoff"): "inbound" | "outbound" => {
    return apiType === "pickup" ? "inbound" : "outbound";
  };

  // Transform trips data to match TripWithDetails interface
  const todayTrips: TripWithDetails[] = (tripsData ?? []).map((trip) => {
    const routeType = trip.route?.type ?? "pickup";
    const defaultRoute: Route = {
      _id: trip.routeId ?? "",
      institutionId: "",
      name: trip.route?.name ?? "Ruta sin asignar",
      type: mapRouteType(routeType),
      startTime: "07:00",
      endTime: "08:00",
      daysOfWeek: [],
      isActive: true,
      createdAt: "",
    };

    const defaultVehicle: Vehicle = {
      _id: trip.vehicleId ?? "",
      institutionId: "",
      plate: trip.vehicle?.licensePlate ?? "---",
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      capacity: 0,
      status: "active",
      createdAt: "",
    };

    const tripData: TripWithDetails = {
      _id: trip._id,
      institutionId: "",
      routeId: trip.routeId,
      vehicleId: trip.vehicleId,
      driverId: trip.driverId,
      monitorId: trip.monitorId,
      type: mapRouteType(routeType),
      date: trip.scheduledDate,
      scheduledStartTime: "07:00",
      scheduledEndTime: "08:00",
      status: trip.status,
      studentsAssigned: [],
      studentsOnBoard: [],
      studentsAbsent: [],
      checklistCompleted: false,
      createdAt: trip._creationTime?.toString() ?? "",
      route: defaultRoute,
      vehicle: defaultVehicle,
      driver: {
        _id: trip.driverId,
        email: user?.email ?? "",
        name: user?.name ?? "",
        role: "driver",
        isActive: true,
        createdAt: "",
      },
      stops: [],
      students: [],
    };

    return tripData;
  });

  // Transform notifications
  const recentNotifications: Notification[] = (notificationsData ?? []).map((n) => ({
    _id: n._id,
    userId: n.userId,
    type: n.type as "info" | "warning" | "error" | "success",
    title: n.title,
    message: n.message,
    read: n.read,
    timestamp: n._creationTime?.toString() ?? "",
    createdAt: n._creationTime?.toString() ?? "",
  }));

  // Get vehicle from first trip (driver typically has one vehicle)
  const vehicle: Vehicle = todayTrips[0]?.vehicle ?? {
    _id: "",
    institutionId: institutionId ?? "",
    plate: "---",
    brand: "Sin vehículo",
    model: "asignado",
    year: new Date().getFullYear(),
    color: "",
    capacity: 0,
    status: "active",
    createdAt: "",
  };

  // Build driver user object
  const driverUser: User = {
    _id: userId ?? "",
    email: user?.email ?? "",
    name: user?.name ?? "",
    role: isDriver ? "driver" : isMonitor ? "monitor" : "driver",
    institutionId: institutionId ?? undefined,
    isActive: true,
    createdAt: "",
  };

  // Calculate weekly stats (placeholder - would need a separate query)
  const weeklyStats = {
    tripsCompleted: todayTrips.filter((t) => t.status === "completed").length,
    studentsTransported: 0,
    punctuality: 95,
  };

  // Transform routes for today to include in response
  const routesForToday = (routesForTodayData ?? []).map((route) => ({
    _id: route._id,
    name: route.name,
    type: route.type,
    scheduledStartTime: route.scheduledStartTime,
    scheduledEndTime: route.scheduledEndTime,
    schoolArrivalTime: route.schoolArrivalTime,
    schoolDepartureTime: route.schoolDepartureTime,
    optimizedPolyline: route.optimizedPolyline,
    estimatedDuration: route.estimatedDuration,
    estimatedDistance: route.estimatedDistance,
    vehicle: route.vehicle,
    studentCount: route.studentCount,
    tripStatus: route.tripStatus,
    tripId: route.tripId,
    canStart: route.canStart,
  }));

  // Build dashboard data
  const data: DashboardData = {
    driver: driverUser,
    vehicle,
    todayTrips,
    weeklyStats,
    recentNotifications,
  };

  const isLoading = authLoading || tripsData === undefined || routesForTodayData === undefined;

  return {
    data: isLoading ? null : data,
    routesForToday: isLoading ? [] : routesForToday,
    loading: isLoading,
    error: null,
    refetch: () => {
      // Convex queries auto-refetch, but we provide this for interface compatibility
    },
  };
}
