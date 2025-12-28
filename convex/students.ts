/**
 * Student Management Functions
 *
 * CRUD operations for students with QR code generation.
 * RBAC: Admin+ can manage students, parents can view their own children.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { api } from "./_generated/api";
import { verifyUser, verifyRole, verifyInstitutionAccess } from "./lib/simpleAuth";
import { isValidEmail } from "./lib/authUtils";
import { generateInvitationCode, getTokenExpiration } from "./lib/tokenUtils";

/**
 * Generate unique QR code data for a student
 */
function generateQRCode(studentId: string, institutionId: string): string {
  return JSON.stringify({
    studentId,
    institutionId,
    timestamp: Date.now(),
    version: 1,
  });
}

/**
 * Create a new student
 */
export const createStudent = mutation({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    firstName: v.string(),
    lastName: v.string(),
    grade: v.string(),
    dateOfBirth: v.number(),
    address: v.string(),
    // Home coordinates for route optimization
    homeLatitude: v.optional(v.number()),
    homeLongitude: v.optional(v.number()),
    parentPhone: v.string(),
    parentEmail: v.string(),
    parentName: v.string(),
    emergencyContact: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const now = Date.now();

    // Create student first to get ID, then update with QR code
    const studentId = await ctx.db.insert("students", {
      institutionId: args.institutionId,
      firstName: args.firstName,
      lastName: args.lastName,
      grade: args.grade,
      dateOfBirth: args.dateOfBirth,
      address: args.address,
      homeLatitude: args.homeLatitude,
      homeLongitude: args.homeLongitude,
      parentPhone: args.parentPhone,
      parentEmail: args.parentEmail.toLowerCase(),
      parentName: args.parentName,
      emergencyContact: args.emergencyContact,
      qrCode: "", // Placeholder, will update
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });

    // Generate QR code with actual student ID
    const qrCode = generateQRCode(studentId, args.institutionId);
    await ctx.db.patch(studentId, { qrCode });

    return { success: true, studentId, qrCode };
  },
});

/**
 * Get student by ID
 */
export const getStudent = query({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);
    const student = await ctx.db.get(args.studentId);

    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    // Parents can view their own children (by matching email AND institutionId)
    if (currentUser.role === "parent") {
      if (currentUser.email?.toLowerCase() !== student.parentEmail.toLowerCase()) {
        throw new Error("No tienes permiso para ver este estudiante");
      }
      // Also verify institutionId for multi-tenant isolation
      if (student.institutionId !== currentUser.institutionId) {
        throw new Error("No tienes permiso para ver este estudiante");
      }
      return student;
    }

    // Admin/super_admin need institution access
    await verifyInstitutionAccess(ctx, args.userId, student.institutionId);
    return student;
  },
});

/**
 * Get student by QR code
 */
export const getStudentByQR = query({
  args: {
    userId: v.id("users"),
    qrCode: v.string(),
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    const student = await ctx.db
      .query("students")
      .withIndex("by_qr_code", (q) => q.eq("qrCode", args.qrCode))
      .first();

    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, student.institutionId);
    return student;
  },
});

/**
 * List students by institution
 */
export const listStudents = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    grade: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    let students = await ctx.db
      .query("students")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();

    if (args.grade) {
      students = students.filter((s) => s.grade === args.grade);
    }

    if (args.isActive !== undefined) {
      students = students.filter((s) => s.isActive === args.isActive);
    }

    return students;
  },
});

/**
 * List students for a parent (by email match)
 */
export const listStudentsForParent = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    if (currentUser.role !== "parent") {
      throw new Error("Esta función es solo para padres");
    }

    if (!currentUser.email) {
      return [];
    }

    // Filter by email AND institutionId for proper multi-tenant isolation
    const students = await ctx.db
      .query("students")
      .filter((q) =>
        q.and(
          q.eq(q.field("parentEmail"), currentUser.email!.toLowerCase()),
          q.eq(q.field("institutionId"), currentUser.institutionId)
        )
      )
      .collect();

    return students.filter((s) => s.isActive);
  },
});

/**
 * Update student
 */
