# Task: Update Edit Route to Use Wizard Pattern

## Problem Analysis
1. **Edit Route uses old pattern** - Manual stop management without optimization
2. **No true delete** - `deactivateRoute` only sets `isActive: false`, route still shows in list
3. **Missing activate/deactivate toggle** - No UI to toggle route active status
4. **Future trips consideration** - Changes should apply to future trips

## Implementation Plan

### 1. Backend Changes (convex/routes.ts)

- [x] Add `updateRouteWithStops` mutation
  - Deletes all existing stops for the route
  - Deletes all existing studentRoutes for the route
  - Creates new stops from wizard data
  - Creates new studentRoutes from wizard data
  - Updates route metadata (name, type, times, optimization data)

- [x] Add `deleteRoute` mutation
  - Completely deletes the route
  - Deletes all routeStops for the route
  - Deletes all studentRoutes for the route
  - Does NOT affect existing trips (they have their own data)

### 2. Hook Changes (apps/admin/src/hooks/useRoutes.ts)

- [x] Add `updateRouteWithStops` wrapper function
- [x] Add `deleteRoute` wrapper function

### 3. Component Changes

- [x] Update `RouteWizard` to support edit mode
  - Accept optional `initialData` prop with existing route data
  - Pre-populate all three steps with existing data
  - Change button text from "Crear Ruta" to "Guardar Cambios"
  - Pass mode to onSave callback

- [x] Update Step1Planning to accept initial values
- [x] Update Step2StopAssignment to pre-select students from existing route
- [x] Update Step3Confirmation to use existing recurrence settings

### 4. Page Changes

- [x] Rewrite edit route page to use RouteWizard
  - Load existing route data
  - Transform to wizard format
  - Call updateRouteWithStops instead of createRouteWithStops

- [x] Update route detail page
  - Use deleteRoute instead of deactivateRoute
  - Add activate/deactivate toggle button

### 5. Future Trips Handling
- Route changes automatically apply to future trips because:
  - Trips are created on-demand when driver starts
  - Trip creation reads current route data
  - tripStudents generated from current studentRoutes
- No additional work needed for this requirement

## Files Modified
1. `convex/routes.ts` - Added mutations
2. `apps/admin/src/hooks/useRoutes.ts` - Added hooks
3. `apps/admin/src/components/routes/wizard/RouteWizard.tsx` - Added edit mode
4. `apps/admin/src/components/routes/wizard/Step1Planning.tsx` - Accept initial data
5. `apps/admin/src/components/routes/wizard/Step2StopAssignment.tsx` - Pre-select students
6. `apps/admin/src/components/routes/wizard/Step3Confirmation.tsx` - Accept initial data
7. `apps/admin/src/app/(dashboard)/routes/[id]/edit/page.tsx` - Use wizard
8. `apps/admin/src/app/(dashboard)/routes/[id]/page.tsx` - Updated delete action

## Review

### Cambios Realizados - 2025-12-27

**Backend (convex/routes.ts):**
1. `updateRouteWithStops` mutation - Updates route metadata, replaces all stops and studentRoutes
2. `deleteRoute` mutation - Completely deletes route, stops, and studentRoutes

**Frontend Hooks (apps/admin/src/hooks/useRoutes.ts):**
1. Added `updateRouteWithStops` wrapper function
2. Added `deleteRoute` wrapper function

**RouteWizard Component (apps/admin/src/components/routes/wizard/):**
1. Added `mode` prop ('create' | 'edit')
2. Added `initialData` prop for edit mode
3. Pre-populates all steps from initialData when editing
4. Changes button text to "Guardar Cambios" in edit mode
5. Redirects to route detail page after editing

**Route Edit Page (apps/admin/src/app/(dashboard)/routes/[id]/edit/page.tsx):**
1. Complete rewrite to use RouteWizard
2. Loads existing route data and transforms to wizard format
3. Calls `updateRouteWithStops` instead of manual stop management

