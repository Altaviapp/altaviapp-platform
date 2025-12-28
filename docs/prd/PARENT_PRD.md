# Parent Portal - Product Requirements Document

**App**: Parent Portal (Portal Padres)
**Location**: `apps/parent/`
**URL**: `padres.altaviapp.com`
**Version**: 1.0
**Status**: ✅ Implementado

---

## Overview

El Parent Portal es la aplicación web PWA para padres y tutores. Permite seguir en tiempo real el transporte de sus hijos, recibir notificaciones de check-in, crear novedades (ausencias, cambios) y gestionar la información de sus estudiantes.

### Usuarios

| Rol | Nombre UI | Permisos |
|-----|-----------|----------|
| **parent** | Padre/Tutor | Ver solo sus hijos, tracking, novedades, notificaciones |

### Tech Stack

- Next.js 14+ PWA
- Convex (real-time database)
- shadcn/ui + Tailwind CSS
- Leaflet + OpenStreetMap (mapas de tracking)
- Geolocation API (ubicación de hogar)

---

## Módulos

### 1. Inicio (Home/Tracking)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/inicio` | ✅ | Dashboard con tracking en tiempo real |

**Funcionalidades**:

*Vista principal*:
- [x] Lista de todos los hijos con estado actual
- [x] Tarjeta de tracking por cada hijo con viaje activo
- [x] Sin viaje activo: mensaje informativo + botón crear novedad

*Tarjeta de tracking (ChildTripCard)*:
- [x] Foto/avatar del estudiante
- [x] Nombre y grado
- [x] Badge de estado del viaje:
  - En ruta (azul)
  - En la escuela (verde)
  - En casa (gris)
  - Regresando (naranja)
  - Programado (amarillo)
- [x] Nombre de la ruta (recogida/entrega)
- [x] Barra de progreso visual (% completado)
- [x] ETA con minutos + hora de llegada
- [x] Estado de delay (a tiempo, ligero retraso, retrasado, muy retrasado)
- [x] Nombre del conductor
- [x] Botón expandir para ver mapa

*Vista expandida (ActiveTripView)*:
- [x] Mapa interactivo con:
  - Ubicación del vehículo con heading
  - Polilínea de la ruta
  - Marcadores de paradas
  - Marcador de escuela
  - Parada del estudiante resaltada
- [x] Panel de información:
  - Punto de recogida/entrega del estudiante
  - ETA mejorado con indicador de delay
  - Velocidad actual del vehículo
  - Info del conductor y vehículo
  - Botones de contacto (llamar, WhatsApp)

**Componentes clave**:
- `ChildTripCard` - Tarjeta expandible de tracking
- `ActiveTripView` - Vista de mapa con tracking
- `StatusBadge` - Badge de estado
- `ProgressBar` - Barra de progreso de viaje
- `ETADisplay` - Visualización de ETA

**Hooks**:
- `useAllChildrenTrips()` - Todos los hijos con viajes activos
- `useStudentTracking()` - Tracking en tiempo real por estudiante
- `useMyStudentsWithPhotos()` - Lista de hijos con fotos

---

### 2. Calendario (Schedule)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/calendario` | ✅ | Horario semanal de viajes |

**Funcionalidades**:
- [x] Vista semanal (Domingo a Sábado)
- [x] Día actual resaltado
- [x] Tarjetas de viaje por día mostrando:
  - Nombre de la ruta
  - Tipo (recogida/entrega)
  - Horario programado
  - Info del conductor
- [x] Estado vacío cuando no hay rutas asignadas
- [x] Navegación entre semanas

**Componentes clave**:
- `WeekView` - Vista semanal
- `DayColumn` - Columna de día
- `ScheduleCard` - Tarjeta de horario

**Hooks**:
- `useWeeklySchedule()` - Horario semanal por hijo

---

### 3. Hijos (Children)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/hijos` | ✅ | Lista de hijos |
| `/hijos/[id]` | ✅ | Perfil completo del hijo |
| `/hijos/[id]/edit` | ✅ | Editar información del hijo |
| `/hijos/[id]/location` | ✅ | Configurar ubicación de hogar |
| `/hijos/[id]/historial` | ✅ | Historial de viajes del hijo |

**Funcionalidades**:

#### Lista de hijos (`/hijos`)
- [x] Tarjetas de cada hijo con:
  - Foto/avatar
  - Nombre y grado
  - Estado (activo/inactivo)
  - Dirección de hogar
  - Teléfono de contacto
  - Indicadores: GPS configurado, foto subida