export const updateStudent = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    grade: v.optional(v.string()),
    dateOfBirth: v.optional(v.number()),
    address: v.optional(v.string()),
    // Home coordinates for route optimization
    homeLatitude: v.optional(v.number()),
    homeLongitude: v.optional(v.number()),
    parentPhone: v.optional(v.string()),
    parentEmail: v.optional(v.string()),
    parentName: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, student.institutionId);

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.firstName !== undefined) updates.firstName = args.firstName;
    if (args.lastName !== undefined) updates.lastName = args.lastName;
    if (args.grade !== undefined) updates.grade = args.grade;
    if (args.dateOfBirth !== undefined) updates.dateOfBirth = args.dateOfBirth;
    if (args.address !== undefined) updates.address = args.address;
    if (args.homeLatitude !== undefined) updates.homeLatitude = args.homeLatitude;
    if (args.homeLongitude !== undefined) updates.homeLongitude = args.homeLongitude;
    if (args.parentPhone !== undefined) updates.parentPhone = args.parentPhone;
    if (args.parentEmail !== undefined) updates.parentEmail = args.parentEmail.toLowerCase();
    if (args.parentName !== undefined) updates.parentName = args.parentName;
    if (args.emergencyContact !== undefined) updates.emergencyContact = args.emergencyContact;
    if (args.isActive !== undefined) updates.isActive = args.isActive;

    await ctx.db.patch(args.studentId, updates);
    return { success: true };
  },
});

/**
 * Regenerate QR code for student
 */
export const regenerateQRCode = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, student.institutionId);

    const qrCode = generateQRCode(args.studentId, student.institutionId);
    await ctx.db.patch(args.studentId, {
      qrCode,
      updatedAt: Date.now(),
    });

    return { success: true, qrCode };
  },
});

/**
 * Deactivate student
 */
export const deactivateStudent = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");

    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    await verifyInstitutionAccess(ctx, args.userId, student.institutionId);

    await ctx.db.patch(args.studentId, {
      isActive: false,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Validate QR code for check-in
 */
export const validateQRCode = query({
  args: {
    userId: v.id("users"),
    qrCode: v.string(),
    routeId: v.optional(v.id("routes")),
  },
  handler: async (ctx, args) => {
    await verifyUser(ctx, args.userId);

    try {
      const qrData = JSON.parse(args.qrCode) as {
        studentId: string;
        institutionId: string;
        timestamp: number;
        version: number;
      };

      if (!qrData.studentId || !qrData.institutionId) {
        return { valid: false, error: "Código QR inválido" };
      }

      const studentId = qrData.studentId as Id<"students">;
      const student = await ctx.db.get(studentId);
      if (!student) {
        return { valid: false, error: "Estudiante no encontrado" };
      }

      if (!student.isActive) {
        return { valid: false, error: "Estudiante inactivo" };
      }

      // Check if student is assigned to the route (if provided)
      let assignedToRoute = true;
      if (args.routeId) {
        const assignment = await ctx.db
          .query("studentRoutes")
          .withIndex("by_student", (q) => q.eq("studentId", studentId))
          .filter((q) => q.eq(q.field("routeId"), args.routeId))
          .first();
        assignedToRoute = !!assignment && assignment.isActive;
      }

      return {
        valid: true,
        student: {
          id: student._id,
          firstName: student.firstName,
          lastName: student.lastName,
          grade: student.grade,
        },
        assignedToRoute,
      };
    } catch {
      return { valid: false, error: "Código QR inválido" };
    }
  },
});

/**
 * Update student home location
 *
 * This mutation allows both Admin and Parent to update student location.
 * Parents can only update location for their own children (verified by email match).
 * Used for route planning optimization.
 */
export const updateStudentLocation = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
    homeLatitude: v.number(),
    homeLongitude: v.number(),
    homeAddress: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);
    const student = await ctx.db.get(args.studentId);

    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    // Check permissions: Admin can update any student in their institution
    // Parent can only update their own children (by email match)
    if (currentUser.role === "admin" || currentUser.role === "super_admin") {
      await verifyInstitutionAccess(ctx, args.userId, student.institutionId);
    } else if (currentUser.role === "parent") {
      // Parent can only update location for their own children
      if (currentUser.email?.toLowerCase() !== student.parentEmail.toLowerCase()) {
        throw new Error("No tienes permiso para actualizar la ubicación de este estudiante");
      }
    } else {
      throw new Error("No tienes permiso para actualizar la ubicación de estudiantes");
    }

    // Update location
    const updates: Record<string, unknown> = {
      homeLatitude: args.homeLatitude,
      homeLongitude: args.homeLongitude,
      updatedAt: Date.now(),
    };

    // Update address if provided
    if (args.homeAddress !== undefined) {
      updates.address = args.homeAddress;
    }

    await ctx.db.patch(args.studentId, updates);

    return {
      success: true,
      message: "Ubicación del estudiante actualizada correctamente",
    };
  },
});

