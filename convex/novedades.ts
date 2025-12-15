/**
 * Novedades (Schedule Exceptions) API
 *
 * Handles parent-initiated schedule changes:
 * - Absences (no viaja hoy)
 * - Parent pickup (padre recoge directamente)
 * - Stop changes (cambio de parada temporal)
 * - Early pickup / Late arrival
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { verifyUser, verifyInstitutionAccess, verifyRole } from "./lib/simpleAuth";

// ============================================
// CONSTANTS
// ============================================

// Minimum hours before trip for stop changes (48 hours)
const STOP_CHANGE_MIN_HOURS = 48;

// Get type labels in Spanish
function getTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    absence: "Ausencia",
    parent_pickup: "Recogida por padre",
    stop_change: "Cambio de parada",
    early_pickup: "Salida temprana",
    late_arrival: "Llegada tarde",
  };
  return labels[type] || type;
}

function getRouteTypeLabel(routeType: string): string {
  const labels: Record<string, string> = {
    pickup: "Recogida",
    dropoff: "Entrega",
    both: "Ambos servicios",
  };
  return labels[routeType] || routeType;
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new novedad (by parent)
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
    type: v.union(
      v.literal("absence"),
      v.literal("parent_pickup"),
      v.literal("stop_change"),
      v.literal("early_pickup"),
      v.literal("late_arrival")
    ),
    affectedRouteType: v.union(
      v.literal("pickup"),
      v.literal("dropoff"),
      v.literal("both")
    ),
    date: v.string(), // YYYY-MM-DD
    newStopId: v.optional(v.id("routeStops")),
    time: v.optional(v.string()), // HH:mm
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await verifyUser(ctx, args.userId);

    // Verify parent role
    if (user.role !== "parent" && user.role !== "admin" && user.role !== "super_admin") {
      throw new Error("Solo los padres pueden crear novedades");
    }

    // Get student and verify relationship
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    // Verify parent has access to this student (by email match or admin)
    if (user.role === "parent") {
      if (user.email.toLowerCase() !== student.parentEmail.toLowerCase()) {
        throw new Error("No tienes permiso para crear novedades para este estudiante");
      }
    } else {
      // Admin - verify institution access
      await verifyInstitutionAccess(ctx, args.userId, student.institutionId);
    }

    // Validate date is not in the past
    const today = new Date().toISOString().split("T")[0]!;
    if (args.date < today) {
      throw new Error("No se pueden crear novedades para fechas pasadas");
    }

    // Validate stop change has minimum advance time
    if (args.type === "stop_change") {
      const requestDate = new Date(args.date);
      const now = new Date();
      const hoursUntil = (requestDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntil < STOP_CHANGE_MIN_HOURS) {
        throw new Error(`Los cambios de parada requieren mínimo ${STOP_CHANGE_MIN_HOURS} horas de anticipación`);
      }

      if (!args.newStopId) {
        throw new Error("Debe especificar la nueva parada para cambios de parada");
      }

      // Verify new stop exists and is valid
      const newStop = await ctx.db.get(args.newStopId);
      if (!newStop || !newStop.isActive) {
        throw new Error("La parada seleccionada no es válida");
      }
    }

    // Check for duplicate novedades on same date
    const existingNovedad = await ctx.db
      .query("novedades")
      .withIndex("by_student_date", (q) =>
        q.eq("studentId", args.studentId).eq("date", args.date)
      )
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), "cancelled"),
          q.neq(q.field("status"), "expired"),
          q.or(
            q.eq(q.field("affectedRouteType"), args.affectedRouteType),
            q.eq(q.field("affectedRouteType"), "both"),
            q.eq(args.affectedRouteType, "both")
          )
        )
      )
      .first();

    if (existingNovedad) {
      throw new Error("Ya existe una novedad para este estudiante en esta fecha y tipo de ruta");
    }

    // Create the novedad
    const now = Date.now();
    const novedadId = await ctx.db.insert("novedades", {
      institutionId: student.institutionId,
      studentId: args.studentId,
      createdBy: args.userId,
      type: args.type,
      affectedRouteType: args.affectedRouteType,
      date: args.date,
      newStopId: args.newStopId,
      time: args.time,
      reason: args.reason,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Find assigned crew members and notify them
    const studentRoutes = await ctx.db
      .query("studentRoutes")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    const notifiedUsers = new Set<string>();

    for (const sr of studentRoutes) {
      const route = await ctx.db.get(sr.routeId);
      if (!route || !route.isActive) continue;

      // Check if this route type is affected
      if (
        args.affectedRouteType !== "both" &&
        route.type !== args.affectedRouteType
      ) {
        continue;
      }

      // Notify driver
      const driver = await ctx.db.get(route.driverId);
      if (driver && !notifiedUsers.has(driver.userId)) {
        await ctx.db.insert("notifications", {
          userId: driver.userId,
          title: `Nueva novedad: ${getTypeLabel(args.type)}`,
          message: `${student.firstName} ${student.lastName} - ${args.reason}. Fecha: ${args.date}`,
          type: "info",
          category: "novedad",
          relatedEntityType: "novedad",
          relatedEntityId: novedadId,
          read: false,
          createdAt: now,
        });
        notifiedUsers.add(driver.userId);
      }

      // Notify monitor if exists
      if (route.monitorId) {
        const monitor = await ctx.db.get(route.monitorId);
        if (monitor && !notifiedUsers.has(monitor.userId)) {
          await ctx.db.insert("notifications", {
            userId: monitor.userId,
            title: `Nueva novedad: ${getTypeLabel(args.type)}`,
            message: `${student.firstName} ${student.lastName} - ${args.reason}. Fecha: ${args.date}`,
            type: "info",
            category: "novedad",
            relatedEntityType: "novedad",
            relatedEntityId: novedadId,
            read: false,
            createdAt: now,
          });
          notifiedUsers.add(monitor.userId);
        }
      }
    }

    return { success: true, novedadId };
  },
});

/**
 * Cancel a novedad (by parent)
 */
