# Plan de Testing de Integración - Altaviapp

**Versión**: 1.0
**Fecha**: Diciembre 2024
**Objetivo**: Validar el flujo completo de usuario a través de Admin, Parent y Crew apps

---

## Resumen Ejecutivo

Este plan define un experimento de testing de integración que simula el ciclo de vida completo de operación de transporte escolar, desde la configuración inicial hasta la finalización de viajes con novedades.

### Aplicaciones Involucradas

| App | URL Local | Rol de Usuario |
|-----|-----------|----------------|
| Admin | `localhost:3001` | Coordinador (admin) |
| Parent | `localhost:3002` | Padre/Tutor (parent) |
| Crew | `localhost:3003` | Conductor/Monitor (driver/monitor) |

### Duración Estimada

| Fase | Duración |
|------|----------|
| Setup inicial | 15 min |
| Configuración de datos | 20 min |
| Flujo de rutas | 15 min |
| Flujo de viajes | 20 min |
| Flujo de novedades | 15 min |
| Verificación final | 10 min |
| **Total** | **~95 min** |

---

## Prerequisitos

### 1. Ambiente de Desarrollo

```bash
# Terminal 1: Convex backend
npx convex dev

# Terminal 2: Admin app
pnpm --filter @altaviapp/admin dev

# Terminal 3: Parent app
pnpm --filter @altaviapp/parent dev

# Terminal 4: Crew app
pnpm --filter @altaviapp/crew dev
```

### 2. Datos de Demo (Opcional)

```bash
# Ejecutar seed de datos de demo
npx convex run seed/createDemo:seedDemoData
```

### 3. Usuarios de Prueba

Si no hay datos de demo, crear usuarios manualmente:

| Rol | Email | Contraseña |
|-----|-------|------------|
| Admin | `admin@test.com` | `Test1234!` |
| Parent | `parent@test.com` | `Test1234!` |
| Driver | `driver@test.com` | `Test1234!` |
| Monitor | `monitor@test.com` | `Test1234!` |

---

## Fase 1: Configuración Inicial (Admin App)

### 1.1 Login y Verificación de Dashboard

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `localhost:3001/login` | Página de login visible | ☐ |
| 2 | Login con credenciales de admin | Redirige a `/dashboard` | ☐ |
| 3 | Verificar métricas del dashboard | Grid de 6 métricas visible | ☐ |
| 4 | Verificar sección de viajes activos | Lista vacía o con viajes | ☐ |

### 1.2 Configuración de Institución

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/settings` | Página de configuración | ☐ |
| 2 | Verificar ubicación de escuela | Lat/Long configurados | ☐ |
| 3 | Si no hay ubicación: configurar | Mapa muestra pin en escuela | ☐ |
| 4 | Ir a `/settings/grades` | Lista de grados | ☐ |
| 5 | Verificar al menos 3 grados | Grados visibles en lista | ☐ |

### 1.3 Configuración de Tipos de Novedad

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/settings/novedades` | Lista de tipos de novedad | ☐ |
| 2 | Verificar tipos de sistema | absence, parent_pickup, etc. | ☐ |
| 3 | (Opcional) Crear tipo personalizado | Nuevo tipo aparece en lista | ☐ |

---

## Fase 2: Creación de Datos Esenciales (Admin App)

