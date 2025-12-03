# Technical Specification - Altaviapp

**School Transport Management Platform**
**How to Build** - Architecture, Patterns, and Implementation Guide
**Version**: 1.0
**Date**: January 2025

---

## Overview

This document defines **HOW to build** Altaviapp, providing technical implementation patterns, architecture decisions, and code examples. This complements [docs/PRD.md](docs/PRD.md) (WHAT to build) and [docs/database/DATABASE_SCHEMA.md](docs/database/DATABASE_SCHEMA.md) (DATA structure).

**Technology Philosophy**:
- **Unified PWA**: All frontends are Next.js 14+ PWA (Admin, Parent, Crew)
- **Serverless-First**: Convex for database and real-time
- **Type-Safe**: TypeScript strict mode throughout
- **Offline-Capable**: PWA with service workers for all apps
- **Real-Time**: Live queries for GPS tracking and notifications
- **Monorepo**: Turborepo for shared components and utilities

---

## Technology Stack

### Complete Stack Overview

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Database** | Convex | Latest | Real-time serverless database |
| **Backend Functions** | Convex | Latest | Serverless queries/mutations |
| **Authentication** | Custom Token-Based | Latest | User management, session tokens, RBAC |
| **Admin App** | Next.js 14+ | 14.x | PWA Admin Dashboard |
| **Parent App** | Next.js 14+ | 14.x | PWA Parent Portal |
| **Crew App** | Next.js 14+ | 14.x | PWA for drivers/monitors |
| **Language** | TypeScript | 5.x | Type safety (strict mode) |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS |
| **UI Components** | shadcn/ui | Latest | Accessible component library |
| **Maps** | Google Maps API | Latest | Maps, Directions, Geocoding, Places |
| **Maps React** | @react-google-maps/api | 2.x | React bindings for Google Maps |
| **QR Codes** | qrcode | 1.5.x | Student QR generation |
| **Validation** | Zod | 3.x | Schema validation |
| **Forms** | React Hook Form | Latest | Form state management |
| **Notifications** | WhatsApp Business API | Latest | Parent notifications |
| **Build Tool** | Turborepo | Latest | Monorepo management |
| **Package Manager** | pnpm | 8.x | Fast, disk-efficient package manager |
| **Deployment** | Vercel | Latest | All PWA hosting |

---

## Unified PWA Architecture

### Monorepo Structure

All frontends are Next.js 14+ PWA applications organized in a Turborepo monorepo:

```
/altaviapp-platform/
├── apps/
│   ├── admin/          # Admin Dashboard PWA
│   │   ├── app/        # Next.js App Router
│   │   ├── components/ # Admin-specific components
│   │   └── public/     # PWA manifest, icons
│   ├── parent/         # Parent Portal PWA
│   │   ├── app/        # Next.js App Router
│   │   ├── components/ # Parent-specific components
│   │   └── public/     # PWA manifest, icons
│   └── crew/           # Crew App PWA (Base de desarrollo)
│       ├── app/        # Next.js App Router
│       ├── components/ # Crew-specific components
│       └── public/     # PWA manifest, icons
├── packages/
│   ├── ui/             # Shared UI components (shadcn/ui)
│   ├── auth/           # Shared auth utilities
│   ├── maps/           # Google Maps components
│   ├── pwa/            # Shared PWA utilities
│   └── convex-client/  # Convex hooks and types
├── convex/             # Backend (shared)
└── turbo.json          # Turborepo configuration
```

### App Characteristics

| App | Target Users | Primary Device | Key Features |
|-----|--------------|----------------|--------------|
| **Admin** | super_admin, admin | Desktop/Tablet | Fleet management, routes, reports, user management |
| **Parent** | parent | Mobile | Real-time tracking, notifications, student info |
| **Crew** | driver, monitor | Mobile | GPS tracking, QR scanning, check-ins, offline mode |

### PWA Features by App

**All Apps:**
- ✅ Installable (Add to Home Screen)
- ✅ Service Worker for caching
- ✅ Responsive design
- ✅ Push notifications
- ✅ TypeScript strict mode

**Admin App (Desktop-first):**
- ✅ Full dashboard experience
- ✅ Data tables and charts
- ✅ Route planning with Google Maps
- ✅ Bulk operations (CSV import)
- ✅ Reports and analytics

**Parent App (Mobile-first):**
- ✅ Real-time GPS tracking
- ✅ Push notifications for arrivals
- ✅ Student information
- ✅ Trip history
- ✅ Basic offline (cached data)

**Crew App (Offline-first):**
- ✅ Offline data sync (IndexedDB)
- ✅ Background sync for check-ins
- ✅ GPS tracking (every 15s)
- ✅ QR code scanner (camera)
- ✅ Geofencing alerts

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────────┐
│                         USERS                                 │
│              (Schools in Ecuador - Spanish)                   │
└───────────────┬──────────────┬───────────────┬───────────────┘
                │              │               │
                ↓              ↓               ↓
