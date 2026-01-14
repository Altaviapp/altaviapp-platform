/**
 * Authentication API
 *
 * Simple token-based authentication using Convex + PBKDF2 (Web Crypto API).
 * All auth endpoints in one place:
 * - register, login, logout
 * - me (get current user)
 * - password reset
 * - email verification
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api, internal } from "./_generated/api";
import {
  hashPassword,
  verifyPassword,
  isValidEmail,
  isValidPhone,
  isValidPassword,
} from "./lib/authUtils";
import {
  generateEmailVerificationToken,
  getTokenExpiration,
  isTokenExpired,
  isValidCodeFormat,
} from "./lib/tokenUtils";
import {
  generateEmailVerificationEmail,
  generatePasswordResetEmail,
} from "./lib/emailTemplates";
import { createSession, invalidateSession, invalidateAllSessions } from "./auth";

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Get app URL based on user role for email verification links
 */
function getAppUrlByRole(role: string): string {
  switch (role) {
    case "super_admin":
    case "admin":
      return process.env.ADMIN_APP_URL || "https://admin.altaviapp.com";
    case "parent":
      return process.env.PARENT_APP_URL || "https://padres.altaviapp.com";
    case "driver":
    case "monitor":
      return process.env.CREW_APP_URL || "https://crew.altaviapp.com";
    default:
      return process.env.PARENT_APP_URL || "https://padres.altaviapp.com";
  }
}

// ============================================================================
// REGISTER
// ============================================================================

/**
 * Register new user (direct registration, not via invitation)
 * Used for super_admin or self-registration flows
 */
export const register = mutation({
  args: {
    email: v.string(),
    password: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    role: v.optional(
      v.union(
        v.literal("super_admin"),
        v.literal("admin"),
        v.literal("monitor"),
        v.literal("driver"),
        v.literal("parent")
      )
    ),
    institutionId: v.optional(v.id("institutions")),
    clientId: v.optional(v.id("clients")),
  },
  handler: async (ctx, args) => {
    // Validate email
    if (!isValidEmail(args.email)) {
      throw new Error("Formato de email inválido");
    }

    // Validate password
    if (!isValidPassword(args.password)) {
      throw new Error("Contraseña debe tener mínimo 8 caracteres con letras y números");
    }

    // Validate phone if provided
    if (args.phone && !isValidPhone(args.phone)) {
      throw new Error("Formato de teléfono inválido. Usa: +593XXXXXXXXX");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existingUser) {
      throw new Error("Ya existe un usuario con este email");
    }

    // Hash password
    const passwordHash = await hashPassword(args.password);

    // Generate email verification token
    const emailVerificationToken = generateEmailVerificationToken();

    // Create user
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      clientId: args.clientId,
      institutionId: args.institutionId,
      email: args.email.toLowerCase(),
      passwordHash,
      emailVerified: false,
      emailVerificationToken,
      tokenExpiresAt: getTokenExpiration(24), // 24 hours
      name: args.name,
      role: args.role || "parent",
      accessibleInstitutionIds: args.institutionId ? [args.institutionId] : [],
      failedLoginAttempts: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Create session
    const token = await createSession(ctx, userId);

    // Get created user
    const user = await ctx.db.get(userId);

    // Schedule verification email to be sent via Resend
    const userRole = args.role || "parent";
    await ctx.scheduler.runAfter(0, api.email.sendVerificationEmail, {
      to: args.email.toLowerCase(),
      firstName: args.name.split(" ")[0] ?? args.name,
      verificationCode: emailVerificationToken,
      appUrl: getAppUrlByRole(userRole),
    });

    return {
      success: true,
      userId,
      token,
      user: {
        id: user!._id,
        email: user!.email,
        name: user!.name,
        role: user!.role,
        institutionId: user!.institutionId,
        emailVerified: user!.emailVerified,
      },
      emailSent: true,
    };
  },
});

// ============================================================================
// LOGIN
// ============================================================================

/**
 * Login user with email and password
 */