#### Perfil del hijo (`/hijos/[id]`)
*Información personal*:
- [x] Foto/avatar grande
- [x] Nombre completo
- [x] Grado/curso
- [x] Fecha de nacimiento (con edad calculada)
- [x] Estado (activo/inactivo)

*Direcciones*:
- [x] Dirección de hogar
- [x] Ubicación GPS (latitud/longitud)
- [x] Botón para configurar/editar ubicación

*Contactos*:
- [x] Teléfono principal
- [x] Teléfono secundario
- [x] Email de padre/tutor
- [x] Contacto de emergencia

*Tutor secundario*:
- [x] Info de tutor secundario si existe
- [x] Botón para invitar tutor secundario

*Código QR*:
- [x] Vista del QR del estudiante
- [x] Botón descargar QR
- [x] Botón imprimir QR

*Rutas asignadas*:
- [x] Lista de rutas (recogida/entrega)
- [x] Horarios y paradas asignadas

#### Editar hijo (`/hijos/[id]/edit`)
- [x] Upload/eliminar foto (máx 5MB, JPG/PNG/WebP)
- [x] Editar dirección de hogar
- [x] Editar teléfono de contacto
- [x] Agregar/editar contacto de emergencia secundario
- [x] Validación de formularios

#### Ubicación de hogar (`/hijos/[id]/location`)
- [x] Mapa interactivo para seleccionar ubicación
- [x] Búsqueda de dirección (geocoding)
- [x] Clic en mapa para seleccionar punto
- [x] Confirmación de ubicación
- [x] Guardado de latitud, longitud, dirección

#### Historial (`/hijos/[id]/historial`)
- [x] Lista de viajes pasados
- [x] Filtros: 7 días, 30 días, 90 días
- [x] Info por viaje:
  - Fecha
  - Ruta y tipo
  - Conductor
  - Estado del estudiante (a bordo, entregado, ausente)
  - Badge de estado

**Componentes clave**:
- `ChildCard` - Tarjeta de hijo
- `ChildProfile` - Perfil completo
- `ChildEditForm` - Formulario de edición
- `LocationPicker` - Selector de ubicación con mapa
- `QRCodeView` - Vista de código QR
- `TripHistoryList` - Lista de historial

**Hooks**:
- `useMyStudents()` - Lista de hijos
- `useMyStudentsWithPhotos()` - Hijos con fotos
- `useStudentWithPhoto()` - Estudiante individual
- `useStudentMutations()` - Actualizar estudiante
- `useStudentLocationMutation()` - Actualizar ubicación
- `useTripHistory()` - Historial de viajes

---

### 4. Historial (Global History)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/historial` | ✅ | Historial global de todos los hijos |

**Funcionalidades**:
- [x] Lista consolidada de viajes de todos los hijos
- [x] Filtros por período (7, 30, 90 días)
- [x] Filtro por hijo (si tiene múltiples)
- [x] Info por viaje:
  - Estudiante
  - Fecha y hora
  - Ruta
  - Estado
  - Conductor

**Hooks**:
- `useTripHistory()` - Historial con filtros

---

### 5. Notificaciones
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/notifications` | ✅ | Centro de notificaciones |

**Funcionalidades**:

*Lista de notificaciones*:
- [x] Agrupadas por fecha (Hoy, Ayer, Esta semana, etc.)
- [x] Filtro: Todas / No leídas
- [x] Filtro por hijo (si tiene múltiples)

*Tipos de notificación*:
| Tipo | Icono | Color | Descripción |
|------|-------|-------|-------------|
| checkin | CheckCircle | Verde | Estudiante abordó/entregado |
| trip_update | Bus | Azul | Viaje iniciado/completado |
| eta | Clock | Amarillo | Actualización de ETA |
| novedad | AlertCircle | Naranja | Novedad aplicada |
| incident | AlertTriangle | Rojo | Incidente reportado |
| relay | RefreshCw | Morado | Cambio de vehículo |
| approval_request | FileText | Gris | Solicitud requiere aprobación |
| system | Settings | Gris | Notificación del sistema |

*Acciones*:
- [x] Marcar como leída (individual)
- [x] Marcar todas como leídas
- [x] Links de acción (ej: "Ver en mapa" para trip_update)
- [x] Tiempo relativo ("Hace 2 min", "Hace 1h")

*Header*:
- [x] Badge de conteo no leídas
- [x] Link a configuración de notificaciones

**Componentes clave**:
- `NotificationList` - Lista agrupada
- `NotificationCard` - Tarjeta de notificación
- `NotificationFilters` - Filtros
- `UnreadBadge` - Badge de no leídas

**Hooks**:
- `useNotifications()` - Lista de notificaciones
- `useUnreadCount()` - Conteo de no leídas
- `useMarkAsRead()` - Marcar como leída

---

### 6. Novedades (Schedule Exceptions)
**Estado**: ✅ Implementado

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/novedades` | ✅ | Lista de novedades creadas |
| `/novedades/create` | ✅ | Crear novedad/excepción |

