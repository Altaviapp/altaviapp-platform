# Module Implementation Checklist

**Requirements Verification for Each Module**
**Version**: 1.0
**Date**: January 2025

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

### Multi-Tenancy
- [ ] All queries filter by `institutionId` (except super_admin)
- [ ] No cross-institution data access possible
- [ ] Row-level security enforced in Convex
- [ ] Institution context validated on every mutation

### Role-Based Access Control
- [ ] Role verification before sensitive operations
- [ ] `super_admin` has appropriate elevated access
- [ ] `admin` limited to own institution
- [ ] `driver` limited to own trips/routes
- [ ] `parent` read-only, own students only

### TypeScript & Type Safety
- [ ] TypeScript strict mode enabled
- [ ] No `any` types used
- [ ] All Convex functions properly typed
- [ ] API responses typed correctly

### Input Validation
- [ ] All inputs validated with Zod schemas
- [ ] Phone numbers validated (+593XXXXXXXXX format)
- [ ] Emails validated
- [ ] Dates validated (Unix timestamps)
- [ ] Required fields enforced

### Error Handling
- [ ] Standard error response format used
- [ ] Meaningful error messages (Spanish)
- [ ] Error codes defined and consistent
- [ ] Try-catch blocks around async operations
- [ ] Graceful degradation

### Performance
- [ ] Queries use proper indexes
- [ ] No N+1 query problems
- [ ] Pagination implemented where needed
- [ ] Response times meet requirements (<500ms)

### Security
- [ ] No sensitive data in logs
- [ ] Input sanitization
- [ ] SQL injection prevention (Convex handles this)
- [ ] XSS prevention
- [ ] HTTPS enforced

### Testing
- [ ] Unit tests written
- [ ] Integration tests written
- [ ] Edge cases covered
- [ ] Error cases tested
- [ ] Tests passing

### Documentation
- [ ] Code comments for complex logic
- [ ] API endpoints documented
- [ ] Function purposes clear
- [ ] README updated if needed

---

## Phase 1: Foundation

### Module 1: auth

**Functionality**:
- [ ] Clerk SDK properly integrated
- [ ] Clerk webhook handler functional (/auth/sync)
- [ ] New users auto-create in Convex
- [ ] User sync includes all required fields
- [ ] Role assignment working

**Helper Functions**:
- [ ] `getCurrentUser()` returns correct user
- [ ] `requireRole()` enforces roles properly
- [ ] `requireInstitutionAccess()` prevents cross-institution access
- [ ] JWT validation working

**Security**:
- [ ] Webhook signature validation (Clerk)
- [ ] Token expiration handled
- [ ] Invalid tokens rejected

**Testing**:
- [ ] Can create user via Clerk
- [ ] User appears in Convex
- [ ] Role checks work correctly
- [ ] Institution filtering works

---

### Module 2: api-core

**Response Format**:
- [ ] `successResponse()` returns standard format
- [ ] `errorResponse()` returns standard format
- [ ] Timestamps in ISO 8601 format
- [ ] Type safety for response generics

**Error Classes**:
- [ ] `ApiError` base class created
- [ ] `BadRequestError` (400) works
- [ ] `UnauthorizedError` (401) works
- [ ] `ForbiddenError` (403) works
- [ ] `NotFoundError` (404) works
- [ ] `ValidationError` (422) works

**API Structure**:
- [ ] `/api/v1` base route configured
- [ ] CORS configured for Bubble.io origin
- [ ] Request validation middleware
- [ ] Error handling middleware

**Validation**:
- [ ] Common Zod schemas defined (phone, email, date, latLng)
- [ ] Validation helper functions work
- [ ] Error messages user-friendly (Spanish)

---

### Module 3: institutions

**CRUD Operations**:
- [ ] GET /institutions returns list (super_admin only)
- [ ] POST /institutions creates institution
- [ ] GET /institutions/:id returns details
- [ ] PUT /institutions/:id updates institution
- [ ] DELETE /institutions/:id deletes institution

**Multi-Tenancy Foundation**:
- [ ] Institution filtering works
- [ ] Super admin can see all institutions
- [ ] Regular admin sees only own institution
- [ ] Institution ID required for all future modules

**Validation**:
- [ ] Institution creation requires all fields
- [ ] Email format validated
- [ ] Phone format validated
- [ ] Subscription plan validated

**Business Logic**:
- [ ] Active/suspended status enforced
- [ ] Subscription status tracked
- [ ] Contact person information stored

---

## Phase 2: Backend APIs

### Module 4: fleet-api

**Vehicles**:
- [ ] GET /vehicles returns filtered list
- [ ] POST /vehicles creates vehicle
- [ ] GET /vehicles/:id returns details
- [ ] PUT /vehicles/:id updates vehicle
- [ ] DELETE /vehicles/:id deletes vehicle
- [ ] POST /vehicles/:id/upload-document uploads files

