# Crew App - Product Requirements Document

**App**: Crew App (Driver + Monitor)
**Location**: `apps/crew/`
**URL**: `crew.altaviapp.com`
**Version**: 1.0
**Status**: ✅ Implementado

---

## Overview

La Crew App es la aplicación móvil PWA para conductores y monitores/auxiliares. Permite operar viajes, realizar check-ins de estudiantes, reportar incidentes y gestionar novedades durante las rutas de transporte escolar.

### Usuarios

| Rol | Nombre UI | Permisos |
|-----|-----------|----------|
| **driver** | Conductor | Checklist, iniciar/terminar viaje, GPS, check-in (fallback) |
| **monitor** | Auxiliar | Check-in QR, reportar incidentes, ver novedades |

### Diferencias por Rol

| Funcionalidad | Conductor | Monitor |
|---------------|:---------:|:-------:|
| Login y ver rutas asignadas | ✅ | ✅ |
| Checklist pre-viaje | ✅ | ❌ |
| Iniciar/terminar viaje | ✅ | ❌ |
| GPS tracking (enviar) | ✅ | ❌ |
| Ver progreso del viaje | ✅ | ✅ |
| Check-in/out estudiantes (QR) | Solo fallback* | ✅ |
| Reportar incidentes | ❌ | ✅ |
| Ver notificaciones de padres | ❌ | ✅ |

*Conductor puede hacer check-in solo si no hay monitor asignado.

### Tech Stack

- Next.js 14+ PWA (instalable)
- Convex (real-time database)
- shadcn/ui + Tailwind CSS
- Google Maps (viaje activo) + Leaflet (otros mapas)
- Geolocation API (GPS)
- Camera API (QR scanner)

---

## Módulos

### 1. Dashboard (Inicio)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/dashboard` | ✅ | Pantalla principal con rutas del día |

**Funcionalidades**:
- [x] Saludo personalizado con nombre y rol
- [x] Resumen del día:
  - Viajes completados
  - Viajes programados
  - Estudiantes transportados
- [x] Lista de rutas de hoy para inicio rápido
- [x] Tarjetas de novedades del día
- [x] Estadísticas semanales
- [x] Notificaciones recientes

**Componentes clave**:
- `RouteCard` - Tarjeta de ruta disponible (lazy trip creation)
- `NovedadesCard` - Eventos especiales del día (**tipos dinámicos**)
- `WeeklyStats` - Resumen semanal (viajes, estudiantes, duración)
- `NotificationList` - Notificaciones recientes
- `VehicleCard` - Información del vehículo asignado

**Novedades del día**:
- [x] **Tipos dinámicos** - Los tipos de novedad se cargan desde configuración admin
- [x] Resumen por categoría: ausencias, recoge padre, cambio parada, otras
- [x] Lista de novedades (top 3) con nombre del estudiante y ruta
- [x] Soporte para tipos legacy y nuevos (typeCategorySnapshot)

**Hooks**:
- `useMyRoutes()` - Rutas asignadas al usuario
- `useNovedadesForDriverToday()` - Novedades del día
- `useMyTrips()` - Viajes del usuario
- `useNovedadTypes()` - Tipos configurables desde backend

---

### 2. Routes (Rutas)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/routes` | ✅ | Lista de rutas asignadas con filtros |
| `/routes/[id]` | ✅ | Detalle de ruta con paradas y estudiantes |
| `/routes/[id]/start` | ✅ | Confirmación de inicio (redirige a viaje) |

**Funcionalidades**:

*Lista de rutas*:
- [x] Tabs de filtro: Todas / Recogida / Entrega
- [x] Tarjetas de ruta con:
  - Nombre de ruta
  - Tipo (pickup/dropoff) con badge
  - Horario programado
  - Número de paradas
  - Número de estudiantes
  - Vehículo asignado
- [x] Estado de ruta (activa hoy según recurrencia)

*Detalle de ruta*:
- [x] Info completa: nombre, tipo, horario
- [x] Vehículo y conductor asignados
- [x] Lista de paradas con:
  - Número de orden
  - Dirección
  - Hora estimada (ETA)
  - Estudiantes en cada parada
- [x] Mapa con polilínea de ruta
- [x] Botón de iniciar viaje

*Validación de recurrencia*:
- [x] Diaria: verifica día de la semana
- [x] Semanal: verifica día específico
- [x] Mensual: verifica día del mes
- [x] Única: verifica fecha específica