### 2.1 Crear Vehículos

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/fleet` | Tab de vehículos visible | ☐ |
| 2 | Click "Nuevo Vehículo" | Formulario de creación | ☐ |
| 3 | Llenar datos: | | |
| | - Placa: `ABC-123` | Campo validado | ☐ |
| | - Marca: `Toyota` | Campo llenado | ☐ |
| | - Modelo: `Hiace` | Campo llenado | ☐ |
| | - Año: `2022` | Campo validado | ☐ |
| | - Capacidad: `15` | Campo validado | ☐ |
| 4 | Click "Guardar" | Toast de éxito, redirige a lista | ☐ |
| 5 | Verificar vehículo en lista | Vehículo aparece con status activo | ☐ |

**Datos del vehículo creado:**
- ID: `________________`
- Placa: `________________`

### 2.2 Crear Conductor

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/fleet` → Tab Conductores | Lista de conductores | ☐ |
| 2 | Click "Nuevo Conductor" | Formulario de creación | ☐ |
| 3 | Llenar datos: | | |
| | - Nombre: `Juan Pérez` | Campo llenado | ☐ |
| | - Email: `driver@test.com` | Campo validado | ☐ |
| | - Teléfono: `0991234567` | Campo validado | ☐ |
| | - Licencia: `0912345678` | Campo llenado | ☐ |
| | - Tipo: `C` | Selector llenado | ☐ |
| | - Vencimiento: `2025-12-31` | Fecha futura | ☐ |
| 4 | Click "Guardar" | Toast de éxito | ☐ |
| 5 | Verificar conductor en lista | Conductor aparece con status activo | ☐ |

**Datos del conductor creado:**
- ID: `________________`
- Nombre: `________________`

### 2.3 Crear Monitor (Opcional)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/fleet` → Tab Monitores | Lista de monitores | ☐ |
| 2 | Click "Nuevo Monitor" | Formulario de creación | ☐ |
| 3 | Llenar datos básicos | Campos validados | ☐ |
| 4 | Click "Guardar" | Toast de éxito | ☐ |

### 2.4 Crear Estudiantes (Mínimo 3)

**Estudiante 1:**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/students` | Lista de estudiantes | ☐ |
| 2 | Click "Nuevo Estudiante" | Formulario de creación | ☐ |
| 3 | Llenar datos: | | |
| | - Nombre: `Carlos` | Campo llenado | ☐ |
| | - Apellido: `Rodríguez` | Campo llenado | ☐ |
| | - Grado: `5to A` | Selector llenado | ☐ |
| | - Email Padre: `parent@test.com` | Campo validado | ☐ |
| | - Teléfono: `0991111111` | Campo validado | ☐ |
| 4 | Configurar ubicación de hogar | Mapa con pin seleccionado | ☐ |
| 5 | Click "Guardar" | Toast de éxito | ☐ |

**Estudiante 2:**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Crear segundo estudiante | | |
| | - Nombre: `María López` | | ☐ |
| | - Grado: `4to B` | | ☐ |
| | - Email Padre: `parent@test.com` (mismo padre) | | ☐ |
| 2 | Configurar ubicación diferente | Pin en otra dirección | ☐ |
| 3 | Guardar | Toast de éxito | ☐ |

**Estudiante 3:**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Crear tercer estudiante | | |
| | - Nombre: `Pedro Gómez` | | ☐ |
| | - Grado: `5to A` | | ☐ |
| | - Email Padre: `parent2@test.com` (otro padre) | | ☐ |
| 2 | Configurar ubicación diferente | Pin en otra dirección | ☐ |
| 3 | Guardar | Toast de éxito | ☐ |

**Datos de estudiantes creados:**
| # | Nombre | Grado | Email Padre |
|---|--------|-------|-------------|
| 1 | Carlos Rodríguez | 5to A | parent@test.com |
| 2 | María López | 4to B | parent@test.com |
| 3 | Pedro Gómez | 5to A | parent2@test.com |

---

## Fase 3: Creación de Rutas (Admin App)

### 3.1 Crear Ruta de Recogida (Pickup)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/routes` | Lista de rutas | ☐ |
| 2 | Click "Nueva Ruta" | Wizard paso 1 | ☐ |

**Paso 1 - Planificación:**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 3 | Tipo: Recogida (pickup) | Radio seleccionado | ☐ |
| 4 | Hora objetivo: `07:30` | Hora de llegada a escuela | ☐ |
| 5 | Seleccionar vehículo creado | Vehículo `ABC-123` seleccionado | ☐ |
| 6 | Seleccionar conductor creado | Conductor `Juan Pérez` | ☐ |
| 7 | Nombre: `Ruta Norte AM` | Campo llenado | ☐ |
| 8 | Click "Siguiente" | Avanza a paso 2 | ☐ |

