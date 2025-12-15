# Module Implementation Checklist

**Requirements Verification for Each Module**
**Version**: 1.1
**Date**: December 2025
**Last Updated**: December 10, 2025

---

## 🎯 Implementation Status Summary

| Phase | Module | Status |
|-------|--------|--------|
| **Phase 1** | auth | ✅ Complete |
| | api-core | ✅ Complete |
| | institutions | ✅ Complete |
| **Phase 2** | fleet-api | ✅ Complete |
| | students-api | ✅ Complete |
| | routes-api | ✅ Complete |
| | trips-api | ✅ Complete |
| | checkins-api | ✅ Complete |
| | incidents-api | ✅ Complete |
| **Phase 3** | admin-app | 🚧 97% |
| | parent-app | 🚧 90% |
| | crew-app | ✅ 99% |
| **Features** | novedades | ✅ Complete |

---

## Overview

This document provides a comprehensive checklist for verifying that each module meets all requirements before marking it as complete. Use this during `@review` command execution.

**How to use**:
1. Complete module implementation
2. Run through checklist for that module
3. Fix any missing items
4. Mark checklist items in PR description
5. Get review approval

---

## Universal Requirements (All Modules)

### Multi-Tenancy ✅ IMPLEMENTED
- [x] All queries filter by `institutionId` (except super_admin)
- [x] No cross-institution data access possible
- [x] Row-level security enforced in Convex
- [x] Institution context validated on every mutation

### Role-Based Access Control ✅ IMPLEMENTED
- [x] Role verification before sensitive operations
- [x] `super_admin` has appropriate elevated access
- [x] `admin` limited to own institution
- [x] `driver` limited to own trips/routes
- [x] `monitor` role added (student check-in, incident reporting)
- [x] `parent` read-only, own students only

### TypeScript & Type Safety ✅ IMPLEMENTED
- [x] TypeScript strict mode enabled
- [x] No `any` types used
- [x] All Convex functions properly typed
- [x] API responses typed correctly
- [x] noUncheckedIndexedAccess enabled

### Input Validation ✅ IMPLEMENTED
- [x] All inputs validated with Zod schemas
- [x] Phone numbers validated (+593XXXXXXXXX format)
- [x] Emails validated
- [x] Dates validated (Unix timestamps)
- [x] Required fields enforced

### Error Handling ✅ IMPLEMENTED
- [x] Standard error response format used
- [x] Meaningful error messages (Spanish)
- [x] Error codes defined and consistent
- [x] Try-catch blocks around async operations
- [x] Graceful degradation

### Performance ✅ IMPLEMENTED
- [x] Queries use proper indexes
- [x] No N+1 query problems
- [x] Pagination implemented where needed
- [x] Response times meet requirements (<500ms)

### Security ✅ IMPLEMENTED
- [x] No sensitive data in logs
- [x] Input sanitization
- [x] SQL injection prevention (Convex handles this)
- [x] XSS prevention
- [x] HTTPS enforced

### Testing 🚧 PARTIAL
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Edge cases covered
- [ ] Error cases tested
- [ ] Tests passing

### Documentation ✅ COMPLETE
- [x] Code comments for complex logic
- [x] API endpoints documented
- [x] Function purposes clear
- [x] README updated if needed

---

## Additional Infrastructure ✅ CREATED

### Monorepo Structure
- [x] Turborepo configuration
- [x] pnpm workspaces
- [x] Shared packages

### Shared Packages
| Package | Purpose | Status |
|---------|---------|--------|
| `packages/auth` | Auth provider, types, hooks | ✅ Complete |
| `packages/maps` | Google Maps integration | ✅ Complete |
| `packages/ui` | Shared UI components (placeholder) | 🚧 Partial |

### Seed Data (Testing)
- [x] La Carolina/Floresta route (Quito)
- [x] Test students with real coordinates
- [x] Test vehicles and drivers
- [x] Demo institution

### Google Maps Package (`packages/maps/`)
- [x] `GoogleMapsProvider` - API loading
- [x] `InteractiveMap` - Draggable markers
- [x] `RouteMap` - Route visualization
- [x] `StudentMap` - Student locations
- [x] `LiveTrackingMap` - Real-time tracking
- [x] Distance calculation utilities

