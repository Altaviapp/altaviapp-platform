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
import type { Id } from "./_generated/dataModel";

// ============================================
// CONSTANTS
// ============================================

// Minimum hours before trip for stop changes (48 hours)
const STOP_CHANGE_MIN_HOURS = 48;

// Get type labels in Spanish
function getTypeLabel(type: string | undefined | null): string {
  if (!type) return "Novedad";
  const labels: Record<string, string> = {
    // New simplified categories
    absence: "Ausencia",
    third_party_pickup: "Recogida por Tercero",
    temporary_stop_change: "Cambio de Parada Temporal",
    address_change: "Cambio de Domicilio",
    service_suspension: "Suspensión de Servicio",
    // Legacy types (for backwards compatibility)
    parent_pickup: "Recogida por Tercero",
    pickup_change: "Recogida por Tercero",
    stop_change: "Cambio de Parada",
    time_change: "Cambio de Horario",
    location_change: "Cambio de Domicilio",
    schedule_change: "Cambio de Horario",
    route_change: "Cambio de Ruta",
    early_pickup: "Salida Temprana",
    late_arrival: "Llegada Tarde",
    other: "Otro",
  };
  return labels[type] || type;
}

// Helper to get effective date from novedad (handles both legacy and new schema)
function getEffectiveDate(novedad: { date?: string; startDate?: string }): string {
  return novedad.startDate || novedad.date || "";
}

