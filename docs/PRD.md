# Altaviapp - Product Requirements Document
## Technical Implementation Specification

**Version:** 1.0  
**Date:** October 2025  
**Status:** Ready for Development  
**Tech Stack:** Bubble.io + Convex + Clerk + OpenStreetMap

---

## 🎯 **TECHNICAL OVERVIEW**

### **Technology Stack**

| Component | Technology | Purpose | Integration |
|-----------|------------|---------|-------------|
| **Frontend** | Bubble.io | Admin dashboard, Parent portal | API calls to Convex |
| **Database** | Convex | Real-time data, Functions | Primary data store |
| **Authentication** | Clerk | User management, Sessions | SSO for all platforms |
| **Maps** | OpenStreetMap + Leaflet | GPS tracking, Route planning | Open source, no API costs |
| **Mobile App** | PWA (Progressive Web App) | Driver mobile application | Installable, offline-capable |
| **QR Codes** | qrcode.js | Student identification | Client-side generation |
| **WhatsApp** | WhatsApp Business API | Parent notifications | External service integration |

### **Architecture Principles**

1. **Real-time First**: Convex handles live GPS tracking and notifications
2. **Mobile-Responsive**: All interfaces work seamlessly on mobile devices  
3. **Offline-Capable**: Driver app works without internet, syncs when connected
4. **API-Driven**: Clean separation between frontend and backend
5. **Scalable**: Designed to handle hundreds of schools and thousands of users

---

## 🏗️ **SYSTEM ARCHITECTURE**

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND LAYER                       │
├─────────────────────────────────────────────────────────┤
│  Bubble.io Web App    │    PWA Mobile App               │
│  ├── Admin Dashboard  │    ├── Driver App               │
│  ├── Parent Portal    │    ├── Offline Support         │
│  └── Public Website   │    └── GPS Tracking            │
└─────────────────┬───────────────────┬───────────────────┘
                  │                   │
                  │   API Calls       │   API Calls
                  │                   │
┌─────────────────▼───────────────────▼───────────────────┐
│                  AUTHENTICATION                         │
├─────────────────────────────────────────────────────────┤
│  Clerk Auth                                             │
│  ├── User Management                                    │
│  ├── Role-Based Access                                  │
│  ├── Session Management                                 │
│  └── SSO Integration                                    │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │   Authenticated API Calls
                  │
┌─────────────────▼───────────────────────────────────────┐
│                   BACKEND LAYER                         │
├─────────────────────────────────────────────────────────┤
│  Convex Database & Functions                            │
│  ├── Real-time Database                                 │
│  ├── Server Functions                                   │
│  ├── Live Queries                                       │
│  ├── Mutations                                          │
│  └── Background Jobs                                    │
└─────────────────┬───────────────────────────────────────┘
                  │
                  │   External Integrations
                  │