**Componentes clave**:
- `RouteCard` - Tarjeta de ruta
- `RouteDetail` - Vista de detalle
- `StopsList` - Lista de paradas
- `RouteMap` - Mapa de ruta

**Hooks**:
- `useMyRoutes()` - Rutas asignadas
- `useRoute()` - Ruta individual con paradas
- `useRoutesForDriverToday()` - Rutas válidas para hoy

---

### 3. Calendar (Calendario)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/calendar` | ✅ | Vista mensual de viajes |

**Funcionalidades**:
- [x] Grid de calendario mensual
- [x] Indicadores de viajes por día
- [x] Colores por estado de viaje:
  - Azul: en ruta
  - Verde: completado
  - Amarillo: programado
  - Rojo: cancelado
- [x] Navegación rápida para iniciar/ver viajes
- [x] Filtro por período

**Componentes clave**:
- `CalendarGrid` - Grid mensual
- `DayCell` - Celda de día con indicadores
- `TripIndicator` - Indicador de viaje

**Hooks**:
- `useTripsForCrewByMonth()` - Viajes del mes

---

### 4. Trips (Viajes)
**Estado**: ✅ Implementado

Este es el módulo más complejo, con múltiples sub-rutas para el flujo completo del viaje.

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/trips/[id]` | ✅ | Resumen/detalle del viaje |
| `/trips/[id]/start` | ✅ | Confirmación de inicio con estado de checklist |
| `/trips/[id]/checklist` | ✅ | Checklist pre-viaje de inspección |
| `/trips/[id]/active` | ✅ | Viaje activo (mapa Google Maps, acciones rápidas) |
| `/trips/[id]/details` | ✅ | Detalles del viaje (tabs: info general, cronología) |
| `/trips/[id]/students` | ✅ | Lista de estudiantes con check-in |
| `/trips/[id]/map` | ✅ | Mapa a pantalla completa |

**Funcionalidades**:

#### 4.1 Detalle de Viaje (`/trips/[id]`)
- [x] Estado del viaje (programado, en ruta, completado, cancelado)
- [x] Info de ruta: nombre, tipo, horario
- [x] Info de vehículo y conductor
- [x] Lista de estudiantes con estado
- [x] Resumen de paradas

#### 4.2 Inicio de Viaje (`/trips/[id]/start`)
- [x] Confirmación antes de iniciar
- [x] Verificación de checklist completado
- [x] **Banner de novedades**:
  - [x] Contador total de novedades para el viaje
  - [x] Desglose por categoría (ausentes, recoge padre, cambio parada)
  - [x] Tipos dinámicos con iconos y colores
  - [x] Link a lista de estudiantes para ver detalles
- [x] Botón de iniciar viaje
- [x] Lazy trip creation (viaje creado al iniciar)

#### 4.3 Checklist Pre-viaje (`/trips/[id]/checklist`)
*Solo para conductores*

**Categorías de inspección**:
- [x] Mecánico: frenos, dirección, llantas, motor
- [x] Luces: delanteras, traseras, intermitentes, emergencia
- [x] Seguridad: cinturones, extintor, botiquín, salidas emergencia
- [x] Limpieza: interior, asientos, ventanas, pisos

**Funcionalidades**:
- [x] Expansión por categoría
- [x] Checkbox para cada ítem
- [x] Marcar ítem como "con problema"
- [x] Barra de progreso de completitud
- [x] Upload de fotos del vehículo
- [x] Resumen antes de continuar
- [x] Diálogo si hay problemas encontrados

#### 4.4 Viaje Activo (`/trips/[id]/active`)
**Funcionalidades principales**:

*Mapa interactivo (Google Maps)*:
- [x] Ubicación actual del vehículo con heading
- [x] Polilínea de ruta calculada (estilo Uber)
- [x] Marcadores de paradas (completadas, actual, próximas)
- [x] Marcador de escuela (inicio/destino)
- [x] GPS tracking en background (cada 15 segundos)
- [x] Overlays: velocidad (izq), progreso (der)
- [x] Vista visual únicamente (sin turn-by-turn)

*Tarjeta de próxima parada con check-in integrado*:
- [x] Nombre y dirección de la parada
- [x] Distancia en metros/km
- [x] ETA en minutos
- [x] Botón "IR" para navegación externa (Google Maps)
- [x] Lista de estudiantes de la parada con estados:
  - Pendiente (gris)
  - A bordo (azul)
  - Entregado (verde)
  - Ausente por novedad (rojo)
  - Recoge padre (amarillo)
- [x] Botón de check-in individual por estudiante

*Indicador de novedades*:
- [x] Banner compacto debajo del header si hay novedades
- [x] Contador de novedades totales
- [x] Badge de ausencias si aplica
- [x] Link directo a lista de estudiantes

*Acciones rápidas (3 botones)*:
- [x] **Incidente**: Abre `IncidentReportModal` (flujo de 3 pasos en modal)
- [x] **Relevo**: Abre `RelayModeModal` (cambio de vehículo)
- [x] **Detalles**: Navega a `/trips/[id]/details`

*Botón terminar viaje*:
- [x] Botón principal al fondo de la pantalla
- [x] Confirmación antes de terminar

*ETA en tiempo real*:
- [x] Cálculo basado en distancia Haversine
- [x] Tracking de velocidad
- [x] Estado de delay (a tiempo, ligero retraso, retrasado, muy retrasado)

#### 4.5 Detalles del Viaje (`/trips/[id]/details`)
**Sub-página con tabs**:

*Tab 1 - Info General*:
- [x] Información del viaje (ruta, tipo, hora inicio, duración)
- [x] Información del vehículo y tripulación
- [x] Lista de paradas con estudiantes agrupados
- [x] Estados visuales por parada (completada, actual, pendiente)
- [x] Estados de estudiantes con iconos y colores

*Tab 2 - Cronología*:
- [x] Timeline de eventos del viaje ordenado cronológicamente
- [x] Fuentes: `tripEvents` + `studentCheckins`
- [x] Eventos mostrados:
  - Viaje iniciado/completado
  - Llegada/salida de paradas
  - Check-in/checkout de estudiantes
  - Incidentes reportados
  - Cambios de relevo
- [x] Indicador de tiempo relativo
- [x] Actor que realizó la acción

#### 4.6 Estudiantes (`/trips/[id]/students`)
**Funcionalidades**:
- [x] Lista agrupada por parada
- [x] Estados de check-in:
  - Pendiente (gris)
  - A bordo (azul)
  - Entregado (verde)
- [x] Panel de novedades por estudiante:
  - **Tipos dinámicos** con iconos y colores configurables
  - Soporte para tipos legacy y nuevos (typeCategorySnapshot)
  - Ausencia, recoge padre, cambio de parada, salida temprana, llegada tarde
  - Tipos personalizados creados por admin
- [x] **Indicador de evidencia** (icono clip) si la novedad tiene adjuntos
- [x] Modal de detalle de estudiante
- [x] Botón de reconocer novedad
- [x] Búsqueda/filtro de estudiantes

*Check-in*:
- [x] QR scanner para escanear código
- [x] Check-in manual (si QR falla)
- [x] Validación: ruta correcta, parada correcta, viaje activo
- [x] Registro de timestamp y GPS
- [x] Notificación automática a padres

#### 4.7 Incidentes (Modal desde viaje activo)
**Componente**: `IncidentReportModal` (accesible desde botón "Incidente" en viaje activo)

**Flujo de 3 pasos en modal**:
1. Selección de tipo de incidente
2. Formulario con detalles (severidad, descripción, estudiante afectado)
3. Confirmación de éxito

**Tipos de incidente**:
- Accidente
- Médico
- Problema con estudiante
- Problema de ruta
- Retraso
- Otro

**Niveles de severidad**:
- Crítico (rojo)
- Alto (naranja)
- Medio (amarillo)
- Bajo (verde)

**Funcionalidades**:
- [x] Selección de tipo con iconos
- [x] Selección de severidad
- [x] Captura de ubicación GPS automática
- [x] Selección de estudiante afectado (para incidentes tipo "student")
- [x] Minutos de retraso (para incidentes tipo "delay")
- [x] Campo de descripción
- [x] Notificación automática a admin
- [x] Confirmación con ID de incidente
- [x] Registro de evento en `tripEvents`

#### 4.8 Mapa Completo (`/trips/[id]/map`)
- [x] Mapa a pantalla completa
- [x] Overlay de próxima parada
- [x] Controles de zoom
- [x] Botón de centrar en vehículo
- [x] Link de navegación externa

**Componentes clave**:
- `GoogleRouteMap` - Mapa interactivo (Google Maps, `@altaviapp/maps`)
- `NextStopCard` - Tarjeta de próxima parada con estudiantes y check-in integrado
- `QuickActions` - 3 botones de acción (Incidente, Relevo, Detalles)
- `IncidentReportModal` - Modal de reporte de incidentes (3 pasos)
- `RelayModeModal` - Modal de cambio de vehículo
- `TripTimeline` - Cronología de eventos del viaje
- `StopStudentsList` - Lista de paradas con estudiantes agrupados
- `ActiveTripFAB` - Botón flotante de viaje activo
- `GPSStatus` - Indicador de estado GPS
- `MapControls` - Controles del mapa
- `StopMarker` - Marcador de parada
- `ChecklistCategory` - Categoría de checklist
- `ChecklistItem` - Ítem de checklist
- `ChecklistProgress` - Barra de progreso
- `QRScanner` - Escáner de código QR
- `CheckinSheet` - Sheet de check-in con QR y selección manual

**Hooks**:
- `useTrip()` - Viaje individual
- `useTripStudents()` - Estudiantes del viaje con novedades
- `useActiveTrip()` - Viaje activo actual
- `useGPSTracking()` - Tracking GPS
- `useCheckinMutations()` - Mutaciones de check-in (recordCheckin, cancelCheckin)
- `usePendingStudents()` - Estudiantes pendientes de check-in
- `useStudentByQR()` - Buscar estudiante por código QR
- `useNovedadesForTrip()` - Novedades que afectan el viaje
- `useNovedadTypes()` - Tipos configurables desde backend
- `useIncidentMutations()` - Mutaciones de incidentes (createIncident)

**Queries Convex relevantes**:
- `tripEvents.getTripFullTimeline` - Timeline combinado de eventos y check-ins

**Flujo de novedades desde perspectiva del crew**:
```
┌─────────────────────────────────────────────────────────────────┐
│             FLUJO DE NOVEDADES - PERSPECTIVA CREW               │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PARENT/ADMIN                        CREW                       │
│  ────────────                        ────                       │
│                                                                 │
│  Novedad aprobada ────────────────►  Ve en Dashboard            │
│       │                              (NovedadesCard)            │
│       │                                   │                     │
│       │                                   ▼                     │
│       │                              Ve en /trips/[id]/start    │
│       │                              (Banner de novedades)      │
│       │                                   │                     │
│       │                                   ▼                     │
│       │                              Inicia viaje               │
│       │                                   │                     │
│       │                                   ▼                     │
│       │                              Ve en /trips/[id]/active   │
│       │                              (Indicador compacto)       │
│       │                                   │                     │
│       │                                   ▼                     │
│       │                              Ve en /trips/[id]/students │
│       │                              (Panel por estudiante)     │
│       │                                   │                     │
│       │                                   ▼                     │
│       │                              Acusa recibo ──────────►   │
│       │                              (acknowledge)   Status:    │
│       │                                   │          acknowledged│
│       │                                   ▼                     │
│       │                              Viaje termina ─────────►   │
│                                      (auto-apply)    Status:    │
│                                                      applied    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

