# Real-Time ETA Calculation System

## Overview

Altaviapp implements a distance-based real-time ETA calculation system that updates automatically as the vehicle moves. ETAs are recalculated every 15 seconds when GPS updates are received, providing accurate arrival estimates for all stops.

## Architecture

### Calculation Engine

**File**: `convex/lib/eta.ts`

Core utilities for ETA calculation:

| Function | Purpose |
|----------|---------|
| `haversineDistance()` | Calculate distance between two GPS coordinates |
| `getEffectiveSpeed()` | Weighted average of GPS speed and calculated trip speed |
| `calculateTripAverageSpeed()` | Average speed based on trip progress |
| `calculateStopETAs()` | Calculate ETA for all remaining stops |
| `getDelayStatus()` | Compare ETA to scheduled time for delay detection |

### Formula

```
ETA (minutes) = distance_to_stop (km) / effective_speed (km/h) * 60
```

Where:
- **distance_to_stop**: Haversine distance from current GPS position to stop coordinates
- **effective_speed**: 70% GPS speed + 30% trip average speed (default: 25 km/h for urban)

### Delay Status

| Status | Condition | Color |
|--------|-----------|-------|
| `on_time` | ETA ≤ scheduled time | Green |
| `slight_delay` | 1-5 minutes late | Yellow |
| `delayed` | 5-15 minutes late | Orange |
| `very_delayed` | >15 minutes late | Red |

## Data Flow

```
GPS Update (every 15s)
    ↓
gpsTracking table updated
    ↓
Convex live query triggers
    ↓
getTrip() / getActiveTripForStudent() recalculates ETAs
    ↓
UI components auto-update via subscription
```

## Backend Queries

### `getTrip` (Admin/Crew)

Returns trip details with ETA for each stop:

```typescript
{
  stops: [{
    // ... stop fields
    etaMinutes: number | null,     // Minutes until arrival
    etaTime: string | null,        // "HH:mm" format
    distanceKm: number | null,     // Distance from vehicle
    isCompleted: boolean,          // Based on check-ins
    isNext: boolean,               // Next stop to visit
    delayStatus: {
      isDelayed: boolean,
      delayMinutes: number,
      status: 'on_time' | 'slight_delay' | 'delayed' | 'very_delayed'
    } | null
  }],
  nextStop: {
    // First non-completed stop with all ETA data
  } | null,
  stats: {
    currentSpeed: number | null,   // GPS speed in km/h
  }
}
```

### `getActiveTripForStudent` (Parent)

Returns tracking data for a specific student:

```typescript
{
  etaMinutes: number | null,       // ETA to student's stop
  etaTime: string | null,          // Arrival time
  distanceKm: number | null,       // Distance to student's stop
  delayStatus: {...} | null,       // Delay information
  currentSpeed: number | null,     // Vehicle speed
  studentStop: {
    etaMinutes: number | null,
    etaTime: string | null,
    distanceKm: number | null,
    delayStatus: {...} | null
  }
}
```

## Frontend Integration

### Admin App
**File**: `apps/admin/src/app/(dashboard)/trips/[id]/page.tsx`

- Displays ETA card for next stop
- Shows all stops with color-coded delay status
- Visual indicators: pulsing blue for next stop, green checkmark for completed

### Parent App
**Files**:
- `apps/parent/src/hooks/useMyStudents.ts` - Exposes ETA data from tracking
- `apps/parent/src/components/home/ChildTripCard.tsx` - ETA badge with delay colors
- `apps/parent/src/components/home/ActiveTripView.tsx` - Detailed stop ETA display

### Crew App
**File**: `apps/crew/src/app/(dashboard)/trips/[id]/active/page.tsx`

- NextStopCard shows real-time ETA to next stop
- Distance and arrival time displayed
- Updates automatically via Convex subscription

## Configuration

### Speed Defaults

| Parameter | Value | Use Case |
|-----------|-------|----------|
| Default Speed | 25 km/h | Urban areas with stops |
| GPS Weight | 70% | Real-time speed priority |
| Average Weight | 30% | Smoothing factor |
| Minimum Speed | 5 km/h | Avoid unrealistic ETAs |

### Update Frequency

| Event | Frequency |
|-------|-----------|
| GPS Updates | Every 15 seconds |
| ETA Recalculation | On every GPS update |
| UI Refresh | Automatic (Convex subscription) |

## Future Enhancements

### Google Maps Calibration (Planned)

Periodic calibration with Google Maps Directions API:

1. Call Directions API every 5 minutes during active trip
2. Get traffic-aware travel times
3. Calculate calibration factor
4. Apply factor to distance-based estimates

This would improve accuracy in traffic conditions.

## Testing

To test ETA calculations:

1. Start a trip in the Crew app
2. Enable GPS tracking (location permissions required)
3. Monitor the Admin dashboard - ETAs should update every 15 seconds
4. Check Parent app for student-specific ETA
5. Verify delay status colors match expected delays

## Troubleshooting

| Issue | Cause | Solution |
|-------|-------|----------|
| ETA shows "Calculando..." | No GPS data yet | Wait for first GPS update |
| ETA not updating | GPS updates stopped | Check device location services |
| Unrealistic ETAs | Speed calculation issue | System uses 25 km/h default |
| Wrong delay colors | Scheduled time mismatch | Verify stop scheduled times |