┌─────────────────▼───────────────────────────────────────┐
│               EXTERNAL SERVICES                         │
├─────────────────────────────────────────────────────────┤
│  WhatsApp API    │  OpenStreetMap   │  Email Service    │
│  ├── Notifications│  ├── Tile Server │  ├── Transactional│
│  └── Status Updates│  └── Geocoding  │  └── Alerts      │
└─────────────────────────────────────────────────────────┘
```

---

## 📱 **MODULE SPECIFICATIONS**

### **1. ADMIN DASHBOARD (Bubble.io Web App)**

#### **1.1 Technology Implementation**
- **Platform**: Bubble.io visual development
- **Authentication**: Clerk integration via API
- **Data**: Convex API calls for all operations
- **Responsive**: Works on desktop, tablet, mobile

#### **1.2 Key Features Implementation**

**Dashboard Overview**
```javascript
// Convex Query Example
export const getDashboardStats = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    const vehicles = await ctx.db
      .query("vehicles")
      .withIndex("by_institution", (q) => q.eq("institutionId", args.institutionId))
      .collect();
    
    const activeRoutes = await ctx.db
      .query("trips")
      .withIndex("by_date", (q) => q.eq("scheduledDate", today()))
      .filter((q) => q.eq(q.field("status"), "in_progress"))
      .collect();
    
    return {
      totalVehicles: vehicles.length,
      activeVehicles: vehicles.filter(v => v.status === "active").length,
      activeRoutes: activeRoutes.length,
      // ... more stats
    };
  },
});
```

**Fleet Management**
- CRUD operations for vehicles via Convex mutations
- Document upload to Convex file storage
- Real-time status updates using Convex live queries

**Route Planning**
- OpenStreetMap integration with Leaflet
- Drag-and-drop waypoint creation
- Real-time route optimization

#### **1.3 Bubble.io Specific Implementation**

**Data Sources:**
- External API calls to Convex endpoints
- Real-time data updates via Convex subscriptions
- File storage through Convex for documents

**Workflows:**
- User authentication through Clerk
- Data manipulation via Convex mutations
- Background processes for notifications

---

### **2. DRIVER MOBILE APP (PWA)**

#### **2.1 Technology Stack**
```json
{
  "framework": "React + TypeScript",
  "database": "Convex (real-time)",
  "authentication": "Clerk",
  "maps": "Leaflet + OpenStreetMap",
  "qr": "qrcode-reader",
  "pwa": "Service Workers + Manifest",
  "offline": "IndexedDB + Sync"
}
```

#### **2.2 PWA Configuration**
```javascript
// manifest.json
{
  "name": "Altaviapp Driver",
  "short_name": "Altaviapp",
  "description": "School transport driver application",
  "start_url": "/driver",
  "display": "standalone",
  "background_color": "#1f2937",
  "theme_color": "#3b82f6",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png", 
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

#### **2.3 Offline Functionality**
```typescript
// Service Worker for offline support
const CACHE_NAME = 'altaviapp-driver-v1';
const urlsToCache = [
  '/driver',
  '/driver/checklist',
  '/driver/route',
  // ... essential routes
];

// Cache essential data for offline use
interface OfflineData {
  route: Route;
  students: Student[];
  vehicle: Vehicle;
  lastSync: number;
}

class OfflineManager {
  async cacheRouteData(tripId: string) {
    const data = await convex.query(api.trips.getTripData, { tripId });
    await this.saveToIndexedDB('routeData', data);
  }
  
  async syncWhenOnline() {
    const pendingActions = await this.getPendingActions();
    for (const action of pendingActions) {
      await convex.mutation(action.mutation, action.args);
    }
  }
}
```

#### **2.4 GPS Tracking Implementation**
```typescript
class GPSTracker {
  private watchId: number | null = null;
  
  startTracking(tripId: string) {
    this.watchId = navigator.geolocation.watchPosition(
      (position) => {
        const location = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          speed: position.coords.speed,
          timestamp: Date.now()
        };
        
        // Save locally first (offline support)
        this.saveLocationLocally(tripId, location);
        
        // Send to Convex if online
        if (navigator.onLine) {
          convex.mutation(api.tracking.updateLocation, {
            tripId,
            ...location
          });
        }
      },
      (error) => console.error('GPS Error:', error),
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 10000
      }
    );
  }
}
```

#### **2.5 QR Code Implementation**
```typescript
import QrReader from 'qrcode-reader';

class QRScanner {
  async scanStudent(imageData: ImageData): Promise<Student | null> {
    return new Promise((resolve) => {
      const qr = new QrReader();
      qr.callback = async (err, value) => {
        if (err) {
          resolve(null);
          return;
        }
        
        // Validate QR code with Convex
        const student = await convex.query(api.students.validateQR, {
          qrCode: value.result
        });
        
        resolve(student);
      };
      
      qr.decode(imageData);
    });
  }
}
```

---

### **3. PARENT PORTAL (Bubble.io Responsive)**

#### **3.1 Real-time Tracking Implementation**
- Convex live queries for GPS updates
- WebSocket connection through Convex
- Auto-refresh every 15 seconds

#### **3.2 WhatsApp Integration**
```javascript
// Convex function for WhatsApp notifications
export const sendWhatsAppNotification = internalMutation({
  args: {
    phone: v.string(),
    message: v.string(),
    templateName: v.string()
  },
  handler: async (ctx, args) => {
    // WhatsApp Business API integration
    const response = await fetch(`${WHATSAPP_API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: args.phone,
        type: "template",
        template: {
          name: args.templateName,
          language: { code: "es" }
        }
      })
    });
    
    return response.json();
  }
});
```

---

### **4. CONVEX DATABASE SCHEMA**

#### **4.1 Core Tables**
See the generated `convex/schema.ts` file for complete schema definition.

#### **4.2 Key Convex Functions**

**Real-time GPS Updates**
```typescript
export const updateGPSLocation = mutation({
  args: {
    tripId: v.id("trips"),
    latitude: v.number(),
    longitude: v.number(),
    speed: v.optional(v.number()),
    timestamp: v.number()
  },
  handler: async (ctx, args) => {
    // Insert GPS point
    await ctx.db.insert("gpsTracking", args);
    
    // Check geofencing for route stops
    const route = await ctx.db.query("trips")
      .filter(q => q.eq(q.field("_id"), args.tripId))
      .first();
      
    if (route) {
      await checkGeofencing(ctx, route, args.latitude, args.longitude);
    }
  }
});
```

**Student Check-in**
```typescript
export const checkInStudent = mutation({
  args: {
    tripId: v.id("trips"),
    studentId: v.id("students"),
    qrScanned: v.boolean(),
    latitude: v.number(),
    longitude: v.number()
  },
  handler: async (ctx, args) => {
    // Record check-in
    const checkinId = await ctx.db.insert("studentCheckins", {
      ...args,
      timestamp: Date.now(),
      checkinType: "pickup",
      createdAt: Date.now()
    });
    
    // Get student and parent info
    const student = await ctx.db.get(args.studentId);
    if (student) {
      // Send WhatsApp notification to parent
      await ctx.scheduler.runAfter(0, internal.notifications.sendPickupNotification, {
        studentName: `${student.firstName} ${student.lastName}`,
        parentPhone: student.parentPhone,
        timestamp: Date.now()
      });
    }
    
    return checkinId;
  }
});
```

**Live Route Tracking**
```typescript
export const getLiveRouteData = query({
  args: { routeId: v.id("routes") },
  handler: async (ctx, args) => {
    // Get current trip for route
    const currentTrip = await ctx.db
      .query("trips")
      .withIndex("by_route", (q) => q.eq("routeId", args.routeId))
      .filter((q) => q.eq(q.field("status"), "in_progress"))
      .first();
    
    if (!currentTrip) return null;
    
    // Get latest GPS position
    const latestPosition = await ctx.db
      .query("gpsTracking")
      .withIndex("by_trip", (q) => q.eq("tripId", currentTrip._id))
      .order("desc")
      .first();
    
    // Get route stops
    const stops = await ctx.db
      .query("routeStops")
      .withIndex("by_route", (q) => q.eq("routeId", args.routeId))
      .collect();
    
    // Get checked-in students
    const checkins = await ctx.db
      .query("studentCheckins")
      .withIndex("by_trip", (q) => q.eq("tripId", currentTrip._id))
      .collect();
    
    return {
      trip: currentTrip,
      currentPosition: latestPosition,
      stops: stops.sort((a, b) => a.order - b.order),
      checkedInStudents: checkins.length
    };
  }
});
```

---

## 🔧 **TECHNICAL IMPLEMENTATION DETAILS**

### **5. AUTHENTICATION FLOW (Clerk Integration)**

#### **5.1 Multi-Role Authentication**
```typescript
// Clerk webhook handler for user creation
export const handleClerkWebhook = httpAction(async (ctx, request) => {
  const { type, data } = await request.json();
  
  if (type === "user.created") {
    // Create user in Convex database
    await ctx.runMutation(internal.users.createUser, {
      clerkId: data.id,
      email: data.email_addresses[0].email_address,
      name: `${data.first_name} ${data.last_name}`,
      role: "parent", // Default role
      isActive: true,
      createdAt: Date.now(),
      updatedAt: Date.now()
    });
  }
});