┌───────────────────┐  ┌───────────────┐  ┌──────────────────┐
│   ADMIN PWA       │  │  PARENT PWA   │  │    CREW PWA      │
│   Next.js 14+     │  │  Next.js 14+  │  │    Next.js 14+   │
│                   │  │               │  │                  │
│  - Fleet Mgmt     │  │  - Tracking   │  │  - GPS Track     │
│  - Routes         │  │  - Alerts     │  │  - QR Scan       │
│  - Reports        │  │  - Students   │  │  - Offline       │
│  - Users          │  │  - History    │  │  - Check-ins     │
│  Desktop-first    │  │  Mobile-first │  │  Offline-first   │
└─────────┬─────────┘  └───────┬───────┘  └────────┬─────────┘
          │                    │                    │
          └────────────────────┼────────────────────┘
                               │
            ┌──────────────────┴───────────────────┐
            │                                      │
            ↓                                      ↓
┌───────────────────────┐            ┌────────────────────────┐
│   GOOGLE MAPS API     │            │      CONVEX            │
│                       │            │                        │
│  - Maps JavaScript    │            │  - Real-time DB        │
│  - Directions API     │            │  - Live Queries        │
│  - Geocoding API      │            │  - Mutations           │
│  - Distance Matrix    │            │  - HTTP Actions (API)  │
│  - Places API         │            │  - File Storage        │
│  - Roads API          │            │                        │
└───────────────────────┘            └───────────┬────────────┘
                                                 │
                                     ┌───────────┴───────────┐
                                     │                       │
                                     ↓                       ↓
                          ┌─────────────────┐    ┌──────────────────┐
                          │  CUSTOM AUTH    │    │   EXTERNAL       │
                          │                 │    │                  │
                          │  - bcrypt       │    │  - WhatsApp API  │
                          │  - Sessions     │    │  - Email (SMTP)  │
                          │  - RBAC         │    │  - Push (FCM)    │
                          │  - Invitations  │    │                  │
                          └─────────────────┘    └──────────────────┘
```

---

## API Design Patterns

### REST API Structure

**Base URL**: `https://altaviapp.com/api/v1`

**Standard Response Format**:
```typescript
// lib/api/response.ts
export type ApiResponse<T> = {
  success: true
  data: T
  meta: {
    timestamp: string
  }
} | {
  success: false
  error: {
    code: string
    message: string
    details?: unknown
  }
  meta: {
    timestamp: string
  }
}

export function successResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    meta: { timestamp: new Date().toISOString() }
  }
}

export function errorResponse(
  code: string,
  message: string,
  details?: unknown
): ApiResponse<never> {
  return {
    success: false,
    error: { code, message, details },
    meta: { timestamp: new Date().toISOString() }
  }
}
```

**Usage Example**:
```typescript
// app/api/v1/vehicles/route.ts
import { NextResponse } from 'next/server'
import { successResponse, errorResponse } from '@/lib/api/response'

export async function GET(request: Request) {
  try {
    const vehicles = await convex.query(api.vehicles.list, {
      institutionId: getCurrentInstitutionId()
    })

    return NextResponse.json(successResponse(vehicles))
  } catch (error) {
    return NextResponse.json(
      errorResponse('FETCH_ERROR', 'Failed to fetch vehicles'),
      { status: 500 }
    )
  }
}
```

### Error Handling

**Standard Error Classes**:
```typescript
// lib/api/errors.ts
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'ApiError'
  }
}

export class BadRequestError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(400, 'BAD_REQUEST', message, details)
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = 'No autorizado') {
    super(401, 'UNAUTHORIZED', message)
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = 'Acceso denegado') {
    super(403, 'FORBIDDEN', message)
  }
}

export class NotFoundError extends ApiError {
  constructor(resource: string) {
    super(404, 'NOT_FOUND', `${resource} no encontrado`)
  }
}

export class ValidationError extends ApiError {
  constructor(message: string, details?: unknown) {
    super(422, 'VALIDATION_ERROR', message, details)
  }
}
```

---

## Authentication & Authorization

### Custom Token-Based Authentication

**Authentication Flow**:
1. User registers/logs in via REST API endpoints
2. Server validates credentials and generates session token
3. Token stored in localStorage (all PWA apps)
4. Token sent with each API request for authentication

**REST Endpoints** (Convex):
```typescript
// convex/http.ts - Authentication endpoints
http.route({
  path: '/auth/register',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const { email, password, name } = await request.json()
    // Password hashing, user creation, token generation
    return new Response(JSON.stringify({ success: true, token, user }))
  })
})

http.route({
  path: '/auth/login',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    const { email, password } = await request.json()
    // Validate credentials, generate token
    return new Response(JSON.stringify({ success: true, token, user }))
  })
})

http.route({
  path: '/auth/me',
  method: 'GET',
  handler: httpAction(async (ctx, request) => {
    const token = request.headers.get('Authorization')?.replace('Bearer ', '')
    // Validate token, return user
    return new Response(JSON.stringify({ success: true, user }))
  })
})
```

**Session Management**:
- Token format: Base64 encoded `{userId}_{timestamp}_{random}`
- Token expiration: 30 days
- Storage: localStorage (all PWA apps)
- Validation: On every API request via token lookup

### Role-Based Access Control (RBAC)