export const login = mutation({
  args: {
    email: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Email o contraseña incorrectos");
    }

    // Check if account is locked
    if (user.accountLockedUntil && user.accountLockedUntil > Date.now()) {
      const minutesLeft = Math.ceil((user.accountLockedUntil - Date.now()) / 60000);
      throw new Error(`Cuenta bloqueada. Intenta en ${minutesLeft} minutos.`);
    }

    // Check if user is active
    if (!user.isActive) {
      throw new Error("Cuenta desactivada. Contacta al administrador.");
    }

    // Verify password
    const isValid = await verifyPassword(args.password, user.passwordHash);

    if (!isValid) {
      // Increment failed attempts
      const failedAttempts = (user.failedLoginAttempts || 0) + 1;
      const updates: any = {
        failedLoginAttempts: failedAttempts,
        updatedAt: Date.now(),
      };

      // Lock account after 5 failed attempts (30 minutes)
      if (failedAttempts >= 5) {
        updates.accountLockedUntil = Date.now() + 30 * 60 * 1000;
      }

      await ctx.db.patch(user._id, updates);
      throw new Error("Email o contraseña incorrectos");
    }

    // Reset failed attempts on successful login
    await ctx.db.patch(user._id, {
      failedLoginAttempts: 0,
      accountLockedUntil: undefined,
      lastLogin: Date.now(),
      updatedAt: Date.now(),
    });

    // Create new session
    const token = await createSession(ctx, user._id);

    return {
      success: true,
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role,
        institutionId: user.institutionId,
        emailVerified: user.emailVerified,
      },
    };
  },
});

// ============================================================================
// GET CURRENT USER (ME)
// ============================================================================

/**
 * Get current user from token
 */
export const me = query({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.token) {
      return { success: false, user: null };
    }

    // Find active session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!session) {
      return { success: false, user: null, error: "Sesión no encontrada" };
    }

    // Check expiration
    if (session.expiresAt < Date.now()) {
      return { success: false, user: null, error: "Sesión expirada" };
    }

    // Get user
    const user = await ctx.db.get(session.userId);

    if (!user) {
      return { success: false, user: null, error: "Usuario no encontrado" };
    }

    if (!user.isActive) {
      return { success: false, user: null, error: "Cuenta desactivada" };
    }

    return {
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        institutionId: user.institutionId,
        clientId: user.clientId,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
      },
    };
  },
});

// ============================================================================
// TOUCH SESSION (update lastUsedAt)
// ============================================================================

/**
 * Update session's lastUsedAt timestamp
 * Called on token verification to track session activity
 */
export const touchSession = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    if (!args.token) {
      return { success: false };
    }

    // Find active session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!session) {
      return { success: false };
    }

    // Update lastUsedAt
    await ctx.db.patch(session._id, {
      lastUsedAt: Date.now(),
    });

    return { success: true };
  },
});

// ============================================================================
// LOGOUT
// ============================================================================

/**
 * Logout - invalidate current session
 */
export const logout = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    await invalidateSession(ctx, args.token);

    return {
      success: true,
      message: "Sesión cerrada exitosamente",
    };
  },
});

/**
 * Logout everywhere - invalidate all sessions
 */
export const logoutAll = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user from token first
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .first();

    if (!session) {
      throw new Error("Sesión no encontrada");
    }

    await invalidateAllSessions(ctx, session.userId);

    return {
      success: true,
      message: "Todas las sesiones cerradas",
    };
  },
});

// ============================================================================
// EMAIL VERIFICATION
// ============================================================================

/**
 * Verify email with 6-digit code (requires session)
 */
