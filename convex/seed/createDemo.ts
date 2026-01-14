/**
 * Demo Seed Script - Creates demo data for testing
 *
 * Run with: npx convex run seed/createDemo:seedDemoData
 *
 * This creates:
 * - 1 Client organization
 * - 1 Institution (school)
 * - 1 Admin user (admin@demo.com / demo123)
 * - 2 Drivers with users
 * - 1 Monitor with user
 * - 2 Vehicles
 * - 15 Students with coordinates
 */

import { action, internalMutation } from "../_generated/server";
import { internal } from "../_generated/api";
import { v } from "convex/values";
import {
  DEMO_CLIENT,
  DEMO_INSTITUTION,
  DEMO_ADMIN,
  DEMO_VEHICLES,
  DEMO_DRIVERS,
  DEMO_MONITORS,
  DEMO_PARENTS,
  DEMO_STUDENTS,
  DEMO_ROUTE_STOPS,
  generateQRCode,
} from "./demoData";
import { hashPassword } from "../lib/authUtils";

// Internal mutation to create all data
export const _createDemoData = internalMutation({
  args: {
    clientData: v.object({
      name: v.string(),
      legalName: v.optional(v.string()),
      taxId: v.optional(v.string()),
      contactPerson: v.string(),
      contactEmail: v.string(),
      contactPhone: v.string(),
      address: v.string(),
      city: v.string(),
      province: v.string(),
      country: v.string(),
      subscriptionPlan: v.union(
        v.literal("trial"),
        v.literal("basic"),
        v.literal("professional"),
        v.literal("enterprise")
      ),
      subscriptionStatus: v.union(
        v.literal("active"),
        v.literal("suspended"),
        v.literal("cancelled")
      ),
      maxInstitutions: v.number(),
      maxUsers: v.number(),
      isActive: v.boolean(),
    }),
    institutionData: v.object({
      name: v.string(),
      type: v.union(v.literal("school"), v.literal("corporate")),
      address: v.string(),
      city: v.string(),
      phone: v.string(),
      email: v.string(),
      contactPerson: v.string(),
      isActive: v.boolean(),
      subscriptionPlan: v.union(
        v.literal("trial"),
        v.literal("basic"),
        v.literal("professional"),
        v.literal("enterprise")
      ),
      subscriptionStatus: v.union(
        v.literal("active"),
        v.literal("suspended"),
        v.literal("cancelled")
      ),
    }),
    adminData: v.object({
      email: v.string(),
      passwordHash: v.string(),
      name: v.string(),
      firstName: v.optional(v.string()),
      lastName: v.optional(v.string()),
      phone: v.optional(v.string()),
      role: v.union(
        v.literal("super_admin"),
        v.literal("admin"),
        v.literal("monitor"),
        v.literal("driver"),
        v.literal("parent")
      ),
    }),
    vehiclesData: v.array(
      v.object({
        licensePlate: v.string(),
        brand: v.string(),
        model: v.string(),
        year: v.number(),
        color: v.string(),
        capacity: v.number(),
        status: v.union(
          v.literal("active"),
          v.literal("maintenance"),
          v.literal("out_of_service")
        ),
        isActive: v.boolean(),
      })
    ),
    driversData: v.array(
      v.object({
        user: v.object({
          email: v.string(),
          passwordHash: v.string(),
          name: v.string(),
          firstName: v.optional(v.string()),
          lastName: v.optional(v.string()),
          phone: v.optional(v.string()),
          role: v.union(
            v.literal("super_admin"),
            v.literal("admin"),
            v.literal("monitor"),
            v.literal("driver"),
            v.literal("parent")
          ),
        }),
        driver: v.object({
          licenseNumber: v.string(),
          licenseExpiry: v.number(),
          phone: v.string(),
          emergencyContact: v.string(),
          isActive: v.boolean(),
        }),
      })
    ),
    monitorsData: v.array(
      v.object({
        user: v.object({
          email: v.string(),
          passwordHash: v.string(),
          name: v.string(),
          firstName: v.optional(v.string()),
          lastName: v.optional(v.string()),
          phone: v.optional(v.string()),
          role: v.union(
            v.literal("super_admin"),
            v.literal("admin"),
            v.literal("monitor"),
            v.literal("driver"),
            v.literal("parent")
          ),
        }),
        monitor: v.object({
          idNumber: v.string(),
          phone: v.string(),
          emergencyContact: v.string(),
          firstAidCertified: v.optional(v.boolean()),
          firstAidCertExpiry: v.optional(v.number()),
          childCareCertified: v.optional(v.boolean()),
          isActive: v.boolean(),
        }),
      })
    ),
    studentsData: v.array(
      v.object({
        firstName: v.string(),
        lastName: v.string(),
        grade: v.string(),
        dateOfBirth: v.number(),
        address: v.string(),
        homeLatitude: v.optional(v.number()),
        homeLongitude: v.optional(v.number()),
        parentName: v.string(),
        parentPhone: v.string(),
        parentEmail: v.string(),
        emergencyContact: v.string(),
      })
    ),
    parentPasswordHash: v.string(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();

    // 0. Clean up existing demo data - delete users with demo emails
    const demoEmails = [
      "admin@demo.com",
      "jperez.driver@demo.com",
      "mrodriguez.driver@demo.com",
      "atorres.monitor@demo.com",
      "cmartinez.parent@demo.com",
      "asanchez.parent@demo.com", // Second parent for testing novedades
    ];

    for (const email of demoEmails) {
      const existingUsers = await ctx.db
        .query("users")
        .withIndex("by_email", (q) => q.eq("email", email))
        .collect();
      for (const user of existingUsers) {
        // Delete related sessions
        const sessions = await ctx.db
          .query("sessions")
          .withIndex("by_user", (q) => q.eq("userId", user._id))
          .collect();
        for (const session of sessions) {
          await ctx.db.delete(session._id);
        }
        // Delete user
        await ctx.db.delete(user._id);
        console.log("🧹 Deleted existing user:", email);
      }
    }

    // 1. Create Client
    const clientId = await ctx.db.insert("clients", {
      ...args.clientData,
      createdAt: now,
      updatedAt: now,
    });
    console.log("✅ Client created:", clientId);

    // 2. Create Institution
    const institutionId = await ctx.db.insert("institutions", {
      clientId,
      ...args.institutionData,
      createdAt: now,
      updatedAt: now,
    });
    console.log("✅ Institution created:", institutionId);

    // 3. Create Admin User
    const adminUserId = await ctx.db.insert("users", {
      clientId,
      institutionId,
      email: args.adminData.email,
      passwordHash: args.adminData.passwordHash,
      emailVerified: true,
      emailVerifiedAt: now,
      name: args.adminData.name,
      firstName: args.adminData.firstName,
      lastName: args.adminData.lastName,
      phone: args.adminData.phone,
      role: args.adminData.role,
      accessibleInstitutionIds: [institutionId],
      failedLoginAttempts: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    console.log("✅ Admin user created:", adminUserId);

    // 4. Create Vehicles
    const vehicleIds: string[] = [];
    for (const vehicle of args.vehiclesData) {
      const vehicleId = await ctx.db.insert("vehicles", {
        institutionId,
        ...vehicle,
        createdAt: now,
        updatedAt: now,
      });
      vehicleIds.push(vehicleId);
      console.log("✅ Vehicle created:", vehicle.licensePlate);
    }

    // 5. Create Drivers with Users
    const driverIds: string[] = [];
    for (const driverData of args.driversData) {
      // Create user
      const userId = await ctx.db.insert("users", {
        clientId,
        institutionId,
        email: driverData.user.email,
        passwordHash: driverData.user.passwordHash,
        emailVerified: true,
        emailVerifiedAt: now,
        name: driverData.user.name,
        firstName: driverData.user.firstName,
        lastName: driverData.user.lastName,
        phone: driverData.user.phone,
        role: driverData.user.role,
        accessibleInstitutionIds: [institutionId],
        failedLoginAttempts: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      // Create driver profile
      const driverId = await ctx.db.insert("drivers", {
        userId,
        institutionId,
        ...driverData.driver,
        createdAt: now,
        updatedAt: now,
      });
      driverIds.push(driverId);
      console.log("✅ Driver created:", driverData.user.name);
    }

    // 6. Create Monitors with Users
    const monitorIds: string[] = [];
    for (const monitorData of args.monitorsData) {
      // Create user
      const userId = await ctx.db.insert("users", {
        clientId,
        institutionId,
        email: monitorData.user.email,
        passwordHash: monitorData.user.passwordHash,
        emailVerified: true,
        emailVerifiedAt: now,
        name: monitorData.user.name,
        firstName: monitorData.user.firstName,
        lastName: monitorData.user.lastName,
        phone: monitorData.user.phone,
        role: monitorData.user.role,
        accessibleInstitutionIds: [institutionId],
        failedLoginAttempts: 0,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      // Create monitor profile
      const monitorId = await ctx.db.insert("monitors", {
        userId,
        institutionId,
        ...monitorData.monitor,
        createdAt: now,
        updatedAt: now,
      });
      monitorIds.push(monitorId);
      console.log("✅ Monitor created:", monitorData.user.name);
    }

    // 7. Create Parent User 1 (Carlos Martínez - parent of Sofía)
    const parentUserId = await ctx.db.insert("users", {
      clientId,
      institutionId,
      email: "cmartinez.parent@demo.com",
      passwordHash: args.parentPasswordHash,
      emailVerified: true,
      emailVerifiedAt: now,
      name: "Carlos Martínez",
      firstName: "Carlos",
      lastName: "Martínez",
      phone: "+593991234567",
      role: "parent",
      accessibleInstitutionIds: [institutionId],
      failedLoginAttempts: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    console.log("✅ Parent user created: Carlos Martínez");

    // 7b. Create Parent User 2 (Ana Sánchez - parent of Diego) for testing novedades
    const parent2UserId = await ctx.db.insert("users", {
      clientId,
      institutionId,
      email: "asanchez.parent@demo.com",
      passwordHash: args.parentPasswordHash,
      emailVerified: true,
      emailVerifiedAt: now,
      name: "Ana Sánchez",
      firstName: "Ana",
      lastName: "Sánchez",
      phone: "+593992345678",
      role: "parent",
      accessibleInstitutionIds: [institutionId],
      failedLoginAttempts: 0,
      isActive: true,
      createdAt: now,
      updatedAt: now,
    });
    console.log("✅ Parent user created: Ana Sánchez");

    // 8. Create Students with QR Codes
    const studentIds: string[] = [];
    for (const student of args.studentsData) {
      // Generate a temporary ID for QR (will be updated after insert)
      const tempQRCode = `temp_${Date.now()}_${Math.random()}`;

      const studentId = await ctx.db.insert("students", {
        institutionId,
        firstName: student.firstName,
        lastName: student.lastName,
        grade: student.grade,
        dateOfBirth: student.dateOfBirth,
        address: student.address,
        homeLatitude: student.homeLatitude,
        homeLongitude: student.homeLongitude,
        parentName: student.parentName,
        parentPhone: student.parentPhone,
        parentEmail: student.parentEmail,
        emergencyContact: student.emergencyContact,
        qrCode: tempQRCode,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });

      // Update with real QR code containing the studentId
      const qrCode = JSON.stringify({
        studentId,
        institutionId,
        timestamp: now,
        version: 1,
      });
      await ctx.db.patch(studentId, { qrCode });

      studentIds.push(studentId);
      console.log("✅ Student created:", `${student.firstName} ${student.lastName}`);
    }

    // =========================================================================
    // DEMO ROUTE, STOPS, AND TRIP FOR TESTING
    // =========================================================================

    // 9. Create Demo Route (dropoff - afternoon route)
    const routeId = await ctx.db.insert("routes", {
      institutionId,
      name: "Ruta Demo PM - La Floresta",
      type: "dropoff",
      vehicleId: vehicleIds[0] as any, // PBA-1234
      driverId: driverIds[0] as any, // Juan Carlos Pérez
      isActive: true,
      scheduledStartTime: "18:00",
      scheduledEndTime: "19:00",
      createdAt: now,
      updatedAt: now,
    });
    console.log("✅ Route created: Ruta Demo PM - La Floresta");

    // 10. Create Route Stops (3 stops: School → 12 de Octubre → La Floresta)
    const demoStops = [
      {
        name: "Colegio Demo La Carolina",
        address: "Av. de los Shyris N35-174 y Portugal",
        latitude: -0.1828,
        longitude: -78.4847,
        scheduledTime: "18:00",
        order: 1,
        geofenceRadius: 100,
      },
      {
        name: "12 de Octubre y Orellana",
        address: "Av. 12 de Octubre N25-67 y Orellana",
        latitude: -0.1912,
        longitude: -78.4878,
        scheduledTime: "18:20",
        order: 2,
        geofenceRadius: 100,
      },
      {
        name: "La Floresta - Plaza Isabel La Católica",
        address: "Isabel La Católica y Toledo",
        latitude: -0.1967,
        longitude: -78.4892,
        scheduledTime: "18:40",
        order: 3,
        geofenceRadius: 100,
      },
    ];

    const stopIds: string[] = [];
    for (const stop of demoStops) {
      const stopId = await ctx.db.insert("routeStops", {
        routeId: routeId as any,
        name: stop.name,
        address: stop.address,
        latitude: stop.latitude,
        longitude: stop.longitude,
        scheduledTime: stop.scheduledTime,
        order: stop.order,
        geofenceRadius: stop.geofenceRadius,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      stopIds.push(stopId);
      console.log("✅ Stop created:", stop.name);
    }

    // 11. Create Student Route Assignments
    // Sofía (index 0) → Stop 3 (La Floresta)
    // Diego (index 1) → Stop 3 (La Floresta) - same stop, different parent
    // Valentina (index 2) → Stop 2 (12 de Octubre)
    const studentRouteAssignments = [
      { studentIndex: 0, stopIndex: 2 }, // Sofía → La Floresta
      { studentIndex: 1, stopIndex: 2 }, // Diego → La Floresta
      { studentIndex: 2, stopIndex: 1 }, // Valentina → 12 de Octubre
    ];

    const studentRouteIds: string[] = [];
    for (const assignment of studentRouteAssignments) {
      const studentRouteId = await ctx.db.insert("studentRoutes", {
        studentId: studentIds[assignment.studentIndex] as any,
        routeId: routeId as any,
        stopId: stopIds[assignment.stopIndex] as any,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      });
      studentRouteIds.push(studentRouteId);
    }
    console.log("✅ Student route assignments created:", studentRouteIds.length);

    // 12. Create Trip for TODAY
    const today = new Date().toISOString().split('T')[0] ?? ''; // YYYY-MM-DD format
    const tripId = await ctx.db.insert("trips", {
      routeId: routeId as any,
      driverId: driverIds[0] as any,
      vehicleId: vehicleIds[0] as any,
      status: "scheduled",
      scheduledDate: today,
      createdAt: now,
      updatedAt: now,
    });
    console.log("✅ Trip created for:", today);

    // 13. Create Trip Students (students scheduled for this trip)
    const tripStudentIds: string[] = [];
    for (const assignment of studentRouteAssignments) {
      const tripStudentId = await ctx.db.insert("tripStudents", {
        tripId: tripId as any,
        studentId: studentIds[assignment.studentIndex] as any,
        stopId: stopIds[assignment.stopIndex] as any,
        status: "scheduled",
        createdAt: now,
        updatedAt: now,
      });
      tripStudentIds.push(tripStudentId);
    }
    console.log("✅ Trip students created:", tripStudentIds.length);

    return {
      success: true,
      created: {
        clientId,
        institutionId,
        adminUserId,
        parentUserId,
        parent2UserId,
        vehicleIds,
        driverIds,
        monitorIds,
        studentIds,
        routeId,
        stopIds,
        studentRouteIds,
        tripId,
        tripStudentIds,
      },
      credentials: {
        admin: { email: args.adminData.email, password: "demo123" },
        drivers: args.driversData.map((d) => ({
          email: d.user.email,
          password: "driver123",
        })),
        monitors: args.monitorsData.map((m) => ({
          email: m.user.email,
          password: "monitor123",
        })),
        parents: [
          { email: "cmartinez.parent@demo.com", password: "parent123" },
          { email: "asanchez.parent@demo.com", password: "parent123" },
        ],
      },
    };
  },
});

// Result type for seed operation
type SeedResult = {
  success: boolean;
  created: {
    clientId: string;
    institutionId: string;
    adminUserId: string;
    parentUserId: string;
    parent2UserId: string;
    vehicleIds: string[];
    driverIds: string[];
    monitorIds: string[];
    studentIds: string[];
    routeId: string;
    stopIds: string[];
    studentRouteIds: string[];
    tripId: string;
    tripStudentIds: string[];
  };
  credentials: {
    admin: { email: string; password: string };
    drivers: { email: string; password: string }[];
    monitors: { email: string; password: string }[];
    parents: { email: string; password: string }[];
  };
};

// Public action to seed demo data
export const seedDemoData = action({
  args: {},
  handler: async (ctx): Promise<SeedResult> => {
    console.log("🚀 Starting demo data seed...");

    // Hash all passwords
    const adminPasswordHash = await hashPassword(DEMO_ADMIN.password);
    const driversData = await Promise.all(
      DEMO_DRIVERS.map(async (d) => ({
        user: {
          email: d.user.email,
          passwordHash: await hashPassword(d.user.password),
          name: d.user.name,
          firstName: d.user.firstName,
          lastName: d.user.lastName,
          phone: d.user.phone,
          role: d.user.role,
        },
        driver: d.driver,
      }))
    );
    const monitorsData = await Promise.all(
      DEMO_MONITORS.map(async (m) => ({
        user: {
          email: m.user.email,
          passwordHash: await hashPassword(m.user.password),
          name: m.user.name,
          firstName: m.user.firstName,
          lastName: m.user.lastName,
          phone: m.user.phone,
          role: m.user.role,
        },
        monitor: m.monitor,
      }))
    );

    // Hash parent password
    const parentPasswordHash = await hashPassword(DEMO_PARENTS[0]?.user.password || "parent123");

    // Call internal mutation to create data
    const result: SeedResult = await ctx.runMutation(internal.seed.createDemo._createDemoData, {
      clientData: DEMO_CLIENT,
      institutionData: {
        name: DEMO_INSTITUTION.name,
        type: DEMO_INSTITUTION.type,
        address: DEMO_INSTITUTION.address,
        city: DEMO_INSTITUTION.city,
        phone: DEMO_INSTITUTION.phone,
        email: DEMO_INSTITUTION.email,
        contactPerson: DEMO_INSTITUTION.contactPerson,
        isActive: DEMO_INSTITUTION.isActive,
        subscriptionPlan: DEMO_INSTITUTION.subscriptionPlan,
        subscriptionStatus: DEMO_INSTITUTION.subscriptionStatus,
      },
      adminData: {
        email: DEMO_ADMIN.email,
        passwordHash: adminPasswordHash,
        name: DEMO_ADMIN.name,
        firstName: DEMO_ADMIN.firstName,
        lastName: DEMO_ADMIN.lastName,
        phone: DEMO_ADMIN.phone,
        role: DEMO_ADMIN.role,
      },
      vehiclesData: DEMO_VEHICLES,
      driversData,
      monitorsData,
      studentsData: DEMO_STUDENTS,
      parentPasswordHash,
    });

    console.log("✅ Demo data seed complete!");
    console.log("\n📋 Login Credentials:");
    console.log("Admin: admin@demo.com / demo123");
    console.log("Driver 1: jperez.driver@demo.com / driver123");
    console.log("Driver 2: mrodriguez.driver@demo.com / driver123");
    console.log("Monitor: atorres.monitor@demo.com / monitor123");
    console.log("Parent 1 (Sofía's parent): cmartinez.parent@demo.com / parent123");
    console.log("Parent 2 (Diego's parent): asanchez.parent@demo.com / parent123");
    console.log("\n🚌 Demo Route: Ruta Demo PM - La Floresta");
    console.log("📅 Trip scheduled for today with 3 students");

    return result;
  },
});

// Action to clear all demo data (for testing)
export const clearDemoData = action({
  args: {},
  handler: async (ctx) => {
    console.log("⚠️ This action is not implemented for safety.");
    console.log("To clear data, use the Convex dashboard or a custom script.");
    return { message: "Not implemented for safety" };
  },
});

// Internal mutation to fix route durations (one-time migration)
export const _fixRouteDurations = internalMutation({
  args: {
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args) => {
    const routes = await ctx.db
      .query("routes")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();

    let fixedCount = 0;
    const now = Date.now();

    for (const route of routes) {
      // If duration > 180 (3 hours in minutes), it's likely in seconds
      if (route.estimatedDuration && route.estimatedDuration > 180) {
        const correctedDuration = Math.round(route.estimatedDuration / 60);
        await ctx.db.patch(route._id, {
          estimatedDuration: correctedDuration,
          updatedAt: now,
        });
        fixedCount++;
        console.log(`Fixed route ${route.name}: ${route.estimatedDuration}s -> ${correctedDuration}min`);
      }
    }

    return {
      routesChecked: routes.length,
      routesFixed: fixedCount,
    };
  },
});

// Action to fix route durations
export const fixRouteDurations = action({
  args: {
    institutionId: v.id("institutions"),
  },
  handler: async (ctx, args): Promise<{ routesChecked: number; routesFixed: number }> => {
    const result: { routesChecked: number; routesFixed: number } = await ctx.runMutation(internal.seed.createDemo._fixRouteDurations, {
      institutionId: args.institutionId,
    });

    console.log(`\n✅ Route duration fix complete:`);
    console.log(`   Checked: ${result.routesChecked} routes`);
    console.log(`   Fixed: ${result.routesFixed} routes`);

    return result;
  },
});