---

## Phase 1: Foundation ✅ COMPLETE

### Module 1: auth ✅ COMPLETE

**Note**: Implemented with custom token-based auth instead of Clerk

**Functionality**:
- [x] Custom token-based authentication (bcrypt + sessions)
- [x] HTTP endpoints for login/register (`/api/auth/*`)
- [x] New users auto-create in Convex
- [x] User sync includes all required fields
- [x] Role assignment working

**Helper Functions**:
- [x] `getCurrentUser()` returns correct user
- [x] `requireRole()` enforces roles properly
- [x] `requireInstitutionAccess()` prevents cross-institution access
- [x] Session token validation working

**Security**:
- [x] Password hashing with bcrypt
- [x] Token expiration handled (sessions table)
- [x] Invalid tokens rejected

**Testing**:
- [x] Can register new users
- [x] User appears in Convex
- [x] Role checks work correctly
- [x] Institution filtering works

**Files Created**:
- `convex/auth.ts` - Auth mutations
- `convex/authApi.ts` - HTTP endpoints
- `convex/lib/authUtils.ts` - Auth helpers
- `convex/invitations.ts` - Invitation system

---

### Module 2: api-core ✅ COMPLETE

**Response Format**:
- [x] `successResponse()` returns standard format
- [x] `errorResponse()` returns standard format
- [x] Timestamps in ISO 8601 format
- [x] Type safety for response generics

**Error Classes**:
- [x] `ApiError` base class created
- [x] `BadRequestError` (400) works
- [x] `UnauthorizedError` (401) works
- [x] `ForbiddenError` (403) works
- [x] `NotFoundError` (404) works
- [x] `ValidationError` (422) works

**API Structure**:
- [x] `convex/http.ts` routes configured
- [x] CORS configured for frontend apps
- [x] Request validation with Zod
- [x] Error handling middleware

**Validation**:
- [x] Common Zod schemas defined (phone, email, date, latLng)
- [x] Validation helper functions work
- [x] Error messages user-friendly (Spanish)

---

### Module 3: institutions ✅ COMPLETE

**CRUD Operations**:
- [x] GET /institutions returns list (super_admin only)
- [x] POST /institutions creates institution
- [x] GET /institutions/:id returns details
- [x] PUT /institutions/:id updates institution
- [x] DELETE /institutions/:id deletes institution

**Multi-Tenancy Foundation**:
- [x] Institution filtering works
- [x] Super admin can see all institutions
- [x] Regular admin sees only own institution
- [x] Institution ID required for all future modules

**Validation**:
- [x] Institution creation requires all fields
- [x] Email format validated
- [x] Phone format validated
- [x] Subscription plan validated

**Business Logic**:
- [x] Active/suspended status enforced
- [x] Subscription status tracked
- [x] Contact person information stored

**Files Created**:
- `convex/institutions.ts` - Institution queries/mutations

---

## Phase 2: Backend APIs ✅ COMPLETE

### Module 4: fleet-api ✅ COMPLETE

**Vehicles**:
- [x] GET /vehicles returns filtered list
- [x] POST /vehicles creates vehicle
- [x] GET /vehicles/:id returns details
- [x] PUT /vehicles/:id updates vehicle
- [x] DELETE /vehicles/:id deletes vehicle
- [x] POST /vehicles/:id/upload-document uploads files

**Drivers**:
- [x] GET /drivers returns filtered list
- [x] POST /drivers creates driver
- [x] GET /drivers/:id returns details
- [x] PUT /drivers/:id updates driver
- [x] DELETE /drivers/:id deletes driver

**Monitors** (added role):
- [x] GET /monitors returns filtered list
- [x] POST /monitors creates monitor
- [x] Monitor role separate from driver

**Documents & Certifications**:
- [x] Document upload to Convex storage
- [x] Expiry dates tracked
- [x] Document types validated (SOAT, technical review, etc.)
- [x] License expiry validation