**Funcionalidades**:

*Tipos de novedad (dinámicos)*:
Los tipos de novedad son configurables por institución en Admin → Settings → Novedades.
Tipos predefinidos del sistema:
| Tipo | Nombre UI | Categoría | Requiere Aprobación |
|------|-----------|-----------|:-------------------:|
| absence | Ausencia | absence | Sí |
| parent_pickup | Recoge padre | pickup_change | **No** |
| stop_change | Cambio de parada | stop_change | Sí |
| early_pickup | Salida temprana | time_change | Sí |
| late_arrival | Llegada tarde | time_change | Sí |
| medical_leave | Ausencia médica | absence | Sí |
| location_change | Cambio de domicilio | location_change | Sí |

*Formulario de creación* (`/novedades/create`):
- [x] Selector de hijo (si tiene múltiples)
- [x] **Tipos de novedad dinámicos** - Cargados desde backend, con iconos y colores personalizados
- [x] Selector de fecha según tipo de duración:
  - Un día: selector de fecha individual
  - Rango de fechas: fecha inicio y fin
  - Permanente: solo fecha de inicio
  - Recurrente: días de la semana
- [x] Selector de hora (para tipos que afectan horario)
- [x] Selector de ruta específica (rutas asignadas al estudiante)
- [x] Selector de tipo de ruta afectada (recogida, entrega, ambos)
- [x] Campo de razón (requerido según configuración del tipo)
- [x] **Upload de evidencia**:
  - [x] Selector de archivos múltiples
  - [x] Preview de imágenes
  - [x] Límite configurable por tipo (máx 5 archivos, 10MB cada uno)
  - [x] Tipos permitidos: imágenes (jpg, png, webp), PDF
  - [x] Indicador de progreso de upload
- [x] Validación de formulario en tiempo real
- [x] Estado de envío con loading

*Lista de novedades* (`/novedades`):
- [x] Lista de novedades creadas por el padre
- [x] Agrupadas por estado:
  - Pendientes de aprobación
  - Próximas (aprobadas, fecha futura)
  - Historial (pasadas/aplicadas)
- [x] **Tipos dinámicos** - Muestra icono, color y nombre del tipo configurable
- [x] Info por novedad:
  - Tipo con icono y color
  - Nombre del hijo
  - Fecha(s) afectada(s)
  - Razón (truncada)
  - Badge de estado (pendiente, aprobada, rechazada, aplicada)
  - **Indicador de evidencia** (icono clip + cantidad)
- [x] Botón "Nueva Novedad"
- [x] Estados vacíos informativos

*Flujo de aprobación*:
- [x] parent_pickup: efecto inmediato (estado `acknowledged`)
- [x] Otras novedades: pending → approved/rejected → acknowledged → applied
- [x] Notificación push cuando se aprueba/rechaza

