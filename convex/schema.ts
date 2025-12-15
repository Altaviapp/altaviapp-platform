import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  // Clients (Parent organization that owns multiple institutions)
  clients: defineTable({
    name: v.string(),
    legalName: v.optional(v.string()),
    taxId: v.optional(v.string()), // RUC Ecuador
    contactPerson: v.string(),
    contactEmail: v.string(),
    contactPhone: v.optional(v.string()), // +593XXXXXXXXX
    address: v.string(),
    city: v.string(),
    province: v.string(),
    country: v.string(), // Default: "EC"
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
    maxInstitutions: v.number(), // Default: 3
    maxUsers: v.number(), // Default: 10
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_tax_id", ["taxId"])
    .index("by_status", ["subscriptionStatus"]),

  // Institutions (Schools/Organizations)
  institutions: defineTable({
    clientId: v.id("clients"),
    name: v.string(),
    type: v.union(v.literal("school"), v.literal("corporate")),
    address: v.string(),
    city: v.string(),
    phone: v.optional(v.string()),
    email: v.string(),
    contactPerson: v.string(),
    isActive: v.boolean(),
    subscriptionPlan: v.union(v.literal("trial"), v.literal("basic"), v.literal("professional"), v.literal("enterprise")),
    subscriptionStatus: v.union(v.literal("active"), v.literal("suspended"), v.literal("cancelled")),

    // API Token for external GPS device authentication (centralized per institution)
    apiToken: v.optional(v.string()),
    apiTokenCreatedAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_client", ["clientId"])
    .index("by_city", ["city"])
    .index("by_status", ["isActive"])
    .index("by_api_token", ["apiToken"]),

  // Users and Authentication
  users: defineTable({
    clientId: v.optional(v.id("clients")),
    institutionId: v.optional(v.id("institutions")),
    email: v.string(),
    passwordHash: v.string(), // Bcrypt hashed password

    // Email Verification
    emailVerified: v.boolean(),
    emailVerifiedAt: v.optional(v.number()),
    emailVerificationToken: v.optional(v.string()), // 8-digit code
    tokenExpiresAt: v.optional(v.number()),

    invitationId: v.optional(v.id("invitations")),

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

    // Multi-institution support
    accessibleInstitutionIds: v.array(v.id("institutions")),

    // Security
    lastLogin: v.optional(v.number()),
    failedLoginAttempts: v.number(), // Default: 0
    accountLockedUntil: v.optional(v.number()),

    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_email", ["email"])
    .index("by_client", ["clientId"])
    .index("by_institution", ["institutionId"])
    .index("by_verification_token", ["emailVerificationToken"]),

  // Invitations (for parent/driver/admin onboarding)
  invitations: defineTable({
    institutionId: v.id("institutions"),
    role: v.union(
      v.literal("parent"),
      v.literal("driver"),
      v.literal("monitor"),
      v.literal("admin")
    ),
    email: v.string(),
    firstName: v.optional(v.string()),
    lastName: v.optional(v.string()),
    phone: v.optional(v.string()),

    invitationCode: v.string(), // 8-digit code: 12345678
    codeExpiresAt: v.number(), // 7 days

    createdBy: v.id("users"), // Admin who created the invitation
    status: v.union(
      v.literal("pending"),
      v.literal("accepted"),
      v.literal("expired"),
      v.literal("cancelled")
    ),

    acceptedAt: v.optional(v.number()),
    acceptedByUserId: v.optional(v.id("users")),

    bulkImportId: v.optional(v.string()), // For grouping CSV imports

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_email", ["email"])
    .index("by_code", ["invitationCode"])
    .index("by_status", ["status"])
    .index("by_bulk_import", ["bulkImportId"]),

  // Sessions (renamed from userSessions)
  sessions: defineTable({
    userId: v.id("users"),
    token: v.string(),
    expiresAt: v.number(), // 30 days
    lastUsedAt: v.optional(v.number()),

    // Security metadata
    userAgent: v.optional(v.string()),
    ipAddress: v.optional(v.string()),

    isActive: v.boolean(),
    revokedAt: v.optional(v.number()),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_token", ["token"])
    .index("by_active", ["isActive"]),

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

    // GPS Configuration
    gpsSourceType: v.optional(v.union(
      v.literal("mobile"),    // GPS del celular del conductor (default)
      v.literal("device"),    // Dispositivo GPS instalado en el bus
      v.literal("api")        // API externa (ej: Samsara, Garmin Fleet)
    )),
    gpsDeviceConfig: v.optional(v.object({
      deviceId: v.string(),                           // ID del dispositivo o API key
      provider: v.optional(v.string()),               // "samsara", "garmin", "custom"
      apiEndpoint: v.optional(v.string()),            // Para custom APIs
      updateIntervalSeconds: v.optional(v.number()),  // Default: 15
      fallbackToMobile: v.boolean(),                  // Si falla, usar GPS móvil
    })),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_status", ["status"])
    .index("by_device_id", ["gpsDeviceConfig.deviceId"]),

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

  // Monitors (Auxiliares - responsible for student check-in/out)
  monitors: defineTable({
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    idNumber: v.string(), // Cédula de identidad
    phone: v.string(),
    emergencyContact: v.string(),
    // Certifications
    firstAidCertified: v.optional(v.boolean()),
    firstAidCertExpiry: v.optional(v.number()),
    childCareCertified: v.optional(v.boolean()),
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
    // Home coordinates for route optimization
    homeLatitude: v.optional(v.number()),
    homeLongitude: v.optional(v.number()),
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
    monitorId: v.optional(v.id("monitors")), // Optional - routes may not have a monitor
    isActive: v.boolean(),
    scheduledStartTime: v.string(),
    scheduledEndTime: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_vehicle", ["vehicleId"])
    .index("by_driver", ["driverId"])
    .index("by_monitor", ["monitorId"]),

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
    monitorId: v.optional(v.id("monitors")), // Optional - inherited from route or null
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
    .index("by_monitor", ["monitorId"])
    .index("by_date", ["scheduledDate"]),

  // Trip Vehicle Changes (Relay Mode - Modo Relevo)
  tripVehicleChanges: defineTable({
    tripId: v.id("trips"),
    previousVehicleId: v.id("vehicles"),
    newVehicleId: v.id("vehicles"),
    previousDriverId: v.optional(v.id("drivers")),
    newDriverId: v.optional(v.id("drivers")),
    changedAt: v.number(),
    changedBy: v.id("users"),
    reason: v.union(
      v.literal("breakdown"),    // Falla mecánica
      v.literal("relay"),        // Relevo programado
      v.literal("capacity"),     // Necesidad de más capacidad
      v.literal("other")
    ),
    notes: v.optional(v.string()),
    // GPS location at moment of change
    changeLocation: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
    })),
    // Students transferred (auto-copied from current check-ins)
    studentsTransferred: v.optional(v.array(v.id("students"))),
  })
    .index("by_trip", ["tripId"]),

  // GPS Tracking
  gpsTracking: defineTable({
    tripId: v.id("trips"),
    latitude: v.number(),
    longitude: v.number(),
    speed: v.optional(v.number()),
    heading: v.optional(v.number()),
    timestamp: v.number(),
    // Source of GPS data
    source: v.optional(v.union(
      v.literal("mobile"),    // From driver/monitor mobile device
      v.literal("device"),    // From installed GPS device
      v.literal("api")        // From external API
    )),
    deviceId: v.optional(v.string()), // Device ID if from external source
  })
    .index("by_trip", ["tripId"])
    .index("by_timestamp", ["tripId", "timestamp"]),

  // Student Check-ins
  studentCheckins: defineTable({
    tripId: v.id("trips"),
    studentId: v.id("students"),
    stopId: v.id("routeStops"),
    // Who performed the check-in (audit trail)
    performedById: v.id("users"),
    performedByRole: v.union(v.literal("driver"), v.literal("monitor"), v.literal("admin")),
    checkinType: v.union(v.literal("pickup"), v.literal("dropoff")),
    timestamp: v.number(),
    latitude: v.number(),
    longitude: v.number(),
    qrScanned: v.boolean(),
    manualReason: v.optional(v.string()), // Reason if not QR scanned
    notes: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index("by_trip", ["tripId"])
    .index("by_student", ["studentId"])
    .index("by_performer", ["performedById"])
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

  // Notifications (with categories for filtering)
  notifications: defineTable({
    userId: v.id("users"),
    title: v.string(),
    message: v.string(),
    type: v.union(v.literal("info"), v.literal("warning"), v.literal("error"), v.literal("success")),

    // Category for filtering by notification type
    category: v.optional(v.union(
      v.literal("novedad"),            // Novedades de padres (ausencias, cambios)
      v.literal("relay"),              // Cambio de vehículo (Modo Relevo)
      v.literal("checkin"),            // Check-in/check-out de estudiantes
      v.literal("trip_update"),        // Actualizaciones de viaje (inicio, fin, retraso)
      v.literal("eta"),                // Notificaciones de ETA (llegando pronto)
      v.literal("incident"),           // Incidentes reportados
      v.literal("approval_request"),   // Solicitudes pendientes de aprobación
      v.literal("system")              // Sistema (mantenimiento, etc.)
    )),

    // Reference to related entity for deep linking
    relatedEntityType: v.optional(v.union(
      v.literal("trip"),
      v.literal("student"),
      v.literal("novedad"),
      v.literal("route_change_request"),
      v.literal("vehicle"),
      v.literal("incident")
    )),
    relatedEntityId: v.optional(v.string()), // ID as string for flexibility

    read: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_unread", ["userId", "read"])
    .index("by_category", ["userId", "category"]),

  // ============================================
  // NOVEDADES SYSTEM (Schedule Exceptions)
  // ============================================

  // Trip Students - Estudiantes programados por viaje específico
  // Se genera al crear/programar el trip, copiando de studentRoutes
  // Permite modificaciones específicas para ese día (ausencias, cambios de parada)
  tripStudents: defineTable({
    tripId: v.id("trips"),
    studentId: v.id("students"),
    stopId: v.id("routeStops"),          // Parada asignada (puede diferir de la base)

    // Estado del estudiante para este viaje
    status: v.union(
      v.literal("scheduled"),      // Programado normalmente
      v.literal("absent"),         // No viajará (novedad de ausencia)
      v.literal("parent_pickup"),  // Padre recoge directamente
      v.literal("stop_changed")    // Cambio de parada temporal
    ),

    // Si hay cambio de parada, guardar la original
    originalStopId: v.optional(v.id("routeStops")),

    // Referencia a la novedad que causó el cambio (si aplica)
    novedadId: v.optional(v.id("novedades")),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_trip", ["tripId"])
    .index("by_student", ["studentId"])
    .index("by_trip_status", ["tripId", "status"]),

  // Novedades - Registro de excepciones reportadas por padres
  // Ausencias, cambios de parada temporales, recogidas por padre, etc.
  novedades: defineTable({
    institutionId: v.id("institutions"),
    studentId: v.id("students"),
    createdBy: v.id("users"),            // Padre que reportó

    // Tipo de novedad
    type: v.union(
      v.literal("absence"),              // No viaja hoy/fecha específica
      v.literal("parent_pickup"),        // Padre recoge directamente
      v.literal("stop_change"),          // Cambio de parada temporal
      v.literal("early_pickup"),         // Salida temprana
      v.literal("late_arrival")          // Llegada tarde (abordará en otra parada o más tarde)
    ),

    // Ruta afectada
    affectedRouteType: v.union(
      v.literal("pickup"),               // Solo recogida (mañana)
      v.literal("dropoff"),              // Solo entrega (tarde)
      v.literal("both")                  // Ambos servicios
    ),

    // Fecha aplicable (YYYY-MM-DD)
    date: v.string(),

    // Para cambio de parada
    newStopId: v.optional(v.id("routeStops")),

    // Para early_pickup/late_arrival - hora específica
    time: v.optional(v.string()),        // HH:mm format

    // Razón del padre
    reason: v.string(),

    // Estado del workflow
    status: v.union(
      v.literal("pending"),              // Esperando revisión de coordinación
      v.literal("approved"),             // Aprobado por coordinación
      v.literal("rejected"),             // Rechazado por coordinación
      v.literal("acknowledged"),         // Crew vio la novedad
      v.literal("applied"),              // Se aplicó al viaje (tripStudents actualizado)
      v.literal("cancelled"),            // Padre canceló la novedad
      v.literal("expired")               // Pasó la fecha sin aplicar
    ),

    // Aprobación por coordinación (admin)
    approvedBy: v.optional(v.id("users")),
    approvedAt: v.optional(v.number()),
    approvalNotes: v.optional(v.string()),

    // Acuse de recibo del crew
    acknowledgedBy: v.optional(v.id("users")),
    acknowledgedAt: v.optional(v.number()),

    // Referencia al trip afectado (se llena al aplicar)
    tripId: v.optional(v.id("trips")),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_student", ["studentId"])
    .index("by_date", ["date"])
    .index("by_status", ["status"])
    .index("by_student_date", ["studentId", "date"])
    .index("by_institution_date", ["institutionId", "date"]),

  // Route Change Requests - Solicitudes de cambios permanentes
  // Para cambios recurrentes que requieren aprobación de coordinación
  // Ej: "Solo lunes a jueves", "Cambio de parada permanente", "Suspensión temporal"
  routeChangeRequests: defineTable({
    institutionId: v.id("institutions"),
    studentId: v.id("students"),
    createdBy: v.id("users"),            // Padre que solicita

    // Tipo de cambio solicitado
    requestType: v.union(
      v.literal("schedule_change"),      // Cambio de días (ej: solo Lun-Jue)
      v.literal("stop_change"),          // Cambio permanente de parada
      v.literal("route_change"),         // Cambio de ruta completa
      v.literal("service_suspension")    // Suspensión temporal del servicio
    ),

    // Detalles del cambio - rutas
    currentRouteId: v.optional(v.id("routes")),
    newRouteId: v.optional(v.id("routes")),

    // Detalles del cambio - paradas
    currentStopId: v.optional(v.id("routeStops")),
    newStopId: v.optional(v.id("routeStops")),

    // Para cambio de días (schedule_change)
    newSchedule: v.optional(v.object({
      daysOfWeek: v.array(v.number()),   // 0-6 (Dom=0, Lun=1, ..., Sab=6)
      affectedRouteTypes: v.array(v.union(v.literal("pickup"), v.literal("dropoff"))),
    })),

    // Fechas de vigencia
    effectiveFrom: v.string(),           // YYYY-MM-DD
    effectiveUntil: v.optional(v.string()), // YYYY-MM-DD (null = indefinido)

    // Razón de la solicitud
    reason: v.string(),

    // Workflow de aprobación
    status: v.union(
      v.literal("pending"),              // Esperando revisión
      v.literal("approved"),             // Aprobado por coordinación
      v.literal("rejected")              // Rechazado
    ),

    // Revisión
    reviewedBy: v.optional(v.id("users")),
    reviewedAt: v.optional(v.number()),
    reviewNotes: v.optional(v.string()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_student", ["studentId"])
    .index("by_status", ["status"])
    .index("by_institution_status", ["institutionId", "status"]),
});
