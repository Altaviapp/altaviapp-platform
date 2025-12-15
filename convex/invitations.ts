/**
 * Invitations API
 *
 * Manages user invitations for parents, drivers, and admins.
 * Following Alquemist pattern: Backend generates emails, Frontend sends.
 *
 * Features:
 * - Create individual invitations
 * - Bulk create from CSV
 * - Verify invitation codes
 * - Accept invitations (create user)
 * - List/cancel invitations
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import { Id } from "./_generated/dataModel";
import {
  generateInvitationCode,
  getTokenExpiration,
  isTokenExpired,
  isValidCodeFormat,
} from "./lib/tokenUtils";
import { generateInvitationEmail } from "./lib/emailTemplates";
import {
  isValidEmail,
  isValidPhone,
  isValidPassword,
  hashPassword,
} from "./lib/authUtils";
import { generateEmailVerificationToken } from "./lib/tokenUtils";
import { generateEmailVerificationEmail } from "./lib/emailTemplates";
import { verifyRole, verifyInstitutionAccess } from "./lib/simpleAuth";

/**
 * Create individual invitation
 * Admin creates invitation for parent/driver/admin
 */
export const createInvitation = mutation({
  args: {
    userId: v.id("users"), // Current user (from Bubble backend_user_id)
    institutionId: v.id("institutions"),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.union(
      v.literal("parent"),
      v.literal("driver"),
      v.literal("monitor"),
      v.literal("admin")
    ),
  },
  handler: async (ctx, args) => {
    // Verify user is admin or super_admin
    const currentUser = await verifyRole(ctx, args.userId, "admin");

    // Verify user has access to this institution
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    // Validate email
    if (!isValidEmail(args.email)) {
      throw new Error("Formato de email inválido");
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

    // Check if there's already a pending invitation
    const existingInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvitation) {
      throw new Error("Ya existe una invitación pendiente para este email");
    }

    // Generate unique invitation code
    let invitationCode = generateInvitationCode();
    let attempts = 0;
    while (attempts < 10) {
      const existingCode = await ctx.db
        .query("invitations")
        .withIndex("by_code", (q) => q.eq("invitationCode", invitationCode))
        .first();

      if (!existingCode) break;
      invitationCode = generateInvitationCode();
      attempts++;
    }

    if (attempts >= 10) {
      throw new Error("No se pudo generar un código único. Intenta de nuevo.");
    }

    // Get institution name for email
    const institution = await ctx.db.get(args.institutionId);
    if (!institution) {
      throw new Error("Institución no encontrada");
    }

    // Create invitation
    const now = Date.now();
    const invitationId = await ctx.db.insert("invitations", {
      institutionId: args.institutionId,
      role: args.role,
      email: args.email.toLowerCase(),
      firstName: args.firstName,
      lastName: args.lastName,
      phone: args.phone,
      invitationCode,
      codeExpiresAt: getTokenExpiration(168), // 7 days
      createdBy: args.userId,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Schedule invitation email to be sent via Resend
    await ctx.scheduler.runAfter(0, api.email.sendInvitationEmail, {
      to: args.email.toLowerCase(),
      firstName: args.firstName || "Usuario",
      invitationCode,
      role: args.role,
      institutionName: institution.name,
    });

    return {
      success: true,
      invitationId,
      invitationCode,
      email: args.email,
      emailSent: true,
    };
  },
});

/**
 * Create bulk invitations from CSV
 * Admin uploads CSV with multiple users
 */
export const createBulkInvitations = mutation({
  args: {
    userId: v.id("users"), // Current user (from Bubble backend_user_id)
    institutionId: v.id("institutions"),
    invitations: v.array(
      v.object({
        email: v.string(),
        firstName: v.optional(v.string()),
        lastName: v.optional(v.string()),
        phone: v.optional(v.string()),
        role: v.union(
          v.literal("parent"),
          v.literal("driver"),
          v.literal("monitor"),
          v.literal("admin")
        ),
      })
    ),
  },
  handler: async (ctx, args) => {
    // Verify user is admin or super_admin
    const currentUser = await verifyRole(ctx, args.userId, "admin");

    // Verify user has access to this institution
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    // Limit bulk operations
    if (args.invitations.length > 100) {
      throw new Error("Máximo 100 invitaciones por lote");
    }

    // Get institution
    const institution = await ctx.db.get(args.institutionId);
    if (!institution) {
      throw new Error("Institución no encontrada");
    }

    // Generate unique bulk import ID
    const bulkImportId = `bulk_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const results = [];
    const errors = [];

    for (const inv of args.invitations) {
      try {
        // Validate email
        if (!isValidEmail(inv.email)) {
          errors.push({ email: inv.email, error: "Email inválido" });
          continue;
        }

        // Check if user exists
        const existingUser = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", inv.email.toLowerCase()))
          .first();

        if (existingUser) {
          errors.push({ email: inv.email, error: "Usuario ya existe" });
          continue;
        }

        // Check pending invitation
        const existingInvitation = await ctx.db
          .query("invitations")
          .withIndex("by_email", (q) => q.eq("email", inv.email.toLowerCase()))
          .filter((q) => q.eq(q.field("status"), "pending"))
          .first();

        if (existingInvitation) {
          errors.push({ email: inv.email, error: "Invitación ya existe" });
          continue;
        }

        // Generate code
        const invitationCode = generateInvitationCode();

        // Create invitation
        const now = Date.now();
        const invitationId = await ctx.db.insert("invitations", {
          institutionId: args.institutionId,
          role: inv.role,
          email: inv.email.toLowerCase(),
          firstName: inv.firstName,
          lastName: inv.lastName,
          phone: inv.phone,
          invitationCode,
          codeExpiresAt: getTokenExpiration(168), // 7 days
          createdBy: args.userId,
          status: "pending",
          bulkImportId,
          createdAt: now,
          updatedAt: now,
        });

        // Schedule invitation email to be sent via Resend
        await ctx.scheduler.runAfter(0, api.email.sendInvitationEmail, {
          to: inv.email.toLowerCase(),
          firstName: inv.firstName || "Usuario",
          invitationCode,
          role: inv.role,
          institutionName: institution.name,
        });

        results.push({
          invitationId,
          email: inv.email,
          invitationCode,
          emailSent: true,
        });
      } catch (error: any) {
        errors.push({ email: inv.email, error: error.message });
      }
    }

    return {
      success: true,
      bulkImportId,
      invitations: results,
      summary: {
        total: args.invitations.length,
        created: results.length,
        failed: errors.length,
      },
      errors,
    };
  },
});

/**
 * Verify invitation code
 * User enters code before creating account
 */
export const verifyInvitationCode = query({
  args: {
    invitationCode: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate format
    if (!isValidCodeFormat(args.invitationCode)) {
      return {
        success: false,
        valid: false,
        message: "Código inválido. Debe tener 8 dígitos.",
      };
    }

    // Find invitation
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_code", (q) => q.eq("invitationCode", args.invitationCode))
      .first();

    if (!invitation) {
      return {
        success: false,
        valid: false,
        message: "Código no encontrado.",
      };
    }

    // Check status
    if (invitation.status !== "pending") {
      return {
        success: false,
        valid: false,
        message: `Invitación ${invitation.status === "accepted" ? "ya aceptada" : "cancelada"}.`,
      };
    }

    // Check expiration
    // Note: We can't update the status in a query - the acceptInvitation mutation
    // will handle marking expired invitations when someone tries to use them
    if (isTokenExpired(invitation.codeExpiresAt)) {
      return {
        success: false,
        valid: false,
        message: "Código expirado.",
      };
    }

    // Get institution name
    const institution = await ctx.db.get(invitation.institutionId);

    return {
      success: true,
      valid: true,
      invitation: {
        email: invitation.email,
        firstName: invitation.firstName,
        lastName: invitation.lastName,
        role: invitation.role,
        institutionName: institution?.name || "Institución",
      },
    };
  },
});

/**
 * Accept invitation and create user account
 * User sets password and creates account
 */
export const acceptInvitation = mutation({
  args: {
    invitationCode: v.string(),
    password: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate password
    if (!isValidPassword(args.password)) {
      throw new Error(
        "Contraseña debe tener mínimo 8 caracteres con letras y números"
      );
    }

    // Find invitation
    const invitation = await ctx.db
      .query("invitations")
      .withIndex("by_code", (q) => q.eq("invitationCode", args.invitationCode))
      .first();

    if (!invitation) {
      throw new Error("Código de invitación no encontrado");
    }

    // Validate status and expiration
    if (invitation.status !== "pending") {
      throw new Error("Esta invitación ya fue utilizada o cancelada");
    }

    if (isTokenExpired(invitation.codeExpiresAt)) {
      await ctx.db.patch(invitation._id, {
        status: "expired",
        updatedAt: Date.now(),
      });
      throw new Error("Código de invitación expirado");
    }

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", invitation.email))
      .first();

    if (existingUser) {
      throw new Error("Ya existe un usuario con este email");
    }

    // Hash password
    const passwordHash = await hashPassword(args.password);

    // Generate email verification token
    const emailVerificationToken = generateEmailVerificationToken();

    // Get institution and client
    const institution = await ctx.db.get(invitation.institutionId);
    const clientId = institution?.clientId;

    // Create user
    const now = Date.now();
    const userId = await ctx.db.insert("users", {
      clientId,
      institutionId: invitation.institutionId,
      email: invitation.email,
      passwordHash,

      // Email verification
      emailVerified: false,
      emailVerificationToken,
      tokenExpiresAt: getTokenExpiration(24), // 24 hours

      invitationId: invitation._id,

      name: `${invitation.firstName || ""} ${invitation.lastName || ""}`.trim() || invitation.email,
      firstName: invitation.firstName,
      lastName: invitation.lastName,
      phone: invitation.phone,

      role: invitation.role,

      accessibleInstitutionIds: [invitation.institutionId],

      failedLoginAttempts: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Create session
    const sessionToken = `session_${userId}_${now}_${Math.random().toString(36).substring(2)}`;
    await ctx.db.insert("sessions", {
      userId,
      token: sessionToken,
      expiresAt: getTokenExpiration(720), // 30 days
      isActive: true,
      createdAt: now,
    });

    // Mark invitation as accepted
    await ctx.db.patch(invitation._id, {
      status: "accepted",
      acceptedAt: now,
      acceptedByUserId: userId,
      updatedAt: now,
    });

    // Schedule verification email to be sent via Resend
    await ctx.scheduler.runAfter(0, api.email.sendVerificationEmail, {
      to: invitation.email,
      firstName: invitation.firstName || "Usuario",
      verificationCode: emailVerificationToken,
    });

    return {
      success: true,
      userId,
      token: sessionToken,
      emailSent: true,
      user: {
        email: invitation.email,
        name: `${invitation.firstName || ""} ${invitation.lastName || ""}`.trim(),
        role: invitation.role,
        institutionId: invitation.institutionId,
      },
    };
  },
});

/**
 * List invitations for an institution
 */
export const listInvitations = query({
  args: {
    userId: v.id("users"), // Current user (from Bubble backend_user_id)
    institutionId: v.id("institutions"),
    status: v.optional(
      v.union(
        v.literal("pending"),
        v.literal("accepted"),
        v.literal("expired"),
        v.literal("cancelled")
      )
    ),
  },
  handler: async (ctx, args) => {
    // Verify user has access to this institution
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    let query = ctx.db
      .query("invitations")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId));

    if (args.status) {
      query = query.filter((q) => q.eq(q.field("status"), args.status));
    }

    const invitations = await query.collect();

    return invitations.map((inv) => ({
      id: inv._id,
      email: inv.email,
      firstName: inv.firstName,
      lastName: inv.lastName,
      role: inv.role,
      invitationCode: inv.invitationCode,
      status: inv.status,
      createdAt: inv.createdAt,
      expiresAt: inv.codeExpiresAt,
      acceptedAt: inv.acceptedAt,
    }));
  },
});

/**
 * Cancel invitation
 */
export const cancelInvitation = mutation({
  args: {
    userId: v.id("users"), // Current user (from Bubble backend_user_id)
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    // Verify user is admin or super_admin
    await verifyRole(ctx, args.userId, "admin");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitación no encontrada");
    }

    // Verify user has access to this institution
    await verifyInstitutionAccess(ctx, args.userId, invitation.institutionId);

    if (invitation.status !== "pending") {
      throw new Error("Solo se pueden cancelar invitaciones pendientes");
    }

    await ctx.db.patch(args.invitationId, {
      status: "cancelled",
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "Invitación cancelada exitosamente",
    };
  },
});

/**
 * Resend invitation email
 * Generates new code if expired, keeps same code if still valid
 */
export const resendInvitation = mutation({
  args: {
    userId: v.id("users"), // Current user (from Bubble backend_user_id)
    invitationId: v.id("invitations"),
  },
  handler: async (ctx, args) => {
    // Verify user is admin or super_admin
    const currentUser = await verifyRole(ctx, args.userId, "admin");

    const invitation = await ctx.db.get(args.invitationId);
    if (!invitation) {
      throw new Error("Invitación no encontrada");
    }

    // Verify user has access to this institution
    await verifyInstitutionAccess(ctx, args.userId, invitation.institutionId);

    if (invitation.status !== "pending") {
      throw new Error("Solo se pueden reenviar invitaciones pendientes");
    }

    // Get institution for email
    const institution = await ctx.db.get(invitation.institutionId);
    if (!institution) {
      throw new Error("Institución no encontrada");
    }

    // Check if code is expired - generate new one if so
    let invitationCode = invitation.invitationCode;
    const now = Date.now();

    if (isTokenExpired(invitation.codeExpiresAt)) {
      // Generate new unique code
      invitationCode = generateInvitationCode();
      let attempts = 0;
      while (attempts < 10) {
        const existingCode = await ctx.db
          .query("invitations")
          .withIndex("by_code", (q) => q.eq("invitationCode", invitationCode))
          .first();

        if (!existingCode) break;
        invitationCode = generateInvitationCode();
        attempts++;
      }

      if (attempts >= 10) {
        throw new Error("No se pudo generar un código único. Intenta de nuevo.");
      }

      // Update invitation with new code
      await ctx.db.patch(args.invitationId, {
        invitationCode,
        codeExpiresAt: getTokenExpiration(168), // 7 days
        updatedAt: now,
      });
    } else {
      // Just update the timestamp
      await ctx.db.patch(args.invitationId, {
        updatedAt: now,
      });
    }

    // Schedule invitation email to be sent via Resend
    await ctx.scheduler.runAfter(0, api.email.sendInvitationEmail, {
      to: invitation.email,
      firstName: invitation.firstName || "Usuario",
      invitationCode,
      role: invitation.role,
      institutionName: institution.name,
    });

    return {
      success: true,
      invitationId: args.invitationId,
      invitationCode,
      email: invitation.email,
      emailSent: true,
    };
  },
});
