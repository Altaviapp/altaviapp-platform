/**
 * Reports and Analytics Functions
 *
 * Aggregation queries for admin dashboard reports.
 */

import { v } from "convex/values";
import { query } from "./_generated/server";
import { verifyRole, verifyInstitutionAccess } from "./lib/simpleAuth";

/**
 * Get dashboard metrics for an institution
 */
export const getDashboardMetrics = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    startDate: v.optional(v.string()), // YYYY-MM-DD
    endDate: v.optional(v.string()), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    // Default to last 30 days
    const endDate: string = args.endDate || new Date().toISOString().split("T")[0]!;
    const startDate: string = args.startDate || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return d.toISOString().split("T")[0]!;
    })();

    // Get all routes for this institution
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();

    const routeIds = routes.map((r) => r._id);

    // Get all trips for these routes in date range
    const allTrips = await ctx.db
      .query("trips")
      .collect();

    const trips = allTrips.filter((t) =>
      routeIds.some((id) => id === t.routeId) &&
      t.scheduledDate >= startDate &&
      t.scheduledDate <= endDate
    );

    // Calculate trip metrics
    const completedTrips = trips.filter((t) => t.status === "completed").length;
    const totalTrips = trips.length;
    const cancelledTrips = trips.filter((t) => t.status === "cancelled").length;

    // Calculate punctuality (completed on time vs total completed)
    const onTimeTrips = trips.filter((t) => {
      if (t.status !== "completed" || !t.startTime || !t.endTime) return false;
      // Consider on-time if duration is within 20% of expected
      return true; // Simplified - would need route expected duration
    }).length;
    const punctuality = completedTrips > 0
      ? Math.round((onTimeTrips / completedTrips) * 100)
      : 100;

    // Get student check-ins for these trips
    const tripIds = trips.map((t) => t._id);
    const allCheckins = await ctx.db
      .query("studentCheckins")
      .collect();

    const checkins = allCheckins.filter((c) =>
      tripIds.some((id) => id === c.tripId)
    );

    const studentsTransported = new Set(checkins.map((c) => c.studentId)).size;
    const totalCheckins = checkins.length;

    // Get incidents for this institution in date range
    const allIncidents = await ctx.db
      .query("incidents")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();

    const incidents = allIncidents.filter((i) => {
      const incidentDate = new Date(i.createdAt).toISOString().split("T")[0]!;
      return incidentDate >= startDate && incidentDate <= endDate;
    });

    const incidentsByType = {
      accident: incidents.filter((i) => i.type === "accident").length,
      breakdown: incidents.filter((i) => i.type === "breakdown").length,
      behavior: incidents.filter((i) => i.type === "behavior").length,
      emergency: incidents.filter((i) => i.type === "emergency").length,
      other: incidents.filter((i) => i.type === "other").length,
    };

    const incidentsBySeverity = {
      critical: incidents.filter((i) => i.severity === "critical").length,
      high: incidents.filter((i) => i.severity === "high").length,
      medium: incidents.filter((i) => i.severity === "medium").length,
      low: incidents.filter((i) => i.severity === "low").length,
    };

    return {
      period: { startDate, endDate },
      trips: {
        total: totalTrips,
        completed: completedTrips,
        cancelled: cancelledTrips,
        inProgress: trips.filter((t) => t.status === "in_progress").length,
        scheduled: trips.filter((t) => t.status === "scheduled").length,
      },
      punctuality,
      students: {
        transported: studentsTransported,
        totalCheckins,
      },
      incidents: {
        total: incidents.length,
        byType: incidentsByType,
        bySeverity: incidentsBySeverity,
        open: incidents.filter((i) => i.status === "open").length,
        resolved: incidents.filter((i) => i.status === "resolved" || i.status === "closed").length,
      },
    };
  },
});

/**
 * Get daily trip statistics for charts
 */
