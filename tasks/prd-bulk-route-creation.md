# PRD: Rutas - Creación Masiva (Onboarding)

## Introduction

A 6-step wizard for bulk route creation during institution onboarding. When an institution has already loaded students, vehicles, and drivers, coordinators can generate multiple optimized routes intelligently. The system uses Google Maps Directions API for real routing and time estimates, clusters students by proximity, and allows manual adjustments before saving.

## Goals

- Enable coordinators to create multiple routes in a single flow (vs. one-by-one)
- Automatically cluster students by geographic proximity
- Optimize route order using Google Maps Directions API
- Support both pickup (home→school) and dropoff (school→home) route types
- Handle institutions of any scale (20-500+ students, 2-50+ routes)
- Create shared stops when students are within 100m of each other
- Balance load equitably across selected vehicles

## User Stories

### Phase 1: Foundation & Step 1 (Basic Information)

#### US-001: Create bulk route wizard page structure ✅
**Description:** As a developer, I need the page structure and navigation for the 6-step bulk route creation wizard.

**Acceptance Criteria:**
- [x] Create page at `/admin/routes/bulk-create/page.tsx`
- [x] Create `BulkRouteWizard` component with step state management (steps 1-6)
- [x] Create step indicator component showing current step and progress
- [x] Add "Siguiente" (next) and "Atrás" (back) navigation buttons
- [x] Add link to wizard from routes list page (button "Creación Masiva")
- [x] Typecheck passes

#### US-002: Step 1 - Route type and schedule selection ✅
**Description:** As a coordinator, I need to define the basic parameters for the routes I'm creating.

**Acceptance Criteria:**
- [x] Radio buttons for route type: "Recogida (casa→colegio)" or "Entrega (colegio→casa)"
- [x] Time picker for target time (arrival time for pickup, departure time for dropoff)
- [x] Radio buttons for operation days: "Diario" or "Días específicos"
- [x] Checkbox group for days of week (when "Días específicos" selected)
- [x] Form validation: type and time are required
- [x] Store selections in wizard state
- [x] Typecheck passes

#### US-003: Step 1 - Fleet and student summary display ✅
**Description:** As a coordinator, I need to see a summary of available resources before proceeding.

**Acceptance Criteria:**
- [x] Query and display count of active vehicles with valid documents
- [x] Query and display count of active drivers with valid licenses
- [x] Query and display count of active monitors
- [x] Query and display count of students without route assignment for selected type
- [x] Show summary cards: "X vehículos", "Y conductores", "Z monitores", "W estudiantes sin ruta"
- [x] Disable "Siguiente" if no students without routes available
- [x] Typecheck passes

---

### Phase 2: Step 2 (Student Selection)

#### US-004: Step 2 - Split view layout with map ✅
**Description:** As a coordinator, I need a split view with map on left and student panel on right.

**Acceptance Criteria:**
- [x] Create `Step2StudentSelection` component with 50/50 split layout
- [x] Left side: Google Map showing school marker
- [x] Right side: Panel with route summary header and student list below
- [x] Route summary shows: type, target time, operation days from Step 1
- [x] Counter showing "X de Y estudiantes seleccionados"
- [x] Responsive: stack vertically on mobile
- [x] Typecheck passes

#### US-005: Step 2 - Student list with pagination
**Description:** As a coordinator, I need to see available students in a paginated list.

**Acceptance Criteria:**
- [ ] Query students without route assignment for selected type
- [ ] Display 20 students per page with pagination controls
- [ ] Each student row shows: name, grade, abbreviated address, GPS indicator icon
- [ ] GPS indicator: green checkmark if home coordinates exist, red X if missing
- [ ] Default filter: only show students with GPS coordinates (toggle to show all)
- [ ] Loading state while fetching students
- [ ] Typecheck passes

#### US-006: Step 2 - Student filters and search
**Description:** As a coordinator, I need to filter and search students to find specific groups.