**Route Detail Page (apps/admin/src/app/(dashboard)/routes/[id]/page.tsx):**
1. Added Activate/Deactivate toggle button
2. Changed delete to use `deleteRoute` (permanent delete vs soft delete)

**PageHeader Component (apps/admin/src/components/shared/PageHeader.tsx):**
1. Added `disabled` property support for action buttons

### Future Trips Handling
Route changes automatically apply to future trips because:
- Trips are created on-demand when driver starts
- Trip creation reads current route data (driverId, vehicleId, etc.)
- tripStudents generated from current studentRoutes at trip start time
- Existing trips are not affected (they have their own snapshot of the data)

### Verificación
- [x] Type check passes (`pnpm --filter @altaviapp/admin exec tsc --noEmit`)

---

# Task: Simplify Crew App Navigation and UX

## Problem Analysis
1. **Navigation overloaded** - 11 items in sidebar, 5 in mobile nav
2. **Standalone pages without context** - Check-in, Map, Students only make sense during active trip
3. **Duplicate functionality** - Trips and Calendar showing similar data
4. **Settings and History scattered** - Should be part of Profile

## Implementation Plan

### Fase 1: Simplificar navegación a 4 items
- [x] Update `MobileNav.tsx` - Reduce to 4 items (Inicio, Calendario, Rutas, Perfil)
- [x] Add contextual navigation for active trips
- [x] Update `Sidebar.tsx` - Same 4 items

### Fase 2: Mejorar calendario con viajes
- [x] Update `calendar/page.tsx` - Show trips list with actions
- [x] Select today's date by default
- [x] Add "Iniciar Viaje" button for scheduled trips
- [x] Add "Ver Viaje" button for in-progress trips

### Fase 3: Crear sheets para viaje activo
- [x] Create `Sheet.tsx` component for reusable bottom sheets
- [x] Keep existing trip pages (students, incidents, map) - no duplication needed

### Fase 4: Agregar tabs a perfil
- [x] Rewrite `profile/page.tsx` with tabs
- [x] Add Perfil tab (existing content)
- [x] Add Historial tab (merged from /history)
- [x] Add Ajustes tab (merged from /settings)

### Fase 5: Eliminar páginas obsoletas
- [x] Delete `/trips/page.tsx` - merged into /calendar
- [x] Delete `/checkin/` - only in active trip context
- [x] Delete `/map/` - only in active trip context
- [x] Delete `/students/` - mock data, not used
- [x] Delete `/history/` - merged into /profile
- [x] Delete `/settings/` - merged into /profile

## Files Modified

### Navigation
- `apps/crew/src/components/layout/MobileNav.tsx` - 4 items + contextual nav
- `apps/crew/src/components/layout/Sidebar.tsx` - 4 items, removed Settings link

### Pages Enhanced
- `apps/crew/src/app/(dashboard)/calendar/page.tsx` - Added trip list with actions
- `apps/crew/src/app/(dashboard)/profile/page.tsx` - Added tabs (Profile, History, Settings)

### New Components
- `apps/crew/src/components/shared/Sheet.tsx` - Reusable bottom sheet component

### Files Deleted
- `apps/crew/src/app/(dashboard)/trips/page.tsx`
- `apps/crew/src/app/(dashboard)/checkin/` (folder)
- `apps/crew/src/app/(dashboard)/map/` (folder)
- `apps/crew/src/app/(dashboard)/students/` (folder)
- `apps/crew/src/app/(dashboard)/history/` (folder)
- `apps/crew/src/app/(dashboard)/settings/` (folder)

## Summary of Changes

| Before | After |
|--------|-------|
| 11 items navigation | 4 items |
| Standalone pages (checkin, map, students) | Only in active trip context |
| /trips + /calendar separate | Merged in /calendar |
| /history, /settings separate | Tabs in /profile |
| Fixed bottom nav | Contextual bottom nav |

### Verificación
- [x] Type check passes (`pnpm --filter @altaviapp/crew exec tsc --noEmit`)

---

# Task: Bulk Student Import with Parent Invitations

