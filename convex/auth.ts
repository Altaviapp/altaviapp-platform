/**
 * Authentication Helper Functions
 *
 * Simple token-based authentication using Convex + PBKDF2 (Web Crypto API).
 * No external auth providers - everything runs on Convex.
 *
 * Provides:
 * - Token-based session validation
 * - Role-based access control (RBAC)
 * - Multi-tenancy enforcement
 */

import { QueryCtx, MutationCtx } from "./_generated/server";
import { Id } from "./_generated/dataModel";

/**
 * Role hierarchy levels for RBAC
 * Higher level = more permissions
 */
export const ROLE_LEVELS = {
  super_admin: 1000,
  admin: 500,
  monitor: 150,
  driver: 100,
  parent: 10,
} as const;

export type UserRole = keyof typeof ROLE_LEVELS;

/**
 * Get user from session token
 * Returns null if token is invalid or session expired
 */
export async function getUserFromToken(
  ctx: QueryCtx | MutationCtx,
  token: string
): Promise<{
  _id: Id<"users">;
  email: string;
  name: string;
  role: UserRole;
  institutionId?: Id<"institutions">;
  clientId?: Id<"clients">;
  isActive: boolean;
} | null> {
  if (!token) return null;

  // Find active session
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .filter((q) => q.eq(q.field("isActive"), true))
    .first();

  if (!session) return null;

  // Check expiration
  if (session.expiresAt < Date.now()) {
    return null;
  }

  // Get user
  const user = await ctx.db.get(session.userId);
  if (!user || !user.isActive) return null;

  return {
    _id: user._id,
    email: user.email,
    name: user.name,
    role: user.role as UserRole,
    institutionId: user.institutionId,
    clientId: user.clientId,
    isActive: user.isActive,
  };
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(
  ctx: QueryCtx | MutationCtx,
  token: string
) {
  const user = await getUserFromToken(ctx, token);

  if (!user) {
    throw new Error("Autenticación requerida. Inicia sesión.");
  }

  if (!user.isActive) {
    throw new Error("Cuenta desactivada. Contacta al administrador.");
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
 * Require minimum role level
 */
export async function requireRole(
  ctx: QueryCtx | MutationCtx,
  token: string,
  requiredRole: UserRole
) {
  const user = await requireAuth(ctx, token);

  if (!hasRole(user.role, requiredRole)) {
    throw new Error(
      `Acceso denegado. Rol requerido: ${requiredRole}, tu rol: ${user.role}`
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
  token: string,
  institutionId: Id<"institutions">
) {
  const user = await requireAuth(ctx, token);

  // Super admins can access all institutions
  if (user.role === "super_admin") {
    return user;
  }

  // Check if user belongs to this institution
  if (user.institutionId !== institutionId) {
    throw new Error("Acceso denegado. No tienes acceso a esta institución.");
  }

  return user;
}

/**
 * Get user's institution ID
 * Throws if user doesn't have institution
 */
export async function getUserInstitutionId(
  ctx: QueryCtx | MutationCtx,
  token: string
): Promise<Id<"institutions">> {
  const user = await requireAuth(ctx, token);

  if (!user.institutionId) {
    throw new Error("Usuario sin institución asignada.");
  }

  return user.institutionId;
}

/**
 * Enforce institution scope for queries (multi-tenancy)
 * Super admins can query all institutions if institutionId not provided
 */
export async function enforceInstitutionScope(
  ctx: QueryCtx | MutationCtx,
  token: string,
  institutionId?: Id<"institutions">
): Promise<Id<"institutions"> | null> {
  const user = await requireAuth(ctx, token);

  // Super admin can query all institutions
  if (user.role === "super_admin") {
    return institutionId || null;
  }

  // Non-super admin must query their own institution only
  if (!user.institutionId) {
    throw new Error("Usuario sin institución asignada.");
  }

  // If institutionId provided, verify it matches user's institution
  if (institutionId && institutionId !== user.institutionId) {
    throw new Error("Acceso denegado. No puedes acceder a otras instituciones.");
  }

  return user.institutionId;
}

/**
 * Create new session for user
 */
export async function createSession(
  ctx: MutationCtx,
  userId: Id<"users">,
  options?: {
    userAgent?: string;
    ipAddress?: string;
    expirationDays?: number;
  }
): Promise<string> {
  const now = Date.now();
  const expirationDays = options?.expirationDays || 30;

  // Generate token
  const random = Math.random().toString(36).substring(2, 15);
  const token = `session_${userId}_${now}_${random}`;

  await ctx.db.insert("sessions", {
    userId,
    token,
    expiresAt: now + expirationDays * 24 * 60 * 60 * 1000,
    lastUsedAt: now,
    userAgent: options?.userAgent,
    ipAddress: options?.ipAddress,
    isActive: true,
    createdAt: now,
  });

  return token;
}

/**
 * Invalidate session (logout)
 */
export async function invalidateSession(
  ctx: MutationCtx,
  token: string
): Promise<void> {
  const session = await ctx.db
    .query("sessions")
    .withIndex("by_token", (q) => q.eq("token", token))
    .first();

  if (session) {
    await ctx.db.patch(session._id, {
      isActive: false,
      revokedAt: Date.now(),
    });
  }
}

/**
 * Invalidate all sessions for user (logout everywhere)
 */
export async function invalidateAllSessions(
  ctx: MutationCtx,
  userId: Id<"users">
): Promise<void> {
  const sessions = await ctx.db
    .query("sessions")
    .withIndex("by_user", (q) => q.eq("userId", userId))
    .filter((q) => q.eq(q.field("isActive"), true))
    .collect();

  const now = Date.now();
  for (const session of sessions) {
    await ctx.db.patch(session._id, {
      isActive: false,
      revokedAt: now,
    });
  }
}
