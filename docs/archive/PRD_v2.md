# Altaviapp - Product Requirements Document

**Version:** 2.0
**Date:** January 2025
**Status:** Active Development
**Owner:** Altaviapp Team

---

## 🎯 PRODUCT VISION

### What is Altaviapp?

Altaviapp is a comprehensive school transport management platform designed for educational institutions in Ecuador. It provides real-time GPS tracking, automated student check-ins, and instant parent notifications to ensure student safety and operational efficiency.

### Target Market

- **Primary**: Private schools in Quito, Ecuador (100+ institutions)
- **Secondary**: Public schools and educational networks
- **Future**: Expansion to other Latin American cities

### Business Objectives

1. **Safety First**: Reduce student transport incidents by 90%
2. **Parent Confidence**: Achieve 95%+ parent satisfaction with real-time visibility
3. **Operational Efficiency**: Cut administrative time by 60% through automation
4. **Scalability**: Support 100+ schools and 10,000+ students within 12 months

---

## 👥 USER ROLES

| Role (Internal) | Role (UI Name) | Description | Access Level |
|-----------------|----------------|-------------|--------------|
| **super_admin** | Super Admin | Platform owner, manages all institutions | Level 1000 (Full access) |
| **admin** | Coordinador | School administrator, manages institution fleet and routes | Level 500 (Institution scope) |
| **monitor** | Auxiliar | Bus monitor, records student check-ins, reports incidents | Level 150 (Assigned trips, student operations) |
| **driver** | Conductor | Vehicle operator, starts/ends trips, GPS tracking | Level 100 (Assigned trips, vehicle operations) |
| **parent** | Padre/Tutor | Student guardian, tracks child's transport | Level 10 (Own students only) |

### Crew Roles (Driver + Monitor)

Both **driver** and **monitor** use the same mobile app (**Altaviapp Crew**), but with different permissions:

| Functionality | Driver (Conductor) | Monitor (Auxiliar) |
|---------------|:------------------:|:------------------:|
| Login and view assigned routes | Yes | Yes |
| Pre-trip vehicle checklist | Yes | No |
| Start/end trip | Yes | No |
| GPS tracking (send) | Yes | No |
| View trip progress | Yes | Yes |
| Student check-in/out (QR) | Fallback only* | Yes |
| Report incidents | No | Yes |
| View parent notifications | No | Yes |

*Driver can perform check-ins only if no monitor is assigned to the trip (fallback mode).

---

## 🏗️ SYSTEM ARCHITECTURE

### Technology Stack (High Level)

| Component | Technology | Purpose |
|-----------|------------|---------|
| **Database** | Convex | Real-time data, serverless functions |
| **Authentication** | Custom Token-based (PBKDF2) | User management, role-based access |
| **Frontend (Admin)** | Next.js 14+ PWA | Admin dashboard (`apps/admin/`) |
| **Frontend (Parent)** | Next.js 14+ PWA | Parent portal (`apps/parent/`) |
| **Frontend (Crew)** | Next.js 14+ PWA | Driver/Monitor app (`apps/crew/`) |
| **Maps** | Leaflet + OpenStreetMap | GPS tracking, route planning |
| **Email** | Resend | Invitations, password reset, notifications |
| **Notifications** | In-app (Convex) | Real-time parent alerts (no WhatsApp) |
| **Monorepo** | Turborepo + pnpm | Package management |
| **UI Components** | shadcn/ui + Tailwind CSS | Consistent design system |

**Note**: Implementation details in [Technical-Specification.md](../Technical-Specification.md)

**Original vs Actual Stack**:
| Originally Planned | Actual Implementation |
|-------------------|----------------------|
| Bubble.io (Admin/Parent) | Next.js 14+ PWA |
| JWT tokens | Custom session tokens (30-day expiry) |
| 4 roles | 5 roles (added monitor) |

**Design Decisions**:
- **In-app notifications** instead of WhatsApp: Simpler, no external API dependency, real-time via Convex subscriptions

**Out of Scope (v1.0)** - Deferred to v2.0:
- Vehicle documents management (insurance, inspection uploads)
- Maintenance scheduling and history
- Reports and analytics dashboard (basic stats implemented, full dashboard deferred)
- Contact driver/admin feature (direct messaging)
- Incident photo/video attachments (text-only incidents for v1.0)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER (Next.js 14+ PWA)     │
├─────────────────────────────────────────────────────────┤
│  apps/admin/          │  apps/parent/  │  apps/crew/    │
│  ├── Dashboard        │  ├── Tracking  │  ├── Trips     │
│  ├── Fleet            │  ├── Novedades │  ├── Check-ins │
│  ├── Routes           │  ├── History   │  ├── Calendar  │
│  ├── Students         │  └── Profile   │  └── Profile   │
│  └── Settings         │                │                │
└─────────────────┬───────────────────┬───────────────────┘
                  │                   │
