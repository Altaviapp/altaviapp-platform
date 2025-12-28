# Admin Dashboard - Product Requirements Document

**App**: Admin Dashboard
**Location**: `apps/admin/`
**URL**: `admin.altaviapp.com`
**Version**: 1.0
**Status**: ✅ Implementado

---

## Overview

El Admin Dashboard es el panel de administración para coordinadores escolares y super administradores. Permite gestionar la flota de vehículos, conductores, monitores, estudiantes, rutas y monitorear viajes en tiempo real.

### Usuarios

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **super_admin** | Administrador de plataforma | Acceso total, multi-institución |
| **admin** | Coordinador de institución | Gestión completa de su institución |

### Tech Stack

- Next.js 14+ PWA
- Convex (real-time database)
- shadcn/ui + Tailwind CSS
- Leaflet + OpenStreetMap (mapas)

---

## Módulos

### 1. Dashboard
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/dashboard` | ✅ | Panel principal con métricas |

**Funcionalidades**:
- [x] Grid de 6 métricas en tiempo real:
  - Viajes activos
  - Vehículos activos
  - Total estudiantes
  - Conductores activos
  - Rutas activas
  - Incidentes abiertos
- [x] Sección de viajes activos (top 3) con status, ruta, vehículo
- [x] Sección de alertas recientes (últimos 3 incidentes)
- [x] Acciones rápidas: ver en mapa, ver detalles

**Componentes clave**:
- `StatCard` - Tarjeta de métrica con icono y color
- `ActiveTripsSection` - Lista de viajes en curso
- `RecentAlertsSection` - Alertas/incidentes recientes

**Hooks**:
- `useActiveTrips()` - Viajes activos en tiempo real
- `useVehicles()` - Lista de vehículos
- `useStudents()` - Lista de estudiantes
- `useDrivers()` - Lista de conductores
- `useRoutes()` - Lista de rutas
- `useIncidents()` - Incidentes

---

### 2. Fleet Management (Flota)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/fleet` | ✅ | Lista con tabs (vehículos, conductores, monitores) |
| `/fleet/vehicles/new` | ✅ | Crear vehículo |
| `/fleet/vehicles/[id]` | ✅ | Detalle de vehículo |
| `/fleet/vehicles/[id]/edit` | ✅ | Editar vehículo |
| `/fleet/drivers/new` | ✅ | Crear conductor |
| `/fleet/drivers/[id]` | ✅ | Detalle de conductor |
| `/fleet/drivers/[id]/edit` | ✅ | Editar conductor |
| `/fleet/monitors/new` | ✅ | Crear monitor/auxiliar |
| `/fleet/monitors/[id]` | ✅ | Detalle de monitor |
| `/fleet/monitors/[id]/edit` | ✅ | Editar monitor |
| `/fleet/gps-devices` | ✅ | Lista de dispositivos GPS |
| `/fleet/gps-devices/[id]/configure` | ✅ | Configurar dispositivo GPS |
| `/fleet/gps-devices/[id]/history` | ✅ | Historial de dispositivo GPS |

**Funcionalidades**:

*Vehículos*:
- [x] CRUD completo (crear, leer, actualizar, eliminar)
- [x] Campos: placa, marca, modelo, año, color, capacidad
- [x] Estados: activo, mantenimiento, fuera_de_servicio
- [x] Configuración GPS (móvil, dispositivo, API)
- [x] Búsqueda y filtros por estado

*Conductores*:
- [x] CRUD completo
- [x] Campos: nombre, teléfono, email, licencia, tipo (C/D/E), vencimiento
- [x] Contacto de emergencia
- [x] Estados: activo, inactivo
- [x] Búsqueda

*Monitores/Auxiliares*:
- [x] CRUD completo
- [x] Campos: nombre, teléfono, email, documento de identidad
- [x] Certificaciones: primeros auxilios, cuidado infantil
- [x] Contacto de emergencia
- [x] Estados: activo, inactivo

*Dispositivos GPS*:
- [x] Lista de dispositivos registrados
- [x] Configuración por dispositivo
- [x] Historial de ubicaciones

**Componentes clave**:
- Tabs: Vehículos / Conductores / Monitores
- Tablas con búsqueda y filtros
- Formularios de creación/edición
- Badges de estado

**Requisitos pendientes (v2.0)**:
- [ ] Documentos de vehículos (seguro, inspección)
- [ ] Alertas de vencimiento de documentos
- [ ] Historial de mantenimiento

---

### 3. Students (Estudiantes)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/students` | ✅ | Lista de estudiantes con filtros |
| `/students/new` | ✅ | Crear estudiante |
| `/students/[id]` | ✅ | Detalle de estudiante |
| `/students/[id]/edit` | ✅ | Editar estudiante |
| `/students/[id]/qr` | ✅ | Ver/descargar código QR |
| `/students/import` | ✅ | Importación masiva CSV |

