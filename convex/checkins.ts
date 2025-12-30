/**
 * Student Check-in/Check-out Functions
 *
 * Manages student pickup and dropoff with QR code scanning.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { verifyUser, verifyInstitutionAccess } from "./lib/simpleAuth";

/**
 * Record student check-in
 */
export const recordCheckin = mutation({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
    studentId: v.id("students"),
    stopId: v.id("routeStops"),
    checkinType: v.union(v.literal("pickup"), v.literal("dropoff")),
    qrScanned: v.boolean(),
    latitude: v.number(),
    longitude: v.number(),
    manualReason: v.optional(v.string()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    // Verify trip exists and is in progress
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    if (trip.status !== "in_progress") {
      throw new Error("El viaje no está en progreso");
    }

    // Verify student exists
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    // Verify student is assigned to this route
    const assignment = await ctx.db
      .query("studentRoutes")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("routeId"), trip.routeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!assignment) {
      throw new Error("Estudiante no asignado a esta ruta");
    }

    // Check for duplicate checkin
    const existingCheckin = await ctx.db
      .query("studentCheckins")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .filter((q) => q.eq(q.field("studentId"), args.studentId))
      .filter((q) => q.eq(q.field("checkinType"), args.checkinType))
      .first();

    if (existingCheckin) {
      throw new Error(`Este estudiante ya tiene un ${args.checkinType === "pickup" ? "registro de recogida" : "registro de entrega"}`);
    }

    // Determine performer role
    let performedByRole: "driver" | "monitor" | "admin" = "admin";
    if (currentUser.role === "driver") {
      performedByRole = "driver";
    } else if (currentUser.role === "monitor") {
      performedByRole = "monitor";
    }

    const now = Date.now();

    // Create checkin record
    const checkinId = await ctx.db.insert("studentCheckins", {
      tripId: args.tripId,
      studentId: args.studentId,
      stopId: args.stopId,
      performedById: args.userId,
      performedByRole,
      checkinType: args.checkinType,
      timestamp: now,
      latitude: args.latitude,
      longitude: args.longitude,
      qrScanned: args.qrScanned,
      manualReason: args.manualReason,
      notes: args.notes,
      createdAt: now,
    });

    // Create notification for parent
    const route = await ctx.db.get(trip.routeId);
    const routeType = route?.type === "pickup" ? "recogida" : "entrega";
    const action = args.checkinType === "pickup" ? "ha subido al bus" : "ha bajado del bus";

    // Find parent user by email
    const parentUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", student.parentEmail.toLowerCase()))
      .first();

    if (parentUser) {
      await ctx.db.insert("notifications", {
        userId: parentUser._id,
        title: args.checkinType === "pickup" ? "Estudiante Recogido" : "Estudiante Entregado",
        message: `${student.firstName} ${student.lastName} ${action} a las ${new Date(now).toLocaleTimeString("es-EC", { hour: "2-digit", minute: "2-digit" })}`,
        type: "success",
        read: false,
        createdAt: now,
      });
    }

    // Get stop name for event description
    const stop = await ctx.db.get(args.stopId);

    // Record trip event for timeline
    if (route?.institutionId) {
      await ctx.runMutation(internal.tripEvents.recordEventInternal, {
        tripId: args.tripId,
        institutionId: route.institutionId,
        type: args.checkinType === "pickup" ? "student_checkin" : "student_checkout",
        title: args.checkinType === "pickup"
          ? `${student.firstName} ${student.lastName} abordó`
          : `${student.firstName} ${student.lastName} fue entregado`,
        description: stop ? `Check-in en parada: ${stop.name}` : undefined,
        studentId: args.studentId,
        stopId: args.stopId,
        actorId: args.userId,
        actorRole: performedByRole,
        latitude: args.latitude,
        longitude: args.longitude,
        metadata: {
          checkinId,
          qrScanned: args.qrScanned,
          manualReason: args.manualReason,
        },
      });
    }

    return {
      success: true,
      checkinId,
      studentName: `${student.firstName} ${student.lastName}`,
      parentNotified: !!parentUser,
    };
  },
});

/**
 * Get checkins for a trip
 */
