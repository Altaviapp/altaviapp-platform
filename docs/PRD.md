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
| **Authentication** | Custom Token-based | User management, role-based access |
| **Frontend (Admin)** | Bubble.io | Admin dashboard, parent portal |
| **Frontend (Mobile)** | Next.js PWA | Driver mobile application |
| **Maps** | Leaflet + OpenStreetMap | GPS tracking, route planning |
| **Notifications** | WhatsApp Business API | Parent alerts (pickup/dropoff) |

**Note**: Implementation details in [Technical-Specification.md](../Technical-Specification.md)

### Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                       │
├─────────────────────────────────────────────────────────┤
│  Bubble.io Web App    │    Next.js PWA Mobile App       │
│  ├── Admin Dashboard  │    ├── Driver App               │
│  ├── Parent Portal    │    ├── Offline Support          │
│  └── Public Website   │    └── GPS Tracking             │
└─────────────────┬───────────────────┬───────────────────┘
                  │                   │
┌─────────────────▼───────────────────▼───────────────────┐
│              AUTHENTICATION LAYER                       │
│  Custom Token-based Auth + Role-Based Access Control    │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│                 BACKEND LAYER (Convex)                  │
│  Real-time Database │ Server Functions │ Live Queries   │
└─────────────────┬───────────────────────────────────────┘
                  │
