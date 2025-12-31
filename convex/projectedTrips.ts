import { query } from "./_generated/server";
import { v } from "convex/values";
import { Id } from "./_generated/dataModel";

// ============================================
// Helper Functions
// ============================================

/**
 * Get day name from date string
 */
function getDayName(date: Date): string {
  const days = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return days[date.getDay()] || "monday";
}

/**
 * Check if route runs on a specific date based on recurrence
 */
function routeRunsOnDate(
  recurrence: {
    type: "daily" | "weekly" | "monthly" | "one_time";
    daysOfWeek?: string[];
    dayOfWeek?: string;
    dayOfMonth?: number;
    specificDate?: string;
  } | undefined,
  dateStr: string
): boolean {
  if (!recurrence) {
    return true; // No recurrence = runs every day
  }

  const date = new Date(dateStr + "T12:00:00");
  const dayName = getDayName(date);

  switch (recurrence.type) {
    case "daily":
      if (recurrence.daysOfWeek && recurrence.daysOfWeek.length > 0) {
        return recurrence.daysOfWeek.includes(dayName);
      }
      return true;
    case "weekly":
      return recurrence.dayOfWeek === dayName;
    case "monthly":
      return recurrence.dayOfMonth === date.getDate();
    case "one_time":
      return recurrence.specificDate === dateStr;
    default:
      return true;
  }
}

/**
 * Generate array of date strings between start and end
 */