export const getTripCheckins = query({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    const route = await ctx.db.get(trip.routeId);
    if (route) {
      await verifyInstitutionAccess(ctx, args.userId, route.institutionId);
    }

    const checkins = await ctx.db
      .query("studentCheckins")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    // Enrich with student and stop info
    const enriched = await Promise.all(
      checkins.map(async (c) => {
        const student = await ctx.db.get(c.studentId);
        const stop = await ctx.db.get(c.stopId);
        const performer = await ctx.db.get(c.performedById);
        return {
          ...c,
          student: student ? {
            id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            grade: student.grade,
          } : null,
          stop: stop ? { name: stop.name, order: stop.order } : null,
          performedBy: performer?.name || "Desconocido",
        };
      })
    );

    return enriched.sort((a, b) => a.timestamp - b.timestamp);
  },
});

/**
 * Get checkins for a student (history)
 */
export const getStudentCheckins = query({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);
    const student = await ctx.db.get(args.studentId);

    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    // Parents can only view their own children
    if (currentUser.role === "parent") {
      if (currentUser.email?.toLowerCase() !== student.parentEmail.toLowerCase()) {
        throw new Error("No tienes permiso para ver este estudiante");
      }
    } else {
      await verifyInstitutionAccess(ctx, args.userId, student.institutionId);
    }

    const limit = args.limit || 50;

    const checkins = await ctx.db
      .query("studentCheckins")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .order("desc")
      .take(limit);

    // Enrich with trip and stop info
    const enriched = await Promise.all(
      checkins.map(async (c) => {
        const trip = await ctx.db.get(c.tripId);
        const stop = await ctx.db.get(c.stopId);
        const route = trip ? await ctx.db.get(trip.routeId) : null;
        return {
          ...c,
          routeName: route?.name || "Ruta desconocida",
          stopName: stop?.name || "Parada desconocida",
          date: trip?.scheduledDate,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get pending students for a trip (not yet checked in)
 */
export const getPendingStudents = query({
  args: {
    userId: v.id("users"),
    tripId: v.id("trips"),
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId);
    if (!trip) {
      throw new Error("Viaje no encontrado");
    }

    const route = await ctx.db.get(trip.routeId);
    if (route) {
      await verifyInstitutionAccess(ctx, args.userId, route.institutionId);
    }

    // Get all students assigned to this route
    const assignments = await ctx.db
      .query("studentRoutes")
      .withIndex("by_route", (q) => q.eq("routeId", trip.routeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Get already checked-in students
    const checkins = await ctx.db
      .query("studentCheckins")
      .withIndex("by_trip", (q) => q.eq("tripId", args.tripId))
      .collect();

    const checkedInStudentIds = new Set(checkins.map((c) => c.studentId));

    // Filter out already checked-in students
    const pendingAssignments = assignments.filter(
      (a) => !checkedInStudentIds.has(a.studentId)
    );

    // Get student details
    const pending = await Promise.all(
      pendingAssignments.map(async (a) => {
        const student = await ctx.db.get(a.studentId);
        const stop = await ctx.db.get(a.stopId);
        return student ? {
          studentId: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          grade: student.grade,
          stopId: a.stopId,
          stopName: stop?.name || "Parada desconocida",
          stopOrder: stop?.order || 0,
        } : null;
      })
    );

    return pending.filter(Boolean).sort((a, b) => (a?.stopOrder || 0) - (b?.stopOrder || 0));
  },
});

/**
 * Undo/cancel a checkin
 */
export const cancelCheckin = mutation({
  args: {
    userId: v.id("users"),
    checkinId: v.id("studentCheckins"),
    reason: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    const checkin = await ctx.db.get(args.checkinId);
    if (!checkin) {
      throw new Error("Registro no encontrado");
    }

    // Only allow cancellation within 30 minutes
    const thirtyMinutesAgo = Date.now() - 30 * 60 * 1000;
    if (checkin.timestamp < thirtyMinutesAgo) {
      throw new Error("No se puede cancelar un registro después de 30 minutos");
    }

    // Delete the checkin
    await ctx.db.delete(args.checkinId);

    return { success: true };
  },
});