export const verifyEmail = mutation({
  args: {
    token: v.string(), // Session token
    verificationCode: v.string(), // 6-digit code
  },
  handler: async (ctx, args) => {
    // Validate code format
    if (!isValidCodeFormat(args.verificationCode)) {
      throw new Error("Código inválido. Debe tener 6 dígitos.");
    }

    // Get user from session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!session) {
      throw new Error("Sesión no encontrada");
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Check if already verified
    if (user.emailVerified) {
      return { success: true, message: "Email ya verificado" };
    }

    // Check verification code
    if (user.emailVerificationToken !== args.verificationCode) {
      throw new Error("Código de verificación incorrecto");
    }

    // Check expiration
    if (user.tokenExpiresAt && isTokenExpired(user.tokenExpiresAt)) {
      throw new Error("Código expirado. Solicita uno nuevo.");
    }

    // Mark as verified
    await ctx.db.patch(user._id, {
      emailVerified: true,
      emailVerifiedAt: Date.now(),
      emailVerificationToken: undefined,
      tokenExpiresAt: undefined,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Email verificado exitosamente",
    };
  },
});

/**
 * Resend verification email
 */
export const resendVerificationEmail = mutation({
  args: {
    token: v.string(), // Session token
  },
  handler: async (ctx, args) => {
    // Get user from session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!session) {
      throw new Error("Sesión no encontrada");
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    if (user.emailVerified) {
      return { success: true, message: "Email ya verificado" };
    }

    // Generate new token
    const verificationToken = generateEmailVerificationToken();

    await ctx.db.patch(user._id, {
      emailVerificationToken: verificationToken,
      tokenExpiresAt: getTokenExpiration(24),
      updatedAt: Date.now(),
    });

    // Schedule verification email to be sent via Resend
    await ctx.scheduler.runAfter(0, api.email.sendVerificationEmail, {
      to: user.email,
      firstName: user.firstName ?? user.name.split(" ")[0] ?? user.name,
      verificationCode: verificationToken,
      appUrl: getAppUrlByRole(user.role),
    });

    return {
      success: true,
      emailSent: true,
    };
  },
});

/**
 * Verify email via URL (no session required)
 * Used when user clicks verification button in email
 */
export const verifyEmailByUrl = mutation({
  args: {
    email: v.string(),
    code: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate code format
    if (!isValidCodeFormat(args.code)) {
      throw new Error("Código inválido. Debe tener 6 dígitos.");
    }

    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Check if already verified
    if (user.emailVerified) {
      return { success: true, message: "Email ya verificado" };
    }

    // Check verification code
    if (user.emailVerificationToken !== args.code) {
      throw new Error("Código de verificación incorrecto");
    }

    // Check expiration
    if (user.tokenExpiresAt && isTokenExpired(user.tokenExpiresAt)) {
      throw new Error("Código expirado. Solicita uno nuevo.");
    }

    // Mark as verified
    await ctx.db.patch(user._id, {
      emailVerified: true,
      emailVerifiedAt: Date.now(),
      emailVerificationToken: undefined,
      tokenExpiresAt: undefined,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Email verificado exitosamente",
    };
  },
});

// ============================================================================
// PASSWORD RESET
// ============================================================================

/**
 * Request password reset (send email with code)
 */
export const requestPasswordReset = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Always return success to prevent email enumeration
    const successResponse = {
      success: true,
      message: "Si el email existe, recibirás un código para restablecer tu contraseña.",
    };

    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      return successResponse;
    }

    if (!user.isActive) {
      return successResponse;
    }

    // Generate reset token (reuse verification token field)
    const resetToken = generateEmailVerificationToken();

    await ctx.db.patch(user._id, {
      emailVerificationToken: resetToken,
      tokenExpiresAt: getTokenExpiration(1), // 1 hour for password reset
      updatedAt: Date.now(),
    });

    // Schedule password reset email to be sent via Resend
    await ctx.scheduler.runAfter(0, api.email.sendPasswordResetEmail, {
      to: user.email,
      firstName: user.firstName ?? user.name.split(" ")[0] ?? user.name,
      resetCode: resetToken,
    });

    return {
      success: true,
      message: "Si el email existe, recibirás un código para restablecer tu contraseña.",
      emailSent: true,
    };
  },
});

/**
 * Reset password with code
 */
export const resetPassword = mutation({
  args: {
    email: v.string(),
    resetCode: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate code format
    if (!isValidCodeFormat(args.resetCode)) {
      throw new Error("Código inválido. Debe tener 6 dígitos.");
    }

    // Validate password
    if (!isValidPassword(args.newPassword)) {
      throw new Error("Contraseña debe tener mínimo 8 caracteres con letras y números");
    }

    // Find user
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Código inválido o expirado");
    }

    // Check reset code
    if (user.emailVerificationToken !== args.resetCode) {
      throw new Error("Código inválido o expirado");
    }

    // Check expiration
    if (user.tokenExpiresAt && isTokenExpired(user.tokenExpiresAt)) {
      throw new Error("Código expirado. Solicita uno nuevo.");
    }

    // Hash new password
    const passwordHash = await hashPassword(args.newPassword);

    // Update password and clear token
    await ctx.db.patch(user._id, {
      passwordHash,
      emailVerificationToken: undefined,
      tokenExpiresAt: undefined,
      failedLoginAttempts: 0,
      accountLockedUntil: undefined,
      updatedAt: Date.now(),
    });

    // Invalidate all sessions (security measure)
    await invalidateAllSessions(ctx, user._id);

    return {
      success: true,
      message: "Contraseña restablecida exitosamente. Inicia sesión.",
    };
  },
});

// ============================================================================
// CHANGE PASSWORD (authenticated)
// ============================================================================

/**
 * Change password (requires current password)
 */