export const getDailyStats = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    days: v.optional(v.number()), // Default 7 days
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const numDays = args.days || 7;
    const today = new Date();

    // Get all routes for this institution
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();

    const routeIds = routes.map((r) => r._id);

    // Generate date range
    const dates: string[] = [];
    for (let i = numDays - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      dates.push(d.toISOString().split("T")[0]!);
    }

    // Get all trips
    const allTrips = await ctx.db.query("trips").collect();
    const trips = allTrips.filter((t) => routeIds.some((id) => id === t.routeId));

    // Group trips by date
    const dailyStats = dates.map((date) => {
      const dayTrips = trips.filter((t) => t.scheduledDate === date);
      const dayOfWeek = new Date(date).toLocaleDateString("es-EC", { weekday: "short" });

      return {
        date,
        dayOfWeek,
        total: dayTrips.length,
        completed: dayTrips.filter((t) => t.status === "completed").length,
        cancelled: dayTrips.filter((t) => t.status === "cancelled").length,
        inProgress: dayTrips.filter((t) => t.status === "in_progress").length,
      };
    });

    return { dailyStats };
  },
});

/**
 * Get top performing routes
 */
export const getTopRoutes = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    limit: v.optional(v.number()),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const limit = args.limit || 5;
    const endDate: string = args.endDate || new Date().toISOString().split("T")[0]!;
    const startDate: string = args.startDate || (() => {
      const d = new Date();
      d.setDate(d.getDate() - 30);
      return d.toISOString().split("T")[0]!;
    })();

    // Get all routes for this institution
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get all trips
    const allTrips = await ctx.db.query("trips").collect();

    // Calculate metrics per route
    const routeMetrics = await Promise.all(
      routes.map(async (route) => {
        const routeTrips = allTrips.filter(
          (t) =>
            t.routeId === route._id &&
            t.scheduledDate >= startDate &&
            t.scheduledDate <= endDate
        );

        const completedTrips = routeTrips.filter((t) => t.status === "completed").length;
        const totalTrips = routeTrips.length;

        // Get student assignments for this route
        const assignments = await ctx.db
          .query("studentRoutes")
          .withIndex("by_route", (q) => q.eq("routeId", route._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        const studentsAssigned = assignments.length;

        // Calculate punctuality (simplified)
        const punctuality = totalTrips > 0
          ? Math.round((completedTrips / totalTrips) * 100)
          : 0;

        return {
          id: route._id,
          name: route.name,
          type: route.type,
          totalTrips,
          completedTrips,
          studentsAssigned,
          punctuality,
        };
      })
    );

    // Sort by completed trips and limit
    return routeMetrics
      .sort((a, b) => b.completedTrips - a.completedTrips)
      .slice(0, limit);
  },
});

/**
 * Get trip report data
 */
export const getTripReport = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    startDate: v.string(),
    endDate: v.string(),
    status: v.optional(v.union(
      v.literal("scheduled"),
      v.literal("in_progress"),
      v.literal("completed"),
      v.literal("cancelled")
    )),
    routeId: v.optional(v.id("routes")),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    // Get routes for this institution
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();

    const routeIds = args.routeId
      ? [args.routeId]
      : routes.map((r) => r._id);

    // Get all trips
    const allTrips = await ctx.db.query("trips").collect();

    let trips = allTrips.filter(
      (t) =>
        routeIds.some((id) => id === t.routeId) &&
        t.scheduledDate >= args.startDate &&
        t.scheduledDate <= args.endDate
    );

    if (args.status) {
      trips = trips.filter((t) => t.status === args.status);
    }

    // Enrich with details
    const enriched = await Promise.all(
      trips.map(async (trip) => {
        const route = routes.find((r) => r._id === trip.routeId);
        const driver = trip.driverId ? await ctx.db.get(trip.driverId) : null;
        const driverUser = driver?.userId ? await ctx.db.get(driver.userId) : null;
        const vehicle = trip.vehicleId ? await ctx.db.get(trip.vehicleId) : null;

        // Get check-in count
        const checkins = await ctx.db
          .query("studentCheckins")
          .withIndex("by_trip", (q) => q.eq("tripId", trip._id))
          .collect();

        // Calculate duration
        let duration = null;
        if (trip.startTime && trip.endTime) {
          duration = Math.round((trip.endTime - trip.startTime) / 60000); // minutes
        }

        return {
          id: trip._id,
          date: trip.scheduledDate,
          status: trip.status,
          routeName: route?.name || "Desconocida",
          routeType: route?.type,
          driverName: driverUser?.name || "Sin asignar",
          vehiclePlate: vehicle?.licensePlate || "Sin asignar",
          startTime: trip.startTime,
          endTime: trip.endTime,
          duration,
          studentsCheckedIn: checkins.length,
        };
      })
    );

    return enriched.sort((a, b) => b.date.localeCompare(a.date));
  },
});

