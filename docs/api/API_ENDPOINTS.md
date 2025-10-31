# Altaviapp API Endpoints Reference

**REST API Documentation**
**Version**: 1.0
**Base URL**: `https://altaviapp.com/api/v1`
**Date**: January 2025

---

## Overview

This document defines all REST API endpoints for the Altaviapp platform. All endpoints follow standard HTTP methods and return consistent response formats.

**Authentication**: All endpoints (except public routes) require Bearer token authentication via Clerk.

**Headers Required**:
```
Authorization: Bearer <clerk_jwt_token>
Content-Type: application/json
```

**Standard Response Format**:
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

**Error Response Format**:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": { ... }
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

## Table of Contents

1. [Authentication](#authentication)
2. [Institutions](#institutions)
3. [Vehicles](#vehicles)
4. [Drivers](#drivers)
5. [Students](#students)
6. [Routes](#routes)
7. [Route Stops](#route-stops)
8. [Student Routes](#student-routes)
9. [Trips](#trips)
10. [GPS Tracking](#gps-tracking)
11. [Student Check-ins](#student-check-ins)
12. [Incidents](#incidents)
13. [Notifications](#notifications)

---

## Authentication

### POST /auth/token
Get authentication token (for testing/Bubble integration)

**Request**:
```json
{
  "clerkUserId": "user_abc123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "expiresIn": 3600,
    "user": {
      "id": "user_123",
      "email": "user@example.com",
      "role": "admin",
      "institutionId": "inst_456"
    }
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### POST /auth/sync
Sync Clerk user to Convex database (webhook endpoint)

**Request**:
```json
{
  "type": "user.created",
  "data": {
    "id": "clerk_user_123",
    "email_addresses": [{"email_address": "user@example.com"}],
    "first_name": "Juan",
    "last_name": "Pérez"
  }
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "userId": "user_123",
    "message": "User synced successfully"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

## Institutions

### GET /institutions
List all institutions (super_admin only)

**Query Parameters**:
- `limit` (optional): Number of results (default: 50)
- `offset` (optional): Pagination offset (default: 0)
- `status` (optional): Filter by status (active/suspended/cancelled)

**Response**:
```json
{
  "success": true,
  "data": {
    "institutions": [
      {
        "id": "inst_123",
        "name": "Colegio San Francisco",
        "type": "school",
        "address": "Av. Principal 123, Quito",
        "city": "Quito",
        "phone": "+593987654321",
        "email": "info@colegiosanfrancisco.edu.ec",
        "contactPerson": "Dr. María López",
        "isActive": true,
        "subscriptionPlan": "professional",
        "subscriptionStatus": "active",
        "createdAt": 1704988800000,
        "updatedAt": 1704988800000
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### POST /institutions
Create new institution (super_admin only)

**Request**:
```json
{
  "name": "Colegio San Francisco",
  "type": "school",
  "address": "Av. Principal 123, Quito",
  "city": "Quito",
  "phone": "+593987654321",
  "email": "info@colegiosanfrancisco.edu.ec",
  "contactPerson": "Dr. María López",
  "subscriptionPlan": "trial"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "inst_123",
    "name": "Colegio San Francisco",
    "...": "..."
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### GET /institutions/:id
Get institution details

### PUT /institutions/:id
Update institution

### DELETE /institutions/:id
Delete institution (super_admin only)

---

## Vehicles

### GET /vehicles
List all vehicles (filtered by user's institution)

**Query Parameters**:
- `status` (optional): active/maintenance/out_of_service/retired
- `limit` (optional): Results per page (default: 50)
- `offset` (optional): Pagination offset

**Response**:
```json
{
  "success": true,
  "data": {
    "vehicles": [
      {
        "id": "veh_123",
        "institutionId": "inst_456",
        "licensePlate": "ABC-123",
        "brand": "Toyota",
        "model": "Hiace",
        "year": 2022,
        "color": "Blanco",
        "capacity": 15,
        "wheelchairAccessible": false,
        "status": "active",
        "isActive": true,
        "documents": {
          "soat": {
            "expiryDate": 1735689600000,
            "documentUrl": "https://..."
          },
          "technicalReview": {
            "expiryDate": 1735689600000,
            "documentUrl": "https://..."
          }
        },
        "lastMaintenanceDate": 1704988800000,
        "nextMaintenanceDate": 1720540800000,
        "imageUrls": ["https://..."],
        "createdAt": 1704988800000,
        "updatedAt": 1704988800000
      }
    ],
    "total": 1,
    "limit": 50,
    "offset": 0
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### POST /vehicles
Create new vehicle (admin, super_admin)

**Request**:
```json
{
  "licensePlate": "ABC-123",
  "brand": "Toyota",
  "model": "Hiace",
  "year": 2022,
  "color": "Blanco",
  "capacity": 15,
  "wheelchairAccessible": false
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "veh_123",
    "licensePlate": "ABC-123",
    "...": "..."
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### GET /vehicles/:id
Get vehicle details

### PUT /vehicles/:id
Update vehicle (admin, super_admin)

**Request**:
```json
{
  "status": "maintenance",
  "lastMaintenanceDate": 1704988800000,
  "nextMaintenanceDate": 1720540800000
}
```

### DELETE /vehicles/:id
Delete vehicle (admin, super_admin)

### POST /vehicles/:id/upload-document
Upload vehicle document (SOAT, technical review, etc.)

**Request**: Multipart form-data
- `documentType`: soat/technicalReview/operationPermit
- `file`: Document file (PDF, JPG, PNG)
- `expiryDate`: Expiration date (Unix timestamp)

**Response**:
```json
{
  "success": true,
  "data": {
    "documentUrl": "https://convex.cloud/storage/...",
    "expiryDate": 1735689600000
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

## Drivers

### GET /drivers
List all drivers (filtered by institution)

**Query Parameters**:
- `isActive` (optional): true/false
- `currentVehicleId` (optional): Filter by assigned vehicle

**Response**:
```json
{
  "success": true,
  "data": {
    "drivers": [
      {
        "id": "drv_123",
        "userId": "user_456",
        "institutionId": "inst_789",
        "licenseNumber": "0123456789",
        "licenseCategory": "C2",
        "licenseExpiry": 1735689600000,
        "phone": "+593987654321",
        "emergencyContactName": "María Pérez",
        "emergencyContactPhone": "+593987654322",
        "employeeId": "EMP001",
        "startDate": 1704988800000,
        "totalTrips": 45,
        "averageRating": 4.8,
        "punctualityScore": 95,
        "certifications": {
          "defensiveDriving": {
            "issueDate": 1704988800000,
            "expiryDate": 1735689600000
          }
        },
        "isActive": true,
        "currentVehicleId": "veh_123",
        "createdAt": 1704988800000,
        "updatedAt": 1704988800000
      }
    ],
    "total": 1
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### POST /drivers
Create new driver (admin, super_admin)

**Request**:
```json
{
  "userId": "user_456",
  "licenseNumber": "0123456789",
  "licenseCategory": "C2",
  "licenseExpiry": 1735689600000,
  "phone": "+593987654321",
  "emergencyContactName": "María Pérez",
  "emergencyContactPhone": "+593987654322",
  "employeeId": "EMP001"
}
```

### GET /drivers/:id
Get driver details

### PUT /drivers/:id
Update driver

### DELETE /drivers/:id
Delete driver (admin, super_admin)

---

## Students

### GET /students
List all students (filtered by institution)

**Query Parameters**:
- `grade` (optional): Filter by grade
- `isActive` (optional): true/false
- `parentPhone` (optional): Search by parent phone

**Response**:
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": "std_123",
        "institutionId": "inst_456",
        "firstName": "Juan",
        "lastName": "Pérez",
        "dateOfBirth": 1420070400000,
        "grade": "5to Grado",
        "studentId": "ST2025001",
        "homeAddress": "Calle 10 #23-45, Quito",
        "homeLatitude": -0.1807,
        "homeLongitude": -78.4678,
        "parentName": "María Pérez",
        "parentPhone": "+593987654321",
        "parentEmail": "maria@example.com",
        "secondaryParentName": "Carlos Pérez",
        "secondaryParentPhone": "+593987654322",
        "emergencyContacts": [
          {
            "name": "Abuela Rosa",
            "relationship": "Abuela",
            "phone": "+593987654323",
            "canPickup": true
          }
        ],
        "medicalInfo": {
          "allergies": ["Penicilina"],
          "medications": [],
          "specialNeeds": "Ninguna",
          "bloodType": "O+"
        },
        "qrCode": "{\"studentId\":\"std_123\",\"institutionId\":\"inst_456\",\"timestamp\":1704988800000}",
        "canExitAlone": false,
        "authorizedPickupPersons": [
          {
            "name": "Tía Ana",
            "relationship": "Tía",
            "phone": "+593987654324",
            "idDocument": "1234567890",
            "photoUrl": "https://..."
          }
        ],
        "isActive": true,
        "transportStatus": "active",
        "photoUrl": "https://...",
        "createdAt": 1704988800000,
        "updatedAt": 1704988800000
      }
    ],
    "total": 1
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### POST /students
Create new student (admin, super_admin)

**Request**:
```json
{
  "firstName": "Juan",
  "lastName": "Pérez",
  "dateOfBirth": 1420070400000,
  "grade": "5to Grado",
  "studentId": "ST2025001",
  "homeAddress": "Calle 10 #23-45, Quito",
  "parentName": "María Pérez",
  "parentPhone": "+593987654321",
  "parentEmail": "maria@example.com",
  "medicalInfo": {
    "allergies": ["Penicilina"],
    "bloodType": "O+"
  }
}
```

**Response**: (includes auto-generated QR code)
```json
{
  "success": true,
  "data": {
    "id": "std_123",
    "firstName": "Juan",
    "lastName": "Pérez",
    "qrCode": "{...}",
    "qrCodeDataUrl": "data:image/png;base64,...",
    "...": "..."
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### GET /students/:id
Get student details

### PUT /students/:id
Update student

### DELETE /students/:id
Delete student (admin, super_admin)

### GET /students/:id/qr
Get student QR code

**Response**:
```json
{
  "success": true,
  "data": {
    "qrCode": "{\"studentId\":\"std_123\",\"institutionId\":\"inst_456\",\"timestamp\":1704988800000}",
    "qrCodeDataUrl": "data:image/png;base64,iVBORw0KGgoAAAANS...",
    "student": {
      "id": "std_123",
      "firstName": "Juan",
      "lastName": "Pérez",
      "grade": "5to Grado"
    }
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### POST /students/:id/regenerate-qr
Regenerate student QR code (if compromised)

---

## Routes

### GET /routes
List all routes (filtered by institution)

**Query Parameters**:
- `type` (optional): pickup/dropoff
- `isActive` (optional): true/false
- `driverId` (optional): Filter by driver
- `vehicleId` (optional): Filter by vehicle

**Response**:
```json
{
  "success": true,
  "data": {
    "routes": [
      {
        "id": "rte_123",
        "institutionId": "inst_456",
        "vehicleId": "veh_789",
        "driverId": "drv_101",
        "backupDriverId": null,
        "name": "Ruta Norte AM",
        "description": "Ruta de recogida zona norte",
        "type": "pickup",
        "scheduledStartTime": "07:00",
        "scheduledEndTime": "08:30",
        "estimatedDuration": 90,
        "operatingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
        "totalDistance": 12.5,
        "totalStops": 8,
        "maxCapacity": 15,
        "currentOccupancy": 12,
        "isActive": true,
        "status": "active",
        "routePolyline": "encoded_polyline_string",
        "createdAt": 1704988800000,
        "updatedAt": 1704988800000
      }
    ],
    "total": 1
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### POST /routes
Create new route (admin, super_admin)

**Request**:
```json
{
  "name": "Ruta Norte AM",
  "description": "Ruta de recogida zona norte",
  "type": "pickup",
  "vehicleId": "veh_789",
  "driverId": "drv_101",
  "scheduledStartTime": "07:00",
  "scheduledEndTime": "08:30",
  "operatingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "maxCapacity": 15
}
```

### GET /routes/:id
Get route details (includes stops)

**Response**:
```json
{
  "success": true,
  "data": {
    "route": {
      "id": "rte_123",
      "name": "Ruta Norte AM",
      "...": "..."
    },
    "stops": [
      {
        "id": "stp_456",
        "name": "Parada Calle 80",
        "order": 1,
        "latitude": -0.1807,
        "longitude": -78.4678,
        "scheduledTime": "07:15",
        "studentsAssigned": 3
      }
    ],
    "students": [
      {
        "id": "std_789",
        "firstName": "Juan",
        "lastName": "Pérez",
        "pickupStopId": "stp_456"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### PUT /routes/:id
Update route

### DELETE /routes/:id
Delete route (admin, super_admin)

---

## Route Stops

### GET /routes/:routeId/stops
List all stops for a route (ordered)

**Response**:
```json
{
  "success": true,
  "data": {
    "stops": [
      {
        "id": "stp_123",
        "routeId": "rte_456",
        "name": "Parada Calle 80",
        "address": "Calle 80 con Av. Principal",
        "landmark": "Frente al parque infantil",
        "latitude": -0.1807,
        "longitude": -78.4678,
        "scheduledTime": "07:15",
        "estimatedDwellTime": 5,
        "order": 1,
        "geofenceRadius": 100,
        "isPickupPoint": true,
        "isDropoffPoint": false,
        "maxStudents": 5,
        "currentStudents": 3,
        "hasTrafficLight": true,
        "hasZebraCrossing": true,
        "safetyRating": 5,
        "isActive": true,
        "createdAt": 1704988800000,
        "updatedAt": 1704988800000
      }
    ],
    "total": 1
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### POST /routes/:routeId/stops
Create new stop for route

**Request**:
```json
{
  "name": "Parada Calle 80",
  "address": "Calle 80 con Av. Principal",
  "landmark": "Frente al parque infantil",
  "latitude": -0.1807,
  "longitude": -78.4678,
  "scheduledTime": "07:15",
  "geofenceRadius": 100,
  "maxStudents": 5
}
```

### GET /routes/:routeId/stops/:stopId
Get stop details

### PUT /routes/:routeId/stops/:stopId
Update stop

### DELETE /routes/:routeId/stops/:stopId
Delete stop

### PUT /routes/:routeId/stops/reorder
Reorder stops

**Request**:
```json
{
  "stops": [
    { "id": "stp_123", "order": 1 },
    { "id": "stp_456", "order": 2 },
    { "id": "stp_789", "order": 3 }
  ]
}
```

---

## Student Routes

### POST /student-routes
Assign student to route

**Request**:
```json
{
  "studentId": "std_123",
  "routeId": "rte_456",
  "pickupStopId": "stp_789",
  "dropoffStopId": null,
  "operatingDays": ["monday", "tuesday", "wednesday", "thursday", "friday"],
  "pickupInstructions": "Esperar en la puerta azul",
  "specialRequirements": "Requiere silla de ruedas"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "sr_123",
    "studentId": "std_123",
    "routeId": "rte_456",
    "pickupStopId": "stp_789",
    "status": "active"
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### GET /student-routes/:id
Get student route assignment details

### PUT /student-routes/:id
Update student route assignment

### DELETE /student-routes/:id
Remove student from route

---

## Trips

### GET /trips
List trips (filtered by institution)

**Query Parameters**:
- `date` (optional): Filter by date (YYYY-MM-DD)
- `status` (optional): scheduled/in_progress/completed/cancelled/emergency
- `routeId` (optional): Filter by route
- `driverId` (optional): Filter by driver

**Response**:
```json
{
  "success": true,
  "data": {
    "trips": [
      {
        "id": "trp_123",
        "routeId": "rte_456",
        "driverId": "drv_789",
        "vehicleId": "veh_101",
        "scheduledDate": "2025-01-15",
        "scheduledStartTime": "07:00",
        "scheduledEndTime": "08:30",
        "actualStartTime": 1704988800000,
        "actualEndTime": null,
        "startLocation": {
          "latitude": -0.1807,
          "longitude": -78.4678
        },
        "endLocation": null,
        "status": "in_progress",
        "totalDistance": 0,
        "averageSpeed": 0,
        "totalStudentsPickedUp": 5,
        "totalStopsCompleted": 3,
        "punctualityScore": null,
        "driverNotes": null,
        "weatherConditions": "Soleado",
        "trafficConditions": "moderate",
        "preTripChecklist": {
          "vehicleInspection": true,
          "documentationCheck": true,
          "safetyEquipmentCheck": true,
          "communicationDeviceCheck": true,
          "completedAt": 1704988800000,
          "completedBy": "drv_789"
        },
        "createdAt": 1704988800000,
        "updatedAt": 1704988800000
      }
    ],
    "total": 1
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### POST /trips
Create new trip (scheduled)

**Request**:
```json
{
  "routeId": "rte_456",
  "driverId": "drv_789",
  "vehicleId": "veh_101",
  "scheduledDate": "2025-01-15",
  "scheduledStartTime": "07:00",
  "scheduledEndTime": "08:30"
}
```

### GET /trips/:id
Get trip details (includes real-time GPS, check-ins)

**Response**:
```json
{
  "success": true,
  "data": {
    "trip": {
      "id": "trp_123",
      "...": "..."
    },
    "currentLocation": {
      "latitude": -0.1807,
      "longitude": -78.4678,
      "speed": 35,
      "timestamp": 1704988800000
    },
    "checkins": [
      {
        "id": "chk_456",
        "studentId": "std_789",
        "studentName": "Juan Pérez",
        "checkinType": "pickup",
        "timestamp": 1704988800000,
        "stopName": "Parada Calle 80"
      }
    ],
    "nextStop": {
      "id": "stp_101",
      "name": "Parada Av. Principal",
      "scheduledTime": "07:30",
      "estimatedArrival": 1704988920000,
      "studentsWaiting": 2
    }
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### PUT /trips/:id
Update trip

### PUT /trips/:id/start
Start trip (driver action)

**Request**:
```json
{
  "latitude": -0.1807,
  "longitude": -78.4678
}
```

### PUT /trips/:id/complete
Complete trip (driver action)

**Request**:
```json
{
  "latitude": -0.1807,
  "longitude": -78.4678,
  "driverNotes": "Viaje completado sin incidentes"
}
```

### PUT /trips/:id/cancel
Cancel trip (admin action)

**Request**:
```json
{
  "reason": "Vehículo en mantenimiento"
}
```

### GET /trips/active
Get active trip for current user (driver or parent with studentId)

**Query Parameters**:
- `studentId` (optional, for parents): Get active trip for student

**Response**:
```json
{
  "success": true,
  "data": {
    "trip": {
      "id": "trp_123",
      "...": "..."
    },
    "currentLocation": {
      "latitude": -0.1807,
      "longitude": -78.4678,
      "timestamp": 1704988800000
    }
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

## GPS Tracking

### POST /trips/:tripId/location
Update GPS location (driver app)

**Request**:
```json
{
  "latitude": -0.1807,
  "longitude": -78.4678,
  "altitude": 2850,
  "accuracy": 10,
  "speed": 35,
  "heading": 180,
  "timestamp": 1704988800000
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "gps_123",
    "tripId": "trp_456",
    "latitude": -0.1807,
    "longitude": -78.4678,
    "geofenceAlerts": [
      {
        "stopId": "stp_789",
        "stopName": "Parada Calle 80",
        "message": "Has llegado a la parada"
      }
    ]
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### GET /trips/:tripId/location
Get current location

**Response**:
```json
{
  "success": true,
  "data": {
    "latitude": -0.1807,
    "longitude": -78.4678,
    "speed": 35,
    "heading": 180,
    "timestamp": 1704988800000,
    "serverTimestamp": 1704988800000,
    "estimatedArrival": {
      "nextStopId": "stp_789",
      "minutes": 5
    }
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### GET /trips/:tripId/location/history
Get GPS location history

**Query Parameters**:
- `startTime` (optional): Unix timestamp
- `endTime` (optional): Unix timestamp
- `limit` (optional): Results limit (default: 100)

**Response**:
```json
{
  "success": true,
  "data": {
    "points": [
      {
        "latitude": -0.1807,
        "longitude": -78.4678,
        "speed": 35,
        "timestamp": 1704988800000
      }
    ],
    "total": 50
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

---

## Student Check-ins

### POST /checkins
Record student check-in/check-out (driver app)

**Request**:
```json
{
  "tripId": "trp_123",
  "studentId": "std_456",
  "stopId": "stp_789",
  "checkinType": "pickup",
  "qrScanned": true,
  "latitude": -0.1807,
  "longitude": -78.4678,
  "timestamp": 1704988800000
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "id": "chk_123",
    "tripId": "trp_123",
    "studentId": "std_456",
    "studentName": "Juan Pérez",
    "checkinType": "pickup",
    "timestamp": 1704988800000,
    "parentNotified": true,
    "notificationSentAt": 1704988800000
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### POST /checkins/validate-qr
Validate QR code before check-in

**Request**:
```json
{
  "qrCode": "{\"studentId\":\"std_123\",\"institutionId\":\"inst_456\",\"timestamp\":1704988800000}",
  "routeId": "rte_789"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "valid": true,
    "student": {
      "id": "std_123",
      "firstName": "Juan",
      "lastName": "Pérez",
      "grade": "5to Grado",
      "photoUrl": "https://..."
    },
    "assignedToRoute": true
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### GET /checkins
List check-ins

**Query Parameters**:
- `tripId` (optional): Filter by trip
- `studentId` (optional): Filter by student
- `checkinType` (optional): pickup/dropoff

### GET /checkins/:id
Get check-in details

---

## Incidents

### GET /incidents
List incidents (filtered by institution)

**Query Parameters**:
- `type` (optional): accident/breakdown/behavior/emergency/medical/security/other
- `severity` (optional): low/medium/high/critical
- `status` (optional): open/investigating/pending_review/resolved/closed
- `tripId` (optional): Filter by trip

**Response**:
```json
{
  "success": true,
  "data": {
    "incidents": [
      {
        "id": "inc_123",
        "institutionId": "inst_456",
        "tripId": "trp_789",
        "reportedBy": "user_101",
        "assignedTo": null,
        "type": "breakdown",
        "severity": "medium",
        "category": "vehicle",
        "title": "Vehículo con llanta pinchada",
        "description": "Durante la ruta, el vehículo sufrió un pinchazo en la llanta trasera derecha.",
        "location": "Av. Principal con Calle 50",
        "latitude": -0.1807,
        "longitude": -78.4678,
        "incidentTime": 1704988800000,
        "reportedTime": 1704988800000,
        "studentsInvolved": [],
        "injuriesReported": false,
        "medicalAttentionRequired": false,
        "emergencyServicesNotified": false,
        "status": "open",
        "photos": ["https://..."],
        "documents": [],
        "createdAt": 1704988800000,
        "updatedAt": 1704988800000
      }
    ],
    "total": 1
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### POST /incidents
Create incident report

**Request**:
```json
{
  "type": "breakdown",
  "severity": "medium",
  "category": "vehicle",
  "title": "Vehículo con llanta pinchada",
  "description": "Durante la ruta, el vehículo sufrió un pinchazo...",
  "tripId": "trp_789",
  "latitude": -0.1807,
  "longitude": -78.4678,
  "medicalAttentionRequired": false,
  "emergencyServicesNotified": false
}
```

### GET /incidents/:id
Get incident details

### PUT /incidents/:id
Update incident

### PUT /incidents/:id/resolve
Mark incident as resolved

**Request**:
```json
{
  "resolutionSummary": "Llanta reemplazada, viaje continuado sin problemas",
  "correctiveActions": ["Inspeccionar llantas diariamente"],
  "preventiveMeasures": ["Programar rotación de llantas mensual"]
}
```

### POST /incidents/:id/upload-photo
Upload incident photo

---

## Notifications

### GET /notifications
Get user notifications

**Query Parameters**:
- `read` (optional): true/false (unread only)
- `type` (optional): info/warning/error/success/emergency
- `limit` (optional): Results limit

**Response**:
```json
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": "ntf_123",
        "userId": "user_456",
        "title": "Estudiante Recogido",
        "message": "Juan Pérez subió al bus a las 07:15 AM",
        "shortMessage": "Juan subió al bus",
        "type": "success",
        "category": "trip",
        "priority": "medium",
        "channels": {
          "inApp": true,
          "email": false,
          "push": true,
          "whatsapp": true,
          "sms": false
        },
        "sentAt": 1704988800000,
        "readAt": null,
        "status": "delivered",
        "relatedEntityType": "trip",
        "relatedEntityId": "trp_789",
        "actionRequired": false,
        "createdAt": 1704988800000
      }
    ],
    "total": 1,
    "unreadCount": 1
  },
  "meta": {
    "timestamp": "2025-01-15T10:30:00Z"
  }
}
```

### PUT /notifications/:id/read
Mark notification as read

### PUT /notifications/read-all
Mark all notifications as read

### DELETE /notifications/:id
Delete notification

---

## Error Codes Reference

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `BAD_REQUEST` | 400 | Invalid request parameters |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `VALIDATION_ERROR` | 422 | Input validation failed |
| `INTERNAL_ERROR` | 500 | Server error |
| `INSTITUTION_ACCESS_DENIED` | 403 | No access to this institution |
| `QR_INVALID` | 422 | Invalid QR code format |
| `QR_EXPIRED` | 422 | QR code expired |
| `STUDENT_NOT_ASSIGNED` | 422 | Student not assigned to route |
| `TRIP_NOT_ACTIVE` | 400 | Trip is not active |
| `GPS_UPDATE_FAILED` | 500 | Failed to update GPS location |

---

## Rate Limits

- **GPS updates**: Max 1 request per second per trip
- **General API**: Max 100 requests per minute per user
- **Bulk operations**: Max 10 requests per minute

---

## Webhooks

### Clerk User Events
- Endpoint: `POST /auth/sync`
- Events: user.created, user.updated, user.deleted

### WhatsApp Delivery Status
- Endpoint: `POST /webhooks/whatsapp`
- Events: message.sent, message.delivered, message.failed

---

## Additional Notes

1. **All timestamps** are Unix timestamps in milliseconds
2. **All coordinates** use decimal degrees (WGS84)
3. **All phone numbers** must be in E.164 format (+593XXXXXXXXX)
4. **Pagination** uses limit/offset (not cursor-based)
5. **Multi-tenancy** is enforced at API level (institutionId filtering)
6. **Real-time updates** use Convex subscriptions (not polling)

---

**API Version**: 1.0
**Last Updated**: January 2025

For implementation details, see [Technical-Specification.md](../../Technical-Specification.md).

For Bubble.io integration, see [docs/bubble/BUBBLE_SETUP_GUIDE.md](../bubble/BUBBLE_SETUP_GUIDE.md).
