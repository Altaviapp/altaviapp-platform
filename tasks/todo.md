# Plan: reescritura completa del producto como Abordo

Requisitos: [docs/PRD.md](../docs/PRD.md)
Estado: **fases 0 a 6 implementadas y verificadas en local**. Pendiente lo que depende de servicios externos.

## Decisiones tomadas

- [x] Nombre: Abordo
- [x] Datos: se empieza de cero; el despliegue de Altaviapp no se toca
- [x] Entra en v1: check-in con reconocimiento facial
- [x] Diseño: paleta campestre (verde bosque, crema, musgo, pizarra, carmesí), bloques amplios y tipografía protagonista, según las referencias del dueño del producto

## Hecho

- [x] Fase 0 — Código y documentación anteriores eliminados; app única Next.js + Convex
- [x] Fase 1 — Esquema de 14 tablas, acceso por código al correo, sesión resuelta en el servidor, registro de colegio, navegación por rol
- [x] Fase 2 — Estudiantes con mapa y CSV, equipo y buses, editor de rutas con orden automático y arrastre
- [x] Fase 3 — Conductor: mis viajes, viaje en curso, posición cada 10 s, asistencia con deshacer, avisos, resumen, escáner de rostro
- [x] Fase 4 — Familia: estado en vivo con mapa, ausencias, registro de rostro con consentimiento, actividad, suscripción push
- [x] Fase 5 — Coordinador: Hoy en vivo, bandeja de atención, detalle de viaje, historial con exportación CSV, ajustes
- [x] Fase 6 — PWA instalable, datos de demostración, 28 pruebas, README y CLAUDE.md nuevos

## Verificado

- [x] `pnpm test`: 28 pruebas (reglas puras y flujos del backend, incluido aislamiento entre colegios)
- [x] `pnpm type-check` y `pnpm build`
- [x] Recorrido en navegador contra backend local: acceso con código, registro de colegio, CSV, ruta nueva, viaje completo con los tres roles en vivo, exportación
- [x] Reconocimiento facial en navegador: registro con una foto y reconocimiento con otra foto de la misma persona por cámara simulada

## Pendiente (requiere servicios o dispositivos reales)

- [ ] Push de punta a punta en un teléfono: el backend cifra, firma e intenta el envío, pero falta probarlo contra el servicio push de un navegador real con llaves VAPID
- [ ] Envío del código por correo con una llave de Resend y un dominio verificado
- [ ] Reconocimiento facial en teléfonos reales, con niños y luz de calle; ajustar umbrales de `lib/face.ts` con esos datos
- [ ] Posición con el teléfono en movimiento (en la prueba la ubicación fue simulada)
- [ ] Revisión legal del texto de autorización biométrica (LOPDP en Ecuador, Ley 1581 en Colombia)
- [ ] Proveedor de teselas de mapa para producción
- [ ] Proyecto nuevo de Convex y despliegue de la app; dominio y marca de Abordo
- [ ] Límite de solicitudes de código por dirección IP (hoy el límite es por correo)

## Fuera de este plan

- Desplegar a producción. El despliegue `wooden-armadillo-937` no se toca.
- Fusionar a `main`. Todo queda en la rama `claude/charming-babbage-s9a15w`.
