# CLAUDE.md - Altaviapp Agent Workflow Guide

**Altaviapp School Transport Management Platform**
**AI-Driven Development Workflow**
**Version**: 1.0
**Date**: January 2025

---

## Overview

This document defines the AI agent workflow for developing Altaviapp, following the **Agentic Development Framework**. Use this guide to implement modules efficiently with context-driven development and PR-based documentation.

**Key Principles:**
- Load context on demand (~2000 tokens active)
- Archive decisions in Pull Requests (not separate docs)
- Follow 3-step workflow: Plan → Implement → PR
- Single source of truth: PRD + Tech Spec + Database Schema

---

## Claude Development Rules

**These rules govern how Claude approaches all development work:**

### Planning & Verification
1. **Think first, plan in writing** - Before coding, analyze the problem, read relevant codebase files, and write a plan to `tasks/todo.md`
2. **Checkable todo list** - The plan must include a list of todo items that can be checked off as completed
3. **User approval required** - Before beginning implementation, check in with the user to verify the plan

### Implementation
4. **Track progress** - Work through todo items one by one, marking each as complete when done
5. **High-level explanations** - At every step, provide a brief high-level explanation of what changes were made
6. **Simplicity is paramount** - Make every task and code change as simple as possible. Avoid massive or complex changes. Every change should impact as little code as possible

### Completion
7. **Review section** - After completing work, add a review section to `tasks/todo.md` with a summary of changes and relevant information

### Mindset
8. **NEVER BE LAZY** - Do not be lazy. If there is a bug, find the root cause and fix it properly. No temporary fixes. You are a senior developer. Never take shortcuts
9. **MINIMAL IMPACT** - Make all fixes and code changes as simple as humanly possible. Changes should only impact code directly relevant to the task. Impact as little code as possible. The goal is zero introduced bugs. It's all about simplicity

---

## Development Method: PRD + Wireframes + Schema

For each module implementation, load context from these documents:

| Document | Location | Purpose |
|----------|----------|---------|
| **PRD** | [docs/PRD.md](docs/PRD.md) | WHAT to build (requirements) |
| **Wireframes** | [docs/design/](docs/design/) | HOW it looks (UI/UX) |
| **Schema** | [docs/database/DATABASE_SCHEMA.md](docs/database/DATABASE_SCHEMA.md) | DATA structure |
| **Tech Spec** | [Technical-Specification.md](Technical-Specification.md) | HOW to build (patterns) |

**Available Wireframe Documents:**
- [docs/design/ADMIN_WIREFRAMES.md](docs/design/ADMIN_WIREFRAMES.md) - Admin Dashboard UI
- [docs/design/PARENT_WIREFRAMES.md](docs/design/PARENT_WIREFRAMES.md) - Parent Portal UI
- [docs/design/CREW_WIREFRAMES.md](docs/design/CREW_WIREFRAMES.md) - Crew App UI (PWA)
- [docs/design/AUTH_WIREFRAMES.md](docs/design/AUTH_WIREFRAMES.md) - Authentication Flows

---

## Core Commands

### `@state current`
**Purpose**: Check project status and next steps

**Usage**:
```bash
@state current
```

**Output**:
- Git status (branch, uncommitted changes)
- Active module implementation progress
- Completed modules (from git log)
- Blockers or pending decisions
- Next recommended module
- Environment status (Convex, dependencies)

**When to use**:
- Starting work session
- Before implementing new module
- After merging PR

---

### `@implement <module>`
**Purpose**: Load context and implement a module

**Available Modules** (by phase):

**Phase 1 - Foundation:**
- `@implement auth` - Custom token-based auth, user management, RBAC
- `@implement api-core` - REST API framework, response format, error handling
- `@implement institutions` - Multi-tenant setup, institution CRUD

