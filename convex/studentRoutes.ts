/**
 * Student Route Assignments Functions
 *
 * Manages which students are assigned to which routes and stops.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyRole, verifyInstitutionAccess } from "./lib/simpleAuth";

/**
 * Assign student to route
 */
export const assignStudent = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
    routeId: v.id("routes"),
    stopId: v.id("routeStops"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    // Verify student exists
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, student.institutionId);

    // Verify route exists and belongs to same institution
    const route = await ctx.db.get(args.routeId);
    if (!route || route.institutionId !== student.institutionId) {
      throw new Error("Ruta no válida para esta institución");
    }

    // Verify stop belongs to route
    const stop = await ctx.db.get(args.stopId);
    if (!stop || stop.routeId !== args.routeId) {
      throw new Error("Parada no pertenece a esta ruta");
    }

    // Check if already assigned to this route
    const existing = await ctx.db
      .query("studentRoutes")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("routeId"), args.routeId))
      .first();

    if (existing) {
      // Update existing assignment
      await ctx.db.patch(existing._id, {
        stopId: args.stopId,
        isActive: true,
        updatedAt: Date.now(),
      });
      return { success: true, assignmentId: existing._id };
    }

    // Create new assignment
    const now = Date.now();
    const assignmentId = await ctx.db.insert("studentRoutes", {
      studentId: args.studentId,
      routeId: args.routeId,
      stopId: args.stopId,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    return { success: true, assignmentId };
  },
});

/**
 * Get student's route assignments
 */
export const getStudentAssignments = query({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, student.institutionId);

    const assignments = await ctx.db
      .query("studentRoutes")
      .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Enrich with route and stop info
    const enriched = await Promise.all(
      assignments.map(async (a) => {
        const route = await ctx.db.get(a.routeId);
        const stop = await ctx.db.get(a.stopId);
        return {
          ...a,
          route: route ? { id: route._id, name: route.name, type: route.type } : null,
          stop: stop ? { id: stop._id, name: stop.name, scheduledTime: stop.scheduledTime } : null,
        };
      })
    );

    return enriched;
  },
});

/**
 * Get students assigned to a route
 */
export const getRouteStudents = query({
  args: {
    userId: v.id("users"),
    routeId: v.id("routes"),
  },
  handler: async (ctx, args) => {
    const route = await ctx.db.get(args.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    const assignments = await ctx.db
      .query("studentRoutes")
      .withIndex("by_route", (q) => q.eq("routeId", args.routeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // Enrich with student and stop info
    const enriched = await Promise.all(
      assignments.map(async (a) => {
        const student = await ctx.db.get(a.studentId);
        const stop = await ctx.db.get(a.stopId);
        return {
          assignmentId: a._id,
          excludeDays: a.excludeDays || [],
          student: student ? {
            id: student._id,
            firstName: student.firstName,
            lastName: student.lastName,
            grade: student.grade,
            parentPhone: student.parentPhone,
          } : null,
          stop: stop ? { id: stop._id, name: stop.name, order: stop.order } : null,
        };
      })
    );

    // Sort by stop order
    return enriched.sort((a, b) => (a.stop?.order || 0) - (b.stop?.order || 0));
  },
});

/**
 * Update student assignment (change stop)
 */
export const updateAssignment = mutation({
  args: {
    userId: v.id("users"),
    assignmentId: v.id("studentRoutes"),
    stopId: v.id("routeStops"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Asignación no encontrada");
    }

    // Verify stop belongs to the same route
    const stop = await ctx.db.get(args.stopId);
    if (!stop || stop.routeId !== assignment.routeId) {
      throw new Error("Parada no pertenece a esta ruta");
    }

    await ctx.db.patch(args.assignmentId, {
      stopId: args.stopId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Remove student from route
 */
export const removeStudent = mutation({
  args: {
    userId: v.id("users"),
    assignmentId: v.id("studentRoutes"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Asignación no encontrada");
    }

    // Soft delete
    await ctx.db.patch(args.assignmentId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Update excluded days for a student-route assignment
 * Used to configure which days a student doesn't take this route
 */
export const updateExcludeDays = mutation({
  args: {
    userId: v.id("users"),
    assignmentId: v.id("studentRoutes"),
    excludeDays: v.array(v.string()), // ["friday", "saturday"]
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const assignment = await ctx.db.get(args.assignmentId);
    if (!assignment) {
      throw new Error("Asignación no encontrada");
    }

    const route = await ctx.db.get(assignment.routeId);
    if (route) {
      await verifyInstitutionAccess(ctx, args.userId, route.institutionId);
    }

    // Validate day names
    const validDays = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    for (const day of args.excludeDays) {
      if (!validDays.includes(day.toLowerCase())) {
        throw new Error(`Día inválido: ${day}`);
      }
    }

    await ctx.db.patch(args.assignmentId, {
      excludeDays: args.excludeDays.map(d => d.toLowerCase()),
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Bulk assign students to route
 */
export const bulkAssign = mutation({
  args: {
    userId: v.id("users"),
    routeId: v.id("routes"),
    assignments: v.array(v.object({
      studentId: v.id("students"),
      stopId: v.id("routeStops"),
    })),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const route = await ctx.db.get(args.routeId);
    if (!route) {
      throw new Error("Ruta no encontrada");
    }

    await verifyInstitutionAccess(ctx, args.userId, route.institutionId);

    const now = Date.now();
    const results = [];

    for (const { studentId, stopId } of args.assignments) {
      // Verify stop belongs to route
      const stop = await ctx.db.get(stopId);
      if (!stop || stop.routeId !== args.routeId) {
        results.push({ studentId, success: false, error: "Parada inválida" });
        continue;
      }

      // Check for existing assignment
      const existing = await ctx.db
        .query("studentRoutes")
        .withIndex("by_student", (q) => q.eq("studentId", studentId))
        .filter((q) => q.eq(q.field("routeId"), args.routeId))
        .first();

      if (existing) {
        await ctx.db.patch(existing._id, { stopId, isActive: true, updatedAt: now });
        results.push({ studentId, success: true, assignmentId: existing._id });
      } else {
        const assignmentId = await ctx.db.insert("studentRoutes", {
          studentId,
          routeId: args.routeId,
          stopId,
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        results.push({ studentId, success: true, assignmentId });
      }
    }

    return { success: true, results };
  },
});
