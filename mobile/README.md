# Altaviapp - Crew PWA

Next.js 14 Progressive Web App for school bus crew (drivers and monitors) with real-time tracking and student check-in.

## Roles

- **Conductor (Driver)**: Vehicle operator, controls trip lifecycle, GPS tracking
- **Auxiliar (Monitor)**: Route assistant, student check-in/out, incident reporting

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI Library**: shadcn/ui (Radix UI + Tailwind CSS)
- **Styling**: Tailwind CSS with custom theme
- **Authentication**: Custom token-based auth
- **Database**: Convex (real-time)
- **Language**: TypeScript (strict mode)
- **PWA**: next-pwa

## Project Structure

```
mobile/
├── src/
│   ├── app/                  # Next.js App Router
│   │   ├── layout.tsx       # Root layout with providers
│   │   ├── page.tsx         # Home page
│   │   └── globals.css      # Global styles + Tailwind
│   ├── components/
│   │   └── ui/              # shadcn/ui components
│   │       └── button.tsx
│   └── lib/
│       └── utils.ts         # Utility functions (cn)
├── public/
│   ├── manifest.json        # PWA manifest
│   └── ICONS_README.md      # Instructions for PWA icons
├── next.config.js           # Next.js + PWA config
├── tailwind.config.ts       # Tailwind + shadcn theme
├── postcss.config.js        # PostCSS config
├── components.json          # shadcn/ui CLI config
└── tsconfig.json            # TypeScript config
```

## Getting Started

### 1. Install Dependencies

Already done! Dependencies are installed in the root `package.json`.

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
cp .env.local.example .env.local
```

Required variables:
- `NEXT_PUBLIC_CONVEX_URL` - Your Convex deployment URL

### 3. Run Development Server

From the root directory:

```bash
# Run only mobile app
npm run dev:mobile

# Run both Convex + Mobile (recommended)
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

## Adding shadcn/ui Components

Use the shadcn CLI to add new components:

```bash
cd mobile
npx shadcn@latest add <component-name>
```

Example:
```bash
npx shadcn@latest add card
npx shadcn@latest add dialog
npx shadcn@latest add input
```

## PWA Features

### Current Status
- ✅ PWA configuration ready
- ✅ Manifest.json configured
- ⚠️ Icons need to be added (see `public/ICONS_README.md`)
- ⚠️ Service worker auto-generated (disabled in dev mode)

### PWA Shortcuts
The app includes shortcuts for:
- **Iniciar viaje** - Start a trip
- **Escanear QR** - Scan student QR code

### Offline Support
PWA features are disabled in development mode. In production:
- Service worker caches assets
- Offline fallback page
- Background sync for check-ins (to be implemented)

## Features to Implement

Based on [CLAUDE.md](../CLAUDE.md) workflow:

### Phase 1 - Foundation (Weeks 1-3)
- [ ] `@implement auth` - Clerk integration, user sync, RBAC
- [ ] Setup Convex client with real-time queries
- [ ] Driver role authentication

### Phase 2 - Core Features (Weeks 4-9)
- [ ] GPS tracking with Leaflet maps
- [ ] QR code scanner for student check-ins
- [ ] Trip management (start, active, complete)
- [ ] Student list view
- [ ] Real-time updates via Convex subscriptions

### Phase 3 - Advanced (Weeks 10-12)
- [ ] Offline mode with IndexedDB
- [ ] Background GPS sync
- [ ] Push notifications
- [ ] Incident reporting

## Development Scripts

```bash
# Development
npm run dev:mobile        # Start Next.js dev server
npm run dev              # Start Convex + Next.js

# Build
npm run build:mobile     # Build production app
npm run start:mobile     # Start production server

# Linting
npm run lint            # Run ESLint
npm run lint:fix        # Fix linting issues

# Testing
npm test               # Run tests
npm run test:watch     # Watch mode
```

## Code Standards

### TypeScript
- Strict mode enabled
- No implicit any
- All inputs validated with Zod

### Styling
- Tailwind CSS for all styling
- Use `cn()` utility for conditional classes
- Follow shadcn/ui component patterns

### Multi-Tenancy & RBAC
Every API call must:
- Filter by `institutionId`
- Check user role (driver, admin, etc.)
- Enforce row-level security

### Internationalization
- Primary language: Spanish (es)
- Date format: DD/MM/YYYY
- Time format: 24-hour (HH:mm)
- Timezone: America/Guayaquil (Ecuador)

## Testing

The app should be tested on:
- Mobile devices (iOS Safari, Android Chrome)
- Different screen sizes (320px - 768px)
- Offline mode
- Low network conditions

## Deployment

Production deployment will be handled after core features are implemented. The app will be deployed as a PWA that can be installed on mobile devices.

## Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [shadcn/ui Documentation](https://ui.shadcn.com)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Clerk Documentation](https://clerk.com/docs)
- [Convex Documentation](https://docs.convex.dev)
- [Technical Specification](../Technical-Specification.md)
- [Database Schema](../docs/database/DATABASE_SCHEMA.md)

## Status

✅ **Next.js + shadcn/ui foundation is complete!**

Ready to start implementing features using the `@implement` workflow from [CLAUDE.md](../CLAUDE.md).

Next step: `@implement auth` to set up authentication.