**Role Hierarchy**:
```typescript
// lib/rbac.ts
export const ROLES = {
  SUPER_ADMIN: { name: 'super_admin', level: 1000 },
  ADMIN: { name: 'admin', level: 500 },
  DRIVER: { name: 'driver', level: 100 },
  PARENT: { name: 'parent', level: 10 }
} as const

export type Role = keyof typeof ROLES

export function hasPermission(userLevel: number, requiredLevel: number): boolean {
  return userLevel >= requiredLevel
}

export function canAccessInstitution(
  user: { role: string; institutionId?: string },
  targetInstitutionId: string
): boolean {
  // Super admin can access all institutions
  if (user.role === 'super_admin') return true

  // Others can only access their own institution
  return user.institutionId === targetInstitutionId
}
```

**Convex Helper**:
```typescript
// convex/auth.ts
import { mutation, query } from './_generated/server'

export async function getCurrentUser(ctx: any) {
  // For HTTP endpoints, token is passed via header
  // For Convex queries/mutations, use ctx metadata
  const userId = ctx.auth?.userId
  if (!userId) throw new Error('Not authenticated')

  const user = await ctx.db.get(userId)
  if (!user) throw new Error('User not found')

  return user
}

export async function requireRole(ctx: any, allowedRoles: string[]) {
  const user = await getCurrentUser(ctx)

  if (!allowedRoles.includes(user.role)) {
    throw new Error('Insufficient permissions')
  }

  return user
}

export async function requireInstitutionAccess(
  ctx: any,
  institutionId: string
) {
  const user = await getCurrentUser(ctx)

  if (user.role !== 'super_admin' && user.institutionId !== institutionId) {
    throw new Error('Access denied to this institution')
  }

  return user
}
```

---

## Real-Time Patterns (Convex)

### Live Queries (GPS Tracking)

**Convex Query**:
```typescript
// convex/tracking.ts
import { query } from './_generated/server'
import { v } from 'convex/values'

export const getLiveLocation = query({
  args: { tripId: v.id('trips') },
  handler: async (ctx, args) => {
    // Get latest GPS point
    const latestPoint = await ctx.db
      .query('gpsTracking')
      .withIndex('by_trip', q => q.eq('tripId', args.tripId))
      .order('desc')
      .first()

    if (!latestPoint) return null

    // Get trip details
    const trip = await ctx.db.get(args.tripId)

    return {
      ...latestPoint,
      trip,
      lastUpdate: Date.now()
    }
  }
})
```

**React Component (Next.js)**:
```typescript
'use client'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'

export function LiveTracker({ tripId }: { tripId: string }) {
  // Auto-updates when GPS data changes!
  const location = useQuery(api.tracking.getLiveLocation, { tripId })

  if (location === undefined) return <div>Cargando ubicación...</div>
  if (!location) return <div>Sin datos GPS</div>

  return (
    <div className="space-y-2">
      <div>Latitud: {location.latitude}</div>
      <div>Longitud: {location.longitude}</div>
      <div>Velocidad: {location.speed || 0} km/h</div>
      <div className="text-xs text-gray-500">
        Actualizado: {new Date(location.lastUpdate).toLocaleTimeString('es-EC')}
      </div>
    </div>
  )
}
```

### Mutations (GPS Updates)

```typescript
// convex/tracking.ts
import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const updateLocation = mutation({
  args: {
    tripId: v.id('trips'),
    latitude: v.number(),
    longitude: v.number(),
    speed: v.optional(v.number()),
    timestamp: v.number()
  },
  handler: async (ctx, args) => {
    // Verify user is the driver for this trip
    const user = await getCurrentUser(ctx)
    const trip = await ctx.db.get(args.tripId)

    if (trip?.driverId !== user._id && user.role !== 'super_admin') {
      throw new Error('Only the assigned driver can update GPS')
    }

    // Insert GPS point
    const gpsId = await ctx.db.insert('gpsTracking', {
      tripId: args.tripId,
      latitude: args.latitude,
      longitude: args.longitude,
      speed: args.speed,
      timestamp: args.timestamp,
      serverTimestamp: Date.now()
    })

    // Check geofencing (proximity to stops)
    await checkGeofencing(ctx, trip, args.latitude, args.longitude)

    return gpsId
  }
})
```

---

## Offline-First PWA (Driver App)

### Service Worker Setup

```typescript
// public/sw.js
const CACHE_NAME = 'altaviapp-driver-v1'
const OFFLINE_URLS = [
  '/driver',
  '/driver/route',
  '/driver/checklist',
  '/offline.html'
]

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(OFFLINE_URLS))
  )
})

// Cache-first for static assets
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image' ||
      event.request.destination === 'script' ||
      event.request.destination === 'style') {
    event.respondWith(
      caches.match(event.request)
        .then(response => response || fetch(event.request))
    )
  }

  // Network-first for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline.html'))
    )
  }
})

// Background sync for check-ins
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-checkins') {
    event.waitUntil(syncPendingCheckins())
  }
})
```

### IndexedDB for Offline Data

