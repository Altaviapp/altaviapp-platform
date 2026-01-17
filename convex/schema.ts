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
    country: v.optional(v.string()), // 'EC' | 'CO' - default 'EC'
    department: v.optional(v.string()), // Province/Department code
    phone: v.optional(v.string()),
    email: v.string(),
    contactPerson: v.string(),
    isActive: v.boolean(),
    subscriptionPlan: v.union(v.literal("trial"), v.literal("basic"), v.literal("professional"), v.literal("enterprise")),
    subscriptionStatus: v.union(v.literal("active"), v.literal("suspended"), v.literal("cancelled")),

    // School location for route calculation (origin/destination)
    schoolLatitude: v.optional(v.number()),
    schoolLongitude: v.optional(v.number()),
    schoolAddress: v.optional(v.string()),

    // API Token for external GPS device authentication (centralized per institution)
    apiToken: v.optional(v.string()),
    apiTokenCreatedAt: v.optional(v.number()),

    // Custom grades configuration (optional - uses defaults if empty)
    grades: v.optional(v.array(v.string())),

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
    emailVerificationToken: v.optional(v.string()), // 6-digit code
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

    invitationCode: v.string(), // 6-digit code: 123456
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
  // Profile auto-created when user accepts invitation with role="driver"
  // User completes professional fields later from Crew app
  drivers: defineTable({
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    // Professional data (filled by driver in their profile)
    licenseNumber: v.optional(v.string()),
    licenseType: v.optional(v.string()), // C, D, E
    licenseExpiry: v.optional(v.number()),
    // Contact (may come from invitation or filled later)
    phone: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    // Profile completion tracking
    profileCompleted: v.optional(v.boolean()),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_institution", ["institutionId"]),

  // Monitors (Auxiliares - responsible for student check-in/out)
  // Profile auto-created when user accepts invitation with role="monitor"
  // User completes professional fields later from Crew app
  monitors: defineTable({
    userId: v.id("users"),
    institutionId: v.id("institutions"),
    // Professional data (filled by monitor in their profile)
    idNumber: v.optional(v.string()), // Cédula de identidad
    // Contact (may come from invitation or filled later)
    phone: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    // Certifications
    firstAidCertified: v.optional(v.boolean()),
    firstAidCertExpiry: v.optional(v.number()),
    childCareCertified: v.optional(v.boolean()),
    // Profile completion tracking
    profileCompleted: v.optional(v.boolean()),
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
    country: v.optional(v.string()), // 'EC' | 'CO' - for student address
    department: v.optional(v.string()), // Province/Department code
    city: v.optional(v.string()), // City name
    // Home coordinates for route optimization
    homeLatitude: v.optional(v.number()),
    homeLongitude: v.optional(v.number()),
    parentPhone: v.string(),
    parentEmail: v.string(),
    parentName: v.string(),
    secondaryParentEmail: v.optional(v.string()), // Second guardian email
    emergencyContact: v.string(),
    emergencyContactSecondary: v.optional(v.string()), // Secondary emergency contact
    // Linked guardian user IDs (populated when parents register)
    guardianUserIds: v.optional(v.array(v.id("users"))),
    // Profile photo (stored in Convex storage)
    photoStorageId: v.optional(v.id("_storage")),
    qrCode: v.string(),
    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_qr_code", ["qrCode"])
    .index("by_parent_email", ["parentEmail"])
    .index("by_secondary_parent_email", ["secondaryParentEmail"]),

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

    // Target time at school
    schoolArrivalTime: v.optional(v.string()), // For pickup routes - arrival at school
    schoolDepartureTime: v.optional(v.string()), // For dropoff routes - departure from school

    // Recurrence configuration
    recurrence: v.optional(
      v.object({
        type: v.union(
          v.literal("daily"),
          v.literal("weekly"),
          v.literal("monthly"),
          v.literal("one_time")
        ),
        daysOfWeek: v.optional(v.array(v.string())), // ["monday", "tuesday", ...] for daily
        dayOfWeek: v.optional(v.string()), // "monday" for weekly
        dayOfMonth: v.optional(v.number()), // 1-31 for monthly
        specificDate: v.optional(v.string()), // "YYYY-MM-DD" for one_time
      })
    ),

    // Route optimization data from Google Maps Directions API
    optimizedPolyline: v.optional(v.string()), // Encoded polyline
    estimatedDuration: v.optional(v.number()), // Minutes
    estimatedDistance: v.optional(v.number()), // Meters

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

    // Calculated ETA from route optimization
    estimatedArrivalTime: v.optional(v.string()), // HH:mm format
    durationFromPrevious: v.optional(v.number()), // Seconds from previous stop

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

    // Permanent schedule exceptions - days student does NOT travel
    // e.g., ["friday", "saturday"] means student doesn't travel those days
    excludeDays: v.optional(v.array(v.string())),

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
    // Pre-trip vehicle checklist data (optional)
    checklistData: v.optional(v.object({
      completedAt: v.number(),
      items: v.array(v.object({
        id: v.string(),
        label: v.string(),
        category: v.string(),
        checked: v.boolean(),
      })),
      notes: v.optional(v.string()),
      allPassed: v.boolean(),
    })),
    // Novedades confirmation data (from crew review step)
    novedadesConfirmedAt: v.optional(v.number()),
    confirmedNovedadIds: v.optional(v.array(v.id("novedades"))),
    // Trip completion statistics (populated when trip completes)
    stats: v.optional(v.object({
      duration: v.number(), // milliseconds
      plannedDuration: v.number(), // milliseconds
      studentsPickedUp: v.number(),
      studentsAbsent: v.number(),
      studentsNoShow: v.number(),
      incidentsCount: v.number(),
      stopsCompleted: v.number(),
      stopsSkipped: v.number(),
      totalStops: v.number(),
    })),
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

  // Trip Events (Timeline for real-time history)
  tripEvents: defineTable({
    tripId: v.id("trips"),
    institutionId: v.id("institutions"),
    type: v.union(
      // Trip lifecycle events
      v.literal("trip_started"),
      v.literal("trip_completed"),
      v.literal("trip_cancelled"),
      // Stop events
      v.literal("arrived_at_stop"),
      v.literal("departed_from_stop"),
      v.literal("stop_skipped"),
      v.literal("stop_note_added"),
      // Student events
      v.literal("student_checkin"),
      v.literal("student_checkout"),
      v.literal("student_absent"),
      v.literal("student_no_show"),
      // Crew events
      v.literal("checklist_completed"),
      v.literal("relay_mode_activated"),
      v.literal("relay_mode_deactivated"),
      // Incident events
      v.literal("incident_reported"),
      v.literal("incident_resolved"),
      // Novedad events
      v.literal("novedad_reported"),
      v.literal("novedad_approved"),
      v.literal("novedad_rejected"),
      // System events
      v.literal("gps_lost"),
      v.literal("gps_restored"),
      v.literal("geofence_entered"),
      v.literal("geofence_exited")
    ),
    // Event details
    title: v.string(),
    description: v.optional(v.string()),
    // Related entities
    stopId: v.optional(v.id("routeStops")),
    studentId: v.optional(v.id("students")),
    incidentId: v.optional(v.id("incidents")),
    novedadId: v.optional(v.id("novedades")),
    // Actor who triggered the event
    actorId: v.optional(v.id("users")),
    actorRole: v.optional(v.union(
      v.literal("driver"),
      v.literal("monitor"),
      v.literal("admin"),
      v.literal("parent"),
      v.literal("system")
    )),
    // Location at time of event
    latitude: v.optional(v.number()),
    longitude: v.optional(v.number()),
    // Metadata
    metadata: v.optional(v.any()), // Flexible additional data
    timestamp: v.number(),
    createdAt: v.number(),
  })
    .index("by_trip", ["tripId"])
    .index("by_trip_timestamp", ["tripId", "timestamp"])
    .index("by_type", ["type"])
    .index("by_institution", ["institutionId"]),

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

  // Novedad Types - Tipos de novedad configurables por institución
  // Admin puede crear/modificar tipos de novedades con diferentes comportamientos
  novedadTypes: defineTable({
    institutionId: v.id("institutions"),

    // Identificación
    code: v.optional(v.string()),        // DEPRECATED - será eliminado
    name: v.string(),                    // "Ausencia", "Cita Médica"
    description: v.string(),             // Texto de ayuda para padres

    // Visual
    icon: v.string(),                    // Nombre icono Lucide: "UserMinus", "Car"
    color: v.string(),                   // Color Tailwind: "red", "blue", "yellow"

    // Categoría de comportamiento - determina cómo afecta al viaje
    // Simplificado a 5 categorías principales
    category: v.union(
      v.literal("absence"),              // No viaja (ausencia)
      v.literal("third_party_pickup"),   // Tercero autorizado recibe en parada
      v.literal("temporary_stop_change"),// Cambio de parada temporal
      v.literal("address_change"),       // Cambio de domicilio permanente
      v.literal("service_suspension"),   // Suspensión temporal del servicio
      // DEPRECATED - mantener para backwards compatibility, migrar después
      v.literal("pickup_change"),
      v.literal("stop_change"),
      v.literal("time_change"),
      v.literal("location_change"),
      v.literal("schedule_change"),
      v.literal("route_change"),
      v.literal("other")
    ),

    // Duración permitida para este tipo
    durationType: v.union(
      v.literal("single_day"),           // Un día específico
      v.literal("date_range"),           // Rango de fechas
      v.literal("permanent"),            // Hasta nuevo aviso
      v.literal("recurring")             // Días específicos de semana
    ),

    // Workflow
    requiresApproval: v.boolean(),       // Requiere aprobación de admin
    affectsTrips: v.boolean(),           // Afecta viajes programados
    affectsRouteCalculation: v.boolean(), // Debe recalcular ruta

    // Evidencia
    evidenceRequired: v.boolean(),       // Evidencia obligatoria
    evidenceOptional: v.boolean(),       // Evidencia opcional (si no es requerida)
    maxEvidenceFiles: v.optional(v.number()), // Máximo archivos (default: 5)
    allowedFileTypes: v.optional(v.array(v.string())), // ["image/*", "application/pdf"]

    // Validaciones
    minAdvanceHours: v.optional(v.number()), // Horas mínimas de anticipación
    reasonRequired: v.boolean(),          // Razón obligatoria

    // Sistema
    isSystemType: v.boolean(),           // Tipos default (no se pueden eliminar)
    isActive: v.boolean(),
    sortOrder: v.number(),               // Orden en selector

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_code", ["institutionId", "code"])
    .index("by_active", ["institutionId", "isActive"])
    .index("by_category", ["institutionId", "category"]),

  // Trip Students - Estudiantes programados por viaje específico
  // Se genera al crear/programar el trip, copiando de studentRoutes
  // Permite modificaciones específicas para ese día (ausencias, cambios de parada)
  tripStudents: defineTable({
    tripId: v.id("trips"),
    studentId: v.id("students"),
    stopId: v.id("routeStops"),          // Parada asignada (puede diferir de la base)

    // Estado del estudiante para este viaje
    status: v.union(
      v.literal("scheduled"),        // Programado normalmente
      v.literal("absent"),           // No viajará (novedad de ausencia)
      v.literal("third_party_pickup"), // Tercero autorizado recibe en parada
      v.literal("stop_changed"),     // Cambio de parada temporal
      v.literal("parent_pickup")     // DEPRECATED - usar third_party_pickup
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
  // Sistema unificado: ausencias, cambios de parada, cambios de ubicación, suspensiones, etc.
  novedades: defineTable({
    institutionId: v.id("institutions"),
    studentId: v.id("students"),
    createdBy: v.id("users"),            // Padre que reportó

    // TIPO (referencia a configurable) - nuevo sistema
    typeId: v.optional(v.id("novedadTypes")),  // Optional para backwards compatibility
    typeCategorySnapshot: v.optional(v.string()), // Snapshot de category al crear

    // Tipo de novedad (legacy - mantener para backwards compatibility)
    type: v.optional(v.union(
      v.literal("absence"),              // No viaja hoy/fecha específica
      v.literal("parent_pickup"),        // Padre recoge directamente
      v.literal("stop_change"),          // Cambio de parada temporal
      v.literal("early_pickup"),         // Salida temprana
      v.literal("late_arrival")          // Llegada tarde
    )),

    // RUTA ESPECÍFICA (nuevo)
    routeId: v.optional(v.id("routes")), // Si se especifica ruta específica

    // Ruta afectada (por tipo)
    affectedRouteType: v.union(
      v.literal("pickup"),               // Solo recogida (mañana)
      v.literal("dropoff"),              // Solo entrega (tarde)
      v.literal("both")                  // Ambos servicios
    ),

    // FECHAS - sistema expandido
    durationType: v.optional(v.union(
      v.literal("single_day"),           // Un día específico
      v.literal("date_range"),           // Rango de fechas
      v.literal("permanent"),            // Hasta nuevo aviso
      v.literal("recurring")             // Días específicos de semana
    )),
    startDate: v.optional(v.string()),   // YYYY-MM-DD (nuevo campo)
    endDate: v.optional(v.string()),     // YYYY-MM-DD (para rangos/permanente)
    recurringDays: v.optional(v.array(v.number())), // 0-6 para recurrente

    // Fecha aplicable (legacy - mantener para backwards compatibility)
    date: v.optional(v.string()),        // YYYY-MM-DD

    // Para cambio de parada
    newStopId: v.optional(v.id("routeStops")),

    // CAMBIOS DE UBICACIÓN (permanente - address_change)
    locationChange: v.optional(v.object({
      previousLatitude: v.number(),
      previousLongitude: v.number(),
      previousAddress: v.string(),
      newLatitude: v.number(),
      newLongitude: v.number(),
      newAddress: v.string(),
      distanceChange: v.number(),        // Metros de diferencia
      suggestedStopId: v.optional(v.id("routeStops")),
    })),

    // UBICACIÓN TEMPORAL (temporary_stop_change)
    temporaryLocation: v.optional(v.object({
      latitude: v.number(),
      longitude: v.number(),
      address: v.string(),
    })),

    // PERSONA AUTORIZADA (third_party_pickup)
    authorizedPerson: v.optional(v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.optional(v.string()),
    })),

    // Para early_pickup/late_arrival - hora específica (DEPRECATED)
    time: v.optional(v.string()),        // HH:mm format

    // Razón del padre
    reason: v.string(),

    // Notas del admin (nuevo)
    adminNotes: v.optional(v.string()),

    // EVIDENCIA (nuevo)
    attachments: v.optional(v.array(v.object({
      storageId: v.id("_storage"),
      fileName: v.string(),
      fileType: v.string(),
      fileSize: v.number(),
      uploadedAt: v.number(),
    }))),

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

    // Referencia a trips afectados (expandido de single a array)
    tripId: v.optional(v.id("trips")),                // Legacy - single trip
    appliedToTrips: v.optional(v.array(v.id("trips"))), // Nuevo - multiple trips

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_student", ["studentId"])
    .index("by_date", ["date"])
    .index("by_status", ["status"])
    .index("by_student_date", ["studentId", "date"])
    .index("by_institution_date", ["institutionId", "date"])
    .index("by_type", ["typeId"])
    .index("by_route", ["routeId"])
    .index("by_start_date", ["institutionId", "startDate"]),

  // ============================================
  // GPS EXTERNAL DEVICES SYSTEM
  // ============================================

  // GPS Devices - Dispositivos GPS externos registrados
  // Separado de vehículos para permitir reasignación dinámica
  gpsDevices: defineTable({
    institutionId: v.id("institutions"),

    // Identificación
    deviceId: v.string(),           // ID único del dispositivo (IMEI, serial, etc.)
    name: v.string(),               // Nombre amigable ("GPS Bus Ruta Norte")

    // Configuración de mapeo de campos del webhook
    fieldMapping: v.optional(v.object({
      latitude: v.string(),         // Ej: "data.lat" o "position.latitude"
      longitude: v.string(),        // Ej: "data.lng" o "position.longitude"
      speed: v.optional(v.string()),
      heading: v.optional(v.string()),
      timestamp: v.optional(v.string()),
      deviceIdField: v.string(),    // Campo que identifica el device en el payload
    })),

    // Asignación actual a vehículo
    vehicleId: v.optional(v.id("vehicles")),

    // Estado del dispositivo
    status: v.union(
      v.literal("pending_config"),  // Recién creado, sin configurar
      v.literal("testing"),         // En modo sandbox
      v.literal("active"),          // Funcionando en producción
      v.literal("inactive")         // Desactivado
    ),

    // Monitoreo
    lastSeen: v.optional(v.number()),           // Última señal recibida (timestamp)
    lastPayloadSample: v.optional(v.string()),  // Último JSON recibido (para debug)

    isActive: v.boolean(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_institution", ["institutionId"])
    .index("by_device_id", ["deviceId"])
    .index("by_vehicle", ["vehicleId"])
    .index("by_status", ["status"]),

  // GPS Device Assignments - Historial de asignaciones dispositivo-vehículo
  // Para auditoría: qué dispositivo estuvo en qué vehículo y cuándo
  gpsDeviceAssignments: defineTable({
    deviceId: v.id("gpsDevices"),
    vehicleId: v.id("vehicles"),
    institutionId: v.id("institutions"),

    assignedAt: v.number(),
    unassignedAt: v.optional(v.number()),
    assignedBy: v.id("users"),
    unassignedBy: v.optional(v.id("users")),

    reason: v.optional(v.string()),  // "Cambio de vehículo", "Mantenimiento", etc.
  })
    .index("by_device", ["deviceId"])
    .index("by_vehicle", ["vehicleId"])
    .index("by_institution", ["institutionId"]),

  // GPS Webhook Samples - Samples de webhooks para configuración
  // Usado en el sandbox para analizar payload y configurar mapeo
  gpsWebhookSamples: defineTable({
    institutionId: v.id("institutions"),
    deviceId: v.optional(v.id("gpsDevices")),  // Null si aún no hay device configurado

    rawPayload: v.string(),         // JSON original recibido
    parsedFields: v.optional(v.object({
      latitude: v.optional(v.number()),
      longitude: v.optional(v.number()),
      speed: v.optional(v.number()),
      heading: v.optional(v.number()),
      timestamp: v.optional(v.number()),
      detectedDeviceId: v.optional(v.string()),
    })),

    receivedAt: v.number(),
    sourceIp: v.optional(v.string()),
    isProcessed: v.boolean(),       // Si ya se usó para configurar un device
  })
    .index("by_institution", ["institutionId"])
    .index("by_device", ["deviceId"])
    .index("by_received", ["institutionId", "receivedAt"]),

  // ============================================
  // USER PREFERENCES (Parent App - Alert Settings)
  // ============================================

  userPreferences: defineTable({
    userId: v.id("users"),
    studentId: v.id("students"),
    institutionId: v.id("institutions"),

    // Alert settings
    alertsEnabled: v.boolean(),          // Master toggle for alerts
    alertRadius: v.number(),             // Distance in meters (500, 1000, 2000)

    // Push notification settings (future use)
    pushToken: v.optional(v.string()),   // FCM/APNs token
    pushEnabled: v.optional(v.boolean()),

    // Last alert tracking (to avoid duplicate alerts)
    lastAlertTripId: v.optional(v.id("trips")),
    lastAlertSentAt: v.optional(v.number()),

    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_user", ["userId"])
    .index("by_user_student", ["userId", "studentId"])
    .index("by_institution", ["institutionId"]),
});