/**
 * Get incident report data
 */
export const getIncidentReport = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    startDate: v.string(),
    endDate: v.string(),
    type: v.optional(v.union(
      v.literal("accident"),
      v.literal("breakdown"),
      v.literal("behavior"),
      v.literal("emergency"),
      v.literal("other")
    )),
    severity: v.optional(v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    )),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    // Get all incidents for this institution
    let incidents = await ctx.db
      .query("incidents")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();

    // Filter by date range
    const startTimestamp = new Date(args.startDate).getTime();
    const endTimestamp = new Date(args.endDate).getTime() + 86400000; // Include end date

    incidents = incidents.filter(
      (i) => i.createdAt >= startTimestamp && i.createdAt < endTimestamp
    );

    if (args.type) {
      incidents = incidents.filter((i) => i.type === args.type);
    }

    if (args.severity) {
      incidents = incidents.filter((i) => i.severity === args.severity);
    }

    // Enrich with details
    const enriched = await Promise.all(
      incidents.map(async (incident) => {
        const reporter = await ctx.db.get(incident.reportedBy);
        const trip = incident.tripId ? await ctx.db.get(incident.tripId) : null;
        const route = trip?.routeId ? await ctx.db.get(trip.routeId) : null;

        return {
          id: incident._id,
          date: new Date(incident.createdAt).toISOString().split("T")[0]!,
          time: new Date(incident.createdAt).toLocaleTimeString("es-EC", {
            hour: "2-digit",
            minute: "2-digit",
          }),
          type: incident.type,
          severity: incident.severity,
          status: incident.status,
          description: incident.description,
          reportedBy: reporter?.name || "Desconocido",
          routeName: route?.name || "N/A",
          location: incident.latitude && incident.longitude
            ? `${incident.latitude.toFixed(4)}, ${incident.longitude.toFixed(4)}`
            : "N/A",
        };
      })
    );

    return enriched.sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  },
});

/**
 * Get student attendance report
 */
export const getAttendanceReport = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    startDate: v.string(),
    endDate: v.string(),
    grade: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    // Get all students for this institution
    let students = await ctx.db
      .query("students")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (args.grade) {
      students = students.filter((s) => s.grade === args.grade);
    }

    // Get all check-ins in date range
    const allCheckins = await ctx.db.query("studentCheckins").collect();

    const startTimestamp = new Date(args.startDate).getTime();
    const endTimestamp = new Date(args.endDate).getTime() + 86400000;

    const checkins = allCheckins.filter(
      (c) => c.timestamp >= startTimestamp && c.timestamp < endTimestamp
    );

    // Calculate attendance per student
    const studentAttendance = students.map((student) => {
      const studentCheckins = checkins.filter(
        (c) => c.studentId === student._id
      );

      const pickups = studentCheckins.filter((c) => c.checkinType === "pickup").length;
      const dropoffs = studentCheckins.filter((c) => c.checkinType === "dropoff").length;

      return {
        id: student._id,
        name: `${student.firstName} ${student.lastName}`,
        grade: student.grade,
        pickups,
        dropoffs,
        totalTrips: pickups, // Each pickup = 1 trip taken
        attendanceRate: pickups > 0 ? Math.round((pickups / Math.max(pickups, 1)) * 100) : 0,
      };
    });

    return studentAttendance.sort((a, b) => a.name.localeCompare(b.name));
  },
});