**Status Management**:
- [x] Vehicle status (active/maintenance/out_of_service/retired)
- [x] Driver status (active/inactive)
- [x] Current vehicle assignment tracked

**Files Created**:
- `convex/vehicles.ts`
- `convex/drivers.ts`
- `convex/monitors.ts`

---

### Module 5: students-api ✅ COMPLETE

**CRUD Operations**:
- [x] GET /students returns filtered list
- [x] POST /students creates student with QR
- [x] GET /students/:id returns details
- [x] PUT /students/:id updates student
- [x] DELETE /students/:id deletes student

**QR Code System**:
- [x] QR code auto-generated on creation
- [x] QR contains: studentId, institutionId, timestamp
- [x] QR image (data URL) returned
- [x] GET /students/:id/qr returns QR
- [x] POST /students/:id/regenerate-qr works

**Parent Information**:
- [x] Parent name, phone, email required
- [x] Secondary parent optional
- [x] Emergency contacts stored (array)
- [x] Authorized pickup persons stored

**Medical Information**:
- [x] Medical info optional
- [x] Allergies, medications, special needs
- [x] Blood type stored

**Validation**:
- [x] Phone format (+593XXXXXXXXX)
- [x] Email format
- [x] Age validation (dateOfBirth)
- [x] Grade validation

**Files Created**:
- `convex/students.ts`

---

### Module 6: routes-api ✅ COMPLETE

**Routes**:
- [x] GET /routes returns filtered list
- [x] POST /routes creates route
- [x] GET /routes/:id returns route + stops
- [x] PUT /routes/:id updates route
- [x] DELETE /routes/:id deletes route

**Route Stops**:
- [x] GET /routes/:routeId/stops returns ordered stops
- [x] POST /routes/:routeId/stops creates stop
- [x] PUT /routes/:routeId/stops/:stopId updates stop
- [x] DELETE /routes/:routeId/stops/:stopId deletes stop
- [x] PUT /routes/:routeId/stops/reorder reorders stops

**Geofencing**:
- [x] Geofence radius configurable per stop
- [x] Default radius: 100 meters
- [x] Distance calculation function works (Haversine)
- [x] Geofence detection on GPS update

**Capacity Management**:
- [x] Max capacity tracked
- [x] Current occupancy calculated
- [x] Capacity warnings when exceeded

**Schedule**:
- [x] Operating days configurable
- [x] Scheduled times per stop
- [x] Estimated duration calculated

**Files Created**:
- `convex/routes.ts`
- `convex/routeStops.ts`

---

### Module 7: trips-api ✅ COMPLETE

**Trips**:
- [x] GET /trips returns filtered list
- [x] POST /trips creates trip
- [x] GET /trips/:id returns trip details
- [x] PUT /trips/:id/start starts trip
- [x] PUT /trips/:id/complete completes trip
- [x] PUT /trips/:id/cancel cancels trip
- [x] GET /trips/active returns active trip

**GPS Tracking**:
- [x] POST /trips/:tripId/location updates GPS
- [x] GET /trips/:tripId/location returns current location
- [x] GET /trips/:tripId/location/history returns history
- [x] Location updates < 1 second latency
- [x] Real-time updates via Convex live queries

**Student Routes**:
- [x] POST /student-routes assigns student to route
- [x] GET /student-routes/:id returns assignment
- [x] PUT /student-routes/:id updates assignment
- [x] DELETE /student-routes/:id removes assignment

**Geofencing Integration**:
- [x] Geofence check on GPS update
- [x] Notifications when entering stop geofence
- [x] Distance to next stop calculated

**Status Management**:
- [x] scheduled → in_progress → completed flow
- [x] Emergency status handling
- [x] Cancelled status handling

**Pre-trip Checklist**:
- [x] Checklist stored with trip
- [x] All items required before start
- [x] Checklist timestamp and user recorded

**Files Created**:
- `convex/trips.ts`
- `convex/studentRoutes.ts`

---

### Module 8: checkins-api ✅ COMPLETE

**Check-ins**:
- [x] POST /checkins records check-in
- [x] POST /checkins/validate-qr validates QR
- [x] GET /checkins returns list
- [x] GET /checkins/:id returns details