**Phase 2 - Backend APIs:**
- `@implement fleet-api` - Vehicles, drivers, monitors CRUD endpoints
- `@implement routes-api` - Routes, stops, assignments, geofencing
- `@implement students-api` - Students CRUD, QR generation
- `@implement trips-api` - Trip management, GPS tracking
- `@implement checkins-api` - Student check-in/out, notifications
- `@implement incidents-api` - Safety reports, emergency alerts

**Phase 3 - Frontends (Next.js PWA):**
- `@implement admin-app` - Admin Dashboard (Next.js PWA)
- `@implement parent-app` - Parent Portal (Next.js PWA)
- `@implement crew-app` - Crew App (Next.js PWA)
- `@implement auth-flows` - Complete authentication UI

**Usage**:
```bash
@implement auth           # Implement authentication module
@implement fleet-api      # Implement fleet management API
```

**Process**:
1. Load relevant sections from [docs/PRD.md](docs/PRD.md)
2. Load wireframes from [docs/design/](docs/design/) (matching module)
3. Load relevant tables from [docs/database/DATABASE_SCHEMA.md](docs/database/DATABASE_SCHEMA.md)
4. Apply patterns from [Technical-Specification.md](Technical-Specification.md)
5. Apply universal requirements (see below)
6. Confirm approach with user
7. Implement with incremental commits
8. Update active context in this file

---

### `@review`
**Purpose**: Review implementation against requirements

**Checks**:
- [ ] Feature matches [docs/PRD.md](docs/PRD.md) requirements
- [ ] Database schema aligned with [docs/database/DATABASE_SCHEMA.md](docs/database/DATABASE_SCHEMA.md)
- [ ] Tech stack follows [Technical-Specification.md](Technical-Specification.md)
- [ ] Universal requirements implemented (see checklist below)
- [ ] TypeScript type safety (strict mode)
- [ ] Zod validation for all inputs
- [ ] Tests written and passing
- [ ] No console errors or warnings

**Usage**:
```bash
@review
```

**Output**: Issues found with suggested fixes

---

### `@pr create <module>`
**Purpose**: Generate comprehensive pull request

**Usage**:
```bash
@pr create auth          # Create PR for authentication module
@pr create fleet-api     # Create PR for fleet API
```

**Process**:
1. Review all changes (`git diff main`)
2. Verify module completion against [docs/PRD.md](docs/PRD.md)
3. Generate PR description using template
4. Create PR with GitHub CLI or provide description

**PR Template**: See [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md)

---

## Universal Requirements Checklist

**Every module implementation MUST apply these requirements:**

### Multi-Tenancy
- [ ] All queries filter by `institutionId`
- [ ] No cross-institution data access
- [ ] Row-level security enforced
- [ ] Institution context validated on every request

### Role-Based Access Control (RBAC)
- [ ] `super_admin` (level 1000) - Full platform access
- [ ] `admin` (level 500) - Institution management
- [ ] `monitor` (level 150) - Student check-in, incident reporting
- [ ] `driver` (level 100) - Trip operations only
- [ ] `parent` (level 10) - Read-only, own students only
- [ ] Role verification before all mutations

### Real-Time Capabilities
- [ ] Convex live queries for GPS tracking (updates every 15s)
- [ ] Convex subscriptions for trip status
- [ ] WebSocket connections for real-time notifications
- [ ] Optimistic UI updates where applicable

### Internationalization (i18n)
- [ ] Spanish (es) as primary language
- [ ] English (en) support
- [ ] Timezone: `America/Guayaquil` (Ecuador)
- [ ] Date format: DD/MM/YYYY
- [ ] Time format: 24-hour (HH:mm)

### Phone Number Validation
- [ ] Ecuador format: `+593XXXXXXXXX` (13 characters)
- [ ] Regex: `/^\+593\d{9}$/`
- [ ] WhatsApp-compatible format

### QR Code System
- [ ] Unique per student (JSON-encoded metadata)
- [ ] Contains: `{ studentId, institutionId, timestamp }`
- [ ] Generated on student creation
- [ ] Validated before check-in

