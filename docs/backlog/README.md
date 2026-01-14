# Backlog - Active Trip Page

Mejoras pendientes identificadas durante el desarrollo del Active Trip Page (Sprint 1-4).

## Items Pendientes

| # | Item | Prioridad | Esfuerzo | Archivo Principal |
|---|------|-----------|----------|-------------------|
| 002 | [Alertas de Proximidad (Geofencing)](./002-alertas-proximidad-geofencing.md) | Media | 8-12h | `convex/alerts.ts` (nuevo) |

## Items Completados

| # | Item | Fecha | Archivo Principal |
|---|------|-------|-------------------|
| 001 | [Polyline Diferenciada](./001-polyline-diferenciada.md) | 2026-01-12 | `packages/maps/src/components/GoogleRouteMap.tsx` |
| 002a | [Animación Marcador Vehículo](./002-animacion-marcador-vehiculo.md) | 2026-01-12 | `packages/maps/src/hooks/useAnimatedPosition.ts` |
| 003 | [Mapa Estático en Summary](./003-mapa-estatico-summary.md) | 2026-01-12 | `apps/crew/src/app/(dashboard)/trips/[id]/summary/page.tsx` |

## Contexto

Estos items fueron identificados en el plan original pero marcados como "Sprint 5 / Futuro" por ser mejoras visuales que no afectan la funcionalidad core.

### Completado en Sprints 1-4:
- Fix check-in (selectedStudentId pasado a CheckinSheet)
- Marcador del colegio en mapa
- Diferenciación visual de paradas (colores por status)
- Backend: arriveAtStop, skipStop, addStopNote mutations
- UI: Botón "Llegué a la parada" con confirmación
- UI: Botón "Omitir parada" con warning de estudiantes pendientes
- UI: Notas de parada (privadas para coordinadores)
- Backend: triggerSOS mutation con notificaciones
- UI: SOSButton FAB con pulsación larga (3 segundos)
- UI: EmergencyContactsSheet con contactos y números de emergencia
- UI: TripCompletionModal con estadísticas
- UI: Página /trips/[id]/summary con timeline completo
- Backend: completeTrip mejorado guardando stats en DB

### Completado en Sprint 5 (Backlog):
- Polyline diferenciada (ruta recorrida en gris vs restante en color)
- Hook useAnimatedPosition para animación suave del marcador de vehículo
- Componente StaticRouteMap para mapa estático en página de summary
- Mapa estático en página de resumen del viaje

## Cómo Usar Este Backlog

1. Cada item tiene su propio archivo markdown con:
   - Descripción del feature
   - Archivos a modificar (con líneas específicas)
   - Código de ejemplo
   - Consideraciones técnicas
   - Estimación de esfuerzo

2. Para implementar un item:
   ```bash
   # Leer el archivo de backlog
   cat docs/backlog/001-polyline-diferenciada.md

   # Implementar siguiendo las instrucciones
   # Mover a docs/completed/ cuando termine
   ```

3. Priorizar según necesidades del negocio y feedback de usuarios.