┌─────────────────▼───────────────────▼───────────────────┐
│              AUTHENTICATION LAYER                       │
│  Custom Token-based Auth (PBKDF2) + RBAC (5 roles)      │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                 BACKEND LAYER (Convex)                  │
│  Real-time Database │ Server Functions │ Live Queries   │
│  Mutations │ Subscriptions │ Scheduled Actions          │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│          EXTERNAL SERVICES                              │
│  Resend (Email) │ OpenStreetMap │ Google Maps API       │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 PRODUCT MODULES

### Phase 1: Foundation (Weeks 1-3)

#### Module 1: Authentication & Authorization
**Owner**: Backend Team
**Timeline**: Week 1
**Status**: ✅ Implemented (with variations from original spec)

**Functional Requirements**:
- [x] User registration with email verification (6-digit code, 24h expiry, one-click verification button)
- [x] Token-based authentication (custom session tokens, not JWT)
- [x] Role-based access control (5 roles: super_admin, admin, monitor, driver, parent)
- [x] Session management (30-day default expiry, configurable)
- [x] Password reset flow (6-digit code, 1h expiry, invalidates all sessions)
- [x] User profile management (update name, phone, deactivate/reactivate)
- [x] Account locking after 5 failed login attempts (30 min)
- [x] Institution registration with subscription plans (basic, professional, enterprise)

**Implementation Notes**:
| Original Spec | Actual Implementation | Reason |
|---------------|----------------------|--------|
| JWT tokens | Custom session tokens in DB | Allows server-side logout, better security |
| 24h token expiry | 30-day default | UX preference, configurable |
| 4 roles | 5 roles (added monitor) | Business requirement for bus auxiliar |
| bcrypt | PBKDF2 (100k iterations) | Web Crypto API compatible, equivalent security |
| 8-digit verification code | 6-digit code + auto-verify button | UX simplification, one-click email verification |
| Ecuador-only phone | Multi-country phone with prefix selector | Support for Colombia expansion |
| Ecuador location only | Country/Department/City selectors | Multi-country support (EC, CO) |

**Internationalization (v1.1)**:
- [x] Multi-country phone support (Ecuador +593, Colombia +57) with prefix selector
- [x] Country/Department/City selectors in all location forms
- [x] Automatic country detection based on user IP location
- [x] Timezone support: America/Guayaquil (EC), America/Bogota (CO)

**Success Criteria**:
- [x] All 5 roles can authenticate successfully
- [x] RBAC enforced on all endpoints
- [ ] Token refresh without re-login (not implemented - long session instead)

---

#### Module 2: Multi-Tenancy (Institutions)
**Owner**: Backend Team
**Timeline**: Week 2-3
**Status**: ✅ Implemented (v1.0 scope)

**Functional Requirements**:
- [x] Institution registration and onboarding (via `registerInstitution` mutation)
- [x] Institution profile management (name, address, contact)
- [x] School location configuration (latitude, longitude, address for route planning)
- [x] Data isolation between institutions (`verifyInstitutionAccess()`, row-level security)
- [x] Institution admin assignment (via invitation system)
- [x] Subscription plan management (basic, professional, enterprise)
- [x] Institution statistics (user/vehicle/student/route counts)

**Out of Scope (v1.0)**:
- Institution settings (working hours, notification preferences) - Deferred to v2.0

**Implementation Notes**:
- Multi-tenancy enforced via `institutionId` index on all tables
- Super admins can access all institutions
- School location picker uses Google Maps integration

**Success Criteria**:
- [x] 10+ institutions can operate independently
- [x] Zero cross-institution data leaks
- [x] Admin can manage only their institution

---

### Phase 2: Core Operations (Weeks 4-9)

#### Module 3: Fleet Management
**Owner**: Backend Team
**Timeline**: Week 4
**Status**: ✅ Implemented (v1.0 scope)