**Acceptance Criteria:**
- [ ] Search input filtering by student name (debounced, 300ms)
- [ ] Dropdown filter by grade/year (from institution's grades)
- [ ] Dropdown filter by parent/guardian (useful for siblings)
- [ ] Toggle filter "Solo con ubicación GPS" (default: on)
- [ ] Filters are combinable (AND logic)
- [ ] Reset filters button
- [ ] Pagination resets to page 1 when filters change
- [ ] Typecheck passes

#### US-007: Step 2 - Student selection functionality
**Description:** As a coordinator, I need to select students for route assignment.

**Acceptance Criteria:**
- [ ] Checkbox on each student row for individual selection
- [ ] "Seleccionar página" button selects all students on current page
- [ ] "Seleccionar todos" button selects all filtered students (all pages)
- [ ] "Limpiar selección" button deselects all
- [ ] Selected students have highlighted background in list
- [ ] Selection count updates in real-time
- [ ] Selected student IDs stored in wizard state
- [ ] Typecheck passes

#### US-008: Step 2 - Map visualization of selected students
**Description:** As a coordinator, I need to see selected students appear on the map.

**Acceptance Criteria:**
- [ ] School marker always visible on map (use institution coordinates)
- [ ] When student selected, marker appears at their home coordinates
- [ ] When student deselected, marker disappears
- [ ] All student markers same color (blue) in this step
- [ ] Click marker to show student name in info window
- [ ] Map auto-fits bounds to show all selected markers + school
- [ ] Map supports zoom and pan
- [ ] Typecheck passes

#### US-009: Step 2 - Selection validation and confirmation
**Description:** As a coordinator, I need to validate and confirm my student selection.

**Acceptance Criteria:**
- [ ] Warning banner if any selected students lack GPS coordinates
- [ ] Display total selected count before "Confirmar Estudiantes" button
- [ ] "Confirmar Estudiantes" button disabled if no students selected
- [ ] "Atrás" button returns to Step 1 (preserves Step 1 data)
- [ ] "Confirmar Estudiantes" proceeds to Step 3
- [ ] Typecheck passes

---

### Phase 3: Step 3 (Vehicle Selection & Route Calculation)

#### US-010: Step 3 - Layout and student summary
**Description:** As a coordinator, I need to see the context of selected students and choose vehicles.

**Acceptance Criteria:**
- [ ] Create `Step3VehicleCalculation` component
- [ ] Header showing "X estudiantes seleccionados para asignar a rutas"
- [ ] Two sections: Vehicle Selection (top) and Calculation Parameters (bottom)
- [ ] "Calcular Rutas" button at bottom (disabled until vehicles selected)
- [ ] Typecheck passes

#### US-011: Step 3 - Vehicle selection list
**Description:** As a coordinator, I need to select which vehicles will be used for the routes.

**Acceptance Criteria:**
- [ ] List of active vehicles with valid documents
- [ ] Each vehicle shows: plate, brand/model, passenger capacity, status badge
- [ ] Checkbox for each vehicle to include in route calculation
- [ ] Running total: "Capacidad seleccionada: X / Y estudiantes"
- [ ] Warning banner (yellow) if total capacity < selected students
- [ ] Success indicator (green) if capacity >= students
- [ ] Typecheck passes

#### US-012: Step 3 - Advanced calculation parameters
**Description:** As a coordinator, I need optional parameters to tune route calculation.

**Acceptance Criteria:**
- [ ] Collapsible "Parámetros Avanzados" section (collapsed by default)
- [ ] Number input: "Radio de agrupación para paradas compartidas" (default: 100m)
- [ ] Number input: "Tiempo máximo de ruta" (default: 60 minutes)
- [ ] Radio buttons: "Priorizar: Menos paradas / Menor distancia total"
- [ ] Store parameters in wizard state
- [ ] Typecheck passes

#### US-013: Step 3 - Route calculation algorithm
**Description:** As a system, I need to calculate optimized routes from selected students and vehicles.

**Acceptance Criteria:**
- [ ] Create `calculateBulkRoutes` function in convex (or client-side service)
- [ ] Input: student locations, vehicle capacities, school location, parameters
- [ ] Cluster students by geographic proximity (k-means or DBSCAN approach)
- [ ] Number of clusters based on vehicle count and capacity constraints
- [ ] For students within grouping radius, create shared stop using first student's location
- [ ] Balance student count across vehicles (within capacity limits)
- [ ] Return: array of route objects with assigned students and stop groups
- [ ] Typecheck passes

#### US-014: Step 3 - Google Maps route optimization per route
**Description:** As a system, I need to optimize stop order for each generated route.

**Acceptance Criteria:**
- [ ] For each calculated route, call Google Directions API with waypoint optimization
- [ ] Origin: school (for dropoff) or first stop (for pickup)
- [ ] Destination: school (for pickup) or last stop (for dropoff)
- [ ] Waypoints: all stops with optimize:true
- [ ] Store optimized order, polyline, duration, distance per route
- [ ] Handle API errors gracefully (fallback to nearest-neighbor order)
- [ ] Typecheck passes

#### US-015: Step 3 - Calculation progress and results
**Description:** As a coordinator, I need feedback during calculation and clear results.

**Acceptance Criteria:**
- [ ] "Calcular Rutas" shows loading spinner during calculation
- [ ] Progress indication: "Calculando rutas... (puede tomar unos segundos)"
- [ ] On success: store generated routes in wizard state, proceed to Step 4
- [ ] On error (insufficient capacity): show error message with count of unassigned students
- [ ] On error (API failure): show retry button with error details
- [ ] Typecheck passes

---

### Phase 4: Step 4 (Review Generated Routes)

#### US-016: Step 4 - Split view with route list
**Description:** As a coordinator, I need to see all generated routes with map visualization.

**Acceptance Criteria:**
- [ ] Create `Step4ReviewRoutes` component with split layout
- [ ] Left: Google Map
- [ ] Right: Summary header + scrollable route cards list
- [ ] Summary: "X rutas generadas, Y estudiantes asignados, Z sin asignar"
- [ ] If unassigned students > 0, show warning with count
- [ ] Typecheck passes

#### US-017: Step 4 - Route cards display
**Description:** As a coordinator, I need to see route details in card format.

**Acceptance Criteria:**
- [ ] Each route displayed as a card with: suggested name (auto-generated), assigned vehicle, stop count, student count, estimated time, estimated distance
- [ ] Checkbox on each card to toggle map visibility
- [ ] "Ver Detalle" button on each card
- [ ] "Seleccionar todas" / "Deseleccionar todas" buttons for map toggle
- [ ] Auto-generate route names: "Ruta [Type] [Number]" (e.g., "Ruta Recogida 1")
- [ ] Typecheck passes

#### US-018: Step 4 - Multi-route map visualization
**Description:** As a coordinator, I need to see selected routes on the map with distinct colors.

**Acceptance Criteria:**
- [ ] Each selected route displays with unique color (from predefined palette)
- [ ] Route polyline drawn on map
- [ ] Stop markers shown with route's color
- [ ] Stop markers show order number
- [ ] School marker always visible
- [ ] Click stop marker to see assigned students in info window
- [ ] Click polyline to see route name
- [ ] Map auto-fits to show all selected routes
- [ ] Typecheck passes

#### US-019: Step 4 - Route detail modal/panel
**Description:** As a coordinator, I need to view and edit individual route details.

**Acceptance Criteria:**
- [ ] "Ver Detalle" opens modal or slide-over panel
- [ ] Shows route on dedicated map view with full polyline
- [ ] Lists stops in order with students assigned to each
- [ ] Editable route name field
- [ ] Vehicle selector dropdown (from selected vehicles)
- [ ] "Guardar Cambios" and "Descartar" buttons
- [ ] Typecheck passes

#### US-020: Step 4 - Stop reordering in route detail
**Description:** As a coordinator, I need to manually adjust stop order.

**Acceptance Criteria:**
- [ ] Drag-and-drop to reorder stops in the list
- [ ] Map polyline updates in real-time when order changes
- [ ] Time and distance recalculated after reorder (call Directions API)
- [ ] Loading state during recalculation
- [ ] Typecheck passes

#### US-021: Step 4 - Modify stops and student assignments
**Description:** As a coordinator, I need to add/remove stops and reassign students.

**Acceptance Criteria:**
- [ ] "Eliminar parada" button on each stop (students become unassigned)
- [ ] "Agregar estudiante" to existing stop (from unassigned list)
- [ ] "Nueva parada" button to create stop with unassigned students
- [ ] When creating new stop, use selected student's location
- [ ] Update route stats after modifications
- [ ] Typecheck passes

#### US-022: Step 4 - Unassigned students panel
**Description:** As a coordinator, I need to see and handle unassigned students.

**Acceptance Criteria:**
- [ ] Collapsible panel showing unassigned students (if any)
- [ ] Shows student name and home address
- [ ] "Asignar" button next to each student opens route/stop selector
- [ ] After assignment, student moves out of unassigned list
- [ ] Count updates in summary header
- [ ] Typecheck passes

#### US-023: Step 4 - Route validation warnings
**Description:** As a coordinator, I need warnings about potential issues before confirming.

**Acceptance Criteria:**
- [ ] Warning if any route exceeds max time parameter (yellow banner)
- [ ] Warning if any route has only 1 student (inefficient, yellow banner)
- [ ] Warning if unassigned students remain (yellow banner)
- [ ] "Confirmar Rutas" button proceeds to Step 5
- [ ] "Atrás" button returns to Step 3 (discards generated routes)
- [ ] Typecheck passes

---

### Phase 5: Step 5 (Crew Assignment)

#### US-024: Step 5 - Driver assignment interface
**Description:** As a coordinator, I need to assign drivers to each confirmed route.

**Acceptance Criteria:**
- [ ] Create `Step5CrewAssignment` component
- [ ] List of confirmed routes with driver dropdown on each
- [ ] Driver dropdown shows: name, license status, vehicle compatibility
- [ ] Warning icon if driver already assigned to another route at same time
- [ ] Warning banner if any route has no driver assigned
- [ ] Typecheck passes

#### US-025: Step 5 - Monitor assignment interface
**Description:** As a coordinator, I need to optionally assign monitors to routes.

**Acceptance Criteria:**
- [ ] Monitor dropdown on each route (optional, can be "Sin monitor")
- [ ] Monitor dropdown shows: name, active status
- [ ] Warning icon if monitor already assigned to another route at same time
- [ ] No validation error if routes lack monitors (optional)
- [ ] Typecheck passes

#### US-026: Step 5 - Pre-confirmation summary
**Description:** As a coordinator, I need a complete summary before final creation.

**Acceptance Criteria:**
- [ ] Summary section showing:
  - Cantidad de rutas a crear
  - Total de estudiantes asignados
  - Total de paradas
  - Vehículos utilizados
  - Conductores asignados
  - Monitores asignados (o "N/A")
  - Estudiantes sin asignar (if any, with warning)
- [ ] "Siguiente" proceeds to Step 6 (only if all routes have drivers)
- [ ] Typecheck passes

---

### Phase 6: Step 6 (Confirmation & Save)

#### US-027: Step 6 - Final review display
**Description:** As a coordinator, I need to see everything before creating the routes.

**Acceptance Criteria:**
- [ ] Create `Step6Confirmation` component
- [ ] Display all routes in compact card format
- [ ] Each card shows: name, vehicle, driver, monitor, stops, students
- [ ] Recurrence reminder: "Días de operación: [days]"
- [ ] "Crear Rutas" button prominently displayed
- [ ] "Atrás" returns to Step 5
- [ ] Typecheck passes

#### US-028: Step 6 - Bulk route creation mutation
**Description:** As a system, I need to save all routes and their associations in one transaction.

**Acceptance Criteria:**
- [ ] Create `createBulkRoutes` mutation in convex
- [ ] Input: array of route data with stops and student assignments
- [ ] For each route: call existing `createRouteWithStops` logic
- [ ] Set recurrence based on wizard configuration
- [ ] Return: { success, routesCreated, studentsAssigned, errors[] }
- [ ] Handle partial failures gracefully (report which routes failed)
- [ ] Typecheck passes

#### US-029: Step 6 - Save progress and success feedback
**Description:** As a coordinator, I need feedback during and after saving.

**Acceptance Criteria:**
- [ ] "Crear Rutas" shows progress indicator during save
- [ ] Progress text: "Creando rutas... X de Y"
- [ ] On success: show success message with count of routes created
- [ ] On success: show buttons "Ver Rutas" (go to list) and "Crear Más Rutas" (restart wizard)
- [ ] On partial failure: show warning with failed routes, option to retry or proceed
- [ ] Typecheck passes

#### US-030: Step 6 - Trip generation integration
**Description:** As a system, I need to generate initial trips for the created routes.

**Acceptance Criteria:**
- [ ] After routes created successfully, optionally generate trips for next 7 days
- [ ] Use existing trip generation logic from `trips.ts`
- [ ] Apply any existing novedades for those dates
- [ ] Show count of trips generated in success message
- [ ] Handle trip generation errors separately from route creation
- [ ] Typecheck passes

---

## Functional Requirements

- FR-1: Wizard must guide coordinator through 6 sequential steps with back/next navigation
- FR-2: System must query students without route assignment for the selected route type
- FR-3: System must use Google Maps Directions API for route optimization with `optimize:true`
- FR-4: System must create shared stops for students within the configured radius (default 100m)
- FR-5: System must balance students across vehicles while respecting capacity limits
- FR-6: System must support both pickup and dropoff route types with appropriate origin/destination
- FR-7: System must allow manual adjustments (reorder stops, reassign students) before saving
- FR-8: System must validate driver/monitor availability (warn on conflicts)
- FR-9: System must use existing `createRouteWithStops` mutation pattern for data consistency
- FR-10: System must support recurrence configuration (daily or specific days of week)

## Non-Goals (Out of Scope)

- Real-time collaborative editing (single coordinator session only)
- Draft saving / resume later functionality
- Import from external files (CSV, Excel)
- Automatic driver assignment based on preferences
- Integration with external fleet management systems
- Route simulation with traffic predictions
- Cost estimation per route
- Parent notification of new route assignments

## Technical Considerations

### Existing Components to Reuse
- `InteractiveMap` and `GoogleRouteMap` from `packages/maps`
- `RouteOptimizer` service for Directions API calls
- `createRouteWithStops` mutation for consistent route creation
- Student and vehicle query hooks from admin app

### New Components Required
- `BulkRouteWizard` - Main wizard container with step state
- `Step1BasicInfo`, `Step2StudentSelection`, `Step3VehicleCalculation`, `Step4ReviewRoutes`, `Step5CrewAssignment`, `Step6Confirmation` - Step components
- `RouteClusteringService` - Algorithm for grouping students into routes
- `BulkRouteMapView` - Multi-route visualization with color coding

### API Considerations
- Google Directions API has rate limits; batch optimization requests appropriately
- For large student sets (500+), consider chunking clustering algorithm
- Polylines should be stored for display without re-calling API

### Database Transactions
- Use existing `createRouteWithStops` which handles route + stops + studentRoutes atomically
- `createBulkRoutes` should create routes sequentially to handle partial failures

## Success Metrics

- Coordinator can create 10+ routes in under 10 minutes (vs. 5+ minutes per route manually)
- 95% of students with GPS coordinates are successfully assigned to routes
- Route optimization reduces total distance by 15%+ compared to naive ordering
- Zero data consistency issues (all studentRoutes properly linked)

## Open Questions

1. Should we auto-generate route names or require coordinator input?
   - **Decision:** Auto-generate with pattern "Ruta [Type] [Number]", editable in Step 4

2. What happens if API key is missing or quota exceeded during calculation?
   - **Decision:** Fallback to nearest-neighbor algorithm, warn coordinator that routes may not be optimal

3. Should trip generation be automatic or optional after route creation?
   - **Decision:** Optional prompt after success - "¿Generar viajes para los próximos 7 días?"