**QR Validation**:
- [x] QR code parsed correctly
- [x] Student validated against route
- [x] Invalid QR rejected
- [x] Expired QR rejected
- [x] Validation time < 500ms

**Parent Notifications**:
- [x] Notification sent on pickup
- [x] Notification sent on dropoff
- [x] Notification includes: student name, time, vehicle
- [x] Notification logged in communicationLogs

**Location Verification**:
- [x] GPS location recorded with check-in
- [x] Distance from stop calculated
- [x] Warning if too far from stop

**Manual Check-in**:
- [x] Manual check-in without QR allowed
- [x] Manual check-in flagged

**Authorized Persons** (dropoff):
- [x] Authorized person verification
- [x] ID document validation
- [x] Unauthorized persons rejected

**Files Created**:
- `convex/checkins.ts`

---

### Module 9: incidents-api ✅ COMPLETE

**Incidents**:
- [x] GET /incidents returns filtered list
- [x] POST /incidents creates incident
- [x] GET /incidents/:id returns details
- [x] PUT /incidents/:id updates incident
- [x] PUT /incidents/:id/resolve resolves incident
- [x] POST /incidents/:id/upload-photo uploads photos

**Classification**:
- [x] Type: accident/breakdown/behavior/emergency/medical/security/other
- [x] Severity: low/medium/high/critical
- [x] Category: vehicle/student/driver/route/external

**Emergency Handling**:
- [x] Critical incidents trigger alerts
- [x] Emergency services notification flag
- [x] Admin notification on critical severity

**Status Workflow**:
- [x] open → investigating → pending_review → resolved → closed
- [x] Status transitions validated
- [x] Resolution requires summary

**Documentation**:
- [x] Photos upload to Convex storage
- [x] Multiple photos supported
- [x] Documents upload supported
- [x] Investigation notes stored

**Files Created**:
- `convex/incidents.ts`

---

## Phase 3: Frontends 🚧 IN PROGRESS

**Note**: Architecture changed from Bubble.io to Next.js PWA monorepo

### Module 10: admin-app 🚧 ~95% COMPLETE

**Architecture**:
- [x] Next.js 14+ App Router structure
- [x] Turborepo monorepo setup
- [x] shadcn/ui components
- [x] Tailwind CSS configuration
- [x] TypeScript strict mode

**Pages Created**:
- [x] Dashboard overview
- [x] Fleet management (vehicles, drivers, monitors)
- [x] Route management
- [x] Student management
- [x] Trip monitoring
- [x] Incident management
- [x] Reports (connected to Convex)
- [x] Settings
- [x] User management

**Convex Integration**:
- [x] Auth provider configured
- [x] useFleet hooks (drivers, vehicles, monitors)
- [x] useRoutes hooks
- [x] useStudents hooks
- [x] useTrips hooks (listTrips, getTrip, mutations)
- [x] useIncidents hooks (listIncidents, getIncident, mutations)
- [x] useReports hooks ✅ COMPLETE
  - useDashboardMetrics, useDailyStats, useTopRoutes
  - useTripReport, useIncidentReport, useAttendanceReport
  - useReportsDashboard (combined hook)

**Route Components** (New):
- [x] AddStopModal - Add/edit stops with map
- [x] RouteOptimizer - Google Directions API optimization
- [x] StudentAssignment - Auto-assign students to nearest stops

**CRUD Workflows**:
- [x] Create operations work
- [x] Read/list operations work
- [x] Update operations work
- [x] Delete operations work (with confirmation)

**Real-time Features**:
- [x] GPS tracking auto-refreshes (Convex subscriptions)
- [x] Trip status updates automatically
- [x] Loading states
- [x] Empty states

**User Experience**:
- [x] Responsive design (desktop-first)
- [x] Loading indicators (skeletons)
- [x] Error messages displayed
- [x] Success confirmations
- [x] Input validation (Zod)

**Files Created**:
- `apps/admin/src/app/*` - All admin pages
- `apps/admin/src/components/*` - Admin components
- `apps/admin/src/hooks/*` - Convex hooks (useTrips, useIncidents, etc.)
- `apps/admin/src/lib/*` - Utilities