/**
 * Update student by parent (limited fields)
 *
 * Parents can only update:
 * - emergencyContactSecondary
 * - address (home address)
 * - parentPhone (their own phone)
 */
export const updateStudentByParent = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
    emergencyContactSecondary: v.optional(v.string()),
    address: v.optional(v.string()),
    parentPhone: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    if (currentUser.role !== "parent") {
      throw new Error("Esta función es solo para padres");
    }

    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    // Verify parent owns this student
    if (currentUser.email?.toLowerCase() !== student.parentEmail.toLowerCase()) {
      throw new Error("No tienes permiso para editar este estudiante");
    }

    // Also verify institutionId for multi-tenant isolation
    if (student.institutionId !== currentUser.institutionId) {
      throw new Error("No tienes permiso para editar este estudiante");
    }

    const updates: Record<string, unknown> = { updatedAt: Date.now() };

    if (args.emergencyContactSecondary !== undefined) {
      updates.emergencyContactSecondary = args.emergencyContactSecondary;
    }
    if (args.address !== undefined) {
      updates.address = args.address;
    }
    if (args.parentPhone !== undefined) {
      updates.parentPhone = args.parentPhone;
    }

    await ctx.db.patch(args.studentId, updates);

    return { success: true };
  },
});

/**
 * Generate upload URL for student photo
 * Parents can upload photos for their own children
 */
export const generatePhotoUploadUrl = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    // Check permissions
    if (currentUser.role === "admin" || currentUser.role === "super_admin") {
      await verifyInstitutionAccess(ctx, args.userId, student.institutionId);
    } else if (currentUser.role === "parent") {
      if (currentUser.email?.toLowerCase() !== student.parentEmail.toLowerCase()) {
        throw new Error("No tienes permiso para subir foto de este estudiante");
      }
    } else {
      throw new Error("No tienes permiso para subir fotos");
    }

    const uploadUrl = await ctx.storage.generateUploadUrl();
    return { uploadUrl };
  },
});

/**
 * Save student photo after upload
 */
export const saveStudentPhoto = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
    storageId: v.id("_storage"),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    // Check permissions
    if (currentUser.role === "admin" || currentUser.role === "super_admin") {
      await verifyInstitutionAccess(ctx, args.userId, student.institutionId);
    } else if (currentUser.role === "parent") {
      if (currentUser.email?.toLowerCase() !== student.parentEmail.toLowerCase()) {
        throw new Error("No tienes permiso para actualizar foto de este estudiante");
      }
    } else {
      throw new Error("No tienes permiso para actualizar fotos");
    }

    // Delete old photo if exists
    if (student.photoStorageId) {
      await ctx.storage.delete(student.photoStorageId);
    }

    await ctx.db.patch(args.studentId, {
      photoStorageId: args.storageId,
      updatedAt: Date.now(),
    });

    return { success: true };
  },
});

/**
 * Delete student photo
 */