**Paso 2 - Asignación de Paradas:**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 9 | Ver estudiantes disponibles | 3 estudiantes en lista | ☐ |
| 10 | Seleccionar Carlos Rodríguez | Se agrega a seleccionados | ☐ |
| 11 | Seleccionar María López | Se agrega a seleccionados | ☐ |
| 12 | Seleccionar Pedro Gómez | Se agrega a seleccionados | ☐ |
| 13 | Click "Calcular Ruta" | Mapa muestra polilínea | ☐ |
| 14 | Verificar orden de paradas | ETAs calculados | ☐ |
| 15 | Click "Siguiente" | Avanza a paso 3 | ☐ |

**Paso 3 - Confirmación:**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 16 | Recurrencia: Diaria | Lun-Vie seleccionados | ☐ |
| 17 | Verificar resumen | Info correcta | ☐ |
| 18 | Toggle: Activa = ON | Ruta activa | ☐ |
| 19 | Click "Crear Ruta" | Toast de éxito | ☐ |
| 20 | Verificar en lista | Ruta aparece | ☐ |

**Datos de ruta de recogida:**
- ID: `________________`
- Nombre: `Ruta Norte AM`
- Tipo: `pickup`
- Hora: `07:30`

### 3.2 Crear Ruta de Entrega (Dropoff)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Click "Nueva Ruta" | Wizard paso 1 | ☐ |
| 2 | Tipo: Entrega (dropoff) | Radio seleccionado | ☐ |
| 3 | Hora objetivo: `14:00` | Hora de salida de escuela | ☐ |
| 4 | Mismo vehículo y conductor | Seleccionados | ☐ |
| 5 | Nombre: `Ruta Norte PM` | Campo llenado | ☐ |
| 6 | Seleccionar mismos 3 estudiantes | Agregados | ☐ |
| 7 | Calcular y crear ruta | Toast de éxito | ☐ |

**Datos de ruta de entrega:**
- ID: `________________`
- Nombre: `Ruta Norte PM`
- Tipo: `dropoff`
- Hora: `14:00`

---

## Fase 4: Verificación en Parent App

### 4.1 Login y Verificación de Hijos

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `localhost:3002/login` | Página de login | ☐ |
| 2 | Login con `parent@test.com` | Redirige a `/inicio` | ☐ |
| 3 | Verificar dashboard | Lista de hijos visible | ☐ |
| 4 | Ver Carlos Rodríguez | Tarjeta de estudiante | ☐ |
| 5 | Ver María López | Tarjeta de estudiante | ☐ |