```typescript
// lib/offline-storage.ts
class OfflineStorage {
  private db: IDBDatabase | null = null

  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('AltaviappDB', 1)

      request.onerror = () => reject(request.error)
      request.onsuccess = () => {
        this.db = request.result
        resolve()
      }

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result

        // Create stores
        if (!db.objectStoreNames.contains('routes')) {
          db.createObjectStore('routes', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('students')) {
          db.createObjectStore('students', { keyPath: 'id' })
        }
        if (!db.objectStoreNames.contains('pendingCheckins')) {
          db.createObjectStore('pendingCheckins', {
            keyPath: 'id',
            autoIncrement: true
          })
        }
        if (!db.objectStoreNames.contains('pendingGPS')) {
          db.createObjectStore('pendingGPS', {
            keyPath: 'id',
            autoIncrement: true
          })
        }
      }
    })
  }

  async cacheRouteData(route: any, students: any[]) {
    const tx = this.db!.transaction(['routes', 'students'], 'readwrite')
    await tx.objectStore('routes').put(route)

    for (const student of students) {
      await tx.objectStore('students').put(student)
    }
  }

  async addPendingCheckin(checkin: any) {
    const tx = this.db!.transaction(['pendingCheckins'], 'readwrite')
    await tx.objectStore('pendingCheckins').add({
      ...checkin,
      timestamp: Date.now(),
      synced: false
    })

    // Register background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready
      await registration.sync.register('sync-checkins')
    }
  }

  async getPendingCheckins() {
    const tx = this.db!.transaction(['pendingCheckins'], 'readonly')
    return await tx.objectStore('pendingCheckins').getAll()
  }
}

export const offlineStorage = new OfflineStorage()
```

---

## GPS Tracking Implementation

### GPS Tracker Class

```typescript
// lib/gps-tracker.ts
class GPSTracker {
  private watchId: number | null = null
  private updateInterval = 15000 // 15 seconds

  startTracking(tripId: string) {
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed ? position.coords.speed * 3.6 : undefined, // m/s to km/h
          timestamp: Date.now(),
          accuracy: position.coords.accuracy
        }

        this.handleLocationUpdate(tripId, location)
      },
      (error) => {
        console.error('GPS Error:', error)
        // Show user-friendly error
        this.handleGPSError(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 5000
      }
    )
  }

  async handleLocationUpdate(tripId: string, location: any) {
    try {
      if (navigator.onLine) {
        // Send to Convex if online
        await convex.mutation(api.tracking.updateLocation, {
          tripId,
          ...location
        })
      } else {
        // Queue for later sync if offline
        await offlineStorage.addPendingGPS({
          tripId,
          ...location
        })
      }
    } catch (error) {
      console.error('Failed to update location:', error)
      // Fallback to offline queue
      await offlineStorage.addPendingGPS({
        tripId,
        ...location
      })
    }
  }

  stopTracking() {
    if (this.watchId !== null) {
      navigator.geolocation.clearWatch(this.watchId)
      this.watchId = null
    }
  }

  handleGPSError(error: GeolocationPositionError) {
    switch(error.code) {
      case error.PERMISSION_DENIED:
        alert('Por favor habilita los permisos de ubicación')
        break
      case error.POSITION_UNAVAILABLE:
        alert('Ubicación no disponible. Verifica tu señal GPS')
        break
      case error.TIMEOUT:
        alert('Tiempo de espera agotado. Intenta de nuevo')
        break
    }
  }
}

export const gpsTracker = new GPSTracker()
```

---

## Google Maps Integration

### API Services Configuration

**Required APIs** (enable in Google Cloud Console):
- Maps JavaScript API - Interactive maps
- Directions API - Route calculation
- Geocoding API - Address ↔ Coordinates
- Distance Matrix API - Distance/time calculations
- Places API - Address autocomplete
- Roads API - Snap to road for GPS traces

### Setup and Configuration

```typescript
// lib/google-maps.ts
import { Loader } from '@googlemaps/js-api-loader'

const loader = new Loader({
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  version: 'weekly',
  libraries: ['places', 'geometry', 'drawing']
})

export async function initGoogleMaps() {
  return await loader.load()
}

// packages/maps/src/config.ts
export const GOOGLE_MAPS_CONFIG = {
  apiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY!,
  defaultCenter: { lat: -0.1807, lng: -78.4678 }, // Quito, Ecuador
  defaultZoom: 12,
  language: 'es',
  region: 'EC'
}
```

### Map Component (React)

```tsx
// packages/maps/src/components/GoogleMap.tsx
'use client'
import { GoogleMap, useJsApiLoader, Marker, Polyline } from '@react-google-maps/api'
import { GOOGLE_MAPS_CONFIG } from '../config'

interface MapProps {
  center?: google.maps.LatLngLiteral
  markers?: Array<{ position: google.maps.LatLngLiteral; label?: string }>
  route?: google.maps.LatLngLiteral[]
  onMapClick?: (e: google.maps.MapMouseEvent) => void
}

export function Map({ center, markers = [], route, onMapClick }: MapProps) {
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: GOOGLE_MAPS_CONFIG.apiKey,
    libraries: ['places', 'geometry']
  })

  if (!isLoaded) return <div className="h-full animate-pulse bg-muted" />

  return (
    <GoogleMap
      mapContainerClassName="w-full h-full min-h-[400px]"
      center={center || GOOGLE_MAPS_CONFIG.defaultCenter}
      zoom={GOOGLE_MAPS_CONFIG.defaultZoom}
      onClick={onMapClick}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false
      }}
    >
      {markers.map((marker, idx) => (
        <Marker key={idx} position={marker.position} label={marker.label} />
      ))}

      {route && route.length > 1 && (
        <Polyline
          path={route}
          options={{
            strokeColor: '#4F46E5',
            strokeOpacity: 0.8,
            strokeWeight: 4
          }}
        />
      )}
    </GoogleMap>
  )
}
```