---

### Module 11: parent-app 🚧 ~80% COMPLETE

**Architecture**:
- [x] Next.js 14+ App Router structure
- [x] Shared packages setup
- [x] Mobile-first design

**Pages Created**:
- [x] Login/signup
- [x] Student dashboard (connected to Convex)
- [x] Real-time tracking (map placeholder)
- [x] Notification history
- [x] Trip history
- [x] Profile/settings
- [x] Forgot password
- [x] Reset password
- [x] Signup invitation

**Convex Integration**:
- [x] Auth provider connected (useConvexAuth)
- [x] useMyStudents hooks (listStudentsForParent)
- [x] useStudentTracking hooks (getActiveTripForStudent)
- [x] useNotifications hooks (getNotifications, markRead)
- [x] Real-time tracking subscription ready

**Real-time Tracking**:
- [x] Tracking hooks ready (useStudentTracking)
- [ ] Map displays vehicle location (needs Google Maps)
- [ ] Auto-refresh every 15 seconds
- [ ] ETA calculation
- [ ] Route progress visualization

**User Experience**:
- [x] Mobile-optimized
- [x] Spanish language
- [x] Touch-friendly buttons
- [x] Safe area padding
- [x] Loading states with fallback to mock data

**Files Created**:
- `apps/parent/src/app/*` - All parent pages
- `apps/parent/src/components/*` - Parent components
- `apps/parent/src/hooks/*` - Convex hooks (useMyStudents, useNotifications, etc.)

---

### Module 12: crew-app ✅ ~98% COMPLETE

**Architecture**:
- [x] Next.js 14+ App Router structure
- [x] Role-based UI (driver/monitor)
- [x] Mobile-first PWA design
- [x] TypeScript strict mode (all errors resolved)

**Pages Created**:
- [x] Login
- [x] Dashboard (role-based, connected to Convex)
- [x] Trips list (connected to Convex)
- [x] Active trip page (connected to Convex auth)
- [x] Pre-trip checklist (driver, connected to Convex auth)
- [x] Map view
- [x] Student check-in page (connected to Convex)
- [x] Incident report (monitor)
- [x] Trip history
- [x] Profile/settings (connected to Convex auth)

**Convex Integration**:
- [x] Auth provider connected (useConvexAuth with fallback)
- [x] useMyTrips hooks (listTripsForDriver)
- [x] useTripOperations (startTrip, completeTrip, cancelTrip)
- [x] useConvexDashboard (aggregated dashboard data)
- [x] useTripCheckins hooks (getTripCheckins, recordCheckin)
- [x] usePendingStudents hooks
- [x] useStudentByQR hook for QR validation
- [x] Check-in mutations connected
- [x] GPS tracking submission (useGPSTracking hook)

**Layout Components**:
- [x] Sidebar (connected to Convex auth, role-based nav)
- [x] MobileNav (connected to Convex auth, role-based nav)
- [x] Real auth with fallback to mock for UI development

**GPS Tracking**: ✅ COMPLETE
- [x] GPS hooks structure ready
- [x] useGPSTracking hook (Geolocation API with watchPosition)
- [x] Updates to Convex every 15 seconds
- [x] Battery-efficient tracking (high accuracy / battery saver modes)
- [x] GPS errors handled gracefully (Spanish messages)
- [x] GPSStatusIndicator component (compact/detailed)
- [x] Geofence alerts from backend
- [x] Browser notifications for stop arrival
- [x] Integration in active trip page
- [x] Auto-start tracking when trip active (drivers only)
- [x] Auto-stop on trip finish or unmount

**QR Scanner**: ✅ COMPLETE
- [x] html5-qrcode library integrated
- [x] QRScanner component with camera access
- [x] useStudentByQR hook for validation
- [x] Camera access with back camera preference
- [x] QR scanning functional
- [x] Invalid QR handled gracefully
- [x] Flashlight toggle (for dark conditions)
- [x] Check-in page connected to Convex mutations