*Estados visibles para crew*:
| Estado | Badge en UI | Acción del crew |
|--------|-------------|-----------------|
| `approved` | Pendiente (amarillo) | Debe acusar recibo |
| `acknowledged` | Confirmada (azul) | Ya confirmó, se aplicará al viaje |
| `applied` | Aplicada (gris) | Ya se aplicó a tripStudents |

*Efectos de las categorías en la operación*:
| Categoría | Efecto para crew |
|-----------|------------------|
| `absence` | Estudiante no aparece en lista de pendientes |
| `pickup_change` | Estudiante marcado "recoge padre", no abordar |
| `stop_change` | Estudiante aparece en parada diferente |
| `time_change` | Solo informativo, horario diferente |
| `other` | Solo informativo, revisar notas |

---

### 5. Profile (Perfil)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/profile` | ✅ | Perfil con 3 tabs (Perfil, Historial, Configuración) |
| `/profile/edit` | ✅ | Editar perfil (formulario específico por rol) |

**Funcionalidades**:

#### Tab 1 - Perfil
*Info común*:
- [x] Foto/avatar
- [x] Nombre completo
- [x] Email
- [x] Teléfono
- [x] Rol (Conductor/Auxiliar)

*Info de conductor*:
- [x] Número de licencia
- [x] Tipo de licencia (C/D/E)
- [x] Fecha de vencimiento
- [x] Años de experiencia