**Functional Requirements**:
- [x] Vehicle registration (license plate, brand, model, year, color, capacity)
- [x] Driver assignment to vehicles (via route assignment)
- [x] Driver profiles (license number, license type C/D/E, expiry, contact, emergency info)
- [x] Monitor profiles (ID number, phone, certifications, emergency contact)
- [x] Vehicle status tracking (active, maintenance, out_of_service)
- [x] GPS configuration (mobile, device, API sources)

**Out of Scope (v1.0)**:
- Vehicle document management (insurance, inspection, registration) - Deferred to v2.0
- Maintenance scheduling and history - Deferred to v2.0
- Document expiration alerts - Deferred to v2.0

**Implemented Features**:
| Component | Status | Backend | Admin UI |
|-----------|--------|---------|----------|
| Vehicle CRUD | ✅ | `convex/vehicles.ts` | Fleet page with list/detail/edit |
| Driver CRUD | ✅ | `convex/drivers.ts` | Fleet page with list/detail/edit |
| Monitor CRUD | ✅ | `convex/monitors.ts` | Fleet page with list/detail/edit |
| GPS Config | ✅ | `updateGPSConfig` mutation | Vehicle detail page |
| License tracking | ✅ | Schema has expiry date | Driver detail shows license |
| Monitor certifications | ✅ | First aid, child care | Profile completion tracking |

**Success Criteria**:
- [x] Admin can CRUD vehicles and drivers
- [x] Vehicle-driver assignment validation (via routes)

---

#### Module 4: Student Management
**Status**: ✅ Implemented

**Core Features**:
- [x] Student CRUD (firstName, lastName, grade, dateOfBirth, address)
- [x] Parent/guardian linkage (parentEmail, secondaryParentEmail, guardianUserIds)
- [x] QR code generation per student (JSON: studentId, institutionId, timestamp)
- [x] Emergency contacts (phone, relationship) and medical notes
- [x] Student status (active/inactive) with auto-linkage via guardianUserIds

**Home Location**:
- [x] Students have home location for route assignment (homeLatitude, homeLongitude, homeAddress)
- [x] Parent can set/update from Parent Portal
- [x] Admin can set/update from Admin Dashboard
- [x] Location via address input (geocoding) or map click

**Bulk Import**:
- [x] CSV upload with staging/preview validation
- [x] Inline error highlighting before processing
- [x] Household detection (group by parentEmail, case-insensitive)
- [x] Downloadable CSV template

**Parent Onboarding**:
- [x] Invitation flow: send now or save for later
- [x] Status tracking: provisorio → invitado → activo
- [x] Self-service activation with location validation (GPS coordinates)
- [x] Secondary guardian support (from Parent App or Admin)

**Grade Configuration**:
- [x] Institution-level custom grades (Admin Settings `/settings/grades`)
- [x] Default presets: Prekinder to 3ro Bachillerato
- [x] Forms use institution's configured grades

**API**: `validateStudentImport`, `importStudentsBulk`, `inviteSecondaryGuardian`
**UI**: `/students`, `/students/new`, `/students/[id]`, `/students/import`, `/settings/grades`

---

#### Module 5: Route Planning
**Status**: ✅ Implemented

**School Location Configuration**:
- [x] Institution must have school location configured
- [x] Admin configures school location in Settings (`updateSchoolLocation` mutation)
- [x] School location used as origin (dropoff) or destination (pickup) in route calculation
- [x] Store schoolLatitude, schoolLongitude, schoolAddress on institution record

**5.3 Multi-Step Route Creation Wizard**:

*Step 1 - Route Planning*:
- [x] Select route type: pickup (recogida) or dropoff (entrega)
- [x] Set target time: school arrival time (pickup) or school departure time (dropoff)
- [x] Select vehicle (displays capacity)
- [x] Select driver (required)
- [x] Select monitor (optional)
- [x] Route name (auto-generated or custom)

*Step 2 - Stop Assignment*:
- [x] Display header with route info: name, target time
- [x] Dynamic stats: #stops, duration, start/end time (calculated)
- [x] Student selector with tabs: "Disponibles" / "Seleccionados"
- [x] Filter: Search by name, dropdown by grade
- [x] Only show students WITHOUT route of same type AND with location assigned
- [x] Interactive map showing school marker (distinct icon) and selected students
- [x] "Calculate Route" button triggers optimization algorithm
- [x] Route optimization determines optimal stop order (Haversine-based)
- [x] Calculate ETAs for each stop based on target school time
- [x] Display optimized polyline on map
- [x] Selected students tab shows: stop number, name, ETA
- [x] Allow manual reorder with drag-and-drop
- [x] "Recalculate" button after manual changes