### Tech Stack Standards
- [ ] Convex for database and real-time
- [ ] Custom token-based authentication (bcrypt + sessions)
- [ ] Next.js 14+ PWA for all frontends (Admin, Parent, Crew)
- [ ] Turborepo for monorepo management
- [ ] pnpm for package management
- [ ] shadcn/ui for UI components
- [ ] Google Maps API for all geospatial features
- [ ] TypeScript strict mode
- [ ] Zod for input validation
- [ ] Service Workers for offline support (all apps)

### Google Maps API Features
- [ ] Maps JavaScript API - Interactive maps in all apps
- [ ] Directions API - Route calculation and optimization
- [ ] Geocoding API - Address to coordinates conversion
- [ ] Distance Matrix API - Travel time and distance calculations
- [ ] Places API - Address autocomplete and search
- [ ] Geolocation API - Device location tracking
- [ ] Roads API - Snap GPS points to roads
- [ ] @react-google-maps/api for React integration

### Performance Requirements
- [ ] GPS location updates: < 1 second
- [ ] QR code scanning: < 500ms
- [ ] API response time: < 500ms (95th percentile)
- [ ] Map rendering: < 3 seconds
- [ ] Uptime target: 99.9%

### Security
- [ ] HTTPS everywhere
- [ ] Session token validation (custom auth)
- [ ] Password hashing (bcrypt)
- [ ] Input sanitization (Zod schemas)
- [ ] No sensitive data in logs
- [ ] XSS prevention
- [ ] CSRF protection

### Offline Support (All PWA Apps)
- [ ] Service worker for offline mode
- [ ] IndexedDB for local data cache
- [ ] Background sync for data changes
- [ ] Offline-first architecture
- [ ] PWA manifest for installability
- [ ] Push notifications support

### Error Handling
- [ ] Standard error response format
- [ ] User-friendly error messages (Spanish)
- [ ] Error logging to console (dev) / monitoring (prod)
- [ ] Graceful degradation

---

## Frontend Design System

**All frontend apps MUST follow these design patterns for consistency:**

### Brand Colors (Tailwind CSS)
```css
/* Primary - Altaviapp Blue */
--primary: #042940;
--primary-foreground: #F7FCFF;

/* Accent - Altaviapp Lime */
--accent: #DBF227;
--accent-foreground: #042940;

/* Status Colors */
--success: #10B981;  /* Green */
--info: #3B82F6;     /* Blue */
--warning: #F59E0B;  /* Orange */
--error: #EF4444;    /* Red */
```

### Component Structure (per app)
```
apps/{app-name}/src/
├── lib/
│   └── utils.ts              # cn(), getGreeting(), formatDate()
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx       # Desktop sidebar with branding
│   │   ├── Header.tsx        # Top header with title & notifications
│   │   └── MobileNav.tsx     # Bottom navigation for mobile
│   ├── shared/
│   │   ├── LoadingState.tsx  # Skeleton loaders (card, list, page variants)
│   │   ├── StatusBadge.tsx   # Status indicators
│   │   └── EmptyState.tsx    # Empty state placeholders
│   └── dashboard/
│       └── [feature-specific components]
├── app/
│   ├── layout.tsx            # Root layout (no providers for UI testing)
│   ├── page.tsx              # Root redirect
│   ├── globals.css           # Tailwind + CSS variables
│   └── (dashboard)/
│       ├── layout.tsx        # Dashboard layout with Sidebar/Header/MobileNav
│       └── [pages]
```