export const cancel = mutation({
  args: {
    userId: v.id("users"),
    novedadId: v.id("novedades"),
  },
  handler: async (ctx, args) => {
    const user = await verifyUser(ctx, args.userId);

    const novedad = await ctx.db.get(args.novedadId);
    if (!novedad) {
      throw new Error("Novedad no encontrada");
    }

    // Only creator or admin can cancel
    if (novedad.createdBy !== args.userId) {
      if (user.role !== "admin" && user.role !== "super_admin") {
        throw new Error("Solo el creador puede cancelar esta novedad");
      }
      await verifyInstitutionAccess(ctx, args.userId, novedad.institutionId);
    }

    // Can only cancel pending or acknowledged novedades
    if (novedad.status !== "pending" && novedad.status !== "acknowledged") {
      throw new Error("Solo se pueden cancelar novedades pendientes o reconocidas");
    }

    await ctx.db.patch(args.novedadId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Approve or reject a novedad (by admin/coordinator)
 */
export const review = mutation({
  args: {
    userId: v.id("users"),
    novedadId: v.id("novedades"),
    action: v.union(v.literal("approve"), v.literal("reject")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const novedad = await ctx.db.get(args.novedadId);
    if (!novedad) {
      throw new Error("Novedad no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, novedad.institutionId);

    // Can only review pending novedades
    if (novedad.status !== "pending") {
      throw new Error("Esta novedad ya fue procesada");
    }

    const now = Date.now();
    const newStatus = args.action === "approve" ? "approved" : "rejected";

    await ctx.db.patch(args.novedadId, {
      status: newStatus,
      approvedBy: args.userId,
      approvedAt: now,
      approvalNotes: args.notes,
      updatedAt: now,
    });

    // Notify parent about the decision
    const student = await ctx.db.get(novedad.studentId);
    if (student) {
      const parentUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", student.parentEmail.toLowerCase()))
        .first();

      if (parentUser) {
        await ctx.db.insert("notifications", {
          userId: parentUser._id,
          title: args.action === "approve" ? "Novedad aprobada" : "Novedad rechazada",
          message: args.action === "approve"
            ? `La novedad de ${student.firstName} para el ${novedad.date} ha sido aprobada.`
            : `La novedad de ${student.firstName} para el ${novedad.date} ha sido rechazada. ${args.notes || ""}`,
          type: args.action === "approve" ? "success" : "warning",
          category: "novedad",
          relatedEntityType: "novedad",
          relatedEntityId: args.novedadId,
          read: false,
          createdAt: now,
        });
      }
    }

    // If approved, notify crew members
    if (args.action === "approve") {
      const studentRoutes = await ctx.db
        .query("studentRoutes")
        .withIndex("by_student", (q) => q.eq("studentId", novedad.studentId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      const notifiedUsers = new Set<string>();

      for (const sr of studentRoutes) {
        const route = await ctx.db.get(sr.routeId);
        if (!route || !route.isActive) continue;

        // Check if this route type is affected
        if (
          novedad.affectedRouteType !== "both" &&
          route.type !== novedad.affectedRouteType
        ) {
          continue;
        }

        // Notify driver
        const driver = await ctx.db.get(route.driverId);
        if (driver && !notifiedUsers.has(driver.userId)) {
          await ctx.db.insert("notifications", {
            userId: driver.userId,
            title: `Novedad aprobada: ${getTypeLabel(novedad.type)}`,
            message: `${student?.firstName} ${student?.lastName} - ${novedad.reason}. Fecha: ${novedad.date}`,
            type: "info",
            category: "novedad",
            relatedEntityType: "novedad",
            relatedEntityId: args.novedadId,
            read: false,
            createdAt: now,
          });
          notifiedUsers.add(driver.userId);
        }

        // Notify monitor if exists
        if (route.monitorId) {
          const monitor = await ctx.db.get(route.monitorId);
          if (monitor && !notifiedUsers.has(monitor.userId)) {
            await ctx.db.insert("notifications", {
              userId: monitor.userId,
              title: `Novedad aprobada: ${getTypeLabel(novedad.type)}`,
              message: `${student?.firstName} ${student?.lastName} - ${novedad.reason}. Fecha: ${novedad.date}`,
              type: "info",
              category: "novedad",
              relatedEntityType: "novedad",
              relatedEntityId: args.novedadId,
              read: false,
              createdAt: now,
            });
            notifiedUsers.add(monitor.userId);
          }
        }
      }
    }

    return { success: true };
  },
});

/**
 * Acknowledge a novedad (by crew) - only for approved novedades
 */
export const acknowledge = mutation({
  args: {
    userId: v.id("users"),
    novedadId: v.id("novedades"),
  },
  handler: async (ctx, args) => {
    const user = await verifyUser(ctx, args.userId);

    // Only crew members or admins can acknowledge
    if (!["driver", "monitor", "admin", "super_admin"].includes(user.role)) {
      throw new Error("Solo el personal de transporte puede acusar recibo de novedades");
    }

    const novedad = await ctx.db.get(args.novedadId);
    if (!novedad) {
      throw new Error("Novedad no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, novedad.institutionId);

    // Can only acknowledge approved novedades
    if (novedad.status !== "approved") {
      throw new Error("Solo se pueden acusar recibo de novedades aprobadas");
    }

    const now = Date.now();
    await ctx.db.patch(args.novedadId, {
      status: "acknowledged",
      acknowledgedBy: args.userId,
      acknowledgedAt: now,
      updatedAt: now,
    });

    // Notify parent that novedad was acknowledged
    const student = await ctx.db.get(novedad.studentId);
    if (student) {
      const parentUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", student.parentEmail.toLowerCase()))
        .first();

      if (parentUser) {
        await ctx.db.insert("notifications", {
          userId: parentUser._id,
          title: "Novedad confirmada por crew",
          message: `La novedad de ${student.firstName} para el ${novedad.date} ha sido confirmada por el equipo de transporte.`,
          type: "success",
          category: "novedad",
          relatedEntityType: "novedad",
          relatedEntityId: args.novedadId,
          read: false,
          createdAt: now,
        });
      }
    }

    return { success: true };
  },
});

/**
 * Apply a novedad to a trip (internal - called when trip starts or is created)
 */
export const applyToTrip = mutation({
  args: {
    novedadId: v.id("novedades"),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const novedad = await ctx.db.get(args.novedadId);
    if (!novedad) {
      throw new Error("Novedad no encontrada");
    }

    if (novedad.status === "applied" || novedad.status === "cancelled" || novedad.status === "expired") {
      return { success: false, reason: "Novedad ya procesada" };
    }

    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    // Find the tripStudent record for this student
    const tripStudent = await ctx.db
      .query("tripStudents")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("studentId"), novedad.studentId))
      .first();

    if (!tripStudent) {
      // Student not in this trip
      return { success: false, reason: "Estudiante no programado para este viaje" };
    }

    const now = Date.now();

    // Update tripStudent based on novedad type
    let newStatus: "scheduled" | "absent" | "parent_pickup" | "stop_changed" = "scheduled";
    let newStopId = tripStudent.stopId;
    let originalStopId = tripStudent.originalStopId;

    switch (novedad.type) {
      case "absence":
        newStatus = "absent";
        break;
      case "parent_pickup":
        newStatus = "parent_pickup";
        break;
      case "stop_change":
        newStatus = "stop_changed";
        originalStopId = tripStudent.stopId;
        newStopId = novedad.newStopId || tripStudent.stopId;
        break;
      case "early_pickup":
      case "late_arrival":
        // These don't change the status directly, but we mark them
        // The crew will handle the timing
        break;
    }

    await ctx.db.patch(tripStudent._id, {
      status: newStatus,
      stopId: newStopId,
      originalStopId,
      novedadId: args.novedadId,
      updatedAt: now,
    });

    // Mark novedad as applied
    await ctx.db.patch(args.novedadId, {
      status: "applied",
      tripId: args.tripId,
      updatedAt: now,
    });

    return { success: true };
  },
});

// ============================================
// QUERIES
// ============================================

/**
 * Get novedades for a parent's students
 */
export const getMyNovedades = query({
  args: {
    userId: v.id("users"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("acknowledged"),
      v.literal("applied"),
      v.literal("cancelled"),
      v.literal("expired")
    )),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return [];
    }

    // Find all students for this parent
    const students = await ctx.db
      .query("students")
      .filter((q) => q.eq(q.field("parentEmail"), user.email.toLowerCase()))
      .collect();

    if (students.length === 0) {
      return [];
    }

    const studentIds = students.map((s) => s._id);
    const limit = args.limit || 50;

    // Get novedades for all students
    const allNovedades = [];

    for (const studentId of studentIds) {
      let query = ctx.db
        .query("novedades")
        .withIndex("by_student", (q) => q.eq("studentId", studentId));

      if (args.status) {
        query = query.filter((q) => q.eq(q.field("status"), args.status));
      }

      const novedades = await query.collect();
      allNovedades.push(...novedades);
    }

    // Sort by date descending and apply limit
    allNovedades.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.createdAt - a.createdAt;
    });

    // Enrich with student info
    const enriched = await Promise.all(
      allNovedades.slice(0, limit).map(async (novedad) => {
        const student = await ctx.db.get(novedad.studentId);
        return {
          ...novedad,
          studentName: student ? `${student.firstName} ${student.lastName}` : "Desconocido",
          typeLabel: getTypeLabel(novedad.type),
          routeTypeLabel: getRouteTypeLabel(novedad.affectedRouteType),
        };
      })
    );

    return enriched;
  },
});

/**
 * Get novedades for a specific date (for crew)
 */
export const getByDate = query({
  args: {
    userId: v.id("users"),
    date: v.string(),
    institutionId: v.optional(v.id("institutions")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return [];
    }

    let institutionId = args.institutionId;

    // If not provided, use user's institution
    if (!institutionId && user.institutionId) {
      institutionId = user.institutionId;
    }

    if (!institutionId) {
      return [];
    }

    const novedades = await ctx.db
      .query("novedades")
      .withIndex("by_institution_date", (q) =>
        q.eq("institutionId", institutionId!).eq("date", args.date)
      )
      .filter((q) =>
        q.and(
          q.neq(q.field("status"), "cancelled"),
          q.neq(q.field("status"), "expired")
        )
      )
      .collect();

    // Enrich with student info
    const enriched = await Promise.all(
      novedades.map(async (novedad) => {
        const student = await ctx.db.get(novedad.studentId);
        const acknowledger = novedad.acknowledgedBy
          ? await ctx.db.get(novedad.acknowledgedBy)
          : null;

        return {
          ...novedad,
          studentName: student ? `${student.firstName} ${student.lastName}` : "Desconocido",
          studentGrade: student?.grade || "",
          typeLabel: getTypeLabel(novedad.type),
          routeTypeLabel: getRouteTypeLabel(novedad.affectedRouteType),
          acknowledgedByName: acknowledger?.name || null,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get novedades for a specific trip (for crew app)
 */
export const getByTrip = query({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      return [];
    }

    const route = await ctx.db.get(trip.routeId);
    if (!route) {
      return [];
    }

    // Get all students scheduled for this trip
    const tripStudents = await ctx.db
      .query("tripStudents")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Get novedades for students with non-scheduled status
    const novedades = [];

    for (const ts of tripStudents) {
      if (ts.status !== "scheduled" && ts.novedadId) {
        const novedad = await ctx.db.get(ts.novedadId);
        if (novedad) {
          const student = await ctx.db.get(ts.studentId);
          novedades.push({
            ...novedad,
            tripStudentStatus: ts.status,
            studentName: student ? `${student.firstName} ${student.lastName}` : "Desconocido",
            typeLabel: getTypeLabel(novedad.type),
          });
        }
      }
    }

    return novedades;
  },
});

/**
 * Get pending novedades count (for badges/indicators)
 */
export const getPendingCount = query({
  args: {
    userId: v.id("users"),
    date: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.institutionId) {
      return 0;
    }

    const targetDate = args.date || new Date().toISOString().split("T")[0]!;

    const novedades = await ctx.db
      .query("novedades")
      .withIndex("by_institution_date", (q) =>
        q.eq("institutionId", user.institutionId!).eq("date", targetDate)
      )
      .filter((q) => q.eq(q.field("status"), "pending"))
      .collect();

    return novedades.length;
  },
});

/**
 * Get novedad by ID
 */
export const getById = query({
  args: {
    userId: v.id("users"),
    novedadId: v.id("novedades"),
  },
  handler: async (ctx, args) => {
    const novedad = await ctx.db.get(args.novedadId);
    if (!novedad) {
      return null;
    }

    const student = await ctx.db.get(novedad.studentId);
    const creator = await ctx.db.get(novedad.createdBy);
    const acknowledger = novedad.acknowledgedBy
      ? await ctx.db.get(novedad.acknowledgedBy)
      : null;

    let newStopInfo = null;
    if (novedad.newStopId) {
      const stop = await ctx.db.get(novedad.newStopId);
      if (stop) {
        newStopInfo = {
          id: stop._id,
          name: stop.name,
          address: stop.address,
        };
      }
    }

    return {
      ...novedad,
      studentName: student ? `${student.firstName} ${student.lastName}` : "Desconocido",
      studentGrade: student?.grade || "",
      createdByName: creator?.name || "Desconocido",
      acknowledgedByName: acknowledger?.name || null,
      typeLabel: getTypeLabel(novedad.type),
      routeTypeLabel: getRouteTypeLabel(novedad.affectedRouteType),
      newStopInfo,
    };
  },
});

/**
 * Get all novedades for admin (with filters)
 */
export const getForAdmin = query({
  args: {
    userId: v.id("users"),
    institutionId: v.optional(v.id("institutions")),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected"),
      v.literal("acknowledged"),
      v.literal("applied"),
      v.literal("cancelled"),
      v.literal("expired")
    )),
    fromDate: v.optional(v.string()),
    toDate: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return [];
    }

    let institutionId = args.institutionId;
    if (!institutionId && user.institutionId) {
      institutionId = user.institutionId;
    }

    if (!institutionId) {
      return [];
    }

    let novedades = await ctx.db
      .query("novedades")
      .withIndex("by_institution", (q) => q.eq("institutionId", institutionId!))
      .order("desc")
      .collect();

    // Apply filters
    if (args.status) {
      novedades = novedades.filter((n) => n.status === args.status);
    }

    if (args.fromDate) {
      novedades = novedades.filter((n) => n.date >= args.fromDate!);
    }

    if (args.toDate) {
      novedades = novedades.filter((n) => n.date <= args.toDate!);
    }

    // Sort by date descending
    novedades.sort((a, b) => {
      if (a.date !== b.date) return b.date.localeCompare(a.date);
      return b.createdAt - a.createdAt;
    });

    const limit = args.limit || 100;

    // Enrich with student and user info
    const enriched = await Promise.all(
      novedades.slice(0, limit).map(async (novedad) => {
        const student = await ctx.db.get(novedad.studentId);
        const creator = await ctx.db.get(novedad.createdBy);
        const approver = novedad.approvedBy
          ? await ctx.db.get(novedad.approvedBy)
          : null;
        const acknowledger = novedad.acknowledgedBy
          ? await ctx.db.get(novedad.acknowledgedBy)
          : null;

        return {
          ...novedad,
          studentName: student ? `${student.firstName} ${student.lastName}` : "Desconocido",
          studentGrade: student?.grade || "",
          createdByName: creator?.name || "Desconocido",
          approvedByName: approver?.name || null,
          acknowledgedByName: acknowledger?.name || null,
          typeLabel: getTypeLabel(novedad.type),
          routeTypeLabel: getRouteTypeLabel(novedad.affectedRouteType),
        };
      })
    );

    return enriched;
  },
});

/**
 * Get pending novedades for admin review
 */
export const getPendingForAdmin = query({
  args: {
    userId: v.id("users"),
    institutionId: v.optional(v.id("institutions")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return [];
    }

    let institutionId = args.institutionId;
    if (!institutionId && user.institutionId) {
      institutionId = user.institutionId;
    }

    if (!institutionId) {
      return [];
    }

    const novedades = await ctx.db
      .query("novedades")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) => q.eq(q.field("institutionId"), institutionId!))
      .collect();

    // Sort by date ascending (oldest first for review)
    novedades.sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.createdAt - b.createdAt;
    });

    // Enrich with student and user info
    const enriched = await Promise.all(
      novedades.map(async (novedad) => {
        const student = await ctx.db.get(novedad.studentId);
        const creator = await ctx.db.get(novedad.createdBy);

        return {
          ...novedad,
          studentName: student ? `${student.firstName} ${student.lastName}` : "Desconocido",
          studentGrade: student?.grade || "",
          createdByName: creator?.name || "Desconocido",
          typeLabel: getTypeLabel(novedad.type),
          routeTypeLabel: getRouteTypeLabel(novedad.affectedRouteType),
        };
      })
    );

    return enriched;
  },
});

/**
 * Get pending novedades count for admin
 */
export const getPendingCountForAdmin = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.institutionId) {
      return 0;
    }

    const novedades = await ctx.db
      .query("novedades")
      .withIndex("by_status", (q) => q.eq("status", "pending"))
      .filter((q) => q.eq(q.field("institutionId"), user.institutionId!))
      .collect();

    return novedades.length;
  },
});