## Problem Analysis
1. **No bulk student import** - Only bulk invitations exist, not students
2. **No "household" grouping** - Students with same parentEmail should be grouped
3. **No secondary guardian** - Only one parent email per student
4. **No staging/preview** - Can't review before committing

## Implementation Plan

### 1. Schema Changes (convex/schema.ts)
- [x] Add `secondaryParentEmail` to students table
- [x] Add `guardianUserIds` to students table (array of user IDs)
- [x] Add indexes: `by_parent_email`, `by_secondary_parent_email`

### 2. Backend: importStudentsBulk (convex/students.ts)
- [x] Create `validateStudentImport` query (preview mode)
- [x] Create `importStudentsBulk` mutation
  - Validate all student data
  - Group students by parentEmail (detect households)
  - Create students in bulk
  - Optionally create invitations for new parent emails
  - Return summary with households detected

### 3. Backend: inviteSecondaryGuardian (convex/students.ts)
- [x] Create `inviteSecondaryGuardian` mutation
  - Verify parent owns student (or admin access)
  - Update secondaryParentEmail on student
  - Create invitation for secondary guardian
  - Handle existing users (auto-link)

### 4. Verification
- [x] Type check passes (`npx tsc --noEmit -p convex/tsconfig.json`)

## Files Modified
1. `convex/schema.ts` - Added 2 fields + 2 indexes to students table
2. `convex/students.ts` - Added 3 new endpoints (~400 lines)

## Review

### Cambios Realizados - 2025-12-27

**Schema (convex/schema.ts):**
1. Added `secondaryParentEmail: v.optional(v.string())` - Second guardian email
2. Added `guardianUserIds: v.optional(v.array(v.id("users")))` - Linked user accounts
3. Added `.index("by_parent_email", ["parentEmail"])` - For household grouping
4. Added `.index("by_secondary_parent_email", ["secondaryParentEmail"])` - For secondary guardian lookup

**New Endpoints (convex/students.ts):**

1. **`validateStudentImport`** (query) - Preview/staging mode
   - Validates student data without saving
   - Detects households by grouping parentEmail
   - Returns validation errors per row
   - Shows which emails need invitations vs already exist

2. **`importStudentsBulk`** (mutation) - Main import function
   - Creates students in bulk (max 200 per batch)
   - Groups by parentEmail (household detection)
   - Optionally sends invitations to new parent emails
   - Links existing users to students via guardianUserIds
   - Returns detailed summary with households

3. **`inviteSecondaryGuardian`** (mutation) - Add second guardian
   - Primary parent or admin can invite
   - Sets secondaryParentEmail on student
   - Creates invitation if user doesn't exist
   - Auto-links if user already exists

### API Usage Examples

```typescript
// 1. Preview import (staging)
const preview = await ctx.runQuery(api.students.validateStudentImport, {
  userId,
  institutionId,
  students: csvData,
});
// Returns: { summary, validationResults, households }

// 2. Execute import with invitations
const result = await ctx.runMutation(api.students.importStudentsBulk, {
  userId,
  institutionId,
  students: csvData,
  sendInvitations: true,
});
// Returns: { summary, createdStudents, households, invitationsCreated, errors }

// 3. Parent invites secondary guardian
const invite = await ctx.runMutation(api.students.inviteSecondaryGuardian, {
  userId,
  studentId,
  email: "spouse@example.com",
  name: "María García",
});
// Returns: { success, message, invitationSent }
```

### Household Detection Logic
- Students are grouped by `parentEmail` (case-insensitive)
- Same email = same household (no explicit Household table needed)
- Example: If CSV has 3 students with `parent@example.com`, they're detected as 1 household with 3 students

---

# Task: Bulk Import Frontend Implementation

## Implementation Plan
- [x] Add import functions to useStudents hook (admin)
- [x] Create student import page with CSV upload wizard
- [x] Add import button to students list page
- [x] Create secondary guardian UI in parent app
- [x] Run type check and verify

## Files Modified