export const deleteStudentPhoto = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    // Check permissions
    if (currentUser.role === "admin" || currentUser.role === "super_admin") {
      await verifyInstitutionAccess(ctx, args.userId, student.institutionId);
    } else if (currentUser.role === "parent") {
      if (currentUser.email?.toLowerCase() !== student.parentEmail.toLowerCase()) {
        throw new Error("No tienes permiso para eliminar foto de este estudiante");
      }
    } else {
      throw new Error("No tienes permiso para eliminar fotos");
    }

    if (student.photoStorageId) {
      await ctx.storage.delete(student.photoStorageId);
      await ctx.db.patch(args.studentId, {
        photoStorageId: undefined,
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

/**
 * Get student with photo URL
 * Returns student data with photo URL resolved from storage
 */
export const getStudentWithPhoto = query({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);
    const student = await ctx.db.get(args.studentId);

    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    // Parents can view their own children
    if (currentUser.role === "parent") {
      if (currentUser.email?.toLowerCase() !== student.parentEmail.toLowerCase()) {
        throw new Error("No tienes permiso para ver este estudiante");
      }
      if (student.institutionId !== currentUser.institutionId) {
        throw new Error("No tienes permiso para ver este estudiante");
      }
    } else {
      await verifyInstitutionAccess(ctx, args.userId, student.institutionId);
    }

    // Get photo URL if exists
    let photoUrl: string | null = null;
    if (student.photoStorageId) {
      photoUrl = await ctx.storage.getUrl(student.photoStorageId);
    }

    return {
      ...student,
      photoUrl,
    };
  },
});

/**
 * List students for parent with photo URLs
 */
export const listStudentsForParentWithPhotos = query({
  args: {
    userId: v.id("users"),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    if (currentUser.role !== "parent") {
      throw new Error("Esta función es solo para padres");
    }

    if (!currentUser.email) {
      return [];
    }

    const students = await ctx.db
      .query("students")
      .filter((q) =>
        q.and(
          q.eq(q.field("parentEmail"), currentUser.email!.toLowerCase()),
          q.eq(q.field("institutionId"), currentUser.institutionId)
        )
      )
      .collect();

    const activeStudents = students.filter((s) => s.isActive);

    // Resolve photo URLs for all students
    const studentsWithPhotos = await Promise.all(
      activeStudents.map(async (student) => {
        let photoUrl: string | null = null;
        if (student.photoStorageId) {
          photoUrl = await ctx.storage.getUrl(student.photoStorageId);
        }
        return {
          ...student,
          photoUrl,
        };
      })
    );

    return studentsWithPhotos;
  },
});

/**
 * List students with their route assignments
 * Used in route wizard to show which students already have routes
 */
export const listStudentsWithRoutes = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args) => {
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    // Get all active students with home location
    const students = await ctx.db
      .query("students")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();

    // For each student, get their route assignments
    const studentsWithRoutes = await Promise.all(
      students.map(async (student) => {
        // Get student's route assignments
        const assignments = await ctx.db
          .query("studentRoutes")
          .withIndex("by_student", (q) => q.eq("studentId", student._id))
          .filter((q) => q.eq(q.field("isActive"), true))
          .collect();

        // Enrich with route info
        const routeAssignments = await Promise.all(
          assignments.map(async (a) => {
            const route = await ctx.db.get(a.routeId);
            return route ? {
              routeId: route._id,
              routeName: route.name,
              routeType: route.type,
            } : null;
          })
        );

        const validAssignments = routeAssignments.filter(Boolean);
        const hasPickupRoute = validAssignments.some(a => a?.routeType === 'pickup');
        const hasDropoffRoute = validAssignments.some(a => a?.routeType === 'dropoff');
        const pickupRouteNames = validAssignments
          .filter(a => a?.routeType === 'pickup')
          .map(a => a?.routeName);
        const dropoffRouteNames = validAssignments
          .filter(a => a?.routeType === 'dropoff')
          .map(a => a?.routeName);

        return {
          ...student,
          hasPickupRoute,
          hasDropoffRoute,
          pickupRouteNames,
          dropoffRouteNames,
        };
      })
    );

    return studentsWithRoutes;
  },
});

// ============================================
// BULK IMPORT FUNCTIONS
// ============================================

/**
 * Validate student import data (preview mode)
 * Returns validation results and household groupings without saving
 */
