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

// SIMPLIFIED: 5 core novedad types
// Each category has a specific workflow and affects trips differently
const DEFAULT_NOVEDAD_TYPES = [
  // 1. AUSENCIA - El estudiante no viaja
  {
    code: "absence", // DEPRECATED - code field will be removed
    name: "Ausencia",
    description: "El estudiante no viajará en la fecha indicada",
    icon: "UserMinus",
    color: "red",
    category: "absence" as const,
    durationType: "single_day" as const,
    requiresApproval: false, // Ausencias no requieren aprobación por defecto
    affectsTrips: true,
    affectsRouteCalculation: true,
    evidenceRequired: false,
    evidenceOptional: true,
    reasonRequired: false, // Opcional dar razón
    minAdvanceHours: 2,
  },

  // 2. RECOGIDA POR TERCERO - Otra persona recibe al estudiante en la parada
  {
    code: "third_party_pickup",
    name: "Recogida por Tercero",
    description: "Una persona autorizada recibirá al estudiante en la parada (no el tutor)",
    icon: "UserCheck",
    color: "blue",
    category: "third_party_pickup" as const,
    durationType: "single_day" as const,
    requiresApproval: true, // Requiere verificar la persona autorizada
    affectsTrips: true,
    affectsRouteCalculation: false,
    evidenceRequired: false,
    evidenceOptional: false,
    reasonRequired: true, // Debe indicar nombre y teléfono de la persona
    minAdvanceHours: 2,
  },

  // 3. CAMBIO DE PARADA TEMPORAL - Ubicación diferente para fechas específicas
  {
    code: "temporary_stop_change",
    name: "Cambio de Parada Temporal",
    description: "El estudiante será recogido/dejado en una ubicación diferente temporalmente",
    icon: "MapPin",
    color: "purple",
    category: "temporary_stop_change" as const,
    durationType: "single_day" as const,
    requiresApproval: true, // Requiere aprobar la nueva ubicación
    affectsTrips: true,
    affectsRouteCalculation: true, // Puede afectar la ruta
    evidenceRequired: false,
    evidenceOptional: false,
    reasonRequired: true,
    minAdvanceHours: 24, // 24 horas mínimo para poder planificar
  },

  // 4. CAMBIO DE DOMICILIO - Cambio permanente de dirección
  {
    code: "address_change",
    name: "Cambio de Domicilio",
    description: "El estudiante cambiará de dirección de residencia de forma permanente",
    icon: "Home",
    color: "indigo",
    category: "address_change" as const,
    durationType: "permanent" as const,
    requiresApproval: true, // Requiere aprobar y posiblemente reasignar ruta
    affectsTrips: true,
    affectsRouteCalculation: true,
    evidenceRequired: false,
    evidenceOptional: true,
    reasonRequired: true,
    minAdvanceHours: 48, // 48 horas para planificar cambio de ruta
  },

  // 5. SUSPENSIÓN TEMPORAL - Pausa del servicio por un período
  {
    code: "service_suspension",
    name: "Suspensión Temporal de Servicio",
    description: "Pausar el servicio de transporte por un período determinado",
    icon: "Ban",
    color: "gray",
    category: "service_suspension" as const,
    durationType: "date_range" as const,
    requiresApproval: false, // No requiere aprobación, es decisión del padre
    affectsTrips: true,
    affectsRouteCalculation: true,
    evidenceRequired: false,
    evidenceOptional: true,
    reasonRequired: true, // Debe indicar el motivo
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

      // Check if type with this name already exists (replaced code check with name)
      const existing = await ctx.db
        .query("novedadTypes")
        .withIndex("by_institution", (q) =>
          q.eq("institutionId", institutionId)
        )
        .filter((q) => q.eq(q.field("name"), typeData.name))
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
          allowedFileTypes: typeData.evidenceRequired || typeData.evidenceOptional ? ["image/*", "application/pdf"] : undefined,
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

        // Check by name instead of code (code is deprecated)
        const existing = await ctx.db
          .query("novedadTypes")
          .withIndex("by_institution", (q) =>
            q.eq("institutionId", institution._id)
          )
          .filter((q) => q.eq(q.field("name"), typeData.name))
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
            allowedFileTypes: typeData.evidenceRequired || typeData.evidenceOptional ? ["image/*", "application/pdf"] : undefined,
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
