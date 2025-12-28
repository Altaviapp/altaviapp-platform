/**
 * Seed Default Novedad Types
 *
 * Creates the default novedad types for an institution.
 * Run this mutation for each institution that needs the default types.
 *
 * Usage:
 *   npx convex run seed/seedNovedadTypes:seedForInstitution --args '{"institutionId": "xxx"}'
 */

import { v } from "convex/values";
import { mutation, internalMutation } from "../_generated/server";
import { Id } from "../_generated/dataModel";

// Default novedad types to seed
const DEFAULT_NOVEDAD_TYPES = [
  // Ausencias
  {
    code: "absence",
    name: "Ausencia",
    description: "El estudiante no viajará en la fecha indicada",
    icon: "UserMinus",
    color: "red",
    category: "absence" as const,
    durationType: "single_day" as const,
    requiresApproval: true,
    affectsTrips: true,
    affectsRouteCalculation: true,
    evidenceRequired: false,
    evidenceOptional: true,
    reasonRequired: true,
    minAdvanceHours: 2,
  },
  {
    code: "medical_leave",
    name: "Ausencia Médica",
    description: "Ausencia por motivos médicos (citas, enfermedad)",
    icon: "Stethoscope",
    color: "red",
    category: "absence" as const,
    durationType: "date_range" as const,
    requiresApproval: true,
    affectsTrips: true,
    affectsRouteCalculation: true,
    evidenceRequired: true,
    evidenceOptional: false,
    reasonRequired: true,
    minAdvanceHours: 0,
    allowedFileTypes: ["image/*", "application/pdf"],
  },

  // Cambios de recogida
  {
    code: "parent_pickup",
    name: "Recoge Padre",
    description: "El padre/tutor recogerá directamente al estudiante",
    icon: "Car",
    color: "blue",
    category: "pickup_change" as const,
    durationType: "single_day" as const,
    requiresApproval: false,
    affectsTrips: true,
    affectsRouteCalculation: false,
    evidenceRequired: false,
    evidenceOptional: false,
    reasonRequired: false,
    minAdvanceHours: 1,
  },
  {
    code: "authorized_pickup",
    name: "Recoge Persona Autorizada",
    description: "Una persona autorizada recogerá al estudiante",
    icon: "UserCheck",
    color: "blue",
    category: "pickup_change" as const,
    durationType: "single_day" as const,
    requiresApproval: true,
    affectsTrips: true,
    affectsRouteCalculation: false,
    evidenceRequired: false,
    evidenceOptional: true,
    reasonRequired: true,
    minAdvanceHours: 2,
  },

  // Cambios de parada
  {
    code: "stop_change_temp",
    name: "Cambio de Parada Temporal",
    description: "El estudiante será recogido/dejado en otra parada por hoy",
    icon: "MapPin",
    color: "purple",
    category: "stop_change" as const,
    durationType: "single_day" as const,
    requiresApproval: true,
    affectsTrips: true,
    affectsRouteCalculation: false,
    evidenceRequired: false,
    evidenceOptional: false,
    reasonRequired: true,
    minAdvanceHours: 4,
  },
  {
    code: "stop_change_perm",
    name: "Cambio de Parada Permanente",
    description: "El estudiante cambiará de parada de forma permanente",
    icon: "MapPinned",
    color: "purple",
    category: "stop_change" as const,
    durationType: "permanent" as const,
    requiresApproval: true,
    affectsTrips: true,
    affectsRouteCalculation: true,
    evidenceRequired: false,
    evidenceOptional: true,
    reasonRequired: true,
    minAdvanceHours: 24,
  },

  // Cambios de horario
  {
    code: "early_pickup",
    name: "Salida Temprana",
    description: "El estudiante saldrá antes del horario regular",
    icon: "Clock",
    color: "yellow",
    category: "time_change" as const,
    durationType: "single_day" as const,
    requiresApproval: true,
    affectsTrips: true,
    affectsRouteCalculation: false,
    evidenceRequired: false,
    evidenceOptional: true,
    reasonRequired: true,
    minAdvanceHours: 2,
  },
  {
    code: "late_arrival",
    name: "Llegada Tarde",
    description: "El estudiante llegará tarde al punto de recogida",
    icon: "AlarmClock",
    color: "yellow",
    category: "time_change" as const,
    durationType: "single_day" as const,
    requiresApproval: true,
    affectsTrips: true,
    affectsRouteCalculation: false,
    evidenceRequired: false,
    evidenceOptional: false,
    reasonRequired: true,
    minAdvanceHours: 1,
  },

  // Cambio de ubicación
  {
    code: "location_change",
    name: "Cambio de Domicilio",
    description: "El estudiante cambiará de dirección de residencia",
    icon: "Home",
    color: "indigo",
    category: "location_change" as const,
    durationType: "permanent" as const,
    requiresApproval: true,
    affectsTrips: true,
    affectsRouteCalculation: true,
    evidenceRequired: false,
    evidenceOptional: true,
    reasonRequired: true,
    minAdvanceHours: 48,
  },

  // Cambios de horario permanente
  {
    code: "schedule_change",
    name: "Cambio de Horario",
    description: "El estudiante cambiará su horario de servicio de forma permanente",
    icon: "Calendar",
    color: "green",
    category: "schedule_change" as const,
    durationType: "recurring" as const,
    requiresApproval: true,
    affectsTrips: true,
    affectsRouteCalculation: false,
    evidenceRequired: false,
    evidenceOptional: false,
    reasonRequired: true,
    minAdvanceHours: 48,
  },

  // Cambio de ruta
  {
    code: "route_change",
    name: "Cambio de Ruta",
    description: "El estudiante cambiará a una ruta diferente",
    icon: "Route",
    color: "orange",
    category: "route_change" as const,
    durationType: "permanent" as const,
    requiresApproval: true,
    affectsTrips: true,
    affectsRouteCalculation: true,
    evidenceRequired: false,
    evidenceOptional: false,
    reasonRequired: true,
    minAdvanceHours: 48,
  },

  // Suspensión de servicio
  {
    code: "service_suspension",
    name: "Suspensión de Servicio",
    description: "Suspensión temporal del servicio de transporte",
    icon: "Ban",
    color: "gray",
    category: "service_suspension" as const,
    durationType: "date_range" as const,
    requiresApproval: true,
    affectsTrips: true,
    affectsRouteCalculation: true,
    evidenceRequired: false,
    evidenceOptional: true,
    reasonRequired: true,
    minAdvanceHours: 24,
  },
];