*Info de monitor*:
- [x] Documento de identidad
- [x] Certificación primeros auxilios
- [x] Certificación cuidado infantil

*Estadísticas*:
- [x] Viajes completados
- [x] Estudiantes transportados
- [x] Días trabajados
- [x] Rating (si aplica)

#### Tab 2 - Historial
- [x] Lista de viajes pasados
- [x] Filtros: 7 días, 30 días, 90 días
- [x] Info por viaje:
  - Fecha
  - Ruta
  - Tipo
  - Duración
  - Estudiantes
  - Estado final

#### Tab 3 - Configuración
*Notificaciones*:
- [x] Toggle de notificaciones push
- [x] Toggle de vibración
- [x] Toggle de sonido

*Mapas*:
- [x] Tipo de vista (satélite, calles, terreno)
- [x] Auto-centrar
- [x] Mostrar tráfico

*Seguridad*:
- [x] Cambiar contraseña
- [x] Cerrar sesión en todos los dispositivos

*App*:
- [x] Versión de la app
- [x] Última actualización
- [x] Ayuda y soporte
- [x] Cerrar sesión

**Componentes clave**:
- `GlobalProfileSection` - Info común
- `DriverProfileSection` - Info específica de conductor
- `MonitorProfileSection` - Info específica de monitor
- `TripHistoryList` - Lista de historial
- `SettingsToggles` - Toggles de configuración