*Step 3 - Confirmation*:
- [x] Recurrence selector:
  - Daily: select days of week (checkboxes)
  - Weekly: select day of week
  - Monthly: select day of month
  - One-time: select specific date
- [x] Route summary with all details
- [x] Mini-map with final route visualization
- [x] Active/Inactive toggle

**5.4 Route Optimization**:
- [x] Route optimization using Haversine-based algorithm
- [x] Calculate optimal stop order minimizing travel distance
- [x] Store encoded polyline for route visualization
- [x] Calculate and store estimated duration and distance
- [x] Calculate ETA for each stop based on target arrival/departure time
- [x] Traffic not considered at planning time (dynamic ETA at runtime)

**5.5 Route Visualization**:
- [x] Display route polyline on map
- [x] Route visualization in Admin (route detail), Parent (tracking), Crew (trip map)
- [x] Differentiate stop markers: completed, current, upcoming
- [x] School marker with distinct icon

**Success Criteria**:
- [x] Admin can create routes via 3-step wizard
- [x] Route optimization calculates optimal stop order
- [x] Students auto-assigned to stops based on home location
- [x] Route visualized with polyline paths
- [x] Estimated travel time calculated per stop
- [x] Routes configurable with recurrence (daily/weekly/monthly/one-time)
- [x] Edit route using same wizard pattern (`updateRouteWithStops` mutation)
- [x] Delete route permanently (`deleteRoute` mutation)
- [x] Activate/deactivate toggle on route detail page

---

#### Module 6: Trip Management
**Owner**: Backend Team
**Timeline**: Week 7
**Status**: ✅ Fully Implemented

**Functional Requirements**:

**6.1 Lazy Trip Creation (On-Demand)**:
- [x] Trips are NOT pre-created in database
- [x] Trip created automatically when driver taps "Start Trip" (`startTripFromRoute`)
- [x] Driver selects route from assigned routes valid for today
- [x] Route recurrence validated before allowing trip start (`validateRouteForDate`)
- [x] Trip record created with status "in_progress"
- [x] TripStudents generated dynamically at trip start:
  - Query active studentRoutes for the route
  - Filter by excludeDays (skip students whose excludeDays includes today)
  - Apply novedades for the date
  - Priority: absence > parent_pickup > stop_change > scheduled

**6.2 Route Recurrence Validation**:
- [x] Daily routes: check if today's day of week is in daysOfWeek array
- [x] Weekly routes: check if today matches dayOfWeek
- [x] Monthly routes: check if today's date matches dayOfMonth
- [x] One-time routes: check if today matches specificDate
- [x] Only show routes valid for today in driver's list (`listRoutesForDriverToday`)

**6.3 Student Exclusion Days**:
- [x] Admin can configure excludeDays per student-route assignment
- [x] Example: ["friday", "saturday"] means student doesn't travel those days
- [x] Students with excludeDays including today are NOT added to tripStudents
- [x] Used for permanent schedule exceptions

**6.4 Trip Lifecycle**:
- [x] Trip status: in_progress → completed (no "scheduled" state with lazy creation)
- [x] Start trip: create trip record, generate tripStudents, record initial GPS
- [x] Complete trip: set endTime, record final GPS, update status
- [x] Cancel trip: allowed while in_progress, notifies parents
- [x] Real-time GPS tracking (`convex/gpsTracking.ts` - updates every 15 seconds)

**6.5 Trip History and Logs**:
- [x] Trip history searchable by date, route, driver (`getDriverTripHistory`)
- [x] Each trip stores: duration, distance, students transported, stops completed
- [x] GPS location history stored per trip (`gpsTracking` table)
- [x] Check-in/check-out events linked to trip (`studentCheckins` table)

**6.6 Live Trip Monitoring**:
- [x] Admin dashboard shows all active trips in real-time
- [x] Map view with vehicle positions (`subscribeToLocation`)
- [x] Trip progress (stops completed / total)
- [x] ETA updates based on current position and speed (`convex/lib/eta.ts`)

**6.7 Advanced Features (Bonus)**:
- [x] Vehicle Relay Mode (`reassignVehicle`) - mid-trip vehicle/driver changes
- [x] Real-time ETA with Haversine distance calculation
- [x] Speed tracking and delay detection (on_time/slight_delay/delayed/very_delayed)
- [x] Parent notifications on trip start (`notifyParentsOfTripStart`)
- [x] Comprehensive parent tracking endpoint (`getActiveTripForStudent`)
- [x] Calendar view for crew (`getTripsForCrewByMonth`)

