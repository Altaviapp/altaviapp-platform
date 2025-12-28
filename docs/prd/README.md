# Altaviapp - Product Requirements Documents

**Version**: 3.0
**Date**: December 2024
**Status**: Active Development

---

## Overview

Altaviapp es una plataforma de gestión de transporte escolar diseñada para instituciones educativas en Ecuador y Colombia. Proporciona seguimiento GPS en tiempo real, check-ins automatizados de estudiantes y notificaciones instantáneas para padres.

---

## Aplicaciones

| App | Documento | Usuarios | Descripción |
|-----|-----------|----------|-------------|
| **Admin Dashboard** | [ADMIN_PRD.md](ADMIN_PRD.md) | Coordinador, Super Admin | Panel de administración para gestión de flota, rutas, estudiantes |
| **Crew App** | [CREW_PRD.md](CREW_PRD.md) | Conductor, Auxiliar | App móvil PWA para operación de viajes y check-ins |
| **Parent Portal** | [PARENT_PRD.md](PARENT_PRD.md) | Padres/Tutores | Portal para seguimiento en tiempo real de hijos |

---

## Tech Stack Compartido

| Componente | Tecnología |
|------------|------------|
| **Backend** | Convex (serverless, real-time) |
| **Auth** | Custom token-based (PBKDF2) |
| **Frontend** | Next.js 14+ PWA |
| **UI** | shadcn/ui + Tailwind CSS |
| **Maps** | Leaflet + OpenStreetMap |
| **Monorepo** | Turborepo + pnpm |

---

## Roles de Usuario

| Rol | Nivel | Apps con Acceso |
|-----|-------|-----------------|
| super_admin | 1000 | Admin |
| admin | 500 | Admin |
| monitor | 150 | Crew |
| driver | 100 | Crew |
| parent | 10 | Parent |

---

## Documentación Relacionada

| Documento | Propósito |
|-----------|-----------|
| [Technical-Specification.md](../../Technical-Specification.md) | Patrones de implementación |
| [DATABASE_SCHEMA.md](../database/DATABASE_SCHEMA.md) | Estructura de datos |
| [API_ENDPOINTS.md](../api/API_ENDPOINTS.md) | Referencia API |
| [ADMIN_WIREFRAMES.md](../design/ADMIN_WIREFRAMES.md) | Wireframes Admin |
| [CREW_WIREFRAMES.md](../design/CREW_WIREFRAMES.md) | Wireframes Crew |
| [PARENT_WIREFRAMES.md](../design/PARENT_WIREFRAMES.md) | Wireframes Parent |

---

## Historial de Versiones

| Versión | Fecha | Cambios |
|---------|-------|---------|
| v3.0 | Dic 2024 | Reestructuración en PRDs por app |
| v2.1 | Dic 2024 | Finalización scope v1.0 |
| v2.0 | Ene 2025 | PRD optimizado (sin código) |
| v1.0 | Oct 2024 | PRD inicial |

---

## Estado Global

**Fase actual**: Phase 3 Complete (User Interfaces)

| Módulo | Estado |
|--------|--------|
| Authentication | ✅ Implementado |
| Multi-tenancy | ✅ Implementado |
| Fleet Management | ✅ Implementado |
| Students | ✅ Implementado |
| Routes | ✅ Implementado |
| Trips | ✅ Implementado |
| Check-ins | ✅ Implementado |
| Incidents | ✅ Implementado |
| Novedades | ✅ Implementado |
| Admin Dashboard | ✅ Implementado |
| Parent Portal | ✅ Implementado |
| Crew App | ✅ Implementado |
