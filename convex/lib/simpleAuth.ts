/**
 * Simple Authentication Helpers
 *
 * Auth verification by userId (used internally after token validation).
 * Frontend passes userId from session token.
 *
 * Role hierarchy:
 * - super_admin (1000): Platform-wide access
 * - admin/coordinador (500): Institution management
 * - monitor (150): Student check-in/out, incidents
 * - driver (100): Trip operations
 * - parent (10): Read-only, own students
 */

import { Id } from "../_generated/dataModel";
import { QueryCtx, MutationCtx } from "../_generated/server";
import { Doc } from "../_generated/dataModel";

export type Role = "super_admin" | "admin" | "monitor" | "driver" | "parent";

export const ROLES: Record<Role, number> = {
  super_admin: 1000,
  admin: 500,
  monitor: 150,
  driver: 100,
  parent: 10,
};

// UI-friendly role names (Spanish)
export const ROLE_DISPLAY_NAMES: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Coordinador",
  monitor: "Auxiliar",
  driver: "Conductor",
  parent: "Padre/Tutor",
};

/**
 * Verify user exists and is active
 */
export async function verifyUser(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
) {
  const user = await ctx.db.get(userId);

  if (!user) {
    throw new Error("Usuario no encontrado");
  }

  if (!user.isActive) {
    throw new Error("Usuario inactivo");
  }

  return user;
}

/**
 * Verify user has required role or higher
 */
export async function verifyRole(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  requiredRole: Role
) {
  const user = await verifyUser(ctx, userId);

  if (ROLES[user.role] < ROLES[requiredRole]) {
    throw new Error(
      `Permisos insuficientes. Requiere rol: ${requiredRole}, tiene: ${user.role}`
    );
  }

  return user;
}

/**
 * Verify user has access to institution
 */
export async function verifyInstitutionAccess(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  institutionId: Id<"institutions">
) {
  const user = await verifyUser(ctx, userId);

  // Super admin has access to all institutions
  if (user.role === "super_admin") {
    return user;
  }

  // Check if user has access to this institution
  if (!user.accessibleInstitutionIds.includes(institutionId)) {
    throw new Error("No tienes acceso a esta institución");
  }

  return user;
}

/**
 * Verify user has access to client
 */
export async function verifyClientAccess(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  clientId: Id<"clients">
) {
  const user = await verifyUser(ctx, userId);

  // Super admin has access to all clients
  if (user.role === "super_admin") {
    return user;
  }

  // Check if user belongs to this client
  if (user.clientId !== clientId) {
    throw new Error("No tienes acceso a este cliente");
  }

  return user;
}

/**
 * Quick check: Is user admin or super_admin?
 */
export async function isAdminOrHigher(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
): Promise<boolean> {
  const user = await verifyUser(ctx, userId);
  return ROLES[user.role] >= ROLES.admin;
}

/**
 * Quick check: Is user super_admin?
 */
export async function isSuperAdmin(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
): Promise<boolean> {
  const user = await verifyUser(ctx, userId);
  return user.role === "super_admin";
}

// ============================================
// CREW APP PERMISSION HELPERS
// ============================================

/**
 * Check if user is a crew member (driver or monitor)
 */
export async function isCrewMember(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
): Promise<boolean> {
  const user = await verifyUser(ctx, userId);
  return user.role === "driver" || user.role === "monitor";
}

/**
 * Check if user can control trip lifecycle (start/end)
 * Only drivers (and admins) can start/end trips
 */
export async function canControlTrip(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
): Promise<boolean> {
  const user = await verifyUser(ctx, userId);
  return user.role === "driver" || ROLES[user.role] >= ROLES.admin;
}

/**
 * Check if user can access vehicle checklist
 * Only drivers (and admins) complete pre-trip checklist
 */
export async function canAccessChecklist(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
): Promise<boolean> {
  const user = await verifyUser(ctx, userId);
  return user.role === "driver" || ROLES[user.role] >= ROLES.admin;
}

/**
 * Check if user can perform check-in/out operations
 * Monitors always can, drivers only if no monitor assigned to trip
 */
export async function canPerformCheckin(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">,
  tripMonitorId: Id<"monitors"> | null | undefined
): Promise<boolean> {
  const user = await verifyUser(ctx, userId);

  // Monitor can always perform check-in
  if (user.role === "monitor") return true;

  // Admin and super_admin can always perform check-in
  if (ROLES[user.role] >= ROLES.admin) return true;

  // Driver can only perform check-in if no monitor is assigned (fallback)
  if (user.role === "driver" && !tripMonitorId) return true;

  return false;
}

/**
 * Check if user can report incidents
 * Monitors and admins can report incidents
 */
export async function canReportIncident(
  ctx: QueryCtx | MutationCtx,
  userId: Id<"users">
): Promise<boolean> {
  const user = await verifyUser(ctx, userId);
  return ROLES[user.role] >= ROLES.monitor;
}

/**
 * Get role level for a user
 */
export function getRoleLevel(role: Role): number {
  return ROLES[role];
}

/**
 * Check if one role is higher or equal to another
 */
export function hasMinimumRole(userRole: Role, requiredRole: Role): boolean {
  return ROLES[userRole] >= ROLES[requiredRole];
}