**Success Criteria**:
- [x] Drivers see only routes valid for today based on recurrence
- [x] Trip created instantly when driver starts (lazy creation)
- [x] Student exclusion days respected automatically
- [x] GPS location updates in real-time
- [x] Admin can monitor all active trips
- [x] Trip history searchable with full audit trail

---

#### Module 7: Student Check-ins
**Owner**: Backend + Mobile Team
**Timeline**: Week 8
**Status**: ✅ Implemented

**Functional Requirements**:
- [x] QR code scanning for student identification (`convex/students.ts:validateQRCode`)
- [x] Manual check-in (if QR scan fails) - `method: "manual"` parameter
- [x] Check-in validation (correct route, correct stop, active trip)
- [x] Check-out at destination
- [x] Timestamp and GPS location recording
- [x] Automatic parent notification (in-app via `notifications` table)
- [x] Check-in status dashboard (`getStudentCheckinsForToday`)

**Implementation Notes**:
- QR code contains JSON: `{ studentId, institutionId, timestamp }`
- Check-in creates record in `studentCheckins` table
- In-app notification created for parents on check-in/check-out
- Real-time updates via Convex subscriptions
- Email notifications available via Resend (if configured)

**Success Criteria**:
- [x] QR scan validates student identity
- [x] Parent receives in-app notification (real-time)
- [x] Check-in history per student (`getCheckinsForStudent`)
- [ ] Offline check-in queued and synced (PWA capability, not fully tested)

---

#### Module 8: Incident Management
**Owner**: Backend Team
**Timeline**: Week 9
**Status**: ✅ Implemented (v1.0 scope)

**Functional Requirements**:
- [x] Incident reporting (accident, delay, emergency, behavior, medical, other)
- [x] Severity levels (low, medium, high, critical)
- [x] Automatic escalation for critical incidents (notifies admin immediately)
- [x] Incident assignment and resolution workflow (`resolveIncident` mutation)
- [x] Parent notification for incidents involving their child (in-app)
- [x] Incident history and analytics (`getIncidentsForInstitution`)

**Out of Scope (v1.0)**:
- Photo/video attachment support - Deferred to v2.0 (text-only incidents for now)

**Implementation Notes**:
- Incidents linked to trip and optionally to specific student
- Location (latitude, longitude) recorded at incident time
- Resolution notes and resolvedBy tracked
- Critical/high severity auto-notifies institution admins
- In-app notifications (real-time via Convex)

**Success Criteria**:
- [x] Crew can report incident quickly
- [x] Critical incidents trigger immediate admin alerts
- [x] Admin can review and resolve incidents
- [x] Parents notified via in-app notifications

---

#### Module 8.1: Novedades (Schedule Exceptions)
**Owner**: Backend Team
**Timeline**: Week 9
**Status**: ✅ Fully Implemented

**Functional Requirements**:

**8.1.1 Temporary Novedades (Daily Exceptions)**:
- [x] Parent can create novedad for specific date
- [x] Types of temporary novedades:
  - **Ausencia (absence)**: Student won't travel that day
  - **Recogida por padre (parent_pickup)**: Parent picks up student directly
  - **Cambio de parada (stop_change)**: Different pickup/dropoff location for one day
  - **Salida temprana (early_pickup)**: Student leaves early
  - **Llegada tardía (late_arrival)**: Student arrives late
- [x] Affected route type: pickup, dropoff, or both
- [x] Parent provides reason (required)

**8.1.2 Parent Pickup Workflow (NO APPROVAL REQUIRED)**:
- [x] Parent creates parent_pickup novedad
- [x] Status goes directly to "acknowledged" (skip pending/approved states)
- [x] Crew is notified immediately (driver + monitor assigned to route)
- [x] Parent can create until trip starts
- [x] Used for emergencies and last-minute changes

**8.1.3 Other Novedades Workflow (APPROVAL REQUIRED)**:
- [x] Parent creates novedad → status: "pending"
- [x] Admin/Coordinator reviews and approves/rejects → status: "approved" or "rejected"
- [x] Crew acknowledges seeing the novedad → status: "acknowledged"
- [x] Applied to trip at trip start → status: "applied"
- [x] Notifications sent at each state change

