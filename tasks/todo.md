# Plan: Abordo autoalojado, mapas abiertos y suscripción con Wompi

Requisitos: [docs/PRD.md](../docs/PRD.md)
Estado: **pendiente de aprobación**. Nada de esto está implementado.
Lo anterior (versión 1 sobre Convex) está terminado y verificado; el detalle quedó en el historial de git.

## Qué cambia y por qué

| Hoy | Propuesta | Motivo |
|-----|-----------|--------|
| Convex (nube) | PostgreSQL 17 + API propia dentro de la app | Autoalojable, sin proveedor, respaldos y permisos estándar |
| Vercel | Docker Compose en VPS o servidor propio, detrás de Caddy | Un `docker compose up` levanta todo |
| Tiempo real de Convex | Server-Sent Events + `LISTEN/NOTIFY` de Postgres | Sin servicio adicional; funciona con varias réplicas |
| Tareas programadas de Convex | pg-boss (cola sobre Postgres) | Avisos diferidos, push, correo, cobros, limpieza |
| Token en `localStorage` | Cookie `httpOnly`, `Secure`, `SameSite=Lax` | Un script inyectado no puede robar la sesión |
| Leaflet + teselas públicas de OSM | MapLibre GL + archivo PMTiles de Colombia autoalojado | Las teselas públicas no admiten uso comercial sostenido; cero costo por uso |
| Orden y horas por línea recta | OSRM autoalojado (opcional) | Trazo por calles, tiempos reales, orden óptimo de paradas |
| Sin cobro | Suscripción por colegio cobrada con Wompi | Mercado inicial: Colombia |

La interfaz casi no cambia: se conservan `useQ` y `useM` con la misma firma y solo cambia lo que hay debajo.

## Decisiones que necesito

- [ ] Backend: PostgreSQL con API propia (recomendado) o Convex autoalojado
- [ ] Modelo de precio de la suscripción
- [ ] Qué servicios de mapas se autoalojan (depende de la memoria del servidor)

## Decisiones que tomo salvo que digas otra cosa

- Cobro por periodo con el checkout de Wompi (PSE, tarjeta, Nequi, Bancolombia) y, opcional, tarjeta guardada para renovación automática. PSE no admite cobro automático, y es como suelen pagar los colegios.
- El webhook `transaction.updated`, validado con su firma, es la única fuente de verdad de un pago. La redirección del navegador no confirma nada.
- Suspender por falta de pago nunca corta un viaje en curso ni el seguimiento a las familias: bloquea la edición del coordinador y muestra el aviso.
- Compose con dos perfiles: `vps` (Caddy con HTTPS automático) y `casa` (túnel de Cloudflare, sin abrir puertos).
- Correo por SMTP (sirve cualquier proveedor), en lugar de la API de un proveedor concreto.
- Valores por defecto de Colombia: zona `America/Bogota`, pesos, indicativo +57.

## Fase A — Base de datos y API

- [ ] Esquema en Drizzle con las 14 tablas actuales, llaves foráneas e índices; migraciones versionadas
- [ ] Capa de funciones tipadas: validación con Zod, rol y colegio resueltos desde la sesión
- [ ] Seguridad por fila en Postgres (`school_id`) como segunda barrera además del filtro en código
- [ ] Portar las funciones: acceso, estudiantes, equipo, rutas, viajes, familia, avisos, rostros
- [ ] Vectores de rostro cifrados en reposo (AES-256-GCM, llave fuera de la base)
- [ ] Bitácora de auditoría: ingresos, registro y borrado de rostros, exportaciones, cambios de plan
- [ ] Portar las 28 pruebas a Postgres en memoria (PGlite) y sumar las de facturación

## Fase B — Tiempo real y tareas

- [ ] Canal SSE con `LISTEN/NOTIFY`; cada mutación declara qué temas invalida
- [ ] `useQ` con caché y reconsulta por tema; cola de toques sin conexión para el conductor
- [ ] pg-boss: aviso a la familia tras 8 s, push, correo, rutas sin iniciar, limpieza diaria

## Fase C — Seguridad

- [ ] Sesión en cookie; verificación de origen en toda mutación
- [ ] Límite de intentos por IP y por correo en el acceso
- [ ] Cabeceras: CSP, HSTS, `frame-ancestors`, `Permissions-Policy` (cámara y ubicación solo propias)
- [ ] Contenedores sin root y con sistema de archivos de solo lectura; secretos por archivo
- [ ] Respaldo cifrado diario fuera del servidor y guion de restauración probado
- [ ] Revisión de seguridad del diff completo antes de cerrar

## Fase D — Mapas abiertos

- [ ] MapLibre GL con PMTiles de Colombia servido por Caddy; estilo con la paleta de la marca
- [ ] Cliente de OSRM para trazo, tiempos y orden de paradas; sin OSRM se usa el cálculo actual
- [ ] Buscador de direcciones con Photon si se autoaloja; el punto en el mapa sigue siendo el camino seguro
- [ ] Guion que descarga y prepara los datos de Colombia

## Fase E — Suscripción y Wompi

- [ ] Tablas `subscriptions` y `charges`; estados: prueba, activa, vencida, suspendida, cancelada
- [ ] Prueba gratis de 30 días al registrar el colegio
- [ ] Pantalla "Plan y pagos" del coordinador: estado, próximo cobro, historial, datos de facturación (NIT, razón social)
- [ ] Pago del periodo con checkout de Wompi, con firma de integridad calculada en el servidor
- [ ] Webhook con validación de firma, idempotencia y reconsulta de la transacción
- [ ] Tarjeta guardada (fuente de pago) y cobro automático al vencer, con reintentos
- [ ] Recordatorios por correo: 7 días antes, el día, y al entrar en mora
- [ ] Consola del dueño de la plataforma: colegios, estado de pago, extender prueba, registrar pago por transferencia
- [ ] Pruebas contra el ambiente sandbox de Wompi (necesito llaves de prueba)

## Fase F — Despliegue

- [ ] `Dockerfile` de la app (salida `standalone`) y `docker-compose.yml` con Postgres, app, tareas, Caddy
- [ ] Perfiles opcionales: OSRM, Photon, túnel de Cloudflare
- [ ] Guía de instalación en un VPS limpio y de actualización sin caída
- [ ] Retirar Convex del repositorio; actualizar PRD, README y CLAUDE.md

## Lo que este plan no resuelve

- **Factura electrónica ante la DIAN.** Vender en Colombia la exige. Se integra aparte con un proveedor (Alegra, Siigo, Factus).
- **IVA.** Dejo la tarifa configurable; que la confirme un contador.
- **Habeas data.** Política de tratamiento, autorización y registro de bases de datos ante la SIC (Ley 1581): trabajo legal, no de código.
- **Servidor en casa para producción.** Sirve para pilotos; con datos en vivo de menores recomiendo un VPS por energía, conexión y respaldo.
- **Direcciones colombianas.** Los buscadores abiertos aciertan poco con "Cra 15 # 93-60"; por eso el punto en el mapa no se quita.
