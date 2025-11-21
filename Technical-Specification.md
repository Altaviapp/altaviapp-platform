# Technical Specification - Altaviapp

**School Transport Management Platform**
**How to Build** - Architecture, Patterns, and Implementation Guide
**Version**: 1.0
**Date**: January 2025

---

## Overview

This document defines **HOW to build** Altaviapp, providing technical implementation patterns, architecture decisions, and code examples. This complements [docs/PRD.md](docs/PRD.md) (WHAT to build) and [docs/database/DATABASE_SCHEMA.md](docs/database/DATABASE_SCHEMA.md) (DATA structure).

**Technology Philosophy**:
- **Dual-Frontend**: Bubble.io (80% standard UI) + Next.js PWA (20% complex features)
- **Serverless-First**: Convex for database and real-time
- **Type-Safe**: TypeScript strict mode throughout
- **Offline-Capable**: PWA with service workers for driver app
- **Real-Time**: Live queries for GPS tracking and notifications

---

## Technology Stack

### Complete Stack Overview

| Component | Technology | Version | Purpose |
|-----------|------------|---------|---------|
| **Database** | Convex | Latest | Real-time serverless database |
| **Backend Functions** | Convex | Latest | Serverless queries/mutations |
| **Authentication** | Custom Token-Based | Latest | User management, session tokens, RBAC |
| **Admin UI** | Bubble.io | Latest | No-code dashboard and parent portal |
| **Driver App** | Next.js 14+ | 14.x | PWA for offline-capable mobile app |
| **Language** | TypeScript | 5.x | Type safety (Next.js side) |
| **Styling** | Tailwind CSS | 3.x | Utility-first CSS (Next.js) |
| **Maps** | Leaflet + OSM | 1.9.x | Interactive maps, route planning |
| **QR Codes** | qrcode | 1.5.x | Student QR generation |
| **Validation** | Zod | 3.x | Schema validation |
| **Forms** | React Hook Form | Latest | Form state management (Next.js) |
| **Notifications** | WhatsApp Business API | Latest | Parent notifications |
| **Deployment (Next.js)** | Vercel | Latest | PWA hosting |
| **Deployment (Bubble)** | Bubble.io Cloud | Latest | No-code app hosting |

---

## Dual-Frontend Architecture

### When to Use Each Frontend

#### Bubble.io (Primary - 80% of UI)
**Use for:**
- ✅ Admin dashboard (fleet management, route planning, reports)
- ✅ Parent portal (student info, real-time tracking)
- ✅ Standard CRUD operations (create, read, update, delete)
- ✅ Data entry forms
- ✅ List/table views
- ✅ Basic dashboards and metrics
- ✅ Simple workflows
- ✅ Rapid prototyping and iteration

**Advantages:**
- Non-technical users can modify UI
- 10x faster development than code
- Built-in responsive design
- No deployment pipeline needed
- Visual debugging

**Limitations:**
- Limited customization for complex UI
- No offline mode
- Performance constraints for heavy data processing
- No TypeScript or compile-time checks

#### Next.js PWA (Advanced - 20% of features)
**Use for:**
- ✅ Driver mobile app (offline-first with GPS tracking)
- ✅ QR code scanner (camera access)
- ✅ Offline data sync
- ✅ Service workers and IndexedDB
- ✅ Complex real-time features
- ✅ High-performance requirements

**Advantages:**
- Full control over UI/UX
- Offline-first capabilities
- TypeScript type safety
- Service workers for background sync
- Native device access (camera, GPS, notifications)

**Limitations:**
- Slower development than Bubble
- Requires code deployment
- More complex to maintain

### Architecture Diagram

```
┌──────────────────────────────────────────────────────┐
│                    USERS                             │
│         (Schools in Ecuador - Spanish)               │
└────────────────┬────────────┬────────────────────────┘
                 │            │
        ┌────────┴────┐  ┌────┴─────────┐
        │             │  │              │
        ↓             ↓  ↓              ↓
┌───────────────┐  ┌────────────┐  ┌──────────────┐
│  BUBBLE.IO    │  │ BUBBLE.IO  │  │  NEXT.JS PWA │
│  Admin        │  │ Parent     │  │  Driver App  │
│  Dashboard    │  │ Portal     │  │              │
│               │  │            │  │  - GPS Track │
│  - Fleet Mgmt │  │ - Tracking │  │  - QR Scan   │
│  - Routes     │  │ - Alerts   │  │  - Offline   │
│  - Reports    │  │ - Student  │  │  - Check-ins │
└───────┬───────┘  └─────┬──────┘  └──────┬───────┘
        │                │                 │
        └────────────────┴─────────────────┘
                         │
                         ↓
              ┌──────────────────────┐
              │   REST API v1        │
              │   /api/v1/*          │
              │                      │
              │  - Standard Format   │
              │  - Error Handling    │
              │  - Validation (Zod)  │
              └──────────┬───────────┘
                         │
             ┌───────────┴──────────────┐
             │                          │
             ↓                          ↓
    ┌────────────────┐        ┌─────────────────┐
    │  CLERK AUTH    │        │  CONVEX DB      │
    │                │        │                 │
    │  - Users       │        │  - Real-time    │
    │  - Sessions    │        │  - 19 Tables    │
    │  - RBAC        │        │  - Live Queries │
    │  - JWT         │        │  - Mutations    │
    └────────────────┘        └─────────────────┘
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
3. Token stored in localStorage (PWA) or Bubble User field (Bubble.io)
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
- Storage: localStorage (PWA), Bubble User field (Bubble.io)
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
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_***
CLERK_SECRET_KEY=sk_test_***
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_TOKEN=***
APP_URL=http://localhost:3000

# Production
NEXT_PUBLIC_CONVEX_URL=https://your-prod.convex.cloud
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_live_***
CLERK_SECRET_KEY=sk_live_***
WHATSAPP_API_URL=https://graph.facebook.com/v18.0
WHATSAPP_API_TOKEN=***
APP_URL=https://altaviapp.com
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
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test

      - name: Deploy Convex
        run: npx convex deploy --prod
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}

      - name: Build Next.js PWA
        run: npm run build
        env:
          NEXT_PUBLIC_CONVEX_URL: ${{ secrets.NEXT_PUBLIC_CONVEX_URL }}
          NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: ${{ secrets.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY }}

      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

---

## Summary

This technical specification provides all HOW-TO patterns for implementing Altaviapp:

✅ **Dual-Frontend**: Bubble.io (80%) + Next.js PWA (20%)
✅ **API Design**: Standard REST format, error handling, validation
✅ **Authentication**: Clerk integration with RBAC
✅ **Real-Time**: Convex live queries for GPS tracking
✅ **Offline-First**: Service workers, IndexedDB, background sync
✅ **GPS Tracking**: 15-second updates, geofencing, error handling
✅ **QR System**: Generation, scanning, validation
✅ **WhatsApp**: Template-based notifications
✅ **Multi-Tenancy**: Row-level security, institution isolation
✅ **Performance**: Query optimization, data retention
✅ **Deployment**: CI/CD with GitHub Actions, Vercel, Convex

**Reference this document during all module implementations.**

**See Also**:
- [docs/PRD.md](docs/PRD.md) - WHAT to build
- [docs/database/DATABASE_SCHEMA.md](docs/database/DATABASE_SCHEMA.md) - DATA structure
- [CLAUDE.md](CLAUDE.md) - AGENT workflow
