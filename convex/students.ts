/**
 * Student Management Functions
 *
 * CRUD operations for students with QR code generation.
 * RBAC: Admin+ can manage students, parents can view their own children.
 */

import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { Id } from "./_generated/dataModel";
import { verifyUser, verifyRole, verifyInstitutionAccess } from "./lib/simpleAuth";

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