### Sidebar Pattern (All Apps)
```tsx
// Structure for all apps
<aside className="w-60 bg-primary min-h-screen flex flex-col">
  {/* Logo Section */}
  <div className="p-6">
    <Icon /> {/* App-specific: Truck (Crew), GraduationCap (Parent), Shield (Admin) */}
    <span>Altaviapp</span>
    <span>{appSubtitle}</span> {/* "Crew App", "Portal Padres", "Admin" */}
  </div>

  {/* User Profile */}
  <div className="px-6 py-4 border-b border-primary-foreground/10">
    <Avatar initials={userInitials} />
    <span>{userName}</span>
    <RoleBadge role={userRole} />
  </div>

  {/* Navigation */}
  <nav className="flex-1 px-3 py-4">
    {navItems.map(item => <NavLink />)}
  </nav>

  {/* Footer Actions */}
  <div className="px-3 py-4 border-t">
    <SettingsLink />
    <LogoutButton />
  </div>
</aside>
```

### App-Specific Configurations

| App | Icon | Subtitle | Role Badge Color |
|-----|------|----------|------------------|
| Crew | `Truck` | "Crew App" | Driver: blue, Monitor: green, Admin: purple |
| Parent | `GraduationCap` | "Portal Padres" | Parent: blue |
| Admin | `Shield` | "Administración" | Admin: purple, SuperAdmin: red |

### Card Styling
```tsx
// Standard card pattern
<div className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-md transition-shadow">
  {/* Content */}
</div>

// Status card pattern (inside main card)
<div className={cn('mt-4 p-3 rounded-lg', statusBgColor)}>
  <Icon className={statusTextColor} />
  <span>{statusLabel}</span>
</div>
```

### Status Color Mapping
| Status | Background | Text | Icon |
|--------|------------|------|------|
| in_transit | `bg-blue-50` | `text-blue-700` | Bus |
| at_school | `bg-green-50` | `text-green-700` | CheckCircle |
| at_home | `bg-gray-50` | `text-gray-700` | Home |
| returning | `bg-orange-50` | `text-orange-700` | Bus |
| scheduled | `bg-yellow-50` | `text-yellow-700` | Clock |

### Mobile Navigation Pattern
```tsx
<nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t safe-area-pb">
  <div className="flex items-center justify-around px-2 py-2">
    {navItems.slice(0, 5).map(item => (
      <Link className={cn(
        'flex flex-col items-center gap-1 px-3 py-2 rounded-lg',
        isActive ? 'text-primary' : 'text-gray-600'
      )}>
        <Icon className={isActive ? 'text-accent' : ''} />
        <span className="text-xs font-medium">{label}</span>
      </Link>
    ))}
  </div>
</nav>
```

### Required CSS Variables (globals.css)
```css
@layer base {
  :root {
    /* Must include all these for consistency */
    --primary: 200 98% 13%;
    --primary-foreground: 195 100% 97%;
    --accent: 66 87% 56%;
    --accent-foreground: 200 98% 13%;
    --success: 158 64% 52%;
    --info: 217 91% 60%;
    --warning: 38 92% 50%;
    --error: 0 72% 51%;
    --background: 195 100% 97%;
    --foreground: 220 13% 9%;
  }
}

.safe-area-pb {
  padding-bottom: env(safe-area-inset-bottom, 0px);
}
```

### UI Testing Mode
For testing UI without authentication:
```tsx
// In layout.tsx - remove providers
export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {/* Auth and Convex providers disabled for UI testing */}
        {children}
      </body>
    </html>
  );
}

// In components - use mock data
const mockUser = {
  name: 'Test User',
  email: 'test@test.com',
  role: 'driver' as const,
};
```

---

## Context Management Rules

### Active Context Limit: ~2000 tokens

**What to Keep in Active Context:**
- Current module being implemented
- Immediate next steps
- Active blockers or decisions
- Current file being edited

**What to Load On Demand:**
- Module specs from [docs/PRD.md](docs/PRD.md)
- Relevant tables from [docs/database/DATABASE_SCHEMA.md](docs/database/DATABASE_SCHEMA.md)
- Patterns from [Technical-Specification.md](Technical-Specification.md)
- API endpoints from [docs/api/API_ENDPOINTS.md](docs/api/API_ENDPOINTS.md)

