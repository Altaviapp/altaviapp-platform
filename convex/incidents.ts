/**
 * Incident Management Functions
 *
 * Safety reports and emergency alerts.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { verifyUser, verifyRole, verifyInstitutionAccess } from "./lib/simpleAuth";

/**
 * Report an incident
 */
export const reportIncident = mutation({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    tripId: v.optional(v.id("trips")),
    type: v.union(
      v.literal("accident"),
      v.literal("breakdown"),
      v.literal("behavior"),
      v.literal("emergency"),
      v.literal("other")
    ),
    severity: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
      v.literal("critical")
    ),
    title: v.string(),
    description: v.string(),
    location: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    // Drivers, monitors, and admins can report incidents
    if (!["driver", "monitor", "admin", "super_admin"].includes(currentUser.role)) {
      throw new Error("No tienes permiso para reportar incidentes");
    }

    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const now = Date.now();

    const incidentId = await ctx.db.insert("incidents", {
      tripId: args.tripId,
      institutionId: args.institutionId,
      reportedBy: args.userId,
      type: args.type,
      severity: args.severity,
      title: args.title,
      description: args.description,
      location: args.location,
      latitude: args.latitude,
      longitude: args.longitude,
      status: "open",
      createdAt: now,
      updatedAt: now,
    });

    // Notify admins of critical/high severity incidents
    if (args.severity === "critical" || args.severity === "high") {
      const admins = await ctx.db
        .query("users")
        .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
        .filter((q) => q.eq(q.field("role"), "admin"))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      for (const admin of admins) {
        await ctx.db.insert("notifications", {
          userId: admin._id,
          title: `Incidente ${args.severity === "critical" ? "CRÍTICO" : "URGENTE"}`,
          message: `${args.title} - ${args.type}`,
          type: args.severity === "critical" ? "error" : "warning",
          read: false,
          createdAt: now,
        });
      }
    }

    return { success: true, incidentId };
  },
});

/**
 * Get incident by ID
 */
export const getIncident = query({
  args: {
    userId: v.id("users"),
    incidentId: v.id("incidents"),
  },
  handler: async (ctx, args) => {
    const incident = await ctx.db.get(args.incidentId);
    if (!incident) {
      throw new Error("Incidente no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, incident.institutionId);

    // Get reporter info
    const reporter = await ctx.db.get(incident.reportedBy);

    // Get trip info if available
    let tripInfo = null;
    if (incident.tripId) {
      const trip = await ctx.db.get(incident.tripId);
      if (trip) {
        const route = await ctx.db.get(trip.routeId);
        tripInfo = {
          id: trip._id,
          date: trip.scheduledDate,
          routeName: route?.name,
        };
      }
    }

    return {
      ...incident,
      reportedByName: reporter?.name || "Desconocido",
      trip: tripInfo,
    };
  },
});

/**
 * List incidents
 */
export const listIncidents = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
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
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("investigating"),
      v.literal("resolved"),
      v.literal("closed")
    )),
    tripId: v.optional(v.id("trips")),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    let incidents = await ctx.db
      .query("incidents")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .order("desc")
      .collect();

    if (args.type) {
      incidents = incidents.filter((i) => i.type === args.type);
    }

    if (args.severity) {
      incidents = incidents.filter((i) => i.severity === args.severity);
    }

    if (args.status) {
      incidents = incidents.filter((i) => i.status === args.status);
    }

    if (args.tripId) {
      incidents = incidents.filter((i) => i.tripId === args.tripId);
    }

    // Enrich with reporter info
    const enriched = await Promise.all(
      incidents.map(async (i) => {
        const reporter = await ctx.db.get(i.reportedBy);
        return {
          ...i,
          reportedByName: reporter?.name || "Desconocido",
        };
      })
    );

    return enriched;
  },
});

/**
 * Update incident status
 */
export const updateIncident = mutation({
  args: {
    userId: v.id("users"),
    incidentId: v.id("incidents"),
    status: v.optional(v.union(
      v.literal("open"),
      v.literal("investigating"),
      v.literal("resolved"),
      v.literal("closed")
    )),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const incident = await ctx.db.get(args.incidentId);
    if (!incident) {
      throw new Error("Incidente no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, incident.institutionId);

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.status !== undefined) updates.status = args.status;
    if (args.title !== undefined) updates.title = args.title;
    if (args.description !== undefined) updates.description = args.description;

    await ctx.db.patch(args.incidentId, updates);

    return { success: true };
  },
});

/**
 * Resolve incident
 */
export const resolveIncident = mutation({
  args: {
    userId: v.id("users"),
    incidentId: v.id("incidents"),
    resolutionNotes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const incident = await ctx.db.get(args.incidentId);
    if (!incident) {
      throw new Error("Incidente no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, incident.institutionId);

    await ctx.db.patch(args.incidentId, {
      status: "resolved",
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});
