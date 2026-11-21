// Esquema de la base de datos (PostgreSQL). Fuente de verdad de los datos.
// Las fechas-hora se guardan como milisegundos desde época (bigint) y las fechas
// de calendario como texto "YYYY-MM-DD" en la zona horaria del colegio.
import { sql } from "drizzle-orm";
import {
  bigint, boolean, doublePrecision, index, integer, jsonb, pgTable, primaryKey, text, uniqueIndex, uuid,
} from "drizzle-orm/pg-core";

export type Role = "admin" | "driver" | "parent" | "owner";
export type Direction = "to_school" | "from_school";
export type Stop = {
  id: string; name: string; lat: number; lng: number;
  time: string; // "HH:mm". En un viaje es la hora típica aprendida; en la ruta, la prevista
  planned?: string; // solo en viajes: la hora prevista original de la ruta
  studentIds: string[];
};
export type Notice = { kind: "delay" | "breakdown" | "other"; message: string; toFamilies: boolean; at: number };
export type LoginCode = {
  codeHash: string; expiresAt: number; attempts: number; sentAt: number; sentCount: number; windowStart: number;
};
export type BoardingStatus = "boarded" | "dropped" | "no_show";
export type SubscriptionStatus = "trial" | "active" | "past_due" | "suspended" | "cancelled";

const id = () => uuid("id").primaryKey().defaultRandom();
const ms = (name: string) => bigint(name, { mode: "number" });
const createdAt = () => ms("created_at").notNull().default(sql`(extract(epoch from now()) * 1000)::bigint`);

export const schools = pgTable("schools", {
  id: id(),
  name: text("name").notNull(),
  timezone: text("timezone").notNull(),
  location: jsonb("location").$type<{ lat: number; lng: number; address: string }>(),
  grades: jsonb("grades").$type<string[]>().notNull(),
  createdAt: createdAt(),
});

export const users = pgTable(
  "users",
  {
    id: id(),
    // Nulo solo para el dueño de la plataforma (rol "owner").
    schoolId: uuid("school_id").references(() => schools.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    name: text("name").notNull(),
    phone: text("phone"),
    role: text("role").$type<Role>().notNull(),
    active: boolean("active").notNull().default(true),
    verifiedAt: ms("verified_at"),
    login: jsonb("login").$type<LoginCode>(), // código de acceso vigente (hash); nunca sale del servidor
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("users_email").on(t.email), index("users_school_role").on(t.schoolId, t.role)],
);

export const sessions = pgTable(
  "sessions",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull(),
    expiresAt: ms("expires_at").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("sessions_token").on(t.tokenHash), index("sessions_user").on(t.userId)],
);

export const students = pgTable(
  "students",
  {
    id: id(),
    schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    grade: text("grade").notNull(),
    address: text("address").notNull().default(""),
    home: jsonb("home").$type<{ lat: number; lng: number }>(),
    note: text("note"),
    active: boolean("active").notNull().default(true),
    createdAt: createdAt(),
  },
  (t) => [index("students_school").on(t.schoolId)],
);

export const guardians = pgTable(
  "guardians",
  {
    schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
    studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  },
  (t) => [primaryKey({ columns: [t.studentId, t.userId] }), index("guardians_user").on(t.userId), index("guardians_school").on(t.schoolId)],
);

// Datos biométricos: vectores cifrados (AES-256-GCM), nunca imágenes. Requiere consentimiento.
export const faces = pgTable(
  "faces",
  {
    studentId: uuid("student_id").primaryKey().references(() => students.id, { onDelete: "cascade" }),
    schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
    cipher: text("cipher").notNull(),
    consentBy: uuid("consent_by").notNull().references(() => users.id),
    consentAt: ms("consent_at").notNull(),
    consentSource: text("consent_source").$type<"guardian" | "school">().notNull(),
  },
  (t) => [index("faces_school").on(t.schoolId)],
);

export const vehicles = pgTable(
  "vehicles",
  {
    id: id(),
    schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    plate: text("plate").notNull().default(""),
    capacity: integer("capacity").notNull(),
    active: boolean("active").notNull().default(true),
  },
  (t) => [index("vehicles_school").on(t.schoolId)],
);