### 4.2 Verificar Perfil de Hijo

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/hijos` | Lista de hijos | ☐ |
| 2 | Click en Carlos Rodríguez | Perfil del estudiante | ☐ |
| 3 | Verificar datos | Nombre, grado, dirección | ☐ |
| 4 | Verificar código QR | QR visible y descargable | ☐ |
| 5 | Verificar rutas asignadas | `Ruta Norte AM` y `PM` | ☐ |

### 4.3 Verificar Calendario

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `/calendario` | Vista semanal | ☐ |
| 2 | Verificar día actual | Tiene viajes programados | ☐ |
| 3 | Ver detalles de viaje | Ruta, hora, conductor | ☐ |

---

## Fase 5: Flujo de Viaje (Crew App)

### 5.1 Login como Conductor

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Ir a `localhost:3003/login` | Página de login | ☐ |
| 2 | Login con `driver@test.com` | Redirige a `/dashboard` | ☐ |
| 3 | Verificar dashboard | Saludo personalizado | ☐ |
| 4 | Ver rutas del día | `Ruta Norte AM` visible | ☐ |

### 5.2 Iniciar Viaje de Recogida

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Click en `Ruta Norte AM` | Ir a página de ruta | ☐ |
| 2 | Click "Iniciar Viaje" | Página `/trips/[id]/start` | ☐ |
| 3 | Verificar resumen | 3 estudiantes, 3 paradas | ☐ |
| 4 | Verificar checklist status | Completado o pendiente | ☐ |
| 5 | Click "INICIAR VIAJE" | Crea viaje, redirige a `/active` | ☐ |

**Trip ID creado:** `________________`

### 5.3 Verificar Tracking en Parent App

**En paralelo (otra ventana/pestaña):**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Parent App: Ir a `/inicio` | Dashboard | ☐ |
| 2 | Ver tarjeta de Carlos | Estado: "En ruta" (azul) | ☐ |
| 3 | Expandir tarjeta | Mapa con ubicación del bus | ☐ |
| 4 | Verificar ETA | Tiempo estimado visible | ☐ |

### 5.4 Check-in de Estudiantes (Crew App)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | En `/trips/[id]/active` | Viaje activo visible | ☐ |
| 2 | Click "Ver Estudiantes" | Ir a `/trips/[id]/students` | ☐ |
| 3 | Ver lista de estudiantes | 3 estudiantes, status: Esperando | ☐ |

**Check-in Estudiante 1:**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 4 | Click en Carlos Rodríguez | Modal de detalle | ☐ |
| 5 | Click "Marcar Abordó" | Status cambia a "A bordo" | ☐ |
| 6 | Verificar timestamp | Hora de check-in registrada | ☐ |

**Verificar notificación en Parent App:**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 7 | Parent App: Ver `/notifications` | Notificación de check-in | ☐ |
| 8 | Mensaje: "Carlos ha subido al bus" | Texto correcto | ☐ |

**Check-in Estudiantes 2 y 3:**
| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 9 | Check-in María López | Status: A bordo | ☐ |
| 10 | Check-in Pedro Gómez | Status: A bordo | ☐ |
| 11 | Verificar resumen | 3/3 a bordo | ☐ |

### 5.5 Completar Viaje

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Volver a `/trips/[id]/active` | Mapa activo | ☐ |
| 2 | Click "Terminar Viaje" | Modal de confirmación | ☐ |
| 3 | Confirmar | Viaje cambia a "completado" | ☐ |
| 4 | Verificar en Admin App | Viaje aparece como completado | ☐ |

---

## Fase 6: Flujo de Novedades

### 6.1 Crear Novedad de Ausencia (Parent App)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Parent App: Ir a `/novedades/create` | Formulario de novedad | ☐ |
| 2 | Seleccionar hijo: Carlos Rodríguez | Hijo seleccionado | ☐ |
| 3 | Seleccionar tipo: Ausencia | Tipo seleccionado | ☐ |
| 4 | Seleccionar fecha: mañana | Fecha válida | ☐ |
| 5 | Seleccionar ruta: Ambos | Afecta ida y vuelta | ☐ |
| 6 | Razón: "Cita médica" | Campo llenado | ☐ |
| 7 | (Opcional) Adjuntar imagen | Archivo subido | ☐ |
| 8 | Click "Enviar" | Toast de éxito | ☐ |
| 9 | Verificar en `/novedades` | Novedad con status "Pendiente" | ☐ |

**Novedad ID:** `________________`

### 6.2 Aprobar Novedad (Admin App)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Admin App: Ir a `/requests` | Tab de novedades | ☐ |
| 2 | Ver novedad de Carlos | Badge "Pendiente" | ☐ |
| 3 | Click en novedad | Modal de revisión | ☐ |
| 4 | Verificar info: estudiante, tipo, fecha | Datos correctos | ☐ |
| 5 | Verificar evidencia (si hay) | Imagen visible | ☐ |
| 6 | Click "Aprobar" | Modal se cierra | ☐ |
| 7 | Verificar status | Badge cambia a "Aprobada" | ☐ |

### 6.3 Verificar Notificación (Parent App)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Parent App: Ir a `/notifications` | Lista de notificaciones | ☐ |
| 2 | Ver notificación de aprobación | "Tu novedad fue aprobada" | ☐ |
| 3 | Ir a `/novedades` | Status: "Aprobada" (verde) | ☐ |

### 6.4 Verificar Novedad en Crew App

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Crew App: Ir a `/dashboard` | Dashboard | ☐ |
| 2 | Ver card de novedades | Badge: 1 ausencia | ☐ |
| 3 | Ir a ruta del día | Iniciar nuevo viaje | ☐ |
| 4 | En `/trips/[id]/start` | Banner de novedades visible | ☐ |
| 5 | Verificar: 1 ausente | Badge rojo con contador | ☐ |

### 6.5 Acusar Recibo de Novedad (Crew App)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Iniciar viaje | Ir a `/trips/[id]/active` | ☐ |
| 2 | Ver indicador de novedades | Banner ámbar visible | ☐ |
| 3 | Click en indicador | Ir a `/trips/[id]/students` | ☐ |
| 4 | Ver Carlos Rodríguez | Status: Ausente | ☐ |
| 5 | Abrir panel de novedades | Novedad de ausencia visible | ☐ |
| 6 | Click "Acusar" en novedad | Botón cambia a "Recibida" | ☐ |

### 6.6 Crear Novedad "Recoge Padre" (Auto-aprobación)

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Parent App: Ir a `/novedades/create` | Formulario | ☐ |
| 2 | Seleccionar: María López | Hijo seleccionado | ☐ |
| 3 | Tipo: Recoge Padre | Tipo seleccionado | ☐ |
| 4 | Fecha: mañana | Fecha válida | ☐ |
| 5 | Ruta: Entrega (dropoff) | Solo ruta de vuelta | ☐ |
| 6 | Razón: "Cita al dentista" | Campo llenado | ☐ |
| 7 | Click "Enviar" | Toast de éxito | ☐ |
| 8 | Verificar en `/novedades` | Status: "Confirmada" (auto) | ☐ |

**Nota:** Las novedades "Recoge Padre" no requieren aprobación del admin.

---

## Fase 7: Verificación de Viaje con Novedades Aplicadas

### 7.1 Día Siguiente - Iniciar Viaje con Ausencia

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Crew App: Ir a dashboard | Rutas del día | ☐ |
| 2 | Ver novedades del día | 1 ausencia, 1 recoge padre | ☐ |
| 3 | Iniciar ruta de recogida | `/trips/[id]/start` | ☐ |
| 4 | Verificar banner | Carlos: ausente | ☐ |
| 5 | Iniciar viaje | `/trips/[id]/active` | ☐ |
| 6 | Ver estudiantes | Carlos NO aparece en pendientes | ☐ |
| 7 | Solo 2 estudiantes para recoger | María y Pedro | ☐ |

### 7.2 Ruta de Entrega con Recoge Padre

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Iniciar ruta de entrega (PM) | `/trips/[id]/start` | ☐ |
| 2 | Verificar banner | María: recoge padre | ☐ |
| 3 | Iniciar viaje | `/trips/[id]/active` | ☐ |
| 4 | Ver estudiantes | María marcada "recoge padre" | ☐ |
| 5 | Solo entregar: Pedro | 1 estudiante a entregar | ☐ |

---

## Fase 8: Testing de Incidentes (Opcional)

### 8.1 Reportar Incidente Durante Viaje

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Crew App: Durante viaje activo | `/trips/[id]/active` | ☐ |
| 2 | Click "Reportar Incidente" | `/trips/[id]/incidents` | ☐ |
| 3 | Tipo: Retraso | Selector | ☐ |
| 4 | Severidad: Media | Selector | ☐ |
| 5 | Descripción: "Tráfico intenso" | Campo llenado | ☐ |
| 6 | Click "Reportar" | Toast de éxito | ☐ |

### 8.2 Verificar Incidente en Admin

| # | Paso | Resultado Esperado | ✓ |
|---|------|-------------------|---|
| 1 | Admin App: Ir a `/incidents` | Lista de incidentes | ☐ |
| 2 | Ver incidente reportado | Badge: Media (amarillo) | ☐ |
| 3 | Click para ver detalle | Info completa | ☐ |

---

## Checklist de Validación Final

### Datos Creados

| Entidad | Cantidad | IDs |
|---------|----------|-----|
| Vehículos | 1 | |
| Conductores | 1 | |
| Monitores | 0-1 | |
| Estudiantes | 3 | |
| Rutas | 2 | |
| Viajes | 2+ | |
| Novedades | 2 | |
| Incidentes | 0-1 | |

### Flujos Validados

| Flujo | Status |
|-------|--------|
| Login/Logout en 3 apps | ☐ |
| CRUD de vehículos | ☐ |
| CRUD de conductores | ☐ |
| CRUD de estudiantes | ☐ |
| Creación de rutas con wizard | ☐ |
| Optimización de ruta (polilínea) | ☐ |
| Inicio de viaje (lazy creation) | ☐ |
| GPS tracking en tiempo real | ☐ |
| Check-in de estudiantes | ☐ |
| Notificaciones de check-in | ☐ |
| Tracking en Parent App | ☐ |
| Creación de novedades | ☐ |
| Upload de evidencia | ☐ |
| Aprobación de novedades | ☐ |
| Auto-aprobación de parent_pickup | ☐ |
| Acuse de recibo de novedades | ☐ |
| Aplicación de novedades a viaje | ☐ |
| Reporte de incidentes | ☐ |

### Cross-App Communication

| Acción | Origen | Destino | Verificado |
|--------|--------|---------|------------|
| Crear estudiante | Admin | Parent (ve hijo) | ☐ |
| Crear ruta | Admin | Crew (ve ruta) | ☐ |
| Iniciar viaje | Crew | Parent (tracking) | ☐ |
| Check-in | Crew | Parent (notificación) | ☐ |
| Crear novedad | Parent | Admin (pendiente) | ☐ |
| Aprobar novedad | Admin | Parent (notificación) | ☐ |
| Aprobar novedad | Admin | Crew (ve novedad) | ☐ |
| Acusar recibo | Crew | Parent (notificación) | ☐ |

---

## Troubleshooting

### Problemas Comunes

| Problema | Causa Probable | Solución |
|----------|----------------|----------|
| "Convex error" | Backend no sincronizado | Reiniciar `npx convex dev` |
| No aparecen rutas | Recurrencia no incluye día actual | Verificar días de la semana |
| GPS no funciona | Permisos denegados | Permitir geolocalización en navegador |
| Notificaciones no llegan | Real-time no conectado | Verificar conexión Convex |
| QR no escanea | Cámara no permitida | Permitir acceso a cámara |

### Logs Útiles

```bash
# Ver logs de Convex
npx convex logs

# Ver errores específicos
npx convex logs --filter error
```

---

## Notas del Tester

**Fecha de ejecución:** ________________

**Tester:** ________________

**Ambiente:**
- Browser: ________________
- OS: ________________
- Resolución: ________________

**Observaciones:**

```
[Agregar notas aquí]
```

**Bugs encontrados:**

| # | Descripción | Severidad | Screenshot |
|---|-------------|-----------|------------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

---

## Referencias

- [ADMIN_PRD.md](../prd/ADMIN_PRD.md)
- [PARENT_PRD.md](../prd/PARENT_PRD.md)
- [CREW_PRD.md](../prd/CREW_PRD.md)
- [DATABASE_SCHEMA.md](../database/DATABASE_SCHEMA.md)
