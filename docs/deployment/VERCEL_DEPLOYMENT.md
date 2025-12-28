# Vercel Deployment Guide

**Altaviapp Platform - Production Deployment**
**Last Updated**: December 2024

---

## Quick Setup Checklist

Complete these steps in order:

- [ ] **Step 1**: Verify Vercel project settings (Root Directory, Build Command)
- [ ] **Step 2**: Add environment variables to each project
- [ ] **Step 3**: Add custom domains in Vercel
- [ ] **Step 4**: Configure DNS in Namecheap
- [ ] **Step 5**: Verify SSL and test domains

---

## Step 1: Verify Project Settings

### altaviapp-admin

Go to: `vercel.com/[team]/altaviapp-admin/settings`

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/admin` |
| **Build Command** | `cd ../.. && pnpm build --filter=@altaviapp/admin` |
| **Install Command** | `cd ../.. && pnpm install` |
| **Node.js Version** | 20.x |

### altaviapp-crew

Go to: `vercel.com/[team]/altaviapp-crew/settings`

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/crew` |
| **Build Command** | `cd ../.. && pnpm build --filter=@altaviapp/crew` |
| **Install Command** | `cd ../.. && pnpm install` |
| **Node.js Version** | 20.x |

### altaviapp-parent

Go to: `vercel.com/[team]/altaviapp-parent/settings`

| Setting | Value |
|---------|-------|
| **Framework Preset** | Next.js |
| **Root Directory** | `apps/parent` |
| **Build Command** | `cd ../.. && pnpm build --filter=@altaviapp/parent` |
| **Install Command** | `cd ../.. && pnpm install` |
| **Node.js Version** | 20.x |

---

## Step 2: Environment Variables

### Required Variables (ALL projects)

Go to each project → Settings → Environment Variables → Add:

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_CONVEX_URL` | `https://wooden-armadillo-937.convex.cloud` | Production, Preview, Development |

### App-Specific Variables

**altaviapp-admin:**
```
NEXT_PUBLIC_APP_URL = https://admin.altaviapp.com
```

**altaviapp-crew:**
```
NEXT_PUBLIC_APP_URL = https://crew.altaviapp.com
```

**altaviapp-parent:**
```
NEXT_PUBLIC_APP_URL = https://padres.altaviapp.com
```

### Optional Variables

| Name | Value | Purpose |
|------|-------|---------|
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | `AIza...` | Maps (if using Google Maps) |

---

## Step 3: Add Custom Domains in Vercel

### altaviapp-admin

1. Go to: Settings → Domains
2. Click "Add"
3. Enter: `admin.altaviapp.com`
4. Click "Add"
5. Note the configuration instructions

### altaviapp-crew

1. Go to: Settings → Domains
2. Click "Add"
3. Enter: `crew.altaviapp.com`
4. Click "Add"

### altaviapp-parent

1. Go to: Settings → Domains
2. Click "Add"
3. Enter: `padres.altaviapp.com`
4. Click "Add"

After adding, Vercel will show "Invalid Configuration" until DNS is set up (Step 4).

---

## Step 4: Configure DNS in Namecheap

### Login to Namecheap

1. Go to: [namecheap.com](https://namecheap.com)
2. Login → Domain List → `altaviapp.com` → Manage
3. Click "Advanced DNS" tab

### Add CNAME Records

Click "Add New Record" for each:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | `admin` | `cname.vercel-dns.com.` | Automatic |
| CNAME | `crew` | `cname.vercel-dns.com.` | Automatic |
| CNAME | `padres` | `cname.vercel-dns.com.` | Automatic |

**Important**: The value must be exactly `cname.vercel-dns.com.` (with trailing dot in some DNS providers)

### DNS Propagation

- Changes take 1-48 hours to propagate globally
- Usually works within 5-15 minutes
- Check propagation: [dnschecker.org](https://dnschecker.org)

---

## Step 5: Verify Configuration

### In Vercel Dashboard

After DNS propagates, each domain should show:

```
✓ Valid Configuration
✓ SSL Certificate (automatic)
```

### Test Each URL

Open in browser:

| App | URL | Expected |
|-----|-----|----------|
| Admin | https://admin.altaviapp.com | Login page |
| Crew | https://crew.altaviapp.com | Login page |
| Parent | https://padres.altaviapp.com | Login page |

### Verify HTTPS

All URLs should:
- Redirect HTTP → HTTPS automatically
- Show valid SSL certificate (padlock icon)

---

## Troubleshooting Domain Issues

### "Invalid Configuration" in Vercel

**Cause**: DNS not propagated yet

**Solution**: Wait 15-30 minutes, then refresh Vercel dashboard

### "SSL Certificate Error"

**Cause**: Domain just added, certificate pending

**Solution**: Wait 5-10 minutes, Vercel provisions SSL automatically

### "Domain Already in Use"

**Cause**: Domain added to another Vercel project

**Solution**: Remove from other project first, then add to correct project

### Check DNS Records

```bash
# Verify CNAME is set correctly
nslookup admin.altaviapp.com
# Should return: cname.vercel-dns.com

dig admin.altaviapp.com CNAME
# Should show CNAME pointing to vercel
```

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
