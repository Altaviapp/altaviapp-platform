/**
 * Email Verification API
 *
 * Handles email verification for new users:
 * - Verify email with 6-digit token
 * - Resend verification email
 * - Check verification status
 *
 * Following Alquemist pattern: Backend generates HTML, Frontend sends
 */

import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { api } from "./_generated/api";
import {
  generateEmailVerificationToken,
  getTokenExpiration,
  isTokenExpired,
  isValidCodeFormat,
} from "./lib/tokenUtils";
import { generateEmailVerificationEmail } from "./lib/emailTemplates";

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

/**
 * Verify email with 6-digit token
 * User enters token from email to verify their account
 */
export const verifyEmailToken = mutation({
  args: {
    token: v.string(),
  },
  handler: async (ctx, args) => {
    // Validate format
    if (!isValidCodeFormat(args.token)) {
      throw new Error("Código inválido. Debe tener 6 dígitos.");
    }

    // Find user by verification token
    const user = await ctx.db
      .query("users")
      .withIndex("by_verification_token", (q) =>
        q.eq("emailVerificationToken", args.token)
      )
      .first();

    if (!user) {
      throw new Error("Código de verificación no encontrado.");
    }

    // Check if already verified
    if (user.emailVerified) {
      return {
        success: true,
        message: "Email ya verificado anteriormente.",
        userId: user._id,
      };
    }

    // Check expiration
    if (user.tokenExpiresAt && isTokenExpired(user.tokenExpiresAt)) {
      throw new Error("Código expirado. Solicita un nuevo código.");
    }

    // Mark email as verified
    await ctx.db.patch(user._id, {
      emailVerified: true,
      emailVerifiedAt: Date.now(),
      emailVerificationToken: undefined, // Clear token
      tokenExpiresAt: undefined,
      updatedAt: Date.now(),
    });

    return {
      success: true,
      message: "¡Email verificado exitosamente!",
      userId: user._id,
    };
  },
});

/**
 * Resend email verification
 * User didn't receive email or token expired
 */
export const resendVerificationEmail = mutation({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    // Find user by email
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      throw new Error("Usuario no encontrado.");
    }

    // Check if already verified
    if (user.emailVerified) {
      throw new Error("Este email ya está verificado.");
    }

    // Generate new token
    const emailVerificationToken = generateEmailVerificationToken();

    // Update user with new token
    await ctx.db.patch(user._id, {
      emailVerificationToken,
      tokenExpiresAt: getTokenExpiration(24), // 24 hours
      updatedAt: Date.now(),
    });

    // Schedule verification email to be sent via Resend
    await ctx.scheduler.runAfter(0, api.email.sendVerificationEmail, {
      to: user.email,
      firstName: user.firstName || user.name || "Usuario",
      verificationCode: emailVerificationToken,
      appUrl: getAppUrlByRole(user.role),
    });

    return {
      success: true,
      emailSent: true,
    };
  },
});

/**
 * Check email verification status
 * Query to check if user's email is verified
 */
export const checkVerificationStatus = query({
  args: {
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", args.email.toLowerCase()))
      .first();

    if (!user) {
      return {
        exists: false,
        verified: false,
      };
    }

    return {
      exists: true,
      verified: user.emailVerified,
      email: user.email,
      name: user.name,
    };
  },
});
