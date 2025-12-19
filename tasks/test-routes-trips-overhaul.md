# Test Plan: Routes & Trips System Overhaul

## Prerequisites

Before testing, ensure:
1. All apps are running (`pnpm dev` in root directory)
2. Convex dev server is running (`npx convex dev`)

**URLs:**
- Admin: http://localhost:3001
- Parent: http://localhost:3002
- Crew: http://localhost:3003

---

## Phase 1: Environment Setup

### Test 1.1: Start Development Servers

**Steps:**
1. Open terminal in project root
2. Run `npx convex dev` (keep running)
3. Open another terminal, run `pnpm dev`
4. Wait for all apps to compile

**Expected:**
- Convex shows "✓ Connected to deployment"
- Admin app running on http://localhost:3001
- Parent app running on http://localhost:3002
- Crew app running on http://localhost:3003

**Report format:**
```
Test 1.1: [PASS/FAIL]
- Convex connected: [YES/NO]
- Admin app: [YES/NO]
- Parent app: [YES/NO]
- Crew app: [YES/NO]
- Error if any: [description]
```

---

### Test 1.2: Login to Admin App

**Steps:**
1. Go to http://localhost:3000
2. Login with admin credentials (or create account if first time)
3. Verify you reach the dashboard

**Expected:**
- Login form displays
- After login, dashboard loads
- Sidebar shows navigation

**Report format:**
```
Test 1.2: [PASS/FAIL]
- Login form visible: [YES/NO]
- Dashboard loaded: [YES/NO]
- Admin user ID: [copy from Convex dashboard or dev tools]
- Institution ID: [copy from Convex dashboard]
```

---

## Phase 2: Create Test Data (Prerequisites for Routes)

### Test 2.1: Configure School Location

**Steps:**
1. In Admin app, go to Settings → School Location (or `/settings/school`)
2. If page doesn't exist, use Convex mutation:
```bash
npx convex run institutions:updateSchoolLocation \
  --args '{
    "userId": "<admin_user_id>",
    "institutionId": "<institution_id>",
    "schoolLatitude": -0.1807,
    "schoolLongitude": -78.4678,
    "schoolAddress": "Av. Amazonas y Naciones Unidas, Quito"
  }'
```
3. Verify the location is saved

**Expected:**
- School location saved to institution
- Can query institution to see schoolLatitude/schoolLongitude

**Report format:**
```
Test 2.1: [PASS/FAIL]
- Settings page exists: [YES/NO]
- Location saved: [YES/NO]
- Error if any: [description]
```

---

### Test 2.2: Create Vehicle

**Steps:**
1. Go to Fleet → Vehicles (`/fleet`) in Admin app
2. Click "Nuevo Vehículo" or use mutation:
```bash
npx convex run vehicles:create \
  --args '{
    "userId": "<admin_user_id>",
    "licensePlate": "ABC-1234",
    "brand": "Toyota",
    "model": "Hiace",
    "year": 2022,
    "color": "Blanco",
    "capacity": 15,
    "insuranceExpiry": "2025-12-31",
    "technicalReviewExpiry": "2025-06-30"
  }'
```
3. Note the vehicle ID

**Expected:**
- Vehicle created successfully
- Appears in vehicles list

**Report format:**
```
Test 2.2: [PASS/FAIL]
- Vehicle created: [YES/NO]
- Vehicle ID: [<vehicle_id>]
- Error if any: [description]
```

---

### Test 2.3: Invite Driver (via Invitation Flow)

**New Flow:** Drivers are created via invitation. Admin sends invitation → Driver accepts → Profile auto-created → Driver completes professional info in Crew app.

**Steps:**
1. Go to Fleet → Drivers in Admin app (`/fleet?tab=drivers`)
2. Click "Nuevo Conductor"
3. Fill in the simple form:
   - Nombre: Carlos
   - Apellido: Mendoza
   - Email: carlos.driver@test.com
   - Teléfono: +593991234567