**Drivers**:
- [ ] GET /drivers returns filtered list
- [ ] POST /drivers creates driver
- [ ] GET /drivers/:id returns details
- [ ] PUT /drivers/:id updates driver
- [ ] DELETE /drivers/:id deletes driver

**Documents & Certifications**:
- [ ] Document upload to Convex storage
- [ ] Expiry dates tracked
- [ ] Document types validated (SOAT, technical review, etc.)
- [ ] License expiry validation

**Status Management**:
- [ ] Vehicle status (active/maintenance/out_of_service/retired)
- [ ] Driver status (active/inactive)
- [ ] Current vehicle assignment tracked

---

### Module 5: students-api

**CRUD Operations**:
- [ ] GET /students returns filtered list
- [ ] POST /students creates student with QR
- [ ] GET /students/:id returns details
- [ ] PUT /students/:id updates student
- [ ] DELETE /students/:id deletes student

**QR Code System**:
- [ ] QR code auto-generated on creation
- [ ] QR contains: studentId, institutionId, timestamp
- [ ] QR image (data URL) returned
- [ ] GET /students/:id/qr returns QR
- [ ] POST /students/:id/regenerate-qr works

**Parent Information**:
- [ ] Parent name, phone, email required
- [ ] Secondary parent optional
- [ ] Emergency contacts stored (array)
- [ ] Authorized pickup persons stored

**Medical Information**:
- [ ] Medical info optional
- [ ] Allergies, medications, special needs
- [ ] Blood type stored

**Validation**:
- [ ] Phone format (+593XXXXXXXXX)
- [ ] Email format
- [ ] Age validation (dateOfBirth)
- [ ] Grade validation

---

### Module 6: routes-api

**Routes**:
- [ ] GET /routes returns filtered list
- [ ] POST /routes creates route
- [ ] GET /routes/:id returns route + stops
- [ ] PUT /routes/:id updates route
- [ ] DELETE /routes/:id deletes route

**Route Stops**:
- [ ] GET /routes/:routeId/stops returns ordered stops
- [ ] POST /routes/:routeId/stops creates stop
- [ ] PUT /routes/:routeId/stops/:stopId updates stop
- [ ] DELETE /routes/:routeId/stops/:stopId deletes stop
- [ ] PUT /routes/:routeId/stops/reorder reorders stops

**Geofencing**:
- [ ] Geofence radius configurable per stop
- [ ] Default radius: 100 meters
- [ ] Distance calculation function works
- [ ] Geofence detection on GPS update

**Capacity Management**:
- [ ] Max capacity tracked
- [ ] Current occupancy calculated
- [ ] Capacity warnings when exceeded

**Schedule**:
- [ ] Operating days configurable
- [ ] Scheduled times per stop
- [ ] Estimated duration calculated

---

### Module 7: trips-api

**Trips**:
- [ ] GET /trips returns filtered list
- [ ] POST /trips creates trip
- [ ] GET /trips/:id returns trip details
- [ ] PUT /trips/:id/start starts trip
- [ ] PUT /trips/:id/complete completes trip
- [ ] PUT /trips/:id/cancel cancels trip
- [ ] GET /trips/active returns active trip

**GPS Tracking**:
- [ ] POST /trips/:tripId/location updates GPS
- [ ] GET /trips/:tripId/location returns current location
- [ ] GET /trips/:tripId/location/history returns history
- [ ] Location updates < 1 second latency
- [ ] Real-time updates via Convex live queries

**Student Routes**:
- [ ] POST /student-routes assigns student to route
- [ ] GET /student-routes/:id returns assignment
- [ ] PUT /student-routes/:id updates assignment
- [ ] DELETE /student-routes/:id removes assignment

**Geofencing Integration**:
- [ ] Geofence check on GPS update
- [ ] Notifications when entering stop geofence
- [ ] Distance to next stop calculated

**Status Management**:
- [ ] scheduled → in_progress → completed flow
- [ ] Emergency status handling
- [ ] Cancelled status handling

**Pre-trip Checklist**:
- [ ] Checklist stored with trip
- [ ] All items required before start
- [ ] Checklist timestamp and user recorded

---

### Module 8: checkins-api

**Check-ins**:
- [ ] POST /checkins records check-in
- [ ] POST /checkins/validate-qr validates QR
- [ ] GET /checkins returns list
- [ ] GET /checkins/:id returns details

**QR Validation**:
- [ ] QR code parsed correctly
- [ ] Student validated against route
- [ ] Invalid QR rejected
- [ ] Expired QR rejected
- [ ] Validation time < 500ms

**Parent Notifications**:
- [ ] WhatsApp notification sent on pickup
- [ ] WhatsApp notification sent on dropoff
- [ ] Notification includes: student name, time, vehicle
- [ ] Notification logged in communicationLogs