**8.1.4 Novedad Application to Trips**:
- [x] At trip start (lazy creation), query novedades for the date
- [x] Priority order for conflicting novedades:
  1. absence (highest priority - student marked absent)
  2. parent_pickup (student marked for parent pickup)
  3. stop_change (student uses different stop)
  4. scheduled (default - normal trip)
- [x] TripStudent record stores novedadId reference
- [x] Original stop preserved for stop_change cases (`originalStopId`)

**8.1.5 Permanent Schedule Exceptions**:
- [x] excludeDays field on studentRoutes assignment
- [x] Admin configures days student doesn't travel (e.g., ["friday"])
- [x] Automatically excluded from trip generation
- [x] No daily novedad needed

**Implementation Notes**:
- Novedades stored in `novedades` table with comprehensive workflow
- Query functions: `getByDate`, `getByTrip`, `getNovedadesForRoute`, `getNovedadesForDriverToday`
- Parent queries: `getMyNovedades`, `getById`
- Admin queries: `getForAdmin`, `getPendingForAdmin`, `getPendingCountForAdmin`
- Cancellation allowed for pending/acknowledged only (`cancel` mutation)

**Success Criteria**:
- [x] Parent can create novedades from Parent Portal
- [x] Parent pickup requires NO coordinator approval (immediate effect)
- [x] Other novedades require coordinator approval
- [x] Novedades applied correctly at trip start
- [x] Crew notified of all novedades for their trips
- [x] Permanent exclusions (excludeDays) work without daily input

---

### Phase 3: User Interfaces (Weeks 10-12)

**Tech Stack Update**: All frontends implemented as **Next.js 14+ PWA** (not Bubble.io as originally planned).

#### Module 9: Admin Dashboard (Next.js PWA)
**Owner**: Frontend Team
**Timeline**: Week 10-11
**Status**: ✅ Implemented (v1.0 scope)
**Location**: `apps/admin/`

**Functional Requirements**:
- [x] Dashboard overview (active trips, vehicles, alerts)
- [x] Fleet management interface (vehicles, drivers, monitors)
- [x] Route planning interface (3-step wizard with map)
- [x] Student management interface (CRUD + bulk import)
- [x] Calendar view for trips
- [x] Live trip monitoring with map
- [x] User management (invitations, role assignment)
- [x] Institution settings (profile, school location)

**Out of Scope (v1.0)**:
- Reports and analytics dashboard - Deferred to v2.0 (basic stats on dashboard for now)

**Success Criteria**:
- [x] All CRUD operations functional
- [x] Responsive design (desktop + tablet + mobile)
- [x] Loads quickly (Next.js SSR)
- [x] Admin can complete onboarding via wizard

---

#### Module 10: Parent Portal (Next.js PWA)
**Owner**: Frontend Team
**Timeline**: Week 11
**Status**: ✅ Implemented (v1.0 scope)
**Location**: `apps/parent/`

**Functional Requirements**:
- [x] Real-time trip tracking (live map with ETA)
- [x] Student check-in/out history
- [x] Notifications center (in-app)
- [x] ETA display (estimated arrival time with delay status)
- [x] Trip schedule view
- [x] Incident alerts for their child
- [x] Novedades creation (absence, parent pickup, stop change)
- [x] Secondary guardian management

**Out of Scope (v1.0)**:
- Contact driver/admin (direct messaging) - Deferred to v2.0

**Success Criteria**:
- [x] Map updates in real-time
- [x] Mobile-responsive (mobile-first design)
- [x] Parents can see only their children
- [x] In-app notifications (real-time via Convex)

---

#### Module 11: Crew App (Next.js PWA)
**Owner**: Mobile Team
**Timeline**: Week 12
**Status**: ✅ Implemented
**Location**: `apps/crew/`

**Functional Requirements**:
- [x] Pre-trip vehicle checklist
- [x] Start/end trip controls
- [x] Route navigation with map
- [x] Student list with check-in status
- [x] Check-in/out recording (QR + manual)
- [x] Incident reporting
- [x] Novedades view (for assigned trips)
- [x] Calendar view (monthly trip schedule)
- [x] Profile with tabs (Profile, History, Settings)
- [ ] Offline mode (PWA capable, not fully tested)
- [x] Background GPS tracking (15-second intervals)
- [x] PWA installation (home screen icon)

**Navigation Simplification**:
- Reduced from 11 items to 4 items (Inicio, Calendario, Rutas, Perfil)
- Contextual navigation for active trips
- Merged /history and /settings into /profile tabs