### Directions API (Route Calculation)

```typescript
// packages/maps/src/services/directions.ts
export async function calculateRoute(
  origin: google.maps.LatLngLiteral,
  destination: google.maps.LatLngLiteral,
  waypoints?: google.maps.LatLngLiteral[]
): Promise<google.maps.DirectionsResult> {
  const directionsService = new google.maps.DirectionsService()

  const result = await directionsService.route({
    origin,
    destination,
    waypoints: waypoints?.map(wp => ({ location: wp, stopover: true })),
    optimizeWaypoints: true,
    travelMode: google.maps.TravelMode.DRIVING,
    region: 'EC'
  })

  return result
}

// Usage in route planning
export async function optimizeStopOrder(
  origin: google.maps.LatLngLiteral,
  stops: Array<{ id: string; position: google.maps.LatLngLiteral }>
): Promise<string[]> {
  const result = await calculateRoute(
    origin,
    origin, // Return to origin
    stops.map(s => s.position)
  )

  // Returns optimized order of stop IDs
  const optimizedOrder = result.routes[0].waypoint_order
  return optimizedOrder.map(idx => stops[idx].id)
}
```

### Geocoding API (Address Resolution)

```typescript
// packages/maps/src/services/geocoding.ts
export async function geocodeAddress(
  address: string
): Promise<google.maps.LatLngLiteral | null> {
  const geocoder = new google.maps.Geocoder()

  try {
    const result = await geocoder.geocode({
      address,
      region: 'EC',
      componentRestrictions: { country: 'EC' }
    })

    if (result.results.length > 0) {
      const location = result.results[0].geometry.location
      return { lat: location.lat(), lng: location.lng() }
    }
    return null
  } catch (error) {
    console.error('Geocoding error:', error)
    return null
  }
}

export async function reverseGeocode(
  position: google.maps.LatLngLiteral
): Promise<string | null> {
  const geocoder = new google.maps.Geocoder()

  try {
    const result = await geocoder.geocode({ location: position })
    if (result.results.length > 0) {
      return result.results[0].formatted_address
    }
    return null
  } catch (error) {
    console.error('Reverse geocoding error:', error)
    return null
  }
}
```

### Distance Matrix API (ETA Calculations)

```typescript
// packages/maps/src/services/distance.ts
export interface DistanceResult {
  distance: { text: string; value: number } // value in meters
  duration: { text: string; value: number } // value in seconds
}

export async function getDistanceMatrix(
  origins: google.maps.LatLngLiteral[],
  destinations: google.maps.LatLngLiteral[]
): Promise<DistanceResult[][]> {
  const service = new google.maps.DistanceMatrixService()

  const result = await service.getDistanceMatrix({
    origins,
    destinations,
    travelMode: google.maps.TravelMode.DRIVING,
    unitSystem: google.maps.UnitSystem.METRIC,
    region: 'EC'
  })

  return result.rows.map(row =>
    row.elements.map(element => ({
      distance: element.distance,
      duration: element.duration
    }))
  )
}

// Calculate ETA to next stop
export async function calculateETA(
  currentPosition: google.maps.LatLngLiteral,
  nextStop: google.maps.LatLngLiteral
): Promise<{ minutes: number; distance: string }> {
  const matrix = await getDistanceMatrix([currentPosition], [nextStop])
  const result = matrix[0][0]

  return {
    minutes: Math.ceil(result.duration.value / 60),
    distance: result.distance.text
  }
}
```

### Places API (Address Autocomplete)

```tsx
// packages/maps/src/components/AddressAutocomplete.tsx
'use client'
import { useRef, useEffect, useState } from 'react'
import { Input } from '@/components/ui/input'

interface AddressAutocompleteProps {
  onPlaceSelect: (place: google.maps.places.PlaceResult) => void
  placeholder?: string
}

export function AddressAutocomplete({
  onPlaceSelect,
  placeholder = 'Ingresa una dirección...'
}: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null)

  useEffect(() => {
    if (!inputRef.current || autocomplete) return

    const ac = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'EC' },
      fields: ['formatted_address', 'geometry', 'name'],
      types: ['address']
    })

    ac.addListener('place_changed', () => {
      const place = ac.getPlace()
      if (place.geometry) {
        onPlaceSelect(place)
      }
    })

    setAutocomplete(ac)
  }, [onPlaceSelect, autocomplete])

  return (
    <Input
      ref={inputRef}
      type="text"
      placeholder={placeholder}
      className="w-full"
    />
  )
}
```

### Real-Time Vehicle Tracking Map