**Funcionalidades**:

*Gestión de estudiantes*:
- [x] CRUD completo
- [x] Campos: nombre, apellido, grado, fecha nacimiento
- [x] Ubicación de hogar (latitud, longitud, dirección)
- [x] Email de padre/tutor (principal y secundario)
- [x] Contactos de emergencia (teléfono, relación)
- [x] Notas médicas
- [x] Estados: activo, inactivo

*Búsqueda y filtros*:
- [x] Búsqueda por nombre
- [x] Filtro por grado
- [x] Filtro por estado
- [x] Indicador de ubicación asignada

*Código QR*:
- [x] Generación automática al crear estudiante
- [x] Contenido JSON: studentId, institutionId, timestamp
- [x] Vista de QR individual
- [x] Descarga e impresión

*Importación masiva*:
- [x] Upload de archivo CSV
- [x] Validación previa con preview
- [x] Detección de errores inline
- [x] Detección de hogares (agrupar por parentEmail)
- [x] Plantilla CSV descargable

*Invitación de padres*:
- [x] Enviar invitación ahora o guardar para después
- [x] Estados: provisorio → invitado → activo
- [x] Soporte para tutor secundario

**Componentes clave**:
- `StudentTable` - Tabla con columnas: avatar, nombre, grado, ubicación, estado, QR
- `StudentForm` - Formulario de creación/edición
- `ImportWizard` - Wizard de importación CSV
- `QRCodeView` - Vista de código QR con acciones

**Hooks**:
- `useStudents()` - Lista de estudiantes con filtros
- `useStudent()` - Estudiante individual

---

### 4. Routes (Rutas)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/routes` | ✅ | Lista de rutas con filtros |
| `/routes/new` | ✅ | Wizard de creación (3 pasos) |
| `/routes/[id]` | ✅ | Detalle de ruta con mapa |
| `/routes/[id]/edit` | ✅ | Editar ruta (mismo wizard) |

**Funcionalidades**:

*Lista de rutas*:
- [x] Stats: total, activas, vehículos asignados, estudiantes
- [x] Búsqueda por nombre
- [x] Filtro por tipo (recogida/entrega)
- [x] Filtro por estado (activa/inactiva)
- [x] Tabla: nombre, tipo, horario, paradas, estudiantes, vehículo

*Wizard de creación (3 pasos)*:

**Paso 1 - Planificación**:
- [x] Tipo de ruta: pickup (recogida) o dropoff (entrega)
- [x] Hora objetivo: llegada a escuela (pickup) o salida (dropoff)
- [x] Selección de vehículo (muestra capacidad)
- [x] Selección de conductor (requerido)
- [x] Selección de monitor (opcional)
- [x] Nombre de ruta (auto-generado o personalizado)

**Paso 2 - Asignación de paradas**:
- [x] Header con info de ruta y stats dinámicos
- [x] Selector de estudiantes con tabs: Disponibles / Seleccionados
- [x] Filtro por nombre y grado
- [x] Solo muestra estudiantes sin ruta del mismo tipo Y con ubicación
- [x] Mapa interactivo con escuela y estudiantes seleccionados
- [x] Botón "Calcular Ruta" para optimización
- [x] Optimización Haversine para orden óptimo de paradas
- [x] Cálculo de ETAs basado en hora objetivo
- [x] Visualización de polilínea optimizada
- [x] Tab Seleccionados: número de parada, nombre, ETA
- [x] Reordenamiento manual con drag-and-drop
- [x] Botón "Recalcular" después de cambios

**Paso 3 - Confirmación**:
- [x] Selector de recurrencia:
  - Diaria: seleccionar días de la semana
  - Semanal: seleccionar día
  - Mensual: seleccionar día del mes
  - Única: seleccionar fecha específica
- [x] Resumen de ruta completo
- [x] Mini-mapa con visualización final
- [x] Toggle activa/inactiva

*Detalle de ruta*:
- [x] Mapa con polilínea y paradas
- [x] Lista de paradas con estudiantes y ETAs
- [x] Info de vehículo y conductor
- [x] Acciones: editar, activar/desactivar, eliminar

**Componentes clave**:
- `RouteWizard` - Wizard de 3 pasos
- `StudentAssignment` - Selector de estudiantes
- `RouteOptimizer` - Optimización de ruta
- `RecurrenceSelector` - Selector de recurrencia
- `AddStopModal` - Modal para agregar paradas

**Hooks**:
- `useRoutes()` - Lista de rutas
- `useRoute()` - Ruta individual con paradas
- `useAvailableStudents()` - Estudiantes disponibles para asignar

---

