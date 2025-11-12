# Infrastructure Setup Complete

**Date**: January 2025
**Status**: ✅ Ready for Development

---

## What Was Set Up

### 1. Convex Backend Configuration ✅

**Files Created:**
- [convex.json](../../convex.json) - Convex project configuration
- [convex/auth.config.ts](../../convex/auth.config.ts) - Clerk authentication integration
- [convex/auth.ts](../../convex/auth.ts) - Authentication helper functions with RBAC
- [convex/users.ts](../../convex/users.ts) - User management queries and mutations
- [convex/http.ts](../../convex/http.ts) - HTTP webhooks for Clerk user sync

**What It Does:**
- Database functions for user management
- Role-Based Access Control (RBAC) with 4 roles:
  - `super_admin` (level 1000) - Full platform access
  - `admin` (level 500) - Institution management
  - `driver` (level 100) - Trip operations
  - `parent` (level 10) - Read-only access
- Multi-tenancy enforcement (institution-scoped queries)
- Clerk webhook handler for automatic user synchronization

**Status:**
- ✅ Convex dev server working
- ⚠️ Clerk integration requires real API keys (currently using placeholders)

---

### 2. Next.js PWA (Driver App) ✅

**Files Created:**
- [mobile/.env.local](../../mobile/.env.local) - Environment variables for mobile app
- [mobile/middleware.ts](../../mobile/middleware.ts) - Route protection middleware
- [mobile/src/providers/ConvexClientProvider.tsx](../../mobile/src/providers/ConvexClientProvider.tsx) - Convex React provider with Clerk auth

**Files Modified:**
- [mobile/src/app/layout.tsx](../../mobile/src/app/layout.tsx) - Added ConvexClientProvider

**What It Does:**
- Protects routes requiring authentication
- Integrates Clerk for user authentication
- Connects to Convex backend for real-time data
- PWA-ready for offline capabilities

**Status:**
- ✅ Next.js dev server working
- ✅ Builds successfully
- ⚠️ Authentication requires real Clerk keys

---

### 3. Environment Configuration ✅

**Files Created/Updated:**
- [.env.local](../../.env.local) - Root environment variables
- [mobile/.env.local](../../mobile/.env.local) - Mobile app environment variables

**Current Configuration:**
```bash
# Convex (Working - Dev Deployment)
NEXT_PUBLIC_CONVEX_URL=https://agreeable-toad-644.convex.cloud
CONVEX_DEPLOYMENT=dev:agreeable-toad-644

# Clerk (Placeholder - Need Real Keys)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_placeholder_key_for_testing_only
CLERK_SECRET_KEY=sk_test_placeholder_secret_for_testing_only

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development
```

---

## How to Use

### Development Workflow

#### Start Backend (Convex)
```bash
npm run convex:dev
```

#### Start Frontend (Next.js PWA)
```bash
npm run dev:mobile
```

#### Start Both (Orchestrated)
```bash
npm run dev
```

#### Access Applications
- **Driver PWA**: http://localhost:3000
- **Convex Dashboard**: https://dashboard.convex.dev/d/agreeable-toad-644
- **Clerk Dashboard**: https://dashboard.clerk.com

---

## Next Steps

### To Enable Full Authentication:

#### 1. Get Clerk API Keys

