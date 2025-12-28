/**
 * Common Zod Validation Schemas
 *
 * Reusable validation schemas for API inputs.
 * These complement Convex's built-in validators (v.*) for use in Next.js API routes.
 *
 * Note: Convex mutations/queries use v.* validators in args.
 * These Zod schemas are for Next.js API route validation.
 */

import { z } from "zod";

// ============================================================================
// BASIC VALIDATORS
// ============================================================================

/**
 * International phone number format (Ecuador and Colombia)
 * Ecuador: +593XXXXXXXXX (9 digits after +593)
 * Colombia: +57XXXXXXXXXX (10 digits after +57)
 */
export const phoneSchema = z
  .string()
  .refine(
    (val) => /^\+593\d{9}$/.test(val) || /^\+57\d{10}$/.test(val),
    "Formato de teléfono inválido. Ecuador: +593XXXXXXXXX, Colombia: +57XXXXXXXXXX"
  );

/**
 * @deprecated Use phoneSchema instead
 */
export const ecuadorPhoneSchema = phoneSchema;

/**
 * Email validation with normalization
 */
export const emailSchema = z
  .string()
  .email("Formato de email inválido")
  .transform((val) => val.toLowerCase().trim());

/**
 * Password validation (min 8 chars, letters and numbers)
 */
export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[a-zA-Z]/, "Debe contener al menos una letra")
  .regex(/\d/, "Debe contener al menos un número");

/**
 * Convex ID validation (matches Convex ID format)
 */
export const convexIdSchema = z.string().min(1, "ID requerido");

/**
 * Optional Convex ID
 */
export const optionalConvexIdSchema = z.string().optional();

// ============================================================================
// USER & AUTH SCHEMAS
// ============================================================================

export const userRoleSchema = z.enum([
  "super_admin",
  "admin",
  "monitor",
  "driver",
  "parent",
]);

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Contraseña requerida"),
});

export const registerSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(2, "Nombre requerido"),
  phone: ecuadorPhoneSchema.optional(),
  role: userRoleSchema.optional(),
  institutionId: optionalConvexIdSchema,
  clientId: optionalConvexIdSchema,
});

export const changePasswordSchema = z
  .object({
    currentPassword: z.string().min(1, "Contraseña actual requerida"),
    newPassword: passwordSchema,
    confirmPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Las contraseñas no coinciden",
    path: ["confirmPassword"],
  });

export const resetPasswordSchema = z.object({
  email: emailSchema,
  resetCode: z.string().length(6, "Código debe tener 6 dígitos"),
  newPassword: passwordSchema,
});

// ============================================================================
// INVITATION SCHEMAS
// ============================================================================

export const invitationRoleSchema = z.enum(["parent", "driver", "monitor", "admin"]);

export const createInvitationSchema = z.object({
  institutionId: convexIdSchema,
  email: emailSchema,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: ecuadorPhoneSchema.optional(),
  role: invitationRoleSchema,
});

export const bulkInvitationItemSchema = z.object({
  email: emailSchema,
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  phone: ecuadorPhoneSchema.optional(),
  role: invitationRoleSchema,
});

export const createBulkInvitationsSchema = z.object({
  institutionId: convexIdSchema,
  invitations: z.array(bulkInvitationItemSchema).min(1).max(100),
});

export const acceptInvitationSchema = z.object({
  invitationCode: z.string().length(6, "Código debe tener 6 dígitos"),
  password: passwordSchema,
});

// ============================================================================
// CLIENT SCHEMAS
// ============================================================================

export const subscriptionPlanSchema = z.enum([
  "trial",
  "basic",
  "professional",
  "enterprise",
]);

export const subscriptionStatusSchema = z.enum([
  "active",
  "suspended",
  "cancelled",
]);

export const createClientSchema = z.object({
  name: z.string().min(2, "Nombre requerido"),
  legalName: z.string().optional(),
  taxId: z.string().optional(),
  contactPerson: z.string().min(2, "Persona de contacto requerida"),
  contactEmail: emailSchema,
  contactPhone: ecuadorPhoneSchema,
  address: z.string().min(5, "Dirección requerida"),
  city: z.string().min(2, "Ciudad requerida"),
  province: z.string().min(2, "Provincia requerida"),
  country: z.string().default("EC"),
  subscriptionPlan: subscriptionPlanSchema.optional(),
  maxInstitutions: z.number().int().positive().optional(),
  maxUsers: z.number().int().positive().optional(),
});

export const updateClientSchema = createClientSchema.partial().extend({
  clientId: convexIdSchema,
  subscriptionStatus: subscriptionStatusSchema.optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// INSTITUTION SCHEMAS
// ============================================================================

export const institutionTypeSchema = z.enum(["school", "corporate"]);

export const createInstitutionSchema = z.object({
  clientId: convexIdSchema,
  name: z.string().min(2, "Nombre requerido"),
  type: institutionTypeSchema,
  address: z.string().min(5, "Dirección requerida"),
  city: z.string().min(2, "Ciudad requerida"),
  phone: ecuadorPhoneSchema,
  email: emailSchema,
  contactPerson: z.string().min(2, "Persona de contacto requerida"),
  subscriptionPlan: subscriptionPlanSchema.optional(),
});

export const updateInstitutionSchema = createInstitutionSchema.partial().extend({
  institutionId: convexIdSchema,
  subscriptionStatus: subscriptionStatusSchema.optional(),
  isActive: z.boolean().optional(),
});

// ============================================================================
// PAGINATION & FILTERS
// ============================================================================

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().positive().max(100).default(20),
});

export const sortOrderSchema = z.enum(["asc", "desc"]).default("desc");

export const dateRangeSchema = z.object({
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

// ============================================================================
// GEOLOCATION SCHEMAS
// ============================================================================

export const coordinatesSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180),
});

export const locationSchema = coordinatesSchema.extend({
  address: z.string().optional(),
  accuracy: z.number().positive().optional(),
  timestamp: z.number().optional(),
});

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Parse and validate request body with a Zod schema
 */
export async function parseBody<T extends z.ZodType>(
  request: Request,
  schema: T
): Promise<z.infer<T>> {
  const body = await request.json();
  return schema.parse(body);
}

/**
 * Parse and validate URL search params with a Zod schema
 */
export function parseSearchParams<T extends z.ZodType>(
  searchParams: URLSearchParams,
  schema: T
): z.infer<T> {
  const params: Record<string, string> = {};
  searchParams.forEach((value, key) => {
    params[key] = value;
  });
  return schema.parse(params);
}

/**
 * Safe parse with error extraction
 */
export function safeParse<T extends z.ZodType>(
  schema: T,
  data: unknown
): { success: true; data: z.infer<T> } | { success: false; errors: string[] } {
  const result = schema.safeParse(data);

  if (result.success) {
    return { success: true, data: result.data };
  }

  const errors = result.error.issues.map((issue) => {
    const path = issue.path.join(".");
    return path ? `${path}: ${issue.message}` : issue.message;
  });

  return { success: false, errors };
}

// ============================================================================
// TYPE EXPORTS
// ============================================================================

export type UserRole = z.infer<typeof userRoleSchema>;
export type InvitationRole = z.infer<typeof invitationRoleSchema>;
export type SubscriptionPlan = z.infer<typeof subscriptionPlanSchema>;
export type SubscriptionStatus = z.infer<typeof subscriptionStatusSchema>;
export type InstitutionType = z.infer<typeof institutionTypeSchema>;
export type Coordinates = z.infer<typeof coordinatesSchema>;
export type Location = z.infer<typeof locationSchema>;
