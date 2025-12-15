# Vercel Deployment Guide

**Altaviapp Platform - Production Deployment**
**Last Updated**: December 2024

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                         PRODUCTION                               │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │  Admin App   │  │  Crew App    │  │  Parent App  │          │
│  │   (Vercel)   │  │   (Vercel)   │  │   (Vercel)   │          │
│  │              │  │              │  │              │          │
│  │ admin.       │  │ crew.        │  │ padres.      │          │
│  │ altaviapp.com│  │ altaviapp.com│  │ altaviapp.com│          │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘          │
│         │                 │                 │                   │
│         └─────────────────┼─────────────────┘                   │
│                           │                                      │
│                           ▼                                      │
│              ┌────────────────────────┐                         │
│              │   Convex Backend       │                         │
│              │   (Production)         │                         │
│              │                        │                         │
│              │ wooden-armadillo-937   │                         │
│              │     .convex.cloud      │                         │
│              └───────────┬────────────┘                         │
│                          │                                       │
│                          ▼                                       │
│              ┌────────────────────────┐                         │
│              │   Resend Email         │                         │
│              │   noreply@altaviapp.com│                         │
│              └────────────────────────┘                         │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## Vercel Projects

### Project Details

| Project Name | App | Root Directory | Domain |
|--------------|-----|----------------|--------|
| `altaviapp-admin` | Admin Dashboard | `apps/admin` | `admin.altaviapp.com` |
| `altaviapp-crew` | Crew PWA | `apps/crew` | `crew.altaviapp.com` |
| `altaviapp-parent` | Parent Portal | `apps/parent` | `padres.altaviapp.com` |

### Build Settings (Same for all projects)

| Setting | Value |
|---------|-------|
| Framework Preset | Next.js |
| Node.js Version | 18.x |
| Build Command | `cd ../.. && pnpm build --filter=@altaviapp/{app-name}` |
| Install Command | `cd ../.. && pnpm install` |
| Output Directory | `.next` |

### Environment Variables

Each Vercel project requires these environment variables:

```bash
# Required - Convex Backend
NEXT_PUBLIC_CONVEX_URL=https://wooden-armadillo-937.convex.cloud

# Required - Google Maps
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=<your-google-maps-api-key>

# Optional - App URL (for redirects)
NEXT_PUBLIC_APP_URL=https://{subdomain}.altaviapp.com
```

---

## Convex Backend

### Environments

| Environment | URL | Usage |
|-------------|-----|-------|
| Development | `https://abundant-mastiff-673.convex.cloud` | Local development |
| Production | `https://wooden-armadillo-937.convex.cloud` | Live apps |

### Environment Variables (Convex)

```bash
# View current env vars
npx convex env list

# Set email API key
npx convex env set RESEND_API_KEY re_xxxxxxxxxxxx
```

### Deployment Commands

```bash
# Deploy to production
npx convex deploy --yes

# Deploy with preview
npx convex deploy

# Check deployment status
npx convex dashboard
```

---

## CI/CD Workflow

### Development Flow

```
1. Local Development
   └── pnpm dev (frontend)
   └── npx convex dev (backend)

2. Test Changes
   └── pnpm build (verify build)
   └── pnpm type-check (TypeScript)

3. Commit & Push
   └── git add .
   └── git commit -m "feat: description"
   └── git push origin main

4. Auto-Deploy (Vercel)
   └── Vercel detects push
   └── Rebuilds affected apps
   └── ~2-3 min deploy time

5. Backend Deploy (Manual)
   └── npx convex deploy --yes
```

### When to Deploy What

| Change Type | Deploy Command |
|-------------|---------------|
| Frontend only | `git push` (auto) |
| Backend only | `npx convex deploy` |
| Both | `npx convex deploy && git push` |
| Schema changes | `npx convex deploy` (test first!) |

---

## DNS Configuration

### Namecheap Setup

1. Login to Namecheap
2. Go to Domain List → altaviapp.com → Manage
3. Advanced DNS → Add Records

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | admin | cname.vercel-dns.com | Automatic |
| CNAME | crew | cname.vercel-dns.com | Automatic |
| CNAME | padres | cname.vercel-dns.com | Automatic |

### Vercel Domain Setup

1. Go to Project Settings → Domains
2. Add custom domain (e.g., `admin.altaviapp.com`)
3. Vercel will verify DNS and provision SSL

---

## Troubleshooting

### Build Failures

**Missing environment variables:**
```
Error: Missing Convex URL
```
Solution: Add `NEXT_PUBLIC_CONVEX_URL` in Vercel project settings.

**TypeScript errors:**
```bash
# Run locally to identify issues
pnpm type-check
```

**Security vulnerabilities:**
```
Error: Vulnerable version of Next.js detected
```
Solution: Update Next.js version in `apps/*/package.json`:
```json
"next": "^16.0.10"
```

### Runtime Errors

**CORS issues:**
- Verify Convex HTTP endpoints have CORS headers
- Check `Access-Control-Allow-Origin: *`

**API not responding:**
```bash
# Check Convex deployment
npx convex dashboard

# Re-deploy if needed
npx convex deploy --yes
```

### Email Issues

**Emails not sending:**
```bash
# Verify Resend API key
npx convex env list

# Set/update key
npx convex env set RESEND_API_KEY re_xxxxx
```

**Wrong sender:**
- Check `convex/email.ts` has correct `from` address
- Verify domain in Resend dashboard

---

## Monitoring

### Vercel Dashboard
- Build logs: Project → Deployments
- Runtime logs: Project → Logs
- Analytics: Project → Analytics

### Convex Dashboard
```bash
npx convex dashboard
```
- Function logs
- Database explorer
- Real-time metrics

---

## Rollback

### Vercel Rollback
1. Go to Project → Deployments
2. Find previous working deployment
3. Click "..." → Promote to Production

### Convex Rollback
Convex doesn't have automatic rollback. Options:
1. Revert git commit and redeploy
2. Manually fix and deploy

---

## Security Checklist

- [ ] All API keys in environment variables (not code)
- [ ] HTTPS enforced (automatic with Vercel)
- [ ] Next.js version patched (no known CVEs)
- [ ] Convex RESEND_API_KEY set in production
- [ ] Google Maps API key restricted by domain
- [ ] No sensitive data in logs

---

## Quick Reference

```bash
# Deploy everything
npx convex deploy --yes && git push origin main

# Check build locally
pnpm build

# View Convex logs
npx convex dashboard

# Set environment variable
npx convex env set KEY value

# Force Vercel rebuild
# (Go to Vercel → Deployments → Redeploy)
```