// Role-based access control
export const requireRole = (allowedRoles: string[]) => {
  return async (ctx: any) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) throw new Error("Not authenticated");
    
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", identity.subject))
      .first();
    
    if (!user || !allowedRoles.includes(user.role)) {
      throw new Error("Insufficient permissions");
    }
    
    return user;
  };
};
```

#### **5.2 Session Management**
```typescript
// Custom session handling for PWA
class SessionManager {
  async refreshToken() {
    try {
      const session = await clerk.session?.reload();
      return session?.getToken();
    } catch (error) {
      // Redirect to login
      window.location.href = '/sign-in';
    }
  }
  
  async getAuthHeaders() {
    const token = await this.refreshToken();
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
}
```

---

### **6. MAPS INTEGRATION (OpenStreetMap + Leaflet)**

#### **6.1 Route Planning Interface**
```typescript
import L from 'leaflet';

class RouteBuilder {
  private map: L.Map;
  private waypoints: L.LatLng[] = [];
  private routeLayer: L.Polyline | null = null;
  
  initializeMap(containerId: string) {
    this.map = L.map(containerId).setView([-0.1807, -78.4678], 13); // Quito
    
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);
    
    // Add click handler for waypoints
    this.map.on('click', (e) => this.addWaypoint(e.latlng));
  }
  