/**
 * Get students with novedades for a specific trip (enriched trip students)
 */
export const getTripStudentsWithNovedades = query({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      return [];
    }

    const tripStudents = await ctx.db
      .query("tripStudents")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    const enriched = await Promise.all(
      tripStudents.map(async (ts) => {
        const student = await ctx.db.get(ts.studentId);
        const stop = await ctx.db.get(ts.stopId);
        const originalStop = ts.originalStopId
          ? await ctx.db.get(ts.originalStopId)
          : null;
        const novedad = ts.novedadId ? await ctx.db.get(ts.novedadId) : null;

        return {
          id: ts._id,
          studentId: ts.studentId,
          studentName: student ? `${student.firstName} ${student.lastName}` : "Desconocido",
          studentGrade: student?.grade || "",
          studentQrCode: student?.qrCode || "",
          status: ts.status,
          stopId: ts.stopId,
          stopName: stop?.name || "Desconocido",
          stopOrder: stop?.order || 0,
          originalStopName: originalStop?.name || null,
          hasNovedad: !!ts.novedadId,
          novedadType: novedad?.type || null,
          novedadReason: novedad?.reason || null,
          novedadTime: novedad?.time || null,
        };
      })
    );

    // Sort by stop order, then by status (scheduled first)
    enriched.sort((a, b) => {
      if (a.stopOrder !== b.stopOrder) return a.stopOrder - b.stopOrder;
      if (a.status === "scheduled" && b.status !== "scheduled") return -1;
      if (a.status !== "scheduled" && b.status === "scheduled") return 1;
      return 0;
    });

    return enriched;
  },
});