// Helper to get effective type from novedad
function getEffectiveType(novedad: { type?: string; typeCategorySnapshot?: string }): string {
  return novedad.type || novedad.typeCategorySnapshot || "other";
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
 * Supports both legacy type string and new typeId-based creation
 */
export const create = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
    // NEW: typeId-based creation (preferred)
    typeId: v.optional(v.id("novedadTypes")),
    // LEGACY: type string (for backwards compatibility)
    type: v.optional(v.union(
      v.literal("absence"),
      v.literal("parent_pickup"),
      v.literal("stop_change"),
      v.literal("early_pickup"),
      v.literal("late_arrival")
    )),
    // Route specification
    routeId: v.optional(v.id("routes")), // Specific route (new)
    affectedRouteType: v.union(
      v.literal("pickup"),
      v.literal("dropoff"),
      v.literal("both")
    ),
    // Dates - support both legacy and new system
    date: v.optional(v.string()), // YYYY-MM-DD (legacy, single day)
    durationType: v.optional(v.union(
      v.literal("single_day"),
      v.literal("date_range"),
      v.literal("permanent"),
      v.literal("recurring")
    )),
    startDate: v.optional(v.string()), // YYYY-MM-DD (new)
    endDate: v.optional(v.string()), // YYYY-MM-DD (new, for ranges)
    recurringDays: v.optional(v.array(v.number())), // 0-6 for recurring
    // Stop change (legacy)
    newStopId: v.optional(v.id("routeStops")),
    // Temporary location (temporary_stop_change)
    temporaryLocation: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.string(),
    })),
    // Authorized person (third_party_pickup)
    authorizedPerson: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.optional(v.string()),
    })),
    // Location change (address_change)
    locationChange: v.optional(v.object({
      previousLatitude: v.number(),
      previousLongitude: v.number(),
      previousAddress: v.string(),
      newLatitude: v.number(),
      newLongitude: v.number(),
      newAddress: v.string(),
      distanceChange: v.number(),
    })),
    // Time
    time: v.optional(v.string()), // HH:mm
    // Content
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
      const hasAccess =
        user.email.toLowerCase() === student.parentEmail.toLowerCase() ||
        (student.secondaryParentEmail &&
          user.email.toLowerCase() === student.secondaryParentEmail.toLowerCase());
      if (!hasAccess) {
        throw new Error("No tienes permiso para crear novedades para este estudiante");
      }
    } else {
      // Admin - verify institution access
      await verifyInstitutionAccess(ctx, args.userId, student.institutionId);
    }

    // Resolve type - prefer typeId, fallback to legacy type
    let novedadType = null;
    let effectiveCategory: string | null = null;
    let requiresApproval = true;

    if (args.typeId) {
      novedadType = await ctx.db.get(args.typeId);

      // Debug logging for type validation
      console.log("[novedades.create] Validating novedadType:", {
        typeId: args.typeId,
        found: !!novedadType,
        typeInstitutionId: novedadType?.institutionId,
        studentInstitutionId: student.institutionId,
        isActive: novedadType?.isActive,
      });

      if (!novedadType) {
        throw new Error(`Tipo de novedad no encontrado: ${args.typeId}`);
      }
      if (novedadType.institutionId !== student.institutionId) {
        throw new Error(
          `El tipo de novedad "${novedadType.name}" pertenece a otra institución. ` +
          `Por favor contacta al administrador para configurar los tipos de novedad.`
        );
      }
      if (!novedadType.isActive) {
        throw new Error(`El tipo de novedad "${novedadType.name}" no está activo`);
      }
      effectiveCategory = novedadType.category;
      requiresApproval = novedadType.requiresApproval;
    } else if (args.type) {
      // Legacy type - map to NEW simplified categories
      const legacyTypeToCategory: Record<string, string> = {
        absence: "absence",
        parent_pickup: "third_party_pickup", // Updated: pickup_change -> third_party_pickup
        stop_change: "temporary_stop_change", // Updated: stop_change -> temporary_stop_change
        early_pickup: "absence", // DEPRECATED: time changes no longer supported, treat as absence
        late_arrival: "absence", // DEPRECATED: time changes no longer supported, treat as absence
      };
      effectiveCategory = legacyTypeToCategory[args.type] || "absence";
      requiresApproval = args.type === "stop_change"; // Only stop change requires approval by default
    } else {
      throw new Error("Debe especificar el tipo de novedad");
    }

    // ============================================
    // CATEGORY-SPECIFIC VALIDATION
    // ============================================

    // Validate third_party_pickup - requires authorized person info
    if (effectiveCategory === "third_party_pickup" || effectiveCategory === "pickup_change") {
      if (!args.authorizedPerson?.name || !args.authorizedPerson?.phone) {
        throw new Error("Debe especificar el nombre y teléfono de la persona autorizada");
      }
    }

    // Validate temporary_stop_change - requires location
    if (effectiveCategory === "temporary_stop_change") {
      // Can use either temporaryLocation (new) or newStopId (legacy)
      if (!args.temporaryLocation && !args.newStopId) {
        throw new Error("Debe especificar la nueva ubicación temporal");
      }
    }

    // Validate address_change - requires location change info
    if (effectiveCategory === "address_change" || effectiveCategory === "location_change") {
      if (!args.locationChange) {
        throw new Error("Debe especificar la nueva dirección de domicilio");
      }
    }

    // Determine effective dates (needed for service_suspension validation)
    const effectiveStartDate = args.startDate || args.date;
    const effectiveDurationType = args.durationType || "single_day";

    // Validate service_suspension - requires date range
    if (effectiveCategory === "service_suspension") {
      if (!args.endDate && effectiveDurationType !== "permanent") {
        throw new Error("Debe especificar la fecha de fin para la suspensión temporal");
      }
    }

    if (!effectiveStartDate) {
      throw new Error("Debe especificar la fecha");
    }

    // Validate date is not in the past (only for non-permanent)
    const today = new Date().toISOString().split("T")[0]!;
    if (effectiveDurationType !== "permanent" && effectiveStartDate < today) {
      throw new Error("No se pueden crear novedades para fechas pasadas");
    }

    // Validate advance time if type requires it
    if (novedadType?.minAdvanceHours) {
      const requestDate = new Date(effectiveStartDate);
      const now = new Date();
      const hoursUntil = (requestDate.getTime() - now.getTime()) / (1000 * 60 * 60);

      if (hoursUntil < novedadType.minAdvanceHours) {
        throw new Error(
          `Este tipo de novedad requiere mínimo ${novedadType.minAdvanceHours} horas de anticipación`
        );
      }
    }

    // Validate stop change requirements (legacy category - stop_change)
    // Note: temporary_stop_change is already validated above
    const isLegacyStopChange = effectiveCategory === "stop_change" || args.type === "stop_change";
    if (isLegacyStopChange) {
      if (!novedadType?.minAdvanceHours) {
        // Legacy validation
        const requestDate = new Date(effectiveStartDate);
        const now = new Date();
        const hoursUntil = (requestDate.getTime() - now.getTime()) / (1000 * 60 * 60);

        if (hoursUntil < STOP_CHANGE_MIN_HOURS) {
          throw new Error(
            `Los cambios de parada requieren mínimo ${STOP_CHANGE_MIN_HOURS} horas de anticipación`
          );
        }
      }

      // Accept either temporaryLocation (new) or newStopId (legacy)
      if (!args.temporaryLocation && !args.newStopId) {
        throw new Error("Debe especificar la nueva ubicación para cambios de parada");
      }

      // Verify new stop exists and is valid (only if using legacy newStopId)
      if (args.newStopId) {
        const newStop = await ctx.db.get(args.newStopId);
        if (!newStop || !newStop.isActive) {
          throw new Error("La parada seleccionada no es válida");
        }
      }
    }

    // Check for duplicate novedades
    // For single_day, check same date
    // For date_range/permanent/recurring, check overlapping ranges
    if (effectiveDurationType === "single_day") {
      const existingNovedad = await ctx.db
        .query("novedades")
        .withIndex("by_student_date", (q) =>
          q.eq("studentId", args.studentId).eq("date", effectiveStartDate)
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
    }
    // TODO: Add overlap checking for date_range/permanent/recurring

    // Determine initial status
    // If doesn't require approval, go directly to acknowledged
    const initialStatus = !requiresApproval ? "acknowledged" : "pending";

    const now = Date.now();
    const novedadId = await ctx.db.insert("novedades", {
      institutionId: student.institutionId,
      studentId: args.studentId,
      createdBy: args.userId,
      // Type fields
      typeId: args.typeId,
      typeCategorySnapshot: effectiveCategory || undefined,
      type: args.type, // Keep legacy type for backwards compatibility
      // Route fields
      routeId: args.routeId,
      affectedRouteType: args.affectedRouteType,
      // Date fields
      durationType: effectiveDurationType,
      startDate: effectiveStartDate,
      endDate: args.endDate,
      recurringDays: args.recurringDays,
      date: args.date || effectiveStartDate, // Legacy field, keep populated
      // Category-specific fields
      newStopId: args.newStopId,
      temporaryLocation: args.temporaryLocation,
      authorizedPerson: args.authorizedPerson,
      locationChange: args.locationChange,
      // Other fields
      time: args.time,
      reason: args.reason,
      status: initialStatus,
      // Auto-acknowledge if no approval required
      acknowledgedAt: !requiresApproval ? now : undefined,
      acknowledgedBy: !requiresApproval ? args.userId : undefined,
      createdAt: now,
      updatedAt: now,
    });

    // Find assigned crew members and notify them
    // Wrapped in try-catch to ensure novedad creation succeeds even if notifications fail
    try {
      const studentRoutes = await ctx.db
        .query("studentRoutes")
        .withIndex("by_student", (q) => q.eq("studentId", args.studentId))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      const notifiedUsers = new Set<string>();

      // Get display name for the novedad type
      const typeName = novedadType?.name || getTypeLabel(args.type || "");

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

        // If specific route specified, only notify that route's crew
        if (args.routeId && sr.routeId !== args.routeId) {
          continue;
        }

        // Determine notification type and title based on novedad category
        const isPickupChange = effectiveCategory === "pickup_change";
        const notifTitle = isPickupChange
          ? `⚠️ ${typeName.toUpperCase()}: ${student.firstName} ${student.lastName}`
          : `Nueva novedad: ${typeName}`;
        const notifMessage = isPickupChange
          ? `${student.firstName} ${student.lastName} - ${typeName}. NO ABORDARÁ. Fecha: ${effectiveStartDate}`
          : `${student.firstName} ${student.lastName} - ${args.reason}. Fecha: ${effectiveStartDate}`;
        const notifType = isPickupChange || effectiveCategory === "absence" ? "warning" : "info";

        // Notify driver (verify user exists before creating notification)
        const driver = await ctx.db.get(route.driverId);
        if (driver) {
          const driverUser = await ctx.db.get(driver.userId);
          if (driverUser && !notifiedUsers.has(driver.userId.toString())) {
            await ctx.db.insert("notifications", {
              userId: driver.userId,
              title: notifTitle,
              message: notifMessage,
              type: notifType,
              category: "novedad",
              relatedEntityType: "novedad",
              relatedEntityId: novedadId.toString(),
              read: false,
              createdAt: now,
            });
            notifiedUsers.add(driver.userId.toString());
          }
        }

        // Notify monitor if exists (verify user exists before creating notification)
        if (route.monitorId) {
          const monitor = await ctx.db.get(route.monitorId);
          if (monitor) {
            const monitorUser = await ctx.db.get(monitor.userId);
            if (monitorUser && !notifiedUsers.has(monitor.userId.toString())) {
              await ctx.db.insert("notifications", {
                userId: monitor.userId,
                title: notifTitle,
                message: notifMessage,
                type: notifType,
                category: "novedad",
                relatedEntityType: "novedad",
                relatedEntityId: novedadId.toString(),
                read: false,
                createdAt: now,
              });
              notifiedUsers.add(monitor.userId.toString());
            }
          }
        }
      }

      // Notify admins if novedad requires approval
      if (requiresApproval) {
        const admins = await ctx.db
          .query("users")
          .withIndex("by_institution", (q) => q.eq("institutionId", student.institutionId))
          .filter((q) =>
            q.and(
              q.eq(q.field("isActive"), true),
              q.or(
                q.eq(q.field("role"), "admin"),
                q.eq(q.field("role"), "super_admin")
              )
            )
          )
          .collect();

        const adminTypeName = novedadType?.name || getTypeLabel(args.type || "");

        for (const admin of admins) {
          if (!notifiedUsers.has(admin._id.toString())) {
            await ctx.db.insert("notifications", {
              userId: admin._id,
              title: `Novedad pendiente: ${adminTypeName}`,
              message: `${student.firstName} ${student.lastName} - Requiere aprobación`,
              type: "warning",
              category: "approval_request",
              relatedEntityType: "novedad",
              relatedEntityId: novedadId.toString(),
              read: false,
              createdAt: now,
            });
            notifiedUsers.add(admin._id.toString());
          }
        }
      }
    } catch (notifError) {
      // Log error but don't fail the novedad creation
      console.error("[novedades.create] Error sending notifications:", notifError);
    }

    return { success: true, novedadId, status: initialStatus };
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
 * Acknowledge multiple novedades at once (by crew)
 * Used for bulk confirmation before starting a trip
 */
