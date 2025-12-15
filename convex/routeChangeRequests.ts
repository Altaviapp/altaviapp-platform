/**
 * Route Change Requests API
 *
 * Handles permanent schedule change requests that require admin approval:
 * - Schedule changes (e.g., only Mon-Thu, no Fridays)
 * - Permanent stop changes
 * - Route changes
 * - Service suspensions
 */

import { mutation, query } from "./_generated/server";
import { v } from "convex/values";
import { verifyUser, verifyInstitutionAccess, verifyRole } from "./lib/simpleAuth";

// ============================================
// CONSTANTS
// ============================================

function getRequestTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    schedule_change: "Cambio de horario",
    stop_change: "Cambio de parada permanente",
    route_change: "Cambio de ruta",
    service_suspension: "Suspensión de servicio",
  };
  return labels[type] || type;
}

function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    pending: "Pendiente",
    approved: "Aprobado",
    rejected: "Rechazado",
  };
  return labels[status] || status;
}

function getDayName(dayNumber: number): string {
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  return days[dayNumber] || "";
}

// ============================================
// MUTATIONS
// ============================================

/**
 * Create a new route change request (by parent)
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
    requestType: v.union(
      v.literal("schedule_change"),
      v.literal("stop_change"),
      v.literal("route_change"),
      v.literal("service_suspension")
    ),
    currentRouteId: v.optional(v.id("routes")),
    newRouteId: v.optional(v.id("routes")),
    currentStopId: v.optional(v.id("routeStops")),
    newStopId: v.optional(v.id("routeStops")),
    newSchedule: v.optional(v.object({
      daysOfWeek: v.array(v.number()),
      affectedRouteTypes: v.array(v.union(v.literal("pickup"), v.literal("dropoff"))),
    })),
    effectiveFrom: v.string(), // YYYY-MM-DD
    effectiveUntil: v.optional(v.string()),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await verifyUser(ctx, args.userId);

    // Verify parent role
    if (user.role !== "parent" && user.role !== "admin" && user.role !== "super_admin") {
      throw new Error("Solo los padres pueden crear solicitudes de cambio");
    }

    // Get student and verify relationship
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    // Verify parent has access to this student
    if (user.role === "parent") {
      if (user.email.toLowerCase() !== student.parentEmail.toLowerCase()) {
        throw new Error("No tienes permiso para crear solicitudes para este estudiante");
      }
    } else {
      await verifyInstitutionAccess(ctx, args.userId, student.institutionId);
    }

    // Validate effectiveFrom is not in the past
    const today = new Date().toISOString().split("T")[0]!;
    if (args.effectiveFrom < today) {
      throw new Error("La fecha de inicio no puede ser en el pasado");
    }

    // Validate based on request type
    if (args.requestType === "schedule_change") {
      if (!args.newSchedule || args.newSchedule.daysOfWeek.length === 0) {
        throw new Error("Debe especificar los días del nuevo horario");
      }
      // Validate days are 0-6
      for (const day of args.newSchedule.daysOfWeek) {
        if (day < 0 || day > 6) {
          throw new Error("Día de la semana inválido");
        }
      }
    }

    if (args.requestType === "stop_change") {
      if (!args.newStopId) {
        throw new Error("Debe especificar la nueva parada");
      }
      const newStop = await ctx.db.get(args.newStopId);
      if (!newStop || !newStop.isActive) {
        throw new Error("La parada seleccionada no es válida");
      }
    }

    if (args.requestType === "route_change") {
      if (!args.newRouteId) {
        throw new Error("Debe especificar la nueva ruta");
      }
      const newRoute = await ctx.db.get(args.newRouteId);
      if (!newRoute || !newRoute.isActive) {
        throw new Error("La ruta seleccionada no es válida");
      }
    }

    // Check for existing pending requests
    const existingRequest = await ctx.db
      .query("routeChangeRequests")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) =>
        q.and(
          q.eq(q.field("status"), "pending"),
          q.eq(q.field("requestType"), args.requestType)
        )
      )
      .first();

    if (existingRequest) {
      throw new Error("Ya existe una solicitud pendiente del mismo tipo para este estudiante");
    }

    // Create the request
    const now = Date.now();
    const requestId = await ctx.db.insert("routeChangeRequests", {
      institutionId: student.institutionId,
      studentId: args.studentId,
      createdBy: args.userId,
      requestType: args.requestType,
      currentRouteId: args.currentRouteId,
      newRouteId: args.newRouteId,
      currentStopId: args.currentStopId,
      newStopId: args.newStopId,
      newSchedule: args.newSchedule,
      effectiveFrom: args.effectiveFrom,
      effectiveUntil: args.effectiveUntil,
      reason: args.reason,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Notify admins of the institution
    const admins = await ctx.db
      .query("users")
      .withIndex("by_institution", (q) => q.eq("institutionId", student.institutionId))
      .filter((q) =>
        q.or(
          q.eq(q.field("role"), "admin"),
          q.eq(q.field("role"), "super_admin")
        )
      )
      .collect();

    for (const admin of admins) {
      await ctx.db.insert("notifications", {
        userId: admin._id,
        title: `Nueva solicitud: ${getRequestTypeLabel(args.requestType)}`,
        message: `${student.firstName} ${student.lastName} - ${args.reason}`,
        type: "warning",
        category: "approval_request",
        relatedEntityType: "route_change_request",
        relatedEntityId: requestId,
        read: false,
        createdAt: now,
      });
    }

    return { success: true, requestId };
  },
});

/**
 * Review (approve/reject) a route change request (by admin)
 */