1. Go to [Clerk Dashboard](https://dashboard.clerk.com)
2. Create or select "Altaviapp" application
3. Navigate to **API Keys** section
4. Copy:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

5. Update `.env.local` and `mobile/.env.local`:
   ```bash
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_publishable_key>
   CLERK_SECRET_KEY=<your_secret_key>
   ```

#### 2. Configure Clerk JWT Template

1. In Clerk Dashboard, go to **Configure > JWT Templates**
2. Click **New Template**
3. Name it: `convex`
4. Copy the **Issuer URL** (e.g., `https://your-domain.clerk.accounts.dev`)
5. Set in Convex Dashboard:
   - Go to: https://dashboard.convex.dev/d/agreeable-toad-644/settings/environment-variables
   - Add variable: `CLERK_JWT_ISSUER_DOMAIN`
   - Value: Your Issuer URL

#### 3. Set Up Clerk Webhook

1. In Clerk Dashboard, go to **Webhooks**
2. Click **Add Endpoint**
3. Endpoint URL: `https://agreeable-toad-644.convex.site/clerk-webhook`
4. Subscribe to events:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Save and copy the **Signing Secret**
6. (Optional) Set `CLERK_WEBHOOK_SECRET` in Convex for verification

#### 4. Test Authentication Flow

```bash
# Start both servers
npm run dev

# Open browser: http://localhost:3000
# Try signing up/signing in
# Check Convex dashboard for synced user data
```

---

## API Endpoints Available

### Health Check
```bash
GET https://agreeable-toad-644.convex.site/health
```

### API Info
```bash
GET https://agreeable-toad-644.convex.site/api
```

### Clerk Webhook (For Clerk only)
```bash
POST https://agreeable-toad-644.convex.site/clerk-webhook
```

---

## Convex Functions Available

### Queries (Read Operations)

- `users:getCurrentUserQuery` - Get authenticated user
- `users:getUserById` - Get user by ID (with RBAC check)
- `users:listUsers` - List users in institution (multi-tenant)

### Mutations (Write Operations)

- `users:updateUser` - Update user profile (with RBAC)

### Internal Mutations (Webhook Only)

- `users:syncUserFromClerk` - Sync user from Clerk webhook
- `users:deleteUserFromClerk` - Delete/deactivate user

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND                              │
├─────────────────────────────────────────────────────────┤
│  Next.js PWA (Driver App)                               │
│  - Port: 3000                                            │
│  - Clerk Auth UI                                         │
│  - Convex React Hooks                                    │
│  - Route Protection Middleware                           │
└───────────────┬─────────────────────────────────────────┘
                │
                │ (WebSocket + HTTPS)
                │
┌───────────────▼─────────────────────────────────────────┐
│                   CONVEX BACKEND                         │
├─────────────────────────────────────────────────────────┤
│  Deployment: agreeable-toad-644                          │
│  - Real-time Database                                    │
│  - Serverless Functions                                  │
│  - HTTP Endpoints (REST API)                             │
│  - Authentication (Clerk JWT)                            │
└───────────────┬─────────────────────────────────────────┘
                │
                │ (Webhooks)
                │
┌───────────────▼─────────────────────────────────────────┐
│                  CLERK AUTH                              │
├─────────────────────────────────────────────────────────┤
│  - User Management                                       │
│  - Sign In/Sign Up UI                                    │
│  - JWT Token Issuance                                    │
│  - Webhook Events                                        │
└─────────────────────────────────────────────────────────┘
```

---

## Testing Infrastructure

### Verify Convex
```bash
npx convex dev --once
# Should show: ✔ Convex functions ready!
```

### Verify Next.js
```bash
npm run dev:mobile
# Should show: ✓ Ready in 2s
# Open: http://localhost:3000
```

### Check Convex Functions
```bash
# In Convex Dashboard, open Functions tab
# Should see: auth, users, http modules
```

---

## Troubleshooting

### Issue: Convex functions fail with auth error
**Solution**: Temporarily disable auth by renaming `convex/auth.config.ts` to `convex/auth.config.ts.disabled`

### Issue: Next.js build fails with TypeScript errors
**Solution**: Run `npx next lint` to check for specific errors

### Issue: Middleware blocks all routes
**Solution**: Check that public routes are configured in `mobile/middleware.ts`

### Issue: Clerk webhook not receiving events
**Solution**:
1. Check webhook URL is correct
2. Verify Clerk webhook is subscribed to user events
3. Check Convex logs in dashboard

---

## Files Structure

```
altaviapp-platform/
├── convex/
│   ├── auth.config.ts       ✅ Clerk JWT config
│   ├── auth.ts              ✅ RBAC helpers
│   ├── users.ts             ✅ User management
│   ├── http.ts              ✅ Webhooks
│   └── schema.ts            ✅ Database schema (12 tables)
│
├── mobile/
│   ├── src/
│   │   ├── app/
│   │   │   └── layout.tsx   ✅ With providers
│   │   └── providers/
│   │       └── ConvexClientProvider.tsx  ✅
│   ├── middleware.ts        ✅ Route protection
│   └── .env.local           ✅ Environment vars
│
├── .env.local               ✅ Root environment
├── convex.json              ✅ Convex config
└── package.json             ✅ Scripts configured
```

---

## Summary

✅ **Infrastructure Status**: READY
✅ **Convex Backend**: WORKING (dev mode)
✅ **Next.js Frontend**: WORKING
✅ **Database Schema**: COMPLETE (12 tables)
✅ **Auth Framework**: CONFIGURED
⚠️ **Real Auth**: Requires Clerk API keys
⚠️ **Production**: Requires env var setup

---

## Ready for Module Implementation

You can now proceed with:

```bash
@state current          # Check what's next
@implement auth         # Start authentication module
```

**Next Module**: `auth` - Full authentication implementation with Clerk integration

**Estimated Time**: 1-2 days

---

**Infrastructure setup complete! 🚀**