```tsx
// apps/parent/components/TrackingMap.tsx
'use client'
import { useQuery } from 'convex/react'
import { api } from '@/convex/_generated/api'
import { Map } from '@altaviapp/maps'
import { useEffect, useState } from 'react'

interface TrackingMapProps {
  tripId: string
  studentStopId: string
}

export function TrackingMap({ tripId, studentStopId }: TrackingMapProps) {
  const trip = useQuery(api.trips.getActiveTrip, { tripId })
  const [vehiclePosition, setVehiclePosition] = useState<google.maps.LatLngLiteral | null>(null)
  const [eta, setEta] = useState<string | null>(null)

  // Real-time vehicle position from Convex live query
  useEffect(() => {
    if (trip?.currentLocation) {
      setVehiclePosition({
        lat: trip.currentLocation.latitude,
        lng: trip.currentLocation.longitude
      })
    }
  }, [trip?.currentLocation])

  // Calculate ETA when position updates
  useEffect(() => {
    if (vehiclePosition && trip?.nextStop) {
      calculateETA(vehiclePosition, {
        lat: trip.nextStop.latitude,
        lng: trip.nextStop.longitude
      }).then(result => {
        setEta(`${result.minutes} min (${result.distance})`)
      })
    }
  }, [vehiclePosition, trip?.nextStop])

  const markers = []

  // Vehicle marker
  if (vehiclePosition) {
    markers.push({
      position: vehiclePosition,
      label: '🚌',
      icon: '/icons/bus-marker.png'
    })
  }

  // Student's stop marker
  if (trip?.stops) {
    const studentStop = trip.stops.find(s => s.id === studentStopId)
    if (studentStop) {
      markers.push({
        position: { lat: studentStop.latitude, lng: studentStop.longitude },
        label: '📍'
      })
    }
  }

  return (
    <div className="relative h-[400px] rounded-lg overflow-hidden">
      <Map
        center={vehiclePosition || undefined}
        markers={markers}
        route={trip?.routePath}
      />
      {eta && (
        <div className="absolute bottom-4 left-4 bg-white px-3 py-2 rounded-lg shadow-lg">
          <p className="text-sm font-medium">Llegada estimada: {eta}</p>
        </div>
      )}
    </div>
  )
}
```

### API Quotas and Best Practices

| API | Free Tier | Cost After | Optimization |
|-----|-----------|------------|--------------|
| Maps JavaScript | Unlimited loads | $7/1000 | Cache map instances |
| Directions | $5/1000 requests | $10/1000 | Cache common routes |
| Geocoding | $5/1000 requests | $5/1000 | Cache addresses |
| Distance Matrix | $5/1000 elements | $10/1000 | Batch requests |
| Places | $17/1000 requests | - | Limit autocomplete |

**Best Practices:**
- Enable billing with budget alerts
- Use Places Session Tokens for autocomplete
- Cache frequently accessed routes
- Batch Distance Matrix requests
- Use `fields` parameter to request only needed data

---

## QR Code System

### QR Generation

```typescript
// convex/students.ts
import QRCode from 'qrcode'
import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const generateQRCode = mutation({
  args: { studentId: v.id('students') },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId)
    if (!student) throw new Error('Estudiante no encontrado')

    // Create QR data with metadata
    const qrData = {
      studentId: args.studentId,
      institutionId: student.institutionId,
      timestamp: Date.now(),
      version: 1
    }

    const qrString = JSON.stringify(qrData)

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
      errorCorrectionLevel: 'H',
      type: 'image/png',
      width: 400,
      margin: 2
    })

    // Update student record
    await ctx.db.patch(args.studentId, {
      qrCode: qrString
    })

    return { qrCode: qrString, qrCodeDataUrl }
  }
})
```

### QR Scanning & Validation

```typescript
// lib/qr-scanner.ts
import { Html5QrcodeScanner } from 'html5-qrcode'

class QRScanner {
  private scanner: Html5QrcodeScanner | null = null

  async scan(elementId: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.scanner = new Html5QrcodeScanner(
        elementId,
        {
          fps: 10,
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0
        },
        false
      )

      this.scanner.render(
        (decodedText) => {
          this.scanner?.clear()
          resolve(decodedText)
        },
        (error) => {
          console.error('QR scan error:', error)
          // Continue scanning, don't reject
        }
      )
    })
  }

  async validateAndCheckin(qrCode: string, tripId: string) {
    // Parse QR data
    const qrData = JSON.parse(qrCode)

    // Validate with Convex
    const result = await convex.mutation(api.checkins.validateAndCheckin, {
      studentId: qrData.studentId,
      tripId,
      qrScanned: true,
      timestamp: Date.now()
    })

    return result
  }
}

export const qrScanner = new QRScanner()
```

---

## WhatsApp Integration

### Notification Function

```typescript
// convex/notifications.ts
import { internalMutation } from './_generated/server'
import { v } from 'convex/values'

export const sendWhatsAppPickup = internalMutation({
  args: {
    studentName: v.string(),
    parentPhone: v.string(),
    timestamp: v.number(),
    vehiclePlate: v.string()
  },
  handler: async (ctx, args) => {
    const message = `🚌 *Altaviapp - Confirmación de Recogida*

${args.studentName} subió al bus (${args.vehiclePlate}) a las ${new Date(args.timestamp).toLocaleTimeString('es-EC', { hour: '2-digit', minute: '2-digit' })}.