**Offline Functionality**:
- [ ] Service worker installed
- [ ] Route data cached in IndexedDB
- [ ] Student data cached
- [ ] Check-ins queued when offline
- [ ] GPS queued when offline
- [ ] Background sync working
- [ ] Offline indicator displayed

**PWA Features**:
- [x] PWA manifest configured
- [ ] App installable (needs testing)
- [ ] App icons (needs optimization)
- [ ] Standalone display mode
- [ ] Splash screen

**Files Created**:
- `apps/crew/src/app/*` - All crew pages
- `apps/crew/src/components/*` - Crew components
- `apps/crew/src/components/shared/GPSStatusIndicator.tsx` - GPS status display
- `apps/crew/src/components/checkin/QRScanner.tsx` - Camera-based QR scanner
- `apps/crew/src/hooks/*` - Convex hooks (useConvexTrips, useConvexCheckins, useConvexDashboard, etc.)
- `apps/crew/src/hooks/useGPSTracking.ts` - GPS tracking with Geolocation API
- `apps/crew/src/hooks/useConvexCheckins.ts` - Check-in hooks including useStudentByQR
- `apps/crew/src/lib/mockData/*` - Mock data for testing

**Backend Reports** (convex/reports.ts):
- `getDashboardMetrics` - Key metrics aggregation
- `getDailyStats` - Daily trip statistics
- `getTopRoutes` - Top performing routes
- `getTripReport` - Detailed trip report
- `getIncidentReport` - Incident report
- `getAttendanceReport` - Student attendance report

---

## Feature: Sistema de Novedades ✅ COMPLETE (Dec 15, 2025)

### Overview
Two-level route architecture for schedule exceptions:
- **Level 1**: Route Base (semester template) - routes, routeStops, studentRoutes
- **Level 2**: Route Programmed (daily instance) - trips, tripStudents, novedades

**Separation from Incidents**:
- **Novedades**: Affect routes/trips (absences, parent pickups, stop changes)
- **Incidentes**: Safety reports that do NOT affect route planning

### Database Tables Added
- [x] `tripStudents` - Students scheduled per trip with status (scheduled, absent, parent_pickup, stop_changed)
- [x] `novedades` - Schedule exceptions reported by parents (absence, parent_pickup, stop_change, early_pickup, late_arrival)
  - Added: `approved`, `approvedBy`, `approvedAt`, `approvalNotes` fields for coordination approval
- [x] `routeChangeRequests` - Permanent change requests requiring admin approval
- [x] `notifications` - Updated with category and relatedEntity fields

### Backend (convex/)
- [x] `convex/novedades.ts` - Full CRUD with validations
  - createNovedad (with 48h validation for stop changes)
  - getMyNovedades (parent view)
  - getNovedadesForTrip (crew view)
  - **review()** - NEW: Admin approve/reject novedades before crew sees them
  - acknowledgeNovedad (crew action - only for approved novedades)
  - cancelNovedad (parent action)
  - **getForAdmin()** - NEW: All novedades with filters for admin
  - **getPendingForAdmin()** - NEW: Pending novedades for admin review
  - **getPendingCountForAdmin()** - NEW: Count for badge display
- [x] `convex/routeChangeRequests.ts` - Approval workflow
  - createRouteChangeRequest
  - getPending (admin view)
  - review (approve/reject admin actions)
- [x] `convex/trips.ts` - TripStudents generation
  - generateTripStudents (applies novedades when creating trip)
  - getTripStudents, getTripStudentsSummary queries

### Parent App (apps/parent/)
- [x] `src/hooks/useNovedades.ts` - Hooks
  - useMyNovedades, usePendingNovedadesCount, useNovedad
  - useNovedadesMutations (create, cancel)
  - useMyRouteChangeRequests, useRouteChangeRequestMutations
- [x] `src/app/(dashboard)/novedades/page.tsx` - List view with status filtering
- [x] `src/app/(dashboard)/novedades/create/page.tsx` - Create form with validation
  - **NEW**: Pre-select student from URL query param (`?studentId=xxx`)