### Admin App
1. `apps/admin/src/hooks/useStudents.ts` - Added `useValidateStudentImport`, `useStudentImportMutations`
2. `apps/admin/src/hooks/index.ts` - Exported new hooks
3. `apps/admin/src/app/(dashboard)/students/import/page.tsx` - **NEW** Complete import wizard
4. `apps/admin/src/app/(dashboard)/students/page.tsx` - Added "Importar CSV" button

### Parent App
1. `apps/parent/src/hooks/useMyStudents.ts` - Added `inviteSecondaryGuardian` mutation
2. `apps/parent/src/app/(dashboard)/hijos/[id]/page.tsx` - Added "Segundo Tutor" section with modal

## Features Implemented

### Admin: CSV Import Wizard (`/students/import`)
- **Step 1 - Upload**: Drag & drop CSV, download template
- **Step 2 - Preview**: Validate data, detect households, show errors, toggle invitations
- **Step 3 - Confirm**: Show results summary, next steps

### Parent: Secondary Guardian Invitation
- View existing secondary guardian
- Modal to invite new guardian (name + email)
- Real-time feedback on invitation status

### Verificación
- [x] Type check passes (admin, parent, convex)

---

# Task: v1.0 Scope Finalization

## Date: 2025-12-27

## Summary
Marked non-critical features as "Out of Scope - v1.0" to accelerate time-to-market. All core functionality is complete.

## Changes Made

### PRD Updated (docs/PRD.md)
1. Added "Out of Scope (v1.0)" section at top with deferred features list
2. Module 2 (Institutions): ✅ Implemented - settings deferred
3. Module 3 (Fleet): ✅ Implemented - documents/maintenance deferred
4. Module 8 (Incidents): ✅ Implemented - photo/video deferred
5. Module 9 (Admin): ✅ Implemented - reports dashboard deferred
6. Module 10 (Parent): ✅ Implemented - contact driver deferred
7. Added "v2.0 - Deferred from v1.0" section to Future Roadmap
8. Updated version history to v2.1

## Features Deferred to v2.0

**Fleet Enhancements**:
- Vehicle document management (insurance, inspection, registration uploads)
- Maintenance scheduling and history
- Document expiration alerts

**Advanced Features**:
- Reports and analytics dashboard (beyond basic stats)
- Incident photo/video attachments
- Contact driver/admin (direct messaging in-app)
- Institution settings (working hours, notification preferences)

## Result

| Module | Before | After |
|--------|--------|-------|
| Module 2 (Institutions) | ⚠️ 80% | ✅ Implemented (v1.0 scope) |
| Module 3 (Fleet) | ⚠️ 70% | ✅ Implemented (v1.0 scope) |
| Module 8 (Incidents) | ⚠️ 85% | ✅ Implemented (v1.0 scope) |
| Module 9 (Admin) | ✅ Implemented | ✅ Implemented (v1.0 scope) |
| Module 10 (Parent) | ✅ Implemented | ✅ Implemented (v1.0 scope) |

**All 11 modules now marked as ✅ Implemented for v1.0 scope.**

## MVP Status
🚀 **Ready for launch** - All core functionality complete:
- Authentication & RBAC ✅
- Multi-tenancy ✅
- Fleet management ✅
- Student management + bulk import ✅
- Route planning with wizard ✅
- Trip management (lazy creation) ✅
- Check-ins + in-app notifications ✅
- Incidents + Novedades ✅
- Admin Dashboard ✅
- Parent Portal ✅
- Crew App ✅

---

# Task: GPS External Devices Configuration System

## Date: 2025-12-27

## Problem Analysis
The existing GPS configuration was basic - only supporting mobile GPS from crew app. For production, we need:
1. Support for external GPS devices (trackers installed in vehicles)
2. Dynamic field mapping for different device protocols
3. Sandbox environment to test before production
4. Device-vehicle assignment with history tracking

## Implementation Plan

### Phase 1: Schema & Backend
- [x] Add 3 new tables: `gpsDevices`, `gpsDeviceAssignments`, `gpsWebhookSamples`
- [x] Create `convex/gpsDevices.ts` - CRUD for devices + assignment mutations
- [x] Create `convex/gpsWebhook.ts` - Sandbox processing + field mapping utilities