**Success Criteria**:
- [x] Installable on iOS and Android (PWA)
- [ ] Offline mode works for full trip (not fully tested)
- [x] GPS tracking continues in background
- [x] QR scanner works with camera
- [x] App loads quickly (Next.js optimized)

---

## 📋 CROSS-FUNCTIONAL REQUIREMENTS

### Real-Time Capabilities

**Requirements**:
- GPS location updates every 15 seconds during active trips
- Live queries for trip status changes
- WebSocket connections for instant notifications
- Optimistic UI updates for check-ins

**Success Metrics**:
- GPS update latency: <1 second
- Notification delivery: <5 seconds
- UI responsiveness: <100ms

---

### Multi-Tenancy & Data Isolation

**Requirements**:
- All database queries filtered by `institutionId`
- Row-level security enforced
- No cross-institution data access
- Institution context validated on every request

**Success Metrics**:
- Zero cross-institution data leaks (verified by audit)
- Query performance not degraded by multi-tenancy filters

---

### Offline Support (Driver App Only)

**Requirements**:
- Service worker for offline mode
- IndexedDB for local data cache
- Background sync for check-ins
- GPS data queuing when offline
- Auto-sync when connection restored

**Success Metrics**:
- App usable without internet for full trip duration
- Zero data loss during offline periods
- Sync completes within 30 seconds of reconnection

---

### Internationalization (i18n)

**Requirements**:
- Primary language: Spanish (es)
- Secondary language: English (en)
- Timezone: `America/Guayaquil` (Ecuador, UTC-5)
- Date format: DD/MM/YYYY
- Time format: 24-hour (HH:mm)
- Currency: USD ($)

**Success Metrics**:
- All UI text translatable
- Dates/times display correctly for Ecuador

---

### Phone Number Validation

**Requirements**:
- Ecuador format: `+593XXXXXXXXX` (13 characters)
- Regex: `/^\+593\d{9}$/`
- WhatsApp-compatible format
- International format support for future expansion

**Success Metrics**:
- 100% valid phone numbers in database
- WhatsApp messages delivered successfully

---

### QR Code System

**Requirements**:
- Unique QR per student
- Contains JSON: `{ studentId, institutionId, timestamp }`
- Generated on student creation
- Validated before check-in
- Printable format (PDF export)

**Success Metrics**:
- QR generation: <500ms
- QR scan accuracy: 99%+
- No duplicate QR codes

---

## 🚀 NON-FUNCTIONAL REQUIREMENTS

### Performance

| Metric | Target | Critical Threshold |
|--------|--------|-------------------|
| GPS location update | <1 second | <3 seconds |
| QR code scanning | <500ms | <1 second |
| API response time (95th percentile) | <500ms | <1 second |
| Map rendering | <3 seconds | <5 seconds |
| Page load time | <2 seconds | <4 seconds |

---

### Scalability

| Metric | Phase 1 | Phase 2 (12 months) |
|--------|---------|---------------------|
| Institutions | 10 | 100+ |
| Concurrent active trips | 50 | 500+ |
| Daily student check-ins | 1,000 | 10,000+ |
| GPS points per month | 100K | 1M+ |
| Concurrent users | 100 | 1,000+ |

---

### Availability

- **Uptime target**: 99.9% (max 43 minutes downtime/month)
- **Recovery time**: <5 minutes
- **Backup frequency**: Real-time (Convex handles this)
- **Disaster recovery**: <1 hour

---

### Security

**Requirements**:
- HTTPS everywhere (TLS 1.3)
- Token-based authentication with 24h expiry
- Input validation on all endpoints (Zod schemas)
- XSS prevention (sanitized inputs)
- CSRF protection
- No sensitive data in logs
- Password hashing (bcrypt/Argon2)
- Rate limiting on API endpoints

**Compliance**:
- GDPR-ready (data export, deletion)
- Ecuador data protection laws
- Student data privacy (COPPA-equivalent)

---

### Reliability

- **Data durability**: 99.999999999% (Convex guarantee)
- **Error rate**: <0.1% of requests
- **GPS accuracy**: Within 10 meters
- **Offline functionality**: 100% success rate for drivers

---

### Usability

- **Mobile-first design** (70% of users on mobile)
- **Accessibility**: WCAG 2.1 Level AA
- **Browser support**: Chrome, Safari, Firefox (latest 2 versions)
- **PWA installation rate**: >80% for drivers
- **Onboarding time**: <30 minutes for admins

---

## 📊 SUCCESS METRICS