function generateDateRange(startDate: string, endDate: string, maxDays: number = 31): string[] {
  const dates: string[] = [];
  const start = new Date(startDate + "T12:00:00");
  const end = new Date(endDate + "T12:00:00");

  const maxEnd = new Date(start);
  maxEnd.setDate(maxEnd.getDate() + maxDays);
  const actualEnd = end < maxEnd ? end : maxEnd;

  const current = new Date(start);
  while (current <= actualEnd) {
    dates.push(current.toISOString().split("T")[0]!);
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

/**
 * Check if a novedad applies to a specific date and route type
 */
function novedadAppliesToDate(
  novedad: {
    durationType?: string;
    startDate?: string;
    endDate?: string;
    date?: string;
    recurringDays?: number[];
    affectedRouteType: string;
    status: string;
  },
  dateStr: string,
  routeType: "pickup" | "dropoff"
): boolean {
  // Only count approved novedades
  if (novedad.status !== "approved" && novedad.status !== "pending") {
    return false;
  }

  // Check route type
  if (novedad.affectedRouteType !== "both" && novedad.affectedRouteType !== routeType) {
    return false;
  }

  const durationType = novedad.durationType || "single_day";

  switch (durationType) {
    case "single_day":
      return (novedad.startDate || novedad.date) === dateStr;
    case "date_range":
      const rangeStart = novedad.startDate || novedad.date || "";
      const rangeEnd = novedad.endDate || rangeStart;
      return dateStr >= rangeStart && dateStr <= rangeEnd;
    case "permanent":
      const permStart = novedad.startDate || novedad.date || "";
      return dateStr >= permStart;
    case "recurring":
      if (!novedad.recurringDays?.length) return false;
      const dayOfWeekNum = new Date(dateStr + "T12:00:00").getDay();
      return novedad.recurringDays.includes(dayOfWeekNum);
    default:
      return novedad.date === dateStr;
  }
}

// ============================================
// Main Queries
// ============================================

/**
 * List projected trips for a date range
 * Returns both actual trips (if they exist) and projected trips from routes
 */
export const listProjectedTrips = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    startDate: v.string(),
    endDate: v.string(),
    vehicleId: v.optional(v.id("vehicles")),
    driverId: v.optional(v.id("drivers")),
    studentSearch: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Generate date range
    const dates = generateDateRange(args.startDate, args.endDate, 31);

    // Get all active routes for institution
    let routes = await ctx.db
      .query("routes")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Apply vehicle filter
    if (args.vehicleId) {
      routes = routes.filter((r) => r.vehicleId === args.vehicleId);
    }

    // Apply driver filter
    if (args.driverId) {
      routes = routes.filter((r) => r.driverId === args.driverId);
    }

    // Get existing trips in date range
    const existingTrips = await ctx.db
      .query("trips")
      .withIndex("by_date")
      .filter((q) =>
        q.and(
          q.gte(q.field("scheduledDate"), args.startDate),
          q.lte(q.field("scheduledDate"), args.endDate)
        )
      )
      .collect();

    // Index trips by route+date
    const tripsByRouteDate = new Map<string, typeof existingTrips[0]>();
    for (const trip of existingTrips) {
      tripsByRouteDate.set(`${trip.routeId}:${trip.scheduledDate}`, trip);
    }

    // Get all novedades in date range
    const novedades = await ctx.db
      .query("novedades")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();

    // Get student search filter if provided
    let filteredStudentIds: Set<string> | null = null;
    if (args.studentSearch && args.studentSearch.trim().length > 0) {
      const searchLower = args.studentSearch.toLowerCase();
      const students = await ctx.db
        .query("students")
        .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
        .collect();

      const matchingStudents = students.filter(
        (s) =>
          s.firstName.toLowerCase().includes(searchLower) ||
          s.lastName.toLowerCase().includes(searchLower)
      );
      filteredStudentIds = new Set(matchingStudents.map((s) => s._id.toString()));
    }

    // Build projected trips
    const projectedTrips: {
      date: string;
      scheduledTime: string;
      routeId: Id<"routes">;
      routeName: string;
      routeType: "pickup" | "dropoff";
      vehicleId: Id<"vehicles">;
      vehiclePlate: string;
      driverId: Id<"drivers">;
      driverName: string;
      monitorId?: Id<"monitors">;
      monitorName?: string;
      status: "projected" | "scheduled" | "in_progress" | "completed" | "cancelled";
      tripId?: Id<"trips">;
      totalStudents: number;
      novedades: { total: number; pending: number; approved: number };
    }[] = [];

    for (const route of routes) {
      // Get vehicle and driver info
      const vehicle = await ctx.db.get(route.vehicleId);
      const driver = await ctx.db.get(route.driverId);
      let monitor = null;
      if (route.monitorId) {
        monitor = await ctx.db.get(route.monitorId);
      }

      // Get students for this route
      const studentRoutes = await ctx.db
        .query("studentRoutes")
        .withIndex("by_route", (q) => q.eq("routeId", route._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      // If student filter is active, check if route has matching students
      if (filteredStudentIds) {
        const hasMatchingStudent = studentRoutes.some((sr) =>
          filteredStudentIds!.has(sr.studentId.toString())
        );
        if (!hasMatchingStudent) {
          continue; // Skip this route
        }
      }

      for (const date of dates) {
        // Check if route runs on this date
        const recurrence = route.recurrence as {
          type: "daily" | "weekly" | "monthly" | "one_time";
          daysOfWeek?: string[];
          dayOfWeek?: string;
          dayOfMonth?: number;
          specificDate?: string;
        } | undefined;

        if (!routeRunsOnDate(recurrence, date)) {
          continue;
        }

        // Check for existing trip
        const existingTrip = tripsByRouteDate.get(`${route._id}:${date}`);

        // Count students active for this day (excluding excludeDays)
        const dayName = getDayName(new Date(date + "T12:00:00"));
        let activeStudentCount = 0;
        for (const sr of studentRoutes) {
          if (sr.excludeDays && Array.isArray(sr.excludeDays)) {
            if (sr.excludeDays.includes(dayName)) {
              continue;
            }
          }
          activeStudentCount++;
        }

        // Count novedades for this route/date
        const routeStudentIds = new Set(studentRoutes.map((sr) => sr.studentId.toString()));
        let novedadesTotal = 0;
        let novedadesPending = 0;
        let novedadesApproved = 0;

        for (const nov of novedades) {
          if (!routeStudentIds.has(nov.studentId.toString())) {
            continue;
          }
          if (!novedadAppliesToDate(nov, date, route.type)) {
            continue;
          }
          novedadesTotal++;
          if (nov.status === "pending") novedadesPending++;
          if (nov.status === "approved") novedadesApproved++;
        }

        projectedTrips.push({
          date,
          scheduledTime: route.scheduledStartTime,
          routeId: route._id,
          routeName: route.name,
          routeType: route.type,
          vehicleId: route.vehicleId,
          vehiclePlate: vehicle?.licensePlate || "Sin placa",
          driverId: route.driverId,
          driverName: driver?.userId
            ? (await ctx.db.get(driver.userId))?.name || "Sin conductor"
            : "Sin conductor",
          monitorId: route.monitorId,
          monitorName: monitor?.userId
            ? (await ctx.db.get(monitor.userId))?.name || undefined
            : undefined,
          status: existingTrip?.status || "projected",
          tripId: existingTrip?._id,
          totalStudents: activeStudentCount,
          novedades: {
            total: novedadesTotal,
            pending: novedadesPending,
            approved: novedadesApproved,
          },
        });
      }
    }

    // Sort by date and time
    projectedTrips.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    return projectedTrips;
  },
});

/**
 * Get count of projected trips by day for a month (for calendar view)
 */
export const getProjectedTripsCountByDay = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    year: v.number(),
    month: v.number(), // 1-12
  },
  handler: async (ctx, args) => {
    // Generate all dates for the month
    const startDate = `${args.year}-${String(args.month).padStart(2, "0")}-01`;
    const lastDay = new Date(args.year, args.month, 0).getDate();
    const endDate = `${args.year}-${String(args.month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;

    const dates = generateDateRange(startDate, endDate, 31);

    // Get active routes
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get existing trips
    const existingTrips = await ctx.db
      .query("trips")
      .withIndex("by_date")
      .filter((q) =>
        q.and(
          q.gte(q.field("scheduledDate"), startDate),
          q.lte(q.field("scheduledDate"), endDate)
        )
      )
      .collect();

    const tripsByRouteDate = new Map<string, typeof existingTrips[0]>();
    for (const trip of existingTrips) {
      tripsByRouteDate.set(`${trip.routeId}:${trip.scheduledDate}`, trip);
    }

    // Count trips per day
    const countByDay: Record<string, { total: number; active: number; completed: number }> = {};

    for (const date of dates) {
      countByDay[date] = { total: 0, active: 0, completed: 0 };

      for (const route of routes) {
        const recurrence = route.recurrence as {
          type: "daily" | "weekly" | "monthly" | "one_time";
          daysOfWeek?: string[];
          dayOfWeek?: string;
          dayOfMonth?: number;
          specificDate?: string;
        } | undefined;

        if (!routeRunsOnDate(recurrence, date)) {
          continue;
        }

        countByDay[date]!.total++;

        const existingTrip = tripsByRouteDate.get(`${route._id}:${date}`);
        if (existingTrip) {
          if (existingTrip.status === "in_progress") {
            countByDay[date]!.active++;
          } else if (existingTrip.status === "completed") {
            countByDay[date]!.completed++;
          }
        }
      }
    }

    return countByDay;
  },
});

/**
 * Get active trips and upcoming trips within N hours (for dashboard)
 */
export const getActiveAndUpcomingTrips = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    hoursAhead: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hours = args.hoursAhead || 6;
    const now = new Date();
    const today = now.toISOString().split("T")[0]!;

    // Current time in HH:mm format
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    // Time N hours from now
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
    const futureTimeStr = `${String(futureTime.getHours()).padStart(2, "0")}:${String(futureTime.getMinutes()).padStart(2, "0")}`;

    // Get active trips (in_progress)
    const activeTrips = await ctx.db
      .query("trips")
      .withIndex("by_date", (q) => q.eq("scheduledDate", today))
      .filter((q) => q.eq(q.field("status"), "in_progress"))
      .collect();

    // Get active routes for today
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get existing trips for today
    const todayTrips = await ctx.db
      .query("trips")
      .withIndex("by_date", (q) => q.eq("scheduledDate", today))
      .collect();

    const tripsByRoute = new Map<string, typeof todayTrips[0]>();
    for (const trip of todayTrips) {
      tripsByRoute.set(trip.routeId.toString(), trip);
    }

    // Build results
    const results: {
      type: "active" | "upcoming";
      date: string;
      scheduledTime: string;
      routeId: Id<"routes">;
      routeName: string;
      routeType: "pickup" | "dropoff";
      vehiclePlate: string;
      driverName: string;
      status: string;
      tripId?: Id<"trips">;
      totalStudents: number;
    }[] = [];

    // Add active trips
    for (const trip of activeTrips) {
      const route = await ctx.db.get(trip.routeId);
      if (!route || route.institutionId !== args.institutionId) continue;

      const vehicle = await ctx.db.get(route.vehicleId);
      const driver = await ctx.db.get(route.driverId);
      const driverUser = driver?.userId ? await ctx.db.get(driver.userId) : null;

      const studentRoutes = await ctx.db
        .query("studentRoutes")
        .withIndex("by_route", (q) => q.eq("routeId", route._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      results.push({
        type: "active",
        date: today,
        scheduledTime: route.scheduledStartTime,
        routeId: route._id,
        routeName: route.name,
        routeType: route.type,
        vehiclePlate: vehicle?.licensePlate || "Sin placa",
        driverName: driverUser?.name || "Sin conductor",
        status: "in_progress",
        tripId: trip._id,
        totalStudents: studentRoutes.length,
      });
    }

    // Add upcoming projected trips (within hours window)
    for (const route of routes) {
      const recurrence = route.recurrence as {
        type: "daily" | "weekly" | "monthly" | "one_time";
        daysOfWeek?: string[];
        dayOfWeek?: string;
        dayOfMonth?: number;
        specificDate?: string;
      } | undefined;

      if (!routeRunsOnDate(recurrence, today)) {
        continue;
      }

      const existingTrip = tripsByRoute.get(route._id.toString());

      // Skip if already in progress or completed
      if (existingTrip && (existingTrip.status === "in_progress" || existingTrip.status === "completed")) {
        continue;
      }

      // Check if within time window
      const routeTime = route.scheduledStartTime;
      if (routeTime < currentTime || routeTime > futureTimeStr) {
        continue;
      }

      const vehicle = await ctx.db.get(route.vehicleId);
      const driver = await ctx.db.get(route.driverId);
      const driverUser = driver?.userId ? await ctx.db.get(driver.userId) : null;

      const studentRoutes = await ctx.db
        .query("studentRoutes")
        .withIndex("by_route", (q) => q.eq("routeId", route._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      results.push({
        type: "upcoming",
        date: today,
        scheduledTime: route.scheduledStartTime,
        routeId: route._id,
        routeName: route.name,
        routeType: route.type,
        vehiclePlate: vehicle?.licensePlate || "Sin placa",
        driverName: driverUser?.name || "Sin conductor",
        status: existingTrip?.status || "projected",
        tripId: existingTrip?._id,
        totalStudents: studentRoutes.length,
      });
    }

    // Sort by type (active first) then by time
    results.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "active" ? -1 : 1;
      }
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    return results;
  },
});

// ============================================
// Parent App Queries
// ============================================

/**
 * Get projected trips for ALL children of a parent (for calendar view)
 * Returns trips grouped by date for a date range
 */
export const getAllChildrenProjectedTrips = query({
  args: {
    userId: v.id("users"),
    startDate: v.string(),
    endDate: v.string(),
  },
  handler: async (ctx, args) => {
    // Get current user to find their email
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return [];
    }

    // Get students where user is a guardian (either by email or guardianUserIds)
    const studentsByEmail = await ctx.db
      .query("students")
      .withIndex("by_parent_email", (q) => q.eq("parentEmail", user.email))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const studentsBySecondaryEmail = await ctx.db
      .query("students")
      .withIndex("by_secondary_parent_email", (q) => q.eq("secondaryParentEmail", user.email))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Combine and dedupe students
    const studentMap = new Map<string, (typeof studentsByEmail)[0]>();
    for (const s of studentsByEmail) {
      studentMap.set(s._id.toString(), s);
    }
    for (const s of studentsBySecondaryEmail) {
      studentMap.set(s._id.toString(), s);
    }
    const students = Array.from(studentMap.values());

    if (students.length === 0) {
      return [];
    }

    // Generate date range (max 28 days for 4 weeks)
    const dates = generateDateRange(args.startDate, args.endDate, 28);

    // Get all student route assignments
    const studentIds = students.map((s) => s._id);
    const allStudentRoutes = await Promise.all(
      studentIds.map((studentId) =>
        ctx.db
          .query("studentRoutes")
          .withIndex("by_student", (q) => q.eq("studentId", studentId))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect()
      )
    );

    // Flatten and create lookup
    const studentRoutesFlat = allStudentRoutes.flat();
    const routeIds = Array.from(new Set(studentRoutesFlat.map((sr) => sr.routeId)));

    // Get all routes - query directly to maintain proper typing
    const allRoutes = await ctx.db.query("routes").collect();
    const routeIdStrings = new Set(routeIds.map((id) => id.toString()));
    const routes = allRoutes.filter((r) => routeIdStrings.has(r._id.toString()));
    const routeMap = new Map(routes.map((r) => [r._id.toString(), r]));

    // Get existing trips in date range
    const existingTrips = await ctx.db
      .query("trips")
      .withIndex("by_date")
      .filter((q) =>
        q.and(
          q.gte(q.field("scheduledDate"), args.startDate),
          q.lte(q.field("scheduledDate"), args.endDate)
        )
      )
      .collect();

    const tripsByRouteDate = new Map<string, (typeof existingTrips)[0]>();
    for (const trip of existingTrips) {
      tripsByRouteDate.set(`${trip.routeId}:${trip.scheduledDate}`, trip);
    }

    // Get all novedades for these students
    const allNovedades = await Promise.all(
      studentIds.map((studentId) =>
        ctx.db
          .query("novedades")
          .withIndex("by_student", (q) => q.eq("studentId", studentId))
          .collect()
      )
    );
    const novedadesFlat = allNovedades.flat();

    // Build projected trips
    const projectedTrips: {
      date: string;
      scheduledTime: string;
      studentId: Id<"students">;
      studentName: string;
      studentPhoto?: string;
      routeId: Id<"routes">;
      routeName: string;
      routeType: "pickup" | "dropoff";
      stopName: string;
      status: "projected" | "scheduled" | "in_progress" | "completed";
      tripId?: Id<"trips">;
      hasNovedad: boolean;
      novedadStatus?: "pending" | "approved" | "rejected";
    }[] = [];

    // Process each student
    for (const student of students) {
      const studentRoutes = studentRoutesFlat.filter(
        (sr) => sr.studentId.toString() === student._id.toString()
      );

      for (const sr of studentRoutes) {
        const route = routeMap.get(sr.routeId.toString());
        if (!route || !route.isActive) continue;

        // Get stop info
        const stop = sr.stopId ? await ctx.db.get(sr.stopId) : null;

        for (const date of dates) {
          // Check if route runs on this date
          const recurrence = route.recurrence as {
            type: "daily" | "weekly" | "monthly" | "one_time";
            daysOfWeek?: string[];
            dayOfWeek?: string;
            dayOfMonth?: number;
            specificDate?: string;
          } | undefined;

          if (!routeRunsOnDate(recurrence, date)) {
            continue;
          }

          // Check if student has excludeDays for this day
          const dayName = getDayName(new Date(date + "T12:00:00"));
          if (sr.excludeDays && Array.isArray(sr.excludeDays)) {
            if (sr.excludeDays.includes(dayName)) {
              continue;
            }
          }

          // Check for existing trip
          const existingTrip = tripsByRouteDate.get(`${route._id}:${date}`);

          // Check for novedades
          const studentNovedades = novedadesFlat.filter(
            (n) => n.studentId.toString() === student._id.toString()
          );
          let hasNovedad = false;
          let novedadStatus: "pending" | "approved" | "rejected" | undefined;

          for (const nov of studentNovedades) {
            if (novedadAppliesToDate(nov, date, route.type)) {
              hasNovedad = true;
              novedadStatus = nov.status as "pending" | "approved" | "rejected";
              break;
            }
          }

          projectedTrips.push({
            date,
            scheduledTime: stop?.scheduledTime || route.scheduledStartTime,
            studentId: student._id,
            studentName: `${student.firstName} ${student.lastName}`,
            studentPhoto: student.photoStorageId
              ? await ctx.storage.getUrl(student.photoStorageId) || undefined
              : undefined,
            routeId: route._id,
            routeName: route.name,
            routeType: route.type,
            stopName: stop?.name || "Parada no asignada",
            status: (existingTrip?.status as "projected" | "scheduled" | "in_progress" | "completed") || "projected",
            tripId: existingTrip?._id,
            hasNovedad,
            novedadStatus,
          });
        }
      }
    }

    // Sort by date, then by time
    projectedTrips.sort((a, b) => {
      if (a.date !== b.date) {
        return a.date.localeCompare(b.date);
      }
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    return projectedTrips;
  },
});

/**
 * Get active and upcoming trips for all children of a parent (for dashboard)
 */
export const getMyChildrenUpcomingTrips = query({
  args: {
    userId: v.id("users"),
    hoursAhead: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const hours = args.hoursAhead || 12;
    const now = new Date();
    const today = now.toISOString().split("T")[0]!;

    // Current time in HH:mm format
    const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

    // Time N hours from now
    const futureTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
    const futureTimeStr = `${String(futureTime.getHours()).padStart(2, "0")}:${String(futureTime.getMinutes()).padStart(2, "0")}`;

    // Get current user to find their email
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return [];
    }

    // Get students where user is a guardian (either by email or guardianUserIds)
    const studentsByEmail = await ctx.db
      .query("students")
      .withIndex("by_parent_email", (q) => q.eq("parentEmail", user.email))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const studentsBySecondaryEmail = await ctx.db
      .query("students")
      .withIndex("by_secondary_parent_email", (q) => q.eq("secondaryParentEmail", user.email))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Combine and dedupe students
    const studentMap = new Map<string, (typeof studentsByEmail)[0]>();
    for (const s of studentsByEmail) {
      studentMap.set(s._id.toString(), s);
    }
    for (const s of studentsBySecondaryEmail) {
      studentMap.set(s._id.toString(), s);
    }
    const students = Array.from(studentMap.values());

    if (students.length === 0) {
      return [];
    }

    // Get student route assignments
    const studentIds = students.map((s) => s._id);
    const allStudentRoutes = await Promise.all(
      studentIds.map((studentId) =>
        ctx.db
          .query("studentRoutes")
          .withIndex("by_student", (q) => q.eq("studentId", studentId))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect()
      )
    );
    const studentRoutesFlat = allStudentRoutes.flat();

    // Get unique route IDs and query routes directly for proper typing
    const routeIds = Array.from(new Set(studentRoutesFlat.map((sr) => sr.routeId)));
    const allRoutes = await ctx.db.query("routes").collect();
    const routeIdStrings = new Set(routeIds.map((id) => id.toString()));
    const routes = allRoutes.filter((r) => routeIdStrings.has(r._id.toString()));
    const routeMap = new Map(routes.map((r) => [r._id.toString(), r]));

    // Get existing trips for today
    const todayTrips = await ctx.db
      .query("trips")
      .withIndex("by_date", (q) => q.eq("scheduledDate", today))
      .collect();

    const tripsByRoute = new Map<string, (typeof todayTrips)[0]>();
    for (const trip of todayTrips) {
      tripsByRoute.set(trip.routeId.toString(), trip);
    }

    // Get novedades for students
    const allNovedades = await Promise.all(
      studentIds.map((studentId) =>
        ctx.db
          .query("novedades")
          .withIndex("by_student", (q) => q.eq("studentId", studentId))
          .collect()
      )
    );
    const novedadesFlat = allNovedades.flat();

    // Build results
    const results: {
      type: "active" | "upcoming";
      studentId: Id<"students">;
      studentName: string;
      studentPhoto?: string;
      date: string;
      scheduledTime: string;
      routeId: Id<"routes">;
      routeName: string;
      routeType: "pickup" | "dropoff";
      stopName: string;
      driverName: string;
      vehiclePlate: string;
      status: string;
      hasNovedad: boolean;
    }[] = [];

    for (const student of students) {
      const studentRoutes = studentRoutesFlat.filter(
        (sr) => sr.studentId.toString() === student._id.toString()
      );

      for (const sr of studentRoutes) {
        const route = routeMap.get(sr.routeId.toString());
        if (!route || !route.isActive) continue;

        // Check if route runs today
        const recurrence = route.recurrence as {
          type: "daily" | "weekly" | "monthly" | "one_time";
          daysOfWeek?: string[];
          dayOfWeek?: string;
          dayOfMonth?: number;
          specificDate?: string;
        } | undefined;

        if (!routeRunsOnDate(recurrence, today)) {
          continue;
        }

        // Check excludeDays
        const dayName = getDayName(new Date(today + "T12:00:00"));
        if (sr.excludeDays && Array.isArray(sr.excludeDays)) {
          if (sr.excludeDays.includes(dayName)) {
            continue;
          }
        }

        const existingTrip = tripsByRoute.get(route._id.toString());
        const stop = sr.stopId ? await ctx.db.get(sr.stopId) : null;
        const stopTime = stop?.scheduledTime || route.scheduledStartTime;

        // Determine if active or upcoming
        let type: "active" | "upcoming";
        if (existingTrip?.status === "in_progress") {
          type = "active";
        } else if (existingTrip?.status === "completed") {
          continue; // Skip completed trips
        } else if (stopTime < currentTime) {
          continue; // Skip past trips
        } else if (stopTime > futureTimeStr) {
          continue; // Skip trips too far in the future
        } else {
          type = "upcoming";
        }

        // Get vehicle and driver info
        const vehicle = await ctx.db.get(route.vehicleId);
        const driver = await ctx.db.get(route.driverId);
        const driverUser = driver?.userId ? await ctx.db.get(driver.userId) : null;

        // Check for novedades
        const studentNovedades = novedadesFlat.filter(
          (n) => n.studentId.toString() === student._id.toString()
        );
        let hasNovedad = false;
        for (const nov of studentNovedades) {
          if (novedadAppliesToDate(nov, today, route.type)) {
            hasNovedad = true;
            break;
          }
        }

        results.push({
          type,
          studentId: student._id,
          studentName: `${student.firstName} ${student.lastName}`,
          studentPhoto: student.photoStorageId
            ? await ctx.storage.getUrl(student.photoStorageId) || undefined
            : undefined,
          date: today,
          scheduledTime: stopTime,
          routeId: route._id,
          routeName: route.name,
          routeType: route.type,
          stopName: stop?.name || "Parada no asignada",
          driverName: driverUser?.name || "Sin conductor",
          vehiclePlate: vehicle?.licensePlate || "Sin placa",
          status: existingTrip?.status || "projected",
          hasNovedad,
        });
      }
    }

    // Sort by type (active first), then by time
    results.sort((a, b) => {
      if (a.type !== b.type) {
        return a.type === "active" ? -1 : 1;
      }
      return a.scheduledTime.localeCompare(b.scheduledTime);
    });

    return results;
  },
});