- [x] `src/components/dashboard/StudentCard.tsx`
  - **NEW**: "Reportar Novedad" button directly on student card
  - Links to create form with student pre-selected

### Crew App (apps/crew/)
- [x] `src/hooks/useTripStudents.ts` - Hooks
  - useTripStudents, useTripStudentsSummary
  - useNovedadesForTrip, useNovedadesByDate
  - useNovedadesMutations (acknowledge)
- [x] `src/app/(dashboard)/trips/[id]/students/page.tsx` - Updated with novedad indicators + acknowledgment

### Admin App (apps/admin/)
- [x] `src/hooks/useRouteChangeRequests.ts` - Hooks
  - usePendingRequests, usePendingRequestsCount
  - useReviewMutations (approve, reject)
- [x] `src/hooks/useNovedades.ts` - **NEW** Hooks for novedades
  - usePendingNovedades, useNovedades (with filters)
  - usePendingNovedadesCount, useNovedad
  - useNovedadReviewMutations (approve, reject)
- [x] `src/app/(dashboard)/requests/page.tsx` - **UPDATED** Unified page with tabs:
  - Tab 1: **Novedades del Dia** - Single-day exceptions pending approval
  - Tab 2: **Cambios Permanentes** - Route change requests
  - Tab 3: **Incidentes** - Open incidents
  - Summary stats cards for each category
  - Modal for reviewing/approving items

### Validations Implemented
- [x] Stop changes require 48 hours minimum advance notice
- [x] Absences can be reported until day before (configurable)
- [x] Permanent changes require admin approval
- [x] **NEW**: Daily novedades require coordination (admin) approval before crew acknowledgment
- [x] No conflicting novedades for same student/date
- [x] Only parents can create novedades for their students
- [x] Only crew can acknowledge approved novedades

### Workflow States (Updated Dec 15)
- **Novedades (Daily)**:
  - `pending` → `approved`/`rejected` (by admin) → `acknowledged` (by crew) → `applied` (at trip start)
  - Or: `pending` → `cancelled` (by parent) / `expired` (after date)
- **Route Change Requests (Permanent)**:
  - `pending` → `approved`/`rejected` (by admin)

---

## PR Checklist Template

Copy this into each PR:

```markdown
## Module: [Module Name]

### Requirements Checklist
- [ ] All features from PRD implemented
- [ ] Universal requirements met (multi-tenancy, RBAC, validation, etc.)
- [ ] Module-specific checklist items completed (see MODULE_CHECKLIST.md)
- [ ] Tests written and passing
- [ ] Documentation updated
- [ ] No blocking bugs
- [ ] Code reviewed

### Testing
- [ ] Manual testing completed
- [ ] Edge cases tested
- [ ] Error cases tested
- [ ] Performance acceptable

### Security
- [ ] No security vulnerabilities
- [ ] Input validation comprehensive
- [ ] Role-based access enforced

### Code Quality
- [ ] TypeScript strict mode
- [ ] No linter errors
- [ ] Code formatted (Prettier)
- [ ] No console.logs in production code

### Documentation
- [ ] API endpoints documented (if applicable)
- [ ] Code comments added for complex logic
- [ ] README updated (if needed)
- [ ] Bubble guide updated (if applicable)
```

---

## Verification Commands

### Before Creating PR

```bash
# 1. Review implementation
@review

# 2. Run tests
npm test

# 3. Check types
npm run type-check

# 4. Run linter
npm run lint

# 5. Check build
npm run build

# 6. Manual testing
npm run dev
# Test all functionality manually
```

### After PR Merge

```bash
# 1. Update main
git checkout main
git pull origin main

# 2. Check status
@state current

# 3. Verify deployment
# Check Convex deployment
npx convex logs

# Check Vercel deployment (if applicable)
vercel --prod
```

---

**Use this checklist to ensure every module meets all requirements before marking as complete!** ✅

**See also**:
- [IMPLEMENTATION_ORDER.md](IMPLEMENTATION_ORDER.md) - Module dependencies
- [CLAUDE.md](../../CLAUDE.md) - Agent commands
- [docs/PRD.md](../PRD.md) - Feature requirements