┌─────────────────▼───────────────────────────────────────┐
│          EXTERNAL SERVICES                              │
│  WhatsApp API │ OpenStreetMap │ Email Service           │
└─────────────────────────────────────────────────────────┘
```

---

## 📦 PRODUCT MODULES

### Phase 1: Foundation (Weeks 1-3)

#### Module 1: Authentication & Authorization
**Owner**: Backend Team
**Timeline**: Week 1

**Functional Requirements**:
- [ ] User registration with email verification
- [ ] Token-based authentication (JWT)
- [ ] Role-based access control (4 roles: super_admin, admin, driver, parent)
- [ ] Session management (24h token expiry)
- [ ] Password reset flow
- [ ] User profile management

**Success Criteria**:
- All 4 roles can authenticate successfully
- RBAC enforced on all endpoints
- Token refresh without re-login

---

#### Module 2: Multi-Tenancy (Institutions)
**Owner**: Backend Team
**Timeline**: Week 2-3

**Functional Requirements**:
- [ ] Institution registration and onboarding
- [ ] Institution profile management (name, address, contact)
- [ ] Institution settings (working hours, notification preferences)
- [ ] Data isolation between institutions
- [ ] Institution admin assignment

**Success Criteria**:
- 10+ institutions can operate independently
- Zero cross-institution data leaks
- Admin can manage only their institution

---

### Phase 2: Core Operations (Weeks 4-9)

#### Module 3: Fleet Management
**Owner**: Backend Team
**Timeline**: Week 4

**Functional Requirements**:
- [ ] Vehicle registration (license plate, capacity, type)
- [ ] Vehicle document management (insurance, inspection, registration)
- [ ] Driver assignment to vehicles
- [ ] Driver profiles (license, contact, emergency info)
- [ ] Vehicle status tracking (active, maintenance, inactive)
- [ ] Maintenance scheduling and history

**Success Criteria**:
- Admin can CRUD vehicles and drivers
- Document expiration alerts
- Vehicle-driver assignment validation

---

#### Module 4: Student Management
**Owner**: Backend Team
**Timeline**: Week 5

**Functional Requirements**:
- [ ] Student registration (name, grade, address, parent contact)
- [ ] Parent/guardian linkage (multiple parents per student)
- [ ] QR code generation per student (unique identifier)
- [ ] Student profile management
- [ ] Student status (active, inactive, graduated)
- [ ] Emergency contact information

**Success Criteria**:
- Admin can CRUD students
- Parents linked to students correctly
- Unique QR codes generated and downloadable

---

#### Module 5: Route Planning
**Owner**: Backend Team
**Timeline**: Week 5-6

**Functional Requirements**:

**5.1 Student Location Management**:
- [ ] Students must have home location assigned before route assignment
- [ ] Parent can set/update student home location from Parent Portal
- [ ] Admin can set/update student home location from Admin Dashboard
- [ ] Location selection via address input (geocoding) or map click
- [ ] Store homeLatitude, homeLongitude, homeAddress on student record

**5.2 School Location Configuration**:
- [ ] Institution must have school location configured
- [ ] Admin configures school location in Settings
- [ ] School location used as origin (dropoff) or destination (pickup) in route calculation
- [ ] Store schoolLatitude, schoolLongitude, schoolAddress on institution record

**5.3 Multi-Step Route Creation Wizard**:

*Step 1 - Route Planning*:
- [ ] Select route type: pickup (recogida) or dropoff (entrega)
- [ ] Set target time: school arrival time (pickup) or school departure time (dropoff)
- [ ] Select vehicle (displays capacity)
- [ ] Select driver (required)
- [ ] Select monitor (optional)
- [ ] Route name (auto-generated or custom)

*Step 2 - Stop Assignment*:
- [ ] Display header with route info: name, target time
- [ ] Dynamic stats: #stops, duration, start/end time (calculated)
- [ ] Student selector with tabs: "Disponibles" / "Seleccionados"
- [ ] Filter: Search by name, dropdown by grade
- [ ] Only show students WITHOUT route of same type AND with location assigned
- [ ] Interactive map showing school marker (distinct icon) and selected students
- [ ] "Calculate Route" button triggers Google Maps Directions API optimization
- [ ] Route optimization determines optimal stop order (like Uber)
- [ ] Calculate ETAs for each stop based on target school time
- [ ] Display optimized polyline on map
- [ ] Selected students tab shows: stop number, name, ETA
- [ ] Allow manual reorder with drag-and-drop
- [ ] "Recalculate" button after manual changes

*Step 3 - Confirmation*:
- [ ] Recurrence selector:
  - Daily: select days of week (checkboxes)
  - Weekly: select day of week
  - Monthly: select day of month
  - One-time: select specific date
- [ ] Route summary with all details
- [ ] Mini-map with final route visualization
- [ ] Active/Inactive toggle

**5.4 Route Optimization (Google Maps API)**:
- [ ] Use Directions API with `optimizeWaypoints: true`
- [ ] Calculate optimal stop order minimizing travel time
- [ ] Store encoded polyline for route visualization
- [ ] Calculate and store estimated duration and distance
- [ ] Calculate ETA for each stop based on target arrival/departure time
- [ ] No traffic consideration at planning time (applied at trip start)

**5.5 Route Visualization**:
- [ ] Display actual route polyline from Directions API (not straight lines)
- [ ] Route visualization in Admin (route detail), Parent (tracking), Crew (trip map)
- [ ] Differentiate stop markers: completed, current, upcoming
- [ ] School marker with distinct icon

**Success Criteria**:
- Admin can create routes via 3-step wizard
- Route optimization calculates optimal stop order
- Students auto-assigned to stops based on home location
- Route visualized with actual road paths (like Uber)
- Estimated travel time calculated per stop
- Routes configurable with recurrence (daily/weekly/monthly/one-time)

---

#### Module 6: Trip Management
**Owner**: Backend Team
**Timeline**: Week 7

**Functional Requirements**:

**6.1 Lazy Trip Creation (On-Demand)**:
- [ ] Trips are NOT pre-created in database
- [ ] Trip created automatically when driver taps "Start Trip"
- [ ] Driver selects route from assigned routes valid for today
- [ ] Route recurrence validated before allowing trip start
- [ ] Trip record created with status "in_progress"
- [ ] TripStudents generated dynamically at trip start:
  - Query active studentRoutes for the route
  - Filter by excludeDays (skip students whose excludeDays includes today)
  - Apply novedades for the date
  - Priority: absence > parent_pickup > stop_change > scheduled

**6.2 Route Recurrence Validation**:
- [ ] Daily routes: check if today's day of week is in daysOfWeek array
- [ ] Weekly routes: check if today matches dayOfWeek
- [ ] Monthly routes: check if today's date matches dayOfMonth
- [ ] One-time routes: check if today matches specificDate
- [ ] Only show routes valid for today in driver's list

**6.3 Student Exclusion Days**:
- [ ] Admin can configure excludeDays per student-route assignment
- [ ] Example: ["friday", "saturday"] means student doesn't travel those days
- [ ] Students with excludeDays including today are NOT added to tripStudents
- [ ] Used for permanent schedule exceptions

**6.4 Trip Lifecycle**:
- [ ] Trip status: in_progress → completed (no "scheduled" state with lazy creation)
- [ ] Start trip: create trip record, generate tripStudents, record initial GPS
- [ ] Complete trip: set endTime, record final GPS, update status
- [ ] Cancel trip: allowed while in_progress, notifies parents
- [ ] Real-time GPS tracking (updates every 15 seconds)

**6.5 Trip History and Logs**:
- [ ] Trip history searchable by date, route, driver
- [ ] Each trip stores: duration, distance, students transported, stops completed
- [ ] GPS location history stored per trip
- [ ] Check-in/check-out events linked to trip

**6.6 Live Trip Monitoring**:
- [ ] Admin dashboard shows all active trips in real-time
- [ ] Map view with vehicle positions
- [ ] Trip progress (stops completed / total)
- [ ] ETA updates based on current position and traffic

**Success Criteria**:
- Drivers see only routes valid for today based on recurrence
- Trip created instantly when driver starts (lazy creation)
- Student exclusion days respected automatically
- GPS location updates in real-time
- Admin can monitor all active trips
- Trip history searchable with full audit trail

---

#### Module 7: Student Check-ins
**Owner**: Backend + Mobile Team
**Timeline**: Week 8

**Functional Requirements**:
- [ ] QR code scanning for student identification
- [ ] Manual check-in (if QR scan fails)
- [ ] Check-in validation (correct route, correct stop)
- [ ] Check-out at destination
- [ ] Timestamp and GPS location recording
- [ ] Automatic parent notification (WhatsApp)
- [ ] Check-in status dashboard

**Success Criteria**:
- QR scan completes in <500ms
- Parent receives notification within 5 seconds
- Check-in history per student
- Offline check-in queued and synced

---

#### Module 8: Incident Management
**Owner**: Backend Team
**Timeline**: Week 9

**Functional Requirements**:
- [ ] Incident reporting (accident, delay, emergency, behavior)
- [ ] Photo/video attachment support
- [ ] Severity levels (low, medium, high, critical)
- [ ] Automatic escalation for critical incidents
- [ ] Incident assignment and resolution workflow
- [ ] Parent notification for incidents involving their child
- [ ] Incident history and analytics

**Success Criteria**:
- Driver can report incident in <30 seconds
- Critical incidents trigger immediate alerts
- Admin can review and resolve incidents
- Parents notified appropriately

---

#### Module 8.1: Novedades (Schedule Exceptions)
**Owner**: Backend Team
**Timeline**: Week 9

**Functional Requirements**:

**8.1.1 Temporary Novedades (Daily Exceptions)**:
- [ ] Parent can create novedad for specific date
- [ ] Types of temporary novedades:
  - **Ausencia (absence)**: Student won't travel that day
  - **Recogida por padre (parent_pickup)**: Parent picks up student directly
  - **Cambio de parada (stop_change)**: Different pickup/dropoff location for one day
  - **Salida temprana (early_pickup)**: Student leaves early
  - **Llegada tardía (late_arrival)**: Student arrives late
- [ ] Affected route type: pickup, dropoff, or both
- [ ] Parent provides reason (optional)

**8.1.2 Parent Pickup Workflow (NO APPROVAL REQUIRED)**:
- [ ] Parent creates parent_pickup novedad
- [ ] Status goes directly to "acknowledged" (skip pending/approved states)
- [ ] Crew is notified immediately
- [ ] Parent can create until trip starts
- [ ] Used for emergencies and last-minute changes

**8.1.3 Other Novedades Workflow (APPROVAL REQUIRED)**:
- [ ] Parent creates novedad → status: "pending"
- [ ] Admin/Coordinator reviews and approves/rejects → status: "approved" or "rejected"
- [ ] Crew acknowledges seeing the novedad → status: "acknowledged"
- [ ] Applied to trip at trip start → status: "applied"
- [ ] Notifications sent at each state change

**8.1.4 Novedad Application to Trips**:
- [ ] At trip start (lazy creation), query novedades for the date
- [ ] Priority order for conflicting novedades:
  1. absence (highest priority - student marked absent)
  2. parent_pickup (student marked for parent pickup)
  3. stop_change (student uses different stop)
  4. scheduled (default - normal trip)
- [ ] TripStudent record stores novedadId reference
- [ ] Original stop preserved for stop_change cases

**8.1.5 Permanent Schedule Exceptions**:
- [ ] excludeDays field on studentRoutes assignment
- [ ] Admin configures days student doesn't travel (e.g., ["friday"])
- [ ] Automatically excluded from trip generation
- [ ] No daily novedad needed

**Success Criteria**:
- Parent can create novedades from Parent Portal
- Parent pickup requires NO coordinator approval (immediate effect)
- Other novedades require coordinator approval
- Novedades applied correctly at trip start
- Crew notified of all novedades for their trips
- Permanent exclusions (excludeDays) work without daily input

---

### Phase 3: User Interfaces (Weeks 10-12)

#### Module 9: Admin Dashboard (Bubble.io)
**Owner**: Frontend Team
**Timeline**: Week 10-11

**Functional Requirements**:
- [ ] Dashboard overview (active trips, vehicles, alerts)
- [ ] Fleet management interface
- [ ] Route planning interface (drag-and-drop map)
- [ ] Student management interface
- [ ] Trip scheduling calendar
- [ ] Live trip monitoring with map
- [ ] Reports and analytics
- [ ] User management (drivers, parents)

**Success Criteria**:
- All CRUD operations functional
- Responsive design (desktop + tablet)
- Loads in <3 seconds
- Admin can complete onboarding in <30 minutes

---

#### Module 10: Parent Portal (Bubble.io)
**Owner**: Frontend Team
**Timeline**: Week 11

**Functional Requirements**:
- [ ] Real-time trip tracking (live map)
- [ ] Student check-in/out history
- [ ] Notifications center
- [ ] ETA display (estimated arrival time)
- [ ] Trip schedule view
- [ ] Incident alerts for their child
- [ ] Contact driver/admin

**Success Criteria**:
- Map updates every 15 seconds
- Mobile-responsive
- Parents can see only their children
- WhatsApp notifications sent successfully

---

#### Module 11: Driver Mobile App (PWA)
**Owner**: Mobile Team
**Timeline**: Week 12

**Functional Requirements**:
- [ ] Pre-trip vehicle checklist (brakes, lights, etc.)
- [ ] Start/end trip controls
- [ ] Route navigation with turn-by-turn directions
- [ ] Student list with QR scanner
- [ ] Check-in/out recording
- [ ] Incident reporting
- [ ] Offline mode (works without internet)
- [ ] Background GPS tracking
- [ ] PWA installation (home screen icon)

**Success Criteria**:
- Installable on iOS and Android
- Offline mode works for full trip
- GPS tracking continues in background
- QR scanner works with camera
- App loads in <2 seconds

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
- v2.0 (2025-01-26): Optimized PRD - Removed implementation code, focused on requirements
- v1.0 (2024-10-XX): Initial PRD with technical implementation details