**Hooks**:
- `useProfile()` - Perfil del usuario
- `useDriverTripHistory()` - Historial de viajes

---

## Authentication (Autenticación)
**Estado**: ✅ Implementado

**Rutas públicas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/login` | ✅ | Inicio de sesión |
| `/signup-invitation` | ✅ | Registro por invitación |
| `/verify-email` | ✅ | Verificación de email |
| `/forgot-password` | ✅ | Solicitud de reset |
| `/reset-password` | ✅ | Reset de contraseña |
| `/permissions` | ✅ | Solicitud de permisos (GPS, notificaciones) |
| `/welcome` | ✅ | Pantalla de bienvenida/onboarding |

**Funcionalidades**:
- [x] Login con email/contraseña
- [x] Registro por invitación del admin
- [x] Verificación de email
- [x] Reset de contraseña
- [x] Solicitud de permisos de dispositivo
- [x] Onboarding para nuevos usuarios

---

## Cross-Cutting Requirements

### PWA Features
- [x] Instalable en iOS y Android (manifest)
- [x] Service worker para cache
- [x] Icono de app en home screen
- [ ] Modo offline (parcial, no completamente testeado)

### GPS Tracking
- [x] Geolocation API de alta precisión
- [x] Solicitud de permisos
- [x] Tracking en background durante viaje activo
- [x] Actualizaciones cada 15 segundos
- [x] Detección de velocidad
- [x] Geofence para paradas

### Real-time
- [x] Convex subscriptions para datos de viaje
- [x] Actualizaciones de estudiantes
- [x] Novedades en tiempo real
- [x] Notificaciones in-app

### Navegación Móvil
- [x] Bottom navigation en móvil (4 items: Inicio, Calendario, Rutas, Perfil)
- [x] Sidebar en desktop
- [x] Navegación contextual durante viaje activo
- [x] Safe area para dispositivos con notch

### Permisos de Dispositivo
- [x] Geolocalización
- [x] Cámara (para QR)
- [x] Notificaciones push

### Notificaciones
**Estado**: ✅ Implementado

**UI de Notificaciones**:
- [x] `NotificationDropdown` - Panel desplegable en header (móvil-optimizado)
  - Icono campana con badge de conteo
  - Últimas 10 notificaciones
  - Diseño móvil con targets táctiles grandes
  - Iconos por categoría
  - "Marcar todas como leídas"
- [x] `NotificationList` en Dashboard - Últimas 3 notificaciones

**Categorías de Notificación**:
| Categoría | Icono | Color | Descripción |
|-----------|-------|-------|-------------|
| novedad | Bell | Azul primario | Novedades de padres |
| trip_update | Bus | Azul info | Actualizaciones de viaje |
| checkin | CheckCircle | Verde | Check-ins exitosos |
| incident | AlertTriangle | Rojo | Incidentes reportados |
| system | Info | Gris | Notificaciones del sistema |

**Eventos Recibidos por Crew**:
| Evento | Tipo | Categoría | Mensaje |
|--------|------|-----------|---------|
| Nueva novedad para viaje | info/warning | novedad | "Nueva novedad: {estudiante} - {tipo}" |
| Novedad pendiente de acuse | info | novedad | "Tienes {N} novedades sin confirmar" |
| Viaje con ausencias | warning | novedad | "Este viaje tiene {N} ausencias" |
| Novedad cancelada | info | novedad | "La novedad de {estudiante} fue cancelada" |
| Estudiante check-in exitoso | success | checkin | "{estudiante} abordó en {parada}" |

**Eventos Enviados por Crew**:
| Acción | Destinatario | Categoría | Mensaje |
|--------|--------------|-----------|---------|
| Check-in de estudiante | Parent | checkin | "{estudiante} ha subido al bus" |
| Check-out de estudiante | Parent | checkin | "{estudiante} ha sido entregado" |
| Acusar recibo novedad | Parent | novedad | "El conductor confirmó la novedad" |
| Reportar incidente | Admin + Parent | incident | "Se reportó un incidente: {tipo}" |
| Viaje iniciado | Admin | trip_update | "Viaje {ruta} ha iniciado" |
| Viaje completado | Admin | trip_update | "Viaje {ruta} completado" |

**Deep Linking**:
- Notificación con `relatedEntityType: "novedad"` → Muestra detalle en novedades del viaje
- Notificación con `relatedEntityType: "trip"` → Navega al viaje activo
- Notificación con `relatedEntityType: "student"` → Muestra estudiante en lista

**Hooks**:
- `useNotifications(options?)` - Lista de notificaciones con filtros
- `useUnreadCount()` - Conteo de no leídas en tiempo real
- `useNotificationMutations()` - markAsRead, markAllAsRead, deleteNotification
- `useUnreadNotifications(limit?)` - Convenience wrapper

**Archivos App**:
- `apps/crew/src/hooks/useNotifications.ts` - Hooks de notificaciones
- `apps/crew/src/components/layout/NotificationDropdown.tsx` - Wrapper con navegación (variant="mobile")
- `apps/crew/src/components/dashboard/NotificationList.tsx` - Wrapper para dashboard

**Componentes Compartidos** (`@altaviapp/ui`):
Los componentes de notificación están estandarizados en el paquete compartido para consistencia cross-app:

| Componente | Descripción |
|------------|-------------|
| `NotificationDropdown` | Panel desplegable con badge, variantes desktop/mobile |
| `NotificationItem` | Fila individual con icono, contenido, tiempo |
| `NotificationList` | Lista para dashboard con header y "ver todas" |

**Utilidades Compartidas**:
- `CATEGORY_CONFIG` - Iconos y colores por categoría
- `TYPE_CONFIG` - Iconos y colores por tipo (success, info, warning, error)
- `formatRelativeTime()` - Formato de tiempo relativo en español ("Hace X min")
- `getNotificationConfig()` - Obtener config por categoría o tipo

**Tipos Compartidos** (`@altaviapp/ui`):
```typescript
type NotificationCategory = 'checkin' | 'trip_update' | 'eta' | 'novedad' |
  'incident' | 'relay' | 'approval_request' | 'system';