export const acknowledgeMultiple = mutation({
  args: {
    userId: v.id("users"),
    novedadIds: v.array(v.id("novedades")),
  },
  handler: async (ctx, args) => {
    const user = await verifyUser(ctx, args.userId);

    // Only crew members or admins can acknowledge
    if (!["driver", "monitor", "admin", "super_admin"].includes(user.role)) {
      throw new Error("Solo el personal de transporte puede acusar recibo de novedades");
    }

    const now = Date.now();
    const results: Array<{ novedadId: string; success: boolean; error?: string }> = [];

    for (const novedadId of args.novedadIds) {
      const novedad = await ctx.db.get(novedadId);

      if (!novedad) {
        results.push({ novedadId: novedadId.toString(), success: false, error: "Novedad no encontrada" });
        continue;
      }

      // Verify institution access
      if (user.institutionId !== novedad.institutionId) {
        results.push({ novedadId: novedadId.toString(), success: false, error: "Sin acceso a esta institución" });
        continue;
      }

      // Can only acknowledge approved or pending novedades (pending = auto-approved types)
      if (novedad.status !== "approved" && novedad.status !== "pending") {
        // Already acknowledged or other status - skip but mark as success
        if (novedad.status === "acknowledged") {
          results.push({ novedadId: novedadId.toString(), success: true });
          continue;
        }
        results.push({ novedadId: novedadId.toString(), success: false, error: `Estado no válido: ${novedad.status}` });
        continue;
      }

      // Update novedad
      await ctx.db.patch(novedadId, {
        status: "acknowledged",
        acknowledgedBy: args.userId,
        acknowledgedAt: now,
        updatedAt: now,
      });

      results.push({ novedadId: novedadId.toString(), success: true });
    }

    // Notify parents (batch - one notification per student)
    const successfulIds = results.filter(r => r.success).map(r => r.novedadId);
    const notifiedStudents = new Set<string>();

    for (const novedadIdStr of successfulIds) {
      const novedad = await ctx.db.get(novedadIdStr as Id<"novedades">);
      if (!novedad || notifiedStudents.has(novedad.studentId.toString())) continue;

      notifiedStudents.add(novedad.studentId.toString());

      const student = await ctx.db.get(novedad.studentId);
      if (!student) continue;

      const parentUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", student.parentEmail.toLowerCase()))
        .first();

      if (parentUser) {
        await ctx.db.insert("notifications", {
          userId: parentUser._id,
          title: "Novedades confirmadas",
          message: `Las novedades de ${student.firstName} para hoy han sido confirmadas por el equipo de transporte.`,
          type: "success",
          category: "novedad",
          relatedEntityType: "novedad",
          relatedEntityId: novedadIdStr as Id<"novedades">,
          read: false,
          createdAt: now,
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    const failCount = results.filter(r => !r.success).length;

    return {
      success: failCount === 0,
      confirmedCount: successCount,
      failedCount: failCount,
      results,
      confirmedAt: now,
    };
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

    // Find all students for this parent (filter by email AND institutionId)
    const students = await ctx.db
      .query("students")
      .filter((q) =>
        q.and(
          q.eq(q.field("parentEmail"), user.email.toLowerCase()),
          q.eq(q.field("institutionId"), user.institutionId)
        )
      )
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
      const dateA = getEffectiveDate(a);
      const dateB = getEffectiveDate(b);
      if (dateA !== dateB) return dateB.localeCompare(dateA);
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
      novedades = novedades.filter((n) => getEffectiveDate(n) >= args.fromDate!);
    }

    if (args.toDate) {
      novedades = novedades.filter((n) => getEffectiveDate(n) <= args.toDate!);
    }

    // Sort by date descending
    novedades.sort((a, b) => {
      const dateA = getEffectiveDate(a);
      const dateB = getEffectiveDate(b);
      if (dateA !== dateB) return dateB.localeCompare(dateA);
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
      const dateA = getEffectiveDate(a);
      const dateB = getEffectiveDate(b);
      if (dateA !== dateB) return dateA.localeCompare(dateB);
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
 * Get novedades for a specific route (before trip exists)
 * Used by crew app to preview novedades before starting a trip
 */
export const getNovedadesForRoute = query({
  args: {
    userId: v.id("users"),
    routeId: v.id("routes"),
    date: v.string(), // YYYY-MM-DD
  },
  handler: async (ctx, args) => {
    const route = await ctx.db.get(args.routeId);
    if (!route) {
      return [];
    }

    // Get all students assigned to this route
    const studentRoutes = await ctx.db
      .query("studentRoutes")
      .withIndex("by_route", (q) => q.eq("routeId", args.routeId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    if (studentRoutes.length === 0) {
      return [];
    }

    const studentIds = studentRoutes.map((sr) => sr.studentId);

    // Get novedades for these students on this date
    const allNovedades = [];

    for (const studentId of studentIds) {
      const novedades = await ctx.db
        .query("novedades")
        .withIndex("by_student_date", (q) =>
          q.eq("studentId", studentId).eq("date", args.date)
        )
        .filter((q) =>
          q.and(
            // Not cancelled or expired
            q.neq(q.field("status"), "cancelled"),
            q.neq(q.field("status"), "expired"),
            // Affects this route type
            q.or(
              q.eq(q.field("affectedRouteType"), "both"),
              q.eq(q.field("affectedRouteType"), route.type)
            )
          )
        )
        .collect();

      allNovedades.push(...novedades);
    }

    // Enrich with student info
    const enriched = await Promise.all(
      allNovedades.map(async (novedad) => {
        const student = await ctx.db.get(novedad.studentId);
        const stop = await ctx.db
          .query("studentRoutes")
          .withIndex("by_student", (q) => q.eq("studentId", novedad.studentId))
          .filter((q) => q.eq(q.field("routeId"), args.routeId))
          .first();
        const stopInfo = stop?.stopId ? await ctx.db.get(stop.stopId) : null;

        return {
          ...novedad,
          studentName: student ? `${student.firstName} ${student.lastName}` : "Desconocido",
          studentGrade: student?.grade || "",
          stopName: stopInfo?.name || null,
          stopOrder: stopInfo?.order || 0,
          typeLabel: getTypeLabel(novedad.type),
          routeTypeLabel: getRouteTypeLabel(novedad.affectedRouteType),
        };
      })
    );

    // Sort by type priority (absence first, then parent_pickup, then stop_change)
    const typePriority: Record<string, number> = {
      absence: 1,
      parent_pickup: 2,
      stop_change: 3,
      early_pickup: 4,
      late_arrival: 5,
    };

    enriched.sort((a, b) => {
      const priorityA = typePriority[getEffectiveType(a)] || 99;
      const priorityB = typePriority[getEffectiveType(b)] || 99;
      if (priorityA !== priorityB) return priorityA - priorityB;
      return (a.stopOrder || 0) - (b.stopOrder || 0);
    });

    return enriched;
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

/**
 * Get novedades for all routes assigned to a driver/monitor for today
 * Used in the dashboard to show a summary of today's novedades
 */
export const getNovedadesForDriverToday = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const today = new Date().toISOString().split("T")[0]!;
    const currentDayOfWeek = new Date()
      .toLocaleDateString("en-US", { weekday: "long" })
      .toLowerCase() as
      | "monday"
      | "tuesday"
      | "wednesday"
      | "thursday"
      | "friday"
      | "saturday"
      | "sunday";

    // Get user to find their driver/monitor record
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return { novedades: [], summary: { total: 0, absences: 0, parentPickups: 0, stopChanges: 0, other: 0 } };
    }

    // Get driver record
    const driver = await ctx.db
      .query("drivers")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    // Get monitor record
    const monitor = await ctx.db
      .query("monitors")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .first();

    if (!driver && !monitor) {
      return { novedades: [], summary: { total: 0, absences: 0, parentPickups: 0, stopChanges: 0, other: 0 } };
    }

    // Get routes where user is driver or monitor
    const routes: Array<{ _id: string; type: "pickup" | "dropoff"; name: string }> = [];

    if (driver) {
      const driverRoutes = await ctx.db
        .query("routes")
        .withIndex("by_driver", (q) => q.eq("driverId", driver._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
      for (const r of driverRoutes) {
        routes.push({ _id: r._id, type: r.type, name: r.name });
      }
    }

    if (monitor) {
      const monitorRoutes = await ctx.db
        .query("routes")
        .withIndex("by_monitor", (q) => q.eq("monitorId", monitor._id))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();
      // Avoid duplicates if user is both driver and monitor on same route
      for (const r of monitorRoutes) {
        if (!routes.some(existing => existing._id === r._id)) {
          routes.push({ _id: r._id, type: r.type, name: r.name });
        }
      }
    }

    // Filter routes by recurrence for today
    const todayRoutes: Array<{ _id: string; type: "pickup" | "dropoff"; name: string }> = [];
    for (const route of routes) {
      const fullRoute = await ctx.db.get(route._id as Id<"routes">);
      if (!fullRoute?.recurrence) continue;

      const rec = fullRoute.recurrence;
      let isToday = false;

      if (rec.type === "daily" && rec.daysOfWeek?.includes(currentDayOfWeek)) {
        isToday = true;
      } else if (rec.type === "weekly" && rec.dayOfWeek === currentDayOfWeek) {
        isToday = true;
      } else if (rec.type === "one_time" && rec.specificDate === today) {
        isToday = true;
      }

      if (isToday) {
        todayRoutes.push({ _id: route._id, type: fullRoute.type, name: fullRoute.name });
      }
    }

    // Get all novedades for these routes
    const allNovedades: Array<{
      _id: string;
      studentName: string;
      type: string;
      routeName: string;
      reason: string;
      affectedRouteType: string;
    }> = [];

    for (const route of todayRoutes) {
      // Get students assigned to this route
      const studentRoutes = await ctx.db
        .query("studentRoutes")
        .withIndex("by_route", (q) => q.eq("routeId", route._id as Id<"routes">))
        .filter((q) => q.eq(q.field("isActive"), true))
        .collect();

      for (const sr of studentRoutes) {
        const novedades = await ctx.db
          .query("novedades")
          .withIndex("by_student_date", (q) =>
            q.eq("studentId", sr.studentId).eq("date", today)
          )
          .filter((q) =>
            q.and(
              q.neq(q.field("status"), "cancelled"),
              q.neq(q.field("status"), "expired"),
              q.or(
                q.eq(q.field("affectedRouteType"), "both"),
                q.eq(q.field("affectedRouteType"), route.type)
              )
            )
          )
          .collect();

        for (const novedad of novedades) {
          // Avoid duplicates
          if (!allNovedades.some(n => n._id === novedad._id.toString())) {
            const student = await ctx.db.get(sr.studentId);
            allNovedades.push({
              _id: novedad._id.toString(),
              studentName: student ? `${student.firstName} ${student.lastName}` : "Desconocido",
              type: getEffectiveType(novedad),
              routeName: route.name,
              reason: novedad.reason || "",
              affectedRouteType: novedad.affectedRouteType,
            });
          }
        }
      }
    }

    // Calculate summary
    const summary = {
      total: allNovedades.length,
      absences: allNovedades.filter((n) => n.type === "absence").length,
      parentPickups: allNovedades.filter((n) => n.type === "parent_pickup").length,
      stopChanges: allNovedades.filter((n) => n.type === "stop_change").length,
      other: allNovedades.filter((n) =>
        !["absence", "parent_pickup", "stop_change"].includes(n.type)
      ).length,
    };

    return { novedades: allNovedades, summary };
  },
});

// ============================================
// EVIDENCE MUTATIONS
// ============================================

/**
 * Generate an upload URL for evidence file
 * Returns a URL that can be used to upload a file to Convex storage
 */
export const generateEvidenceUploadUrl = mutation({
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

    // Only creator or admin can upload evidence
    if (novedad.createdBy !== args.userId) {
      if (user.role !== "admin" && user.role !== "super_admin") {
        throw new Error("Solo el creador puede subir evidencia");
      }
      await verifyInstitutionAccess(ctx, args.userId, novedad.institutionId);
    }

    // Check file limit if type has one
    if (novedad.typeId) {
      const novedadType = await ctx.db.get(novedad.typeId);
      if (novedadType) {
        const currentCount = novedad.attachments?.length || 0;
        const maxFiles = novedadType.maxEvidenceFiles || 5;
        if (currentCount >= maxFiles) {
          throw new Error(`Máximo ${maxFiles} archivos permitidos`);
        }
      }
    } else {
      // Default limit for legacy novedades
      const currentCount = novedad.attachments?.length || 0;
      if (currentCount >= 5) {
        throw new Error("Máximo 5 archivos permitidos");
      }
    }

    // Generate upload URL
    const uploadUrl = await ctx.storage.generateUploadUrl();

    return { uploadUrl };
  },
});

/**
 * Save evidence file reference after upload
 */
export const saveEvidenceFile = mutation({
  args: {
    userId: v.id("users"),
    novedadId: v.id("novedades"),
    storageId: v.id("_storage"),
    fileName: v.string(),
    fileType: v.string(),
    fileSize: v.number(),
  },
  handler: async (ctx, args) => {
    const user = await verifyUser(ctx, args.userId);

    const novedad = await ctx.db.get(args.novedadId);
    if (!novedad) {
      throw new Error("Novedad no encontrada");
    }

    // Only creator or admin can add evidence
    if (novedad.createdBy !== args.userId) {
      if (user.role !== "admin" && user.role !== "super_admin") {
        throw new Error("Solo el creador puede agregar evidencia");
      }
      await verifyInstitutionAccess(ctx, args.userId, novedad.institutionId);
    }

    // Validate file type if type has restrictions
    if (novedad.typeId) {
      const novedadType = await ctx.db.get(novedad.typeId);
      if (novedadType?.allowedFileTypes && novedadType.allowedFileTypes.length > 0) {
        const isAllowed = novedadType.allowedFileTypes.some((allowed) => {
          if (allowed.endsWith("/*")) {
            const category = allowed.replace("/*", "");
            return args.fileType.startsWith(category);
          }
          return args.fileType === allowed;
        });
        if (!isAllowed) {
          throw new Error("Tipo de archivo no permitido");
        }
      }
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (args.fileSize > maxSize) {
      throw new Error("El archivo excede el tamaño máximo de 10MB");
    }

    // Add to attachments array
    const currentAttachments = novedad.attachments || [];
    const newAttachment = {
      storageId: args.storageId,
      fileName: args.fileName,
      fileType: args.fileType,
      fileSize: args.fileSize,
      uploadedAt: Date.now(),
    };

    await ctx.db.patch(args.novedadId, {
      attachments: [...currentAttachments, newAttachment],
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete an evidence file
 */
export const deleteEvidenceFile = mutation({
  args: {
    userId: v.id("users"),
    novedadId: v.id("novedades"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await verifyUser(ctx, args.userId);

    const novedad = await ctx.db.get(args.novedadId);
    if (!novedad) {
      throw new Error("Novedad no encontrada");
    }

    // Only creator or admin can delete evidence
    if (novedad.createdBy !== args.userId) {
      if (user.role !== "admin" && user.role !== "super_admin") {
        throw new Error("Solo el creador puede eliminar evidencia");
      }
      await verifyInstitutionAccess(ctx, args.userId, novedad.institutionId);
    }

    // Find and remove the attachment
    const currentAttachments = novedad.attachments || [];
    const attachmentIndex = currentAttachments.findIndex(
      (a) => a.storageId === args.storageId
    );

    if (attachmentIndex === -1) {
      throw new Error("Archivo no encontrado");
    }

    // Delete from storage
    await ctx.storage.delete(args.storageId);

    // Remove from array
    const updatedAttachments = [
      ...currentAttachments.slice(0, attachmentIndex),
      ...currentAttachments.slice(attachmentIndex + 1),
    ];

    await ctx.db.patch(args.novedadId, {
      attachments: updatedAttachments,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Get evidence file URL for viewing
 */
export const getEvidenceUrl = query({
  args: {
    userId: v.id("users"),
    novedadId: v.id("novedades"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) {
      return null;
    }

    const novedad = await ctx.db.get(args.novedadId);
    if (!novedad) {
      return null;
    }

    // Verify access: creator, admin, or crew assigned to the route
    const isCreator = novedad.createdBy === args.userId;
    const isAdmin = user.role === "admin" || user.role === "super_admin";

    if (!isCreator && !isAdmin) {
      // Check if user is driver/monitor on affected route
      if (user.role === "driver" || user.role === "monitor") {
        // Get student routes to check access
        const studentRoutes = await ctx.db
          .query("studentRoutes")
          .withIndex("by_student", (q) => q.eq("studentId", novedad.studentId))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        let hasAccess = false;
        for (const sr of studentRoutes) {
          const route = await ctx.db.get(sr.routeId);
          if (!route) continue;

          // Check if user is driver on this route
          const driver = await ctx.db.get(route.driverId);
          if (driver?.userId === args.userId) {
            hasAccess = true;
            break;
          }

          // Check if user is monitor on this route
          if (route.monitorId) {
            const monitor = await ctx.db.get(route.monitorId);
            if (monitor?.userId === args.userId) {
              hasAccess = true;
              break;
            }
          }
        }

        if (!hasAccess) {
          return null;
        }
      } else {
        return null;
      }
    }

    // Verify the file exists in the novedad
    const attachment = novedad.attachments?.find(
      (a) => a.storageId === args.storageId
    );
    if (!attachment) {
      return null;
    }

    // Get the URL
    const url = await ctx.storage.getUrl(args.storageId);

    return {
      url,
      fileName: attachment.fileName,
      fileType: attachment.fileType,
      fileSize: attachment.fileSize,
    };
  },
});
