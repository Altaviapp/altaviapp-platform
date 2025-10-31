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
- Environment status (Convex, Clerk, dependencies)

**When to use**:
- Starting work session
- Before implementing new module
- After merging PR

---

### `@implement <module>`
**Purpose**: Load context and implement a module

**Available Modules** (by phase):

**Phase 1 - Foundation:**
- `@implement auth` - Clerk integration, user sync, RBAC
- `@implement api-core` - REST API framework, response format, error handling
- `@implement institutions` - Multi-tenant setup, institution CRUD

**Phase 2 - Backend APIs:**
- `@implement fleet-api` - Vehicles, drivers CRUD endpoints
- `@implement routes-api` - Routes, stops, assignments, geofencing
- `@implement students-api` - Students CRUD, QR generation
- `@implement trips-api` - Trip management, GPS tracking
- `@implement checkins-api` - Student check-in/out, notifications
- `@implement incidents-api` - Safety reports, emergency alerts

**Phase 3 - Frontends:**
- `@implement bubble-admin` - Admin dashboard (Bubble.io)
- `@implement bubble-parent` - Parent portal (Bubble.io)
- `@implement driver-pwa` - Driver mobile app (Next.js PWA)

**Usage**:
```bash
@implement auth           # Implement authentication module
@implement fleet-api      # Implement fleet management API
```

**Process**:
1. Load relevant sections from [docs/PRD.md](docs/PRD.md)
2. Load relevant tables from [docs/database/DATABASE_SCHEMA.md](docs/database/DATABASE_SCHEMA.md)
3. Apply patterns from [Technical-Specification.md](Technical-Specification.md)
4. Apply universal requirements (see below)
5. Confirm approach with user
6. Implement with incremental commits
7. Update active context in this file

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

### `@bubble-setup <feature>`
**Purpose**: Generate Bubble.io API integration instructions

**Usage**:
```bash
@bubble-setup vehicles   # Generate Bubble setup for vehicles
@bubble-setup tracking   # Generate Bubble setup for GPS tracking
```

**Output**: Step-by-step non-technical guide for connecting Bubble to API endpoints

**Reference**: [docs/bubble/BUBBLE_SETUP_GUIDE.md](docs/bubble/BUBBLE_SETUP_GUIDE.md)

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
- [ ] Clerk for authentication
- [ ] Next.js 14+ for PWA (driver app)
- [ ] Bubble.io for admin/parent UI
- [ ] TypeScript strict mode
- [ ] Zod for input validation

### Performance Requirements
- [ ] GPS location updates: < 1 second
- [ ] QR code scanning: < 500ms
- [ ] API response time: < 500ms (95th percentile)
- [ ] Map rendering: < 3 seconds
- [ ] Uptime target: 99.9%

### Security
- [ ] HTTPS everywhere
- [ ] JWT token validation (Clerk)
- [ ] Input sanitization (Zod schemas)
- [ ] No sensitive data in logs
- [ ] XSS prevention
- [ ] CSRF protection

### Offline Support (PWA only)
- [ ] Service worker for offline mode
- [ ] IndexedDB for local data cache
- [ ] Background sync for check-ins
- [ ] GPS data queuing when offline

### Error Handling
- [ ] Standard error response format
- [ ] User-friendly error messages (Spanish)
- [ ] Error logging to console (dev) / monitoring (prod)
- [ ] Graceful degradation

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
│   ├── feat(auth): initialize Clerk integration
│   ├── feat(auth): add user sync webhook
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
# Commit 1: feat(auth): initialize Clerk SDK
# Commit 2: feat(auth): add webhook handler
# Commit 3: feat(auth): create user sync mutation
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
  ├─→ bubble-admin (Week 10-11)
  ├─→ bubble-parent (Week 11)
  └─→ driver-pwa (Week 12)
```

**Can parallelize**: All three frontends (different branches)

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
- `bubble` - Bubble.io integration

**Examples**:
```bash
feat(auth): add Clerk webhook handler
feat(schema): add vehicles table with indexes
feat(api): implement standard error response format
fix(trips): correct GPS tracking interval
refactor(routes): optimize geofencing calculation
docs(bubble): add vehicle management setup guide
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

## Additional Resources

### Core Documents
- [docs/PRD.md](docs/PRD.md) - Product requirements (WHAT to build)
- [Technical-Specification.md](Technical-Specification.md) - Tech patterns (HOW to build)
- [docs/database/DATABASE_SCHEMA.md](docs/database/DATABASE_SCHEMA.md) - Data model (DATA structure)
- [docs/dev/Tech-Stack-Standard.md](docs/dev/Tech-Stack-Standard.md) - Ceibatic tech standards

### API & Integration
- [docs/api/API_ENDPOINTS.md](docs/api/API_ENDPOINTS.md) - Complete API reference
- [docs/bubble/BUBBLE_SETUP_GUIDE.md](docs/bubble/BUBBLE_SETUP_GUIDE.md) - Bubble.io setup (non-technical)
- [docs/bubble/WORKFLOW_TEMPLATES.md](docs/bubble/WORKFLOW_TEMPLATES.md) - Bubble workflow examples

### Implementation Guides
- [docs/modules/IMPLEMENTATION_ORDER.md](docs/modules/IMPLEMENTATION_ORDER.md) - Module dependencies
- [docs/modules/MODULE_CHECKLIST.md](docs/modules/MODULE_CHECKLIST.md) - Per-module requirements
- [.github/PULL_REQUEST_TEMPLATE.md](.github/PULL_REQUEST_TEMPLATE.md) - PR template

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