/**
 * Seed default novedad types for a specific institution
 */
export const seedForInstitution = mutation({
  args: {
    institutionId: v.id("institutions"),
    skipExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, { institutionId, skipExisting = true }) => {
    const institution = await ctx.db.get(institutionId);
    if (!institution) {
      throw new Error("Institución no encontrada");
    }

    const results = {
      created: 0,
      skipped: 0,
      errors: [] as string[],
    };

    const now = Date.now();

    for (let i = 0; i < DEFAULT_NOVEDAD_TYPES.length; i++) {
      const typeData = DEFAULT_NOVEDAD_TYPES[i];
      if (!typeData) continue;

      // Check if type with this code already exists
      const existing = await ctx.db
        .query("novedadTypes")
        .withIndex("by_code", (q) =>
          q.eq("institutionId", institutionId).eq("code", typeData.code)
        )
        .first();

      if (existing) {
        if (skipExisting) {
          results.skipped++;
          continue;
        } else {
          // Update existing
          await ctx.db.patch(existing._id, {
            ...typeData,
            updatedAt: now,
          });
          results.skipped++;
          continue;
        }
      }

      try {
        await ctx.db.insert("novedadTypes", {
          institutionId,
          ...typeData,
          maxEvidenceFiles: typeData.evidenceRequired || typeData.evidenceOptional ? 5 : undefined,
          allowedFileTypes: typeData.allowedFileTypes ?? (typeData.evidenceRequired || typeData.evidenceOptional ? ["image/*", "application/pdf"] : undefined),
          isSystemType: true,
          isActive: true,
          sortOrder: i + 1,
          createdAt: now,
          updatedAt: now,
        });
        results.created++;
      } catch (error) {
        results.errors.push(
          `Error creating ${typeData.code}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
      }
    }

    return results;
  },
});

/**
 * Seed default novedad types for ALL institutions
 * Use with caution - typically run once during initial migration
 */
export const seedForAllInstitutions = mutation({
  args: {
    skipExisting: v.optional(v.boolean()),
  },
  handler: async (ctx, { skipExisting = true }) => {
    const institutions = await ctx.db.query("institutions").collect();

    const results = {
      institutionsProcessed: 0,
      totalCreated: 0,
      totalSkipped: 0,
      errors: [] as string[],
    };

    for (const institution of institutions) {
      const now = Date.now();

      for (let i = 0; i < DEFAULT_NOVEDAD_TYPES.length; i++) {
        const typeData = DEFAULT_NOVEDAD_TYPES[i];
        if (!typeData) continue;

        const existing = await ctx.db
          .query("novedadTypes")
          .withIndex("by_code", (q) =>
            q.eq("institutionId", institution._id).eq("code", typeData.code)
          )
          .first();

        if (existing) {
          results.totalSkipped++;
          continue;
        }

        try {
          await ctx.db.insert("novedadTypes", {
            institutionId: institution._id,
            ...typeData,
            maxEvidenceFiles: typeData.evidenceRequired || typeData.evidenceOptional ? 5 : undefined,
            allowedFileTypes: typeData.allowedFileTypes ?? (typeData.evidenceRequired || typeData.evidenceOptional ? ["image/*", "application/pdf"] : undefined),
            isSystemType: true,
            isActive: true,
            sortOrder: i + 1,
            createdAt: now,
            updatedAt: now,
          });
          results.totalCreated++;
        } catch (error) {
          results.errors.push(
            `Error for ${institution.name} - ${typeData.code}: ${error instanceof Error ? error.message : "Unknown error"}`
          );
        }
      }

      results.institutionsProcessed++;
    }

    return results;
  },
});
