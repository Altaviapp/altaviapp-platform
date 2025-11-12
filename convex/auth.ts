/**
 * Authentication Helper Functions
 *
 * Provides utilities for:
 * - Getting authenticated user
 * - Role-based access control (RBAC)
 * - Multi-tenancy enforcement
 */

import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Role hierarchy levels for RBAC
 */
export const ROLE_LEVELS = {
  super_admin: 1000,
  admin: 500,
  driver: 100,
  parent: 10,
} as const;

export type UserRole = keyof typeof ROLE_LEVELS;

/**
 * Get the current authenticated user from Clerk
 * Returns null if not authenticated
 */
export async function getCurrentUser(ctx: QueryCtx | MutationCtx) {
  const identity = await ctx.auth.getUserIdentity();

  if (!identity) {
    return null;
  }

  // Find user by Clerk ID
  const user = await ctx.db
    .query("users")
    .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
    .first();

  return user;
}

/**
 * Get the current authenticated user or throw error
 * Use this when authentication is required
 */
export async function requireAuth(ctx: QueryCtx | MutationCtx) {
  const user = await getCurrentUser(ctx);

  if (!user) {
    throw new Error("Authentication required. User not found.");
  }

  if (!user.isActive) {
    throw new Error("User account is inactive.");
  }

  return user;
}

/**
 * Check if user has required role level or higher
 */
export function hasRole(userRole: UserRole, requiredRole: UserRole): boolean {
  return ROLE_LEVELS[userRole] >= ROLE_LEVELS[requiredRole];
}

/**
 * Require user to have minimum role level
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  requiredRole: UserRole
) {
  const user = await requireAuth(ctx);

  if (!hasRole(user.role, requiredRole)) {
    throw new Error(
      `Access denied. Required role: ${requiredRole}, user role: ${user.role}`
    );
  }

  return user;
}

/**
 * Verify user has access to specific institution
 * Super admins have access to all institutions
 */
export async function requireInstitutionAccess(
  ctx: QueryCtx | MutationCtx,
  institutionId: Id<"institutions">
) {
  const user = await requireAuth(ctx);

  // Super admins can access all institutions
  if (user.role === "super_admin") {
    return user;
  }

  // Check if user belongs to this institution
  if (user.institutionId !== institutionId) {
    throw new Error("Access denied. User does not have access to this institution.");
  }

  return user;
}

/**
 * Get user's institution ID
 * Throws error if user doesn't have institution (shouldn't happen for non-super_admin)
 */
export async function getUserInstitutionId(
  ctx: QueryCtx | MutationCtx
): Promise<Id<"institutions">> {
  const user = await requireAuth(ctx);

  if (!user.institutionId) {
    throw new Error("User does not have an associated institution.");
  }

  return user.institutionId;
}

/**
 * Verify query is scoped to user's institution (multi-tenancy)
 * Super admins can query across all institutions if institutionId is not provided
 */
export async function enforceInstitutionScope(
  ctx: QueryCtx | MutationCtx,
  institutionId?: Id<"institutions">
): Promise<Id<"institutions"> | null> {
  const user = await requireAuth(ctx);

  // Super admin can query all institutions
  if (user.role === "super_admin") {
    return institutionId || null;
  }

  // Non-super admin must query their own institution only
  if (!user.institutionId) {
    throw new Error("User does not have an associated institution.");
  }

  // If institutionId is provided, verify it matches user's institution
  if (institutionId && institutionId !== user.institutionId) {
    throw new Error("Access denied. Cannot access data from other institutions.");
  }

  return user.institutionId;
}
