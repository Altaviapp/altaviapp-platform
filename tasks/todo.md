# Plan: reescritura completa del producto

Requisitos: [docs/PRD.md](../docs/PRD.md)
Estado: **pendiente de aprobación del usuario**. No se borra ni se implementa nada hasta aprobar.

## Decisiones que necesito antes de empezar

- [ ] Nombre del producto (candidatos en la sección 11 del PRD)
- [ ] Datos de producción: despliegue nuevo de Convex o migración de colegios existentes
- [ ] Funciones recortadas que deban volver a v1 (sección 7 del PRD)

## Fase 0 — Limpieza

- [ ] Borrar `apps/`, `packages/`, `convex/`, `lib/`, `tests/`, `scripts/`, `assets/`
- [ ] Borrar `docs/` salvo `docs/PRD.md`; borrar `Technical-Specification.md`, `README.md` y el resto de `tasks/`
- [ ] Borrar configuración de monorepo y Docker: `turbo.json`, `pnpm-workspace.yaml`, `Dockerfile`, `docker-compose.yml`, `.dockerignore`, `jest.config.js`, archivos `.env*.example`
- [ ] Esqueleto nuevo: una app Next.js + Convex + Tailwind + Vitest en la raíz

## Fase 1 — Base

- [ ] `convex/schema.ts` con las 13 tablas del PRD
- [ ] Acceso por código al correo; sesión por token resuelta en el servidor
- [ ] Ayudantes de autorización: usuario de la sesión, rol, colegio
- [ ] Registro de colegio
- [ ] Navegación por rol: `admin/`, `conductor/`, `familia/`

## Fase 2 — Coordinador: datos maestros

- [ ] Estudiantes: lista, formulario con punto en el mapa, acudientes
- [ ] Importación CSV con vista previa
- [ ] Equipo y buses
- [ ] Rutas: editor, paradas por domicilio, ordenar, arrastrar, horas

## Fase 3 — Conductor

- [ ] Mis viajes de hoy (lista derivada de rutas y ausencias)
- [ ] Iniciar viaje con copia de paradas
- [ ] Viaje en curso: asistencia por toque, deshacer, llegar al colegio
- [ ] Envío de posición cada 10 s y pantalla encendida
- [ ] Avisar retraso, avería u otro
- [ ] Resumen

## Fase 4 — Familia

- [ ] Inicio con estado por hijo y mapa en vivo
- [ ] Reportar y cancelar ausencia
- [ ] Push web (suscripción, envío, aviso de cercanía a 500 m)
- [ ] Actividad

## Fase 5 — Coordinador: operación

- [ ] Hoy: mapa, viajes, bandeja de atención
- [ ] Detalle de viaje
- [ ] Historial y exportación CSV
- [ ] Ajustes del colegio

## Fase 6 — Cierre

- [ ] Manifest e instalación PWA
- [ ] Datos de demostración
- [ ] Pruebas de las reglas de la sección 6 del PRD
- [ ] README y CLAUDE.md nuevos
- [ ] Verificación de punta a punta en el navegador con los tres roles

## Fuera de este plan

- Desplegar a producción (Convex o Vercel). El despliegue actual `wooden-armadillo-937` no se toca.
- Fusionar a `main`. Todo queda en la rama `claude/charming-babbage-s9a15w`.