### 5. Trips (Viajes)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/trips` | ✅ | Monitoreo de viajes del día |
| `/trips/[id]` | ✅ | Detalle de viaje |

**Funcionalidades**:

*Monitoreo en tiempo real*:
- [x] Stats: activos, completados hoy, cancelados, programados
- [x] Toggle de auto-refresh
- [x] Sección de viajes activos con:
  - Icono de estado (en ruta, programado, completado, cancelado)
  - Nombre de ruta, placa de vehículo
  - Tipo de ruta (recogida/entrega)
  - Fecha programada
  - Acciones: ver, mapa
- [x] Tabla de viajes programados:
  - Ruta, tipo, vehículo, fecha
  - Botón de iniciar viaje

*Detalle de viaje*:
- [x] Estado del viaje
- [x] Mapa con ubicación actual
- [x] Lista de estudiantes con estado de check-in
- [x] Info de conductor y vehículo
- [x] Historial de paradas

**Componentes clave**:
- `ActiveTripsSection` - Lista de viajes activos
- `ScheduledTripsTable` - Tabla de viajes programados
- `TripDetailView` - Vista de detalle

**Hooks**:
- `useTodaysTrips()` - Viajes del día
- `useTrips()` - Todos los viajes con filtros
- `useTrip()` - Viaje individual

---

### 6. Incidents (Incidentes)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/incidents` | ✅ | Lista de incidentes con filtros |
| `/incidents/new` | ✅ | Crear incidente |
| `/incidents/[id]` | ✅ | Detalle de incidente |

**Funcionalidades**:

*Lista de incidentes*:
- [x] Stats: total, abiertos, en proceso, resueltos
- [x] Búsqueda por descripción/tipo
- [x] Filtro por estado (todos, abiertos, en proceso, resueltos)
- [x] Tarjetas de incidente con:
  - Icono y label de tipo
  - Badge de severidad (baja, media, alta, crítica)
  - Descripción
  - Fecha/hora
  - Badge de estado
  - Acciones: ver, resolver

*Tipos de incidente*:
- Accidente
- Avería
- Comportamiento
- Emergencia
- Retraso
- Ruta

*Niveles de severidad*:
- Baja (verde)
- Media (amarillo)
- Alta (naranja)
- Crítica (rojo)

*Flujo de resolución*:
- [x] Admin puede resolver incidentes abiertos
- [x] Notas de resolución
- [x] Tracking de quién resolvió

**Componentes clave**:
- `IncidentCard` - Tarjeta de incidente
- `IncidentForm` - Formulario de creación
- `ResolveDialog` - Diálogo de resolución

**Hooks**:
- `useIncidents()` - Lista de incidentes
- `useIncident()` - Incidente individual

**Requisitos pendientes (v2.0)**:
- [ ] Adjuntos de fotos/videos
- [ ] Historial de cambios de estado

---

### 7. Requests (Solicitudes)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/requests` | ✅ | Panel de solicitudes con tabs |

**Funcionalidades**:

*Tabs de solicitudes*:

**Tab 1 - Novedades (cambios diarios)**:
- [x] Lista de novedades pendientes de aprobación
- [x] Tipos: ausencia, recoge padre, cambio de parada, salida temprana, llegada tarde
- [x] Info: estudiante, grado, tipo, razón, solicitante, fecha
- [x] Modal de revisión con:
  - Info del estudiante
  - Tipo de novedad
  - Fecha afectada
  - Tipo de ruta afectada (ida, entrega, ambos)
  - Razón
  - Notas de revisión (opcional)
  - Botones aprobar/rechazar

**Tab 2 - Cambios Permanentes**:
- [x] Lista de solicitudes de cambio de ruta pendientes
- [x] Tipos: cambio de horario, cambio de parada, cambio de ruta, suspensión
- [x] Info: estudiante, grado, tipo, razón, solicitante, fecha
- [x] Modal de revisión similar

**Tab 3 - Incidentes**:
- [x] Link a página de incidentes
- [x] Vista rápida de severidad y estado

*Flujo de aprobación*:
- [x] Novedades de "recoge padre": NO requieren aprobación (efecto inmediato)
- [x] Otras novedades: requieren aprobación del coordinador
- [x] Estados: pendiente → aprobado/rechazado → aplicado

**Componentes clave**:
- `NovedadesTab` - Lista de novedades
- `PermanentChangesTab` - Lista de cambios permanentes
- `ReviewModal` - Modal de revisión con formulario

**Hooks**:
- `usePendingNovedades()` - Novedades pendientes
- `usePendingRequests()` - Cambios permanentes pendientes
- `useNovedadReviewMutations()` - Aprobar/rechazar novedades
- `useReviewMutations()` - Aprobar/rechazar cambios

---