**What NOT to Load:**
- Completed modules (archived in PRs)
- Entire PRD (load sections only)
- Full database schema (load tables as needed)
- Implementation details of other modules

### Archive Strategy

**Use Git + PRs as Archive:**
- Git commits document incremental progress
- PR descriptions archive implementation decisions
- No separate planning or implementation log docs

**Example**:
```
MODULE: auth
├── Git commits (10-15 commits)
│   ├── feat(auth): initialize token-based auth
│   ├── feat(auth): add session management
│   ├── feat(auth): implement RBAC helpers
│   └── ...
└── PR #1: feat: implement authentication module
    └── Complete context in PR description
```

---

## Implementation Workflow

### Step 1: Plan (5-15 minutes)

```bash
# Check current state
@state current

# Create feature branch
git checkout -b feature/module-name

# Load context and plan
@implement module-name

# Agent confirms:
# - Module scope from PRD
# - Database tables needed
# - Tech patterns to apply
# - Estimated commits: X-Y
# - Estimated time: X days

# User approves or adjusts
```

### Step 2: Implement (1-5 days)

```bash
# Agent implements with incremental commits
# User tests locally during implementation

# Incremental commits example:
# Commit 1: feat(auth): initialize session management
# Commit 2: feat(auth): add login/register endpoints
# Commit 3: feat(auth): create user mutations
# Commit 4: feat(schema): add users table indexes
# Commit 5: feat(auth): implement RBAC middleware
# ...

# Agent applies universal requirements checklist
# Agent follows Technical-Specification.md patterns
```

### Step 3: PR (10-30 minutes)

```bash
# Review implementation
@review

# Fix any issues found
# Run tests
npm test

# Create PR
@pr create module-name

# Agent generates comprehensive PR description
# Push and create PR on GitHub
git push origin feature/module-name
gh pr create --title "feat: implement module-name" --body "[generated]"

# After merge, return to main and check state
git checkout main
git pull origin main
@state current
```

---

## Module Dependencies

Follow this implementation order. Each module depends on previous ones in its phase.

### Phase 1 - Foundation (Weeks 1-3)
```
auth (Week 1)
  ↓
api-core (Week 1-2)
  ↓
institutions (Week 2-3)
```

**Cannot start Phase 2 without Phase 1 complete.**

### Phase 2 - Backend APIs (Weeks 4-9)
```
institutions (from Phase 1)
  ↓
  ├─→ fleet-api (Week 4)
  ├─→ students-api (Week 5)
  └─→ routes-api (Week 5-6)
        ↓
      trips-api (Week 7)
        ↓
        ├─→ checkins-api (Week 8)
        └─→ incidents-api (Week 9)
```

**Can parallelize**: fleet-api, students-api (different branches)
**Cannot start Phase 3 without Phase 2 complete.**

### Phase 3 - Frontends (Weeks 10-12)
```
All Phase 2 APIs complete
  ↓
  ├─→ admin-app (Week 10-11)
  ├─→ parent-app (Week 11)
  └─→ crew-app (Week 12)
```

**Can parallelize**: All three frontends (different branches)

**Project Structure**:
```
/apps/
├── admin/     # Admin Dashboard (Next.js PWA)
├── parent/    # Parent Portal (Next.js PWA)
└── crew/      # Crew App (Next.js PWA) - Base para todas las apps
/packages/
├── ui/        # Shared UI components (shadcn/ui)
├── auth/      # Shared auth utilities
├── pwa/       # Shared PWA utilities (service worker, manifest)
└── convex-client/  # Shared Convex hooks & types
```

**Base de desarrollo**: El código existente en `/mobile/` (Crew App) sirve como base para todas las apps PWA.

**Full dependency map**: See [docs/modules/IMPLEMENTATION_ORDER.md](docs/modules/IMPLEMENTATION_ORDER.md)

---

## Git Commit Convention

**Format**: `type(scope): message`