*Diagrama de flujo de status*:
```
┌─────────────────────────────────────────────────────────────────┐
│                    FLUJO DE STATUS NOVEDADES                    │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  PARENT                ADMIN                 CREW               │
│  ──────                ─────                 ────               │
│                                                                 │
│  Crea novedad ──┐                                               │
│  (pending)      │                                               │
│       │         │                                               │
│       ▼         │                                               │
│  [parent_pickup]│──► acknowledged (auto) ─────────────────────► │
│       │         │                                               │
│  [otros tipos]  │──► pending ──────────► Revisa ────────────►   │
│                 │         │                 │                   │
│                 │         │                 ▼                   │
│                 │         │            approved ─────────────►  │
│                 │         │                │                    │
│                 │         │                │                    │
│                 │         │                ▼                    │
│  ◄── notificado │         │         acknowledged ◄───────────── │
│                 │         │                │      (acusar       │
│                 │         │                │       recibo)      │
│                 │         │                ▼                    │
│                 │         │            applied ◄──────────────  │
│                 │         │         (trip starts)               │
│                 │         │                                     │
│                 │         └──► rejected ──────────────────────► │
│  ◄── notificado │              (con motivo)                     │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

*Estados y visibilidad para padres*:
| Estado | Badge en UI | Descripción |
|--------|-------------|-------------|
| `pending` | Pendiente (amarillo) | Esperando revisión del coordinador |
| `approved` | Aprobada (verde) | Aprobada, esperando que el conductor confirme |
| `rejected` | Rechazada (rojo) | Rechazada por el coordinador, ver motivo |
| `acknowledged` | Confirmada (azul) | El conductor confirmó la novedad |
| `applied` | Aplicada (gris) | Ya se aplicó al viaje |
| `cancelled` | Cancelada (gris) | Cancelada por el padre |

*Especificaciones de evidencia (upload)*:
| Propiedad | Valor |
|-----------|-------|
| Tamaño máximo por archivo | 10 MB |
| Archivos máximos por novedad | Configurable por tipo (default: 5) |
| Tipos permitidos | `image/jpeg`, `image/png`, `image/webp`, `application/pdf` |
| Storage | Convex built-in storage |
| Retención | Permanente mientras la novedad exista |
| Acceso | Parent (propietario), Admin (revisión), Crew (lectura) |

*Restricciones*:
- [x] Fecha mínima: mañana (o según configuración del tipo)
- [x] stop_change requiere mínimo 48h de anticipación
- [x] Validación de horas de anticipación según tipo

**Componentes clave**:
- `NovedadForm` - Formulario de creación con tipos dinámicos
- `NovedadTypeSelector` - Selector de tipo (desde API)
- `DatePicker` / `DateRangePicker` - Según tipo de duración
- `EvidenceUploader` - Upload de archivos con preview
- `NovedadCard` - Card de novedad con estado e indicador de evidencia

**Hooks** (`apps/parent/src/hooks/useNovedades.ts`):
- `useMyNovedades()` - Lista de novedades del usuario
- `useNovedadesMutations()` - Crear/cancelar novedad
- `useNovedadTypes()` - Tipos configurables desde backend
- `useEvidenceUpload()` - Upload de archivos de evidencia

---

### 7. Settings (Configuración)
**Estado**: ✅ Implementado (datos mock para algunas preferencias)

**Rutas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/settings` | ✅ | Página de configuración |

**Funcionalidades**:

*Información de cuenta*:
- [x] Nombre
- [x] Email
- [x] Teléfono principal
- [x] Teléfono alternativo

*Seguridad*:
- [x] Cambiar contraseña
- [x] Autenticación de dos factores (UI, no implementado)
- [x] Sesiones activas

*Preferencias*:
- [x] Idioma (Español, English)
- [x] Zona horaria (Ecuador, Colombia)
- [x] Formato de fecha
- [x] Formato de hora

*Mapas*:
- [x] Tipo de vista (satélite, calles, terreno)
- [x] Auto-centrar en vehículo
- [x] Mostrar tráfico

*Información de la app*:
- [x] Versión
- [x] Última actualización
- [x] Auto-actualizar

*Legal y ayuda*:
- [x] Términos de servicio
- [x] Política de privacidad
- [x] Cookies
- [x] FAQ
- [x] Contactar soporte
- [x] Guía de uso

*Acciones*:
- [x] Cerrar sesión

**Componentes clave**:
- `SettingsSection` - Sección de configuración
- `SettingsToggle` - Toggle de preferencia
- `SettingsSelect` - Selector de opción
- `SettingsLink` - Link de navegación

---

## Authentication (Autenticación)
**Estado**: ✅ Implementado

**Rutas públicas**:
| Ruta | Estado | Descripción |
|------|--------|-------------|
| `/login` | ✅ | Inicio de sesión |
| `/signup-invitation` | ✅ | Registro por invitación del admin |
| `/verify-email` | ✅ | Verificación de email (código 6 dígitos) |
| `/verify` | ✅ | Verificación alternativa |
| `/forgot-password` | ✅ | Solicitud de reset (stub) |
| `/reset-password` | ✅ | Reset de contraseña (stub) |

**Funcionalidades**:
- [x] Login con email/contraseña
- [x] Opción "Recordarme"
- [x] Registro por invitación (cuando admin invita padre)
- [x] Verificación de email con código 6 dígitos
- [x] Cooldown de reenvío de código
- [x] Manejo de errores