4. Click "Enviar Invitación"
5. **Accept the invitation:**
   - Check the email for invitation link, OR
   - Use the invite token directly in the browser, OR
   - Use Convex mutation to simulate acceptance:
   ```bash
   # First, find the invitation token
   npx convex run invitations:listInvitations --args '{"userId": "<admin_user_id>", "institutionId": "<institution_id>"}'

   # Then accept it (creates user + driver profile)
   npx convex run invitations:acceptInvitation --args '{"token": "<invitation_token>", "name": "Carlos Mendoza", "password": "Test123!"}'
   ```
6. Verify driver profile was auto-created

**Expected:**
- Invitation created with status "pending"
- After acceptance: user account created with role "driver"
- Driver profile auto-created (empty professional fields)
- Driver appears in fleet list

**Report format:**
```
Test 2.3: [PASS/FAIL]
- Invitation sent: [YES/NO]
- Success message shown: [YES/NO]
- Invitation accepted: [YES/NO]
- Driver user created: [YES/NO]
- Driver profile auto-created: [YES/NO]
- Driver User ID: [<driver_user_id>]
- Driver ID: [<driver_id>]
- Error if any: [description]
```

---

### Test 2.3b: Driver Completes Profile in Crew App

**Steps:**
1. Login to Crew app as the driver (http://localhost:3003)
2. Go to Profile page (`/profile`)
3. Verify "Perfil incompleto" warning is shown
4. Click "Editar" or "Completar perfil"
5. Fill in Contact section:
   - Teléfono: +593991234567
   - Contacto de emergencia: +593998765432
6. Click "Guardar"
7. Fill in License section:
   - Número de licencia: LIC-12345
   - Tipo: D (Buses y busetas)
   - Vencimiento: 2026-01-01
8. Click "Guardar"
9. Verify profile is now complete

**Expected:**
- Edit page shows GlobalProfileSection + DriverProfileSection
- After saving, profileCompleted becomes true
- Warning disappears from profile page
- Data persists across page refresh

**Report format:**
```
Test 2.3b: [PASS/FAIL]
- Profile edit page loads: [YES/NO]
- Global section editable: [YES/NO]
- Driver section editable: [YES/NO]
- Data saved successfully: [YES/NO]
- profileCompleted is true: [YES/NO]
- Error if any: [description]
```

---

### Test 2.3c: Invite Monitor (Optional)

**Steps:**
1. Go to Fleet → Monitors in Admin app (`/fleet?tab=monitors`)
2. Click "Nuevo Auxiliar"
3. Fill in the simple form:
   - Nombre: María
   - Apellido: Torres
   - Email: maria.monitor@test.com
   - Teléfono: +593997654321
4. Click "Enviar Invitación"
5. Accept the invitation (same process as driver)
6. Login to Crew app as monitor
7. Complete profile:
   - Cédula: 1712345678
   - Teléfono: +593997654321
   - Contacto de emergencia: +593991234567
   - Certificaciones: Primeros auxilios, Cuidado infantil

**Expected:**
- Monitor profile auto-created on invitation acceptance
- Profile edit page shows MonitorProfileSection (cédula, certificates)
- After completing, profileCompleted becomes true

**Report format:**
```
Test 2.3c: [PASS/FAIL]
- Invitation sent: [YES/NO]
- Monitor profile auto-created: [YES/NO]
- Profile edit works: [YES/NO]
- Certificates saved: [YES/NO]
- profileCompleted is true: [YES/NO]
```

---

### Test 2.4: Create Test Students with Locations

**IMPORTANT:** Students MUST have home locations (latitude/longitude) to appear in the route wizard.

**Steps:**
1. Go to Students (`/students`) in Admin app
2. Create 5 students with locations. Use the UI or mutations:

**Student 1 (Northern area):**
```bash
npx convex run students:create \
  --args '{
    "userId": "<admin_user_id>",
    "firstName": "María",
    "lastName": "García",
    "grade": "3ro Básica",
    "section": "A",
    "dateOfBirth": "2016-03-15",
    "parentName": "Ana García",
    "parentEmail": "ana.garcia@test.com",
    "parentPhone": "+593991111111",
    "homeLatitude": -0.1650,
    "homeLongitude": -78.4850,
    "homeAddress": "Av. La Prensa N45-123, Quito"
  }'
```

**Student 2 (Central area):**
```bash
npx convex run students:create \
  --args '{
    "userId": "<admin_user_id>",
    "firstName": "Juan",
    "lastName": "Pérez",
    "grade": "4to Básica",
    "section": "B",
    "dateOfBirth": "2015-07-22",
    "parentName": "Pedro Pérez",
    "parentEmail": "pedro.perez@test.com",
    "parentPhone": "+593992222222",
    "homeLatitude": -0.1720,
    "homeLongitude": -78.4780,
    "homeAddress": "Calle República E7-123, Quito"
  }'
```

**Student 3 (Eastern area):**
```bash
npx convex run students:create \
  --args '{
    "userId": "<admin_user_id>",
    "firstName": "Sofia",
    "lastName": "López",
    "grade": "3ro Básica",
    "section": "A",
    "dateOfBirth": "2016-01-10",
    "parentName": "Carmen López",
    "parentEmail": "carmen.lopez@test.com",
    "parentPhone": "+593993333333",
    "homeLatitude": -0.1780,
    "homeLongitude": -78.4600,
    "homeAddress": "Av. 6 de Diciembre N34-567, Quito"
  }'
```

**Student 4 (Southern area):**
```bash
npx convex run students:create \
  --args '{
    "userId": "<admin_user_id>",
    "firstName": "Diego",
    "lastName": "Rodríguez",
    "grade": "5to Básica",
    "section": "A",
    "dateOfBirth": "2014-11-05",
    "parentName": "Luis Rodríguez",
    "parentEmail": "luis.rodriguez@test.com",
    "parentPhone": "+593994444444",
    "homeLatitude": -0.1900,
    "homeLongitude": -78.4750,
    "homeAddress": "Av. Patria E4-123, Quito"
  }'
```

**Student 5 (Western area):**
```bash
npx convex run students:create \
  --args '{
    "userId": "<admin_user_id>",
    "firstName": "Valentina",
    "lastName": "Martínez",
    "grade": "3ro Básica",
    "section": "B",
    "dateOfBirth": "2016-05-20",
    "parentName": "Rosa Martínez",
    "parentEmail": "rosa.martinez@test.com",
    "parentPhone": "+593995555555",
    "homeLatitude": -0.1750,
    "homeLongitude": -78.4950,
    "homeAddress": "Av. América N35-123, Quito"
  }'
```

3. Verify all students have locations

**Expected:**
- 5 students created
- All have homeLatitude and homeLongitude
- All appear in students list

**Report format:**
```
Test 2.4: [PASS/FAIL]
- Students created: [count]/5
- All have locations: [YES/NO]
- Student IDs:
  - María García: [<id>]
  - Juan Pérez: [<id>]
  - Sofia López: [<id>]
  - Diego Rodríguez: [<id>]
  - Valentina Martínez: [<id>]
- Error if any: [description]
```

---

### Test 2.5: Verify Students Appear in Location Map

**Steps:**
1. Go to Students page in Admin app
2. Check if there's a map view showing student locations
3. If no map view, query students to verify locations:
```bash
npx convex run students:list --args '{"userId": "<admin_user_id>"}'
```

**Expected:**
- Students have homeLatitude and homeLongitude populated
- If map exists, markers show at each student's location

**Report format:**
```
Test 2.5: [PASS/FAIL]
- Students have locations in DB: [YES/NO]
- Map view available: [YES/NO/N/A]
```

---

## Phase 3: Verify Route Creation Prerequisites

### Test 3.1: Check Route Wizard Dependencies

Before creating a route, verify all dependencies exist:

**Steps:**
1. Query the database to verify:
```bash
# Check institution has school location
npx convex run institutions:get --args '{"userId": "<admin_user_id>", "institutionId": "<institution_id>"}'

# Check at least one vehicle exists
npx convex run vehicles:list --args '{"userId": "<admin_user_id>"}'

# Check at least one driver exists
npx convex run drivers:list --args '{"userId": "<admin_user_id>"}'

# Check students with locations exist
npx convex run students:list --args '{"userId": "<admin_user_id>"}'
```

**Expected:**
- Institution has schoolLatitude and schoolLongitude
- At least 1 vehicle exists
- At least 1 driver exists
- At least 3 students with homeLatitude/homeLongitude

**Report format:**
```
Test 3.1: [PASS/FAIL]
- School location set: [YES/NO]
- Vehicles available: [count]
- Drivers available: [count]
- Students with locations: [count]
- Ready for route creation: [YES/NO]
```

---

## Phase 4: Route Visualization Tests

### Test 4.1: Admin - Route Detail with Polyline

**Steps:**
1. Login to Admin app as admin user
2. Go to Routes page (`/routes`)
3. Click on a route that was created with the wizard (should have `optimizedPolyline`)
4. Check the map displays a realistic road-following polyline (not straight lines)

**Expected:**
- Map shows smooth, road-following route line
- Legend shows "Ruta optimizada"
- Markers display at each stop

**Report format:**
```
Test 4.1: [PASS/FAIL]
- Polyline visible: [YES/NO]
- Follows roads: [YES/NO]
- Error if any: [description]
```

---

### Test 4.2: Admin - Route Detail with Legacy Route (No Polyline)

**Steps:**
1. Click on an older route (created before wizard, no `optimizedPolyline`)
2. Check the map displays a simple straight-line polyline between stops

**Expected:**
- Map shows straight lines connecting stops
- No errors in console

**Report format:**
```
Test 4.2: [PASS/FAIL]
- Fallback polyline visible: [YES/NO]
- Console errors: [YES/NO]
```

---

### Test 4.3: Create New Route with Wizard

**Steps:**
1. Go to `/routes/new`
2. **Step 1 - Planning:**
   - Select route type (pickup/dropoff)
   - Set target time (arrival/departure)
   - Select vehicle, driver, optionally monitor
   - Enter route name
   - Click "Siguiente"

3. **Step 2 - Stop Assignment:**
   - Select students from "Disponibles" tab
   - Verify they appear in "Seleccionados" tab
   - Click "Calcular Ruta Óptima"
   - Verify polyline appears on map
   - Verify ETAs are calculated for each stop
   - Click "Siguiente"

4. **Step 3 - Confirmation:**
   - Select recurrence (daily/weekly/monthly/one-time)
   - Verify summary is correct
   - Click "Crear Ruta"

**Expected:**
- Wizard navigates through all steps
- Route optimization calculates successfully
- Route is saved to database
- Redirects to route list or detail page

**Report format:**
```
Test 4.3: [PASS/FAIL]
- Step 1 completed: [YES/NO]
- Step 2 - students selectable: [YES/NO]
- Step 2 - route optimized: [YES/NO]
- Step 2 - polyline shown: [YES/NO]
- Step 3 completed: [YES/NO]
- Route saved: [YES/NO]
- Error if any: [description]
```

---

## Phase 5: Lazy Trip Creation Tests

### Test 5.1: List Routes for Driver Today

**Steps:**
1. Login to Crew app as a driver
2. Go to Dashboard (`/dashboard`)
3. Check if routes scheduled for today are displayed

**Expected:**
- Routes assigned to this driver appear
- Each route shows: name, type, scheduled time, vehicle, student count
- Routes not scheduled for today (based on recurrence) should NOT appear

**Report format:**
```
Test 5.1: [PASS/FAIL]
- Routes displayed: [YES/NO]
- Route info visible: [YES/NO]
- Recurrence filtering works: [YES/NO]
```

---

### Test 5.2: Start Trip from Route (Lazy Creation)

**Steps:**
1. From Crew dashboard, find a route with "canStart: true"
2. Click "Iniciar Viaje" button
3. Allow location permission if prompted
4. Verify trip is created and started

**Note:** If the crew app doesn't have a Start button yet, test via Convex dashboard:
```
npx convex run trips:startTripFromRoute \
  --args '{"userId": "<user_id>", "routeId": "<route_id>", "latitude": -0.18, "longitude": -78.46}'
```

**Expected:**
- Trip is created in database with status "in_progress"
- tripStudents are generated
- GPS tracking entry is created
- Returns tripId

**Report format:**
```
Test 5.2: [PASS/FAIL]
- Trip created: [YES/NO]
- Trip status: [in_progress/other]
- tripStudents generated: [YES/NO]
- GPS entry created: [YES/NO]
- Error if any: [description]
```

---

### Test 5.3: Start Trip - Already Completed Today

**Steps:**
1. Complete the trip from Test 5.2
2. Try to start another trip for the same route today

**Expected:**
- Error: "Ya se completó un viaje para esta ruta hoy"

**Report format:**
```
Test 5.3: [PASS/FAIL]
- Error shown: [YES/NO]
- Error message correct: [YES/NO]
```

---

### Test 5.4: Route Not Scheduled for Today

**Steps:**
1. Create a route with recurrence `weekly` for a different day
2. Try to start a trip for that route today

**Expected:**
- Error: "Esta ruta no está programada para hoy"

**Report format:**
```
Test 5.4: [PASS/FAIL]
- Error shown: [YES/NO]
- Error message correct: [YES/NO]
```

---

## Phase 6: Student Exclusion Days Tests

### Test 6.1: Update Exclude Days

**Steps:**
1. Find a studentRoute assignment ID (from Convex dashboard)
2. Run mutation:
```
npx convex run studentRoutes:updateExcludeDays \
  --args '{"userId": "<admin_user_id>", "assignmentId": "<assignment_id>", "excludeDays": ["friday", "saturday"]}'
```
3. Query the assignment to verify excludeDays saved

**Expected:**
- Mutation returns `{ success: true }`
- excludeDays field contains ["friday", "saturday"]

**Report format:**
```
Test 6.1: [PASS/FAIL]
- Mutation succeeded: [YES/NO]
- excludeDays saved: [YES/NO]
```

---

### Test 6.2: Exclude Days Applied to Trip

**Steps:**
1. Have a student with excludeDays including today's day name
2. Start a trip for that route
3. Check tripStudents - the excluded student should NOT be in the list

**Expected:**
- Student with today in excludeDays is NOT in tripStudents

**Report format:**
```
Test 6.2: [PASS/FAIL]
- Excluded student missing from trip: [YES/NO]
- Other students present: [YES/NO]
```

---

### Test 6.3: Invalid Day Name Rejected

**Steps:**
1. Try to update excludeDays with invalid day:
```
npx convex run studentRoutes:updateExcludeDays \
  --args '{"userId": "<admin_id>", "assignmentId": "<id>", "excludeDays": ["invalidday"]}'
```

**Expected:**
- Error: "Día inválido: invalidday"

**Report format:**
```
Test 6.3: [PASS/FAIL]
- Error shown: [YES/NO]
- Error message correct: [YES/NO]
```

---

## Phase 7: Parent Pickup Without Approval Tests

### Test 7.1: Create Parent Pickup Novedad

**Steps:**
1. Login to Parent app as a parent
2. Go to novedades/create or use mutation:
```
npx convex run novedades:create \
  --args '{
    "userId": "<parent_user_id>",
    "studentId": "<student_id>",
    "type": "parent_pickup",
    "affectedRouteType": "pickup",
    "date": "2024-12-18",
    "reason": "Lo recojo en casa"
  }'
```
3. Check the created novedad

**Expected:**
- Novedad created with status "acknowledged" (NOT "pending")
- acknowledgedAt and acknowledgedBy are set
- Returns `{ success: true, novedadId: "...", status: "acknowledged" }`

**Report format:**
```
Test 7.1: [PASS/FAIL]
- Novedad created: [YES/NO]
- Status is "acknowledged": [YES/NO]
- acknowledgedAt set: [YES/NO]
- acknowledgedBy set: [YES/NO]
```

---

### Test 7.2: Parent Pickup Notification to Crew

**Steps:**
1. After creating parent_pickup novedad (Test 7.1)
2. Check notifications for the route's driver
3. Verify notification has warning type and urgent message

**Expected:**
- Notification created for driver
- Title contains "PADRE RECOGE"
- Message mentions "NO ABORDARÁ"
- Type is "warning"

**Report format:**
```
Test 7.2: [PASS/FAIL]
- Driver notified: [YES/NO]
- Title correct: [YES/NO]
- Message urgent: [YES/NO]
- Type is warning: [YES/NO]
```

---

### Test 7.3: Regular Novedad Still Pending

**Steps:**
1. Create an absence novedad:
```
npx convex run novedades:create \
  --args '{
    "userId": "<parent_user_id>",
    "studentId": "<student_id>",
    "type": "absence",
    "affectedRouteType": "both",
    "date": "2024-12-19",
    "reason": "Cita médica"
  }'
```
2. Check the created novedad

**Expected:**
- Novedad created with status "pending" (NOT "acknowledged")
- acknowledgedAt and acknowledgedBy are NOT set

**Report format:**
```
Test 7.3: [PASS/FAIL]
- Novedad created: [YES/NO]
- Status is "pending": [YES/NO]
- acknowledgedAt NOT set: [YES/NO]
```

---

### Test 7.4: Parent Pickup Applied to Trip

**Steps:**
1. Have a parent_pickup novedad for a student for today
2. Start a trip for that route
3. Check tripStudents for that student

**Expected:**
- Student's tripStudent entry has status "parent_pickup"
- novedadId is linked

**Report format:**
```
Test 7.4: [PASS/FAIL]
- Student in tripStudents: [YES/NO]
- Status is "parent_pickup": [YES/NO]
- novedadId linked: [YES/NO]
```

---

## Phase 8: Crew Profile Tests

### Test 8.1: Profile Page Shows Real Data

**Steps:**
1. Login to Crew app as a driver with completed profile
2. Go to Profile page (`/profile`)
3. Verify real data is displayed (not mock)

**Expected:**
- Name and email from user account displayed
- Phone number from driver profile displayed
- License info displayed (number, type, expiry)
- Emergency contact displayed
- No "Perfil incompleto" warning (if profile is complete)

**Report format:**
```
Test 8.1: [PASS/FAIL]
- Profile page loads: [YES/NO]
- Real user data shown: [YES/NO]
- License info shown: [YES/NO]
- Emergency contact shown: [YES/NO]
```

---

### Test 8.2: Profile Page - Incomplete Warning

**Steps:**
1. Login to Crew app as a new driver (without completed profile)
2. Go to Profile page (`/profile`)
3. Verify warning is shown

**Expected:**
- Yellow "Perfil incompleto" warning at top
- Link to edit page works
- Edit button (pencil icon) in header

**Report format:**
```
Test 8.2: [PASS/FAIL]
- Warning displayed: [YES/NO]
- "Completar perfil" link works: [YES/NO]
- Edit button navigates to /profile/edit: [YES/NO]
```

---

### Test 8.3: Profile Edit - Inline Save/Cancel

**Steps:**
1. Go to Profile Edit page (`/profile/edit`)
2. Click edit (pencil) on Contact section
3. Change phone number
4. Click "Cancelar" - verify changes reverted
5. Click edit again, change phone, click "Guardar"
6. Verify data persists

**Expected:**
- Cancel reverts changes
- Save persists changes
- No full page reload needed

**Report format:**
```
Test 8.3: [PASS/FAIL]
- Inline edit mode works: [YES/NO]
- Cancel reverts changes: [YES/NO]
- Save persists data: [YES/NO]
- Data shows after refresh: [YES/NO]
```

---

### Test 8.4: Monitor Profile - Certificates

**Steps:**
1. Login to Crew app as a monitor
2. Go to Profile Edit page
3. Edit the Certificates section
4. Enable "Primeros auxilios" checkbox
5. Set expiry date
6. Enable "Cuidado infantil" checkbox
7. Save

**Expected:**
- Checkboxes toggle correctly
- Expiry date field appears when first aid is checked
- Data saves correctly
- Profile page shows ✓ for enabled certificates

**Report format:**
```
Test 8.4: [PASS/FAIL]
- Certificate checkboxes work: [YES/NO]
- Expiry date conditional display: [YES/NO]
- Data saved: [YES/NO]
- Profile shows ✓ marks: [YES/NO]
```

---

## Visual Tests (Maps)

### Test V.1: Parent App - Live Tracking Map with Polyline

**Steps:**
1. Login to Parent app
2. Start a trip for one of your children's routes
3. Go to tracking page
4. Verify route polyline displays

**Expected:**
- Map loads
- Route polyline shows (either encoded or stop-based)
- Vehicle marker visible (if trip in progress)

**Report format:**
```
Test V.1: [PASS/FAIL]
- Map loads: [YES/NO]
- Polyline visible: [YES/NO]
- Vehicle marker visible: [YES/NO]
```

---

### Test V.2: Crew App - Route Map with Polyline

**Steps:**
1. Login to Crew app
2. Navigate to an active trip map view
3. Verify route polyline displays

**Expected:**
- Leaflet map loads
- Route polyline shows
- Stop markers visible

**Report format:**
```
Test V.2: [PASS/FAIL]
- Map loads: [YES/NO]
- Polyline visible: [YES/NO]
- Stop markers visible: [YES/NO]
```

---

## Summary Checklist

### Phase 1: Environment Setup
| Test | Status | Notes |
|------|--------|-------|
| 1.1 Start Dev Servers | | |
| 1.2 Login to Admin | | |

### Phase 2: Create Test Data
| Test | Status | Notes |
|------|--------|-------|
| 2.1 School Location | | |
| 2.2 Create Vehicle | | |
| 2.3 Invite Driver | | |
| 2.3b Driver Profile Completion | | |
| 2.3c Invite Monitor (Optional) | | |
| 2.4 Create Students (5) | | |
| 2.5 Verify Student Locations | | |

### Phase 3: Verify Prerequisites
| Test | Status | Notes |
|------|--------|-------|
| 3.1 Route Wizard Dependencies | | |

### Phase 4: Route Visualization
| Test | Status | Notes |
|------|--------|-------|
| 4.1 Admin Route Polyline | | |
| 4.2 Admin Legacy Route | | |
| 4.3 Route Wizard | | |

### Phase 5: Lazy Trip Creation
| Test | Status | Notes |
|------|--------|-------|
| 5.1 List Routes for Driver | | |
| 5.2 Start Trip from Route | | |
| 5.3 Already Completed Today | | |
| 5.4 Route Not Scheduled | | |

### Phase 6: Exclusion Days
| Test | Status | Notes |
|------|--------|-------|
| 6.1 Update Exclude Days | | |
| 6.2 Exclude Days Applied | | |
| 6.3 Invalid Day Rejected | | |

### Phase 7: Parent Pickup
| Test | Status | Notes |
|------|--------|-------|
| 7.1 Parent Pickup Status | | |
| 7.2 Parent Pickup Notification | | |
| 7.3 Regular Novedad Pending | | |
| 7.4 Parent Pickup in Trip | | |

### Phase 8: Crew Profile
| Test | Status | Notes |
|------|--------|-------|
| 8.1 Profile Shows Real Data | | |
| 8.2 Incomplete Warning | | |
| 8.3 Inline Save/Cancel | | |
| 8.4 Monitor Certificates | | |

### Visual Tests
| Test | Status | Notes |
|------|--------|-------|
| V.1 Parent Live Tracking | | |
| V.2 Crew Route Map | | |

---

## How to Report Errors

For each failed test, please provide:
1. Test number
2. Step where it failed
3. Expected behavior
4. Actual behavior
5. Console errors (if any)
6. Screenshot (if visual)

Example:
```
Test 4.3 FAILED at Step 2
Expected: Route optimization calculates and shows polyline
Actual: Error "Google Maps API key not configured"
Console: TypeError: Cannot read property 'routes' of undefined
```