export const validateStudentImport = query({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    students: v.array(
      v.object({
        firstName: v.string(),
        lastName: v.string(),
        grade: v.string(),
        dateOfBirth: v.optional(v.number()),
        address: v.optional(v.string()),
        parentEmail: v.string(),
        parentName: v.optional(v.string()),
        parentPhone: v.optional(v.string()),
        emergencyContact: v.optional(v.string()),
      })
    ),
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    const validationResults: Array<{
      index: number;
      valid: boolean;
      errors: string[];
      student: typeof args.students[0];
    }> = [];

    const emailToStudents: Map<string, number[]> = new Map();
    const existingEmails: Set<string> = new Set();
    const pendingInvitationEmails: Set<string> = new Set();

    // First pass: validate each student
    for (let i = 0; i < args.students.length; i++) {
      const student = args.students[i]!;
      const errors: string[] = [];

      // Validate required fields
      if (!student.firstName?.trim()) {
        errors.push("Nombre es requerido");
      }
      if (!student.lastName?.trim()) {
        errors.push("Apellido es requerido");
      }
      if (!student.grade?.trim()) {
        errors.push("Grado es requerido");
      }
      if (!student.parentEmail?.trim()) {
        errors.push("Email del padre es requerido");
      } else if (!isValidEmail(student.parentEmail)) {
        errors.push("Email del padre inválido");
      }

      validationResults.push({
        index: i,
        valid: errors.length === 0,
        errors,
        student,
      });

      // Group by parent email for household detection
      if (student.parentEmail) {
        const email = student.parentEmail.toLowerCase();
        const indices = emailToStudents.get(email) || [];
        indices.push(i);
        emailToStudents.set(email, indices);
      }
    }

    // Check which emails already have users or pending invitations
    for (const email of Array.from(emailToStudents.keys())) {
      const existingUser = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .first();

      if (existingUser) {
        existingEmails.add(email);
      } else {
        const pendingInvitation = await ctx.db
          .query("invitations")
          .withIndex("by_email", (q) => q.eq("email", email))
          .filter((q) => q.eq(q.field("status"), "pending"))
          .first();

        if (pendingInvitation) {
          pendingInvitationEmails.add(email);
        }
      }
    }

    // Build household summary
    const households: Array<{
      parentEmail: string;
      studentIndices: number[];
      studentNames: string[];
      userExists: boolean;
      invitationPending: boolean;
      needsInvitation: boolean;
    }> = [];

    for (const [email, indices] of Array.from(emailToStudents.entries())) {
      const userExists = existingEmails.has(email);
      const invitationPending = pendingInvitationEmails.has(email);

      households.push({
        parentEmail: email,
        studentIndices: indices,
        studentNames: indices.map((i: number) => {
          const s = args.students[i]!;
          return `${s.firstName} ${s.lastName}`;
        }),
        userExists,
        invitationPending,
        needsInvitation: !userExists && !invitationPending,
      });
    }

    const validCount = validationResults.filter((r) => r.valid).length;
    const invalidCount = validationResults.filter((r) => !r.valid).length;
    const newInvitationsNeeded = households.filter((h) => h.needsInvitation).length;

    return {
      success: true,
      summary: {
        totalStudents: args.students.length,
        validStudents: validCount,
        invalidStudents: invalidCount,
        totalHouseholds: households.length,
        newInvitationsNeeded,
        existingUsers: existingEmails.size,
        pendingInvitations: pendingInvitationEmails.size,
      },
      validationResults,
      households,
    };
  },
});

/**
 * Import students in bulk with optional parent invitations
 *
 * Workflow:
 * 1. Validate all student data
 * 2. Create students grouped by parentEmail (households)
 * 3. Optionally create invitations for new parent emails
 * 4. Return summary with results
 */