🔗 Rastrea en vivo: ${process.env.APP_URL}/track

_Mensaje automático - No responder_`

    // Send via WhatsApp Business API
    const response = await fetch(`${process.env.WHATSAPP_API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_API_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: args.parentPhone.replace('+', ''),
        type: 'text',
        text: { body: message }
      })
    })

    const result = await response.json()

    // Log communication
    await ctx.db.insert('communicationLogs', {
      userId: null,
      institutionId: null,
      channel: 'whatsapp',
      recipient: args.parentPhone,
      messageType: 'pickup_notification',
      content: message,
      status: response.ok ? 'sent' : 'failed',
      sentAt: Date.now(),
      externalMessageId: result.messages?.[0]?.id,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })

    return result
  }
})
```

---

## Multi-Tenancy Implementation

### Row-Level Security Pattern

**Every query MUST filter by institutionId**:

```typescript
// convex/vehicles.ts
import { query } from './_generated/server'
import { v } from 'convex/values'
import { getCurrentUser } from './lib/auth'

export const list = query({
  args: {},
  handler: async (ctx) => {
    const user = await getCurrentUser(ctx)

    // Super admin can see all vehicles
    if (user.role === 'super_admin') {
      return await ctx.db.query('vehicles').collect()
    }

    // Others can only see vehicles from their institution
    if (!user.institutionId) {
      throw new Error('User has no institution')
    }

    return await ctx.db
      .query('vehicles')
      .withIndex('by_institution', q => q.eq('institutionId', user.institutionId!))
      .collect()
  }
})
```

### Mutation Validation

```typescript
// convex/vehicles.ts
import { mutation } from './_generated/server'
import { v } from 'convex/values'

export const create = mutation({
  args: {
    licensePlate: v.string(),
    brand: v.string(),
    model: v.string(),
    capacity: v.number(),
    // ... other fields
  },
  handler: async (ctx, args) => {
    const user = await requireRole(ctx, ['admin', 'super_admin'])

    // Use user's institution (or allow super_admin to specify)
    const institutionId = user.role === 'super_admin'
      ? args.institutionId // Would need to add to args
      : user.institutionId

    if (!institutionId) {
      throw new Error('Institution ID required')
    }

    // Verify user has access to this institution
    await requireInstitutionAccess(ctx, institutionId)

    return await ctx.db.insert('vehicles', {
      ...args,
      institutionId,
      status: 'active',
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    })
  }
})
```

---

## Input Validation (Zod)

### Shared Schemas

```typescript
// lib/validations/common.ts
import { z } from 'zod'

export const phoneSchema = z.string()
  .regex(/^\+593\d{9}$/, 'Formato inválido. Debe ser +593XXXXXXXXX')

export const emailSchema = z.string()
  .email('Email inválido')

export const dateSchema = z.number()
  .positive('Fecha inválida')

export const latLngSchema = z.object({
  latitude: z.number().min(-90).max(90),
  longitude: z.number().min(-180).max(180)
})
```

```typescript
// lib/validations/student.ts
import { z } from 'zod'
import { phoneSchema, emailSchema } from './common'

export const createStudentSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  grade: z.string().min(1).max(20),
  dateOfBirth: z.number().positive(),
  parentName: z.string().min(1).max(100),
  parentPhone: phoneSchema,
  parentEmail: emailSchema,
  homeAddress: z.string().min(5).max(200),
  medicalInfo: z.object({
    allergies: z.array(z.string()).optional(),
    medications: z.array(z.string()).optional(),
    specialNeeds: z.string().optional(),
    bloodType: z.string().optional()
  }).optional()
})

export type CreateStudentInput = z.infer<typeof createStudentSchema>
```

### API Validation

```typescript
// app/api/v1/students/route.ts
import { NextResponse } from 'next/server'
import { createStudentSchema } from '@/lib/validations/student'
import { successResponse, errorResponse, ValidationError } from '@/lib/api/response'

export async function POST(request: Request) {
  try {
    const body = await request.json()

    // Validate input
    const result = createStudentSchema.safeParse(body)
    if (!result.success) {
      return NextResponse.json(
        errorResponse('VALIDATION_ERROR', 'Datos inválidos', result.error.flatten()),
        { status: 422 }
      )
    }

    // Create student via Convex
    const student = await convex.mutation(api.students.create, result.data)

    return NextResponse.json(successResponse(student), { status: 201 })
  } catch (error) {
    if (error instanceof ValidationError) {
      return NextResponse.json(
        errorResponse(error.code, error.message, error.details),
        { status: error.statusCode }
      )
    }

    return NextResponse.json(
      errorResponse('INTERNAL_ERROR', 'Error interno del servidor'),
      { status: 500 }
    )
  }
}
```

---

## Geofencing Implementation

```typescript
// lib/geofence.ts
class GeofenceManager {
  // Haversine formula for distance calculation
  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180

    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

    return R * c // Distance in meters
  }

  isWithinGeofence(
    currentLat: number,
    currentLon: number,
    stopLat: number,
    stopLon: number,
    radius: number
  ): boolean {
    const distance = this.calculateDistance(
      currentLat, currentLon,
      stopLat, stopLon
    )
    return distance <= radius
  }
}