export const changePassword = mutation({
  args: {
    token: v.string(),
    currentPassword: v.string(),
    newPassword: v.string(),
  },
  handler: async (ctx, args) => {
    // Get user from session
    const session = await ctx.db
      .query("sessions")
      .withIndex("by_token", (q) => q.eq("token", args.token))
      .filter((q) => q.eq(q.field("isActive"), true))
      .first();

    if (!session) {
      throw new Error("Sesión no encontrada");
    }

    const user = await ctx.db.get(session.userId);
    if (!user) {
      throw new Error("Usuario no encontrado");
    }

    // Verify current password
    const isValid = await verifyPassword(args.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new Error("Contraseña actual incorrecta");
    }

    // Validate new password
    if (!isValidPassword(args.newPassword)) {
      throw new Error("Nueva contraseña debe tener mínimo 8 caracteres con letras y números");
    }

    // Hash new password
    const passwordHash = await hashPassword(args.newPassword);

    // Update password
    await ctx.db.patch(user._id, {
      passwordHash,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Contraseña actualizada exitosamente",
    };
  },
});

// ============================================================================
// INSTITUTION REGISTRATION (Signup Flow)
// ============================================================================

/**
 * Register new institution with admin user
 * Creates client + institution + admin user in one transaction
 * Used for the signup flow (plans page -> signup page)
 */
export const registerInstitution = mutation({
  args: {
    // Admin user info
    firstName: v.string(),
    lastName: v.string(),
    email: v.string(),
    password: v.string(),
    // Institution info
    institutionName: v.string(),
    institutionType: v.union(v.literal("school"), v.literal("corporate")),
    institutionAddress: v.string(),
    institutionCity: v.string(),
    institutionCountry: v.optional(v.string()), // 'EC' | 'CO' - default 'EC'
    institutionDepartment: v.optional(v.string()), // Province/Department code
    // Subscription plan
    plan: v.union(
      v.literal("basic"),
      v.literal("professional"),
      v.literal("enterprise")
    ),
  },
  handler: async (ctx, args) => {
    // Validate email
    if (!isValidEmail(args.email)) {
      throw new Error("Formato de email inválido");
    }

    // Validate password
    if (!isValidPassword(args.password)) {
      throw new Error("Contraseña debe tener mínimo 8 caracteres con letras y números");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (existingUser) {
      throw new Error("Ya existe un usuario con este email");
    }

    const now = Date.now();

    // 1. Create client (organization that owns the institution)
    const planLimits = {
      basic: { maxInstitutions: 1, maxUsers: 10 },
      professional: { maxInstitutions: 3, maxUsers: 50 },
      enterprise: { maxInstitutions: 10, maxUsers: 500 },
    };

    const limits = planLimits[args.plan];

    const country = args.institutionCountry || "EC";
    const department = args.institutionDepartment || "";

    const clientId = await ctx.db.insert("clients", {
      name: args.institutionName,
      contactPerson: `${args.firstName} ${args.lastName}`,
      contactEmail: args.email.toLowerCase(),
      address: args.institutionAddress,
      city: args.institutionCity,
      province: department || args.institutionCity, // Use department if provided
      country,
      subscriptionPlan: args.plan,
      subscriptionStatus: "active",
      maxInstitutions: limits.maxInstitutions,
      maxUsers: limits.maxUsers,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // 2. Create institution
    const institutionId = await ctx.db.insert("institutions", {
      clientId,
      name: args.institutionName,
      type: args.institutionType,
      address: args.institutionAddress,
      city: args.institutionCity,
      country,
      department,
      email: args.email.toLowerCase(),
      contactPerson: `${args.firstName} ${args.lastName}`,
      isActive: true,
      subscriptionPlan: args.plan,
      subscriptionStatus: "active",
      createdAt: now,
      updatedAt: now,
    });

    // 3. Create admin user
    const passwordHash = await hashPassword(args.password);
    const emailVerificationToken = generateEmailVerificationToken();

    const userId = await ctx.db.insert("users", {
      clientId,
      institutionId,
      email: args.email.toLowerCase(),
      passwordHash,
      emailVerified: false,
      emailVerificationToken,
      tokenExpiresAt: getTokenExpiration(24), // 24 hours
      name: `${args.firstName} ${args.lastName}`,
      firstName: args.firstName,
      lastName: args.lastName,
      role: "admin",
      accessibleInstitutionIds: [institutionId],
      failedLoginAttempts: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // 4. Create session
    const token = await createSession(ctx, userId);

    // 5. Schedule verification email to be sent via Resend
    await ctx.scheduler.runAfter(0, api.email.sendVerificationEmail, {
      to: args.email.toLowerCase(),
      firstName: args.firstName,
      verificationCode: emailVerificationToken,
      appUrl: getAppUrlByRole("admin"),
    });

    return {
      success: true,
      clientId,
      institutionId,
      userId,
      token,
      user: {
        id: userId,
        email: args.email.toLowerCase(),
        name: `${args.firstName} ${args.lastName}`,
        role: "admin" as const,
        institutionId,
        emailVerified: false,
      },
      emailSent: true,
    };
  },
});