export const importStudentsBulk = mutation({
  args: {
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    students: v.array(
      v.object({
        firstName: v.string(),
        lastName: v.string(),
        grade: v.string(),
        dateOfBirth: v.optional(v.number()),
        address: v.optional(v.string()),
        parentEmail: v.string(),
        parentName: v.optional(v.string()),
        parentPhone: v.optional(v.string()),
        emergencyContact: v.optional(v.string()),
      })
    ),
    sendInvitations: v.boolean(), // If true, create invitations for new parent emails
  },
  handler: async (ctx, args) => {
    await verifyRole(ctx, args.userId, "admin");
    await verifyInstitutionAccess(ctx, args.userId, args.institutionId);

    // Limit bulk operations
    if (args.students.length > 200) {
      throw new Error("Máximo 200 estudiantes por lote");
    }

    // Get institution for invitation emails
    const institution = await ctx.db.get(args.institutionId);
    if (!institution) {
      throw new Error("Institución no encontrada");
    }

    const now = Date.now();
    const bulkImportId = `bulk_${now}_${Math.random().toString(36).substring(2, 9)}`;

    const createdStudents: Array<{
      studentId: Id<"students">;
      firstName: string;
      lastName: string;
      parentEmail: string;
    }> = [];
    const errors: Array<{ index: number; error: string }> = [];
    const emailToStudents: Map<string, Id<"students">[]> = new Map();

    // Create students
    for (let i = 0; i < args.students.length; i++) {
      const student = args.students[i]!;

      try {
        // Validate required fields
        if (!student.firstName?.trim()) {
          throw new Error("Nombre es requerido");
        }
        if (!student.lastName?.trim()) {
          throw new Error("Apellido es requerido");
        }
        if (!student.grade?.trim()) {
          throw new Error("Grado es requerido");
        }
        if (!student.parentEmail?.trim()) {
          throw new Error("Email del padre es requerido");
        }
        if (!isValidEmail(student.parentEmail)) {
          throw new Error("Email del padre inválido");
        }

        const email = student.parentEmail.toLowerCase();
        const firstName = student.firstName.trim();
        const lastName = student.lastName.trim();
        const grade = student.grade.trim();

        // Create student
        const studentId = await ctx.db.insert("students", {
          institutionId: args.institutionId,
          firstName,
          lastName,
          grade,
          dateOfBirth: student.dateOfBirth || now,
          address: student.address?.trim() || "Por confirmar",
          parentEmail: email,
          parentName: student.parentName?.trim() || "Por confirmar",
          parentPhone: student.parentPhone?.trim() || "+593000000000",
          emergencyContact: student.emergencyContact?.trim() || student.parentPhone?.trim() || "+593000000000",
          qrCode: "", // Will update after
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });

        // Generate QR code with actual student ID
        const qrCode = generateQRCode(studentId, args.institutionId);
        await ctx.db.patch(studentId, { qrCode });

        createdStudents.push({
          studentId,
          firstName,
          lastName,
          parentEmail: email,
        });

        // Track students by email for household grouping
        const studentIds = emailToStudents.get(email) || [];
        studentIds.push(studentId);
        emailToStudents.set(email, studentIds);
      } catch (error: unknown) {
        const message = error instanceof Error ? error.message : "Error desconocido";
        errors.push({ index: i, error: message });
      }
    }

    // Create invitations for new parent emails if requested
    const invitationsCreated: Array<{
      email: string;
      invitationCode: string;
      studentCount: number;
    }> = [];

    if (args.sendInvitations) {
      for (const [email, studentIds] of Array.from(emailToStudents.entries())) {
        // Check if user already exists
        const existingUser = await ctx.db
          .query("users")
          .withIndex("by_email", (q) => q.eq("email", email))
          .first();

        if (existingUser) {
          // User exists, link students to user
          for (const studentId of studentIds) {
            const student = await ctx.db.get(studentId);
            if (student) {
              const currentGuardians = student.guardianUserIds || [];
              if (!currentGuardians.includes(existingUser._id)) {
                await ctx.db.patch(studentId, {
                  guardianUserIds: [...currentGuardians, existingUser._id],
                });
              }
            }
          }
          continue;
        }

        // Check for pending invitation
        const existingInvitation = await ctx.db
          .query("invitations")
          .withIndex("by_email", (q) => q.eq("email", email))
          .filter((q) => q.eq(q.field("status"), "pending"))
          .first();

        if (existingInvitation) {
          // Already has pending invitation, skip
          continue;
        }

        // Generate invitation code
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
          continue; // Skip this email, couldn't generate unique code
        }

        // Get first student's parent name for the invitation
        const firstStudentId = studentIds[0];
        if (!firstStudentId) continue;
        const firstStudent = await ctx.db.get(firstStudentId);
        const parentName = firstStudent?.parentName || "Padre/Madre";
        const inviteFirstName = parentName.split(" ")[0] || "Usuario";

        // Create invitation
        await ctx.db.insert("invitations", {
          institutionId: args.institutionId,
          role: "parent",
          email,
          firstName: inviteFirstName,
          invitationCode,
          codeExpiresAt: getTokenExpiration(168), // 7 days
          createdBy: args.userId,
          status: "pending",
          bulkImportId,
          createdAt: now,
          updatedAt: now,
        });

        // Schedule invitation email
        await ctx.scheduler.runAfter(0, api.email.sendInvitationEmail, {
          to: email,
          firstName: inviteFirstName,
          invitationCode,
          role: "parent",
          institutionName: institution.name,
        });

        invitationsCreated.push({
          email,
          invitationCode,
          studentCount: studentIds.length,
        });
      }
    }

    // Build household summary
    const households: Array<{
      parentEmail: string;
      studentCount: number;
      studentNames: string[];
    }> = [];

    for (const [email, studentIds] of Array.from(emailToStudents.entries())) {
      const students = await Promise.all(studentIds.map((id) => ctx.db.get(id)));
      households.push({
        parentEmail: email,
        studentCount: studentIds.length,
        studentNames: students
          .filter((s): s is NonNullable<typeof s> => s !== null)
          .map((s) => `${s.firstName} ${s.lastName}`),
      });
    }

    return {
      success: true,
      bulkImportId,
      summary: {
        totalStudents: args.students.length,
        createdStudents: createdStudents.length,
        failedStudents: errors.length,
        totalHouseholds: households.length,
        invitationsSent: invitationsCreated.length,
      },
      createdStudents,
      households,
      invitationsCreated,
      errors,
    };
  },
});

