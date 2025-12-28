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
| `/novedades/create` | ✅ | Crear novedad/excepción |

**Funcionalidades**:

*Tipos de novedad*:
| Tipo | Nombre UI | Descripción | Requiere Aprobación |
|------|-----------|-------------|:-------------------:|
| absence | Ausencia | Hijo no viajará ese día | Sí |
| parent_pickup | Recoge padre | Padre recogerá directamente | **No** |
| stop_change | Cambio de parada | Diferente ubicación por un día | Sí |
| early_pickup | Salida temprana | Hijo sale antes de lo normal | Sí |
| late_arrival | Llegada tarde | Hijo llegará tarde a la parada | Sí |

*Formulario*:
- [x] Selector de hijo (si tiene múltiples)
- [x] Tipo de novedad con iconos
- [x] Selector de fecha (mínimo mañana)
- [x] Selector de hora (para early_pickup, late_arrival)
- [x] Tipo de ruta afectada:
  - Solo ida (pickup)
  - Solo entrega (dropoff)
  - Ambos
- [x] Campo de razón (requerido)
- [x] Validación de formulario
- [x] Estado de envío

*Flujo de aprobación*:
- [x] parent_pickup: efecto inmediato (no requiere aprobación)
- [x] Otras novedades: pendiente → aprobado/rechazado → aplicado
- [x] Notificación cuando se aprueba/rechaza

*Restricciones*:
- [x] Fecha mínima: mañana
- [x] stop_change requiere mínimo 48h de anticipación
- [x] No se puede crear si viaje ya inició

**Componentes clave**:
- `NovedadForm` - Formulario de creación
- `NovedadTypeSelector` - Selector de tipo
- `DatePicker` - Selector de fecha
- `TimePicker` - Selector de hora
- `RouteTypeSelector` - Selector de ruta afectada
- `NovedadContextButton` - Botón contextual para crear

**Hooks**:
- `useNovedades()` - Lista de novedades del usuario
- `useNovedadesMutations()` - Crear/cancelar novedad

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

---

## Requisitos Pendientes (v2.0)

- [ ] Push notifications nativas
- [ ] Chat con conductor/coordinador
- [ ] Historial de novedades creadas
- [ ] Cancelar novedad pendiente
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
