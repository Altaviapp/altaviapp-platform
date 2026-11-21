# Plan: Abordo autoalojado, mapas abiertos y suscripción con Wompi

Requisitos: [docs/PRD.md](../docs/PRD.md)
Estado: **fases A a F implementadas y verificadas en local**. Sigue la fase G (apps móviles), que necesita plan propio y aprobación.

## Decisiones tomadas

- [x] Backend: PostgreSQL con API propia (sin Convex ni Vercel)
- [x] Precio: por estudiante activo en ruta al mes, tarifa configurable por colegio
- [x] Mapas: abiertos y autoalojados; la hora estimada aprende del historial; el tráfico de pago queda como pieza enchufable, apagada
- [x] Cobro por periodo con el checkout de Wompi; el webhook firmado es la única confirmación de un pago
- [x] Suspender por falta de pago bloquea la edición del coordinador, nunca viajes ni familias

## Hecho

- [x] **A. Base y API** — 20 tablas en PostgreSQL con migraciones, seguridad por fila forzada, funciones tipadas con Zod, vectores de rostro cifrados, bitácora de auditoría
- [x] **B. Tiempo real y tareas** — Server-Sent Events sobre `LISTEN/NOTIFY`, caché de consultas por etiquetas, cola de tareas propia sobre Postgres, cola sin conexión para los toques del conductor
- [x] **C. Seguridad** — cookie `HttpOnly`, verificación de origen, límite de intentos por correo y por conexión, política de contenido por petición, cabeceras, contenedor sin root y de solo lectura, respaldo cifrado con restauración
- [x] **D. Mapas abiertos** — MapLibre con PMTiles en la paleta de la marca, OSRM para orden, horas y trazo por calles, hora estimada que aprende, medición de su error, botón de Waze
- [x] **E. Suscripción** — prueba de 30 días, "Plan y pagos", checkout de Wompi, webhook con firma, recordatorios, mora y suspensión, consola del dueño con pagos por transferencia
- [x] **F. Despliegue** — Dockerfile, Docker Compose (Postgres, app, Caddy; perfiles para OSRM y túnel de Cloudflare), guiones de mapas y respaldo, documentación

## Verificado

- [x] 45 pruebas sobre PostgreSQL en memoria con la seguridad por fila activa: flujos, aislamiento entre colegios, pagos, mora, cola de tareas
- [x] Firma de integridad de Wompi contra el ejemplo de su documentación oficial
- [x] Compilación de producción y recorrido en navegador sobre ella, con la política de contenido estricta: acceso con código, viaje completo con los tres roles en vivo, cola sin conexión, registro y escáner de rostro, orden de paradas por calles, pago con webhook, consola del dueño
- [x] Pila completa con Docker Compose: imagen construida, migraciones con un rol sin superusuario, 20 tablas con seguridad por fila, app sin root y de solo lectura, tiempo real a través de Caddy
- [x] Respaldo cifrado y restauración (se borró un colegio y volvió al restaurar)
- [x] Extracción de teselas con el contenedor de PMTiles (zona pequeña)

## Pendiente: necesita llaves, datos o dispositivos reales

- [ ] **Wompi en sandbox.** Probado contra eventos simulados con el formato documentado, no contra Wompi. Faltan las llaves de prueba
- [ ] **Renovación automática con tarjeta guardada.** No se implementó: cobra sin una persona delante y no se puede probar sin sandbox. Wompi lo permite con "fuentes de pago"
- [ ] **OSRM propio.** El cliente se probó contra el servidor público de demostración de OSRM. Falta preparar los datos de Colombia en el servidor (`./scripts/maps.sh rutas`, unos 4 GB de RAM)
- [ ] **Teselas de toda Colombia.** Se probó una zona pequeña y, en el navegador, el archivo mundial remoto. Falta la descarga completa y medir su tamaño
- [ ] **Correo por SMTP** con un proveedor real
- [ ] **Push en un teléfono real** con llaves VAPID
- [ ] **Rostros y ubicación en teléfonos reales**, con niños, luz de calle y el bus en movimiento
- [ ] **HTTPS automático de Caddy** con un dominio real (aquí se probó por HTTP local)
- [ ] **Límite general de peticiones por conexión.** Hoy solo lo tienen el acceso y el registro

## Pendiente: no es código

- [ ] Factura electrónica ante la DIAN (proveedor como Alegra, Siigo o Factus)
- [ ] Confirmar con un contador la tarifa de IVA (configurable; por defecto 19 %)
- [ ] Política de tratamiento de datos y registro de bases ante la SIC (Ley 1581)
- [ ] Revisión legal del texto de autorización biométrica
- [ ] Definir el precio por estudiante (el colegio de demostración usa 6.000 pesos como ejemplo)
- [ ] Dominio y marca de Abordo

## Fase G — Apps Android y iPhone (siguiente, con plan propio)

Pedido por el dueño del producto: se planea a fondo antes de implementar, para publicar sin cabos sueltos.

Ya preparado:

- [x] La API acepta la sesión por cookie (web) o por cabecera `Authorization: Bearer` (apps). Probado
- [x] Los pagos viven solo en la web, fuera de las reglas de compras dentro de la app

Temas que ese plan debe cerrar:

- Envoltura nativa de la app web (Capacitor) o app nativa. Lo que decide: ubicación en segundo plano del conductor, que una PWA no puede dar
- Push nativo (FCM y APNs) junto al push web
- Requisitos de tiendas: política de privacidad pública, eliminación de cuenta desde la app, formularios de datos, justificación de ubicación en segundo plano y de datos de rostro de menores
- Cuentas de desarrollador, firma, íconos, capturas, fichas, pruebas internas y revisión