type NotificationType = 'success' | 'info' | 'warning' | 'error';
type RelatedEntityType = 'trip' | 'student' | 'novedad' | 'incident' |
  'vehicle' | 'route_change_request';
```

**Variante Mobile**:
Crew usa `variant="mobile"` que proporciona:
- Touch targets de 44x44px mínimo
- Panel más ancho (100vw - 2rem)
- Max-height: 70vh
- Tipografía ligeramente más grande

---

## Requisitos Pendientes (v2.0)

- [ ] Modo offline completo (viaje sin conexión)
- [ ] Sincronización en background
- [ ] Upload real de fotos en checklist
- [ ] Upload real de fotos en incidentes
- [ ] QR scanner mejorado
- [ ] Push notifications nativas
- [ ] Llamada directa a padres desde lista de estudiantes

---

## Referencias

- **Wireframes**: [docs/design/CREW_WIREFRAMES.md](../design/CREW_WIREFRAMES.md)
- **API**: [docs/api/API_ENDPOINTS.md](../api/API_ENDPOINTS.md)
- **Schema**: [docs/database/DATABASE_SCHEMA.md](../database/DATABASE_SCHEMA.md)
- **Tech Spec**: [Technical-Specification.md](../../Technical-Specification.md)
- **ETA System**: [docs/features/REAL_TIME_ETA.md](../features/REAL_TIME_ETA.md)
