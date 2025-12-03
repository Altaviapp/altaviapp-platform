# Convex Deployment Information for Bubble.io

**Project**: Altaviapp Platform
**Last Updated**: November 2025
**Status**: ✅ READY FOR BUBBLE INTEGRATION

---

## Deployment Details

### Development Environment (Current)
- **Deployment URL**: `https://abundant-mastiff-673.convex.cloud`
- **API Base URL**: `https://abundant-mastiff-673.convex.site`
- **Team**: cristian-meneses-44876
- **Project**: altaviapp-platform
- **Environment**: Development

### Deployment Status
✅ **Backend**: Deployed and running
✅ **Database**: 12 tables ready
✅ **HTTP Endpoints**: 3 endpoints active
✅ **Authentication**: Clerk integration configured

---

## Available Endpoints

### 1. Health Check
**URL**: `https://abundant-mastiff-673.convex.site/health`
**Method**: GET
**Authentication**: None required

**Response**:
```json
{
  "status": "healthy",
  "timestamp": "2025-11-12T20:30:04.957Z",
  "service": "Altaviapp Convex Backend"
}
```

**Use in Bubble**: Test API connectivity

---

### 2. API Information
**URL**: `https://abundant-mastiff-673.convex.site/api`
**Method**: GET
**Authentication**: None required

**Response**:
```json
{
  "name": "Altaviapp API",
  "version": "1.0.0",
  "description": "School transport management platform API",
  "endpoints": {
    "health": "/health",
    "clerkWebhook": "/clerk-webhook"
  },
  "documentation": "https://github.com/your-repo/docs/api"
}
```

**Use in Bubble**: Check API version and available endpoints

---

### 3. Clerk User Sync Webhook
**URL**: `https://abundant-mastiff-673.convex.site/clerk-webhook`
**Method**: POST
**Authentication**: Clerk webhook signature

**Purpose**: Automatically sync users from Clerk to Convex database

**Setup in Clerk Dashboard**:
1. Go to https://dashboard.clerk.com
2. Navigate to: **Webhooks**
3. Click: **Add Endpoint**
4. Endpoint URL: `https://abundant-mastiff-673.convex.site/clerk-webhook`
5. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`

---

## Database Schema

All 12 tables are deployed and ready:

1. **users** - User accounts with RBAC
2. **institutions** - Schools/Organizations (multi-tenancy)
3. **vehicles** - Fleet vehicles
4. **drivers** - Driver profiles
5. **students** - Student records with QR codes
6. **routes** - Transport routes
7. **routeStops** - Route stops with geolocation
8. **studentRoutes** - Student-route assignments
9. **trips** - Active and historical trips
10. **gpsTracking** - Real-time GPS locations
11. **studentCheckins** - Check-in/check-out records
12. **incidents** - Safety incident reports
13. **notifications** - User notifications

---

## Bubble.io API Connector Setup

### Step 1: Initialize API Connector

1. In Bubble editor, go to: **Plugins**
2. Click: **Add plugins**
3. Search and install: **API Connector**

### Step 2: Add Convex API

1. Open: **API Connector**
2. Click: **Add another API**
3. **API Name**: `Convex Altaviapp API`

### Step 3: Configure API Settings

**Shared headers for all calls**:
```
Content-Type: application/json
Accept: application/json
```

### Step 4: Add API Calls

#### Example: Health Check Call

1. **Name**: `Get Health Status`
2. **Use as**: Data
3. **Data type**: JSON
4. **Method**: GET
5. **URL**: `https://abundant-mastiff-673.convex.site/health`
6. Click: **Initialize call**
7. Verify response structure

#### Example: Get API Info

1. **Name**: `Get API Info`
2. **Use as**: Data
3. **Data type**: JSON
4. **Method**: GET
5. **URL**: `https://abundant-mastiff-673.convex.site/api`
6. Click: **Initialize call**

---

## Next Steps: REST API Endpoints

### Coming Soon (To Be Implemented)

The following REST endpoints will be added for full Bubble integration:

#### Institutions API (5 endpoints)
- `GET /institutions` - List institutions
- `POST /institutions` - Create institution
- `GET /institutions/:id` - Get institution details
- `PUT /institutions/:id` - Update institution
- `DELETE /institutions/:id` - Delete institution

#### Vehicles API (6 endpoints)
- `GET /vehicles` - List vehicles
- `POST /vehicles` - Create vehicle
- `GET /vehicles/:id` - Get vehicle details
- `PUT /vehicles/:id` - Update vehicle
- `DELETE /vehicles/:id` - Delete vehicle
- `POST /vehicles/:id/upload-document` - Upload documents

#### Students API (7 endpoints)
- `GET /students` - List students
- `POST /students` - Create student
- `GET /students/:id` - Get student details
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student
- `GET /students/:id/qr` - Get QR code
- `POST /students/:id/regenerate-qr` - Regenerate QR

#### ... and 50+ more endpoints

**Total REST APIs Planned**: ~70 endpoints

---

## Authentication with Bubble

### Option 1: Use Clerk Plugin (Recommended)

1. Install: **Clerk** plugin in Bubble
2. Configure with Clerk publishable key
3. Convex automatically validates Clerk JWT tokens
4. No additional auth configuration needed in API Connector

### Option 2: Direct API Authentication (Future)

When implementing custom auth endpoints:
- Bearer token authentication
- Token passed in header: `Authorization: Bearer <token>`

---

## Testing the Deployment

### Test 1: Health Check
```bash
curl https://abundant-mastiff-673.convex.site/health
```

Expected response: `200 OK` with health status

### Test 2: API Info
```bash
curl https://abundant-mastiff-673.convex.site/api
```

Expected response: `200 OK` with API details

### Test 3: From Bubble

1. Set up health check API call in API Connector
2. Add a button in Bubble with action: "Get Health Status"
3. Display response in a text element
4. Should show: "healthy" status

---

## Environment Variables (Bubble Side)

Store these in Bubble Settings > App Settings > Environment Variables:

```
CONVEX_API_BASE_URL = https://abundant-mastiff-673.convex.site
API_VERSION = 1.0.0
```

Use in API calls: `<CONVEX_API_BASE_URL>/health`

---

## Production Deployment (Future)

When ready to deploy to production:

1. Deploy Convex to production: `npx convex deploy --prod`
2. Get production URL (will be different from dev)
3. Update all Bubble API Connector URLs
4. Test in Bubble production environment
5. Go live!

**Current**: Development environment
**Future**: Production environment with separate URL

---

## Support & Documentation

- **Convex Dashboard**: https://dashboard.convex.dev/d/abundant-mastiff-673
- **API Endpoints Reference**: [docs/api/API_ENDPOINTS.md](../api/API_ENDPOINTS.md)
- **Bubble Setup Guide**: [BUBBLE_SETUP_GUIDE.md](./BUBBLE_SETUP_GUIDE.md)
- **Technical Specification**: [../../Technical-Specification.md](../../Technical-Specification.md)

---

## Summary

✅ **Status**: Ready for Bubble integration
✅ **Base URL**: `https://abundant-mastiff-673.convex.site`
✅ **Endpoints Active**: 3 (health, api, webhook)
✅ **Database**: 12 tables deployed
⏳ **REST APIs**: To be implemented (~70 endpoints)

**Next Step**: Implement REST API endpoints for Bubble CRUD operations

---

**Last tested**: November 12, 2025
**Deployment**: abundant-mastiff-673 (dev)