export const geofence = new GeofenceManager()
```

```typescript
// convex/geofencing.ts
import { internalMutation } from './_generated/server'
import { v } from 'convex/values'

export const checkGeofencing = internalMutation({
  args: {
    tripId: v.id('trips'),
    latitude: v.number(),
    longitude: v.number()
  },
  handler: async (ctx, args) => {
    const trip = await ctx.db.get(args.tripId)
    if (!trip) return

    const stops = await ctx.db
      .query('routeStops')
      .withIndex('by_route', q => q.eq('routeId', trip.routeId))
      .collect()

    for (const stop of stops) {
      const distance = calculateDistance(
        args.latitude, args.longitude,
        stop.latitude, stop.longitude
      )

      if (distance <= stop.geofenceRadius) {
        // Entered geofence - notify driver
        await ctx.scheduler.runAfter(0, internal.notifications.sendStopArrival, {
          driverId: trip.driverId,
          stopName: stop.name,
          tripId: trip._id
        })
      }
    }
  }
})
```

---

## Performance Optimization

### Convex Query Optimization

```typescript
// Good: Use indexes
export const getVehiclesByInstitution = query({
  args: { institutionId: v.id('institutions') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('vehicles')
      .withIndex('by_institution', q => q.eq('institutionId', args.institutionId))
      .collect()
  }
})

// Bad: Filter without index (slow)
export const getActiveVehicles = query({
  args: { institutionId: v.id('institutions') },
  handler: async (ctx, args) => {
    const allVehicles = await ctx.db.query('vehicles').collect()
    return allVehicles.filter(v =>
      v.institutionId === args.institutionId && v.isActive
    )
  }
})
```

### GPS Data Retention

```typescript
// Archive old GPS data (run monthly)
export const archiveOldGPSData = internalMutation({
  args: {},
  handler: async (ctx) => {
    const twelveMonthsAgo = Date.now() - (365 * 24 * 60 * 60 * 1000)

    const oldPoints = await ctx.db
      .query('gpsTracking')
      .withIndex('by_timestamp', q => q.lt('timestamp', twelveMonthsAgo))
      .collect()

    // Move to archive table or delete
    for (const point of oldPoints) {
      await ctx.db.delete(point._id)
    }

    return { archived: oldPoints.length }
  }
})
```

---

## Deployment Architecture

### Environment Configuration

```bash
# .env.local (Development)
NEXT_PUBLIC_CONVEX_URL=https://your-dev.convex.cloud
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza***
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_TOKEN=***
APP_URL=http://localhost:3000
SESSION_SECRET=your-session-secret-32-chars-min

# Production
NEXT_PUBLIC_CONVEX_URL=https://your-prod.convex.cloud
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIza***
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_TOKEN=***
APP_URL=https://altaviapp.com
SESSION_SECRET=your-production-secret-32-chars
```

### CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/deploy.yml
name: Deploy Altaviapp

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 8

      - name: Install dependencies
        run: pnpm install

      - name: Run tests
        run: pnpm test

      - name: Deploy Convex
        run: pnpm convex deploy --prod
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}

      - name: Build all apps
        run: pnpm build
        env:
          NEXT_PUBLIC_CONVEX_URL: ${{ secrets.NEXT_PUBLIC_CONVEX_URL }}
          NEXT_PUBLIC_GOOGLE_MAPS_API_KEY: ${{ secrets.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY }}

      - name: Deploy Admin to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_ADMIN_PROJECT_ID }}
          working-directory: apps/admin
          vercel-args: '--prod'

      - name: Deploy Parent to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PARENT_PROJECT_ID }}
          working-directory: apps/parent
          vercel-args: '--prod'

      - name: Deploy Crew to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_CREW_PROJECT_ID }}
          working-directory: apps/crew
          vercel-args: '--prod'
```

---

## Summary

This technical specification provides all HOW-TO patterns for implementing Altaviapp:

✅ **Unified PWA**: Three Next.js 14+ PWA apps (Admin, Parent, Crew)
✅ **Monorepo**: Turborepo with shared packages (ui, auth, maps, pwa)
✅ **API Design**: Standard REST format, error handling, validation
✅ **Authentication**: Custom token-based auth with bcrypt + RBAC
✅ **Real-Time**: Convex live queries for GPS tracking
✅ **Offline-First**: Service workers, IndexedDB, background sync
✅ **GPS Tracking**: 15-second updates, geofencing, error handling
✅ **Google Maps**: Directions, Geocoding, Places, Distance Matrix APIs
✅ **QR System**: Generation, scanning, validation
✅ **WhatsApp**: Template-based notifications
✅ **Multi-Tenancy**: Row-level security, institution isolation
✅ **Performance**: Query optimization, data retention
✅ **Deployment**: CI/CD with GitHub Actions, Vercel, Convex

**Reference this document during all module implementations.**

**See Also**:
- [docs/PRD.md](docs/PRD.md) - WHAT to build
- [docs/database/DATABASE_SCHEMA.md](docs/database/DATABASE_SCHEMA.md) - DATA structure
- [docs/design/](docs/design/) - Wireframes (Admin, Parent, Crew, Auth)
- [CLAUDE.md](CLAUDE.md) - AGENT workflow