### 8. Users (Usuarios)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/users` | ✅ | Lista de usuarios con filtros |
| `/users/[id]` | ✅ | Detalle de usuario |
| `/settings/users/[id]/edit` | ✅ | Editar usuario |

**Funcionalidades**:

*Lista de usuarios*:
- [x] Stats: total, admins, drivers, parents
- [x] Búsqueda por nombre/email
- [x] Filtro por rol (todos, admin, driver, monitor, parent)
- [x] Tabla con:
  - Avatar con iniciales, nombre
  - Email
  - Badge de rol con color
  - Estado (activo, pendiente, inactivo)
  - Último login (relativo: "Hace X min", "Ayer", etc.)

*Invitación de usuarios*:
- [x] Modal de invitación
- [x] Formulario: email, rol, mensaje
- [x] Envío de email de invitación

*Roles y colores*:
- Super Admin: rojo
- Admin: morado
- Driver: azul
- Monitor: verde
- Parent: azul claro

**Componentes clave**:
- `UsersTable` - Tabla de usuarios
- `InviteUserModal` - Modal de invitación
- `RoleBadge` - Badge de rol con color

**Hooks**:
- `useUsers()` - Lista de usuarios
- `useUserStats()` - Estadísticas de usuarios

---

### 9. Settings (Configuración)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/settings` | ✅ | Página de configuración con tabs |
| `/settings/grades` | ✅ | Configuración de grados |
| `/settings/users/new` | ✅ | Crear usuario |

**Funcionalidades**:

*Tab Institución*:
- [x] Logo de institución (upload)
- [x] Nombre, dirección, teléfono, email
- [x] Selector de timezone (Ecuador, Colombia, Perú)

*Tab Notificaciones*:
- [x] Toggle de notificaciones:
  - Inicio de viaje
  - Fin de viaje
  - Alertas de retraso
  - Notificaciones de incidentes
  - Reporte diario por email

*Tab Seguridad*:
- [x] Cambio de contraseña
- [x] Autenticación de dos factores (UI, no implementado)
- [x] Sesiones activas
- [x] Tabla de roles y permisos

*Tab General*:
- [x] Selector de idioma (Español, English)
- [x] Formato de fecha (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
- [x] Formato de hora (24h, 12h)
- [x] Intervalo de actualización GPS (10s, 15s, 30s, 60s)

*Ubicación de escuela*:
- [x] Configuración de ubicación (latitud, longitud, dirección)
- [x] Usada como origen/destino en rutas
- [x] Mapa interactivo para selección

*Grados*:
- [x] Grados personalizados por institución
- [x] Presets: Prekinder a 12vo
- [x] Usados en formularios de estudiantes

**Componentes clave**:
- `SettingsTabs` - Navegación de configuración
- `InstitutionForm` - Formulario de institución
- `NotificationToggles` - Toggles de notificaciones
- `SecuritySettings` - Configuración de seguridad
- `GradeConfiguration` - Gestión de grados

---

## Authentication (Autenticación)
**Estado**: ✅ Implementado

**Rutas públicas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/login` | ✅ | Inicio de sesión |
| `/signup` | ✅ | Registro de institución |
| `/signup-invitation` | ✅ | Registro por invitación |
| `/verify-email` | ✅ | Verificación de email (código 6 dígitos) |
| `/verify` | ✅ | Verificación alternativa |
| `/forgot-password` | ✅ | Solicitud de reset |
| `/reset-password` | ✅ | Reset de contraseña |
| `/plans` | ✅ | Planes de suscripción |
| `/` | ✅ | Landing page |

**Funcionalidades**:
- [x] Login con email/contraseña
- [x] Registro de institución con plan
- [x] Verificación de email (código 6 dígitos, 24h expiración)
- [x] Botón de verificación con un clic
- [x] Reset de contraseña (código 6 dígitos, 1h expiración)
- [x] Bloqueo después de 5 intentos fallidos (30 min)
- [x] Sesiones de 30 días por defecto

---

## Cross-Cutting Requirements

### Multi-tenancy
- [x] Todas las queries filtradas por `institutionId`
- [x] Aislamiento de datos entre instituciones
- [x] Super admin puede acceder a todas las instituciones

### RBAC (Role-Based Access Control)
- [x] Verificación de rol en todas las mutaciones
- [x] UI adapta opciones según rol

### Real-time
- [x] Convex live queries para datos en tiempo real
- [x] Subscripciones para actualizaciones de viajes
- [x] Updates de GPS cada 15 segundos

### Internacionalización
- [x] Español como idioma principal
- [x] Soporte multi-país: Ecuador (+593), Colombia (+57)
- [x] Timezones: America/Guayaquil, America/Bogota
- [x] Formato fecha: DD/MM/YYYY
- [x] Formato hora: 24h

---