export const routes = pgTable(
  "routes",
  {
    id: id(),
    schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    direction: text("direction").$type<Direction>().notNull(),
    days: jsonb("days").$type<number[]>().notNull(), // 0 = domingo … 6 = sábado
    startTime: text("start_time").notNull(), // "HH:mm"
    vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
    driverId: uuid("driver_id").references(() => users.id, { onDelete: "set null" }),
    stops: jsonb("stops").$type<Stop[]>().notNull(),
    path: text("path"), // trazo por calles (polilínea codificada), si hay motor de rutas
    active: boolean("active").notNull().default(true),
    lateAlertDate: text("late_alert_date"),
  },
  (t) => [index("routes_school").on(t.schoolId), index("routes_driver").on(t.driverId)],
);

export const trips = pgTable(
  "trips",
  {
    id: id(),
    schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
    routeId: uuid("route_id").references(() => routes.id, { onDelete: "set null" }),
    routeName: text("route_name").notNull(),
    date: text("date").notNull(), // "YYYY-MM-DD" en la zona del colegio
    direction: text("direction").$type<Direction>().notNull(),
    driverId: uuid("driver_id").notNull().references(() => users.id),
    vehicleId: uuid("vehicle_id").references(() => vehicles.id, { onDelete: "set null" }),
    status: text("status").$type<"in_progress" | "completed">().notNull(),
    startedAt: ms("started_at").notNull(),
    endedAt: ms("ended_at"),
    departedAt: ms("departed_at"), // desde el colegio: fin del abordaje y salida
    stops: jsonb("stops").$type<Stop[]>().notNull(), // copia de la ruta al iniciar, con horas típicas aprendidas
    path: text("path"),
    stopIndex: integer("stop_index").notNull().default(0),
    delayMin: integer("delay_min").notNull().default(0),
    nearNotified: jsonb("near_notified").$type<string[]>().notNull().default([]),
    predicted: jsonb("predicted").$type<Record<string, number>>().notNull().default({}), // parada → minuto estimado mostrado
    notices: jsonb("notices").$type<Notice[]>().notNull().default([]),
    summary: jsonb("summary").$type<{ total: number; dropped: number; noShow: number; absent: number }>(),
  },
  (t) => [
    uniqueIndex("trips_route_date").on(t.routeId, t.date),
    index("trips_school_date").on(t.schoolId, t.date),
    index("trips_driver_date").on(t.driverId, t.date),
  ],
);

// Última posición de cada viaje en curso. Una fila por viaje.
export const positions = pgTable("positions", {
  tripId: uuid("trip_id").primaryKey().references(() => trips.id, { onDelete: "cascade" }),
  schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
  lat: doublePrecision("lat").notNull(),
  lng: doublePrecision("lng").notNull(),
  heading: doublePrecision("heading"),
  speed: doublePrecision("speed"),
  at: ms("at").notNull(),
});

export const boardings = pgTable(
  "boardings",
  {
    id: id(),
    schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
    tripId: uuid("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
    studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    stopId: text("stop_id").notNull(),
    status: text("status").$type<BoardingStatus>().notNull(),
    method: text("method").$type<"tap" | "face">().notNull(),
    boardedAt: ms("boarded_at"),
    at: ms("at").notNull(),
  },
  (t) => [uniqueIndex("boardings_trip_student").on(t.tripId, t.studentId), index("boardings_student_at").on(t.studentId, t.at)],
);

// Hora real de llegada a cada parada: alimenta la hora estimada que aprende
// y permite medir el error (estimada contra real).
export const stopTimes = pgTable(
  "stop_times",
  {
    id: id(),
    schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
    routeId: uuid("route_id").references(() => routes.id, { onDelete: "cascade" }),
    tripId: uuid("trip_id").notNull().references(() => trips.id, { onDelete: "cascade" }),
    stopId: text("stop_id").notNull(),
    date: text("date").notNull(),
    plannedMin: integer("planned_min").notNull(), // hora prevista en minutos del día
    predictedMin: integer("predicted_min"), // lo que se le mostró a la familia al salir de la parada anterior
    actualMin: integer("actual_min").notNull(),
  },
  (t) => [index("stop_times_route_stop").on(t.routeId, t.stopId, t.date)],
);

export const absences = pgTable(
  "absences",
  {
    id: id(),
    schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
    studentId: uuid("student_id").notNull().references(() => students.id, { onDelete: "cascade" }),
    from: text("from_date").notNull(),
    to: text("to_date").notNull(),
    direction: text("direction").$type<Direction | "both">().notNull(),
    note: text("note"),
    createdBy: uuid("created_by").notNull().references(() => users.id),
  },
  (t) => [index("absences_school_to").on(t.schoolId, t.to), index("absences_student").on(t.studentId, t.to)],
);

export const notifications = pgTable(
  "notifications",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    body: text("body").notNull(),
    tripId: uuid("trip_id"),
    read: boolean("read").notNull().default(false),
    at: ms("at").notNull(),
  },
  (t) => [index("notifications_user_at").on(t.userId, t.at)],
);