  addWaypoint(latlng: L.LatLng) {
    this.waypoints.push(latlng);
    
    // Add marker
    const marker = L.marker(latlng, { draggable: true })
      .addTo(this.map)
      .bindPopup(`Parada ${this.waypoints.length}`);
    
    // Update route line
    this.updateRoute();
  }
  
  async updateRoute() {
    if (this.waypoints.length < 2) return;
    
    // Use OSRM for routing (free alternative to Google)
    const coords = this.waypoints.map(p => `${p.lng},${p.lat}`).join(';');
    const response = await fetch(
      `https://router.project-osrm.org/route/v1/driving/${coords}?overview=full&geometries=geojson`
    );
    
    const data = await response.json();
    if (data.routes && data.routes[0]) {
      const route = data.routes[0];
      
      // Remove old route
      if (this.routeLayer) this.map.removeLayer(this.routeLayer);
      
      // Add new route
      this.routeLayer = L.geoJSON(route.geometry, {
        style: { color: '#3b82f6', weight: 4 }
      }).addTo(this.map);
      
      return {
        distance: route.distance,
        duration: route.duration,
        geometry: route.geometry
      };
    }
  }
}
```

#### **6.2 Real-time Vehicle Tracking**
```typescript
class LiveTracker {
  private vehicleMarkers: Map<string, L.Marker> = new Map();
  
  async updateVehiclePosition(vehicleId: string, position: GPSPosition) {
    let marker = this.vehicleMarkers.get(vehicleId);
    
    if (!marker) {
      // Create new vehicle marker
      const busIcon = L.divIcon({
        html: '🚌',
        className: 'vehicle-marker',
        iconSize: [30, 30]
      });
      
      marker = L.marker([position.latitude, position.longitude], { 
        icon: busIcon 
      }).addTo(this.map);
      
      this.vehicleMarkers.set(vehicleId, marker);
    } else {
      // Update position with smooth animation
      marker.setLatLng([position.latitude, position.longitude]);
    }
    
    // Update popup with current info
    marker.bindPopup(`
      <div class="vehicle-popup">
        <h3>Vehículo ${vehicleId}</h3>
        <p>Velocidad: ${position.speed || 0} km/h</p>
        <p>Última actualización: ${new Date().toLocaleTimeString()}</p>
      </div>
    `);
  }
}
```

---

### **7. PROGRESSIVE WEB APP (PWA) IMPLEMENTATION**

#### **7.1 Service Worker for Offline Support**
```typescript
// sw.js
const CACHE_NAME = 'altaviapp-v1';
const OFFLINE_URLS = [
  '/',
  '/driver',
  '/driver/checklist',
  '/driver/route',
  '/offline.html'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(OFFLINE_URLS))
  );
});

