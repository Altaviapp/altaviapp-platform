# CLAUDE.md - Altaviapp Development Guide

**Altaviapp School Transport Management Platform**
**Version**: 2.0
**Date**: December 2024
**Status**: Production - Maintenance Mode

---

## Overview

Altaviapp is a school transport management platform with three PWA applications (Admin, Crew, Parent). All core modules are implemented. This guide defines the workflow for maintenance, bug fixes, and new feature iterations.

---

## Sources of Truth

**Always verify against these before making changes:**

| Source | Location | Purpose |
|--------|----------|---------|
| **PRDs** | [docs/prd/](docs/prd/) | Feature requirements by app |
| **Database** | `convex/schema.ts` | Current data structure |
| **Code** | `apps/`, `convex/` | Current implementation |

### PRD Documents
- [docs/prd/ADMIN_PRD.md](docs/prd/ADMIN_PRD.md) - Admin Dashboard (9 modules)
- [docs/prd/CREW_PRD.md](docs/prd/CREW_PRD.md) - Crew App (5 modules)
- [docs/prd/PARENT_PRD.md](docs/prd/PARENT_PRD.md) - Parent Portal (7 modules)

**When making changes:**
1. Read relevant PRD section
2. Check current implementation in code
3. Verify schema in `convex/schema.ts`
4. Make changes
5. Update PRD if requirements changed

---

## Development Rules

### Planning
1. **Think first, plan in writing** - Analyze the problem, read relevant code, write plan to `tasks/todo.md`
2. **User approval required** - Verify plan with user before implementing

### Implementation
3. **Track progress** - Work through todos one by one, marking complete when done
4. **Simplicity is paramount** - Every change should impact as little code as possible
5. **Update PRD** - If feature requirements change, update the relevant PRD document

### Mindset
6. **NEVER BE LAZY** - Find root cause and fix properly. No temporary fixes
7. **MINIMAL IMPACT** - Changes should only impact code directly relevant to the task

---

## Project Structure

```
apps/
├── admin/     # Admin Dashboard - Coordinators
├── parent/    # Parent Portal - Parents/Guardians
└── crew/      # Crew App - Drivers/Monitors

convex/
├── schema.ts      # Database schema (source of truth)
├── auth*.ts       # Authentication
├── students.ts    # Student management
├── routes.ts      # Route management
├── trips.ts       # Trip operations
├── vehicles.ts    # Fleet management
├── drivers.ts     # Driver management
├── monitors.ts    # Monitor management
├── incidents.ts   # Incident reporting
├── novedades.ts   # Schedule exceptions
└── notifications.ts

packages/
├── ui/        # Shared UI components (shadcn/ui)
├── auth/      # Shared auth utilities
└── maps/      # Map components
```

---

## Tech Stack

| Component | Technology | Version |
|-----------|------------|---------|
| **Runtime** | Node.js | >= 18 |
| **Language** | TypeScript | 5.0 |
| **Monorepo** | Turborepo + pnpm | 2.3 / 10.24 |
| **Database** | Convex | 1.29 |
| **Auth** | Custom token-based (PBKDF2) | - |
| **Frontend** | Next.js (PWA) | 16.0 |
| **React** | React | 19.2 |
| **UI Components** | Radix UI + shadcn/ui pattern | - |
| **Styling** | Tailwind CSS | 3.4 |
| **Icons** | Lucide React | 0.294 |
| **Maps** | Leaflet + react-leaflet | 1.9 / 4.2 |
| **Forms** | react-hook-form + Zod | 7.66 / 3.25 |
| **Dates** | date-fns | 2.30 |
| **Charts** | Recharts (admin) | 2.10 |
| **QR Scanner** | html5-qrcode (crew) | 2.3 |
| **Email** | Resend | 6.6 |
| **Testing** | Vitest + Testing Library | 4.0 |

---

## User Roles

| Role | Level | App Access |
|------|-------|------------|
| super_admin | 1000 | Admin |
| admin | 500 | Admin |
| monitor | 150 | Crew |
| driver | 100 | Crew |
| parent | 10 | Parent |

---

## Git Commit Convention

**Format**: `type(scope): message`

**Types**: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`

**Scopes**: `admin`, `crew`, `parent`, `auth`, `schema`, `fleet`, `routes`, `students`, `trips`, `checkins`, `incidents`, `ui`

**Examples**:
```bash
feat(admin): add bulk student export
fix(crew): correct GPS tracking interval
refactor(parent): optimize trip polling
docs(prd): update admin fleet requirements
```

---

## Development Commands

```bash
# Start development
pnpm dev                    # All apps
pnpm --filter @altaviapp/admin dev   # Admin only
pnpm --filter @altaviapp/crew dev    # Crew only
pnpm --filter @altaviapp/parent dev  # Parent only

# Convex
npx convex dev              # Local development
npx convex deploy --yes     # Deploy to production

# Type checking
pnpm type-check             # All apps
```

---

## Deployment

| Service | URL |
|---------|-----|
| **Convex (Prod)** | `https://wooden-armadillo-937.convex.cloud` |
| **Admin** | `admin.altaviapp.com` |
| **Crew** | `crew.altaviapp.com` |
| **Parent** | `padres.altaviapp.com` |

**Deploy process**:
1. Push to `main` → Vercel auto-deploys apps
2. Run `npx convex deploy --yes` for backend changes

---

## Universal Requirements

All changes must maintain:

- **Multi-tenancy**: All queries filter by `institutionId`
- **RBAC**: Role verification on all mutations
- **Real-time**: Convex subscriptions for live data
- **i18n**: Spanish primary, Ecuador/Colombia support
- **Security**: Input validation (Zod), no sensitive data in logs

---

## Brand Colors

```css
--primary: #042940;      /* Altaviapp Blue */
--accent: #DBF227;       /* Altaviapp Lime */
--success: #10B981;
--warning: #F59E0B;
--error: #EF4444;
```

---

## Workflow: Making Changes

### 1. Bug Fix
```bash
# 1. Identify issue in code
# 2. Check PRD for expected behavior
# 3. Fix with minimal impact
# 4. Test locally
# 5. Commit: fix(scope): description
```

### 2. New Feature
```bash
# 1. Check PRD for requirements (or add new requirement)
# 2. Plan in tasks/todo.md
# 3. Get user approval
# 4. Implement
# 5. Update PRD with new feature details
# 6. Commit: feat(scope): description
```

### 3. Refactor
```bash
# 1. Identify improvement
# 2. Ensure no behavior change
# 3. Make changes
# 4. Verify all tests pass
# 5. Commit: refactor(scope): description
```

---

## Keeping Docs Updated

**After any significant change:**

1. **PRD Update**: If feature was added/modified, update relevant `docs/prd/*.md`
2. **Schema Change**: If database changed, verify `convex/schema.ts` is accurate
3. **API Change**: Document new endpoints in code comments

---

## Quick Troubleshooting

**Convex not syncing**: `npx convex deploy --yes`

**Type errors**: `pnpm type-check` then fix

**Build failing**: Check Vercel logs, verify env vars

**Schema change issues**: Test locally with `npx convex dev` first