**Types**:
- `feat` - New feature
- `fix` - Bug fix
- `refactor` - Code refactoring
- `docs` - Documentation only
- `test` - Adding tests
- `chore` - Maintenance tasks

**Scopes** (module-based):
- `auth` - Authentication
- `api` - API framework
- `schema` - Database schema
- `fleet` - Fleet management
- `routes` - Route management
- `students` - Student management
- `trips` - Trip operations
- `checkins` - Check-in system
- `incidents` - Incident management
- `ui` - UI components
- `pwa` - PWA-specific
- `admin` - Admin Dashboard
- `parent` - Parent Portal
- `crew` - Crew App

**Examples**:
```bash
feat(auth): add session management
feat(schema): add vehicles table with indexes
feat(api): implement standard error response format
fix(trips): correct GPS tracking interval
refactor(routes): optimize geofencing calculation
feat(admin): add fleet management dashboard
feat(crew): implement trip checklist
test(checkins): add QR validation tests
```

---

## Quick Reference

### Starting New Module
```bash
@state current                          # Check what's next
git checkout -b feature/module-name     # Create branch
@implement module-name                  # Load context & implement
```

### During Implementation
```bash
git log --oneline                       # View commit history
@review                                 # Check implementation
npm run dev                            # Test locally
```

### Completing Module
```bash
@review                                 # Final review
npm test                               # Run tests
@pr create module-name                 # Generate PR
git push origin feature/module-name    # Push to GitHub
# Create PR with generated description
```

### After PR Merge
```bash
git checkout main
git pull origin main
@state current                         # Check state, next module
```

---

## Troubleshooting

### Issue: Module too complex for one PR
**Solution**: Break into smaller features
```bash
# Instead of:
@implement trips-api

# Do:
@implement trips-api-basic      # PR 1: Core trip CRUD
@implement trips-api-gps        # PR 2: GPS tracking
@implement trips-api-realtime   # PR 3: Real-time queries
```

### Issue: Database schema change breaking existing code
**Solution**: Use Convex migrations
```bash
# 1. Update schema in convex/schema.ts
# 2. Test locally (npx convex dev)
# 3. Verify existing queries work
# 4. Include migration notes in PR
# 5. Deploy to production with care
```

### Issue: Unclear requirement in PRD
**Solution**: Reference full context chain
```bash
# 1. Check docs/PRD.md - module section
# 2. Check Technical-Specification.md - implementation pattern
# 3. Check docs/database/DATABASE_SCHEMA.md - data model
# 4. Ask stakeholder if still unclear
```

### Issue: Conflicting modules or dependencies
**Solution**: Check implementation order
```bash
# Reference: docs/modules/IMPLEMENTATION_ORDER.md
# Cannot implement trips-api without routes-api
# Follow dependency chain
```

---

## Deployment (Vercel + Convex)

### Infrastructure Overview

| Service | Environment | URL |
|---------|-------------|-----|
| **Convex (Dev)** | Development | `https://abundant-mastiff-673.convex.cloud` |
| **Convex (Prod)** | Production | `https://wooden-armadillo-937.convex.cloud` |
| **Admin App** | Production | `https://altaviapp-admin.vercel.app` (or `admin.altaviapp.com`) |
| **Crew App** | Production | `https://altaviapp-crew.vercel.app` (or `crew.altaviapp.com`) |
| **Parent App** | Production | `https://altaviapp-parent.vercel.app` (or `padres.altaviapp.com`) |
| **Email (Resend)** | Production | `noreply@altaviapp.com` |

### Vercel Project Configuration

Each app has its own Vercel project with these settings:

| Setting | Value |
|---------|-------|
| **Framework** | Next.js |
| **Root Directory** | `apps/{admin\|crew\|parent}` |
| **Build Command** | `cd ../.. && pnpm build --filter=@altaviapp/{app}` |
| **Install Command** | `cd ../.. && pnpm install` |