/**
 * Invite secondary guardian for a student
 *
 * Allows primary parent to invite a second guardian (spouse, grandparent, etc.)
 * The secondary guardian will receive an invitation to create their account.
 */
export const inviteSecondaryGuardian = mutation({
  args: {
    userId: v.id("users"),
    studentId: v.id("students"),
    email: v.string(),
    name: v.string(),
  },
  handler: async (ctx, args) => {
    const currentUser = await verifyUser(ctx, args.userId);

    // Validate email
    if (!isValidEmail(args.email)) {
      throw new Error("Email inválido");
    }

    const email = args.email.toLowerCase();

    // Get student
    const student = await ctx.db.get(args.studentId);
    if (!student) {
      throw new Error("Estudiante no encontrado");
    }

    // Verify caller is primary parent or admin
    const isParent = currentUser.role === "parent" &&
      currentUser.email?.toLowerCase() === student.parentEmail.toLowerCase();
    const isAdmin = currentUser.role === "admin" || currentUser.role === "super_admin";

    if (!isParent && !isAdmin) {
      throw new Error("No tienes permiso para invitar tutores a este estudiante");
    }

    // For admin, verify institution access
    if (isAdmin) {
      await verifyInstitutionAccess(ctx, args.userId, student.institutionId);
    }

    // Check if email is same as primary parent
    if (email === student.parentEmail.toLowerCase()) {
      throw new Error("El email es el mismo que el tutor principal");
    }

    // Check if secondary parent already set
    if (student.secondaryParentEmail?.toLowerCase() === email) {
      throw new Error("Este email ya está registrado como tutor secundario");
    }

    // Get institution for email
    const institution = await ctx.db.get(student.institutionId);
    if (!institution) {
      throw new Error("Institución no encontrada");
    }

    const now = Date.now();

    // Check if user already exists
    const existingUser = await ctx.db
      .query("users")
      .withIndex("by_email", (q) => q.eq("email", email))
      .first();

    if (existingUser) {
      // User already exists - just link them to the student
      const currentGuardians = student.guardianUserIds || [];
      if (!currentGuardians.includes(existingUser._id)) {
        await ctx.db.patch(args.studentId, {
          secondaryParentEmail: email,
          guardianUserIds: [...currentGuardians, existingUser._id],
          updatedAt: now,
        });
      } else {
        await ctx.db.patch(args.studentId, {
          secondaryParentEmail: email,
          updatedAt: now,
        });
      }

      return {
        success: true,
        message: "Tutor secundario vinculado exitosamente",
        userExists: true,
        invitationSent: false,
      };
    }

    // Check for pending invitation
    const existingInvitation = await ctx.db
      .query("invitations")
      .withIndex("by_email", (q) => q.eq("email", email))
      .filter((q) => q.eq(q.field("status"), "pending"))
      .first();

    if (existingInvitation) {
      // Update student with secondary email
      await ctx.db.patch(args.studentId, {
        secondaryParentEmail: email,
        updatedAt: now,
      });

      return {
        success: true,
        message: "Ya existe una invitación pendiente para este email",
        userExists: false,
        invitationSent: false,
        existingInvitation: true,
      };
    }

    // Generate invitation code
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

    // Create invitation
    await ctx.db.insert("invitations", {
      institutionId: student.institutionId,
      role: "parent",
      email,
      firstName: args.name.split(" ")[0],
      lastName: args.name.split(" ").slice(1).join(" ") || undefined,
      invitationCode,
      codeExpiresAt: getTokenExpiration(168), // 7 days
      createdBy: args.userId,
      status: "pending",
      createdAt: now,
      updatedAt: now,
    });

    // Update student with secondary parent email
    await ctx.db.patch(args.studentId, {
      secondaryParentEmail: email,
      updatedAt: now,
    });

    // Schedule invitation email
    const guardianFirstName = args.name.split(" ")[0] || "Usuario";
    await ctx.scheduler.runAfter(0, api.email.sendInvitationEmail, {
      to: email,
      firstName: guardianFirstName,
      invitationCode,
      role: "parent",
      institutionName: institution.name,
    });

    return {
      success: true,
      message: "Invitación enviada exitosamente",
      userExists: false,
      invitationSent: true,
      invitationCode,
    };
  },
});
