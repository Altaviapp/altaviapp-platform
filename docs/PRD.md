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
- [ ] Route creation with multiple stops
- [ ] Interactive map interface for stop placement
- [ ] Stop sequencing (pickup order)
- [ ] Geofencing per stop (arrival detection radius)
- [ ] Student assignment to stops
- [ ] Route schedule (pickup times per stop)
- [ ] Route optimization suggestions

**Success Criteria**:
- Admin can create routes with 5-20 stops
- Students assigned to correct stops
- Route visualized on map
- Estimated travel time calculated

---

#### Module 6: Trip Management
**Owner**: Backend Team
**Timeline**: Week 7

**Functional Requirements**:
- [ ] Trip scheduling (route + date + vehicle + driver)
- [ ] Trip status lifecycle (scheduled → in_progress → completed → cancelled)
- [ ] Real-time GPS tracking (updates every 15 seconds)
- [ ] Trip history and logs
- [ ] Live trip monitoring dashboard
- [ ] Trip cancellation with notifications

**Success Criteria**:
- Drivers can start/end trips
- GPS location updates in real-time
- Admin can monitor all active trips
- Trip history searchable

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