---

## Navigation (Navegación)
**Estado**: ✅ Implementado

### Sidebar (Desktop)
- [x] Logo: GraduationCap + "Altaviapp Portal Padres"
- [x] Sección de perfil con iniciales
- [x] Navegación:
  - Inicio
  - Calendario
  - Mis Hijos
  - Historial
  - Notificaciones
- [x] Footer: Configuración + Cerrar sesión
- [x] Indicador de link activo
- [x] Animación slide en móvil

### Bottom Navigation (Mobile)
- [x] Barra fija en bottom
- [x] 4 items: Inicio, Calendario, Hijos, Historial
- [x] Indicador de activo con color accent
- [x] Safe area para dispositivos con notch

### Header
- [x] Título de página dinámico
- [x] Botón de menú móvil
- [x] Badge de notificaciones no leídas

---

## Cross-Cutting Requirements

### Real-time Tracking
- [x] Convex subscriptions para ubicación de vehículo
- [x] Actualización de ETA cada 15 segundos
- [x] Estado de delay calculado
- [x] Notificaciones de check-in instantáneas

### Multi-Student Support
- [x] Padre puede tener múltiples hijos
- [x] Cada hijo con tracking independiente
- [x] Filtros por hijo en notificaciones/historial

### Contact Integration
- [x] Llamar a conductor (tel: link)
- [x] WhatsApp a conductor
- [x] Contactos de emergencia visibles

### Location Management
- [x] Geocoding para búsqueda de direcciones
- [x] Mapa interactivo para selección
- [x] Validación de GPS coordinates

### PWA Features
- [x] Instalable en dispositivos móviles
- [x] Manifest configurado
- [x] Responsive design (mobile-first)

### Notificaciones del Sistema de Novedades

*Eventos recibidos por el padre*:
| Evento | Tipo | Canal | Mensaje |
|--------|------|-------|---------|
| Novedad aprobada | success | push + in-app | "Tu novedad para {estudiante} ha sido aprobada" |
| Novedad rechazada | warning | push + in-app | "Tu novedad fue rechazada: {motivo}" |
| Novedad acusada por crew | info | in-app | "El conductor confirmó la novedad de {estudiante}" |
| Novedad aplicada | info | in-app | "La novedad de {estudiante} fue aplicada al viaje" |
| Viaje iniciado | info | push | "El bus de {estudiante} ha iniciado el recorrido" |
| Estudiante abordó | success | push | "{estudiante} ha subido al bus" |
| Estudiante entregado | success | push | "{estudiante} ha llegado a destino" |
| ETA actualizado | info | in-app | "Nueva hora estimada: {hora}" |
| Incidente reportado | warning | push | "Se reportó un incidente en la ruta de {estudiante}" |

*Configuración de notificaciones*:
Las preferencias de notificación se configuran en `/settings` (pendiente conectar a backend):
- Inicio de viaje
- Fin de viaje
- Check-in/check-out
- Alertas de retraso
- Incidentes

---

## Requisitos Pendientes (v2.0)

### Alta Prioridad
- [ ] **Settings: Conectar datos reales** - Actualmente usa datos mock para algunas preferencias
- [ ] **Settings: Logout funcional** - El botón de cerrar sesión no tiene handler

### Media Prioridad
- [ ] Cancelar novedad pendiente (UI - backend listo)
- [ ] Rutas asignadas en perfil de hijo
- [ ] Navegación de semanas en calendario
- [ ] Deep links desde notificaciones usando relatedEntityId

### Baja Prioridad
- [ ] Push notifications nativas
- [ ] Chat con conductor/coordinador
- [ ] Guardado de preferencias en base de datos
- [ ] 2FA funcional
- [ ] Modo oscuro

---

## Referencias

- **Wireframes**: [docs/design/PARENT_WIREFRAMES.md](../design/PARENT_WIREFRAMES.md)
- **API**: [docs/api/API_ENDPOINTS.md](../api/API_ENDPOINTS.md)
- **Schema**: [docs/database/DATABASE_SCHEMA.md](../database/DATABASE_SCHEMA.md)
- **Tech Spec**: [Technical-Specification.md](../../Technical-Specification.md)
- **ETA System**: [docs/features/REAL_TIME_ETA.md](../features/REAL_TIME_ETA.md)
