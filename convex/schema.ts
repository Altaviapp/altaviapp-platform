import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export const role = v.union(v.literal("admin"), v.literal("driver"), v.literal("parent"));
export const direction = v.union(v.literal("to_school"), v.literal("from_school"));
export const point = v.object({ lat: v.number(), lng: v.number() });
export const stop = v.object({
  id: v.string(),
  name: v.string(),
  lat: v.number(),
  lng: v.number(),
  time: v.string(), // "HH:mm" previsto
  studentIds: v.array(v.id("students")),
});
export const boardingStatus = v.union(
  v.literal("boarded"),
  v.literal("dropped"),
  v.literal("no_show"),
);

export default defineSchema({
  schools: defineTable({
    name: v.string(),
    timezone: v.string(), // IANA, p. ej. "America/Guayaquil"
    location: v.optional(v.object({ lat: v.number(), lng: v.number(), address: v.string() })),
    grades: v.array(v.string()),
  }),

  users: defineTable({
    schoolId: v.id("schools"),
    email: v.string(),
    name: v.string(),
    phone: v.optional(v.string()),
    role,
    active: v.boolean(),
    verifiedAt: v.optional(v.number()), // primer ingreso exitoso
    // Código de acceso vigente (hash). Nunca sale del servidor.
    login: v.optional(
      v.object({
        codeHash: v.string(),
        expiresAt: v.number(),
        attempts: v.number(),
        sentAt: v.number(),
        sentCount: v.number(), // envíos en la ventana actual de 1 hora
        windowStart: v.number(),
      }),
    ),
  })
    .index("by_email", ["email"])
    .index("by_school_role", ["schoolId", "role"]),

  sessions: defineTable({
    userId: v.id("users"),
    tokenHash: v.string(),
    expiresAt: v.number(),
  })
    .index("by_token", ["tokenHash"])
    .index("by_user", ["userId"]),

  students: defineTable({
    schoolId: v.id("schools"),
    name: v.string(),
    grade: v.string(),
    address: v.string(),
    home: v.optional(point),
    note: v.optional(v.string()),
    active: v.boolean(),
  }).index("by_school", ["schoolId"]),

  // Acudientes de cada estudiante (un usuario "parent" puede tener varios hijos).
  guardians: defineTable({
    schoolId: v.id("schools"),
    studentId: v.id("students"),
    userId: v.id("users"),
  })
    .index("by_user", ["userId"])
    .index("by_student", ["studentId"])
    .index("by_school", ["schoolId"]),

  // Datos biométricos: solo vectores numéricos, nunca imágenes. Requiere consentimiento.
  faces: defineTable({
    schoolId: v.id("schools"),
    studentId: v.id("students"),
    descriptors: v.array(v.array(v.number())),
    consentBy: v.id("users"),
    consentAt: v.number(),
    consentSource: v.union(v.literal("guardian"), v.literal("school")),
  })
    .index("by_student", ["studentId"])
    .index("by_school", ["schoolId"]),

  vehicles: defineTable({
    schoolId: v.id("schools"),
    name: v.string(),
    plate: v.string(),
    capacity: v.number(),
    active: v.boolean(),
  }).index("by_school", ["schoolId"]),

  routes: defineTable({
    schoolId: v.id("schools"),
    name: v.string(),
    direction,
    days: v.array(v.number()), // 0 = domingo … 6 = sábado
    startTime: v.string(), // "HH:mm"
    vehicleId: v.optional(v.id("vehicles")),
    driverId: v.optional(v.id("users")),
    stops: v.array(stop),
    active: v.boolean(),
    lateAlertDate: v.optional(v.string()), // último día en que se avisó "no ha iniciado"
  })
    .index("by_school", ["schoolId"])
    .index("by_driver", ["driverId"]),

  trips: defineTable({
    schoolId: v.id("schools"),
    routeId: v.id("routes"),
    routeName: v.string(),
    date: v.string(), // "YYYY-MM-DD" en la zona horaria del colegio
    direction,
    driverId: v.id("users"),
    vehicleId: v.optional(v.id("vehicles")),
    status: v.union(v.literal("in_progress"), v.literal("completed")),
    startedAt: v.number(),
    endedAt: v.optional(v.number()),
    departedAt: v.optional(v.number()), // desde el colegio: fin del abordaje y salida
    summary: v.optional(
      v.object({ total: v.number(), dropped: v.number(), noShow: v.number(), absent: v.number() }),
    ),
    stops: v.array(stop), // copia de la ruta al iniciar
    stopIndex: v.number(), // parada siguiente
    delayMin: v.number(),
    nearNotified: v.array(v.string()), // paradas a las que ya se avisó cercanía
    notices: v.array(
      v.object({
        kind: v.union(v.literal("delay"), v.literal("breakdown"), v.literal("other")),
        message: v.string(),
        toFamilies: v.boolean(),
        at: v.number(),
      }),
    ),
  })
    .index("by_school_date", ["schoolId", "date"])
    .index("by_route_date", ["routeId", "date"])
    .index("by_driver_date", ["driverId", "date"]),

  // Última posición de cada viaje en curso. Tabla aparte para que cada reporte
  // (cada 10 s) no invalide las consultas que leen el viaje.
  positions: defineTable({
    schoolId: v.id("schools"),
    tripId: v.id("trips"),
    lat: v.number(),
    lng: v.number(),
    heading: v.optional(v.number()),
    speed: v.optional(v.number()),
    at: v.number(),
  })
    .index("by_trip", ["tripId"])
    .index("by_school", ["schoolId"]),

  boardings: defineTable({
    schoolId: v.id("schools"),
    tripId: v.id("trips"),
    studentId: v.id("students"),
    stopId: v.string(),
    status: boardingStatus,
    method: v.union(v.literal("tap"), v.literal("face")),
    boardedAt: v.optional(v.number()),
    at: v.number(),
  })
    .index("by_trip", ["tripId"])
    .index("by_student", ["studentId", "at"]),

  absences: defineTable({
    schoolId: v.id("schools"),
    studentId: v.id("students"),
    from: v.string(), // "YYYY-MM-DD"
    to: v.string(),
    direction: v.union(direction, v.literal("both")),
    note: v.optional(v.string()),
    createdBy: v.id("users"),
  })
    .index("by_school_to", ["schoolId", "to"])
    .index("by_student", ["studentId", "to"]),

  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    body: v.string(),
    tripId: v.optional(v.id("trips")),
    read: v.boolean(),
    at: v.number(),
  }).index("by_user", ["userId", "at"]),

  pushSubscriptions: defineTable({
    userId: v.id("users"),
    endpoint: v.string(),
    p256dh: v.string(),
    auth: v.string(),
  })
    .index("by_user", ["userId"])
    .index("by_endpoint", ["endpoint"]),
});