export const review = mutation({
  args: {
    userId: v.id("users"),
    requestId: v.id("routeChangeRequests"),
    action: v.union(v.literal("approve"), v.literal("reject")),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Solicitud no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, request.institutionId);

    if (request.status !== "pending") {
      throw new Error("Esta solicitud ya fue procesada");
    }

    const now = Date.now();
    const newStatus = args.action === "approve" ? "approved" : "rejected";

    // Update request status
    await ctx.db.patch(args.requestId, {
      status: newStatus,
      reviewedBy: args.userId,
      reviewedAt: now,
      reviewNotes: args.notes,
      updatedAt: now,
    });

    // If approved, apply the changes
    if (args.action === "approve") {
      await applyRouteChange(ctx, request);
    }

    // Notify parent
    const student = await ctx.db.get(request.studentId);
    const parentUser = student
      ? await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", student.parentEmail.toLowerCase()))
          .first()
      : null;

    if (parentUser) {
      await ctx.db.insert("notifications", {
        userId: parentUser._id,
        title: args.action === "approve"
          ? "Solicitud aprobada"
          : "Solicitud rechazada",
        message: args.action === "approve"
          ? `Su solicitud de ${getRequestTypeLabel(request.requestType)} ha sido aprobada.`
          : `Su solicitud de ${getRequestTypeLabel(request.requestType)} ha sido rechazada. ${args.notes || ""}`,
        type: args.action === "approve" ? "success" : "warning",
        category: "approval_request",
        relatedEntityType: "route_change_request",
        relatedEntityId: args.requestId,
        read: false,
        createdAt: now,
      });
    }

    return { success: true };
  },
});

/**
 * Cancel a route change request (by parent)
 */
export const cancel = mutation({
  args: {
    userId: v.id("users"),
    requestId: v.id("routeChangeRequests"),
  },
  handler: async (ctx, args) => {
    const user = await verifyUser(ctx, args.userId);

    const request = await ctx.db.get(args.requestId);
    if (!request) {
      throw new Error("Solicitud no encontrada");
    }

    // Only creator or admin can cancel
    if (request.createdBy !== args.userId) {
      if (user.role !== "admin" && user.role !== "super_admin") {
        throw new Error("Solo el creador puede cancelar esta solicitud");
      }
      await verifyInstitutionAccess(ctx, args.userId, request.institutionId);
    }

    if (request.status !== "pending") {
      throw new Error("Solo se pueden cancelar solicitudes pendientes");
    }

    // Delete the request (or mark as cancelled if we want history)
    await ctx.db.delete(args.requestId);

    return { success: true };
  },
});