self.addEventListener('fetch', (event) => {
  // Cache-first strategy for static assets
  if (event.request.destination === 'image' || 
      event.request.destination === 'script' ||
      event.request.destination === 'style') {
    event.respondWith(
      caches.match(event.request)
        .then((response) => response || fetch(event.request))
    );
  }
  
  // Network-first for API calls
  if (event.request.url.includes('/api/')) {
    event.respondWith(
      fetch(event.request)
        .catch(() => caches.match('/offline.html'))
    );
  }
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-checkins') {
    event.waitUntil(syncPendingCheckins());
  }
});

async function syncPendingCheckins() {
  const db = await openDB();
  const pendingCheckins = await db.getAll('pendingCheckins');
  
  for (const checkin of pendingCheckins) {
    try {
      await fetch('/api/checkins', {
        method: 'POST',
        body: JSON.stringify(checkin)
      });
      await db.delete('pendingCheckins', checkin.id);
    } catch (error) {
      console.log('Sync failed, will retry later');
    }
  }
}
```

#### **7.2 IndexedDB for Offline Data**
```typescript
class OfflineStorage {
  private db: IDBDatabase | null = null;
  
  async init() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open('AltaviappDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create stores
        if (!db.objectStoreNames.contains('routes')) {
          db.createObjectStore('routes', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('students')) {
          db.createObjectStore('students', { keyPath: 'id' });
        }
        if (!db.objectStoreNames.contains('pendingCheckins')) {
          db.createObjectStore('pendingCheckins', { keyPath: 'id', autoIncrement: true });
        }
      };
    });
  }
  
  async storeRouteData(routeData: RouteData) {
    const transaction = this.db!.transaction(['routes', 'students'], 'readwrite');
    await transaction.objectStore('routes').put(routeData.route);
    
    for (const student of routeData.students) {
      await transaction.objectStore('students').put(student);
    }
  }
  
  async addPendingCheckin(checkin: StudentCheckin) {
    const transaction = this.db!.transaction(['pendingCheckins'], 'readwrite');
    await transaction.objectStore('pendingCheckins').add({
      ...checkin,
      timestamp: Date.now(),
      synced: false
    });
    
    // Register background sync
    if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register('sync-checkins');
    }
  }
}
```

---

### **8. NOTIFICATION SYSTEM**

#### **8.1 WhatsApp Integration**
```typescript
// Convex background function for WhatsApp notifications
export const sendPickupNotification = internalMutation({
  args: {
    studentName: v.string(),
    parentPhone: v.string(),
    timestamp: v.number()
  },
  handler: async (ctx, args) => {
    const message = `🚌 Confirmación de Recogida

${args.studentName} subió al bus a las ${new Date(args.timestamp).toLocaleTimeString()}.

Rastrea en vivo: ${process.env.APP_URL}/track`;

    // Send via WhatsApp Business API
    const response = await fetch(`${process.env.WHATSAPP_API_URL}/messages`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: "whatsapp",
        to: args.parentPhone,
        type: "text",
        text: { body: message }
      })
    });
    
    // Log notification
    await ctx.db.insert("notifications", {
      userId: "", // Would need to lookup parent user
      title: "Estudiante Recogido",
      message,
      type: "success",
      read: false,
      createdAt: Date.now()
    });
    
    return response.json();
  }
});
```

#### **8.2 Real-time Push Notifications**
```typescript
// Push notification service
class PushNotificationService {
  async requestPermission() {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  }
  
  async subscribeToPush() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    });
    
    // Send subscription to server
    await convex.mutation(api.notifications.subscribeToPush, {
      subscription: JSON.stringify(subscription)
    });
  }
  
  showNotification(title: string, options: NotificationOptions) {
    if (Notification.permission === 'granted') {
      new Notification(title, options);
    }
  }
}
```

---

### **9. QR CODE SYSTEM**

#### **9.1 QR Generation**
```typescript
import QRCode from 'qrcode';