export const pushSubscriptions = pgTable(
  "push_subscriptions",
  {
    id: id(),
    userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
    endpoint: text("endpoint").notNull(),
    p256dh: text("p256dh").notNull(),
    auth: text("auth").notNull(),
  },
  (t) => [uniqueIndex("push_endpoint").on(t.endpoint), index("push_user").on(t.userId)],
);

// ───────────── Suscripción y cobros (Wompi) ─────────────

export const subscriptions = pgTable("subscriptions", {
  schoolId: uuid("school_id").primaryKey().references(() => schools.id, { onDelete: "cascade" }),
  status: text("status").$type<SubscriptionStatus>().notNull(),
  pricePerStudent: integer("price_per_student").notNull(), // pesos por estudiante activo al mes, sin IVA
  trialEndsAt: ms("trial_ends_at").notNull(),
  paidUntil: ms("paid_until"), // fin del periodo pagado
  legalName: text("legal_name"),
  taxId: text("tax_id"), // NIT
  billingEmail: text("billing_email"),
  remindedFor: text("reminded_for"), // último recordatorio enviado, para no repetirlo
});

export const charges = pgTable(
  "charges",
  {
    id: id(),
    schoolId: uuid("school_id").notNull().references(() => schools.id, { onDelete: "cascade" }),
    reference: text("reference").notNull(), // referencia única enviada a Wompi
    students: integer("students").notNull(),
    months: integer("months").notNull().default(1),
    subtotal: integer("subtotal").notNull(), // pesos
    tax: integer("tax").notNull(),
    total: integer("total").notNull(),
    status: text("status").$type<"pending" | "paid" | "failed">().notNull(),
    method: text("method"), // CARD, PSE, NEQUI…, o "manual"
    wompiId: text("wompi_id"),
    createdAt: createdAt(),
    paidAt: ms("paid_at"),
    note: text("note"),
  },
  (t) => [uniqueIndex("charges_reference").on(t.reference), index("charges_school").on(t.schoolId, t.createdAt)],
);

// ───────────── Infraestructura ─────────────

// Cola de tareas: se insertan en la misma transacción que las origina.
export const jobs = pgTable(
  "jobs",
  {
    id: id(),
    kind: text("kind").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull(),
    runAt: ms("run_at").notNull(),
    attempts: integer("attempts").notNull().default(0),
    lockedUntil: ms("locked_until"),
    lastError: text("last_error"),
  },
  (t) => [index("jobs_run_at").on(t.runAt)],
);

export const auditLog = pgTable(
  "audit_log",
  {
    id: id(),
    schoolId: uuid("school_id"),
    userId: uuid("user_id"),
    action: text("action").notNull(),
    detail: jsonb("detail").$type<Record<string, unknown>>(),
    ip: text("ip"),
    at: ms("at").notNull(),
  },
  (t) => [index("audit_school_at").on(t.schoolId, t.at)],
);

// Contadores para limitar intentos por IP o por correo.
export const rateLimits = pgTable("rate_limits", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  resetAt: ms("reset_at").notNull(),
});

/** Tablas con `school_id`, protegidas con seguridad por fila. */
export const SCHOOL_TABLES = [
  "users", "students", "guardians", "faces", "vehicles", "routes", "trips", "positions",
  "boardings", "stop_times", "absences", "subscriptions", "charges",
] as const;