// ============================================
// INTERNAL HELPERS
// ============================================

/**
 * Apply approved route change to studentRoutes
 */
async function applyRouteChange(
  ctx: any,
  request: any
) {
  const now = Date.now();

  switch (request.requestType) {
    case "stop_change": {
      // Update studentRoutes to use new stop
      const studentRoutes = await ctx.db
        .query("studentRoutes")
        .withIndex("by_student", (q: any) => q.eq("studentId", request.studentId))
        .filter((q: any) => q.eq(q.field("isActive"), true))
        .collect();

      for (const sr of studentRoutes) {
        if (sr.stopId === request.currentStopId) {
          await ctx.db.patch(sr._id, {
            stopId: request.newStopId,
            updatedAt: now,
          });
        }
      }
      break;
    }

    case "route_change": {
      // Deactivate old route assignments
      const oldAssignments = await ctx.db
        .query("studentRoutes")
        .withIndex("by_student", (q: any) => q.eq("studentId", request.studentId))
        .filter((q: any) =>
          q.and(
            q.eq(q.field("isActive"), true),
            q.eq(q.field("routeId"), request.currentRouteId)
          )
        )
        .collect();

      for (const assignment of oldAssignments) {
        await ctx.db.patch(assignment._id, {
          isActive: false,
          updatedAt: now,
        });
      }

      // Create new route assignment
      // Need to find appropriate stop on new route
      if (request.newStopId) {
        await ctx.db.insert("studentRoutes", {
          studentId: request.studentId,
          routeId: request.newRouteId,
          stopId: request.newStopId,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
      }
      break;
    }

    case "service_suspension": {
      // Deactivate all route assignments for the period
      // Note: This is a simplified implementation
      // In a full system, you might want to track suspension periods separately
      const assignments = await ctx.db
        .query("studentRoutes")
        .withIndex("by_student", (q: any) => q.eq("studentId", request.studentId))
        .filter((q: any) => q.eq(q.field("isActive"), true))
        .collect();

      for (const assignment of assignments) {
        await ctx.db.patch(assignment._id, {
          isActive: false,
          updatedAt: now,
        });
      }
      break;
    }

    case "schedule_change": {
      // Schedule changes affect which days the student travels
      // This is typically handled at trip generation time
      // Store the schedule in a way that can be checked when generating trips
      // For now, we'll note that the studentRoutes needs schedule metadata
      // This would require adding a schedule field to studentRoutes
      // TODO: Implement schedule-aware trip generation
      break;
    }
  }
}

// ============================================
// QUERIES
// ============================================

/**
 * Get route change requests for a parent's students
 */
export const getMyRequests = query({
  args: {
    userId: v.id("users"),
    status: v.optional(v.union(
      v.literal("pending"),
      v.literal("approved"),
      v.literal("rejected")
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

    // Get requests for all students
    const allRequests = [];

    for (const studentId of studentIds) {
      let query = ctx.db
        .query("routeChangeRequests")
        .withIndex("by_student", (q) => q.eq("studentId", studentId));

      if (args.status) {
        query = query.filter((q) => q.eq(q.field("status"), args.status));
      }

      const requests = await query.collect();
      allRequests.push(...requests);
    }

    // Sort by createdAt descending
    allRequests.sort((a, b) => b.createdAt - a.createdAt);

    // Enrich with student info
    const enriched = await Promise.all(
      allRequests.slice(0, limit).map(async (request) => {
        const student = await ctx.db.get(request.studentId);
        const reviewer = request.reviewedBy
          ? await ctx.db.get(request.reviewedBy)
          : null;

        return {
          ...request,
          studentName: student ? `${student.firstName} ${student.lastName}` : "Desconocido",
          requestTypeLabel: getRequestTypeLabel(request.requestType),
          statusLabel: getStatusLabel(request.status),
          reviewedByName: reviewer?.name || null,
          scheduleDays: request.newSchedule?.daysOfWeek.map(getDayName).join(", ") || null,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get pending route change requests for admin
 */
export const getPending = query({
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

    const requests = await ctx.db
      .query("routeChangeRequests")
      .withIndex("by_institution_status", (q) =>
        q.eq("institutionId", institutionId!).eq("status", "pending")
      )
      .collect();

    // Enrich with student and route info
    const enriched = await Promise.all(
      requests.map(async (request) => {
        const student = await ctx.db.get(request.studentId);
        const creator = await ctx.db.get(request.createdBy);
        const currentRoute = request.currentRouteId
          ? await ctx.db.get(request.currentRouteId)
          : null;
        const newRoute = request.newRouteId
          ? await ctx.db.get(request.newRouteId)
          : null;
        const currentStop = request.currentStopId
          ? await ctx.db.get(request.currentStopId)
          : null;
        const newStop = request.newStopId
          ? await ctx.db.get(request.newStopId)
          : null;

        return {
          ...request,
          studentName: student ? `${student.firstName} ${student.lastName}` : "Desconocido",
          studentGrade: student?.grade || "",
          createdByName: creator?.name || "Desconocido",
          requestTypeLabel: getRequestTypeLabel(request.requestType),
          statusLabel: getStatusLabel(request.status),
          currentRouteName: currentRoute?.name || null,
          newRouteName: newRoute?.name || null,
          currentStopName: currentStop?.name || null,
          newStopName: newStop?.name || null,
          scheduleDays: request.newSchedule?.daysOfWeek.map(getDayName).join(", ") || null,
        };
      })
    );

    // Sort by createdAt ascending (oldest first)
    enriched.sort((a, b) => a.createdAt - b.createdAt);

    return enriched;
  },
});

/**
 * Get pending requests count (for badges)
 */
export const getPendingCount = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user || !user.institutionId) {
      return 0;
    }

    const requests = await ctx.db
      .query("routeChangeRequests")
      .withIndex("by_institution_status", (q) =>
        q.eq("institutionId", user.institutionId!).eq("status", "pending")
      )
      .collect();

    return requests.length;
  },
});

/**
 * Get request by ID
 */
export const getById = query({
  args: {
    userId: v.id("users"),
    requestId: v.id("routeChangeRequests"),
  },
  handler: async (ctx, args) => {
    const request = await ctx.db.get(args.requestId);
    if (!request) {
      return null;
    }

    const student = await ctx.db.get(request.studentId);
    const creator = await ctx.db.get(request.createdBy);
    const reviewer = request.reviewedBy
      ? await ctx.db.get(request.reviewedBy)
      : null;
    const currentRoute = request.currentRouteId
      ? await ctx.db.get(request.currentRouteId)
      : null;
    const newRoute = request.newRouteId
      ? await ctx.db.get(request.newRouteId)
      : null;
    const currentStop = request.currentStopId
      ? await ctx.db.get(request.currentStopId)
      : null;
    const newStop = request.newStopId
      ? await ctx.db.get(request.newStopId)
      : null;

    return {
      ...request,
      studentName: student ? `${student.firstName} ${student.lastName}` : "Desconocido",
      studentGrade: student?.grade || "",
      createdByName: creator?.name || "Desconocido",
      reviewedByName: reviewer?.name || null,
      requestTypeLabel: getRequestTypeLabel(request.requestType),
      statusLabel: getStatusLabel(request.status),
      currentRouteName: currentRoute?.name || null,
      newRouteName: newRoute?.name || null,
      currentStopName: currentStop?.name || null,
      newStopName: newStop?.name || null,
      scheduleDays: request.newSchedule?.daysOfWeek.map(getDayName).join(", ") || null,
      scheduleRouteTypes: request.newSchedule?.affectedRouteTypes.join(", ") || null,
    };
  },
});