export const generateStudentQR = mutation({
  args: { studentId: v.id("students") },
  handler: async (ctx, args) => {
    const student = await ctx.db.get(args.studentId);
    if (!student) throw new Error("Student not found");
    
    // Generate unique QR code
    const qrData = {
      studentId: args.studentId,
      institutionId: student.institutionId,
      timestamp: Date.now()
    };
    
    const qrString = JSON.stringify(qrData);
    const qrCode = await QRCode.toDataURL(qrString);
    
    // Update student record
    await ctx.db.patch(args.studentId, { qrCode: qrString });
    
    return { qrCode, qrString };
  }
});
```

#### **9.2 QR Validation**
```typescript
export const validateStudentQR = query({
  args: { qrCode: v.string(), routeId: v.id("routes") },
  handler: async (ctx, args) => {
    try {
      const qrData = JSON.parse(args.qrCode);
      
      // Get student
      const student = await ctx.db.get(qrData.studentId);
      if (!student) return { valid: false, error: "Student not found" };
      
      // Check if student is assigned to this route
      const assignment = await ctx.db
        .query("studentRoutes")
        .withIndex("by_student", (q) => q.eq("studentId", qrData.studentId))
        .filter((q) => q.eq(q.field("routeId"), args.routeId))
        .first();
      
      if (!assignment) {
        return { valid: false, error: "Student not assigned to this route" };
      }
      
      return {
        valid: true,
        student: {
          id: student._id,
          name: `${student.firstName} ${student.lastName}`,
          grade: student.grade
        }
      };
    } catch (error) {
      return { valid: false, error: "Invalid QR code" };
    }
  }
});
```

---

### **10. GEOFENCING IMPLEMENTATION**

#### **10.1 Stop Detection**
```typescript
// Geofencing utility
class GeofenceManager {
  calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c; // Distance in meters
  }
  
  isWithinGeofence(currentLat: number, currentLon: number, 
                   stopLat: number, stopLon: number, radius: number): boolean {
    const distance = this.calculateDistance(currentLat, currentLon, stopLat, stopLon);
    return distance <= radius;
  }
}

// Convex function to check geofencing
export const checkGeofencing = internalMutation({
  args: {
    tripId: v.id("trips"),
    latitude: v.number(),
    longitude: v.number()
  },
  handler: async (ctx, args) => {
    // Get trip and route
    const trip = await ctx.db.get(args.tripId);
    if (!trip) return;
    
    const stops = await ctx.db
      .query("routeStops")
      .withIndex("by_route", (q) => q.eq("routeId", trip.routeId))
      .collect();
    
    const geofence = new GeofenceManager();
    
    for (const stop of stops) {
      if (geofence.isWithinGeofence(
        args.latitude, args.longitude,
        stop.latitude, stop.longitude,
        stop.geofenceRadius
      )) {
        // Vehicle entered stop geofence
        await ctx.db.insert("notifications", {
          userId: "", // Driver user ID
          title: "Llegaste a parada",
          message: `Has llegado a ${stop.name}`,
          type: "info",
          read: false,
          createdAt: Date.now()
        });
        
        // Send to parents waiting at this stop
        // (Implementation would involve querying students assigned to this stop)
      }
    }
  }
});
```

---

## 🚀 **DEPLOYMENT ARCHITECTURE**

### **11.1 Environment Configuration**
```yaml
# Development
- Convex: Development deployment
- Clerk: Development instance
- Bubble.io: Development app
- WhatsApp: Sandbox environment

# Staging
- Convex: Staging deployment
- Clerk: Production instance (separate app)
- Bubble.io: Staging app
- WhatsApp: Business API (test)