### Technical KPIs

| Metric | Target |
|--------|--------|
| API response time (P95) | <500ms |
| GPS accuracy | Within 10 meters |
| PWA installation (drivers) | >80% |
| Offline functionality success | >95% |
| Zero data loss | 100% |
| System uptime | 99.9% |

---

### Business KPIs

| Metric | Target |
|--------|--------|
| Customer onboarding time | <3 days |
| Parent satisfaction score | >4.5/5 |
| Driver app adoption | >90% |
| Daily active users (parents) | >60% |
| Support ticket resolution | <4 hours |
| Safety incidents reduction | -90% |

---

### User Satisfaction

**Key Questions**:
1. **Parents**: "Do you feel confident about your child's safety?" (Target: 95% yes)
2. **Admins**: "Has Altaviapp reduced your administrative workload?" (Target: 80% yes)
3. **Drivers**: "Is the app easy to use during trips?" (Target: 85% yes)

---

## 🎯 RELEASE CRITERIA

### Minimum Viable Product (MVP) - Phase 1 + 2

**Must Have**:
- ✅ Authentication & RBAC (Module 1)
- ✅ Multi-tenancy (Module 2)
- ✅ Fleet management (Module 3)
- ✅ Student management (Module 4)
- ✅ Route planning (Module 5)
- ✅ Trip management (Module 6)
- ✅ Student check-ins (Module 7)

**Can Wait for v1.1**:
- Incident management (Module 8) - non-blocking
- Advanced analytics
- Mobile push notifications

**MVP Launch Criteria**:
- 5+ pilot schools onboarded
- 100+ students tracked successfully
- Zero critical bugs
- Performance metrics met
- Parent satisfaction >4.0/5

---

### Full Launch - Phase 3 Complete

**Must Have**:
- ✅ All Phase 1 + 2 modules
- ✅ Admin dashboard (Module 9)
- ✅ Parent portal (Module 10)
- ✅ Crew PWA (Module 11) - Driver + Monitor
- ✅ Incident management (Module 8)

**Full Launch Criteria**:
- 20+ schools onboarded
- 1,000+ students tracked
- All success metrics met
- Zero critical bugs
- Parent satisfaction >4.5/5

---

## 🔄 FUTURE ROADMAP (Post-Launch)

### v2.0 - Deferred from v1.0

Features postponed from initial release for faster time-to-market:

**Fleet Enhancements**:
- Vehicle document management (insurance, inspection, registration uploads)
- Maintenance scheduling and history
- Document expiration alerts

**Advanced Features**:
- Reports and analytics dashboard (beyond basic stats)
- Incident photo/video attachments
- Contact driver/admin (direct messaging in-app)
- Institution settings (working hours, notification preferences)

### Q2 2025 - Enhancement Phase

- Real-time chat (driver-parent communication)
- Advanced route optimization (AI-powered)
- Predictive maintenance alerts
- Carbon footprint tracking
- Mobile app for parents (native iOS/Android)

### Q3 2025 - Expansion Phase

- Support for other cities (Guayaquil, Cuenca)
- Multi-language support (Portuguese for Brazil)
- API for third-party integrations
- White-label solution for transport companies

---

## 📚 RELATED DOCUMENTS

| Document | Purpose | Owner |
|----------|---------|-------|
| [Technical-Specification.md](../Technical-Specification.md) | Implementation patterns and code standards | Engineering Team |
| [DATABASE_SCHEMA.md](database/DATABASE_SCHEMA.md) | Complete database structure | Backend Team |
| [API_ENDPOINTS.md](api/API_ENDPOINTS.md) | REST API reference | Backend Team |
| [CLAUDE.md](../CLAUDE.md) | AI agent development workflow | AI Team |
| [IMPLEMENTATION_ORDER.md](modules/IMPLEMENTATION_ORDER.md) | Module dependencies | Project Manager |

---

## ✅ APPROVAL

| Role | Name | Date | Signature |
|------|------|------|-----------|
| Product Owner | [Name] | [Date] | ________ |
| Tech Lead | [Name] | [Date] | ________ |
| Project Manager | [Name] | [Date] | ________ |

---

**Document Version History**:
- v2.1 (2025-12-27): Scope finalization - Marked non-critical features as "Out of Scope v1.0", all core modules now ✅ Implemented
- v2.0 (2025-01-26): Optimized PRD - Removed implementation code, focused on requirements
- v1.0 (2024-10-XX): Initial PRD with technical implementation details