**Location Verification**:
- [ ] GPS location recorded with check-in
- [ ] Distance from stop calculated
- [ ] Warning if too far from stop

**Manual Check-in**:
- [ ] Manual check-in without QR allowed
- [ ] Manual check-in flagged

**Authorized Persons** (dropoff):
- [ ] Authorized person verification
- [ ] ID document validation
- [ ] Unauthorized persons rejected

---

### Module 9: incidents-api

**Incidents**:
- [ ] GET /incidents returns filtered list
- [ ] POST /incidents creates incident
- [ ] GET /incidents/:id returns details
- [ ] PUT /incidents/:id updates incident
- [ ] PUT /incidents/:id/resolve resolves incident
- [ ] POST /incidents/:id/upload-photo uploads photos

**Classification**:
- [ ] Type: accident/breakdown/behavior/emergency/medical/security/other
- [ ] Severity: low/medium/high/critical
- [ ] Category: vehicle/student/driver/route/external

**Emergency Handling**:
- [ ] Critical incidents trigger alerts
- [ ] Emergency services notification flag
- [ ] Admin notification on critical severity

**Status Workflow**:
- [ ] open → investigating → pending_review → resolved → closed
- [ ] Status transitions validated
- [ ] Resolution requires summary

**Documentation**:
- [ ] Photos upload to Convex storage
- [ ] Multiple photos supported
- [ ] Documents upload supported
- [ ] Investigation notes stored

---

## Phase 3: Frontends

### Module 10: bubble-admin

**Pages Created**:
- [ ] Dashboard overview
- [ ] Fleet management (vehicles, drivers)
- [ ] Route management
- [ ] Student management
- [ ] Trip monitoring
- [ ] Incident management
- [ ] Reports
- [ ] Settings

**API Integration**:
- [ ] Clerk plugin configured
- [ ] API Connector configured
- [ ] All API calls functional
- [ ] Authentication working

**CRUD Workflows**:
- [ ] Create operations work
- [ ] Read/list operations work
- [ ] Update operations work
- [ ] Delete operations work (with confirmation)

**Real-time Features**:
- [ ] GPS tracking auto-refreshes
- [ ] Trip status updates automatically
- [ ] Notifications display correctly

**User Experience**:
- [ ] Responsive design (mobile-friendly)
- [ ] Loading indicators
- [ ] Error messages displayed
- [ ] Success confirmations
- [ ] Input validation

---

### Module 11: bubble-parent

**Pages Created**:
- [ ] Login/signup
- [ ] Student dashboard
- [ ] Real-time tracking
- [ ] Notification history
- [ ] Trip history
- [ ] Contact/profile

**Real-time Tracking**:
- [ ] Map displays vehicle location
- [ ] Auto-refresh every 15 seconds
- [ ] ETA calculation
- [ ] Route progress visualization

**Notifications**:
- [ ] Pickup notifications displayed
- [ ] Dropoff notifications displayed
- [ ] Emergency alerts prominent
- [ ] Notification history accessible

**Student Info**:
- [ ] Can view multiple students (if applicable)
- [ ] Student photo displayed
- [ ] Grade and route info visible
- [ ] Emergency contacts accessible

**User Experience**:
- [ ] Mobile-optimized (primary use case)
- [ ] Simple, parent-friendly UI
- [ ] Spanish language
- [ ] Touch-friendly buttons

---

### Module 12: driver-pwa

**Pages Created**:
- [ ] Login
- [ ] Route selection
- [ ] Active trip
- [ ] Pre-trip checklist
- [ ] Student check-in
- [ ] Incident report
- [ ] Trip history

**GPS Tracking**:
- [ ] Continuous GPS updates
- [ ] Updates every 15 seconds
- [ ] Battery-efficient tracking
- [ ] GPS errors handled gracefully

**QR Scanner**:
- [ ] Camera access granted
- [ ] QR scanning functional
- [ ] Scan time < 500ms
- [ ] Invalid QR handled
- [ ] Flashlight toggle (for dark conditions)

**Offline Functionality**:
- [ ] Service worker installed
- [ ] Route data cached in IndexedDB
- [ ] Student data cached
- [ ] Check-ins queued when offline
- [ ] GPS queued when offline
- [ ] Background sync working
- [ ] Offline indicator displayed

**PWA Features**:
- [ ] PWA manifest configured
- [ ] App installable
- [ ] App icons (192x192, 512x512)
- [ ] Standalone display mode
- [ ] Splash screen

**Push Notifications**:
- [ ] Permission request
- [ ] Notifications received
- [ ] Notification actions work

**Performance**:
- [ ] App loads < 3 seconds
- [ ] Smooth animations
- [ ] No lag during GPS updates
- [ ] Minimal battery drain

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
