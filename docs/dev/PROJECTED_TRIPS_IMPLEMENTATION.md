# Projected Trips Implementation Guide

**Status:** Admin App Complete | Crew & Parent Apps Pending
**Date:** December 2024

---

## Overview

The Projected Trips system provides a **virtual view** of future trips without creating actual trip records in the database. It calculates which routes will run on specific dates based on route recurrence patterns, then enriches this data with:

- Vehicle and driver assignments
- Student counts (respecting excludeDays)
- Novedades (schedule exceptions) per trip/date

This approach avoids cluttering the database with thousands of projected trip records while still allowing comprehensive trip planning and visualization.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Backend (Convex)                        │
│                                                                 │
│  convex/projectedTrips.ts                                       │
│  ├── listProjectedTrips()        → Full trip list for date range│
│  ├── getProjectedTripsCountByDay() → Count per day (month view) │
│  └── getActiveAndUpcomingTrips() → Dashboard widget (N hours)   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      Frontend (React Hooks)                     │
│                                                                 │
│  apps/*/src/hooks/useProjectedTrips.ts                          │
│  ├── useProjectedTrips()         → Calendar views with filters  │
│  ├── useProjectedTripsCount()    → Month view badges            │
│  └── useActiveAndUpcomingTrips() → Dashboard widget             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Backend Queries

### 1. `listProjectedTrips`

**Purpose:** Returns projected trips for a date range with optional filters.

**Args:**
```typescript
{
  userId: Id<"users">,
  institutionId: Id<"institutions">,
  startDate: string,      // "YYYY-MM-DD"
  endDate: string,        // "YYYY-MM-DD"
  vehicleId?: Id<"vehicles">,
  driverId?: Id<"drivers">,
  studentSearch?: string  // Filters by student name
}
```

**Returns:** Array of `ProjectedTrip`:
```typescript
{
  date: string,
  scheduledTime: string,
  routeId: Id<"routes">,
  routeName: string,
  routeType: "pickup" | "dropoff",
  vehicleId: Id<"vehicles">,
  vehiclePlate: string,
  driverId: Id<"drivers">,
  driverName: string,
  monitorId?: Id<"monitors">,
  monitorName?: string,
  status: "projected" | "scheduled" | "in_progress" | "completed" | "cancelled",
  tripId?: Id<"trips">,  // Only if actual trip exists
  totalStudents: number,
  novedades: { total: number, pending: number, approved: number }
}
```

### 2. `getProjectedTripsCountByDay`

**Purpose:** Returns trip counts per day for a month (for calendar badges).

**Args:**
```typescript
{
  userId: Id<"users">,
  institutionId: Id<"institutions">,
  year: number,
  month: number  // 1-12
}
```

**Returns:**
```typescript
Record<string, { total: number, active: number, completed: number }>
// Key is "YYYY-MM-DD"
```

### 3. `getActiveAndUpcomingTrips`

**Purpose:** Returns active trips + upcoming trips within N hours.

**Args:**
```typescript
{
  userId: Id<"users">,
  institutionId: Id<"institutions">,
  hoursAhead?: number  // Default: 6
}
```

**Returns:** Array with additional `type` field:
```typescript
{
  type: "active" | "upcoming",
  date: string,
  scheduledTime: string,
  routeId: Id<"routes">,
  routeName: string,
  routeType: "pickup" | "dropoff",
  vehiclePlate: string,
  driverName: string,
  status: string,
  tripId?: Id<"trips">,
  totalStudents: number
}
```

---

## Admin App Implementation

### Components Created

| Component | Location | Purpose |
|-----------|----------|---------|
| `TripCalendarTabs` | `components/trips/` | Day/Week/Month tab switcher |
| `TripDayView` | `components/trips/` | Timeline view with navigation |
| `TripWeekView` | `components/trips/` | 7-day grid view |
| `TripMonthView` | `components/trips/` | Calendar with badges |
| `TripFilters` | `components/trips/` | Vehicle, driver, student filters |
| `ProjectedTripCard` | `components/trips/` | Trip card/row component |
| `UpcomingTripsCard` | `components/modules/dashboard/` | Dashboard widget |

### Pages Modified

| Page | Changes |
|------|---------|
| `/trips` | Full calendar view with Day/Week/Month tabs and filters |
| `/dashboard` | Added "Viajes Activos y Próximos" section |

### Key Features

1. **Day View:** Timeline with date navigation, "Ir a Hoy" button
2. **Week View:** 7-day grid, click trip to see details
3. **Month View:** Calendar with badges, click day → switch to Day view
4. **Filters:** Vehicle dropdown, driver dropdown, student search
5. **Dashboard Widget:** Active trips + next 6 hours

---

## Pending: Crew App Implementation

### Recommended Features

| Feature | Priority | Description |
|---------|----------|-------------|
| **Dashboard Widget** | High | Show driver's active + next 2-3 trips |
| **My Trips Calendar** | Medium | Day view of driver's assigned routes |
| **Trip Detail** | High | View projected trip before starting |

### Key Differences from Admin

1. **Filter by Driver:** Only show trips assigned to current driver
2. **Simpler Views:** Day view only (no week/month needed)
3. **Action Focused:** "Iniciar Viaje" button on projected trips
4. **Student List:** Show students for upcoming trip with novedades

### Suggested New Queries

```typescript
// Get driver's projected trips for today and tomorrow
getDriverProjectedTrips(args: {
  userId: Id<"users">,
  driverId: Id<"drivers">,
  daysAhead?: number  // Default: 2
})
```

### UI Components Needed

| Component | Description |
|-----------|-------------|
| `DriverTripCard` | Trip card optimized for driver view |
| `DriverTripsWidget` | Dashboard widget for crew home |
| `DriverDayView` | Simplified day timeline |

---

## Pending: Parent App Implementation

### Recommended Features

| Feature | Priority | Description |
|---------|----------|-------------|
| **Dashboard Widget** | High | Show child's next pickup/dropoff |
| **Trip Calendar** | Medium | View child's scheduled trips |
| **Novedades Integration** | High | Show approved novedades on calendar |

### Key Differences from Admin

1. **Filter by Student:** Only show trips for parent's children
2. **Read-Only:** No filters, just view schedule
3. **Novedad Focused:** Highlight days with active novedades
4. **Simple Navigation:** Today + week ahead

### Suggested New Queries

```typescript
// Get student's projected trips for date range
getStudentProjectedTrips(args: {
  userId: Id<"users">,
  studentId: Id<"students">,
  startDate: string,
  endDate: string
})

// Get all children's upcoming trips (for dashboard)
getMyChildrenUpcomingTrips(args: {
  userId: Id<"users">,
  hoursAhead?: number  // Default: 12
})
```

### UI Components Needed

| Component | Description |
|-----------|-------------|
| `ChildTripCard` | Trip card showing child's pickup/dropoff |
| `ParentTripsWidget` | Dashboard widget for parent home |
| `ParentWeekView` | Simple week view for child's schedule |
| `NovedadIndicator` | Visual indicator for novedad days |

---

## Helper Functions (Reusable)

Located in `convex/projectedTrips.ts`:

```typescript
// Check if route runs on specific date based on recurrence
routeRunsOnDate(recurrence, dateStr): boolean

// Generate array of date strings
generateDateRange(startDate, endDate, maxDays): string[]

// Check if novedad applies to date and route type
novedadAppliesToDate(novedad, dateStr, routeType): boolean

// Get day name from date (monday, tuesday, etc.)
getDayName(date): string
```

---

## Status Indicators

| Status | Color | Description |
|--------|-------|-------------|
| `projected` | Gray | Virtual trip (no record exists) |
| `scheduled` | Yellow | Trip record created, not started |
| `in_progress` | Blue | Trip currently active |
| `completed` | Green | Trip finished |
| `cancelled` | Red | Trip was cancelled |

---

## Data Flow Example

```
1. User opens /trips page (Admin)
   │
2. useProjectedTrips({ startDate, endDate }) called
   │
3. Backend: listProjectedTrips query
   │
   ├─ Fetch active routes for institution
   ├─ Generate date range
   ├─ For each route + date:
   │   ├─ Check recurrence (routeRunsOnDate)
   │   ├─ Check for existing trip
   │   ├─ Count active students
   │   ├─ Count novedades
   │   └─ Build projected trip object
   │
4. Return sorted array of projected trips
   │
5. UI renders TripDayView / TripWeekView / TripMonthView
```

---

## Next Steps

### Phase 1: Crew App
1. Create `getDriverProjectedTrips` query
2. Create `useDriverProjectedTrips` hook
3. Build `DriverTripsWidget` for dashboard
4. Build `DriverDayView` for /trips page
5. Add "Iniciar Viaje" action on projected trips

### Phase 2: Parent App
1. Create `getStudentProjectedTrips` query
2. Create `getMyChildrenUpcomingTrips` query
3. Create `useParentProjectedTrips` hook
4. Build `ParentTripsWidget` for dashboard
5. Build `ParentWeekView` for schedule page
6. Integrate novedad indicators

---

## Files Reference

```
convex/
└── projectedTrips.ts           # Backend queries

apps/admin/src/
├── hooks/
│   ├── useProjectedTrips.ts    # Admin hooks
│   └── index.ts                # Exports
├── components/
│   ├── trips/
│   │   ├── index.ts
│   │   ├── TripCalendarTabs.tsx
│   │   ├── TripDayView.tsx
│   │   ├── TripWeekView.tsx
│   │   ├── TripMonthView.tsx
│   │   ├── TripFilters.tsx
│   │   └── ProjectedTripCard.tsx
│   └── modules/dashboard/
│       └── UpcomingTripsCard.tsx
└── app/(dashboard)/
    ├── trips/page.tsx
    └── dashboard/page.tsx
```