### Phase 2: HTTP Endpoints
- [x] Add `POST /gps/sandbox` - Receives test webhooks, stores samples
- [x] Add `POST /gps/device/v2` - Processes GPS with dynamic field mapping

### Phase 3: Admin UI
- [x] Create `/fleet/gps-devices` page - List all GPS devices with status
- [x] Create `/fleet/gps-devices/[id]/configure` - 4-step wizard
- [x] Create `/fleet/gps-devices/[id]/history` - Assignment history
- [x] Add sidebar link for GPS Devices

## Files Created/Modified

### Backend (Convex)
| File | Action | Description |
|------|--------|-------------|
| `convex/schema.ts` | Modified | Added 3 tables with indexes |
| `convex/gpsDevices.ts` | **Created** | CRUD + assignment with history (~400 lines) |
| `convex/gpsWebhook.ts` | **Created** | Sandbox + auto-detect + field mapping (~500 lines) |
| `convex/http.ts` | Modified | Added 2 new endpoints with CORS |

### Frontend (Admin)
| File | Action | Description |
|------|--------|-------------|
| `.../fleet/gps-devices/page.tsx` | **Created** | Device list + create modal |
| `.../fleet/gps-devices/[id]/configure/page.tsx` | **Created** | 4-step configuration wizard |
| `.../fleet/gps-devices/[id]/history/page.tsx` | **Created** | Assignment history timeline |
| `.../components/layout/Sidebar.tsx` | Modified | Added GPS Devices nav item |

## New Database Tables

### gpsDevices
Stores GPS device configuration with dynamic field mapping:
- `deviceId` - External device identifier (IMEI, serial, etc.)
- `fieldMapping` - JSON config for lat/lon/speed/heading/timestamp paths
- `vehicleId` - Currently assigned vehicle
- `status` - pending_config → testing → active → inactive
- `lastSeen`, `lastPayloadSample` - For monitoring

### gpsDeviceAssignments
Tracks device-vehicle assignments for audit:
- `assignedAt`, `unassignedAt` - Time range
- `assignedBy`, `unassignedBy` - User who made change
- `reason` - Optional notes

### gpsWebhookSamples
Stores sandbox webhook samples for configuration:
- `rawPayload` - Original JSON
- `parsedFields` - Auto-detected fields
- `isProcessed` - Whether used for device config

## Configuration Wizard (4 Steps)

### Step 1: Wait for Data
- Shows sandbox endpoint URL
- Shows institution API token
- Lists received samples in real-time

### Step 2: Map Fields
- JSON viewer with sample payload
- Dropdown selectors for each GPS field
- Auto-suggests mappings based on common patterns
- Validates device ID matches configured device

### Step 3: Test
- Select sample and test mapping
- Shows extracted values with validation
- Green/red status based on success

### Step 4: Assign Vehicle
- Select from available vehicles
- Creates assignment history record
- Updates vehicle's GPS config

## API Usage

### Sandbox (Testing)
```bash
curl -X POST https://xxx.convex.site/gps/sandbox \
  -H "X-Institution-Token: abc123" \
  -H "Content-Type: application/json" \
  -d '{"lat": -0.123, "lng": -78.456, "deviceId": "GPS-001"}'
```

### Production (Active Devices)
```bash
curl -X POST https://xxx.convex.site/gps/device/v2 \
  -H "X-Institution-Token: abc123" \
  -H "Content-Type: application/json" \
  -d '{"lat": -0.123, "lng": -78.456, "deviceId": "GPS-001"}'
```

## Verification
- [x] Convex codegen passes
- [x] Admin app TypeScript check passes (GPS pages only)
- [x] Sidebar shows GPS Devices link

## Next Steps (Future)
1. Add provider-specific integrations (Samsara, Garmin webhooks)
2. Add device monitoring dashboard with alerts
3. Add rate limiting per device
4. Add GPS data validation (impossible jumps, etc.)