### Environment Variables (Vercel)

Required for all apps:
```bash
NEXT_PUBLIC_CONVEX_URL=https://wooden-armadillo-937.convex.cloud
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-key>
NEXT_PUBLIC_APP_URL=https://{subdomain}.altaviapp.com
```

### Deployment Commands

```bash
# Deploy to Convex Production
npx convex deploy --yes

# Push to GitHub (triggers Vercel auto-deploy)
git push origin main

# Check Convex environment variables
npx convex env list
npx convex env set RESEND_API_KEY <key>
```

### CI/CD Flow

1. **Local Development**: Test with `pnpm dev` and `npx convex dev`
2. **Commit & Push**: `git push origin main`
3. **Auto-Deploy**: Vercel detects push and rebuilds affected apps
4. **Convex Deploy**: Run `npx convex deploy` for backend changes

### DNS Configuration (Pending)

Custom domains in Namecheap (CNAME records):
```
admin  → cname.vercel-dns.com
crew   → cname.vercel-dns.com
padres → cname.vercel-dns.com
```

### Common Deployment Issues

**Build fails with missing env vars:**
- Add `NEXT_PUBLIC_CONVEX_URL` to Vercel project settings

**Security vulnerability warnings:**
- Update Next.js: `"next": "^16.0.10"` or latest patched version
- Run `pnpm install` and push

**Convex changes not reflecting:**
- Run `npx convex deploy --yes` to push backend changes

---

## Additional Resources

### Core Documents
- [docs/PRD.md](docs/PRD.md) - Product requirements (WHAT to build)
- [Technical-Specification.md](Technical-Specification.md) - Tech patterns (HOW to build)
- [docs/database/DATABASE_SCHEMA.md](docs/database/DATABASE_SCHEMA.md) - Data model (DATA structure)
- [docs/dev/Tech-Stack-Standard.md](docs/dev/Tech-Stack-Standard.md) - Ceibatic tech standards

### Wireframes (UI/UX)
- [docs/design/ADMIN_WIREFRAMES.md](docs/design/ADMIN_WIREFRAMES.md) - Admin Dashboard UI
- [docs/design/PARENT_WIREFRAMES.md](docs/design/PARENT_WIREFRAMES.md) - Parent Portal UI
- [docs/design/CREW_WIREFRAMES.md](docs/design/CREW_WIREFRAMES.md) - Crew App UI (PWA)
- [docs/design/AUTH_WIREFRAMES.md](docs/design/AUTH_WIREFRAMES.md) - Authentication flows

### API Reference
- [docs/api/API_ENDPOINTS.md](docs/api/API_ENDPOINTS.md) - Complete API reference

### Implementation Guides
- [docs/modules/IMPLEMENTATION_ORDER.md](docs/modules/IMPLEMENTATION_ORDER.md) - Module dependencies
- [docs/modules/MODULE_CHECKLIST.md](docs/modules/MODULE_CHECKLIST.md) - Per-module requirements
- [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) - PR template

### Deployment
- [docs/deployment/VERCEL_DEPLOYMENT.md](docs/deployment/VERCEL_DEPLOYMENT.md) - Vercel + Convex deployment guide

---

## Success Metrics

### Context Efficiency
- **Active context**: <2000 tokens (80% reduction)
- **Core docs**: 4 files (PRD, Tech Spec, Schema, CLAUDE.md)
- **Planning docs**: 0 (PR-based archive)
- **Context load time**: <5 seconds

### Development Velocity
- **Module planning**: <30 minutes
- **Module implementation**: 1-5 days
- **PR creation**: <10 minutes
- **Context switching**: <5 minutes

### Quality
- **Type safety**: 100% (TypeScript strict)
- **Universal requirements**: 100% (verified in @review)
- **Test coverage**: Per module requirements
- **PR review time**: <1 hour

---

**Ready to build Altaviapp efficiently! 🚌🚀**

Use `@state current` to begin.
