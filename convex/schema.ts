import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Users and Authentication
  users: defineTable({
    clerkId: v.string(),
    email: v.string(),
    name: v.string(),
    role: v.union(v.literal("super_admin"), v.literal("admin"), v.literal("driver"), v.literal("parent")),
    institutionId: v.optional(v.id("institutions")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_clerk_id", ["clerkId"])
    .index("by_email", ["email"])
    .index("by_institution", ["institutionId"]),

  // Institutions (Schools/Organizations)
  institutions: defineTable({
    name: v.string(),
    type: v.union(v.literal("school"), v.literal("corporate")),
    address: v.string(),
    city: v.string(),
    phone: v.string(),
    email: v.string(),
    contactPerson: v.string(),
    isActive: v.boolean(),
    subscriptionPlan: v.union(v.literal("trial"), v.literal("basic"), v.literal("professional"), v.literal("enterprise")),
    subscriptionStatus: v.union(v.literal("active"), v.literal("suspended"), v.literal("cancelled")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_city", ["city"])
    .index("by_status", ["isActive"]),

  // Vehicles
  vehicles: defineTable({
    institutionId: v.id("institutions"),
    licensePlate: v.string(),
    brand: v.string(),
    model: v.string(),
    year: v.number(),
    color: v.string(),
    capacity: v.number(),
    status: v.union(v.literal("active"), v.literal("maintenance"), v.literal("out_of_service")),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_status", ["status"]),

  // Drivers
  drivers: defineTable({
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    licenseNumber: v.string(),
    licenseExpiry: v.number(),
    phone: v.string(),
    emergencyContact: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_institution", ["institutionId"]),

  // Students
  students: defineTable({
    institutionId: v.id("institutions"),
    firstName: v.string(),
    lastName: v.string(),
    grade: v.string(),
    dateOfBirth: v.number(),
    address: v.string(),
    parentPhone: v.string(),
    parentEmail: v.string(),
    parentName: v.string(),
    emergencyContact: v.string(),
    qrCode: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_qr_code", ["qrCode"]),

  // Routes
  routes: defineTable({
    institutionId: v.id("institutions"),
    name: v.string(),
    type: v.union(v.literal("pickup"), v.literal("dropoff")),
    vehicleId: v.id("vehicles"),
    driverId: v.id("drivers"),
    isActive: v.boolean(),
    scheduledStartTime: v.string(),
    scheduledEndTime: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_vehicle", ["vehicleId"])
    .index("by_driver", ["driverId"]),

  // Route Stops
  routeStops: defineTable({
    routeId: v.id("routes"),
    name: v.string(),
    address: v.string(),
    latitude: v.number(),
    longitude: v.number(),
    scheduledTime: v.string(),
    order: v.number(),
    geofenceRadius: v.number(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_route", ["routeId"])
    .index("by_order", ["routeId", "order"]),

  // Student Route Assignments
  studentRoutes: defineTable({
    studentId: v.id("students"),
    routeId: v.id("routes"),
    stopId: v.id("routeStops"),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_student", ["studentId"])
    .index("by_route", ["routeId"]),

  // Trips (Daily route executions)
  trips: defineTable({
    routeId: v.id("routes"),
    driverId: v.id("drivers"),
    vehicleId: v.id("vehicles"),
    status: v.union(v.literal("scheduled"), v.literal("in_progress"), v.literal("completed"), v.literal("cancelled")),
    startTime: v.optional(v.number()),
    endTime: v.optional(v.number()),
    scheduledDate: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_route", ["routeId"])
    .index("by_driver", ["driverId"])
    .index("by_date", ["scheduledDate"]),

  // GPS Tracking
  gpsTracking: defineTable({
    tripId: v.id("trips"),
    latitude: v.number(),
    longitude: v.number(),
    speed: v.optional(v.number()),
    heading: v.optional(v.number()),
    timestamp: v.number(),
  })
    .index("by_trip", ["tripId"])
    .index("by_timestamp", ["tripId", "timestamp"]),

  // Student Check-ins
  studentCheckins: defineTable({
    tripId: v.id("trips"),
    studentId: v.id("students"),
    stopId: v.id("routeStops"),
    checkinType: v.union(v.literal("pickup"), v.literal("dropoff")),
    timestamp: v.number(),
    latitude: v.number(),
    longitude: v.number(),
    qrScanned: v.boolean(),
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_trip", ["tripId"])
    .index("by_student", ["studentId"])
    .index("by_date", ["timestamp"]),

  // Incidents and Reports
  incidents: defineTable({
    tripId: v.optional(v.id("trips")),
    institutionId: v.id("institutions"),
    reportedBy: v.id("users"),
    type: v.union(v.literal("accident"), v.literal("breakdown"), v.literal("behavior"), v.literal("emergency"), v.literal("other")),
    severity: v.union(v.literal("low"), v.literal("medium"), v.literal("high"), v.literal("critical")),
    title: v.string(),
    description: v.string(),
    location: v.optional(v.string()),
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    status: v.union(v.literal("open"), v.literal("investigating"), v.literal("resolved"), v.literal("closed")),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_status", ["status"])
    .index("by_severity", ["severity"]),

  // Notifications
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("info"), v.literal("warning"), v.literal("error"), v.literal("success")),
    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_unread", ["userId", "read"]),
});