# Production
- Convex: Production deployment
- Clerk: Production instance
- Bubble.io: Live app
- WhatsApp: Business API (live)
```

### **11.2 CI/CD Pipeline**
```yaml
# GitHub Actions workflow
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
        
      - name: Deploy to Convex
        run: npx convex deploy --prod
        env:
          CONVEX_DEPLOY_KEY: ${{ secrets.CONVEX_DEPLOY_KEY }}
          
      - name: Build PWA
        run: npm run build
        
      - name: Deploy PWA to Vercel
        uses: vercel/action@v1
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
```

---

## 📊 **PERFORMANCE REQUIREMENTS**

### **12.1 Response Times**
- GPS location updates: < 1 second
- QR code scanning: < 500ms
- Route loading: < 2 seconds
- Parent notifications: < 5 seconds
- Map rendering: < 3 seconds

### **12.2 Scalability Targets**
- Support 100+ schools simultaneously
- Handle 1000+ concurrent GPS updates
- Process 10,000+ daily student check-ins
- Store 1M+ location points per month

### **12.3 Availability**
- 99.9% uptime target
- < 1 minute recovery time
- Graceful degradation for offline scenarios
- Real-time backup and failover

---

## 🔒 **SECURITY IMPLEMENTATION**

### **13.1 Data Protection**
```typescript
// Data encryption at rest (Convex handles this)
// Data encryption in transit (HTTPS everywhere)
// Role-based access control

export const secureQuery = query({
  args: { institutionId: v.id("institutions") },
  handler: async (ctx, args) => {
    // Verify user has access to institution
    const user = await requireAuth(ctx);
    
    if (user.role !== "super_admin" && user.institutionId !== args.institutionId) {
      throw new Error("Access denied");
    }
    
    // Proceed with query...
  }
});
```

### **13.2 Input Validation**
```typescript
// All inputs validated with Zod schemas
const StudentSchema = z.object({
  firstName: z.string().min(1).max(50),
  lastName: z.string().min(1).max(50),
  grade: z.string().min(1).max(20),
  parentPhone: z.string().regex(/^\+593\d{9}$/),
  parentEmail: z.string().email(),
});

export const createStudent = mutation({
  args: {
    institutionId: v.id("institutions"),
    studentData: v.object({
      firstName: v.string(),
      lastName: v.string(),
      grade: v.string(),
      parentPhone: v.string(),
      parentEmail: v.string(),
    })
  },
  handler: async (ctx, args) => {
    // Validate input
    const validatedData = StudentSchema.parse(args.studentData);
    
    // Proceed with creation...
  }
});
```

---

## 📋 **TESTING STRATEGY**

### **14.1 Test Coverage**
- Unit tests for all Convex functions
- Integration tests for API endpoints
- E2E tests for critical user flows
- Performance tests for GPS tracking
- Security tests for authentication

### **14.2 Test Implementation**
```typescript
// Jest test example
describe('Student Check-in', () => {
  test('should record student pickup with QR scan', async () => {
    const student = await testDb.insert('students', mockStudent);
    const trip = await testDb.insert('trips', mockTrip);
    
    const result = await convex.mutation(api.checkins.checkInStudent, {
      tripId: trip._id,
      studentId: student._id,
      qrScanned: true,
      latitude: -0.1807,
      longitude: -78.4678
    });
    
    expect(result).toBeDefined();
    
    const checkin = await testDb.get(result);
    expect(checkin?.studentId).toBe(student._id);
    expect(checkin?.qrScanned).toBe(true);
  });
});
```

---

## 🎯 **SUCCESS METRICS**

### **15.1 Technical KPIs**
- API response time < 500ms (95th percentile)
- GPS accuracy within 10 meters
- PWA installation rate > 80% for drivers
- Offline functionality success rate > 95%
- Zero data loss during offline periods

### **15.2 Business KPIs**
- Customer onboarding time < 3 days
- Parent satisfaction score > 4.5/5
- Driver app adoption rate > 90%
- Platform uptime > 99.9%
- Support ticket resolution < 4 hours

---

**This PRD provides the complete technical specification for implementing Altaviapp using the modern stack of Bubble.io, Convex, Clerk, and open-source technologies. The architecture is designed for scalability, reliability, and excellent user experience across all platforms.**